[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rezimx-btc/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rezimx-btc/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Ledger — GTA VI Trophy Guide & Tracker

The complete guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden on PlayStation until earned.

Every trophy shows its **official name, official description and grade exactly as PlayStation publishes them**, plus a guide written for this entry, in our own words: what to do, where and how, and when it can be missed. Every guide **cites its sources** beside the trophy, so a reader sees where each fact comes from. Sources are cited, never copied.

The app is also a tracker: a checklist whose progress is saved in the browser (localStorage) and can be exported to a file and imported back; filters by kind (story, missable, collectibles, activities, online); and a spoiler setting that hides the names and descriptions of the story trophies until they are earned. A six-stage **roadmap to the Platinum** orders the work: story first, then activities, then collectibles, and 100% completion last.

## How to run it

No build step, no network. Serve `app/` with any static HTTP server and open `index.html`:

```sh
cd app
python3 -m http.server 8080
# open http://localhost:8080/
```

Or with Node:

```sh
npx serve app
```

The app works with the network off: every script, stylesheet and file it loads is a file under `app/` or a data URI, and it makes no network request at run time.

## Honest notes

- There is **no online trophy** in the official list — every trophy is earned in the story and open world. The online filter is present for completeness and shows nothing, which is the honest answer.
- There is **no published definitive missable list** beyond the Chapter 1 meditation session flagged by GTABase (Positive Mental Attitude). Missable flags here are built from the official descriptions — story-chapter trophies, strand finales and mission-locked moments — and the guide says so where the record is uncertain.
- The cryptic trophies (Personal Best, Actions Speak Louder, Bad Luck I Guess, The Truth Is Out There) are marked as best-effort readings of their official descriptions, not confirmed facts.
- Estimated time to Platinum: about 200–300 hours (PowerPyx / Push Square estimate, not a measured average). Cheats disable trophies.

## Files

- `app/index.html` — the app shell: progress bar, search, filters, spoiler setting, roadmap, checklist and guide panel.
- `app/style.css` — the whole look: dark neon Vice City palette, our own design.
- `app/src/app.js` — tracker logic: loads the trophy data, renders the list and roadmap, saves progress to localStorage, export/import, deep links (`?trophy=17`, `?view=roadmap`, `?spoiler=1`, `?filter=missable`).
- `app/data/trophies.json` — the 55 trophies: official name, description, grade and hidden flag, plus our guide, steps, kind, missable flag, roadmap stage and sources.
- `main.ts` — entry program: copies `app/` and `screenshots/` into `MAKEFUN_OUTPUT_DIR` and writes `dossier.json` with the kit's `buildDossier`. Run it with Node 22.
- `vendor/makefun-frontend.ts` — the kit's library, vendored unchanged.
- `screenshots/` — 4 screenshots, real renders of the app in a headless browser: the cover, a trophy guide open beside the checklist, the roadmap, and the filters with the spoiler setting at work.

## Sources

- Exophase — GTA VI trophy list (PSN)
- PSNProfiles — GTA VI trophy list
- GTABase, via GGRecon — the Chapter 1 meditation session (Positive Mental Attitude): https://www.ggrecon.com/articles/gta-6-trophies-achievements-list-platinum/
- planetgta6.com — 28 hidden trophies; story trophies hidden: https://planetgta6.com/en/gta-6-trophies/
- Heyday News / GTA Culture — 100% completion contents: https://heyday.news/articles/gta-6-ps5-trophy-list-platinum-100-percent-b79c5017
- PowerPyx / Push Square — platinum time estimate (~200–300 hours); cheats disable trophies

An unofficial fan-made guide. Not affiliated with Rockstar Games or PlayStation. No Rockstar logo, artwork or game screenshots are used anywhere in this app.
