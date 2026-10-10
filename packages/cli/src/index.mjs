#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { run } from './install.mjs';
try {
  const registry = JSON.parse(readFileSync(new URL('./registry.json', import.meta.url), 'utf8'));
  run(process.argv.slice(2), registry);
} catch (error) {
  console.error(`Paper Ink: ${error.message}`);
  process.exitCode = 1;
}
