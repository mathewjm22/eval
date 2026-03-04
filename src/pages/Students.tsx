import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context';
import { StudentProfile } from '../types';

const YEAR_LEVELS = ['MS1', 'MS2', 'MS3', 'MS4', 'PGY1', 'PGY2', 'PGY3', 'PGY4', 'Fellow', 'Other'];
const PROGRAMS = ['MD', 'DO', 'PA', 'NP', 'RN', 'PharmD', 'Other'];

const EMPTY_FORM: Omit<StudentProfile, 'id'> = {
  name: '',
  program: 'MD',
  yearLevel: 'MS3',
  startDate: new Date().toISOString().split('T')[0],
};

export function Students() {
  const { data, addStudent, updateStudent, deleteStudent } = useAppData();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<StudentProfile, 'id'>>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const evalCountFor = (id: string) => data.evaluations.filter(e => e.studentId === id).length;

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (s: StudentProfile) => {
    setForm({ name: s.name, program: s.program, yearLevel: s.yearLevel, startDate: s.startDate });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      const existing = data.students.find(s => s.id === editingId)!;
      updateStudent({ ...existing, ...form });
    } else {
      addStudent({ id: uuidv4(), ...form });
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">👥 Students</h2>
          <p className="text-sm text-slate-400 mt-1">
            {data.students.length} student{data.students.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
        >
          + Add Student
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">
            {editingId ? '✏️ Edit Student' : '➕ Add New Student'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Jane Smith"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Program
              </label>
              <select
                value={form.program}
                onChange={e => setForm(f => ({ ...f, program: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              >
                {PROGRAMS.map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Year Level
              </label>
              <select
                value={form.yearLevel}
                onChange={e => setForm(f => ({ ...f, yearLevel: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              >
                {YEAR_LEVELS.map(y => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rotation Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
            >
              {editingId ? 'Update Student' : 'Save Student'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Student list */}
      {data.students.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-slate-700">
            No Students Yet
          </h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            Add your first student to get started with evaluations.
          </p>
          <button
            onClick={openAdd}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            Add First Student
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.students.map(s => {
            const evals = evalCountFor(s.id);
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">
                        {s.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {s.program} · {s.yearLevel}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    {deleteConfirm === s.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="px-2 py-1 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(s.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-indigo-600">
                      {evals}
                    </p>
                    <p className="text-xs text-slate-400">
                      Evaluation{evals !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-slate-600">
                      {s.startDate}
                    </p>
                    <p className="text-xs text-slate-400">Start Date</p>
                  </div>
                </div>

                {evals === 0 && (
                  <p className="text-xs text-amber-600 mt-3 text-center">
                    No evaluations yet
                  </p>
                )}

                {/* NEW: Rotation Summary button */}
                {evals > 0 && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(`/summary/${s.id}`)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 bg-white hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                    >
                      Rotation Summary
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
