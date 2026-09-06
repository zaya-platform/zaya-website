// Render specific timecodes at full res for review: node frames.mjs out/dir 2.4,5,7.2 [scale]
import { execFileSync } from 'node:child_process';
const [out, times, scale] = process.argv.slice(2);
for (const t of times.split(',').map(Number)) { const f = Math.round(t * 60); execFileSync('node', ['render.mjs', '--out', out, '--fps', '60', '--start', String(f), '--end', String(f + 1), '--force', ...(scale ? ['--scale', scale] : [])], { stdio: 'inherit' }); }
