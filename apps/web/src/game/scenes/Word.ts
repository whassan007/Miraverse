export class Word extends (globalThis as any).Phaser?.Scene || class {} {
  constructor() {
    super({ key: 'word' });
  }
}
export default Word;
