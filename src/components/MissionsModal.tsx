import React from 'react';
import { Mission } from '../types/game';
import { soundManager } from '../audio/SoundManager';
import { X, Award, CheckCircle2, Navigation, Lock } from 'lucide-react';

interface MissionsModalProps {
  missions: Mission[];
  activeMissionId: string | null;
  onTrackMission: (id: string) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  activeMissionId,
  onTrackMission,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-game text-2xl font-bold text-white tracking-wide">
                STORY MISSIONS & CHAPTERS
              </h2>
              <p className="text-xs text-slate-400">
                Complete objectives to expand the enterprise and earn rewards
              </p>
            </div>
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

        {/* Missions List */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {missions.map((m, idx) => {
            const isTracking = m.id === activeMissionId;
            return (
              <div
                key={m.id}
                className={`p-5 rounded-2xl border transition-all ${
                  m.completed
                    ? 'bg-slate-950/40 border-slate-800 opacity-80'
                    : isTracking
                    ? 'bg-slate-800/90 border-purple-500 shadow-lg shadow-purple-500/10'
                    : m.unlocked
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/30 border-slate-900 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-md">
                        {m.subtitle}
                      </span>
                      {m.characterRequired && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md uppercase">
                          Driver: {m.characterRequired}
                        </span>
                      )}
                    </div>
                    <h3 className="font-game text-xl font-bold text-white">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  {m.completed ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> COMPLETED
                    </div>
                  ) : !m.unlocked ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
                      <Lock className="w-4 h-4" /> LOCKED
                    </div>
                  ) : isTracking ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 bg-purple-500/20 px-3 py-1.5 rounded-xl border border-purple-400 shrink-0">
                      <Navigation className="w-4 h-4 animate-pulse" /> TRACKING
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onTrackMission(m.id);
                        onClose();
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer shrink-0"
                    >
                      TRACK GPS
                    </button>
                  )}
                </div>

                {/* Steps and Rewards */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>
                      Reward:{' '}
                      <strong className="text-emerald-400 font-mono">₹{m.rewardMoney}</strong>
                    </span>
                    <span>
                      XP:{' '}
                      <strong className="text-amber-400 font-mono">+{m.rewardXp}</strong>
                    </span>
                    <span>
                      Rep:{' '}
                      <strong className="text-purple-400 font-mono">+{m.rewardReputation}</strong>
                    </span>
                  </div>

                  {m.unlocked && !m.completed && (
                    <span className="text-[11px] text-amber-400 font-medium">
                      Step {m.currentStepIndex + 1} of {m.steps.length}: {m.steps[m.currentStepIndex]?.targetName}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
