import { SCORE_LABELS, RubricMap } from '../types';
import { useState } from 'react';

interface ScoreInputProps {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  rubrics: RubricMap;
}

const SCORE_COLORS: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-lime-500',
  5: 'bg-emerald-500',
};

export function ScoreInput({ label, description, value, onChange, rubrics }: ScoreInputProps) {
  const [showAll, setShowAll] = useState(false);
  const currentRubric = rubrics[value] || SCORE_LABELS[value];

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
                ? `${SCORE_COLORS[score]} text-white border-transparent shadow-md scale-105`
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
            }`}
          >
            {score}
          </button>
        ))}
      </div>

      {/* Current Selection Definition */}
      <div className={`mt-3 p-2.5 rounded-lg text-xs border ${
        value <= 2 ? 'bg-red-50 border-red-100 text-red-800' : 
        value === 3 ? 'bg-yellow-50 border-yellow-100 text-yellow-800' : 
        'bg-emerald-50 border-emerald-100 text-emerald-800'
      }`}>
        <span className="font-bold">{SCORE_LABELS[value]}:</span> {currentRubric}
      </div>

      {/* Expanded View for all rubrics */}
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
