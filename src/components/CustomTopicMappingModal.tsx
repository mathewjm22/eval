import { useState, useEffect } from 'react';
import { useAppData } from '../context';
import { TEACHING_TOPIC_CATEGORIES } from '../types';

export function CustomTopicMappingModal() {
  const { data, updateCustomTopicMapping } = useAppData();
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const evt = e as CustomEvent;
      const t = evt.detail?.topic;
      if (t) {
        setTopic(t);
        // Pre-fill existing mapped category if one exists
        const existingCategory = data.customTopicMappings?.[t] || null;
        setSelectedCategory(existingCategory);
        setIsOpen(true);
      }
    };

    window.addEventListener('open-custom-topic-modal', handleOpen);
    return () => window.removeEventListener('open-custom-topic-modal', handleOpen);
  }, [data.customTopicMappings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Assign Category
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Assign <strong className="text-slate-900 dark:text-white">"{topic}"</strong> to a specific specialty category. This applies globally to all uses of this custom topic.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Specialty Category
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
              >
                <option value="">N/A (Other)</option>
                {TEACHING_TOPIC_CATEGORIES.map(cat => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 flex gap-3 justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              updateCustomTopicMapping(topic, selectedCategory);
              setIsOpen(false);
            }}
            className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            Save Category
          </button>
        </div>
      </div>
    </div>
  );
}
