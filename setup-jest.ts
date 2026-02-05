import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

/**
 * JSDOM ne sait pas parser certains CSS Angular Material/CDK (ex: @layer).
 * On filtre UNIQUEMENT ce message précis.
 */
const originalError = console.error;

console.error = (...args: any[]) => {
  const msg = String(args?.[0] ?? "");

  if (msg.includes("Could not parse CSS stylesheet")) return;
  if (msg.includes("Not implemented: HTMLCanvasElement.prototype.getContext")) return;

  originalError(...args);
};