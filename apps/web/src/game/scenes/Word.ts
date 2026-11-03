import Phaser from 'phaser';
import type { Challenge, Lang, Pack } from '../../../../../packages/content/schema';

export class Word extends Phaser.Scene {
  constructor() {
    super('word');
  }
  init(_data?: { pack: Pack; challenge: Challenge; lang: Lang }) {}
}
export default Word;
