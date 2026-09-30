/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { CharacterId, GameState, Mission, TimeOfDay, VehicleStats, WeatherType } from './types/game';
import { CHARACTERS } from './data/characters';
import { INITIAL_MISSIONS } from './data/missions';
import { INITIAL_VEHICLES } from './data/vehicles';
import { DistrictData } from './data/districtChatter';
import { soundManager } from './audio/SoundManager';
import { GameEngine } from './game3d/GameEngine';
import { InteractiveTrigger } from './game3d/CityBuilder';
import { VehicleModel } from './game3d/VehicleModel';
import { NPC } from './game3d/NPCSystem';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { CharacterModal } from './components/CharacterModal';
import { GarageModal } from './components/GarageModal';
import { WardrobeModal } from './components/WardrobeModal';
import { MissionsModal } from './components/MissionsModal';
import { MapModal } from './components/MapModal';
import { SettingsModal } from './components/SettingsModal';
import { DialogueBox, DialogueData } from './components/DialogueBox';

const STORAGE_KEY = 'godhra_city_save_v1';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game UI States
  const [inGame, setInGame] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<
    'none' | 'characters' | 'garage' | 'wardrobe' | 'missions' | 'map' | 'settings' | 'menu'
  >('none');

  // Core Game State
  const [money, setMoney] = useState<number>(1000);
  const [xp, setXp] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [reputation, setReputation] = useState<number>(1);
  const [activeCharacter, setActiveCharacter] = useState<CharacterId>('vraj');
  const [characterSwitchUnlocked, setCharacterSwitchUnlocked] = useState<boolean>(false);

  // Missions & Vehicles State
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [activeMissionId, setActiveMissionId] = useState<string | null>('mission_01');
  const [vehicles, setVehicles] = useState<VehicleStats[]>(INITIAL_VEHICLES);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>('bicycle_01');

  // Real-time Engine Feedback State
  const [health, setHealth] = useState<number>(100);
  const [stamina, setStamina] = useState<number>(100);
  const [speed, setSpeed] = useState<number>(0);
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([-55, 0, -40]);
  const [playerHeading, setPlayerHeading] = useState<number>(0);
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [vehicleType, setVehicleType] = useState<string | undefined>(undefined);

  // Proximity Triggers
  const [nearTrigger, setNearTrigger] = useState<InteractiveTrigger | null>(null);
  const [nearVehicle, setNearVehicle] = useState<VehicleModel | null>(null);
  const [nearNPC, setNearNPC] = useState<NPC | null>(null);

  // Environment
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [weather, setWeather] = useState<WeatherType>('sunny');

  // District & Pedestrian Ambient Chatter State
  const [currentDistrict, setCurrentDistrict] = useState<DistrictData | null>(null);
  const [ambientChatter, setAmbientChatter] = useState<{ speaker: string; text: string; districtName: string } | null>(null);
  const chatterTimeoutRef = useRef<number | null>(null);

  // Dialogue
  const [activeDialogue, setActiveDialogue] = useState<DialogueData | null>(null);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);

  // Active mission step
  const activeMission = missions.find((m) => m.id === activeMissionId);
  const currentStep = activeMission ? activeMission.steps[activeMission.currentStepIndex] : null;

  // Check saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHasSavedGame(true);
      }
    } catch {
      // safe
    }
  }, []);

  // Save game state
  const saveGameState = () => {
    try {
      const state = {
        money,
        xp,
        level,
        reputation,
        activeCharacter,
        characterSwitchUnlocked,
        missions,
        activeMissionId,
        vehicles,
        activeVehicleId,
        timeOfDay,
        weather,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setHasSavedGame(true);
    } catch {
      // safe
    }
  };

  // Load saved game
  const loadGameState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.money !== undefined) setMoney(data.money);
        if (data.xp !== undefined) setXp(data.xp);
        if (data.level !== undefined) setLevel(data.level);
        if (data.reputation !== undefined) setReputation(data.reputation);
        if (data.activeCharacter) setActiveCharacter(data.activeCharacter);
        if (data.characterSwitchUnlocked !== undefined) setCharacterSwitchUnlocked(data.characterSwitchUnlocked);
        if (data.missions) setMissions(data.missions);
        if (data.activeMissionId) setActiveMissionId(data.activeMissionId);
        if (data.vehicles) setVehicles(data.vehicles);
        if (data.activeVehicleId) setActiveVehicleId(data.activeVehicleId);
        if (data.timeOfDay) {
          setTimeOfDay(data.timeOfDay);
          engineRef.current?.setTimeOfDay(data.timeOfDay);
        }
        if (data.weather) {
          setWeather(data.weather);
          engineRef.current?.setWeather(data.weather);
        }
      }
    } catch {
      // safe
    }
  };

  // Initialize Game Engine
  useEffect(() => {
    if (!containerRef.current || engineRef.current) return;

    const engine = new GameEngine(containerRef.current, {
      onNearTrigger: (trigger) => setNearTrigger(trigger),
      onNearVehicle: (vehicle) => setNearVehicle(vehicle),
      onNearNPC: (npc) => setNearNPC(npc),
      onDistrictChange: (district) => {
        setCurrentDistrict(district);
      },
      onPedestrianChatter: (chatter) => {
        setAmbientChatter(chatter);
        if (chatterTimeoutRef.current) window.clearTimeout(chatterTimeoutRef.current);
        chatterTimeoutRef.current = window.setTimeout(() => {
          setAmbientChatter(null);
        }, 6500);
      },
      onUpdateHUD: (data) => {
        setHealth(data.health);
        setStamina(data.stamina);
        setSpeed(data.speed);
        setPlayerPos(data.playerPos);
        setPlayerHeading(data.playerHeading);
        setIsDriving(data.isDriving);
        setVehicleType(data.vehicleType);
      },
      onMissionStepReached: () => {
        handleMissionStepSuccess();
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync Objective Target with Engine
  useEffect(() => {
    if (engineRef.current && currentStep) {
      engineRef.current.setObjectiveTarget(currentStep.targetPosition);
    } else if (engineRef.current) {
      engineRef.current.setObjectiveTarget(null);
    }
  }, [activeMissionId, currentStep]);

  // Mission Step Progression Handler
  const handleMissionStepSuccess = () => {
    if (!activeMission || activeMission.completed) return;

    const nextIndex = activeMission.currentStepIndex + 1;

    if (nextIndex < activeMission.steps.length) {
      // Advance to next step
      soundManager.playClick();
      setMissions((prev) =>
        prev.map((m) =>
          m.id === activeMission.id ? { ...m, currentStepIndex: nextIndex } : m
        )
      );

      // Story hint
      const nextStepInfo = activeMission.steps[nextIndex];
      setActiveDialogue({
        speaker: activeCharacter === 'vraj' ? 'Vraj' : activeCharacter === 'hemang' ? 'Hemang' : 'JD',
        role: CHARACTERS[activeCharacter].role,
        portrait: CHARACTERS[activeCharacter].portrait,
        text: `Great progress! Next objective: ${nextStepInfo.instruction}`,
      });
    } else {
      // Mission Complete!
      soundManager.playMissionComplete();
      soundManager.playCashEarned();

      // Confetti celebration
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // safe
      }

      // Bonus calculations
      const isHemangBusinessBonus = activeCharacter === 'hemang';
      const finalMoneyReward = Math.round(
        activeMission.rewardMoney * (isHemangBusinessBonus ? 1.1 : 1.0)
      );

      setMoney((m) => m + finalMoneyReward);
      setXp((x) => {
        const newXp = x + activeMission.rewardXp;
        setLevel(Math.floor(newXp / 100) + 1);
        return newXp;
      });
      setReputation((r) => r + activeMission.rewardReputation);

      // Unlock character switching after Mission 1
      if (activeMission.id === 'mission_01') {
        setCharacterSwitchUnlocked(true);
      }

      // Unlock next mission
      let nextMissionUnlockedId: string | null = null;
      if (activeMission.id === 'mission_01') nextMissionUnlockedId = 'mission_02';
      else if (activeMission.id === 'mission_02') nextMissionUnlockedId = 'mission_03';
      else if (activeMission.id === 'mission_03') nextMissionUnlockedId = 'mission_04';

      setMissions((prev) =>
        prev.map((m) => {
          if (m.id === activeMission.id) {
            return { ...m, completed: true };
          }
          if (m.id === nextMissionUnlockedId) {
            return { ...m, unlocked: true };
          }
          return m;
        })
      );

      setActiveMissionId(nextMissionUnlockedId);

      // Celebratory narrative dialogue
      setActiveDialogue({
        speaker: 'Hemang',
        role: 'The Planner',
        portrait: CHARACTERS.hemang.portrait,
        text: `Mission Accomplished! We earned ₹${finalMoneyReward} and gained reputation across Godhra! Let's keep expanding!`,
      });

      saveGameState();
    }
  };

  // Keyboard input bindings
  useEffect(() => {
    const keysDown = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      keysDown.add(e.code);

      // Pause / Menu toggle
      if (e.code === 'Escape') {
        setActiveModal((cur) => (cur === 'none' ? 'menu' : 'none'));
        return;
      }

      // Quick Map
      if (e.code === 'KeyM') {
        setActiveModal((cur) => (cur === 'map' ? 'none' : 'map'));
        return;
      }

      // Switch Character
      if (e.code === 'KeyC') {
        handleCycleCharacter();
        return;
      }

      // Drive / Interact
      if (e.code === 'KeyE') {
        handleDriveOrInteract();
        return;
      }

      // Horn
      if (e.code === 'KeyH') {
        engineRef.current?.toggleHorn();
        return;
      }

      // Headlights
      if (e.code === 'KeyL') {
        engineRef.current?.toggleHeadlights();
        return;
      }

      updateInputVector();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);
      updateInputVector();
    };

    const updateInputVector = () => {
      if (!engineRef.current) return;

      let x = 0;
      let z = 0;

      if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) z -= 1;
      if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) z += 1;
      if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) x -= 1;
      if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) x += 1;

      engineRef.current.inputVector = { x, z };
      engineRef.current.isJumpPressed = keysDown.has('Space');
      engineRef.current.isSprintPressed = keysDown.has('ShiftLeft') || keysDown.has('ShiftRight');
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isDriving, nearTrigger, nearVehicle, activeCharacter, characterSwitchUnlocked]);

  // Handle Drive / Exit / Interact
  const handleDriveOrInteract = () => {
    if (isDriving) {
      engineRef.current?.exitVehicle();
    } else if (nearVehicle) {
      engineRef.current?.enterVehicle(nearVehicle);
    } else if (nearTrigger) {
      handleTriggerAction(nearTrigger);
    } else if (nearNPC) {
      soundManager.playClick();
      setActiveDialogue({
        speaker: nearNPC.name,
        role: nearNPC.role,
        text: nearNPC.dialogue,
      });
    }
  };

  // Handle Interactive Trigger Zones
  const handleTriggerAction = (trigger: InteractiveTrigger) => {
    soundManager.playClick();
    if (trigger.type === 'bed') {
      // Cycle time of day & restore health/stamina
      const order: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];
      const nextTime = order[(order.indexOf(timeOfDay) + 1) % order.length];
      setTimeOfDay(nextTime);
      engineRef.current?.setTimeOfDay(nextTime);

      // Restore health & stamina
      if (engineRef.current) {
        engineRef.current.health = 100;
        engineRef.current.stamina = 100;
      }
      setHealth(100);
      setStamina(100);

      setActiveDialogue({
        speaker: 'Vraj',
        role: 'The Driver',
        portrait: CHARACTERS.vraj.portrait,
        text: `Rested well in the bedroom! Health & stamina restored. The time is now ${nextTime.toUpperCase()}.`,
      });
    } else if (trigger.type === 'wardrobe') {
      setActiveModal('wardrobe');
    } else if (trigger.type === 'garage') {
      setActiveModal('garage');
    } else if (trigger.type === 'food') {
      soundManager.playCashEarned();
      setActiveDialogue({
        speaker: 'Kishan Bhai',
        role: 'Ambika Food Stall Master',
        text: 'Crispy hot Gujarati Fafda and soft Khaman ready with papaya sambharo! Perfect breakfast for our hard-working trio!',
      });
    } else if (trigger.type === 'bazaar') {
      setActiveDialogue({
        speaker: 'Pravin Uncle',
        role: 'Shree Krishna Textiles',
        text: 'Welcome to Godhra Main Bazaar! Everything from raw silk to spices can be bought and sold right here.',
      });
    } else if (trigger.type === 'college') {
      setActiveDialogue({
        speaker: 'Pooja',
        role: 'Arts College Senior',
        text: 'The college campus is vibrant! Everyone in Panchmahal comes here for their graduation degree.',
      });
    } else if (trigger.type === 'business') {
      setActiveDialogue({
        speaker: 'Hemang',
        role: 'The Planner',
        portrait: CHARACTERS.hemang.portrait,
        text: 'This is the commercial district! Once we save enough from delivery contracts, we will set up our corporate headquarters here.',
      });
    }
  };

  // Cycle Character Switch
  const handleCycleCharacter = () => {
    if (isDriving) return;
    const order: CharacterId[] = ['hemang', 'vraj', 'jd'];
    const nextChar = order[(order.indexOf(activeCharacter) + 1) % order.length];
    handleSwitchCharacter(nextChar);
  };

  const handleSwitchCharacter = (charId: CharacterId) => {
    if (isDriving) return;
    setActiveCharacter(charId);
    engineRef.current?.switchCharacter(charId);

    const c = CHARACTERS[charId];
    setActiveDialogue({
      speaker: c.name,
      role: c.role,
      portrait: c.portrait,
      text: `Switched to ${c.name}! ${c.bonusDescription}`,
    });
  };

  // Vehicle Repairs & Upgrades
  const handleRepairVehicle = (vehId: string, cost: number) => {
    if (money < cost) return;
    setMoney((m) => m - cost);
    soundManager.playCashEarned();

    setVehicles((prev) =>
      prev.map((v) => (v.id === vehId ? { ...v, health: 100 } : v))
    );

    setActiveDialogue({
      speaker: 'JD',
      role: 'The Mechanic',
      portrait: CHARACTERS.jd.portrait,
      text: 'Wrenched and polished! The vehicle is back to 100% prime condition.',
    });
    saveGameState();
  };

  const handleUpgradeVehicle = (vehId: string, type: 'engine' | 'brakes' | 'tires', cost: number) => {
    if (money < cost) return;
    setMoney((m) => m - cost);
    soundManager.playCashEarned();

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehId) {
          if (type === 'engine') {
            return {
              ...v,
              upgradeEngine: v.upgradeEngine + 1,
              topSpeed: Math.round(v.topSpeed * 1.12),
              acceleration: Math.round(v.acceleration * 1.15),
            };
          }
          if (type === 'brakes') {
            return {
              ...v,
              upgradeBrakes: v.upgradeBrakes + 1,
              handling: Math.min(10, v.handling + 0.5),
            };
          }
          if (type === 'tires') {
            return {
              ...v,
              upgradeTires: v.upgradeTires + 1,
              handling: Math.min(10, v.handling + 0.6),
            };
          }
        }
        return v;
      })
    );

    saveGameState();
  };

  const handleRepaintVehicle = (vehId: string, colorHex: number, colorName: string) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehId ? { ...v, colorHex, color: `#${colorHex.toString(16).padStart(6, '0')}` } : v))
    );

    // Update in engine if active
    const vehModel = engineRef.current?.worldVehicles.find((wv) => wv.stats.id === vehId);
    if (vehModel) {
      vehModel.updatePaintColor(colorHex);
    }

    soundManager.playClick();
  };

  // Wardrobe Outfit Updates
  const handleUpdateOutfit = (charId: CharacterId, topColor: string, bottomColor: string) => {
    const charModel = engineRef.current?.characterModels.get(charId);
    if (charModel) {
      charModel.updateOutfitColors(topColor, bottomColor);
    }
    CHARACTERS[charId].outfit.topColor = topColor;
    CHARACTERS[charId].outfit.bottomColor = bottomColor;

    setActiveDialogue({
      speaker: CHARACTERS[charId].name,
      role: CHARACTERS[charId].role,
      portrait: CHARACTERS[charId].portrait,
      text: 'Fresh threads! Looking sharp on the streets of Godhra.',
    });
  };

  // Environment Toggles
  const handleChangeTime = (t: TimeOfDay) => {
    setTimeOfDay(t);
    engineRef.current?.setTimeOfDay(t);
  };

  const handleChangeWeather = (w: WeatherType) => {
    setWeather(w);
    engineRef.current?.setWeather(w);
  };

  // Reset Game
  const handleResetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMoney(1000);
    setXp(0);
    setLevel(1);
    setReputation(1);
    setActiveCharacter('vraj');
    setCharacterSwitchUnlocked(false);
    setMissions(INITIAL_MISSIONS);
    setActiveMissionId('mission_01');
    setVehicles(INITIAL_VEHICLES);
    setTimeOfDay('morning');
    setWeather('sunny');
    engineRef.current?.setTimeOfDay('morning');
    engineRef.current?.setWeather('sunny');
    setActiveModal('none');

    setActiveDialogue({
      speaker: 'Hemang',
      role: 'The Planner',
      portrait: CHARACTERS.hemang.portrait,
      text: 'Starting fresh! Three friends in Godhra with ₹1,000 in our pocket and a dream.',
    });
  };

  // Start Play from Main Menu
  const handleStartPlay = (isResume = false) => {
    if (isResume) {
      loadGameState();
    }
    setInGame(true);
    setActiveModal('none');

    // First story intro dialogue
    if (!isResume) {
      setActiveDialogue({
        speaker: 'Hemang',
        role: 'The Planner',
        portrait: CHARACTERS.hemang.portrait,
        text: 'Welcome to Godhra! We have ₹1,000, one bicycle, and our shared home. Step out to the driveway to begin Chapter 1: Three Friends!',
      });
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Main Menu Screen (when not playing or when paused) */}
      {!inGame && (
        <MainMenu
          onPlay={() => handleStartPlay(false)}
          onContinue={() => handleStartPlay(true)}
          onOpenCharacters={() => setActiveModal('characters')}
          onOpenGarage={() => setActiveModal('garage')}
          onOpenMissions={() => setActiveModal('missions')}
          onOpenMap={() => setActiveModal('map')}
          onOpenSettings={() => setActiveModal('settings')}
          hasSavedGame={hasSavedGame}
        />
      )}

      {/* In-Game Heads-Up Display (HUD) */}
      {inGame && (
        <HUD
          activeCharacter={activeCharacter}
          characterSwitchUnlocked={characterSwitchUnlocked}
          money={money}
          xp={xp}
          level={level}
          reputation={reputation}
          health={health}
          stamina={stamina}
          speed={speed}
          playerPos={playerPos}
          playerHeading={playerHeading}
          isDriving={isDriving}
          vehicleType={vehicleType}
          nearTrigger={nearTrigger}
          nearVehicle={nearVehicle}
          nearNPC={nearNPC}
          activeMissionTitle={activeMission?.title}
          activeMissionInstruction={currentStep?.instruction}
          objectivePos={currentStep ? currentStep.targetPosition : null}
          currentDistrictName={currentDistrict?.name}
          currentDistrictSoundTitle={currentDistrict?.ambientSoundTitle}
          ambientChatter={ambientChatter}
          timeOfDay={timeOfDay}
          weather={weather}
          onSwitchCharacter={handleCycleCharacter}
          onInteract={handleDriveOrInteract}
          onJump={() => {
            if (engineRef.current) engineRef.current.isJumpPressed = true;
            setTimeout(() => {
              if (engineRef.current) engineRef.current.isJumpPressed = false;
            }, 150);
          }}
          onToggleSprint={(sprint) => {
            if (engineRef.current) engineRef.current.isSprintPressed = sprint;
          }}
          onDriveToggle={handleDriveOrInteract}
          onHorn={() => engineRef.current?.toggleHorn()}
          onLights={() => engineRef.current?.toggleHeadlights()}
          onOpenMenu={() => setActiveModal('menu')}
          onOpenMap={() => setActiveModal('map')}
          onOpenCharacters={() => setActiveModal('characters')}
          onOpenGarage={() => setActiveModal('garage')}
          onOpenMissions={() => setActiveModal('missions')}
          onVirtualJoystickMove={(x, z) => {
            if (engineRef.current) {
              engineRef.current.inputVector = { x, z };
            }
          }}
        />
      )}

      {/* Story & NPC Dialogue Overlay */}
      {activeDialogue && (
        <DialogueBox
          dialogue={activeDialogue}
          onNext={() => setActiveDialogue(null)}
        />
      )}

      {/* In-Game Menu Modal */}
      {activeModal === 'menu' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-3 text-center">
            <h2 className="font-game text-3xl font-bold text-white tracking-wide">
              PAUSED
            </h2>
            <p className="text-xs text-slate-400">
              Godhra City Life · Chapter {activeMission?.id.replace('mission_', '') || '1'}
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveModal('none');
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                RESUME PLAY
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveModal('characters');
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                CHARACTERS (Hemang, Vraj, JD)
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveModal('garage');
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                GARAGE & UPGRADES
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveModal('missions');
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                MISSIONS & STORY
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveModal('map');
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                FULL CITY MAP
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveModal('settings');
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                SETTINGS
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  saveGameState();
                  setInGame(false);
                  setActiveModal('none');
                }}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                SAVE & EXIT TO TITLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Characters Modal */}
      {activeModal === 'characters' && (
        <CharacterModal
          activeCharacter={activeCharacter}
          characterSwitchUnlocked={characterSwitchUnlocked}
          onSelectCharacter={(id) => {
            handleSwitchCharacter(id);
            setActiveModal('none');
          }}
          onOpenWardrobe={() => setActiveModal('wardrobe')}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Garage Modal */}
      {activeModal === 'garage' && (
        <GarageModal
          vehicles={vehicles}
          activeVehicleId={activeVehicleId}
          activeCharacter={activeCharacter}
          money={money}
          onSelectVehicle={(id) => {
            setActiveVehicleId(id);
            setActiveModal('none');
          }}
          onRepairVehicle={handleRepairVehicle}
          onUpgradeVehicle={handleUpgradeVehicle}
          onRepaintVehicle={handleRepaintVehicle}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Wardrobe Modal */}
      {activeModal === 'wardrobe' && (
        <WardrobeModal
          activeCharacter={activeCharacter}
          onUpdateOutfit={handleUpdateOutfit}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Missions Modal */}
      {activeModal === 'missions' && (
        <MissionsModal
          missions={missions}
          activeMissionId={activeMissionId}
          onTrackMission={(id) => setActiveMissionId(id)}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Map Modal */}
      {activeModal === 'map' && (
        <MapModal
          playerPos={playerPos}
          playerHeading={playerHeading}
          objectivePos={currentStep ? currentStep.targetPosition : null}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Settings Modal */}
      {activeModal === 'settings' && (
        <SettingsModal
          timeOfDay={timeOfDay}
          weather={weather}
          onChangeTime={handleChangeTime}
          onChangeWeather={handleChangeWeather}
          onResetGame={handleResetGame}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
