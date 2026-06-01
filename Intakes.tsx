import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Calendar, Clock } from 'lucide-react';

export function Intakes() {
  const { intakes, addIntake, updateIntake, deleteIntake, user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', startDate: '' });

  const isAdmin = user?.role === 'admin';

  const handleAdd = () => {
    if (formData.name && formData.startDate) {
      addIntake({ id: '', ...formData });
      setFormData({ name: '', startDate: '' });
      setIsAdding(false);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (formData.name && formData.startDate) {
      updateIntake({ id, ...formData });
      setEditingId(null);
      setFormData({ name: '', startDate: '' });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this intake? This selection cannot be undone.')) {
      deleteIntake(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-primary">Enrollment Intakes</h1>
          <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-xs">Calendar & Scheduling Management</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Intake
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Intake Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Commencement Date</th>
                {isAdmin && <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold">
              {isAdding && (
                <tr className="bg-blue-50/30">
                  <td className="px-8 py-4">
                    <input 
                      autoFocus
                      className="h-10 bg-white border border-gray-200 px-3 rounded-md outline-none focus:ring-2 focus:ring-primary w-full max-w-xs"
                      placeholder="Intake Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </td>
                  <td className="px-8 py-4">
                    <input 
                      className="h-10 bg-white border border-gray-200 px-3 rounded-md outline-none focus:ring-2 focus:ring-primary w-full max-w-xs"
                      placeholder="Start Date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </td>
                  <td className="px-8 py-4 text-right flex justify-end gap-2">
                    <button onClick={handleAdd} className="bg-primary text-white px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest">Confirm</button>
                    <button onClick={() => setIsAdding(false)} className="bg-gray-200 text-gray-500 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest">Cancel</button>
                  </td>
                </tr>
              )}
              {intakes.map((intake) => {
                const isEditing = editingId === intake.id;
                if (isEditing) {
                  return (
                    <tr key={intake.id} className="bg-blue-50/30">
                      <td className="px-8 py-4">
                        <input 
                          autoFocus
                          className="h-10 bg-white border border-gray-200 px-3 rounded-md outline-none focus:ring-2 focus:ring-primary w-full max-w-xs"
                          placeholder="Intake Name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </td>
                      <td className="px-8 py-4">
                        <input 
                          className="h-10 bg-white border border-gray-200 px-3 rounded-md outline-none focus:ring-2 focus:ring-primary w-full max-w-xs"
                          placeholder="Start Date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                      </td>
                      <td className="px-8 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleSaveEdit(intake.id)} className="bg-primary text-white px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest">Save</button>
                        <button onClick={() => setEditingId(null)} className="bg-gray-200 text-gray-500 px-4 py-2 rounded text-[9px] font-black uppercase tracking-widest">Cancel</button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={intake.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-gray-900 tracking-tight">{intake.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{intake.startDate}</span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => { setEditingId(intake.id); setFormData({ name: intake.name, startDate: intake.startDate }); }}
                            className="p-2 text-gray-300 hover:text-primary transition-colors inline-block"
                            title="Edit Intake"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(intake.id)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors inline-block"
                            title="Delete Intake"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
