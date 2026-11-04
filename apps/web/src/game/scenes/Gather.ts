import Phaser from 'phaser';
import type { Challenge, Item, Lang, Pack } from '../../../../../packages/content/schema';

type SceneData = { pack: Pack; challenge: Challenge; lang: Lang };

export class Gather extends Phaser.Scene {
  private sceneData?: SceneData;
  private completed = false;

  constructor() { super('gather'); }

  init(data?: SceneData) {
    this.sceneData = data;
    this.completed = false;
  }

  create() {
    if (!this.sceneData) return;
    const { pack, challenge } = this.sceneData;
    const width = Math.min(360, this.scale.width);
    const left = (this.scale.width - width) / 2;
    const text = (x: number, y: number, value: string, size = 16) => this.add.text(x, y, value, {
      fontFamily: 'sans-serif', fontSize: `${size}px`, color: '#ffffff',
      align: 'center', wordWrap: { width: width - 24 },
    }).setOrigin(0.5, 0);
    const title = text(left + width / 2, 12, challenge.title_en, 20);
    const hint = text(left + width / 2, title.y + title.height + 8, 'Tap the items to collect them.', 14);
    const items = new Map(pack.items.map(item => [item.id, item]));
    const required = new Map<string, number>();
    let invalid = !challenge.needs?.length;
    for (const need of challenge.needs ?? []) {
      if (!items.has(need.item) || !Number.isSafeInteger(need.count) || need.count <= 0) invalid = true;
      else required.set(need.item, (required.get(need.item) ?? 0) + need.count);
    }
    if (invalid) {
      text(left + width / 2, hint.y + hint.height + 20, 'These items are unavailable.');
      return;
    }
    const collected = new Map<string, number>();
    const labels = new Map<string, Phaser.GameObjects.Text>();
    let top = hint.y + hint.height + 12;
    required.forEach((count, id) => {
      const label = text(left + width / 2, top, `${items.get(id)!.name_en}: 0 / ${count}`);
      labels.set(id, label);
      top += label.height + 6;
    });
    const tokens = [...required.keys()].map(id => items.get(id)!);
    const columns = Math.max(1, Math.min(3, Math.floor(width / 100)));
    const rows = Math.ceil(tokens.length / columns);
    const available = Math.max(1, this.scale.height - top - 16);
    const rowHeight = Math.min(96, available / rows);
    const radius = Math.max(4, Math.min(24, (rowHeight - 26) / 2));
    const tokenObjects: Phaser.GameObjects.Container[] = [];
    const finish = () => {
      if (this.completed || [...required].some(([id, count]) => (collected.get(id) ?? 0) < count)) return;
      this.completed = true;
      this.tweens.killTweensOf(tokenObjects);
      const payload = { challengeId: challenge.id };
      this.events.emit('challenge:done', payload);
      this.game.events.emit('challenge:done', payload);
    };
    tokens.forEach((item: Item, index) => {
      const x = left + (index % columns + 0.5) * width / columns;
      const y = top + Math.floor(index / columns) * rowHeight + radius + 8;
      const color = /^#[0-9a-f]{6}$/i.test(item.color) ? parseInt(item.color.slice(1), 16) : 0x7895b2;
      const circle = this.add.circle(0, 0, radius, color).setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });
      const name = text(0, radius + 4, item.name_en, 12).setWordWrapWidth(width / columns - 12);
      const token = this.add.container(x, y, [circle, name]);
      tokenObjects.push(token);
      this.tweens.add({ targets: token, y: y + Math.min(6, rowHeight / 10),
        duration: 800 + index * 130, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
      circle.on('pointerdown', () => {
        if (this.completed) return;
        const target = required.get(item.id)!;
        const count = collected.get(item.id) ?? 0;
        if (count >= target) return;
        collected.set(item.id, count + 1);
        labels.get(item.id)!.setText(`${item.name_en}: ${count + 1} / ${target}`);
        if (count + 1 === target) {
          circle.disableInteractive();
          token.setAlpha(0.4);
          this.tweens.killTweensOf(token);
        }
        finish();
      });
    });
  }
}
export default Gather;
