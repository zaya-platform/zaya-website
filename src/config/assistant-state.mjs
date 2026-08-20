// Build-time loader for the assistant gate. Reads the committed config off
// disk and hands it to the PURE resolver in ./assistant.mjs.
//
// Why read the file instead of `import assistantConfig from './assistant.json'`:
// a Vite/Astro JSON import turns a malformed file into a BUILD CRASH, and I5
// requires malformed config to resolve the assistant OFF (a crash is at least
// not "on", but "off" is what was asked for and it is what an operator can
// recover from). readFileSync + parseAssistantConfig() gives exactly that.
//
// Two candidate paths because Astro compiles this module through Vite: on the
// Node build `import.meta.url` is the real file URL, but we do not want the
// gate to depend on that staying true across Astro versions, so an explicit
// cwd-relative path (astro build always runs from the project root) is tried
// as well. If NEITHER resolves, the config is "missing" → assistant OFF.

import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { parseAssistantConfig, resolveAssistant } from './assistant.mjs';

export const CONFIG_RELATIVE_PATH = 'src/config/assistant.json';

export function assistantConfigCandidates() {
  const list = [];
  try {
    list.push(new URL('./assistant.json', import.meta.url));
  } catch {
    /* import.meta.url unavailable — fall through to cwd */
  }
  try {
    list.push(pathToFileURL(resolve(process.cwd(), CONFIG_RELATIVE_PATH)));
  } catch {
    /* no cwd — nothing else to try */
  }
  return list;
}

/** Read the committed config text, or null if no candidate path exists. */
export function readAssistantConfigText() {
  for (const url of assistantConfigCandidates()) {
    try {
      if (existsSync(url)) return readFileSync(url, 'utf8');
    } catch {
      /* unreadable candidate — try the next */
    }
  }
  return null;
}

/** The one call the Astro layout makes. Never throws; OFF on any doubt. */
export function assistantState(env = process.env) {
  const parsed = parseAssistantConfig(readAssistantConfigText());
  const state = resolveAssistant({ config: parsed.config, env });
  return { ...state, configOk: parsed.ok, configReason: parsed.reason };
}
