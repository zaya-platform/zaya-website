import { readFileSync, writeFileSync } from 'node:fs';

const d = JSON.parse(readFileSync('DEPLOYMENT.json', 'utf8'));
d.verified_at_utc = '2026-09-26T18:15:00.000Z';
d.deploy_id_note = 'Deploy triggered by Git push of feat/visual-qa-ethiopic-font (bf2516d) to main, fast-forward from f9fda88, owner-approved (A1: deploy if changed). Netlify deploy ID not retrievable here. The 3D QA pass found NO defects, so the deploy contains only the Ethiopic webfont change. No function changes — no live Jev POST needed per A4.';
d.rollback.pre_merge_main_sha = 'f9fda888be02f2eabca0eb5e1ade4b446653c1d9';
d.rollback.plan = 'git push git@github.com:zaya-platform/zaya-website.git f9fda888be02f2eabca0eb5e1ade4b446653c1d9:main (force, pinned) restores the previous generation.';
d.previous_deploy = 'f9fda88 generation';
d.repository_state = {
  main: 'bf2516d (Ethiopic webfont; 3D QA passed with no defects)',
  feat_visual_qa_ethiopic_font: 'bf2516d',
  feat_jev_instant_answers: 'f9fda88 (previous generation marker)',
  archive: 'archive/august-2026-main preserved at 6b13ba1',
};
d.feature = 'Amharic/Ethiopic rendering: bundled Noto Sans Ethiopic (Ethiopic-subset variable woff2, SIL OFL 1.1) with font-display: swap and Ethiopic unicode-range — downloads only when Ethiopic glyphs render. 3D visual QA pass (motion enabled in the test browser via the production chunk): no defects found, no scene changes.';
d.live_checks.push(
  { check: 'bundled ethiopic font file', route: '/fonts/noto-sans-ethiopic-subset.woff2', status: 200, bytes: 198324 },
  { check: 'built CSS references the font-face', evidence: 'live /_astro/index.BQCnnphP.css contains the "Noto Sans Ethiopic" @font-face with noto-sans-ethiopic-subset.woff2 and unicode-range U+1200-1399' },
);
d.page_weight = {
  budget: '~400 KB initial transfer',
  before_bytes: 157109,
  after_bytes: 355433,
  note: '157,109 B without Ethiopic glyphs; the 198,324 B font downloads only on pages rendering Ethiopic text (the homepage includes the Amharic short title). Both figures inside budget. Swap behaviour declared (font-display: swap); network throttling unavailable in this test browser.',
};
writeFileSync('DEPLOYMENT.json', JSON.stringify(d, null, 2) + '\n');

const v = JSON.parse(readFileSync('VALIDATION.json', 'utf8'));
v.verified_at_utc = '2026-09-26T18:12:00.000Z';
v.environment.unit_tests = { files: ['test/jev-triage.test.mjs', 'test/triage-questions.test.mjs', 'test/question-match.test.mjs'], pass: 21, fail: 0 };
v.feature = '3D visual QA pass (motion-enabled via production-chunk instantiation, test browser only) + bundled Noto Sans Ethiopic subset';
v.browser_checks.three_d_qa = {
  method: 'This test browser permanently reports prefers-reduced-motion, so the real production scene chunk (network-scene.BPxfhOh4.js) was manually instantiated on the live page (setRunning(true)) — the equivalent of forcing no-preference, test-browser only, per A3.',
  results: {
    canvas_mounted: '444x323, data-renderer=3d, fallback hidden',
    scene_renders: 'platform, logo hub, four distinct nodes with rings, connection paths, district blocks — screenshot captured; brand-faithful, no layout shift or overlap',
    tooltips: 'projectNode() verified; tooltip visually correct above the shopping-bag node with name + benefit line (screenshot). NOTE: the lifecycle wiring in neighbourhood.ts could not be exercised end-to-end here because it captured the real media query at load (its internal scene stays undefined under reduced motion); the wiring mirrors the working selection/pause paths and was code-reviewed.',
    selection: 'scene stays mounted through audience selection (zaya:audiencechange)',
    pause_control: 'in reduced-motion the site correctly shows "Motion is off" disabled (OS-driven); the toggle wiring mirrors the reviewed paths',
    tilt: 'pointer parallax clamped by stage geometry to [-1,1] x 0.085 rad = 4.87 deg (<= 5)',
    drift_pulses: 'code-verified (camera drift 0.16/0.28 units; calm pulses on all four paths, selected brighter/faster) — motion not capturable beyond static screenshots here',
  },
  reduced_motion_mode: { three_chunk_fetched: false, fallback_first_class: true, tips_hidden: true, motion_control: 'Motion is off (disabled, OS-driven)' },
};
v.browser_checks.regression_after_font = { instant_answer_zero_network: true, paraphrase_instant: true, different_question_review_fallback: true, explore_4: true, video_preload_none: true, tiktok_and_share_meta: true, both_promos: true, viewports_overflow_free: ['360x740', '390x844', '768x1024', '844x390', '720x450'], console_errors: 0 };
v.ethiopic_font = {
  file: 'public/fonts/noto-sans-ethiopic-subset.woff2',
  bytes: 198324,
  variable: 'one file serves weights 100-900 (Ethiopic subset; latin excluded)',
  license: 'SIL OFL 1.1 (Google Fonts, v50)',
  rendering_proof: "document.fonts.check('700 20px Noto Sans Ethiopic', Amharic sample) === true; font fetched on the homepage; Amharic promo title renders in it (screenshot)",
  swap: 'font-display: swap declared; throttled-reload simulation unavailable in this browser',
};
v.page_weight = {
  without_ethiopic_glyphs: '157,109 B (153.4 KB)',
  homepage_with_amharic_title: '355,433 B (347.1 KB)',
  budget: '~400 KB — respected; privacy/terms pages never fetch the font',
};
writeFileSync('VALIDATION.json', JSON.stringify(v, null, 2) + '\n');
console.log('records updated');
