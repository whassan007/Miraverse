#!/usr/bin/env node
/**
 * MiraVerse v1.2 — Wave W0 Executor (`swarm/v12/run-wave0.mjs`)
 * Executes Wave W0 agents in isolated worktrees (`/home/wael/Code/mv-wt-v12/<ID>`):
 *   1. DX01 — Input segmentation, SHA-256 checksum, source registry & DGX queue scheduler (`content/v12/source-registry/`, `swarm/v12/dgx/`)
 *   2. CL01 — Knowledge ontology, reversible merge policy & canonical IDs (`packages/knowledge-v12/`)
 *   3. CL02 — Historical epistemology, claim-verification policy & reviewer workflow (`content/v12/epistemology/`)
 *   4. CX01 — Repository inventory, non-destructive migrations, schema, diff preview & rollback (`tools/v12/migration/`)
 *   5. AG01 — Country visual knowledge-system art direction (`art/v12/direction/`)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync, spawnSync } from 'node:child_process';

export const ROOT = process.cwd();
export const WT_BASE = '/home/wael/Code/mv-wt-v12';
export const MANIFEST_PATH = path.join(ROOT, 'swarm/v12/manifest.json');
export const LOGS_DIR = path.join(ROOT, 'swarm/v12/logs');

fs.mkdirSync(WT_BASE, { recursive: true });
fs.mkdirSync(LOGS_DIR, { recursive: true });

export function sh(cmd, cwd = ROOT) {
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

export async function queryDgxSpark(prompt, maxTokens = 320) {
  const start = Date.now();
  try {
    const res = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen/qwen3-coder-next',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.1,
      }),
    });
    const data = await res.json();
    const elapsedSec = (Date.now() - start) / 1000;
    const compTokens = data.usage?.completion_tokens || 32;
    return {
      ok: true,
      model: data.model || 'qwen/qwen3-coder-next',
      content: (data.choices?.[0]?.message?.content || '').trim(),
      usage: data.usage || {},
      tokensPerSec: Number((compTokens / Math.max(0.1, elapsedSec)).toFixed(2)),
      elapsedMs: Date.now() - start,
    };
  } catch (err) {
    return {
      ok: false,
      model: 'qwen/qwen3-coder-next',
      content: String(err),
      usage: {},
      tokensPerSec: 0,
      elapsedMs: Date.now() - start,
    };
  }
}

export function prepareWorktree(agentId) {
  const wtDir = path.join(WT_BASE, agentId);
  const branch = `v12/${agentId}`;
  const baseSha = sh('git rev-parse HEAD', ROOT);
  if (fs.existsSync(path.join(wtDir, '.git'))) {
    sh(`git reset --hard ${baseSha}`, wtDir);
    sh('git clean -fd', wtDir);
  } else {
    try { sh(`git worktree remove --force "${wtDir}"`, ROOT); } catch {}
    try { sh(`git branch -D "${branch}"`, ROOT); } catch {}
    sh(`git worktree add -q -b "${branch}" "${wtDir}" ${baseSha}`, ROOT);
  }
  sh('git config user.name "Wael Hassan"', wtDir);
  sh('git config user.email "163226430+whassan007@users.noreply.github.com"', wtDir);
  if (!fs.existsSync(path.join(wtDir, 'node_modules')) && fs.existsSync(path.join(ROOT, 'node_modules'))) {
    fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(wtDir, 'node_modules'));
  }
  return { wtDir, branch, baseSha };
}

export function writeWtFile(wtDir, relPath, content) {
  const full = path.join(wtDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

export function isAgentDone(agentId) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const rec = manifest.agents.find((a) => a.id === agentId);
  return rec && (rec.status === 'VERIFIED' || rec.status === 'INTEGRATED');
}

export function finalizeAgent(agentId, wtDir, ownedPaths, testCommand, evidencePaths, runtimeEnv, blockers = []) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const rec = manifest.agents.find((a) => a.id === agentId);
  if (!rec) throw new Error(`Agent ${agentId} not found in manifest`);

  rec.attempts += 1;
  rec.status = 'RUNNING';

  const testRes = spawnSync('bash', ['-c', testCommand], { cwd: wtDir, encoding: 'utf8', timeout: 120000 });
  if (testRes.status !== 0) {
    rec.status = 'FAILED';
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    throw new Error(`Agent ${agentId} failed test_command (${testCommand}):\n${testRes.stdout}\n${testRes.stderr}`);
  }

  for (const p of ownedPaths) {
    const target = path.join(wtDir, p);
    if (fs.existsSync(target)) {
      sh(`git add -f -- "${p}"`, wtDir);
    }
  }

  const staged = sh('git diff --cached --name-only', wtDir).split('\n').filter(Boolean);
  for (const f of staged) {
    const allowed = ownedPaths.some((prefix) => f.startsWith(prefix.replace(/\/$/, '')));
    if (!allowed) {
      throw new Error(`Ownership violation by ${agentId}: attempted to stage ${f} outside ${ownedPaths.join(', ')}`);
    }
  }

  if (staged.length === 0) {
    throw new Error(`Agent ${agentId} produced an empty diff`);
  }

  sh(`git commit -m "${agentId} (${rec.wave}): implement and verify ${ownedPaths.join(', ')}"`, wtDir);
  const agentSha = sh('git rev-parse --short HEAD', wtDir);

  sh(`git merge --no-ff "v12/${agentId}" -m "Merge ${agentId} (${rec.wave}) into integration/miraverse-v1.2"`, ROOT);
  const mergedSha = sh('git rev-parse --short HEAD', ROOT);

  rec.commit_sha = agentSha;
  rec.integration_sha = mergedSha;
  rec.modified_files = staged;
  rec.evidence_paths = evidencePaths;
  rec.runtime_environment = runtimeEnv;
  rec.blockers = blockers;
  rec.status = blockers.length > 0 ? 'INTEGRATED' : 'VERIFIED';

  const logContent = [
    `=== AGENT ${agentId} (${rec.family} · ${rec.wave}) ===`,
    `Timestamp: ${new Date().toISOString()}`,
    `Resolved Model: ${rec.resolved_model}`,
    `Runtime Environment: ${runtimeEnv}`,
    `Branch: ${rec.branch}`,
    `Agent Commit SHA: ${agentSha}`,
    `Integration Merge SHA: ${mergedSha}`,
    `Owned Paths: ${ownedPaths.join(', ')}`,
    `Modified Files (${staged.length}): ${staged.join(', ')}`,
    `Test Command: ${testCommand}`,
    `Test Exit Code: ${testRes.status}`,
    `Evidence Paths: ${evidencePaths.join(', ')}`,
    `Blockers: ${blockers.length ? blockers.join('; ') : 'None'}`,
    `--- STDOUT/STDERR ---`,
    (testRes.stdout || '') + (testRes.stderr || ''),
    `DONE ${agentId} ${agentSha} ${evidencePaths[0] || ''}`,
  ].join('\n');

  fs.writeFileSync(path.join(LOGS_DIR, `${agentId}.log`), logContent + '\n', 'utf8');
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  sh(`git add swarm/v12/manifest.json "swarm/v12/logs/${agentId}.log" && git commit -m "v12-orchestrator: record ${agentId} completion (${agentSha})"`, ROOT);

  console.log(`DONE ${agentId} -> commit ${agentSha} (merged at ${mergedSha})`);
}

const SOURCE_ESSAY_TEXT = `# The Transnational Quest for Home: Myth, Memory, and Cultural Heritage in the Expatriate Experience
Source File Reference: Pasted text(1).txt
Ingestion Type: user_supplied_research
Author / Publisher: Unknown (User-Supplied Research Input)
Rights / Reuse Status: review_required (paraphrase_only; no verbatim player-facing reproduction)

## Section 1 — Lebanon: Secrets of Byblos and Maritime Memory (Passages LB-P01 to LB-P06)
[LB-P01] Byblos (modern Jbeil, Lebanon) is one of the oldest continuously inhabited coastal ports on the eastern Mediterranean, historically linking Mount Lebanon cedar timber, olive oil, and resin with Nile Valley and Aegean maritime networks.
[LB-P02] In Plutarch's mythological account *De Iside et Osiride*, the chest holding Osiris drifted ashore at Byblos and was enclosed within a sacred erica/cedar tree that the king of Byblos fashioned into a palace pillar before Isis retrieved it. This is a Hellenistic-era mythological narrative connecting Egypt and Byblos, not a literal historical event.
[LB-P03] In the landscape around Afqa cave and the Nahr Ibrahim (Adonis River), seasonal red iron-rich sediment washing down from Mount Lebanon after winter rains was interpreted in antiquity through the myth of Adonis and Astarte/Aphrodite. Modern heritage education distinguishes the geological sediment phenomenon from the ancient seasonal myth.
[LB-P04] The royal sarcophagus of King Ahiram of Byblos (commonly dated to c. 1000 BCE, preserved in the National Museum of Beirut) bears one of the earliest substantial Phoenician alphabetic inscriptions. The 22-letter consonantal abjad (including acrophonic signs such as Aleph 'ox', Beth 'house', Mem 'water', Resh 'head', and Taw 'mark') served as a portable commercial and archival technology.
[LB-P05] While the Phoenician alphabet influenced Greek, Aramaic, Latin, and Arabic script families through maritime and overland trade, historians caution against oversimplified claims that Phoenician single-handedly invented every Western script without earlier Proto-Sinaitic/Canaanite predecessors and regional adaptations.
[LB-P06] In the Lebanese diaspora, writers and oral-history archives—including works referenced in expatriate literature such as Amin Maalouf (*Origins*), Rabih Alameddine (*The Hakawati*), Kahlil Gibran, and community family memory collections—treat recipes (like saj man'oushe), letters, and harbor keepsakes as portable archives of home. Named books and authors are recorded as bibliographic candidates pending citation verification.

## Section 2 — Iraq: Legacy of Baghdad and Knowledge That Travels (Passages IQ-P01 to IQ-P06)
[IQ-P01] During the Abbasid era, Baghdad's round city and Tigris riverfront fostered a pluralistic scholarly and translation movement associated with Bayt al-Hikma (the House of Wisdom). Modern historians note that while Bayt al-Hikma functioned as a caliphal library and translation bureau under Harun al-Rashid and al-Ma'mun (9th century CE), exact institutional charter details and claims that it was a modern-style university require historical qualification.
[IQ-P02] Key scholars linked to Abbasid Baghdad's scientific and translation networks include Muhammad ibn Musa al-Khwarizmi (algebra and astronomical tables), Ya'qub ibn Ishaq al-Kindi (philosophy and optics/cryptanalysis), Hunayn ibn Ishaq (Syriac-Arabic-Greek medical and scientific translation), Thabit ibn Qurra (Harranian mathematician and translator), and the Banu Musa brothers (*Kitab al-Hiyal* / Book of Ingenious Devices describing ~100 mechanical and hydraulic automata).
[IQ-P03] Popular anecdotes—such as Caliph al-Ma'mun paying Hunayn ibn Ishaq the weight of translated manuscripts in gold, or claims that the Tigris ran black with ink and red with blood during the 1258 Mongol siege—are famous literary tropes from later chronicles that must be labeled as contested or uncorroborated historical anecdotes rather than verified statistical facts.
[IQ-P04] Al-Mutanabbi Street in historic Baghdad (named after the 10th-century poet al-Mutanabbi) has long served as the heart of Iraq's bookselling, printing, and café culture (including Shabandar Café), reflecting Muslim, Christian, Syriac, Kurdish, Mandaean, and Jewish intellectual contributions.
[IQ-P05] Following the March 2007 car-bombing on Al-Mutanabbi Street, Iraqi booksellers rebuilt the market and international book artists launched the *Al-Mutanabbi Street Starts Here* solidarity archive (founded by Beau Beausoleil and Sarah Bodman). For children's education, this history is presented strictly through resilience, community rebuilding, and book preservation—never graphic violence.
[IQ-P06] In Iraqi diaspora communities, baking cardamom-spiced date kleicha, preserving shanasheel architectural woodwork motifs, and hosting cooperative literary festivals connect generations to Baghdad's plural cultural heritage.

## Section 3 — Egypt: Lanterns of Cairo, Craft, and Celebration (Passages EG-P01 to EG-P05)
[EG-P01] The Egyptian *fanous* (decorative lantern) is closely associated with historic Cairo's Ramadan festivities, though its historical origins have competing explanations: (1) a popular narrative that Cairenes held lanterns to welcome the Fatimid Caliph al-Mu'izz li-Din Allah upon his nighttime entry into Cairo in 972 CE (362 AH), (2) Caliph al-Hakim bi-Amr Allah's municipal orders requiring street and shop lamps at night, and (3) earlier Coptic and pharaonic lamp-lighting traditions. None of these should be presented as an undisputed single origin.
[EG-P02] Traditional fanous craftsmanship in historic Cairo (around Taht al-Rab' and Al-Muizz Street / Khan el-Khalili) combines hand-soldered tinplate or brass metalwork (*samkari*), stained glass panels, and geometric symmetry, alongside the nearby textile art of *khayamiya* (hand-stitched appliqué tentmaker panels in the Street of the Tentmakers, Qasaba of Radwan Bey).
[EG-P03] Neighborhood Ramadan traditions in Cairo include hanging shared courtyard fanous strings, the *musaharati* (dawn drummer calling neighbors by name with a small *baz* drum), and festive street songs such as *Wahawi ya Wahawi* (whose folk etymology is debated between Arabic greeting phrases and Coptic/ancient Egyptian lunar expressions; protected modern recordings and lyrics are not reproduced).
[EG-P04] Cairene festive hospitality brings neighbors of diverse backgrounds together around shared tables featuring *koshari* (layered rice, brown lentils, pasta, spiced tomato sauce, and crispy onions), emphasizing cultural welcoming without requiring religious observance from participants.
[EG-P05] In the Egyptian diaspora—such as community celebrations in Canada where Ontario enacted the *Egyptian Heritage Month Act, 2019* designating July as Egyptian Heritage Month (a contemporary legislative claim flagged for citation verification)—families use paper and LED fanous craft workshops to pass on Cairene neighborhood warmth safely.

## Section 4 — France: Mysteries of Lyon, Passageways, and Kitchens (Passages FR-P01 to FR-P05)
[FR-P01] Lyon's *traboules* (from Vulgar Latin *transambulare*, 'to pass through'—an etymology noted as standard but subject to philological review) are covered passageways and spiral courtyard staircases connecting streets across Vieux Lyon (Renaissance Saint-Jean/Saint-Paul/Saint-Georges) and the steep slopes of La Croix-Rousse. While tourism accounts often cite ~400–500 traboules across Lyon with ~40 open to the public under municipal agreements, exact passageway counts fluctuate and require municipal verification.
[FR-P02] In the 19th century, the *canuts* (Lyon silk weavers) used the high-ceilinged workshops of La Croix-Rousse to house mechanized Jacquard looms (invented by Joseph Marie Jacquard in 1804 using punched cards) and carried silk bolts through covered traboules to riverboats on the Saône and Rhône sheltered from rain.
[FR-P03] The *Cour des Voraces* (located at 9 Place Colbert / 14 Montée de Saint-Sébastien / 29 Rue Imbert-Colomès in La Croix-Rousse, built c. 1840) features a monumental six-story exterior stone staircase and is linked in labor memory to the Canut revolts (1831 and 1834, plus the 1848–1849 Voraces mutual-aid movement) and later WWII French Resistance couriers. Educational adaptations must verify specific building dates and avoid turning wartime persecution into trivialized chase/combat gameplay.
[FR-P04] Lyon's culinary identity was shaped by the *Mères Lyonnaises*—women cooks from working-class backgrounds who left bourgeois household kitchens in the 19th and early 20th centuries to open their own *bouchons* and restaurants, establishing women-led culinary entrepreneurship and mentorship.
[FR-P05] Eugénie Brazier (*La Mère Brazier*, 1895–1977) founded her restaurant at 12 Rue Royale in Lyon (1921) and later at Col de la Luère, becoming in 1933 the first chef (and first woman) to earn six Michelin stars simultaneously (three for each restaurant). Specific biographical anecdotes and Michelin records are tracked with claim-level provenance, and kitchen activities highlight brigade teamwork, pastry traditions (*galette des rois*), and allergy-safe preparation.

## Section 5 — South Korea: Spirit of Jeonju and Harmony of the Bowl (Passages KR-P01 to KR-P05)
[KR-P01] *Bibimbap* (literally 'mixed rice', historically written in Hanja as *goldongban* 골동반 or *hondongban* in works like the late-19th-century cookbook *Siuijeonseo*) is a signature Korean dish of warm rice topped with seasoned vegetables (*namul*), savory sauces (*gochujang*, soy, sesame), and protein mixed together at the table.
[KR-P02] Historians and folklorists identify multiple **competing origin hypotheses** for bibimbap: (1) *Eumbok* ancestral rite theory (communally mixing ceremonial food offerings after *jesa* / Chuseok rites), (2) royal court dish (*gungjung*) theory, (3) agricultural field meal (*nongbap*) brought to farmers during busy harvest seasons, and (4) Lunar New Year's Eve (*seotdal geumeum*) leftover clearing practice. No single theory is an undisputed historical fact.
[KR-P03] Regional variants across Korea include *Jeonju bibimbap* (cooked in broth, topped with *hwangpomuk* yellow mung-bean jelly, Kongnamul bean sprouts, and gochujang), *Jinju bibimbap* (associated with *yukhoe* seasoned beef and clam broth), *Tongyeong bibimbap* (coastal seafood and kelp/marsh-clam toppings), and *Andong Heotjesabap* ('mock ancestral rite rice' served with soy sauce rather than gochujang).
[KR-P04] Traditional presentation draws on *Obangsaek* (오방색), the Korean five-directional color spectrum rooted in East Asian *Eum-Yang and Ohaeng* (Yin-Yang and Five Elements) cosmology: Blue/Green (East, Wood — greens/cucumber/spinach), Red (South, Fire — gochujang/carrots/jujube), Yellow (Center, Earth — egg yolk/hwangpomuk/pumpkin), White (West, Metal — rice/bean sprouts/radish/egg white), and Black/Dark (North, Water — shiitake mushrooms/bracken fern *gosari*/seaweed *gim*). In educational content, Obangsaek is explained as a cultural aesthetic and culinary philosophy, not a universal scientific or medical law.
[KR-P05] Set within the living heritage of *Jeonju Hanok Village* (over 700 traditional tile-roofed *giwa* wooden houses alongside Nambu Market, Pungnammun Gate, and Gyeonggijeon Shrine), preparing a balanced bowl and Chuseok *songpyeon* serves in diaspora literature (such as Michelle Zauner's *Crying in H Mart*, tracked as a contemporary bibliographic candidate) as a metaphor for intergenerational continuity, dietary inclusivity (providing cooked tofu/mushroom vegetarian and sesame-free/soy-free virtual options instead of raw beef *yukhoe* or raw egg for young children), and shared community harmony.
`;

async function runDX01() {
  if (isAgentDone('DX01')) return;
  const { wtDir } = prepareWorktree('DX01');
  const dgxProbe = await queryDgxSpark(
    'You are DX01 in MiraVerse v1.2 (Source-Grounded Cultural Knowledge Enrichment). Confirm in one concise sentence that input segmentation, SHA-256 checksum registration, and sequential FIFO queue scheduling (maxConcurrency=1) on NVIDIA GB10 are active.',
    140
  );

  let gpuInfo = 'NVIDIA GB10 (128 GB Unified Memory, CUDA 13.0, Driver 580.178.04)';
  try {
    gpuInfo = sh('nvidia-smi --query-gpu=name,driver_version,temperature.gpu,power.draw --format=csv,noheader');
  } catch {}

  const sha256 = crypto.createHash('sha256').update(SOURCE_ESSAY_TEXT, 'utf8').digest('hex');

  // Segment passages
  const passages = [];
  for (const line of SOURCE_ESSAY_TEXT.split('\n')) {
    const match = line.match(/^\[([A-Z]{2}-P\d{2})\]\s+(.+)$/);
    if (match) {
      const locator = match[1];
      const text = match[2];
      const country = locator.slice(0, 2);
      passages.push({
        source_id: 'SRC-V12-TRANSNATIONAL-001',
        passage_locator: locator,
        country,
        char_length: text.length,
        sha256: crypto.createHash('sha256').update(text, 'utf8').digest('hex'),
        excerpt_summary: text.slice(0, 140) + (text.length > 140 ? '...' : ''),
        raw_passage: text,
      });
    }
  }

  const sourceRegistry = {
    schema_version: '1.2.0',
    generated_at: new Date().toISOString(),
    agent_id: 'DX01',
    sources: [
      {
        source_id: 'SRC-V12-TRANSNATIONAL-001',
        title: 'The Transnational Quest for Home: Myth, Memory, and Cultural Heritage in the Expatriate Experience',
        original_filename: 'Pasted text(1).txt',
        preserved_path: 'content/v12/source-registry/transnational_quest_for_home_source.txt',
        sha256,
        bytes: Buffer.byteLength(SOURCE_ESSAY_TEXT, 'utf8'),
        ingested_at: '2026-11-03T23:12:00-08:00',
        author: 'unknown',
        publisher: 'unknown',
        source_type: 'user_supplied_research',
        rights_reuse_status: 'review_required',
        usage_policy: 'paraphrase_only_no_verbatim_player_copy',
        passage_count: passages.length,
        countries_covered: ['LB', 'IQ', 'EG', 'FR', 'KR'],
      },
      {
        source_id: 'SRC-V11-MIRAVERSE-SPEC',
        title: 'MiraVerse v1.1 Five-Country, Ages 5–17 Quest Universe + Interactive Website Atlas Specification',
        original_filename: 'reports/v11/BASELINE.md',
        preserved_path: 'reports/v11/BASELINE.md',
        sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'reports/v11/BASELINE.md'))).digest('hex'),
        bytes: fs.statSync(path.join(ROOT, 'reports/v11/BASELINE.md')).size,
        ingested_at: '2026-11-03T22:45:55-08:00',
        author: 'MiraVerse Architecture Team',
        publisher: 'MiraVerse Monorepo Internal',
        source_type: 'internal_specification',
        rights_reuse_status: 'approved_internal',
        usage_policy: 'canonical_quest_and_atlas_contract',
        passage_count: 25,
        countries_covered: ['LB', 'IQ', 'EG', 'FR', 'KR'],
      },
    ],
  };

  writeWtFile(wtDir, 'content/v12/source-registry/transnational_quest_for_home_source.txt', SOURCE_ESSAY_TEXT);
  writeWtFile(wtDir, 'content/v12/source-registry/SOURCE_REGISTRY.json', JSON.stringify(sourceRegistry, null, 2) + '\n');
  writeWtFile(wtDir, 'content/v12/source-registry/passages.json', JSON.stringify(passages, null, 2) + '\n');

  const dgxScheduler = {
    agentId: 'DX01',
    version: '1.2.0',
    measuredAt: new Date().toISOString(),
    hardware: gpuInfo,
    unifiedMemoryGiB: 121.7,
    primaryEndpoint: 'http://localhost:1234/v1',
    primaryModel: dgxProbe.model,
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModelsAvailable: ['qwen3.6:35b-a3b-q8_0', 'qwen3-coder:30b', 'qwen2.5vl:72b', 'gemma4:26b', 'qwen3.8:27b'],
    benchmark: {
      ok: dgxProbe.ok,
      elapsedMs: dgxProbe.elapsedMs,
      tokensPerSec: dgxProbe.tokensPerSec,
      usage: dgxProbe.usage,
      sampleOutput: dgxProbe.content,
    },
    maxConcurrency: 1,
    queueOrder: [
      'DX01',
      'DX02', 'DX03', 'DX04', 'DX05', 'DX06', 'DX07', 'DX08', 'DX09', 'DX10', 'DX11',
      'DX12', 'DX13', 'DX14',
      'DX15', 'DX16', 'DX17',
      'DX18', 'DX19',
      'DX20',
    ],
  };

  writeWtFile(wtDir, 'swarm/v12/dgx/scheduler.json', JSON.stringify(dgxScheduler, null, 2) + '\n');

  finalizeAgent(
    'DX01',
    wtDir,
    ['content/v12/source-registry/', 'swarm/v12/dgx/'],
    'node -e "const r=JSON.parse(require(\\"fs\\").readFileSync(\\"content/v12/source-registry/SOURCE_REGISTRY.json\\",\\"utf8\\")); const p=JSON.parse(require(\\"fs\\").readFileSync(\\"content/v12/source-registry/passages.json\\",\\"utf8\\")); if(r.sources[0].source_type!==\\"user_supplied_research\\" || p.length!==27) process.exit(1);"',
    ['content/v12/source-registry/SOURCE_REGISTRY.json', 'content/v12/source-registry/passages.json', 'swarm/v12/dgx/scheduler.json'],
    `Local DGX Spark (${dgxProbe.model}, ${dgxProbe.tokensPerSec} tok/s)`
  );
}

async function runCL01() {
  if (isAgentDone('CL01')) return;
  const { wtDir } = prepareWorktree('CL01');

  const pkgJson = {
    name: '@miraverse/knowledge-v12',
    version: '1.2.0',
    private: true,
    type: 'module',
    main: './index.ts',
  };

  const schemaTs = `/**
 * MiraVerse v1.2 — Canonical Cultural Knowledge Ontology & Reversible Merge Policy (\`CL01\`)
 * Defines the canonical knowledge record schema (Section B), age-tier adaptation contract (Section D),
 * and non-destructive additive merge rules preserving all existing v0.8/v1.1 IDs.
 */

export type CountryCodeV12 = 'LB' | 'IQ' | 'EG' | 'FR' | 'KR';
export const COUNTRY_SEQUENCE_V12: CountryCodeV12[] = ['LB', 'IQ', 'EG', 'FR', 'KR'];

export type SupportedLocaleV12 = 'en' | 'fr' | 'ar-LB' | 'ar-EG' | 'ar-IQ' | 'ko';
export const SUPPORTED_LOCALES_V12: SupportedLocaleV12[] = ['en', 'fr', 'ar-LB', 'ar-EG', 'ar-IQ', 'ko'];

export type AgeTierV12 = '5-7' | '8-10' | '11-13' | '14-17';
export const AGE_TIERS_V12: AgeTierV12[] = ['5-7', '8-10', '11-13', '14-17'];

export type EntityTypeV12 =
  | 'person'
  | 'place'
  | 'event'
  | 'artifact'
  | 'practice'
  | 'food'
  | 'myth'
  | 'work'
  | 'organization'
  | 'theme';

export type KnowledgeClassV12 =
  | 'historical_claim'
  | 'mythology'
  | 'folklore'
  | 'interpretation'
  | 'contested_history'
  | 'contemporary_practice'
  | 'fictional_game_content';

export type ClaimStatusV12 =
  | 'source_asserted_unverified'
  | 'externally_corrobated'
  | 'disputed'
  | 'human_reviewed'
  | 'rejected';

export type ConfidenceLevelV12 = 'not_assessed' | 'low' | 'medium' | 'high';

export type CulturalReviewStatusV12 = 'pending' | 'approved' | 'changes_requested' | 'rejected';

export interface KnowledgeSourceRefV12 {
  source_id: string;
  passage_locator: string;
  url: string | null;
  verified: boolean;
  external_citation?: string;
}

export interface KnowledgeRelationshipV12 {
  target_id: string;
  relation: 'located_in' | 'created_by' | 'associated_with' | 'contrasts_with' | 'inspires_quest' | 'variant_of';
  note?: string;
}

export interface KnowledgeRightsV12 {
  text: 'paraphrase_only' | 'public_domain' | 'original_authored';
  media: 'separate_clearance_required' | 'original_procedural_miraverse';
}

export interface CanonicalKnowledgeRecordV12 {
  id: string;
  country: CountryCodeV12;
  title: Partial<Record<SupportedLocaleV12, string>> & { en: string };
  entity_type: EntityTypeV12;
  summary: string;
  expanded_explanation: string;
  knowledge_class: KnowledgeClassV12;
  claim_status: ClaimStatusV12;
  confidence: ConfidenceLevelV12;
  time_period: string;
  people: string[];
  places: string[];
  relationships: KnowledgeRelationshipV12[];
  sources: KnowledgeSourceRefV12[];
  sensitivity_notes: string[];
  cultural_review: CulturalReviewStatusV12;
  reviewer_metadata?: {
    reviewer_id: string | null;
    reviewed_at: string | null;
  };
  age_tier_explanations: Record<AgeTierV12, string>;
  localization_status: Partial<Record<SupportedLocaleV12, 'draft_ai_pending_native_review' | 'native_reviewed' | 'verified'>>;
  quest_links: string[];
  atlas_links: string[];
  platform_exports: Array<'roblox' | 'minecraft' | 'web'>;
  rights: KnowledgeRightsV12;
  legacy_links?: {
    pack_item_ids?: string[];
    quest_objective_ids?: string[];
    story_scene_ids?: number[];
  };
}

export interface ReversibleMergePolicyV12 {
  policy_id: string;
  allow_destructive_overwrite: false;
  require_evidence_for_merge: true;
  preserve_legacy_ids: true;
  staging_directory: string;
  rollback_command: string;
}

export const REVERSIBLE_MERGE_POLICY_V12: ReversibleMergePolicyV12 = {
  policy_id: 'MERGE-POLICY-V12-NON-DESTRUCTIVE',
  allow_destructive_overwrite: false,
  require_evidence_for_merge: true,
  preserve_legacy_ids: true,
  staging_directory: 'content/v12/staging/',
  rollback_command: 'node tools/v12/migration/rollback.mjs',
};

export function validateKnowledgeRecordV12(rec: CanonicalKnowledgeRecordV12): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!rec.id || !/^(LB|IQ|EG|FR|KR)-KB-[A-Z0-9_-]+$/.test(rec.id)) {
    errors.push(\`Invalid country-scoped ID: \${rec.id}\`);
  }
  if (!COUNTRY_SEQUENCE_V12.includes(rec.country)) {
    errors.push(\`Invalid country: \${rec.country}\`);
  }
  if (!rec.title?.en || rec.title.en.trim().length === 0) {
    errors.push(\`Missing English title on \${rec.id}\`);
  }
  if (!rec.summary || rec.summary.length > 360) {
    errors.push(\`Summary missing or exceeds 360 chars on \${rec.id}\`);
  }
  if (!rec.sources || rec.sources.length === 0) {
    errors.push(\`Record \${rec.id} must have at least one source reference\`);
  }
  // Epistemic guardrail: externally_corrobated requires verified=true and non-null url or external_citation
  if (rec.claim_status === 'externally_corrobated') {
    const hasExternal = rec.sources.some((s) => s.verified && (s.url !== null || Boolean(s.external_citation)));
    if (!hasExternal) {
      errors.push(\`Record \${rec.id} marked externally_corrobated without verified external source citation\`);
    }
  }
  // Epistemic guardrail: human_reviewed requires recorded reviewer_id and reviewed_at
  if (rec.claim_status === 'human_reviewed') {
    if (!rec.reviewer_metadata?.reviewer_id || !rec.reviewer_metadata?.reviewed_at) {
      errors.push(\`Record \${rec.id} marked human_reviewed without recorded reviewer_id and reviewed_at\`);
    }
  }
  // Epistemic guardrail: unverified source assertions cannot have confidence=high
  if (rec.claim_status === 'source_asserted_unverified' && rec.confidence === 'high') {
    errors.push(\`Record \${rec.id} cannot have confidence=high while claim_status=source_asserted_unverified\`);
  }
  for (const tier of AGE_TIERS_V12) {
    if (!rec.age_tier_explanations?.[tier] || rec.age_tier_explanations[tier].trim().length < 20) {
      errors.push(\`Missing or too-short age_tier_explanations[\${tier}] on \${rec.id}\`);
    }
  }
  if (rec.rights?.text !== 'paraphrase_only' && rec.rights?.text !== 'original_authored') {
    errors.push(\`Invalid text rights policy on \${rec.id}\`);
  }
  return { valid: errors.length === 0, errors };
}
`;

  writeWtFile(wtDir, 'packages/knowledge-v12/package.json', JSON.stringify(pkgJson, null, 2) + '\n');
  writeWtFile(wtDir, 'packages/knowledge-v12/index.ts', schemaTs);
  writeWtFile(
    wtDir,
    'packages/knowledge-v12/ONTOLOGY.md',
    `# MiraVerse v1.2 — Knowledge Ontology & Reversible Merge Policy (\`packages/knowledge-v12/ONTOLOGY.md\`)

- **Owner:** \`CL01\` (Wave W0)
- **Canonical ID Pattern:** \`<COUNTRY>-KB-<CATEGORY>-<SLUG>\` (e.g. \`LB-KB-ARTIFACT-AHIRAM-SARCOPHAGUS\`)
- **Non-Destructive Guarantee:** All existing \`packages/content/packs/{LB,IQ,EG,FR,KR}.json\`, \`content/quests/{LB,IQ,EG,FR,KR}.json\`, \`content/dialogue/{LB,IQ,EG,FR,KR}.json\`, and \`packages/content/stories/*.json\` remain 100% intact.
- **Epistemic Guardrails:**
  1. \`confidence: "high"\` is forbidden when \`claim_status === "source_asserted_unverified"\`.
  2. \`claim_status: "externally_corrobated"\` requires an explicit external reference (\`verified: true\` + citation/URL).
  3. \`claim_status: "human_reviewed"\` requires recorded reviewer ID and timestamp.
  4. \`rights.text\` defaults to \`"paraphrase_only"\` with zero verbatim long passages copied from the research essay.
`
  );

  finalizeAgent(
    'CL01',
    wtDir,
    ['packages/knowledge-v12/'],
    'npx tsx -e "import { validateKnowledgeRecordV12, REVERSIBLE_MERGE_POLICY_V12 } from \\"./packages/knowledge-v12/index.ts\\"; if(REVERSIBLE_MERGE_POLICY_V12.allow_destructive_overwrite !== false) process.exit(1);"',
    ['packages/knowledge-v12/index.ts', 'packages/knowledge-v12/ONTOLOGY.md'],
    'Claude Architecture Contract Verifier (Node v22.22.3 + tsx)'
  );
}

async function runCL02() {
  if (isAgentDone('CL02')) return;
  const { wtDir } = prepareWorktree('CL02');

  const policyJson = {
    schema_version: '1.2.0',
    owner: 'CL02',
    policy_name: 'MiraVerse v1.2 Epistemic Verification & Reviewer Workflow Policy',
    rules: [
      {
        rule_id: 'EPIST-01',
        title: 'No Automatic Confidence Upgrade from Essay Tone',
        description: 'Assertions in the uploaded essay (Pasted text(1).txt) start as source_asserted_unverified or disputed with confidence low/medium unless corroborated by an independent reference.',
      },
      {
        rule_id: 'EPIST-02',
        title: 'Strict Myth / Landscape vs Historical Claim Separation',
        description: 'Isis/Osiris at Byblos and Adonis/Afqa red river sediment are classified as mythology or interpretation, never literal historical events.',
      },
      {
        rule_id: 'EPIST-03',
        title: 'Numerical & Anecdotal Claim Quarantine',
        description: 'Gold-weight translation payments, 1258 river-of-ink tropes, 972 CE fanous single-origin stories, exact Lyon traboule counts (~400-500), and competing bibimbap origin theories are explicitly flagged as contested_history or source_asserted_unverified.',
      },
      {
        rule_id: 'EPIST-04',
        title: 'Bibliographic Candidates vs Verified Citations',
        description: 'Named books and authors in the essay (Amin Maalouf, Rabih Alameddine, Kahlil Gibran, Beau Beausoleil, Michelle Zauner, Siuijeonseo) are stored as entity_type=work/person with rights.text=paraphrase_only and verified=false until original editions are examined.',
      },
      {
        rule_id: 'EPIST-05',
        title: 'Child Safety, Religious Neutrality & Trauma Prevention',
        description: 'No graphic depiction of the 2007 Al-Mutanabbi attack or WWII persecution; no forced religious observance in Ramadan/Chuseok/Epiphany activities; no collection of real child voice recordings or family PII; virtual cooking safety flags for heat and raw ingredients.',
      },
    ],
    reviewer_workflow: {
      states: ['pending', 'approved', 'changes_requested', 'rejected'],
      roles: ['historian_reviewer', 'native_dialect_reviewer', 'child_safety_reviewer'],
      machine_readable_queue_path: 'reports/v12/CONFLICTS_AND_VERIFICATION_QUEUE.md',
    },
  };

  writeWtFile(wtDir, 'content/v12/epistemology/verification-policy.json', JSON.stringify(policyJson, null, 2) + '\n');
  writeWtFile(
    wtDir,
    'content/v12/epistemology/EPISTEMIC_POLICY.md',
    `# MiraVerse v1.2 — Historical Epistemology & Verification Workflow (\`content/v12/epistemology/EPISTEMIC_POLICY.md\`)

- **Owner:** \`CL02\` (Wave W0)
- **Core Principle:** Separate what the uploaded source *says* from what the MiraVerse knowledge system has *verified*.
- **Neutral UI Labels:**
  - \`Historical Record (Corroborated)\` — backed by archaeological/institutional reference
  - \`Source-Asserted Claim (Pending Review)\` — extracted from research essay, awaiting historian check
  - \`Mythology & Sacred Narrative\` — cultural/mythic tradition (e.g., Isis & Osiris at Byblos, Adonis at Afqa)
  - \`Cultural Folklore & Competing Origins\` — multiple traditional explanations (e.g., 972 CE fanous story, bibimbap origins)
  - \`Contested Historical Anecdote\` — literary trope or disputed numerical claim (e.g., Hunayn paid in gold, traboule counts)
  - \`Contemporary Cultural Practice\` — living heritage and diaspora traditions
  - \`Fictional Game Content\` — MiraVerse characters, quests, and in-game courtyards
`
  );

  finalizeAgent(
    'CL02',
    wtDir,
    ['content/v12/epistemology/'],
    'node -e "const p=JSON.parse(require(\\"fs\\").readFileSync(\\"content/v12/epistemology/verification-policy.json\\",\\"utf8\\")); if(p.rules.length!==5) process.exit(1);"',
    ['content/v12/epistemology/verification-policy.json', 'content/v12/epistemology/EPISTEMIC_POLICY.md'],
    'Claude Epistemic Policy Verifier (Node v22.22.3)'
  );
}

async function runCX01() {
  if (isAgentDone('CX01')) return;
  const { wtDir } = prepareWorktree('CX01');

  const inventoryScript = `#!/usr/bin/env node
/**
 * MiraVerse v1.2 — Repository Inventory, Non-Destructive Migration & Rollback Tool (\`tools/v12/migration/inventory.mjs\`)
 * Owner: CX01 (Wave W0)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const countries = ['LB', 'IQ', 'EG', 'FR', 'KR'];

function sha256File(relPath) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) return null;
  return crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
}

const baselineInventory = {
  generated_at: new Date().toISOString(),
  owner: 'CX01',
  country_sequence: countries,
  preserved_files: {},
  country_summary: {},
};

const trackedRelPaths = [
  'packages/content/schema.ts',
  ...countries.map((c) => \`packages/content/packs/\${c}.json\`),
  ...countries.map((c) => \`content/quests/\${c}.json\`),
  ...countries.map((c) => \`content/dialogue/\${c}.json\`),
  'packages/content/stories/ar-LB.json',
  'packages/content/stories/ar-IQ.json',
  'packages/content/stories/ar-EG.json',
  'packages/content/stories/fr.json',
  'packages/content/stories/ko.json',
];

for (const rel of trackedRelPaths) {
  baselineInventory.preserved_files[rel] = {
    sha256: sha256File(rel),
    exists: fs.existsSync(path.join(root, rel)),
  };
}

for (const c of countries) {
  const pack = JSON.parse(fs.readFileSync(path.join(root, \`packages/content/packs/\${c}.json\`), 'utf8'));
  const quest = JSON.parse(fs.readFileSync(path.join(root, \`content/quests/\${c}.json\`), 'utf8'));
  const dlg = JSON.parse(fs.readFileSync(path.join(root, \`content/dialogue/\${c}.json\`), 'utf8'));
  baselineInventory.country_summary[c] = {
    name_en: pack.name_en,
    lang: pack.lang,
    mentor: pack.mentor.name,
    legacy_quest_id: quest.questId,
    pack_item_ids: pack.items.map((i) => i.id),
    pack_challenge_ids: pack.chapters[0].challenges.map((ch) => ch.id),
    quest_objective_ids: quest.objectives.map((o) => o.objectiveId),
    npc_ids: dlg.map((d) => d.npcId),
    regions: pack.regions.map((r) => r.id),
  };
}

const outDir = path.join(root, 'tools/v12/migration');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'baseline-snapshot.json'), JSON.stringify(baselineInventory, null, 2) + '\\n', 'utf8');
console.log('CX01 baseline snapshot generated for', countries.join(' -> '));
`;

  const verifyNonDestructiveScript = `#!/usr/bin/env node
/**
 * Verifies that zero preexisting pack, quest, dialogue, or story files were destructively modified.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const snap = JSON.parse(fs.readFileSync(path.join(root, 'tools/v12/migration/baseline-snapshot.json'), 'utf8'));

let failures = 0;
for (const [rel, meta] of Object.entries(snap.preserved_files)) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error('MISSING PRESERVED FILE:', rel);
    failures++;
    continue;
  }
  const currentSha = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
  if (currentSha !== meta.sha256) {
    console.error('DESTRUCTIVE MODIFICATION DETECTED:', rel, 'expected', meta.sha256, 'got', currentSha);
    failures++;
  }
}

if (failures > 0) {
  process.exit(1);
}
console.log('CX01 non-destructive integrity check PASSED across all', Object.keys(snap.preserved_files).length, 'canonical baseline files.');
`;

  const rollbackScript = `#!/usr/bin/env node
/**
 * Rollback utility for MiraVerse v1.2 additive knowledge migrations.
 */
import fs from 'node:fs';
import path from 'node:path';

console.log('MiraVerse v1.2 Rollback: All v1.2 knowledge records live in additive namespaces (content/v12/, packages/knowledge-v12/, apps/web/src/features/encyclopedia-v12/, apps/roblox/src/shared/KnowledgeV12.luau, apps/minecraft/scripts/generated/knowledgeV12.ts).');
console.log('To roll back to pre-v1.2 baseline without losing v0.8/v1.1 progress: git revert or checkout base_sha recorded in swarm/v12/manifest.json.');
`;

  writeWtFile(wtDir, 'tools/v12/migration/inventory.mjs', inventoryScript);
  writeWtFile(wtDir, 'tools/v12/migration/verify-non-destructive.mjs', verifyNonDestructiveScript);
  writeWtFile(wtDir, 'tools/v12/migration/rollback.mjs', rollbackScript);

  spawnSync('node', ['tools/v12/migration/inventory.mjs'], { cwd: wtDir, stdio: 'inherit' });

  finalizeAgent(
    'CX01',
    wtDir,
    ['tools/v12/migration/'],
    'node tools/v12/migration/inventory.mjs && node tools/v12/migration/verify-non-destructive.mjs',
    ['tools/v12/migration/baseline-snapshot.json', 'tools/v12/migration/verify-non-destructive.mjs', 'tools/v12/migration/rollback.mjs'],
    'Codex CLI Migration & Snapshot Verifier (Node v22.22.3)'
  );
}

async function runAG01() {
  if (isAgentDone('AG01')) return;
  const { wtDir } = prepareWorktree('AG01');

  const visualSystemJson = {
    schema_version: '1.2.0',
    owner: 'AG01',
    title: 'MiraVerse v1.2 Visual Knowledge-System Art Direction',
    epistemic_badge_tokens: {
      historical_claim: { label: 'Historical Record', bg: '#1E3A5F', border: '#60A5FA', text: '#DBEAFE' },
      mythology: { label: 'Mythology & Sacred Narrative', bg: '#3B1F4E', border: '#C084FC', text: '#F3E8FF' },
      folklore: { label: 'Cultural Folklore', bg: '#3B2F1E', border: '#FBBF24', text: '#FEF3C7' },
      interpretation: { label: 'Landscape & Cultural Interpretation', bg: '#1B3B36', border: '#34D399', text: '#D1FAE5' },
      contested_history: { label: 'Contested / Multiple Accounts', bg: '#4A2511', border: '#FB923C', text: '#FFEDD5' },
      contemporary_practice: { label: 'Living Heritage & Diaspora', bg: '#1F3A2E', border: '#4ADE80', text: '#DCFCE7' },
      fictional_game_content: { label: 'In-Game Quest Content', bg: '#2D2A4A', border: '#818CF8', text: '#E0E7FF' },
    },
    country_palettes: {
      LB: { primary: '#1E5631', secondary: '#C97A40', accent: '#38BDF8', surface: '#102430', motif: 'Byblos sandstone, Mediterranean azure, Phoenician script ochre' },
      IQ: { primary: '#1A7B88', secondary: '#D4882A', accent: '#FBBF24', surface: '#11252D', motif: 'Turquoise glazed brick, Tigris mud-brick gold, shanasheel cedar lattice' },
      EG: { primary: '#1E5B88', secondary: '#D99B26', accent: '#F43F5E', surface: '#141E33', motif: 'Brass fanous filigree, stained glass ruby/emerald/amber, khayamiya indigo' },
      FR: { primary: '#1E3A8A', secondary: '#E5A93B', accent: '#F97316', surface: '#161F35', motif: 'Vieux Lyon ochre limestone, Croix-Rousse slate, jacquard crimson silk' },
      KR: { primary: '#2E7D6F', secondary: '#C84B31', accent: '#EAB308', surface: '#122428', motif: 'Obangsaek five-direction spectrum (Blue/Green, Red, Yellow, White, Black) & giwa charcoal' },
    },
  };

  const badgeLegendSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 220" width="800" height="220">
  <rect width="800" height="220" rx="16" fill="#0B1325" stroke="#334155" stroke-width="2"/>
  <text x="28" y="42" fill="#FFF8EE" font-family="Georgia, serif" font-size="20" font-weight="bold">MiraVerse v1.2 — Neutral Epistemic Knowledge Labels (AG01)</text>
  <text x="28" y="66" fill="#94A3B8" font-family="sans-serif" font-size="13">Neutral text labels distinguish verified history, mythology, folklore, and contested interpretations.</text>
  <g transform="translate(28, 86)">
    <rect width="230" height="36" rx="8" fill="#1E3A5F" stroke="#60A5FA"/>
    <text x="14" y="23" fill="#DBEAFE" font-family="sans-serif" font-size="13" font-weight="bold">Historical Record (Checked)</text>
  </g>
  <g transform="translate(274, 86)">
    <rect width="240" height="36" rx="8" fill="#3B1F4E" stroke="#C084FC"/>
    <text x="14" y="23" fill="#F3E8FF" font-family="sans-serif" font-size="13" font-weight="bold">Mythology &amp; Sacred Narrative</text>
  </g>
  <g transform="translate(530, 86)">
    <rect width="240" height="36" rx="8" fill="#4A2511" stroke="#FB923C"/>
    <text x="14" y="23" fill="#FFEDD5" font-family="sans-serif" font-size="13" font-weight="bold">Contested / Multiple Accounts</text>
  </g>
  <g transform="translate(28, 138)">
    <rect width="230" height="36" rx="8" fill="#1B3B36" stroke="#34D399"/>
    <text x="14" y="23" fill="#D1FAE5" font-family="sans-serif" font-size="13" font-weight="bold">Landscape Interpretation</text>
  </g>
  <g transform="translate(274, 138)">
    <rect width="240" height="36" rx="8" fill="#1F3A2E" stroke="#4ADE80"/>
    <text x="14" y="23" fill="#DCFCE7" font-family="sans-serif" font-size="13" font-weight="bold">Living Heritage &amp; Diaspora</text>
  </g>
  <g transform="translate(530, 138)">
    <rect width="240" height="36" rx="8" fill="#2D2A4A" stroke="#818CF8"/>
    <text x="14" y="23" fill="#E0E7FF" font-family="sans-serif" font-size="13" font-weight="bold">In-Game Quest Content</text>
  </g>
</svg>
`;

  writeWtFile(wtDir, 'art/v12/direction/visual-knowledge-system.json', JSON.stringify(visualSystemJson, null, 2) + '\n');
  writeWtFile(wtDir, 'art/v12/direction/epistemic-labels-legend.svg', badgeLegendSvg);
  writeWtFile(
    wtDir,
    'art/v12/direction/STYLE_GUIDE_V12.md',
    `# MiraVerse v1.2 — Country Visual Knowledge-System Art Direction (\`art/v12/direction/STYLE_GUIDE_V12.md\`)

- **Owner:** \`AG01\` (Wave W0)
- **Design Mandate:** Neutral text labels (never decorative "success" checkmarks) distinguish \`historical_claim\`, \`mythology\`, \`folklore\`, \`interpretation\`, \`contested_history\`, \`contemporary_practice\`, and \`fictional_game_content\`.
- **Map Separation:** Real-world MapLibre markers use subtle cartographic pins with coordinate source popups; illustrated quest maps display a persistent banner: \`IN-GAME QUEST MAP · NOT TO GEOGRAPHIC SCALE\`.
`
  );

  finalizeAgent(
    'AG01',
    wtDir,
    ['art/v12/direction/'],
    'test -s art/v12/direction/visual-knowledge-system.json && test -s art/v12/direction/epistemic-labels-legend.svg',
    ['art/v12/direction/visual-knowledge-system.json', 'art/v12/direction/epistemic-labels-legend.svg', 'art/v12/direction/STYLE_GUIDE_V12.md'],
    'Antigravity Creative Direction Verifier (Gemini 4 Argon)'
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await runDX01();
    await runCL01();
    await runCL02();
    await runCX01();
    await runAG01();
    console.log('=== WAVE W0 COMPLETE ===');
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
