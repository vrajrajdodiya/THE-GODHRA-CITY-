import React from 'react';
import posterImg from '../assets/images/game_poster_godhra_1790763251158.jpg';
import { soundManager } from '../audio/SoundManager';
import { Play, PlayCircle, Users, Car, Award, Map, Settings, Volume2 } from 'lucide-react';

interface MainMenuProps {
  onPlay: () => void;
  onContinue: () => void;
  onOpenCharacters: () => void;
  onOpenGarage: () => void;
  onOpenMissions: () => void;
  onOpenMap: () => void;
  onOpenSettings: () => void;
  hasSavedGame: boolean;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onContinue,
  onOpenCharacters,
  onOpenGarage,
  onOpenMissions,
  onOpenMap,
  onOpenSettings,
  hasSavedGame,
}) => {
  const handleAction = (callback: () => void) => {
    soundManager.playClick();
    callback();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background Cinematic Key Art */}
      <div className="absolute inset-0">
        <img
          src={posterImg}
          alt="Godhra City Life Key Art"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.45] scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-radial from-transparent to-slate-950/80" />
      </div>

      {/* Main Content Modal Container */}
      <div className="relative z-10 w-full max-w-4xl px-6 py-8 flex flex-col items-center justify-between min-h-screen sm:min-h-0">
        {/* Header Branding */}
        <div className="text-center mt-6 sm:mt-0">
          <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
            3D Open World Adventure Prototype
          </div>
          <h1 className="font-game text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 tracking-tight drop-shadow-2xl">
            GODHRA CITY LIFE
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium tracking-wide mt-2">
            "Three Friends. One City. Their Story."
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-amber-300/80 font-mono mt-1">
            <span>HEMANG (The Planner)</span>
            <span>·</span>
            <span>VRAJ (The Driver)</span>
            <span>·</span>
            <span>JD (The Mechanic)</span>
          </div>
        </div>

        {/* Action Menu List */}
        <div className="w-full max-w-sm flex flex-col gap-2.5 my-8">
          {/* PLAY Button */}
          <button
            onClick={() => handleAction(onPlay)}
            className="group relative flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Play className="w-5 h-5 fill-slate-950" />
              <span className="font-game text-xl tracking-wider">NEW GAME</span>
            </div>
            <span className="text-xs uppercase font-extrabold opacity-75">START</span>
          </button>

          {/* CONTINUE Button */}
          {hasSavedGame && (
            <button
              onClick={() => handleAction(onContinue)}
              className="flex items-center justify-between px-6 py-3 bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-semibold rounded-2xl border border-amber-500/40 shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <PlayCircle className="w-5 h-5" />
                <span className="font-game text-lg tracking-wider">CONTINUE</span>
              </div>
              <span className="text-xs text-slate-400">RESUME</span>
            </button>
          )}

          {/* CHARACTERS Button */}
          <button
            onClick={() => handleAction(onOpenCharacters)}
            className="flex items-center justify-between px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-semibold rounded-2xl border border-slate-700/60 shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-amber-400" />
              <span className="font-game text-lg tracking-wider">CHARACTERS</span>
            </div>
            <span className="text-xs text-slate-400">3 FRIENDS</span>
          </button>

          {/* GARAGE Button */}
          <button
            onClick={() => handleAction(onOpenGarage)}
            className="flex items-center justify-between px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-semibold rounded-2xl border border-slate-700/60 shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-emerald-400" />
              <span className="font-game text-lg tracking-wider">GARAGE</span>
            </div>
            <span className="text-xs text-slate-400">5 VEHICLES</span>
          </button>

          {/* MISSIONS Button */}
          <button
            onClick={() => handleAction(onOpenMissions)}
            className="flex items-center justify-between px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-semibold rounded-2xl border border-slate-700/60 shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-purple-400" />
              <span className="font-game text-lg tracking-wider">MISSIONS</span>
            </div>
            <span className="text-xs text-slate-400">STORY LOG</span>
          </button>

          {/* MAP Button */}
          <button
            onClick={() => handleAction(onOpenMap)}
            className="flex items-center justify-between px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-semibold rounded-2xl border border-slate-700/60 shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Map className="w-5 h-5 text-blue-400" />
              <span className="font-game text-lg tracking-wider">CITY MAP</span>
            </div>
            <span className="text-xs text-slate-400">10 LANDMARKS</span>
          </button>

          {/* SETTINGS Button */}
          <button
            onClick={() => handleAction(onOpenSettings)}
            className="flex items-center justify-between px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-semibold rounded-2xl border border-slate-700/60 shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-slate-400" />
              <span className="font-game text-lg tracking-wider">SETTINGS</span>
            </div>
            <span className="text-xs text-slate-400">CONFIG</span>
          </button>
        </div>

        {/* Footer controls tip */}
        <div className="text-center text-xs text-slate-400 font-medium">
          <p>Controls: WASD / Virtual Joystick to Move · Space to Jump · E to Drive/Interact · C to Switch Friends</p>
        </div>
      </div>
    </div>
  );
};
