import Phaser from 'phaser';
import type { Challenge, Lang, Pack } from '../../../../../packages/content/schema';

export class Cook extends Phaser.Scene {
  constructor() {
    super('cook');
  }
  init(_data?: { pack: Pack; challenge: Challenge; lang: Lang }) {}
}
export default Cook;
