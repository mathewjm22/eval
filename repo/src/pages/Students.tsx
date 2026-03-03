import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppData } from '../context';
import { StudentProfile } from '../types';

const EMPTY_STUDENT: Omit<StudentProfile, 'id'> = {
  name: '',
  email: '',
  program: '',
  yearLevel: '',
  startDate: '',
};

export function Students() {
  const { data, addStudent, updateStudent, deleteStudent } = useAppData();
  const [editing, setEditing] = useState<StudentProfile | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleNew = () => {
    setEditing({ ...EMPTY_STUDENT, id: uuidv4() });
    setIsNew(true);
  };

  const handleEdit = (s: StudentProfile) => {
    setEditing({ ...s });
    setIsNew(false);
  };

  const handleSave = () => {
    if (!editing || !editing.name.trim()) return;
    if (isNew) {
      addStudent(editing);
    } else {
      updateStudent(editing);
    }
    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setShowDeleteConfirm(null);
  };

  const evalCount = (id: string) => data.evaluations.filter(e => e.studentId === id).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">👨‍🎓 Students</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your student roster</p>
        </div>
        <button
          onClick={handleNew}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
        >
          + Add Student
        </button>
      </div>

      {/* Student Cards */}
      {data.students.length === 0 && !editing ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">👨‍🎓</div>
          <h3 className="text-lg font-semibold text-slate-700">No students yet</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6">Add your first student to start creating evaluations.</p>
          <button
            onClick={handleNew}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            + Add First Student
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.students.map((student) => (
            <div key={student.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{student.name}</h3>
                    <p className="text-xs text-slate-400">{student.program} • {student.yearLevel}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                {student.email && (
                  <p className="flex items-center gap-2">
                    <span>📧</span> {student.email}
                  </p>
                )}
                {student.startDate && (
                  <p className="flex items-center gap-2">
                    <span>📅</span> Started: {student.startDate}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <span>📝</span> {evalCount(student.id)} evaluation{evalCount(student.id) !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(student)}
                  className="flex-1 text-sm px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Edit
                </button>
                {showDeleteConfirm === student.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-sm px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="text-sm px-3 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(student.id)}
                    className="text-sm px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setEditing(null); setIsNew(false); }}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {isNew ? '➕ Add New Student' : '✏️ Edit Student'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="e.g., Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editing.email}
                  onChange={e => setEditing({ ...editing, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="student@university.edu"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
                  <select
                    value={editing.program}
                    onChange={e => setEditing({ ...editing, program: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  >
                    <option value="">Select...</option>
                    <option value="MD">MD</option>
                    <option value="DO">DO</option>
                    <option value="PA">PA</option>
                    <option value="NP">NP</option>
                    <option value="Residency">Residency</option>
                    <option value="Fellowship">Fellowship</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year Level</label>
                  <select
                    value={editing.yearLevel}
                    onChange={e => setEditing({ ...editing, yearLevel: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  >
                    <option value="">Select...</option>
                    <option value="MS-1">MS-1</option>
                    <option value="MS-2">MS-2</option>
                    <option value="MS-3">MS-3</option>
                    <option value="MS-4">MS-4</option>
                    <option value="PGY-1">PGY-1</option>
                    <option value="PGY-2">PGY-2</option>
                    <option value="PGY-3">PGY-3</option>
                    <option value="PGY-4">PGY-4</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={editing.startDate}
                  onChange={e => setEditing({ ...editing, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => { setEditing(null); setIsNew(false); }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editing.name.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
              >
                {isNew ? 'Add Student' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
