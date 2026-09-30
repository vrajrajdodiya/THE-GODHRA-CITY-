import React, { useState } from 'react';
import { CharacterId, VehicleStats } from '../types/game';
import { soundManager } from '../audio/SoundManager';
import { X, Wrench, Shield, Zap, Palette, Gauge, Check } from 'lucide-react';

interface GarageModalProps {
  vehicles: VehicleStats[];
  activeVehicleId: string | null;
  activeCharacter: CharacterId;
  money: number;
  onSelectVehicle: (id: string) => void;
  onRepairVehicle: (id: string, cost: number) => void;
  onUpgradeVehicle: (id: string, type: 'engine' | 'brakes' | 'tires', cost: number) => void;
  onRepaintVehicle: (id: string, colorHex: number, colorName: string) => void;
  onClose: () => void;
}

const PAINT_COLORS = [
  { name: 'Sunset Orange', hex: 0xea580c, bg: 'bg-orange-600' },
  { name: 'Ocean Blue', hex: 0x0284c7, bg: 'bg-sky-600' },
  { name: 'Crimson Red', hex: 0xe11d48, bg: 'bg-rose-600' },
  { name: 'Gujarat Saffron', hex: 0xf59e0b, bg: 'bg-amber-500' },
  { name: 'Emerald Green', hex: 0x059669, bg: 'bg-emerald-600' },
  { name: 'Obsidian Black', hex: 0x0f172a, bg: 'bg-slate-900' },
];

export const GarageModal: React.FC<GarageModalProps> = ({
  vehicles,
  activeVehicleId,
  activeCharacter,
  money,
  onSelectVehicle,
  onRepairVehicle,
  onUpgradeVehicle,
  onRepaintVehicle,
  onClose,
}) => {
  const [selectedVehId, setSelectedVehId] = useState<string>(activeVehicleId || vehicles[0].id);
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehId) || vehicles[0];

  const isJD = activeCharacter === 'jd';
  const repairCost = Math.round((100 - selectedVehicle.health) * 2 * (isJD ? 0.9 : 1.0));
  const engineCost = Math.round(300 * (selectedVehicle.upgradeEngine + 1) * (isJD ? 0.9 : 1.0));
  const brakesCost = Math.round(200 * (selectedVehicle.upgradeBrakes + 1) * (isJD ? 0.9 : 1.0));
  const tiresCost = Math.round(200 * (selectedVehicle.upgradeTires + 1) * (isJD ? 0.9 : 1.0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-game text-2xl font-bold text-white tracking-wide">
                JD AUTO GARAGE & WORKSHOP
              </h2>
              <p className="text-xs text-slate-400">
                Tune, repair, paint and inspect all owned vehicles
                {isJD && <span className="text-emerald-400 font-semibold ml-1">· 10% JD Mechanic Discount Active!</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-game text-lg font-bold text-emerald-400 font-mono">
              💰 ₹{money.toLocaleString('en-IN')}
            </span>
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
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 overflow-y-auto">
          {/* Left Column: Vehicle Selection List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Vehicle
            </span>
            {vehicles.map((v) => {
              const isSelected = v.id === selectedVehId;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedVehId(v.id);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-game text-base font-bold text-white">
                      {v.name}
                    </div>
                    <span className="text-xs text-slate-400 capitalize">
                      {v.type}
                    </span>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: v.color }}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column (2 cols): Vehicle Details, Stats & Upgrades */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-6">
            <div>
              {/* Title & Type Banner */}
              <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h3 className="font-game text-2xl font-bold text-white">
                    {selectedVehicle.name}
                  </h3>
                  <p className="text-xs text-slate-400 capitalize">
                    Category: {selectedVehicle.type}
                  </p>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onSelectVehicle(selectedVehicle.id);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> SET ACTIVE
                </button>
              </div>

              {/* Stats Bars */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Top Speed
                    </span>
                    <span className="font-bold text-white font-mono">{selectedVehicle.topSpeed}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full"
                      style={{ width: `${(selectedVehicle.topSpeed / 35) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Acceleration
                    </span>
                    <span className="font-bold text-white font-mono">{selectedVehicle.acceleration}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full"
                      style={{ width: `${(selectedVehicle.acceleration / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" /> Condition / Health
                    </span>
                    <span className="font-bold text-white font-mono">{selectedVehicle.health}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full"
                      style={{ width: `${selectedVehicle.health}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Handling & Drift</span>
                    <span className="font-bold text-white font-mono">{selectedVehicle.handling} / 10</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-400 h-full"
                      style={{ width: `${(selectedVehicle.handling / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Upgrades Section */}
              <div className="mt-5 space-y-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Performance Upgrades & Repair
                </span>

                {/* Repair Button */}
                <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-white block">Full Body Repair & Tune</span>
                    <span className="text-[11px] text-slate-400">Restore to 100% durability</span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onRepairVehicle(selectedVehicle.id, repairCost);
                    }}
                    disabled={selectedVehicle.health >= 100 || money < repairCost}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedVehicle.health >= 100
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : money < repairCost
                        ? 'bg-slate-800 text-red-400'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {selectedVehicle.health >= 100 ? 'PRISTINE' : `REPAIR (₹${repairCost})`}
                  </button>
                </div>

                {/* Engine Upgrade */}
                <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Engine Boost (Level {selectedVehicle.upgradeEngine} / 3)
                    </span>
                    <span className="text-[11px] text-slate-400">+15% Top speed & acceleration</span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onUpgradeVehicle(selectedVehicle.id, 'engine', engineCost);
                    }}
                    disabled={selectedVehicle.upgradeEngine >= 3 || money < engineCost}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedVehicle.upgradeEngine >= 3
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : money < engineCost
                        ? 'bg-slate-800 text-red-400'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    {selectedVehicle.upgradeEngine >= 3 ? 'MAXED' : `UPGRADE (₹${engineCost})`}
                  </button>
                </div>
              </div>

              {/* Custom Paint Selector */}
              <div className="mt-5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Custom Paint Finish
                </span>
                <div className="flex items-center gap-2">
                  {PAINT_COLORS.map((paint) => (
                    <button
                      key={paint.hex}
                      onClick={() => {
                        soundManager.playClick();
                        onRepaintVehicle(selectedVehicle.id, paint.hex, paint.name);
                      }}
                      className={`w-9 h-9 rounded-xl border-2 transition-transform active:scale-95 cursor-pointer ${paint.bg} ${
                        selectedVehicle.colorHex === paint.hex ? 'border-white scale-110 shadow-lg' : 'border-slate-800 opacity-80'
                      }`}
                      title={paint.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
