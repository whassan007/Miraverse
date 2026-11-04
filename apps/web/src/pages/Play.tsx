import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Phaser from 'phaser';
import type { CountryId } from '../../../../packages/content/schema';
import { loadStamps, make, saveStamp } from '../../../../packages/shared/stamp';
import { PACKS } from '../lib/content';
import { useI18n } from '../i18n';
import Globe from '../game/scenes/Globe';
import { isChallengeDone, SCENE_KEYS } from '../game/shared';

type SceneConstructor = new () => Phaser.Scene;
const modules = import.meta.glob<Record<string, unknown>>('../game/scenes/*.ts', { eager: true });
function scenes(): SceneConstructor[] {
  return SCENE_KEYS.map(key => {
    if (key === 'globe') return Globe;
    const name = key[0].toUpperCase() + key.slice(1);
    const module = modules[`../game/scenes/${name}.ts`];
    const candidate = module?.default ?? module?.[name];
    if (typeof candidate !== 'function') throw new Error(`Scene ${key} is unavailable.`);
    return candidate as SceneConstructor;
  });
}

export default function Play() {
  const { lang, dir, t } = useI18n();
  const params = useParams<{ country?: string }>();
  const initialCountry = PACKS.find(entry => entry.country === params.country)?.country ?? null;
  const [country, setCountry] = useState<CountryId | null>(initialCountry);
  const [completed, setCompleted] = useState<string[]>([]);
  const [stamp, setStamp] = useState('');
  const [notice, setNotice] = useState('');
  const mount = useRef<HTMLDivElement>(null);
  const game = useRef<Phaser.Game | null>(null);
  const done = useRef(new Set<string>());
  const completeHandler = useRef<(payload: unknown) => void>(() => {});
  const pack = PACKS.find(entry => entry.country === country);
  const challenges = pack?.chapters[0]?.challenges ?? [];
  const challenge = challenges[completed.length];

  function selectCountry(next: CountryId) {
    done.current = new Set();
    setCompleted([]);
    setStamp('');
    setNotice('');
    setCountry(next);
  }
  completeHandler.current = payload => {
    if (!pack || !challenge || !isChallengeDone(payload) || payload.challengeId !== challenge.id || done.current.has(payload.challengeId)) return;
    done.current.add(payload.challengeId);
    const next = [...done.current];
    setCompleted(next);
    if (next.length === challenges.length && challenges.length === 5) {
      const existing = loadStamps().find(record => record.country === pack.country && record.chapter === 1);
      const code = existing?.code ?? make(pack.country, 1);
      const saved = existing !== undefined || saveStamp(code);
      setStamp(code);
      setNotice(saved ? t('play.stampSaved', 'Your souvenir stamp is saved on this device.') : t('play.stampUnsaved', 'Your stamp is ready. Device storage is unavailable; copy the code to keep it.'));
    }
  };

  useEffect(() => {
    if (!mount.current) return;
    let instance: Phaser.Game | undefined;
    const onDone = (payload: unknown) => completeHandler.current(payload);
    const onCountry = (payload: { country?: CountryId }) => {
      if (PACKS.some(entry => entry.country === payload?.country)) selectCountry(payload.country!);
    };
    try {
      instance = new Phaser.Game({
        type: Phaser.AUTO, parent: mount.current, backgroundColor: '#102c45',
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 720, height: 420 },
        scene: scenes(), audio: { noAudio: true },
        callbacks: { postBoot: ready => {
          ready.canvas.setAttribute('aria-hidden', 'true');
          ready.canvas.setAttribute('tabindex', '-1');
          for (const scene of ready.scene.scenes) scene.events.on('challenge:done', onDone);
        } },
      });
      game.current = instance;
      instance.events.on('challenge:done', onDone);
      instance.events.on('country:select', onCountry);
    } catch {
      setNotice(t('play.canvasUnavailable', 'Use the controls below to play.'));
    }
    return () => {
      instance?.events.off('challenge:done', onDone);
      instance?.events.off('country:select', onCountry);
      for (const scene of instance?.scene.scenes ?? []) scene.events.off('challenge:done', onDone);
      instance?.destroy(true);
      game.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = game.current;
    if (!instance) return;
    const start = () => {
      for (const key of SCENE_KEYS) if (instance.scene.isActive(key)) instance.scene.stop(key);
      instance.scene.start(challenge?.type ?? 'globe', { pack, challenge, lang });
    };
    if (instance.isBooted) start();
    else instance.events.once('ready', start);
    return () => { instance.events.off('ready', start); };
  }, [pack, challenge, lang]);

  return <main dir={dir} style={{ width: '100%', maxWidth: 960, margin: '0 auto', padding: 16, boxSizing: 'border-box', overflowWrap: 'anywhere' }}>
    <h1>{t('play.title', 'Explore MiraVerse')}</h1>
    <nav aria-label={t('play.countries', 'Choose a country')}>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0 }}>
        {PACKS.map(entry => <li key={entry.country}><button type="button" aria-pressed={country === entry.country}
          onClick={() => selectCountry(entry.country)} style={{ minHeight: 44, border: `3px solid ${entry.colors.primary}`, padding: '8px 12px' }}>{entry.name_en}</button></li>)}
      </ul>
    </nav>
    <div ref={mount} aria-hidden="true" style={{ width: '100%', aspectRatio: '12 / 7', overflow: 'hidden' }} />
    {pack && <section aria-label={t('play.progress', 'Chapter progress')}>
      <h2>{pack.name_en}: {pack.chapters[0]?.title_en}</h2>
      <label htmlFor="chapter-progress">{completed.length} / {challenges.length} {t('play.completed', 'challenges complete')}</label>
      <progress id="chapter-progress" value={completed.length} max={challenges.length || 5} style={{ width: '100%' }} />
      <div aria-live="polite" aria-atomic="true">
        {challenge ? <><h3>{challenge.title_en}</h3><p>{challenge.goal_en}</p></> : <p>{t('play.chapterComplete', 'Chapter complete!')}</p>}
      </div>
      {challenge && <button type="button" style={{ minHeight: 44 }} onClick={() => completeHandler.current({ challengeId: challenge.id })}>
        {t('play.completeChallenge', 'Complete challenge')}: {challenge.title_en}
      </button>}
      {stamp && <p>{t('play.souvenir', 'Souvenir stamp')}: <output>{stamp}</output></p>}
    </section>}
    <p role="status">{notice}</p>
  </main>;
}
