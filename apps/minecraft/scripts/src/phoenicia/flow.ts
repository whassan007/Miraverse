/**
 * Player journey for the Phoenicia slice, with the game engine behind PhoeniciaHost.
 * Mirrored by apps/roblox/src/server/Phoenicia/Flow.luau.
 */
import {
  PHOENICIA,
  QUEST_ID,
  applyEvent,
  createState,
  currentNode,
  parseState,
  type PhoeniciaState,
} from './gate.js';

export interface AskRequest {
  title: string;
  body: string;
  options: { id: string; label: string }[];
  direction: 'ltr' | 'rtl';
}

export interface PhoeniciaHost {
  /** ok=false means the store failed, which is different from "no save yet". */
  load(playerId: string): { ok: boolean; value?: string };
  save(playerId: string, value: string): boolean;
  position(playerId: string): { region: string; x: number; z: number } | null;
  teleport(playerId: string, region: string, point: { x: number; z: number }): void;
  ask(playerId: string, request: AskRequest): Promise<string | null>;
  say(playerId: string, text: string): void;
  sail(playerId: string, fromRegion: string | null, toRegion: string, seconds: number): Promise<void>;
}

interface Session {
  state: PhoeniciaState;
  saveDisabled: boolean;
  busy: boolean;
}

export function translate(locale: string | null, key: string): string {
  const entry = PHOENICIA.strings[key];
  if (!entry) return key;
  return entry[locale ?? PHOENICIA.fallbackLocale] ?? entry[PHOENICIA.fallbackLocale] ?? key;
}

export class PhoeniciaFlow {
  private readonly sessions = new Map<string, Session>();

  constructor(private readonly host: PhoeniciaHost) {}

  private t(s: Session, key: string): string {
    return translate(s.state.locale, key);
  }

  private persist(playerId: string, s: Session): void {
    if (s.saveDisabled) return;
    if (!this.host.save(playerId, JSON.stringify(s.state))) {
      this.host.say(playerId, this.t(s, 'ui.save_failed'));
    }
  }

  getState(playerId: string): PhoeniciaState | undefined {
    return this.sessions.get(playerId)?.state;
  }

  leave(playerId: string): void {
    this.sessions.delete(playerId);
  }

  async enter(playerId: string): Promise<void> {
    const loaded = this.host.load(playerId);
    const session: Session = {
      state: (loaded.ok && parseState(loaded.value)) || createState(),
      // After a failed load, writing could overwrite real progress with a fresh save.
      saveDisabled: !loaded.ok,
      busy: true,
    };
    this.sessions.set(playerId, session);
    try {
      if (session.saveDisabled) this.host.say(playerId, this.t(session, 'ui.save_failed'));
      if (!session.state.locale) {
        const options = Object.entries<any>(PHOENICIA.locales).map(([id, l]) => ({ id, label: l.label }));
        const picked = await this.host.ask(playerId, {
          title: this.t(session, 'ui.choose_language'),
          body: '',
          options,
          direction: 'ltr',
        });
        session.state.locale = picked ?? PHOENICIA.fallbackLocale;
      }
      const region = PHOENICIA.regions[session.state.region];
      if (!session.state.arrived) {
        session.state.arrived = true;
        this.persist(playerId, session);
        await this.host.sail(playerId, null, session.state.region, 6);
        this.host.teleport(playerId, session.state.region, region.points.arrival);
        this.host.say(playerId, this.t(session, 'ui.arrival'));
      } else {
        this.host.teleport(playerId, session.state.region, region.points.resume);
        this.host.say(playerId, this.t(session, 'ui.welcome_back'));
      }
    } finally {
      session.busy = false;
    }
  }

  /** The action available at the player's current position, if any. */
  promptFor(playerId: string): string | null {
    const s = this.sessions.get(playerId);
    const pos = this.host.position(playerId);
    if (!s || !pos || s.busy) return null;
    const node = currentNode(s.state) ?? PHOENICIA.quests[QUEST_ID].nodes.at(-1);
    const { anchor } = node;
    if (pos.region !== anchor.region || (pos.x - anchor.x) ** 2 + (pos.z - anchor.z) ** 2 > anchor.radius ** 2) {
      return null;
    }
    return this.t(s, currentNode(s.state) ? node.promptKey : 'prompt.codex');
  }

  async interact(playerId: string): Promise<void> {
    const s = this.sessions.get(playerId);
    if (!s || s.busy || !this.promptFor(playerId)) return;
    s.busy = true;
    try {
      const node = currentNode(s.state);
      if (!node) await this.showCodex(playerId, s);
      else await this.playNode(playerId, s, node);
    } finally {
      s.busy = false;
    }
  }

  private async playNode(playerId: string, s: Session, node: any): Promise<void> {
    for (;;) {
      const choiceId = await this.host.ask(playerId, {
        title: this.t(s, node.titleKey),
        body: `${this.t(s, node.bodyKey)}\n\n${this.t(s, node.hintKey)}`,
        options: node.options.map((o: any) => ({ id: o.id, label: this.t(s, o.labelKey) })),
        direction: PHOENICIA.locales[s.state.locale ?? PHOENICIA.fallbackLocale].direction,
      });
      if (choiceId === null) return;
      const pos = this.host.position(playerId);
      if (!pos) return;
      s.state.eventSeq += 1;
      const code = applyEvent(s.state, {
        eventId: `${node.id}:${s.state.eventSeq}`,
        nodeId: node.id,
        region: pos.region,
        x: pos.x,
        z: pos.z,
        choiceId,
      });
      if (code === 'WRONG_CHOICE') {
        const option = node.options.find((o: any) => o.id === choiceId);
        this.persist(playerId, s);
        this.host.say(playerId, this.t(s, option.feedbackKey));
        continue;
      }
      if (code !== 'OK' && code !== 'QUEST_COMPLETED') return;

      // Saving first means a disconnect while sailing resumes at the destination.
      this.persist(playerId, s);
      this.host.say(playerId, this.t(s, node.successKey));
      if (node.routeId) {
        const route = PHOENICIA.routes[node.routeId];
        await this.host.sail(playerId, route.from, route.to, route.gameSeconds);
        this.host.teleport(playerId, route.to, PHOENICIA.regions[route.to].points.arrival);
      }
      if (code === 'QUEST_COMPLETED') this.host.say(playerId, this.t(s, 'ui.reward'));
      return;
    }
  }

  private async showCodex(playerId: string, s: Session): Promise<void> {
    const lines = PHOENICIA.quests[QUEST_ID].codex.map(
      (entry: any) => `[${this.t(s, `class.${entry.classification}`)}]\n${this.t(s, entry.textKey)}`
    );
    await this.host.ask(playerId, {
      title: this.t(s, 'codex.title'),
      body: lines.join('\n\n'),
      options: [{ id: 'close', label: this.t(s, 'ui.continue') }],
      direction: PHOENICIA.locales[s.state.locale ?? PHOENICIA.fallbackLocale].direction,
    });
  }
}
