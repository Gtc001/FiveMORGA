import { useState } from 'react';
import { X, Trash2, Save } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'À faire', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'En cours', color: 'bg-amber-500' },
  { value: 'testing', label: 'En test', color: 'bg-purple-500' },
  { value: 'done', label: 'Terminé', color: 'bg-emerald-500' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse', color: 'text-slate-400' },
  { value: 'medium', label: 'Moyenne', color: 'text-blue-400' },
  { value: 'high', label: 'Haute', color: 'text-amber-400' },
  { value: 'critical', label: 'Critique', color: 'text-red-400' },
];

export default function TaskModal({ task, categories, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    notes: task?.notes || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    category_id: task?.category_id || '',
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    await onSave({
      ...form,
      ...(task?.id && { id: task.id }),
      category_id: form.category_id || null,
    });
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    setLoading(true);
    await onDelete(task.id);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl glass rounded-2xl modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-lg font-semibold text-white">
            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-500 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Titre</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="input-field"
              placeholder="Nom de la tâche..."
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Description détaillée..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes / Idées</label>
            <textarea
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="input-field resize-none"
              rows={2}
              placeholder="Notes, idées, liens..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Statut</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="input-field text-sm"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Priorité</label>
              <select
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="input-field text-sm"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Catégorie</label>
              <select
                value={form.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Sans catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-dark-400/50">
            {task ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                  showDeleteConfirm
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {showDeleteConfirm ? 'Confirmer la suppression' : 'Supprimer'}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="btn-ghost text-sm">
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !form.title.trim()}
                className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {task ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
