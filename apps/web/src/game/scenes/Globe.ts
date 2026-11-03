export class Globe extends (globalThis as any).Phaser?.Scene || class {} {
  constructor() {
    super({ key: 'globe' });
  }
}
export default Globe;
