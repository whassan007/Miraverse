/** Replaces physical/index.ts when MV_PHYSICAL is off, so default builds ship none of it. */
export function startPhysical(): void {}
export function enterByblos(_player: unknown): void {}
export function chooseLanguage(_player: unknown): Promise<void> {
  return Promise.resolve();
}
export const waitForByblos = (): Promise<boolean> => Promise.resolve(false);
