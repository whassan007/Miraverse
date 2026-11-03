import Phaser from 'phaser';
import type { Challenge, Lang, Pack } from '../../../../../packages/content/schema';

export class Build extends Phaser.Scene {
  constructor() {
    super('build');
  }
  init(_data?: { pack: Pack; challenge: Challenge; lang: Lang }) {}
}
export default Build;
