import Phaser from 'phaser';
import type { Challenge, Lang, Pack } from '../../../../../packages/content/schema';

export class Trade extends Phaser.Scene {
  constructor() {
    super('trade');
  }
  init(_data?: { pack: Pack; challenge: Challenge; lang: Lang }) {}
}
export default Trade;
