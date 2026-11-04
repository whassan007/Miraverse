import Phaser from 'phaser';
import type { Challenge, Item, Lang, Pack } from '../../../../../packages/content/schema';

type SceneData = { pack: Pack; challenge: Challenge; lang: Lang };
const colorOf = (item: Item) => /^#[0-9a-f]{6}$/i.test(item.color)
  ? parseInt(item.color.slice(1), 16) : 0x7895b2;

export class Build extends Phaser.Scene {
  private sceneData?: SceneData;
  private completed = false;
  private selected?: string;

  constructor() { super('build'); }

  init(data?: SceneData) {
    this.sceneData = data;
    this.completed = false;
    this.selected = undefined;
  }

  create() {
    if (!this.sceneData) return;
    const { pack, challenge } = this.sceneData;
    const width = Math.min(360, this.scale.width);
    const left = (this.scale.width - width) / 2;
    const text = (x: number, y: number, value: string, size = 16) => this.add.text(x, y, value, {
      fontFamily: 'sans-serif', fontSize: `${size}px`, color: '#ffffff',
      wordWrap: { width: width - 24 }, align: 'center',
    }).setOrigin(0.5, 0);
    const title = text(left + width / 2, 12, challenge.title_en, 20);
    const hint = text(left + width / 2, title.y + title.height + 8,
      'Tap each outlined tile to build. Choose a material below to place it.', 14);
    const rows = challenge.blueprint?.map(row => Array.from(row)) ?? [];
    const columns = Math.max(0, ...rows.map(row => row.length));
    const items = new Map(pack.items.map(item => [item.id, item]));
    const targets: { row: number; column: number; item: Item }[] = [];
    let invalid = !rows.length || !columns;
    rows.forEach((row, r) => row.forEach((symbol, c) => {
      if (symbol === '.') return;
      const item = items.get(challenge.blueprintLegend?.[symbol] ?? '');
      if (!item) invalid = true;
      else targets.push({ row: r, column: c, item });
    }));
    if (invalid || !targets.length) {
      text(left + width / 2, hint.y + hint.height + 20, 'This blueprint is unavailable.');
      return;
    }
    const palette = [...new Map(targets.map(target => [target.item.id, target.item])).values()];
    const paletteColumns = Math.max(1, Math.floor((width - 24) / 100));
    const paletteRows = Math.ceil(palette.length / paletteColumns);
    const gridTop = hint.y + hint.height + 20;
    const cell = Math.min(48, (width - 24) / columns,
      Math.max(1, (this.scale.height - gridTop - paletteRows * 64 - 56) / rows.length));
    const gridLeft = left + (width - cell * columns) / 2;
    const placed = new Map<string, string>();
    const status = text(left + width / 2, gridTop + rows.length * cell + 8, `0 / ${targets.length}`, 14);
    targets.forEach(({ row, column, item }) => {
      const key = `${row}:${column}`;
      const tile = this.add.rectangle(gridLeft + (column + 0.5) * cell,
        gridTop + (row + 0.5) * cell, Math.max(1, cell - 4), Math.max(1, cell - 4), colorOf(item), 0.18)
        .setStrokeStyle(2, colorOf(item)).setInteractive({ useHandCursor: true });
      tile.on('pointerdown', () => {
        if (this.completed) return;
        const chosen = items.get(this.selected ?? item.id)!;
        placed.set(key, chosen.id);
        tile.setFillStyle(colorOf(chosen), 1);
        tile.setStrokeStyle(chosen.id === item.id ? 3 : 2, chosen.id === item.id ? 0xffffff : colorOf(item));
        const matches = targets.filter(target => placed.get(`${target.row}:${target.column}`) === target.item.id).length;
        status.setText(`${matches} / ${targets.length}`);
        if (matches === targets.length) {
          this.completed = true;
          status.setText('✓');
          const payload = { challengeId: challenge.id };
          this.events.emit('challenge:done', payload);
          this.game.events.emit('challenge:done', payload);
        }
      });
    });
    const swatches: { id: string; shape: Phaser.GameObjects.Rectangle }[] = [];
    palette.forEach((item, index) => {
      const x = left + (index % paletteColumns + 0.5) * width / paletteColumns;
      const y = status.y + 42 + Math.floor(index / paletteColumns) * 64;
      const shape = this.add.rectangle(x, y, 44, 28, colorOf(item))
        .setStrokeStyle(1, 0xffffff).setInteractive({ useHandCursor: true });
      swatches.push({ id: item.id, shape });
      shape.on('pointerdown', () => {
        if (this.completed) return;
        this.selected = this.selected === item.id ? undefined : item.id;
        swatches.forEach(swatch => swatch.shape.setStrokeStyle(swatch.id === this.selected ? 4 : 1, 0xffffff));
      });
      text(x, y + 17, item.name_en, 12).setWordWrapWidth(width / paletteColumns - 8);
    });
  }
}
export default Build;
