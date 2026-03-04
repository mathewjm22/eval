import { SCORE_LABELS, RubricMap } from '../types';
import React, { useState } from 'react';
import { useTheme } from '../theme';

interface ScoreInputProps {
  key?: React.Key;
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  rubrics: RubricMap;
}

// Neon score colors
const NEON_SCORE_COLORS: Record<number, { bg: string; glow: string; label: string }> = {
  1: { bg: '#ff4757', glow: 'rgba(255,71,87,0.5)', label: '#ff4757' },
  2: { bg: '#ff6b35', glow: 'rgba(255,107,53,0.5)', label: '#ff6b35' },
  3: { bg: '#ffa502', glow: 'rgba(255,165,2,0.5)', label: '#ffa502' },
  4: { bg: '#c8ff00', glow: 'rgba(200,255,0,0.4)', label: '#c8ff00' },
  5: { bg: '#2ed573', glow: 'rgba(46,213,115,0.5)', label: '#2ed573' },
};

// Light mode Tailwind classes
const LIGHT_SCORE_COLORS: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-lime-500',
  5: 'bg-emerald-500',
};

export function ScoreInput({ label, description, value, onChange, rubrics }: ScoreInputProps) {
  const [showAll, setShowAll] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const currentRubric = rubrics[value] || SCORE_LABELS[value];

  const neonFeedback = (v: number) => {
    if (v <= 2) return { bg: 'rgba(255,71,87,0.1)', border: 'rgba(255,71,87,0.25)', color: '#ff4757' };
    if (v === 3) return { bg: 'rgba(255,165,2,0.1)', border: 'rgba(255,165,2,0.25)', color: '#ffa502' };
    return { bg: 'rgba(46,213,115,0.1)', border: 'rgba(46,213,115,0.25)', color: '#2ed573' };
  };

  if (isDark) {
    const fb = neonFeedback(value);
    return (
      <div
        className="rounded-xl p-4 transition-shadow relative overflow-hidden"
        style={{
          background: 'rgba(18,18,31,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        <div className="mb-3 flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>{label}</h4>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{description}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-xs hover:opacity-80 transition-opacity focus:outline-none flex-shrink-0 ml-2"
            style={{ color: '#ff2d78' }}
          >
            {showAll ? 'Hide Rubrics' : 'View Rubrics'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((score) => {
            const nc = NEON_SCORE_COLORS[score];
            const isActive = value === score;
            return (
              <button
                key={score}
                type="button"
                onClick={() => onChange(score)}
                className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                style={isActive ? {
                  background: nc.bg,
                  color: score === 4 ? '#0a0a0f' : '#ffffff',
                  border: `2px solid ${nc.bg}`,
                  boxShadow: `0 0 16px ${nc.glow}, 0 4px 12px rgba(0,0,0,0.3)`,
                  transform: 'scale(1.05)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.45)',
                  border: '2px solid rgba(255,255,255,0.08)',
                }}
              >
                {score}
              </button>
            );
          })}
        </div>

        {/* Current Selection Definition */}
        <div
          className="mt-3 p-2.5 rounded-lg text-xs"
          style={{
            background: fb.bg,
            border: `1px solid ${fb.border}`,
            color: fb.color,
          }}
        >
          <span className="font-bold">{SCORE_LABELS[value]}:</span>{' '}
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>{currentRubric}</span>
        </div>

        {/* Expanded rubrics */}
        {showAll && (
          <div
            className="mt-3 space-y-1.5 border-t pt-3"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            {[1, 2, 3, 4, 5].map((score) => (
              <div key={score} className="flex gap-2 text-xs">
                <span
                  className="font-bold w-4 flex-shrink-0"
                  style={{ color: score === value ? NEON_SCORE_COLORS[score].label : 'rgba(255,255,255,0.3)' }}
                >
                  {score}.
                </span>
                <p style={{ color: score === value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)' }}>
                  {rubrics[score]}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Light mode
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="mb-3 flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">{label}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-indigo-600 hover:underline cursor-pointer focus:outline-none"
        >
          {showAll ? 'Hide Rubrics' : 'View Rubrics'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border-2 ${
              value === score
                ? `${LIGHT_SCORE_COLORS[score]} text-white border-transparent shadow-md scale-105`
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
            }`}
          >
            {score}
          </button>
        ))}
      </div>

      <div className={`mt-3 p-2.5 rounded-lg text-xs border ${
        value <= 2 ? 'bg-red-50 border-red-100 text-red-800' :
        value === 3 ? 'bg-yellow-50 border-yellow-100 text-yellow-800' :
        'bg-emerald-50 border-emerald-100 text-emerald-800'
      }`}>
        <span className="font-bold">{SCORE_LABELS[value]}:</span> {currentRubric}
      </div>

      {showAll && (
        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
          {[1, 2, 3, 4, 5].map((score) => (
            <div key={score} className="flex gap-2 text-xs">
              <span className={`font-bold w-4 ${score === value ? 'text-indigo-600' : 'text-slate-400'}`}>
                {score}.
              </span>
              <p className={score === value ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                {rubrics[score]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
