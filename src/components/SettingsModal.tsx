import React, { useState } from 'react';
import { TimeOfDay, WeatherType } from '../types/game';
import { soundManager } from '../audio/SoundManager';
import { X, Volume2, VolumeX, Sun, Sunset, Moon, CloudRain, RotateCcw, Keyboard, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  onChangeTime: (time: TimeOfDay) => void;
  onChangeWeather: (weather: WeatherType) => void;
  onResetGame: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  timeOfDay,
  weather,
  onChangeTime,
  onChangeWeather,
  onResetGame,
  onClose,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const handleToggleSound = () => {
    const next = !isMuted;
    soundManager.setMuted(next);
    setIsMuted(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="font-game text-2xl font-bold text-white tracking-wide">
              SETTINGS & CONTROLS
            </h2>
            <p className="text-xs text-slate-400">
              Customize environment, audio, and gameplay preferences
            </p>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Audio Setting */}
          <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Master Game Sound</span>
                <span className="text-xs text-slate-400">Footsteps, vehicle engines, horns, bells, ambience</span>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isMuted
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : 'bg-amber-500 text-slate-950 shadow-md'
              }`}
            >
              {isMuted ? 'SOUND MUTED' : 'SOUND ON'}
            </button>
          </div>

          {/* Time of Day */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Time of Day Cycle
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['morning', 'afternoon', 'evening', 'night'] as TimeOfDay[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    soundManager.playClick();
                    onChangeTime(t);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-semibold capitalize transition-all cursor-pointer ${
                    timeOfDay === t
                      ? 'bg-slate-800 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {t === 'morning' && <Sun className="w-4 h-4 text-amber-400" />}
                  {t === 'afternoon' && <Sun className="w-4 h-4 text-sky-400" />}
                  {t === 'evening' && <Sunset className="w-4 h-4 text-orange-400" />}
                  {t === 'night' && <Moon className="w-4 h-4 text-blue-400" />}
                  <span>{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Weather System
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['sunny', 'cloudy', 'rain'] as WeatherType[]).map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    soundManager.playClick();
                    onChangeWeather(w);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-xs font-semibold capitalize transition-all cursor-pointer ${
                    weather === w
                      ? 'bg-slate-800 border-cyan-400 text-cyan-300 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {w === 'sunny' && <Sun className="w-4 h-4 text-amber-400" />}
                  {w === 'cloudy' && <Sun className="w-4 h-4 text-slate-400" />}
                  {w === 'rain' && <CloudRain className="w-4 h-4 text-cyan-400" />}
                  <span>{w === 'rain' ? 'Monsoon Rain' : w}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Controls Guide */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Controls Reference
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-white mb-2">
                  <Keyboard className="w-4 h-4 text-amber-400" /> Desktop Keyboard
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>W, A, S, D / Arrows</span>
                  <span className="text-slate-500">Move / Drive</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Space</span>
                  <span className="text-slate-500">Jump</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shift</span>
                  <span className="text-slate-500">Sprint</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>E</span>
                  <span className="text-slate-500">Drive / Interact</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>C</span>
                  <span className="text-slate-500">Switch Character</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>H / L</span>
                  <span className="text-slate-500">Horn / Headlights</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>M / Esc</span>
                  <span className="text-slate-500">Map / Menu</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-white mb-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" /> Mobile Touch Screen
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Left Analog Joystick</span>
                  <span className="text-slate-500">Smooth 360° Movement</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Right Buttons</span>
                  <span className="text-slate-500">Jump, Sprint, Drive</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Swipe Screen</span>
                  <span className="text-slate-500">Orbit 3rd-Person Camera</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tap Radar Mini-Map</span>
                  <span className="text-slate-500">Open Full City Map</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reset Game Section */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-red-400 block">Reset Progress</span>
              <span className="text-[11px] text-slate-400">Restart from Chapter 1 with ₹1,000</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset your game progress to Chapter 1?')) {
                  soundManager.playClick();
                  onResetGame();
                }
              }}
              className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> RESET GAME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
