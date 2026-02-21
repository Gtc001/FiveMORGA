import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import {
  Plus, Search, Pin, PinOff, Trash2, Edit3, Paperclip,
  Image as ImageIcon, FileText, X, Upload, Download,
  ChevronLeft, ChevronRight, ExternalLink, Link2, Video,
  ShoppingBag, StickyNote, Globe, ArrowLeft,
} from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#f97316', '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#ec4899'];
const LINK_TYPES = [
  { value: 'video', label: 'Vidéo', icon: Video, color: 'text-red-400' },
  { value: 'shop', label: 'Shop / Store', icon: ShoppingBag, color: 'text-emerald-400' },
  { value: 'script', label: 'Script / Repo', icon: FileText, color: 'text-violet-400' },
  { value: 'note', label: 'Note / Doc', icon: StickyNote, color: 'text-amber-400' },
  { value: 'other', label: 'Autre', icon: Globe, color: 'text-blue-400' },
];

const isImage = (mime) => mime?.startsWith('image/');
const getLinkType = (type) => LINK_TYPES.find((t) => t.value === type) || LINK_TYPES[4];

export default function IdeasPage() {
  const { showToast } = useOutletContext();
  const [ideas, setIdeas] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editIdea, setEditIdea] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const loadIdeas = useCallback(async () => {
    try {
      const data = await api.ideas.list({ search });
      setIdeas(data);
      if (selectedIdea) {
        const updated = data.find((i) => i.id === selectedIdea.id);
        if (updated) setSelectedIdea(updated);
      }
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
      if (selectedIdea?.id === id) setSelectedIdea(null);
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

  const openLightbox = (images, index) => {
    setLightbox({ images, index });
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Main list */}
      <div className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${selectedIdea ? 'hidden lg:block lg:w-1/2 xl:w-3/5' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Idées & Ressources</h1>
            <p className="text-sm text-slate-500 mt-1">Tes idées, screenshots, fichiers et notes</p>
          </div>
          <button onClick={() => { setEditIdea(null); setShowModal(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Nouvelle idée
          </button>
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field !pl-10 text-sm !py-2" />
        </div>

        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600">
            <FileText className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">Aucune idée pour le moment</p>
            <p className="text-sm mt-1">Clique sur "Nouvelle idée" pour commencer</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 xl:columns-3 gap-4 space-y-4">
            {ideas.map((idea) => {
              const images = idea.files?.filter((f) => isImage(f.mime_type)) || [];
              const fileCount = idea.files?.filter((f) => !isImage(f.mime_type)).length || 0;
              const linkCount = idea.links?.length || 0;

              return (
                <div
                  key={idea.id}
                  onClick={() => setSelectedIdea(idea)}
                  className={`break-inside-avoid glass rounded-xl overflow-hidden fade-in cursor-pointer transition-all hover:border-dark-300 ${
                    selectedIdea?.id === idea.id ? 'ring-1 ring-fivem/40 border-fivem/20' : ''
                  }`}
                  style={{ borderLeftWidth: '3px', borderLeftColor: idea.color }}
                >
                  {images.length > 0 && (
                    <div className={`grid ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-0.5`}>
                      {images.slice(0, 4).map((file, idx) => (
                        <div key={file.id} className="relative">
                          <img src={`/uploads/${file.filename}`} alt={file.original_name} className="w-full h-28 object-cover" />
                          {idx === 3 && images.length > 4 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">+{images.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start gap-2 mb-1">
                      {idea.pinned && <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                      <h3 className="text-sm font-semibold text-white leading-snug flex-1">{idea.title}</h3>
                    </div>

                    {idea.content && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{idea.content}</p>
                    )}

                    <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-600">
                      {images.length > 0 && (
                        <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" />{images.length}</span>
                      )}
                      {fileCount > 0 && (
                        <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" />{fileCount}</span>
                      )}
                      {linkCount > 0 && (
                        <span className="flex items-center gap-1"><Link2 className="w-3 h-3" />{linkCount}</span>
                      )}
                      <span className="ml-auto">{new Date(idea.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedIdea && (
        <IdeaDetailPanel
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onEdit={() => { setEditIdea(selectedIdea); setShowModal(true); }}
          onDelete={() => handleDelete(selectedIdea.id)}
          onTogglePin={() => handleTogglePin(selectedIdea)}
          onDeleteFile={handleDeleteFile}
          onOpenLightbox={openLightbox}
          onAddFiles={async (files) => {
            await api.files.upload(files, selectedIdea.id);
            showToast('Fichiers ajoutés');
            loadIdeas();
          }}
          onSaveNotes={async (notes) => {
            try {
              await api.ideas.update(selectedIdea.id, { notes });
              loadIdeas();
            } catch (err) { showToast(err.message, 'error'); }
          }}
        />
      )}

      {showModal && (
        <IdeaModal
          idea={editIdea}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditIdea(null); }}
        />
      )}

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

/* ──────────────────── Detail Panel ──────────────────── */

function IdeaDetailPanel({ idea, onClose, onEdit, onDelete, onTogglePin, onDeleteFile, onOpenLightbox, onAddFiles, onSaveNotes }) {
  const images = idea.files?.filter((f) => isImage(f.mime_type)) || [];
  const otherFiles = idea.files?.filter((f) => !isImage(f.mime_type)) || [];
  const links = idea.links || [];
  const fileInputRef = useRef(null);
  const [notesText, setNotesText] = useState(idea.notes || '');
  const [notesSaved, setNotesSaved] = useState(true);
  const notesTimer = useRef(null);

  useEffect(() => {
    setNotesText(idea.notes || '');
    setNotesSaved(true);
  }, [idea.id, idea.notes]);

  const handleNotesChange = (val) => {
    setNotesText(val);
    setNotesSaved(false);
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => {
      onSaveNotes(val);
      setNotesSaved(true);
    }, 1000);
  };

  const saveNotesNow = () => {
    clearTimeout(notesTimer.current);
    onSaveNotes(notesText);
    setNotesSaved(true);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onAddFiles(files);
  };

  return (
    <div
      className="w-full lg:w-1/2 xl:w-2/5 h-full border-l border-dark-400/50 bg-dark-800 overflow-y-auto slide-in"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFileDrop}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-800/95 backdrop-blur-sm border-b border-dark-400/50 p-4">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-600 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: idea.color }} />
          <h2 className="text-lg font-bold text-white flex-1 truncate">{idea.title}</h2>
          <div className="flex items-center gap-1">
            <button onClick={onTogglePin} className="p-2 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title={idea.pinned ? 'Désépingler' : 'Épingler'}>
              {idea.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
            <button onClick={onEdit} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-dark-600 transition-all" title="Modifier">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Supprimer">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="hidden lg:flex p-2 rounded-lg text-slate-500 hover:text-white hover:bg-dark-600 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
          <span>par {idea.author}</span>
          <span>•</span>
          <span>{new Date(idea.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          {idea.pinned && <span className="text-amber-400 flex items-center gap-1"><Pin className="w-3 h-3" />Épinglé</span>}
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Description */}
        {idea.content && (
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{idea.content}</p>
          </section>
        )}

        {/* Images gallery */}
        {images.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Images ({images.length})
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {images.map((file, idx) => (
                <div key={file.id} className="relative group rounded-xl overflow-hidden">
                  <img
                    src={`/uploads/${file.filename}`}
                    alt={file.original_name}
                    className="w-full h-40 object-cover cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => onOpenLightbox(images, idx)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white/80 truncate max-w-[60%]">{file.original_name}</span>
                    <div className="flex items-center gap-1">
                      <a
                        href={`/uploads/${file.filename}`}
                        download={file.original_name}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-all"
                        title="Télécharger"
                      >
                        <Download className="w-3 h-3" />
                      </a>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); }}
                        className="p-1.5 rounded-md bg-black/40 text-white/80 hover:text-red-400 hover:bg-black/60 transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Links */}
        {links.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Liens & Ressources</h3>
            <div className="space-y-2">
              {links.map((link, i) => {
                const lt = getLinkType(link.type);
                const Icon = lt.icon;
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50 border border-dark-400/30 hover:border-dark-300 hover:bg-dark-600/50 transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-dark-600 shrink-0 ${lt.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{link.label || link.url}</p>
                      <p className="text-[10px] text-slate-500 truncate">{link.url}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Files */}
        {otherFiles.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Fichiers ({otherFiles.length})
            </h3>
            <div className="space-y-2">
              {otherFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-700/50 border border-dark-400/30 group">
                  <Paperclip className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 truncate">{file.original_name}</p>
                    <p className="text-[10px] text-slate-600">{formatSize(file.size)}</p>
                  </div>
                  <a
                    href={`/uploads/${file.filename}`}
                    download={file.original_name}
                    className="p-2 rounded-lg text-slate-500 hover:text-fivem hover:bg-fivem/10 transition-all"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onDeleteFile(file.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Add files quick zone */}
        <section>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,.pdf,.txt,.md,.zip,.rar,.lua,.js,.json,.cfg,.yaml,.yml"
            onChange={(e) => { onAddFiles(Array.from(e.target.files)); e.target.value = ''; }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-dark-400/50 text-slate-500 hover:text-fivem hover:border-fivem/30 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">Ajouter des fichiers</span>
          </button>
          <p className="text-center text-[10px] text-slate-600 mt-1.5">ou glisser-déposer ici</p>
        </section>

        {/* Notes */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5" />
              Notes
            </h3>
            <span className={`text-[10px] transition-opacity ${notesSaved ? 'text-emerald-500/60' : 'text-amber-400/60'}`}>
              {notesSaved ? 'Sauvegardé' : 'Sauvegarde...'}
            </span>
          </div>
          <textarea
            value={notesText}
            onChange={(e) => handleNotesChange(e.target.value)}
            onBlur={saveNotesNow}
            className="w-full bg-dark-700/50 border border-dark-400/30 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-fivem/30 focus:ring-1 focus:ring-fivem/20 transition-all resize-none leading-relaxed"
            rows={5}
            placeholder="Écris tes notes ici... liens, remarques, idées, todo..."
          />
        </section>
      </div>
    </div>
  );
}

/* ──────────────────── Image Lightbox ──────────────────── */

function ImageLightbox({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const current = images[index];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
      if (e.key === 'ArrowRight') setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md modal-overlay" onClick={onClose}>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/70 font-medium tabular-nums">{index + 1} / {images.length}</span>
          <span className="text-xs text-white/40 truncate max-w-[200px]">{current.original_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/uploads/${current.filename}`}
            download={current.original_name}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white text-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </a>
          <button onClick={onClose} className="p-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i > 0 ? i - 1 : images.length - 1)); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => (i < images.length - 1 ? i + 1 : 0)); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image */}
      <img
        key={current.id}
        src={`/uploads/${current.filename}`}
        alt={current.original_name}
        className="max-w-[85vw] max-h-[80vh] object-contain rounded-lg fade-in select-none"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-xl bg-black/50 backdrop-blur-sm z-10" onClick={(e) => e.stopPropagation()}>
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setIndex(i)}
              className={`w-12 h-12 rounded-lg overflow-hidden transition-all shrink-0 ${
                i === index ? 'ring-2 ring-fivem scale-105' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <img src={`/uploads/${img.filename}`} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────── Create/Edit Modal ──────────────────── */

function IdeaModal({ idea, onSave, onClose }) {
  const [form, setForm] = useState({
    title: idea?.title || '',
    content: idea?.content || '',
    notes: idea?.notes || '',
    links: idea?.links || [],
    color: idea?.color || '#6366f1',
    pinned: idea?.pinned || false,
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newLink, setNewLink] = useState({ url: '', label: '', type: 'other' });

  const addLink = () => {
    if (!newLink.url.trim()) return;
    let url = newLink.url.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    setForm({ ...form, links: [...form.links, { ...newLink, url }] });
    setNewLink({ url: '', label: '', type: 'other' });
  };

  const removeLink = (idx) => {
    setForm({ ...form, links: form.links.filter((_, i) => i !== idx) });
  };

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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-2xl modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-dark-600/95 backdrop-blur-sm flex items-center justify-between p-6 pb-4 border-b border-dark-400/50 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-white">{idea ? 'Modifier l\'idée' : 'Nouvelle idée'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-500 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
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

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description / Notes</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="input-field resize-none"
              rows={4}
              placeholder="Détails, notes, contexte..."
            />
          </div>

          {/* Links */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Liens & Ressources</label>

            {form.links.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {form.links.map((link, i) => {
                  const lt = getLinkType(link.type);
                  const Icon = lt.icon;
                  return (
                    <div key={i} className="flex items-center gap-2 bg-dark-700/50 px-3 py-2 rounded-lg">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${lt.color}`} />
                      <span className="text-xs text-white truncate flex-1">{link.label || link.url}</span>
                      <span className="text-[10px] text-slate-600 truncate max-w-[120px]">{link.url}</span>
                      <button type="button" onClick={() => removeLink(i)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col gap-2 p-3 rounded-xl border border-dark-400/50 bg-dark-700/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="input-field text-sm !py-1.5 flex-1"
                  placeholder="https://..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                />
                <select
                  value={newLink.type}
                  onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}
                  className="input-field text-xs !py-1.5 !w-auto"
                >
                  {LINK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLink.label}
                  onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                  className="input-field text-sm !py-1.5 flex-1"
                  placeholder="Nom du lien (optionnel)"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                />
                <button type="button" onClick={addLink} className="btn-ghost text-xs !py-1.5 border border-dark-400 shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Color + Pin */}
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
              <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="sr-only peer" />
              <div className="w-9 h-5 bg-dark-500 rounded-full peer peer-checked:bg-amber-500/30 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-slate-400 after:transition-all peer-checked:after:translate-x-4 peer-checked:after:bg-amber-400" />
              <span className="text-xs text-slate-400">Épingler</span>
            </label>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Fichiers / Images</label>
            <div className="border-2 border-dashed border-dark-400 rounded-xl p-4 text-center hover:border-fivem/30 transition-colors">
              <input
                type="file"
                multiple
                onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}
                className="hidden"
                id="modal-file-input"
                accept="image/*,.pdf,.txt,.md,.zip,.rar,.lua,.js,.json,.cfg,.yaml,.yml"
              />
              <label htmlFor="modal-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-slate-500" />
                <span className="text-xs text-slate-500">Cliquer pour ajouter</span>
              </label>
            </div>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-400 bg-dark-700/50 px-3 py-1.5 rounded-lg">
                    {f.type?.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    <span className="truncate flex-1">{f.name}</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-slate-600 hover:text-red-400"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-400/50">
            <button type="button" onClick={onClose} className="btn-ghost text-sm">Annuler</button>
            <button type="submit" disabled={loading || !form.title.trim()} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {idea ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ──────────────────── Utils ──────────────────── */

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}
