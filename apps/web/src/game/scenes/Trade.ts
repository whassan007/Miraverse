import Phaser from 'phaser';
import type { Challenge, Lang, Pack } from '../../../../../packages/content/schema';

type SceneData = { pack: Pack; challenge: Challenge; lang: Lang };

export class Trade extends Phaser.Scene {
  private sceneData?: SceneData;
  private offered: number[] = [];
  private complete = false;
  private view?: Phaser.GameObjects.Container;

  constructor() { super('trade'); }

  init(data?: SceneData) {
    this.sceneData = data;
    this.offered = (data?.challenge.needs ?? []).map(() => 0);
    this.complete = false;
  }

  create() {
    this.draw();
    this.scale.on('resize', this.draw, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.draw, this);
      this.view?.destroy(true);
      this.view = undefined;
    });
  }

  private draw() {
    this.view?.destroy(true);
    const width = 336;
    const needs = this.sceneData?.challenge.needs ?? [];
    const height = 300 + needs.length * 92;
    const scale = Math.min(1, this.scale.width / 360, this.scale.height / (height + 24));
    this.view = this.add.container((this.scale.width - width * scale) / 2, 12 * scale).setScale(scale);
    const label = (x: number, y: number, text: string, size = 18, color = '#fff7e8') => {
      const object = this.add.text(x, y, text, {
        fontFamily: 'sans-serif', fontSize: `${size}px`, color,
        wordWrap: { width: width - 24 }, align: 'center',
      }).setOrigin(0.5, 0);
      this.view!.add(object);
      return object;
    };
    const button = (x: number, y: number, text: string, action: () => void, enabled = true, w = 56) => {
      const rect = this.add.rectangle(x, y + 23, w, 46, enabled ? 0x215c62 : 0x414b50)
        .setStrokeStyle(2, enabled ? 0x8fe3d0 : 0x7d898e);
      this.view!.add(rect);
      const caption = label(x, y + 10, text, 18);
      caption.setWordWrapWidth(w - 8);
      if (enabled) rect.setInteractive({ useHandCursor: true }).on('pointerdown', action);
    };
    this.view.add(this.add.rectangle(width / 2, height / 2, width, height, 0x172e3b));
    if (!this.sceneData) { label(width / 2, 30, 'Choose a trade to begin.'); return; }
    const { pack, challenge } = this.sceneData;
    const itemName = (id: string) => pack.items.find(item => item.id === id)?.name_en ?? id;
    label(width / 2, 16, 'Market stall', 26);
    label(width / 2, 54, pack.mentor.name, 22, '#ffe49a');
    label(width / 2, 88, 'Add the requested items to your tray.', 16);
    const valid = needs.length > 0 && needs.every(need => Number.isInteger(need.count) && need.count > 0)
      && !!challenge.reward && Number.isInteger(challenge.reward.count) && challenge.reward.count > 0;
    needs.forEach((need, index) => {
      const y = 124 + index * 92;
      label(width / 2, y, `${itemName(need.item)} × ${need.count}`, 18);
      button(44, y + 34, '−', () => { this.offered[index]--; this.draw(); }, !this.complete && this.offered[index] > 0);
      label(width / 2, y + 46, `${this.offered[index]} / ${need.count} on tray`, 16);
      button(width - 44, y + 34, '+', () => { this.offered[index]++; this.draw(); }, valid && !this.complete && this.offered[index] < need.count);
    });
    const y = 132 + needs.length * 92;
    const reward = challenge.reward;
    label(width / 2, y, reward ? `${this.complete ? 'Received' : 'Reward'}: ${itemName(reward.item)} × ${reward.count}` : 'This trade has no reward.', 20, '#ffe49a');
    const ready = valid && needs.every((need, index) => this.offered[index] === need.count);
    button(width / 2, y + 64, this.complete ? 'Trade complete ✓' : 'Confirm trade', () => {
      if (this.complete || !ready) return;
      this.complete = true;
      this.draw();
      const payload = { challengeId: challenge.id };
      this.events.emit('challenge:done', payload);
      this.game.events.emit('challenge:done', payload);
    }, ready && !this.complete, 280);
    label(width / 2, y + 120, this.complete ? 'Thank you for trading!' : valid ? 'Use + and − to adjust your offer.' : 'This trade is unavailable.', 15);
  }
}
export default Trade;
