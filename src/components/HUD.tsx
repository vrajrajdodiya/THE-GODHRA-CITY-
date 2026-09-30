import React, { useEffect, useRef, useState } from 'react';
import { CharacterId, TimeOfDay, WeatherType } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { LANDMARKS } from '../data/landmarks';
import { soundManager } from '../audio/SoundManager';
import { InteractiveTrigger } from '../game3d/CityBuilder';
import { VehicleModel } from '../game3d/VehicleModel';
import { NPC } from '../game3d/NPCSystem';
import {
  Heart,
  Zap,
  Gauge,
  MapPin,
  Compass,
  Volume2,
  VolumeX,
  Menu,
  Users,
  Car,
  Award,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Key,
} from 'lucide-react';

interface HUDProps {
  activeCharacter: CharacterId;
  characterSwitchUnlocked: boolean;
  money: number;
  xp: number;
  level: number;
  reputation: number;
  health: number;
  stamina: number;
  speed: number;
  playerPos: [number, number, number];
  playerHeading: number;
  isDriving: boolean;
  vehicleType?: string;
  nearTrigger: InteractiveTrigger | null;
  nearVehicle: VehicleModel | null;
  nearNPC: NPC | null;
  activeMissionTitle?: string;
  activeMissionInstruction?: string;
  objectivePos: [number, number, number] | null;
  currentDistrictName?: string;
  currentDistrictSoundTitle?: string;
  ambientChatter?: { speaker: string; text: string; districtName: string } | null;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  onSwitchCharacter: () => void;
  onInteract: () => void;
  onJump: () => void;
  onToggleSprint: (sprint: boolean) => void;
  onDriveToggle: () => void;
  onHorn: () => void;
  onLights: () => void;
  onOpenMenu: () => void;
  onOpenMap: () => void;
  onOpenCharacters: () => void;
  onOpenGarage: () => void;
  onOpenMissions: () => void;
  onVirtualJoystickMove: (x: number, z: number) => void;
}

