import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import {
  Plus, Search, Pin, PinOff, Trash2, Edit3, Paperclip,
  Image as ImageIcon, FileText, X, Upload, Download, Eye,
} from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#f97316', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#ec4899'];

export default function IdeasPage() {
  const { showToast } = useOutletContext();
  const [ideas, setIdeas] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editIdea, setEditIdea] = useState(null);
  const [preview, setPreview] = useState(null);

  const loadIdeas = useCallback(async () => {
    try {
      const data = await api.ideas.list({ search });
      setIdeas(data);
    } catch (err) { showToast(err.message, 'error'); }
  }, [search, showToast]);

  useEffect(() => { loadIdeas(); }, [loadIdeas]);

  const handleSave = async (data, files) => {
    try {
      let idea;
      if (data.id) {
        idea = await api.ideas.update(data.id, data);
        showToast('Idée mise à jour');
      } else {
        idea = await api.ideas.create(data);
        showToast('Idée créée');
      }
      if (files && files.length > 0) {
        await api.files.upload(files, idea.id);
      }
      setShowModal(false);
      setEditIdea(null);
      loadIdeas();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    try {
      await api.ideas.delete(id);
      showToast('Idée supprimée');
      loadIdeas();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleTogglePin = async (idea) => {
    try {
      await api.ideas.update(idea.id, { pinned: !idea.pinned });
      loadIdeas();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await api.files.delete(fileId);
      showToast('Fichier supprimé');
      loadIdeas();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const isImage = (mime) => mime?.startsWith('image/');

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Idées & Ressources</h1>
          <p className="text-sm text-slate-500 mt-1">Tes idées, screenshots, fichiers et notes de projet</p>
        </div>
        <button onClick={() => { setEditIdea(null); setShowModal(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Nouvelle idée
        </button>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une idée..."
          className="input-field !pl-10 text-sm !py-2"
        />
      </div>

      {ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600">
          <FileText className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">Aucune idée pour le moment</p>
          <p className="text-sm mt-1">Clique sur "Nouvelle idée" pour commencer</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="break-inside-avoid glass rounded-xl overflow-hidden fade-in group"
              style={{ borderLeftWidth: '3px', borderLeftColor: idea.color }}
            >
              {idea.files?.filter((f) => isImage(f.mime_type)).length > 0 && (
                <div className="grid grid-cols-2 gap-0.5">
                  {idea.files.filter((f) => isImage(f.mime_type)).slice(0, 4).map((file) => (
                    <img
                      key={file.id}
                      src={`/uploads/${file.filename}`}
                      alt={file.original_name}
                      className="w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setPreview(file)}
                    />
                  ))}
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-white leading-snug">{idea.title}</h3>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleTogglePin(idea)} className="p-1 rounded-md hover:bg-dark-500 text-slate-500 hover:text-amber-400 transition-all">
                      {idea.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => { setEditIdea(idea); setShowModal(true); }} className="p-1 rounded-md hover:bg-dark-500 text-slate-500 hover:text-white transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(idea.id)} className="p-1 rounded-md hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {idea.pinned && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md mb-2">
                    <Pin className="w-3 h-3" /> Épinglé
                  </span>
                )}

                {idea.content && (
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap mb-3">{idea.content}</p>
                )}

                {idea.files?.filter((f) => !isImage(f.mime_type)).length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {idea.files.filter((f) => !isImage(f.mime_type)).map((file) => (
                      <a
                        key={file.id}
                        href={`/uploads/${file.filename}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-fivem bg-dark-700/50 px-3 py-2 rounded-lg transition-all"
                      >
                        <Paperclip className="w-3 h-3 shrink-0" />
                        <span className="truncate flex-1">{file.original_name}</span>
                        <Download className="w-3 h-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-600">
                  <span>par {idea.author}</span>
                  <span>{new Date(idea.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <IdeaModal
          idea={editIdea}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditIdea(null); }}
        />
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm modal-overlay" onClick={() => setPreview(null)}>
          <button onClick={() => setPreview(null)} className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <img src={`/uploads/${preview.filename}`} alt={preview.original_name} className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg modal-content" />
        </div>
      )}
    </div>
  );
}

function IdeaModal({ idea, onSave, onClose }) {
  const [form, setForm] = useState({
    title: idea?.title || '',
    content: idea?.content || '',
    color: idea?.color || '#6366f1',
    pinned: idea?.pinned || false,
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    await onSave({ ...form, ...(idea?.id && { id: idea.id }) }, files);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg glass rounded-2xl modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-lg font-semibold text-white">{idea ? 'Modifier l\'idée' : 'Nouvelle idée'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-500 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Titre</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              placeholder="Nom de l'idée..."
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="input-field resize-none"
              rows={5}
              placeholder="Détails, notes, liens..."
            />
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Couleur</label>
              <div className="flex items-center gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-6 h-6 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-600' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-dark-500 rounded-full peer peer-checked:bg-amber-500/30 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-slate-400 after:transition-all peer-checked:after:translate-x-4 peer-checked:after:bg-amber-400" />
              <span className="text-xs text-slate-400">Épingler</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Fichiers / Images</label>
            <div className="border-2 border-dashed border-dark-400 rounded-xl p-4 text-center hover:border-fivem/30 transition-colors">
              <input
                type="file"
                multiple
                onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}
                className="hidden"
                id="file-input"
                accept="image/*,.pdf,.txt,.md,.zip,.rar,.lua,.js,.json,.cfg,.yaml,.yml"
              />
              <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-slate-500" />
                <span className="text-xs text-slate-500">Cliquer pour ajouter des fichiers</span>
                <span className="text-[10px] text-slate-600">Images, PDF, scripts, configs...</span>
              </label>
            </div>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-400 bg-dark-700/50 px-3 py-1.5 rounded-lg">
                    {f.type.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    <span className="truncate flex-1">{f.name}</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-slate-600 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-dark-400/50">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Annuler</button>
            <button type="submit" disabled={loading || !form.title.trim()} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {idea ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
