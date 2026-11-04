import Phaser from 'phaser';
import { COUNTRY_WGS84 } from '../../../../../packages/content/schema';
import { PACKS } from '../../lib/content';
import type { SceneData } from '../shared';
import { projectWGS84 } from '../shared';
export { projectWGS84 } from '../shared';

export class Globe extends Phaser.Scene {
  private dataForScene?: Partial<SceneData>;
  constructor() { super('globe'); }
  init(data?: Partial<SceneData>) { this.dataForScene = data; }
  create() {
    this.drawMap();
    this.scale.on('resize', this.drawMap, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.drawMap, this));
  }
  private drawMap() {
    this.children.removeAll(true);
    const { width, height } = this.scale;
    const mapHeight = Math.max(100, height - 110);
    const grid = this.add.graphics();
    grid.fillStyle(0x102c45).fillRect(0, 0, width, height);
    grid.lineStyle(1, 0x7095aa, 0.35);
    for (let lon = -180; lon <= 180; lon += 30) {
      const { x } = projectWGS84(0, lon, width, mapHeight);
      grid.lineBetween(x, 0, x, mapHeight);
    }
    for (let lat = -90; lat <= 90; lat += 30) {
      const { y } = projectWGS84(lat, 0, width, mapHeight);
      grid.lineBetween(0, y, width, y);
    }
    PACKS.forEach((pack, index) => {
      const { lat, lon } = COUNTRY_WGS84[pack.country];
      const { x, y } = projectWGS84(lat, lon, width, mapHeight);
      const color = /^#[0-9a-f]{6}$/i.test(pack.colors.primary) ? Number.parseInt(pack.colors.primary.slice(1), 16) : 0xffc857;
      const choose = () => this.game.events.emit('country:select', { country: pack.country });
      this.add.circle(x, y, 7, color).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true }).on('pointerdown', choose);
      const columnWidth = width / PACKS.length;
      this.add.text(columnWidth * (index + 0.5), mapHeight + 30, pack.country, {
        fontSize: '18px', color: '#ffffff', backgroundColor: pack.colors.primary,
        padding: { x: 10, y: 12 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', choose);
    });
    if (this.dataForScene?.pack) {
      this.add.text(width / 2, height - 20, this.dataForScene.pack.name_en, { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
    }
  }
}
export default Globe;