export const HUD: React.FC<HUDProps> = ({
  activeCharacter,
  characterSwitchUnlocked,
  money,
  xp,
  level,
  reputation,
  health,
  stamina,
  speed,
  playerPos,
  playerHeading,
  isDriving,
  vehicleType,
  nearTrigger,
  nearVehicle,
  nearNPC,
  activeMissionTitle,
  activeMissionInstruction,
  objectivePos,
  currentDistrictName,
  currentDistrictSoundTitle,
  ambientChatter,
  timeOfDay,
  weather,
  onSwitchCharacter,
  onInteract,
  onJump,
  onToggleSprint,
  onDriveToggle,
  onHorn,
  onLights,
  onOpenMenu,
  onOpenMap,
  onOpenCharacters,
  onOpenGarage,
  onOpenMissions,
  onVirtualJoystickMove,
}) => {
  const char = CHARACTERS[activeCharacter];
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [isSprintActive, setIsSprintActive] = useState(false);

  // Mini-map Canvas
  const miniMapRef = useRef<HTMLCanvasElement | null>(null);

  // Distance to objective
  const objectiveDistance = objectivePos
    ? Math.round(Math.hypot(playerPos[0] - objectivePos[0], playerPos[2] - objectivePos[2]))
    : null;

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    soundManager.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  // Render Mini-map
  useEffect(() => {
    const canvas = miniMapRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const center = w / 2;
    const scale = 0.55; // World units to pixels

    ctx.clearRect(0, 0, w, h);

    // Save and rotate map relative to player or keep static
    ctx.save();

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.clip();

    // Draw Roads
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 8 * scale;
    // East-West Main St
    ctx.beginPath();
    ctx.moveTo(center + (-90 - playerPos[0]) * scale, center + (0 - playerPos[2]) * scale);
    ctx.lineTo(center + (90 - playerPos[0]) * scale, center + (0 - playerPos[2]) * scale);
    ctx.stroke();

    // North-South Main St
    ctx.beginPath();
    ctx.moveTo(center + (0 - playerPos[0]) * scale, center + (-90 - playerPos[2]) * scale);
    ctx.lineTo(center + (0 - playerPos[0]) * scale, center + (90 - playerPos[2]) * scale);
    ctx.stroke();

    // Highway
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 12 * scale;
    ctx.beginPath();
    ctx.moveTo(center + (-100 - playerPos[0]) * scale, center + (95 - playerPos[2]) * scale);
    ctx.lineTo(center + (100 - playerPos[0]) * scale, center + (95 - playerPos[2]) * scale);
    ctx.stroke();

    // Roundabout Center
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(center + (0 - playerPos[0]) * scale, center + (0 - playerPos[2]) * scale, 14 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Draw GPS line to objective
    if (objectivePos) {
      const objMapX = center + (objectivePos[0] - playerPos[0]) * scale;
      const objMapY = center + (objectivePos[2] - playerPos[2]) * scale;

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(objMapX, objMapY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Objective pulse marker
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(objMapX, objMapY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Landmarks
    LANDMARKS.forEach((lm) => {
      const lx = center + (lm.position[0] - playerPos[0]) * scale;
      const ly = center + (lm.position[2] - playerPos[2]) * scale;

      ctx.fillStyle = lm.color;
      ctx.beginPath();
      ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player Pin (Always Center)
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(playerHeading);

    // Heading cone
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 24, -Math.PI / 4, Math.PI / 4);
    ctx.fill();

    // Player arrow
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.lineTo(5, -6);
    ctx.lineTo(0, -3);
    ctx.lineTo(-5, -6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.restore();

    // Border ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [playerPos, playerHeading, objectivePos]);

  // Touch Virtual Joystick
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const joystickThumbRef = useRef<HTMLDivElement | null>(null);
  const touchIdRef = useRef<number | null>(null);

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    updateJoystickPos(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystickPos(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        if (joystickThumbRef.current) {
          joystickThumbRef.current.style.transform = 'translate(0px, 0px)';
        }
        onVirtualJoystickMove(0, 0);
        break;
      }
    }
  };

  const updateJoystickPos = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current || !joystickThumbRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = rect.width / 2 - 10;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const normX = (Math.cos(angle) * clampedDist) / maxRadius;
    const normY = (Math.sin(angle) * clampedDist) / maxRadius;

    joystickThumbRef.current.style.transform = `translate(${normX * maxRadius}px, ${normY * maxRadius}px)`;

    // normX: left/right, normY: forward/backward (normY < 0 is forward)
    onVirtualJoystickMove(normX, normY);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-5 select-none z-20 overflow-hidden">
      {/* ================= TOP BAR ================= */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Left: Active Character Card */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/85 backdrop-blur-md p-2.5 rounded-2xl border border-slate-700/60 shadow-xl max-w-sm">
          <div className="relative w-13 h-13 rounded-xl overflow-hidden border-2 border-amber-500/60 shrink-0">
            <img
              src={char.portrait}
              alt={char.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] font-bold text-center text-amber-400 py-0.5 tracking-tight uppercase">
              {char.id}
            </div>
          </div>

          <div className="flex flex-col gap-1 min-w-[130px] pr-1">
            <div className="flex items-center justify-between">
              <span className="font-game text-base font-bold text-white tracking-wide">
                {char.name}
              </span>
              <span className="text-[11px] font-medium text-amber-400">
                {char.role}
              </span>
            </div>

            {/* Health Bar */}
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
              <div className="w-full bg-slate-950/80 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-red-600 to-rose-400 h-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, health))}%` }}
                />
              </div>
            </div>

            {/* Stamina Bar */}
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 shrink-0" />
              <div className="w-full bg-slate-950/80 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-400 h-full transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, stamina))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Active Mission Banner & District Atmosphere Badge */}
        <div className="hidden md:flex pointer-events-auto flex-col items-center gap-1.5 max-w-md text-center">
          {activeMissionTitle && (
            <div className="flex flex-col items-center bg-slate-900/80 backdrop-blur-md px-5 py-2 rounded-xl border border-amber-500/40 shadow-xl w-full">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{activeMissionTitle}</span>
                {objectiveDistance !== null && (
                  <span className="text-slate-300 font-mono text-[11px]">
                    ({objectiveDistance}m)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-200 font-medium truncate max-w-sm mt-0.5">
                {activeMissionInstruction}
              </p>
            </div>
          )}

          {/* District Sound Atmosphere Badge */}
          {currentDistrictName && (
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] shadow-lg">
              <span className="flex items-center gap-1 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {currentDistrictName}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300 italic flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-amber-400 shrink-0" />
                {currentDistrictSoundTitle}
              </span>
            </div>
          )}
        </div>

        {/* Right: Currency & Stats Cluster */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Money Badge */}
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-emerald-500/50 shadow-xl">
            <span className="text-sm">💰</span>
            <span className="font-game text-lg font-bold text-emerald-400 tracking-wider font-mono">
              ₹{money.toLocaleString('en-IN')}
            </span>
          </div>

          {/* XP & Level */}
          <div className="hidden sm:flex flex-col bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-xl">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 gap-3">
              <span>LVL {level}</span>
              <span className="text-amber-400 font-mono">{xp} XP</span>
            </div>
            <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
              <div
                className="bg-amber-400 h-full"
                style={{ width: `${(xp % 100)}%` }}
              />
            </div>
          </div>

          {/* Menu Trigger Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-xl">
            <button
              onClick={handleToggleMute}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenMenu}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Pause / Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Mission Banner */}
      {activeMissionTitle && (
        <div className="md:hidden pointer-events-auto mx-auto mt-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/40 text-center max-w-xs shadow-lg">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
            <span>{activeMissionTitle}</span>
            {objectiveDistance !== null && (
              <span className="font-mono text-slate-300">({objectiveDistance}m)</span>
            )}
          </div>
          <p className="text-[11px] text-slate-200 truncate">{activeMissionInstruction}</p>
        </div>
      )}

      {/* ================= CENTER ACTION PROMPTS & CHATTER ================= */}
      <div className="flex flex-col items-center justify-center pointer-events-none my-auto">
        {/* Dynamic Local Pedestrian Chatter Bubble */}
        {ambientChatter && (
          <div className="pointer-events-auto bg-slate-950/95 border-2 border-amber-400/90 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-lg mb-3 animate-bounce">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-sm font-bold text-amber-300 shrink-0">
              🗣️
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                {ambientChatter.districtName} · Local Chatter
              </span>
              <span className="text-xs font-semibold text-slate-100 italic">
                "{ambientChatter.text}"
              </span>
            </div>
          </div>
        )}

        {nearTrigger && (
          <div className="pointer-events-auto bg-slate-950/90 border border-amber-500 text-amber-300 px-5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce">
            <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-xs">
              E
            </span>
            <span className="text-sm font-semibold">{nearTrigger.actionPrompt}</span>
            <button
              onClick={onInteract}
              className="bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Interact
            </button>
          </div>
        )}

        {nearVehicle && !isDriving && (
          <div className="pointer-events-auto bg-slate-950/90 border border-cyan-400 text-cyan-200 px-5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce">
            <span className="bg-cyan-400 text-slate-950 font-bold px-2 py-0.5 rounded text-xs">
              E
            </span>
            <span className="text-sm font-semibold">Drive {nearVehicle.stats.name}</span>
            <button
              onClick={onDriveToggle}
              className="bg-cyan-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg hover:bg-cyan-300 transition-colors cursor-pointer"
            >
              Drive
            </button>
          </div>
        )}

        {nearNPC && (
          <div className="pointer-events-auto bg-slate-950/90 border border-emerald-400 text-emerald-200 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-300">
              {nearNPC.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">{nearNPC.name} ({nearNPC.role})</span>
              <span className="text-xs text-emerald-300 italic">"{nearNPC.dialogue}"</span>
            </div>
          </div>
        )}
      </div>

      {/* ================= BOTTOM CONTROLS & RADAR ================= */}
      <div className="flex items-end justify-between w-full gap-4">
        {/* Left: Mini-Map Radar & Mobile Virtual Joystick */}
        <div className="flex items-end gap-3 pointer-events-auto">
          {/* Mini-map */}
          <div
            onClick={onOpenMap}
            className="group relative cursor-pointer rounded-full overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-950/90 hover:border-amber-400 transition-colors"
            title="Click to expand city map"
          >
            <canvas ref={miniMapRef} width={130} height={130} className="block w-28 h-28 md:w-32 md:h-32" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold text-amber-300 bg-slate-900/90 px-2 py-0.5 rounded">
                MAP (M)
              </span>
            </div>
          </div>

          {/* Virtual Joystick (Touch screen support) */}
          <div
            ref={joystickBaseRef}
            onTouchStart={handleJoystickTouchStart}
            onTouchMove={handleJoystickTouchMove}
            onTouchEnd={handleJoystickTouchEnd}
            className="md:hidden w-28 h-28 rounded-full bg-slate-900/70 border-2 border-slate-700/50 backdrop-blur-md flex items-center justify-center relative touch-none select-none"
          >
            <div
              ref={joystickThumbRef}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-400 border border-white/40 shadow-lg pointer-events-none"
            />
          </div>
        </div>

        {/* Center: Driving Speedometer / Quick Controls */}
        <div className="hidden sm:flex flex-col items-center pointer-events-auto">
          {isDriving ? (
            <div className="bg-slate-900/85 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-cyan-500/50 shadow-2xl flex items-center gap-4">
              <Gauge className="w-5 h-5 text-cyan-400" />
              <div className="flex flex-col items-center">
                <span className="font-game text-3xl font-extrabold text-white tracking-wider font-mono">
                  {speed}
                </span>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest -mt-1">
                  KM / H
                </span>
              </div>
              <div className="flex items-center gap-1.5 ml-2 border-l border-slate-700 pl-3">
                <button
                  onClick={onHorn}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Horn (H)"
                >
                  Horn [H]
                </button>
                <button
                  onClick={onLights}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Headlights (L)"
                >
                  Lights [L]
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/70 backdrop-blur-md px-4 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-3">
              <span>WASD to Move</span>
              <span>·</span>
              <span>Space to Jump</span>
              <span>·</span>
              <span>Shift to Sprint</span>
              <span>·</span>
              <span>E to Enter Vehicle</span>
              <span>·</span>
              <span>C to Switch</span>
            </div>
          )}
        </div>

        {/* Right: Action Buttons (Touch + Clickable) */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {/* Quick Menu Triggers */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenCharacters}
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-amber-400 rounded-xl shadow-lg transition-colors cursor-pointer"
              title="Characters (Hemang, Vraj, JD)"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenGarage}
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-emerald-400 rounded-xl shadow-lg transition-colors cursor-pointer"
              title="Garage & Vehicles"
            >
              <Car className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenMissions}
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-purple-400 rounded-xl shadow-lg transition-colors cursor-pointer"
              title="Missions & Story"
            >
              <Award className="w-4 h-4" />
            </button>
          </div>

          {/* Tactical Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* Switch Character */}
            <button
              onClick={onSwitchCharacter}
              disabled={isDriving}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center font-bold text-xs shadow-xl transition-all cursor-pointer ${
                isDriving
                  ? 'opacity-40 bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 active:scale-95'
              }`}
              title="Switch Character (C)"
            >
              <span className="text-[10px] opacity-75">SWITCH [C]</span>
              <span className="font-extrabold text-sm">{char.name}</span>
            </button>

            {/* Enter/Exit Vehicle */}
            <button
              onClick={onDriveToggle}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center font-bold text-xs shadow-xl transition-all cursor-pointer ${
                isDriving
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white active:scale-95'
                  : nearVehicle
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white animate-pulse active:scale-95'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
              title="Enter / Exit Vehicle (E)"
            >
              <span className="text-[10px] opacity-75">VEHICLE [E]</span>
              <span className="font-extrabold text-sm">
                {isDriving ? 'EXIT' : 'DRIVE'}
              </span>
            </button>

            {/* Jump Button */}
            {!isDriving && (
              <button
                onClick={onJump}
                className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-2xl shadow-xl active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-[10px] text-slate-400">JUMP</span>
                <span className="block text-sm font-extrabold">SPACE</span>
              </button>
            )}

            {/* Sprint Button */}
            {!isDriving && (
              <button
                onClick={() => {
                  const next = !isSprintActive;
                  setIsSprintActive(next);
                  onToggleSprint(next);
                }}
                className={`p-3 font-bold text-xs rounded-2xl shadow-xl active:scale-95 transition-all cursor-pointer border ${
                  isSprintActive
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-white'
                }`}
              >
                <span className="text-[10px] opacity-75">SPRINT</span>
                <span className="block text-sm font-extrabold">
                  {isSprintActive ? 'SPRINTING' : 'SHIFT'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
