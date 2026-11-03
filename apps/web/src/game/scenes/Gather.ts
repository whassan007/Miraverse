import Phaser from 'phaser';
import type { Challenge, Lang, Pack } from '../../../../../packages/content/schema';

export class Gather extends Phaser.Scene {
  constructor() {
    super('gather');
  }
  init(_data?: { pack: Pack; challenge: Challenge; lang: Lang }) {}
}
export default Gather;
