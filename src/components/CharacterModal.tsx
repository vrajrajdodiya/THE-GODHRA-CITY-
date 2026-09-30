import React from 'react';
import { CharacterId } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { soundManager } from '../audio/SoundManager';
import { X, Check, Shirt, Car, Shield, Sparkles } from 'lucide-react';

interface CharacterModalProps {
  activeCharacter: CharacterId;
  characterSwitchUnlocked: boolean;
  onSelectCharacter: (id: CharacterId) => void;
  onOpenWardrobe: () => void;
  onClose: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  activeCharacter,
  characterSwitchUnlocked,
  onSelectCharacter,
  onOpenWardrobe,
  onClose,
}) => {
  const charactersList = Object.values(CHARACTERS);

  const handleSelect = (id: CharacterId) => {
    soundManager.playClick();
    onSelectCharacter(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="font-game text-2xl font-bold text-white tracking-wide">
              THE THREE FRIENDS
            </h2>
            <p className="text-xs text-slate-400">
              Hemang, Vraj, and JD · One city, shared ambition
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

        {/* Characters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 overflow-y-auto">
          {charactersList.map((char) => {
            const isActive = char.id === activeCharacter;
            return (
              <div
                key={char.id}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-slate-800/90 border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Portrait Card */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 border border-slate-700/80 shadow-inner">
                    <img
                      src={char.portrait}
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {isActive && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <Check className="w-3 h-3 stroke-[3]" /> ACTIVE
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 to-transparent p-3 pt-6">
                      <h3 className="font-game text-xl font-bold text-white">
                        {char.name}
                      </h3>
                      <p className="text-xs font-semibold text-amber-400">
                        {char.role}
                      </p>
                    </div>
                  </div>

                  {/* Tagline & Personality */}
                  <p className="text-xs text-slate-300 italic mb-3">
                    "{char.tagline}"
                  </p>

                  {/* Attributes & Perks */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Special: {char.specialAbility}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        {char.bonusDescription}
                      </p>
                    </div>

                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-0.5">
                        <Car className="w-3.5 h-3.5" />
                        <span>Preferred Rides</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        {char.preferredVehicles}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => handleSelect(char.id)}
                    disabled={isActive}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                    }`}
                  >
                    {isActive ? 'CURRENT PLAYER' : `PLAY AS ${char.name.toUpperCase()}`}
                  </button>

                  {isActive && (
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onOpenWardrobe();
                      }}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                      title="Customize Outfit"
                    >
                      <Shirt className="w-4 h-4" />
                    </button>
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
