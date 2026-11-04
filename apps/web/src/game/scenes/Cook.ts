import Phaser from 'phaser';
import type { Challenge, Lang, Pack } from '../../../../../packages/content/schema';

type CookData = { pack: Pack; challenge: Challenge; lang: Lang };

export class Cook extends Phaser.Scene {
  private cookData?: CookData;
  private inputs: string[] = [];
  private step = 0;
  private completed = false;
  private page = 0;
  private hint = 'Tap an ingredient or drag it into the pot.';
  private potBounds = new Phaser.Geom.Rectangle();
  private feedback?: Phaser.GameObjects.Text;

  constructor() {
    super('cook');
  }

  init(data?: CookData) {
    this.cookData = data;
    this.inputs = [...(data?.challenge.recipe?.inputs ?? [])];
    this.step = 0;
    this.completed = false;
    this.page = 0;
    this.hint = 'Tap an ingredient or drag it into the pot.';
  }

  create() {
    this.cameras.main.setBackgroundColor('#fff8e8');
    this.input.dragDistanceThreshold = 10;
    this.scale.on('resize', this.renderScene, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.renderScene, this);
      this.tweens.killAll();
      this.feedback = undefined;
    });
    this.renderScene();
  }

  private name(id: string): string {
    return this.cookData?.pack.items.find(item => item.id === id)?.name_en ?? id;
  }

  private label(x: number, y: number, value: string, size: number, width: number) {
    return this.add.text(x, y, value, {
      fontFamily: 'Arial, sans-serif', fontSize: `${size}px`, color: '#263d35',
      align: 'center', wordWrap: { width, useAdvancedWrap: true },
    }).setOrigin(0.5, 0);
  }

  private renderScene() {
    this.tweens.killAll();
    this.children.removeAll(true);
    const width = this.scale.width;
    const height = this.scale.height;
    const center = width / 2;
    const contentWidth = Math.max(120, Math.min(width - 24, 700));
    const data = this.cookData;
    if (!data) {
      this.label(center, 24, 'Choose a cooking challenge to begin.', 20, contentWidth);
      return;
    }
    const title = this.label(center, 12, data.challenge.title_en, 24, contentWidth);
    const goal = this.label(center, title.y + title.height + 8, data.challenge.goal_en, 16, contentWidth);
    let y = goal.y + goal.height + 12;
    if (!data.challenge.recipe || this.inputs.length === 0 ||
        this.inputs.some(id => !data.pack.items.some(item => item.id === id))) {
      this.label(center, y, 'This recipe needs available ingredients before cooking can begin.', 18, contentWidth);
      return;
    }
    const progress = this.label(center, y,
      this.completed ? `Complete! ${this.inputs.length} of ${this.inputs.length} ingredients added.` :
        `Step ${this.step + 1} of ${this.inputs.length} — Add ${this.name(this.inputs[this.step])}`, 18, contentWidth);
    y += progress.height + 12;
    const potWidth = Math.min(contentWidth, 300);
    const potHeight = 92;
    this.potBounds.setTo(center - potWidth / 2, y, potWidth, potHeight);
    this.add.rectangle(center, y + potHeight / 2, potWidth, potHeight, this.completed ? 0xc9edb4 : 0xd7e5e0)
      .setStrokeStyle(3, 0x376453);
    this.label(center, y + 12, this.completed ? 'Dish ready!' : 'Cooking pot', 20, potWidth - 16);
    this.label(center, y + 43, this.completed ? this.name(data.challenge.recipe.output) :
      `${this.step} / ${this.inputs.length} ingredients`, 16, potWidth - 16);
    y += potHeight + 10;
    this.feedback = this.label(center, y, this.completed ? 'Well done — your dish is ready!' : this.hint, 16, contentWidth);
    y += Math.max(44, this.feedback.height) + 8;
    if (this.completed) return;
    const heading = this.label(center, y, 'Available ingredients', 18, contentWidth);
    y += heading.height + 10;
    const columns = width >= 600 ? 3 : 2;
    const gap = 10;
    const cardWidth = (contentWidth - gap * (columns - 1)) / columns;
    const rows = Math.max(1, Math.floor((height - y - 56) / 76));
    const perPage = columns * rows;
    const pages = Math.max(1, Math.ceil(data.pack.items.length / perPage));
    this.page = Math.min(this.page, pages - 1);
    const items = data.pack.items.slice(this.page * perPage, (this.page + 1) * perPage);
    items.forEach((item, index) => {
      const x = center - contentWidth / 2 + cardWidth / 2 + (index % columns) * (cardWidth + gap);
      const cardY = y + Math.floor(index / columns) * 76 + 33;
      const color = /^#[0-9a-f]{6}$/i.test(item.color) ? Number.parseInt(item.color.slice(1), 16) : 0xe7bf77;
      const background = this.add.rectangle(0, 0, cardWidth, 66, 0xffffff).setStrokeStyle(2, 0x637b70);
      const swatch = this.add.rectangle(-cardWidth / 2 + 10, 0, 6, 46, color);
      const text = this.label(5, 0, item.name_en, 16, cardWidth - 30).setOrigin(0.5);
      const card = this.add.container(x, cardY, [background, swatch, text]).setSize(cardWidth, 66)
        .setInteractive({ useHandCursor: true });
      this.input.setDraggable(card);
      let dragged = false;
      card.on('pointerdown', () => { dragged = false; });
      card.on('dragstart', () => {
        dragged = true;
        this.tweens.killTweensOf(card);
        card.setAngle(0).setDepth(10);
      });
      card.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        card.setPosition(dragX, dragY);
      });
      card.on('dragend', (pointer: Phaser.Input.Pointer) => {
        card.setPosition(x, cardY).setDepth(0);
        if (this.potBounds.contains(pointer.x, pointer.y)) this.addIngredient(item.id, card);
      });
      card.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (!dragged && pointer.getDistance() < 10) this.addIngredient(item.id, card);
      });
    });
    if (pages > 1) {
      const navY = y + rows * 76;
      this.label(center, navY + 10, `${this.page + 1} / ${pages}`, 16, 80);
      const navigation = (x: number, text: string, delta: number) => {
        this.add.rectangle(x, navY + 22, 96, 44, 0xd7e5e0).setStrokeStyle(1, 0x376453)
          .setInteractive({ useHandCursor: true }).on('pointerup', () => {
            this.page = (this.page + delta + pages) % pages;
            this.renderScene();
          });
        this.label(x, navY + 12, text, 16, 90);
      };
      navigation(center - contentWidth / 2 + 48, 'Previous', -1);
      navigation(center + contentWidth / 2 - 48, 'Next', 1);
    }
  }

  private addIngredient(id: string, card: Phaser.GameObjects.Container) {
    if (this.completed || !this.cookData) return;
    if (id !== this.inputs[this.step]) {
      this.hint = `Try ${this.name(this.inputs[this.step])} next. Your progress is saved.`;
      this.feedback?.setText(this.hint).setColor('#8a351f');
      this.tweens.killTweensOf(card);
      card.setAngle(0);
      this.tweens.add({ targets: card, angle: 5, duration: 70, yoyo: true, repeat: 2,
        onComplete: () => { card.setAngle(0); } });
      return;
    }
    this.step += 1;
    this.hint = `${this.name(id)} added! Keep cooking.`;
    if (this.step === this.inputs.length) {
      this.completed = true;
      const payload = { challengeId: this.cookData.challenge.id };
      this.renderScene();
      this.events.emit('challenge:done', payload);
      this.game.events.emit('challenge:done', payload);
      return;
    }
    this.renderScene();
  }
}

export default Cook;
