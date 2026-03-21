import React, { useState, useEffect } from "react";
import { X, Calendar, User, Search, BookOpen, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAppData } from "../context";
import { AdHocTeaching, TEACHING_TOPIC_CATEGORIES, TeachingTopic } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teaching?: AdHocTeaching;
  prefilledStudentId?: string;
}

export const AdHocTeachingModal = ({ isOpen, onClose, teaching, prefilledStudentId }: Props) => {
  const { data, saveTeaching, deleteTeaching } = useAppData();

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [topics, setTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState("");
  const [customTopicCategory, setCustomTopicCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { updateCustomTopicMapping } = useAppData();

  useEffect(() => {
    if (isOpen) {
      if (teaching) {
        setSelectedStudentIds(teaching.studentIds || []);
        setDate(teaching.date); // it's already a "YYYY-MM-DD" string in the data model!
        const flatTopics = teaching.teachingTopics.flatMap(t => t.topics) || [];
        setTopics(flatTopics);
        setCustomTopic("");
      } else {
        setSelectedStudentIds(prefilledStudentId ? [prefilledStudentId] : []);
        setDate(format(new Date(), "yyyy-MM-dd"));
        setTopics([]);
        setCustomTopic("");
      }
      setSearchQuery("");
    }
  }, [isOpen, teaching, prefilledStudentId]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (selectedStudentIds.length === 0 || topics.length === 0) return;

    // Group selected topics into TeachingTopic structure
    const teachingTopics: TeachingTopic[] = [];
    const customTopics: string[] = [];

    // Check which category each selected topic belongs to
    topics.forEach(topic => {
      let foundCategory = false;
      for (const category of TEACHING_TOPIC_CATEGORIES) {
        if (category.topics.includes(topic)) {
          let existingCat = teachingTopics.find(t => t.category === category.category);
          if (existingCat) {
            existingCat.topics.push(topic);
          } else {
            teachingTopics.push({ category: category.category, topics: [topic] });
          }
          foundCategory = true;
          break;
        }
      }
      if (!foundCategory) {
        customTopics.push(topic);
      }
    });

    if (customTopics.length > 0) {
      teachingTopics.push({ category: "Custom Topics", topics: customTopics });
    }

    const newTeaching: AdHocTeaching = {
      id: teaching?.id || crypto.randomUUID(),
      date: date, // Keep it exactly as the "YYYY-MM-DD" local date string from the input
      studentIds: selectedStudentIds,
      teachingTopics
    };

    if (saveTeaching) {
      await saveTeaching(newTeaching);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!teaching?.id) return;
    if (window.confirm("Are you sure you want to delete this teaching session?")) {
      if (deleteTeaching) {
        await deleteTeaching(teaching.id);
      }
      onClose();
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleTopic = (topic: string) => {
    setTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const addCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim() && !topics.includes(customTopic.trim())) {
      const newTopic = customTopic.trim();
      setTopics(prev => [...prev, newTopic]);
      if (customTopicCategory) {
        updateCustomTopicMapping(newTopic, customTopicCategory);
      }
      setCustomTopic("");
      setCustomTopicCategory("");
    }
  };

  const activeStudents = data.students;

  const allAvailableTopics = TEACHING_TOPIC_CATEGORIES.flatMap(c => c.topics);
  const customAddedTopics = topics.filter(t => !allAvailableTopics.includes(t));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1f2e] w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Log Teaching Session</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Record ad-hoc topics covered</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Date & Students Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Students Present
              </label>
              <div className="flex flex-wrap gap-2">
                {activeStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedStudentIds.includes(student.id)
                        ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                        : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                      {student.name.charAt(0)}
                    </div>
                    {student.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topics Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                Topics Covered
              </label>
              <div className="relative w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* Custom Topic Input */}
            <form onSubmit={addCustomTopic} className="flex flex-col gap-2">
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="Add custom write-in topic..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                />
                <select
                  value={customTopicCategory}
                  onChange={(e) => setCustomTopicCategory(e.target.value)}
                  className="w-48 px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black/20 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                >
                  <option value="">N/A (Other)</option>
                  {TEACHING_TOPIC_CATEGORIES.map(cat => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!customTopic.trim()}
                  className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </form>

            <div className="bg-gray-50 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 p-4 max-h-64 overflow-y-auto space-y-6">
              {/* Custom Added Topics */}
              {customAddedTopics.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold tracking-wider text-purple-500 uppercase">Custom Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {customAddedTopics.map(topic => (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                          topics.includes(topic)
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400"
                            : "bg-white dark:bg-[#1a1f2e] border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-purple-500/30"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Topics Grouped */}
              {TEACHING_TOPIC_CATEGORIES.map(({ category, topics: categoryTopics }) => {
                const visibleTopics = categoryTopics.filter(t =>
                  t.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (visibleTopics.length === 0) return null;

                return (
                  <div key={category} className="space-y-3">
                    <h4 className="text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {visibleTopics.map(topic => (
                        <button
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                            topics.includes(topic)
                              ? "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                              : "bg-white dark:bg-[#1a1f2e] border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-blue-500/30"
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-black/20 rounded-b-2xl">
          {teaching && (
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={selectedStudentIds.length === 0 || topics.length === 0}
              className="px-5 py-2.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:shadow-none"
            >
              {teaching ? "Update" : "Save"} Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
