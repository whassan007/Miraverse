import Phaser from 'phaser';
import type { Challenge, Lang, Pack } from '../../../../../packages/content/schema';

type SceneData = { pack: Pack; challenge: Challenge; lang: Lang };

export class Word extends Phaser.Scene {
  private sceneData?: SceneData;
  private selected: number | null = null;
  private matched = new Set<number>();
  private complete = false;
  private feedback = 'Tap a word, then its English meaning.';
  private view?: Phaser.GameObjects.Container;

  constructor() { super('word'); }

  init(data?: SceneData) {
    this.sceneData = data;
    this.selected = null;
    this.matched = new Set();
    this.complete = false;
    this.feedback = 'Tap a word, then its English meaning.';
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
    const words = this.sceneData?.challenge.words ?? [];
    const width = 336;
    const height = 180 + words.length * 158;
    const scale = Math.min(1, this.scale.width / 360, this.scale.height / (height + 24));
    this.view = this.add.container((this.scale.width - width * scale) / 2, 12 * scale).setScale(scale);
    const label = (x: number, y: number, text: string, size: number, maxWidth = 308, color = '#fff7e8') => {
      const object = this.add.text(x, y, text, {
        fontFamily: 'sans-serif', fontSize: `${size}px`, color,
        wordWrap: { width: maxWidth }, align: 'center',
      }).setOrigin(0.5, 0);
      this.view!.add(object);
      return object;
    };
    this.view.add(this.add.rectangle(width / 2, height / 2, width, height, 0x172e3b));
    label(width / 2, 14, 'Word match', 26);
    label(width / 2, 52, `${this.matched.size} / ${words.length} matched`, 18);
    label(width / 2, 82, words.length ? this.feedback : 'Choose a word challenge to begin.', 16);
    words.forEach((word, index) => {
      const y = 138 + index * 96;
      const done = this.matched.has(index);
      const card = this.add.rectangle(width / 2, y + 41, 308, 82, done ? 0x245e43 : 0x21505d)
        .setStrokeStyle(this.selected === index ? 3 : 1, this.selected === index ? 0xffdf87 : 0x8fe3d0);
      this.view!.add(card);
      const native = label(width / 2, y + 5, word.word, 30, 288);
      if (native.height > 38) native.setScale(Math.min(1, 38 / native.height));
      label(width / 2, y + 48, `${word.translit}${done ? ' ✓' : ''}`, 16, 288);
      if (!done && !this.complete) card.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        this.selected = index;
        this.feedback = 'Now tap the matching English meaning.';
        this.draw();
      });
    });
    // Rotate the display order without changing the content or relying on randomness.
    words.map((_, index) => (index + 1) % words.length).forEach((index, position) => {
      const y = 150 + words.length * 96 + position * 62;
      const done = this.matched.has(index);
      const card = this.add.rectangle(width / 2, y + 25, 308, 50, done ? 0x245e43 : 0x35465f)
        .setStrokeStyle(1, 0x9db7ce);
      this.view!.add(card);
      const meaning = label(width / 2, y + 9, `${words[index].en}${done ? ' ✓' : ''}`, 19, 286);
      if (meaning.height > 36) meaning.setScale(Math.min(1, 36 / meaning.height));
      if (!done && !this.complete) card.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.match(index));
    });
  }

  private match(index: number) {
    const data = this.sceneData;
    const words = data?.challenge.words;
    if (!data || !words || this.complete || this.matched.has(index)) return;
    if (this.selected === null) {
      this.feedback = 'Choose a word first.';
    } else if (this.selected !== index) {
      this.feedback = 'Try another meaning. You can do it!';
    } else {
      this.matched.add(this.selected);
      this.selected = null;
      this.complete = this.matched.size === words.length;
      this.feedback = this.complete ? 'All words matched! Well done! ✓' : 'Correct! Choose another word. ✓';
    }
    this.draw();
    if (this.complete) {
      const payload = { challengeId: data.challenge.id };
      this.events.emit('challenge:done', payload);
      this.game.events.emit('challenge:done', payload);
    }
  }
}
export default Word;
