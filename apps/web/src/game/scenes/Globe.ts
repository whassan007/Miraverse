import Phaser from 'phaser';
import type { Challenge, Lang, Pack } from '../../../../../packages/content/schema';

export class Globe extends Phaser.Scene {
  constructor() {
    super('globe');
  }
  init(_data?: { pack?: Pack; challenge?: Challenge; lang?: Lang }) {}
}
export default Globe;
