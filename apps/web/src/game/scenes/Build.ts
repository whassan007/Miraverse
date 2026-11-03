export class Build extends (globalThis as any).Phaser?.Scene || class {} {
  constructor() {
    super({ key: 'build' });
  }
}
export default Build;
