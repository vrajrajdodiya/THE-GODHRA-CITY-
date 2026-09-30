import React from 'react';
import { soundManager } from '../audio/SoundManager';
import { ChevronRight } from 'lucide-react';

export interface DialogueData {
  speaker: string;
  role: string;
  portrait?: string;
  text: string;
}

interface DialogueBoxProps {
  dialogue: DialogueData;
  onNext: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ dialogue, onNext }) => {
  return (
    <div className="fixed bottom-24 sm:bottom-28 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-xl w-full pointer-events-auto">
      <div className="bg-slate-900/95 border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-start gap-4">
        {dialogue.portrait ? (
          <img
            src={dialogue.portrait}
            alt={dialogue.speaker}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-xl object-cover border border-amber-400 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 font-bold font-game text-xl shrink-0">
            {dialogue.speaker.charAt(0)}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-game text-lg font-bold text-white tracking-wide">
              {dialogue.speaker}
            </span>
            <span className="text-[11px] font-semibold text-amber-400">
              · {dialogue.role}
            </span>
          </div>
          <p className="text-sm text-slate-200 leading-snug">
            "{dialogue.text}"
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onNext();
          }}
          className="self-end px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow flex items-center gap-1 cursor-pointer transition-colors shrink-0"
        >
          <span>Continue</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
