export class Cook extends (globalThis as any).Phaser?.Scene || class {} {
  constructor() {
    super({ key: 'cook' });
  }
}
export default Cook;
