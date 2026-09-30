import React from 'react';
import { LANDMARKS } from '../data/landmarks';
import { soundManager } from '../audio/SoundManager';
import { X, MapPin, Navigation } from 'lucide-react';

interface MapModalProps {
  playerPos: [number, number, number];
  playerHeading: number;
  objectivePos: [number, number, number] | null;
  onClose: () => void;
}

export const MapModal: React.FC<MapModalProps> = ({
  playerPos,
  playerHeading,
  objectivePos,
  onClose,
}) => {
  // Convert 3D world coord (-100 to 100) to SVG viewbox (0 to 600)
  const toSvgX = (worldX: number) => ((worldX + 110) / 220) * 600;
  const toSvgY = (worldZ: number) => ((worldZ + 110) / 220) * 600;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="font-game text-2xl font-bold text-white tracking-wide">
              GODHRA CITY MAP (ગોધરા શહેર નકશો)
            </h2>
            <p className="text-xs text-slate-400">
              10 Landmark Zones · Open World Navigation
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

        {/* Map Canvas / SVG Area */}
        <div className="relative p-6 flex flex-col items-center justify-center overflow-auto bg-slate-950">
          <div className="relative w-full max-w-2xl aspect-square bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner overflow-hidden">
            <svg viewBox="0 0 600 600" className="w-full h-full">
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="600" height="600" fill="url(#grid)" />

              {/* Roads */}
              {/* East-West Main St */}
              <line
                x1={toSvgX(-100)}
                y1={toSvgY(0)}
                x2={toSvgX(100)}
                y2={toSvgY(0)}
                stroke="#334155"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <line
                x1={toSvgX(-100)}
                y1={toSvgY(0)}
                x2={toSvgX(100)}
                y2={toSvgY(0)}
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="8 6"
              />

              {/* North-South Main St */}
              <line
                x1={toSvgX(0)}
                y1={toSvgY(-100)}
                x2={toSvgX(0)}
                y2={toSvgY(100)}
                stroke="#334155"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <line
                x1={toSvgX(0)}
                y1={toSvgY(-100)}
                x2={toSvgX(0)}
                y2={toSvgY(100)}
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="8 6"
              />

              {/* Highway */}
              <line
                x1={toSvgX(-110)}
                y1={toSvgY(95)}
                x2={toSvgX(110)}
                y2={toSvgY(95)}
                stroke="#475569"
                strokeWidth="30"
              />
              <line
                x1={toSvgX(-110)}
                y1={toSvgY(95)}
                x2={toSvgX(110)}
                y2={toSvgY(95)}
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="10 8"
              />

              {/* Side connector roads */}
              <line x1={toSvgX(-55)} y1={toSvgY(-50)} x2={toSvgX(-55)} y2={toSvgY(50)} stroke="#334155" strokeWidth="16" />
              <line x1={toSvgX(50)} y1={toSvgY(-80)} x2={toSvgX(50)} y2={toSvgY(30)} stroke="#334155" strokeWidth="16" />

              {/* Center Clock Tower Roundabout */}
              <circle cx={toSvgX(0)} cy={toSvgY(0)} r="32" fill="#0f172a" stroke="#38bdf8" strokeWidth="5" />

              {/* GPS Waypoint Route */}
              {objectivePos && (
                <line
                  x1={toSvgX(playerPos[0])}
                  y1={toSvgY(playerPos[2])}
                  x2={toSvgX(objectivePos[0])}
                  y2={toSvgY(objectivePos[2])}
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                />
              )}

              {/* Landmarks */}
              {LANDMARKS.map((lm) => {
                const sx = toSvgX(lm.position[0]);
                const sy = toSvgY(lm.position[2]);
                return (
                  <g key={lm.id} className="cursor-pointer group">
                    <circle cx={sx} cy={sy} r="9" fill={lm.color} stroke="#ffffff" strokeWidth="2" />
                    <text
                      x={sx}
                      y={sy - 13}
                      fill="#f8fafc"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="select-none pointer-events-none drop-shadow"
                    >
                      {lm.name}
                    </text>
                  </g>
                );
              })}

              {/* Player Position Indicator */}
              <g transform={`translate(${toSvgX(playerPos[0])}, ${toSvgY(playerPos[2])}) rotate(${(playerHeading * 180) / Math.PI})`}>
                <circle cx="0" cy="0" r="10" fill="rgba(56, 189, 248, 0.3)" />
                <polygon points="0,-12 8,8 0,4 -8,8" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
              </g>

              {/* Objective Indicator */}
              {objectivePos && (
                <g transform={`translate(${toSvgX(objectivePos[0])}, ${toSvgY(objectivePos[2])})`}>
                  <circle cx="0" cy="0" r="12" fill="none" stroke="#f59e0b" strokeWidth="3" className="animate-ping" />
                  <circle cx="0" cy="0" r="7" fill="#f59e0b" />
                </g>
              )}
            </svg>
          </div>

          {/* Legend / Key */}
          <div className="w-full max-w-2xl mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
            {LANDMARKS.slice(0, 10).map((lm) => (
              <div key={lm.id} className="flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: lm.color }} />
                <span className="truncate text-slate-300">{lm.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
