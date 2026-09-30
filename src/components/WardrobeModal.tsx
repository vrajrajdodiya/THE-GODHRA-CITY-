import React, { useState } from 'react';
import { CharacterId } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { soundManager } from '../audio/SoundManager';
import { X, Shirt, Check } from 'lucide-react';

interface WardrobeModalProps {
  activeCharacter: CharacterId;
  onUpdateOutfit: (charId: CharacterId, topColor: string, bottomColor: string) => void;
  onClose: () => void;
}

const TOP_COLORS = [
  { name: 'Crisp Oxford White', hex: '#f8fafc' },
  { name: 'Gujarat Saffron', hex: '#f59e0b' },
  { name: 'Royal Sky Blue', hex: '#0284c7' },
  { name: 'Crimson Flame', hex: '#e11d48' },
  { name: 'Forest Emerald', hex: '#15803d' },
  { name: 'Street Shadow Black', hex: '#0f172a' },
];

const BOTTOM_COLORS = [
  { name: 'Tailored Beige Chino', hex: '#b45309' },
  { name: 'Raw Denim Indigo', hex: '#1e293b' },
  { name: 'Urban Cargo Slate', hex: '#334155' },
  { name: 'Sandstone Khaki', hex: '#78350f' },
  { name: 'Midnight Charcoal', hex: '#0f172a' },
];

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  activeCharacter,
  onUpdateOutfit,
  onClose,
}) => {
  const char = CHARACTERS[activeCharacter];
  const [topColor, setTopColor] = useState(char.outfit.topColor);
  const [bottomColor, setBottomColor] = useState(char.outfit.bottomColor);

  const handleApply = () => {
    soundManager.playClick();
    onUpdateOutfit(activeCharacter, topColor, bottomColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-game text-xl font-bold text-white tracking-wide">
                WARDROBE & CLOTHING
              </h2>
              <p className="text-xs text-slate-400">
                Styling {char.name} ({char.role})
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

        {/* Customization Options */}
        <div className="p-6 space-y-6">
          {/* Top / Shirt Color */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Top / Shirt / Jacket Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TOP_COLORS.map((tc) => (
                <button
                  key={tc.hex}
                  onClick={() => {
                    soundManager.playClick();
                    setTopColor(tc.hex);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs text-left transition-all cursor-pointer ${
                    topColor === tc.hex
                      ? 'border-amber-400 bg-slate-800 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: tc.hex }}
                  />
                  <span className="truncate">{tc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom / Jeans Color */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Bottom / Trousers / Jeans Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BOTTOM_COLORS.map((bc) => (
                <button
                  key={bc.hex}
                  onClick={() => {
                    soundManager.playClick();
                    setBottomColor(bc.hex);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs text-left transition-all cursor-pointer ${
                    bottomColor === bc.hex
                      ? 'border-amber-400 bg-slate-800 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: bc.hex }}
                  />
                  <span className="truncate">{bc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> WEAR OUTFIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
