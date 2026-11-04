# MiraVerse v1.0 Minecraft Bedrock — Five-Country Quest Parity Matrix (`QUEST_PARITY.md`)

Every country chapter implements the deterministic 5-part physical quest chain (`Gather -> Trade -> Cook -> Build -> Word`) plus idempotent Passport stamp issuance (`MV-<CC>1-<NONCE>-<TAG>`) and 50 world-local Mira Tokens.

| Country | 1. Gather (2 Physical Nodes) | 2. Trade (Atomic Market Stall) | 3. Cook (3 Ordered Steps w/ Elder Supervision) | 4. Build (3-Stage Physical Block Restoration) | 5. Word (3 World Objects) | Stamp Prefix | Automated Test Status |
|---|---|---|---|---|---|---|---|
| **LB** | `miraverse:lb_zaatar`, `miraverse:lb_flour` | Trade Za'atar -> `miraverse:lb_olive_oil` | Bake `miraverse:lb_manoushe` on `lb_saj_hearth_block` | Restore with `miraverse:lb_limestone_block` (0→1→2) | `صاج` (ṣāj), `زعتر` (za'tar), `بحر` (baḥr) | `MV-LB1-` | **PASS** |
| **EG** | `miraverse:eg_lentils`, `miraverse:eg_rice` | Trade Lentils -> `miraverse:eg_tomato_sauce` | Simmer `miraverse:eg_koshari` on `eg_koshari_cauldron_block` | Restore with `miraverse:eg_fanous_lantern` (0→1→2) | `فانوس` (fānūs), `كشري` (kusharī), `نيل` (nīl) | `MV-EG1-` | **PASS** |
| **IQ** | `miraverse:iq_date_paste`, `miraverse:iq_wheat_dough` | Trade Date Paste -> `miraverse:iq_cardamom` | Bake `miraverse:iq_kleicha` in `iq_kleicha_brick_oven` | Restore with `miraverse:iq_palm_wood` (0→1→2) | `شناشيل` (shanāshīl), `كليجة` (klīcha), `دجلة` (dijla) | `MV-IQ1-` | **PASS** |
| **KR** | `miraverse:kr_rice_flour`, `miraverse:kr_pine_needles` | Trade Rice Flour -> `miraverse:kr_sesame_honey` | Steam `miraverse:kr_songpyeon` on `kr_songpyeon_steamer_block` | Restore with `miraverse:kr_giwa_tile` (0→1→2) | `한옥` (hanok), `송편` (songpyeon), `할머니` (halmeoni) | `MV-KR1-` | **PASS** |
| **FR** | `miraverse:fr_puff_pastry`, `miraverse:fr_porcelain_feve` | Trade Pastry -> `miraverse:fr_almond_cream` | Bake `miraverse:fr_galette_des_rois` in `fr_boulangerie_wood_oven` | Restore with `miraverse:fr_cut_stone` (0→1→2) | `boulangerie`, `galette`, `traboule` | `MV-FR1-` | **PASS** |
