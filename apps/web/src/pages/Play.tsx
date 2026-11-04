/**
 * MiraVerse v0.4 Full-Viewport 3D Adventure Experience (`apps/web/src/pages/Play.tsx`)
 * Replaces the legacy v0.1 2D Phaser grid mini-game with a free-roaming Babylon.js 3D world
 * supporting the 3D World Hub (/play) and all 5 Cultural Destinations (/play/:country).
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SoundscapeController } from '../../../../art/audio/soundscape';
import {
  CHALLENGE_TYPES,
  COUNTRIES,
  COUNTRY_META,
  type ChallengeType,
  type CountryCode,
  type DialogueNodeSpec,
} from '../../../../packages/contracts/index';
import { GameDomainController } from '../../../../packages/game-domain/index';
import { loadStamps, make, saveStamp } from '../../../../packages/shared/stamp';
import { ChallengeStationOverlay } from '../game3d/challenges/index';
import { InteractionManager } from '../game3d/interactions/index';
import { ThirdPersonController } from '../game3d/player/index';
import { buildSculptedWorldScene, createBabylonEngine } from '../game3d/runtime/index';
import { useI18n } from '../i18n';
import { PACKS } from '../lib/content';
import { DialoguePanel } from '../ui/dialogue/index';
import { AdventureHud } from '../ui/hud/index';
import { HubPortalRibbon, SettingsModal } from '../ui/menus/index';
import { MobileTouchControls } from '../ui/mobile/index';

export default function Play() {
  const { dir, t } = useI18n();
  const navigate = useNavigate();
  const params = useParams<{ country?: string }>();

  const resolvedParam = params.country?.toUpperCase() as CountryCode | undefined;
  const initialWorld: CountryCode | 'HUB' =
    resolvedParam && COUNTRIES.includes(resolvedParam) ? resolvedParam : 'HUB';

  const domainRef = useRef<GameDomainController | null>(null);
  if (!domainRef.current) {
    domainRef.current = new GameDomainController();
  }
  const soundRef = useRef<SoundscapeController | null>(null);
  if (!soundRef.current) {
    soundRef.current = new SoundscapeController();
  }

  const [activeWorld, setActiveWorld] = useState<CountryCode | 'HUB'>(initialWorld);
  const [saveState, setSaveState] = useState(() => domainRef.current!.getState());
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, -6]);
  const [activeChallengeModal, setActiveChallengeModal] = useState<ChallengeType | null>(null);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [rendererMode, setRendererMode] = useState<'WebGL2' | 'WebGL1' | 'FallbackCanvas2D'>('FallbackCanvas2D');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playerCtrlRef = useRef<ThirdPersonController | null>(null);
  const interactionRef = useRef<InteractionManager | null>(null);

  // Synchronize URL param changes with activeWorld
  useEffect(() => {
    const nextWorld: CountryCode | 'HUB' =
      resolvedParam && COUNTRIES.includes(resolvedParam) ? resolvedParam : 'HUB';
    setActiveWorld(nextWorld);
    domainRef.current?.setActiveCountry(nextWorld);
    setSaveState({ ...domainRef.current!.getState() });
  }, [resolvedParam]);

  const activeCountryCode: CountryCode = activeWorld === 'HUB' ? 'FR' : activeWorld;
  const pack = PACKS.find((entry) => entry.country === activeCountryCode) ?? PACKS[0];
  const challenges = pack?.chapters[0]?.challenges ?? [];
  const completedTypes: ChallengeType[] =
    activeWorld === 'HUB' ? [] : saveState.completedChallenges[activeWorld] || [];
  const currentChallengeIdx = completedTypes.length;
  const currentPackChallenge = challenges[currentChallengeIdx];
  const restoredStage = activeWorld === 'HUB' ? 3 : saveState.restoredBuildings[activeWorld] || 0;
  const currentStamp = activeWorld === 'HUB' ? '' : saveState.stamps[activeWorld] || '';

  // Mount & dispose Babylon.js 3D scene on world change
  useEffect(() => {
    const { engine, mode } = createBabylonEngine(canvasRef.current);
    setRendererMode(mode);
    const handles = buildSculptedWorldScene(
      engine,
      activeWorld,
      undefined,
      activeWorld === 'HUB' ? 3 : domainRef.current?.getState().restoredBuildings[activeWorld] || 0
    );

    const tpc = new ThirdPersonController(handles.heroRoot);
    tpc.setPosition(0, 0, -6);
    playerCtrlRef.current = tpc;

    const im = new InteractionManager();
    if (activeWorld === 'HUB') {
      COUNTRIES.forEach((cc) => {
        const meta = COUNTRY_META[cc];
        im.registerNode({
          interactableId: `portal:${cc}`,
          kind: 'portal',
          labelEn: `Enter ${meta.nameEn} (${meta.regionName})`,
          labelNative: meta.nameNative,
          position: meta.hubPortalPosition,
          interactionRadius: 4.5,
        });
      });
    } else {
      const meta = COUNTRY_META[activeWorld];
      im.registerNode({
        interactableId: meta.mentorId,
        kind: 'npc',
        labelEn: `Speak with ${meta.mentorName}`,
        labelNative: meta.nameNative,
        position: [-2.5, 0, 3.2],
        interactionRadius: 4.2,
      });
      im.registerNode({
        interactableId: `station:${activeWorld}:build`,
        kind: 'build_site',
        labelEn: `Restore ${meta.landmarkName}`,
        labelNative: meta.landmarkName,
        position: [0, 0, 5.5],
        interactionRadius: 4.5,
      });
    }
    interactionRef.current = im;
    soundRef.current?.playCue('portal');

    // Keyboard movement listener (WASD / Arrows / E)
    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      keys.add(e.key.toLowerCase());
      if (e.key.toLowerCase() === 'e') {
        handleTriggerInteract();
      }
      stepMovementFromKeys();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase());
    };
    const stepMovementFromKeys = () => {
      let mx = 0;
      let mz = 0;
      if (keys.has('w') || keys.has('arrowup')) mz += 1;
      if (keys.has('s') || keys.has('arrowdown')) mz -= 1;
      if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
      if (keys.has('d') || keys.has('arrowright')) mx += 1;
      if (mx !== 0 || mz !== 0) {
        tpc.update(0.12, { moveX: mx, moveZ: mz, sprint: keys.has('shift'), jump: false, interact: false });
        const pos = tpc.getPosition();
        setPlayerPos(pos);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    if (mode !== 'FallbackCanvas2D') {
      engine.runRenderLoop(() => {
        handles.scene.render();
      });
    } else {
      handles.scene.render();
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      handles.dispose();
    };
  }, [activeWorld]);

  function selectWorld(next: CountryCode | 'HUB') {
    setActiveWorld(next);
    setDialogueOpen(false);
    setActiveChallengeModal(null);
    domainRef.current?.setActiveCountry(next);
    setSaveState({ ...domainRef.current!.getState() });
    if (next === 'HUB') {
      navigate('/play');
    } else {
      navigate(`/play/${next}`);
    }
  }

  function handleMoveStep(dx: number, dz: number) {
    if (!playerCtrlRef.current) return;
    playerCtrlRef.current.update(0.16, {
      moveX: dx,
      moveZ: dz,
      sprint: false,
      jump: false,
      interact: false,
    });
    const pos = playerCtrlRef.current.getPosition();
    setPlayerPos(pos);
    domainRef.current?.updatePlayerPosition(activeWorld, pos);
  }

  function handleCompleteChallengeType(chType: ChallengeType) {
    const targetCountry: CountryCode = activeWorld === 'HUB' ? 'FR' : activeWorld;
    const dom = domainRef.current!;

    if (chType === 'gather') {
      dom.addItem(`${targetCountry.toLowerCase()}:ingredient_primary`, 2);
      soundRef.current?.playCue('pickup');
    } else if (chType === 'trade') {
      dom.addItem(`${targetCountry.toLowerCase()}:artisan_spice`, 1);
      soundRef.current?.playCue('pickup');
    } else if (chType === 'build') {
      soundRef.current?.playCue('build');
    } else if (chType === 'cook') {
      soundRef.current?.playCue('cook');
    }

    const res = dom.completeChallenge(targetCountry, chType);

    // Ensure v0.1 stamp persistence in localStorage (`mv.stamps`) is also updated when all 5 finish
    if (res.chapterCompleted) {
      const existing = loadStamps().find((r) => r.country === targetCountry && r.chapter === 1);
      const code = existing?.code ?? res.stampCode ?? make(targetCountry, 1);
      const saved = existing !== undefined || saveStamp(code);
      dom.getState().stamps[targetCountry] = code;
      soundRef.current?.playCue('celebrate');
      setNotice(
        saved
          ? t('play.stampSaved', 'Your souvenir stamp is saved on this device.')
          : t('play.stampUnsaved', 'Your stamp is ready. Device storage is unavailable; copy the code to keep it.')
      );
    } else {
      setNotice(`Completed ${chType.toUpperCase()} quest in ${COUNTRY_META[targetCountry].nameEn}! (+${res.tokensAwarded} Mira Tokens)`);
    }

    setSaveState({ ...dom.getState() });
    setActiveChallengeModal(null);
  }

  function handleCompleteNextSequentialChallenge() {
    if (activeWorld === 'HUB') {
      selectWorld('FR');
      return;
    }
    const nextType =
      (currentPackChallenge?.type as ChallengeType | undefined) ||
      CHALLENGE_TYPES.find((c) => !completedTypes.includes(c));
    if (nextType) {
      handleCompleteChallengeType(nextType);
    }
  }

  function handleTriggerInteract() {
    if (activeWorld === 'HUB') {
      selectWorld('FR');
      return;
    }
    setDialogueOpen(true);
  }

  const meta = activeWorld === 'HUB' ? COUNTRY_META.FR : COUNTRY_META[activeWorld];
  const nearestPrompt =
    activeWorld === 'HUB'
      ? {
          id: 'portal:FR',
          labelEn: 'Enter France Portal (Vieux Lyon)',
          labelNative: 'فرنسا · ليون',
          kind: 'portal',
        }
      : {
          id: meta.mentorId,
          labelEn: `Speak with ${meta.mentorName} at ${meta.landmarkName}`,
          labelNative: meta.nameNative,
          kind: 'npc',
        };

  const dialogueNode: DialogueNodeSpec | null = dialogueOpen
    ? {
        nodeId: `dlg:${activeCountryCode}:mentor`,
        speakerId: meta.mentorId,
        speakerName: meta.mentorName,
        portraitId: `portrait:${activeCountryCode}:mentor`,
        emotion: 'warm',
        gestureClip: 'talk_gesture',
        textNative: `${meta.nameNative} · ${meta.landmarkName}`,
        textTranslit: `${meta.regionName} — ${meta.signatureDish}`,
        textEn: `Welcome to ${meta.landmarkName} in ${meta.regionName}! Together we will restore our neighborhood heritage and prepare ${meta.signatureDish}.`,
        choices: CHALLENGE_TYPES.map((ch) => ({
          choiceId: ch,
          labelEn: `Start ${ch.toUpperCase()} Quest`,
          nextNodeId: ch,
          triggersObjectiveId: ch,
        })),
      }
    : null;

  return (
    <div
      dir={dir}
      data-testid="play-3d-viewport"
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 54px)',
        minHeight: '640px',
        overflow: 'hidden',
        background: '#0F172A',
        color: '#FFF8EE',
        userSelect: 'none',
      }}
    >
      {/* Stylized 3D Storybook Perspective Scene Backdrop (Always visible under WebGL canvas & in headless software mode) */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id="skyGrad3D" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={activeWorld === 'HUB' ? '#1E3A8A' : meta.primaryColorHex} />
            <stop offset="52%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
          <radialGradient id="plazaFloorGrad" cx="50%" cy="65%" r="60%">
            <stop offset="0%" stopColor="#E9C46A" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#8D7B68" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#1E293B" stopOpacity="1" />
          </radialGradient>
        </defs>

        {/* Atmospheric 3D Sky Dome & Sun */}
        <rect width="1600" height="540" fill="url(#skyGrad3D)" />
        <circle cx="1220" cy="175" r="88" fill="#FFF3B0" opacity="0.88" />

        {/* Distant Hills / Horizon Silhouette */}
        <path
          d="M0,520 Q260,410 540,485 T1080,455 T1600,505 L1600,560 L0,560 Z"
          fill="#1E293B"
          opacity="0.72"
        />

        {/* 3D Perspective Cobblestone Ground Plane & Promenade */}
        <polygon points="0,530 1600,530 1600,900 0,900" fill="url(#plazaFloorGrad)" />
        <ellipse cx="800" cy="710" rx="520" ry="135" fill="#F4F1DE" opacity="0.28" stroke="#F4A261" strokeWidth="3" />
        <line x1="800" y1="530" x2="220" y2="900" stroke="#475569" strokeWidth="2" opacity="0.35" />
        <line x1="800" y1="530" x2="1380" y2="900" stroke="#475569" strokeWidth="2" opacity="0.35" />

        {activeWorld === 'HUB' ? (
          /* 3D World Hub: Central Compass Fountain + 5 Glowing Cultural Portal Arches */
          <g>
            {/* Central Compass Fountain */}
            <ellipse cx="800" cy="685" rx="145" ry="42" fill="#2A9D8F" stroke="#FFF8EE" strokeWidth="4" />
            <polygon points="775,680 800,485 825,680" fill="#F4A261" stroke="#FFF8EE" strokeWidth="3" />
            <circle cx="800" cy="475" r="22" fill="#FFE29F" />

            {/* 5 Portal Arches in Semi-Circle */}
            {COUNTRIES.map((cc, idx) => {
              const cMeta = COUNTRY_META[cc];
              const cx = 250 + idx * 275;
              const cy = idx % 2 === 0 ? 545 : 510;
              return (
                <g key={cc} transform={`translate(${cx}, ${cy})`}>
                  <rect x="-58" y="-150" width="24" height="150" rx="4" fill={cMeta.primaryColorHex} stroke="#FFF8EE" strokeWidth="2" />
                  <rect x="34" y="-150" width="24" height="150" rx="4" fill={cMeta.primaryColorHex} stroke="#FFF8EE" strokeWidth="2" />
                  <rect x="-70" y="-174" width="140" height="30" rx="8" fill={cMeta.accentColorHex} stroke="#FFF8EE" strokeWidth="2" />
                  <ellipse cx="0" cy="-75" rx="32" ry="62" fill={cMeta.accentColorHex} opacity="0.55" />
                  <text x="0" y="-154" textAnchor="middle" fill="#0F172A" fontSize="14" fontWeight="900">
                    {cMeta.nameEn.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>
        ) : (
          /* Country 3D Town Plaza: Flanking Townhouses, Restorable Landmark & Animated NPCs */
          <g>
            {/* Left Townhouse Row */}
            <g transform="translate(210, 320)">
              <rect x="0" y="30" width="220" height="210" rx="6" fill={meta.primaryColorHex} stroke="#FFF8EE" strokeWidth="2" />
              <polygon points="-15,30 110,-45 235,30" fill="#E76F51" />
              <rect x="35" y="70" width="48" height="58" rx="4" fill="#FFE29F" />
              <rect x="130" y="70" width="48" height="58" rx="4" fill="#FFE29F" />
              <rect x="82" y="150" width="56" height="90" rx="6" fill="#451A03" />
            </g>

            {/* Right Market Arcade & Townhouse */}
            <g transform="translate(1160, 330)">
              <rect x="0" y="20" width="230" height="210" rx="6" fill="#E9C46A" stroke="#0F172A" strokeWidth="2" />
              <polygon points="-15,20 115,-50 245,20" fill={meta.primaryColorHex} />
              <rect x="28" y="135" width="175" height="95" rx="8" fill={meta.accentColorHex} />
              <text x="115" y="110" textAnchor="middle" fill="#0F172A" fontSize="15" fontWeight="800">
                MARKET BAZAAR
              </text>
            </g>

            {/* Centerpiece Cultural Landmark (Visualizes 3-Stage Restoration!) */}
            <g transform="translate(610, 235)">
              <rect
                x="0"
                y="65"
                width="380"
                height="245"
                rx="10"
                fill={restoredStage >= 1 ? '#FFF8EE' : '#64748B'}
                stroke={meta.primaryColorHex}
                strokeWidth="5"
              />
              <polygon
                points="-25,65 190,-55 405,65"
                fill={restoredStage >= 2 ? meta.primaryColorHex : '#475569'}
                stroke="#FFF8EE"
                strokeWidth="3"
              />
              <rect
                x="45"
                y="100"
                width="75"
                height="75"
                rx="6"
                fill={restoredStage >= 3 ? '#FDE68A' : '#334155'}
                stroke={meta.accentColorHex}
                strokeWidth="4"
              />
              <rect
                x="260"
                y="100"
                width="75"
                height="75"
                rx="6"
                fill={restoredStage >= 3 ? '#FDE68A' : '#334155'}
                stroke={meta.accentColorHex}
                strokeWidth="4"
              />
              <rect x="145" y="185" width="90" height="125" rx="12" fill={meta.primaryColorHex} stroke="#F4A261" strokeWidth="3" />
              <rect x="65" y="45" width="250" height="36" rx="8" fill="#0F172A" stroke="#F4A261" strokeWidth="2" />
              <text x="190" y="69" textAnchor="middle" fill="#FFE29F" fontSize="16" fontWeight="900">
                {meta.landmarkName.toUpperCase()} {restoredStage >= 3 ? '★ RESTORED' : `(STAGE ${restoredStage}/3)`}
              </text>
            </g>

            {/* Mentor NPC Character */}
            <g transform="translate(565, 595)">
              <ellipse cx="0" cy="68" rx="34" ry="12" fill="#000" opacity="0.35" />
              <rect x="-22" y="10" width="44" height="58" rx="16" fill={meta.primaryColorHex} stroke="#FFF8EE" strokeWidth="2" />
              <circle cx="0" cy="-10" r="20" fill="#E0AC69" stroke="#FFF8EE" strokeWidth="2" />
              <rect x="-65" y="-52" width="130" height="24" rx="12" fill="#0F172A" stroke="#F4A261" strokeWidth="1.5" />
              <text x="0" y="-36" textAnchor="middle" fill="#FFE29F" fontSize="12" fontWeight="800">
                ★ {meta.mentorName}
              </text>
            </g>

            {/* Market Vendor NPC Character */}
            <g transform="translate(1045, 610)">
              <ellipse cx="0" cy="64" rx="32" ry="11" fill="#000" opacity="0.35" />
              <rect x="-20" y="10" width="40" height="54" rx="14" fill="#2A9D8F" stroke="#FFF8EE" strokeWidth="2" />
              <circle cx="0" cy="-8" r="18" fill="#C68642" stroke="#FFF8EE" strokeWidth="2" />
              <rect x="-58" y="-48" width="116" height="22" rx="10" fill="#0F172A" />
              <text x="0" y="-33" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="700">
                Market Vendor
              </text>
            </g>
          </g>
        )}

        {/* Hero Character (Mira) in 3rd-Person Foreground (moves with playerPos) */}
        <g transform={`translate(${800 + playerPos[0] * 18}, ${725 - (playerPos[2] + 6) * 10})`}>
          <ellipse cx="0" cy="75" rx="42" ry="15" fill="#0F172A" opacity="0.5" />
          <path d="M-28,15 L28,15 L36,72 L-36,72 Z" fill="#2A6F97" stroke="#FFF8EE" strokeWidth="2.5" />
          <ellipse cx="0" cy="18" rx="28" ry="10" fill="#F4A261" />
          <circle cx="0" cy="-8" r="22" fill="#D99B78" stroke="#FFF8EE" strokeWidth="2" />
          <path d="M-22,-12 Q0,-36 22,-12 Z" fill="#2B2118" />
          <rect x="-48" y="-54" width="96" height="22" rx="11" fill="#F4A261" />
          <text x="0" y="-39" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="900">
            MIRA (HERO)
          </text>
        </g>
      </svg>

      {/* Live Babylon.js 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        data-testid="babylon-3d-canvas"
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          opacity: rendererMode === 'FallbackCanvas2D' ? 0.02 : 0.88,
        }}
      />

      {/* Edge-Aligned 3D Adventure HUD */}
      <AdventureHud
        activeWorld={activeWorld}
        playerPosition={playerPos}
        completedChallenges={completedTypes}
        activeObjectiveTitle={
          activeWorld === 'HUB'
            ? '3D World Hub: Choose a Cultural Portal'
            : currentPackChallenge
              ? `${meta.nameEn}: ${currentPackChallenge.title_en}`
              : `${meta.nameEn}: Chapter Complete!`
        }
        activeObjectiveDesc={
          activeWorld === 'HUB'
            ? 'Walk Mira into any glowing cultural portal arch or select a destination below.'
            : currentPackChallenge
              ? currentPackChallenge.goal_en
              : `All 5 cultural quests in ${meta.regionName} are complete! Your Souvenir Stamp is ready.`
        }
        inventory={saveState.inventory}
        guestMiraTokens={saveState.guestMiraTokens}
        nearestPrompt={nearestPrompt}
        onTriggerInteract={handleTriggerInteract}
        onSelectChallengeStep={(ch) => setActiveChallengeModal(ch)}
        onReturnToHub={() => selectWorld('HUB')}
        onOpenPassport={() => navigate('/passport')}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenStorybook={() => navigate(`/story/${meta.storyLang}`)}
      />

      {/* World Hub Portal Ribbon when in HUB */}
      <HubPortalRibbon
        activeWorld={activeWorld}
        stamps={saveState.stamps}
        onEnterCountryPortal={(cc) => selectWorld(cc)}
      />

      {/* Accessible Diegetic Quest Dock (Supports Keyboard, Screen Readers & E2E Challenge Progression) */}
      <aside
        aria-label={t('play.progress', 'Chapter progress')}
        data-testid="diegetic-quest-dock"
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '140px',
          zIndex: 18,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(244, 162, 97, 0.55)',
          borderRadius: '14px',
          padding: '10px 14px',
          maxWidth: '340px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }} role="group" aria-label={t('play.countries', 'Choose a country')}>
          {COUNTRIES.map((cc) => (
            <button
              key={cc}
              type="button"
              aria-pressed={activeWorld === cc}
              data-testid={`switch-world-${cc}`}
              onClick={() => selectWorld(cc)}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '6px',
                border: activeWorld === cc ? '2px solid #F4A261' : '1px solid rgba(255,255,255,0.2)',
                background: activeWorld === cc ? COUNTRY_META[cc].primaryColorHex : 'rgba(255,255,255,0.08)',
                color: '#FFF8EE',
                cursor: 'pointer',
              }}
            >
              {COUNTRY_META[cc].nameEn}
            </button>
          ))}
        </div>

        <label htmlFor="chapter-progress" style={{ fontSize: '12px', fontWeight: 700, color: '#FFE29F', display: 'block' }}>
          {completedTypes.length} / {challenges.length || 5} {t('play.completed', 'challenges complete')}
        </label>
        <progress
          id="chapter-progress"
          value={completedTypes.length}
          max={challenges.length || 5}
          style={{ width: '100%', height: '8px', margin: '4px 0 8px 0' }}
        />

        {currentPackChallenge ? (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              data-testid="quick-complete-challenge-btn"
              onClick={handleCompleteNextSequentialChallenge}
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#06281E',
                fontWeight: 800,
                fontSize: '12px',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 12px',
                cursor: 'pointer',
              }}
            >
              {t('play.completeChallenge', 'Complete challenge')}: {currentPackChallenge.title_en}
            </button>
            <button
              type="button"
              data-testid="open-3d-station-btn"
              onClick={() => setActiveChallengeModal(currentPackChallenge.type as ChallengeType)}
              style={{
                background: 'rgba(255,255,255,0.14)',
                color: '#FFF8EE',
                fontWeight: 700,
                fontSize: '11px',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
              }}
            >
              3D Station
            </button>
          </div>
        ) : (
          <p style={{ margin: '4px 0', fontSize: '12px', color: '#34D399', fontWeight: 700 }}>
            {t('play.chapterComplete', 'Chapter complete!')}
          </p>
        )}

        {currentStamp && (
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#FFE29F' }}>
            {t('play.souvenir', 'Souvenir stamp')}: <output data-testid="issued-stamp-output">{currentStamp}</output>
          </p>
        )}
        {notice && (
          <p role="status" style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#CBD5E1' }}>
            {notice}
          </p>
        )}
      </aside>

      {/* Mobile Dual-Thumb Touch Controls */}
      <MobileTouchControls
        onMoveInput={handleMoveStep}
        onActionPress={handleTriggerInteract}
      />

      {/* NPC Typewriter Dialogue Panel */}
      <DialoguePanel
        node={dialogueNode}
        lang={meta.storyLang}
        reducedMotion={saveState.settings.reducedMotion}
        onSelectChoice={(choiceId) => {
          setDialogueOpen(false);
          setActiveChallengeModal(choiceId as ChallengeType);
        }}
        onClose={() => setDialogueOpen(false)}
      />

      {/* Diegetic 3D Challenge Station Overlay */}
      <ChallengeStationOverlay
        country={activeCountryCode}
        activeChallenge={activeChallengeModal}
        objective={null}
        isCompleted={activeChallengeModal ? completedTypes.includes(activeChallengeModal) : false}
        restorationStage={restoredStage}
        onAdvanceRestoration={(stage) => {
          domainRef.current!.getState().restoredBuildings[activeCountryCode] = stage;
          setSaveState({ ...domainRef.current!.getState() });
        }}
        onCompleteChallenge={(ch) => handleCompleteChallengeType(ch)}
        onClose={() => setActiveChallengeModal(null)}
      />

      {/* Settings & Save Reset Modal */}
      <SettingsModal
        open={settingsOpen}
        muted={saveState.settings.muted}
        reducedMotion={saveState.settings.reducedMotion}
        qualityTier={saveState.settings.qualityTier}
        onUpdate={(patch) => {
          domainRef.current?.updateSettings(patch);
          if (typeof patch.muted === 'boolean' && soundRef.current) {
            soundRef.current.muted = patch.muted;
          }
          setSaveState({ ...domainRef.current!.getState() });
        }}
        onResetSave={() => {
          const fresh = domainRef.current!.resetSave();
          setSaveState({ ...fresh });
          setSettingsOpen(false);
        }}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
