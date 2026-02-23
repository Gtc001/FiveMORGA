import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  Plus, Trash2, Copy, Check, FileJson, Clock,
  ChevronDown, ChevronRight, X, PackagePlus, PackageMinus, Wrench,
} from 'lucide-react';

const ACTION_CONFIG = {
  ajout: { label: 'Ajout', icon: PackagePlus, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  modification: { label: 'Modification', icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  suppression: { label: 'Suppression', icon: PackageMinus, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

export default function PatchnotesPage() {
  const { showToast } = useOutletContext();
  const [patchnotes, setPatchnotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCat, setFilterCat] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      const [pn, cats] = await Promise.all([
        api.patchnotes.list({ category: filterCat }),
        api.patchnotes.listCategories(),
      ]);
      setPatchnotes(pn);
      setCategories(cats);
    } catch (err) { showToast(err.message, 'error'); }
  }, [filterCat, showToast]);

  useEffect(() => { load(); }, [load]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleImport = async (title, entries) => {
    try {
      await api.patchnotes.create({ title, entries });
      showToast('Patchnote créé');
      setShowImport(false);
      load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.patchnotes.delete(confirmDelete.id);
      showToast('Patchnote supprimé');
      setConfirmDelete(null);
      load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const getJsonTemplate = () => {
    return JSON.stringify([
      {
        category: 'Nom de la catégorie (ex: Script, Mapping, etc.)',
        name: 'nom_de_la_resource',
        action: 'ajout | modification | suppression',
        description: 'Description du changement',
      },
    ], null, 2);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getCatColor = (catName) => {
    const cat = categories.find((c) => c.name.toLowerCase() === catName?.toLowerCase());
    return cat?.color || '#6366f1';
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Patchnotes</h1>
            <p className="text-sm text-slate-500 mt-1">Historique des changements du serveur</p>
          </div>
          <button onClick={() => setShowImport(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Nouveau patchnote
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterCat('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !filterCat ? 'bg-fivem/10 text-fivem border border-fivem/20' : 'text-slate-400 hover:text-white hover:bg-dark-600 border border-dark-400'
            }`}
          >
            Tout
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(filterCat === cat.name ? '' : cat.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterCat === cat.name
                  ? 'border text-white'
                  : 'text-slate-400 hover:text-white hover:bg-dark-600 border border-dark-400'
              }`}
              style={filterCat === cat.name ? { borderColor: `${cat.color}50`, backgroundColor: `${cat.color}15`, color: cat.color } : undefined}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {patchnotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600">
            <FileJson className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">Aucun patchnote</p>
            <p className="text-sm mt-1">Clique sur "Nouveau patchnote" pour commencer</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-dark-400/50" />

            <div className="space-y-4">
              {patchnotes.map((pn) => {
                const expanded = expandedIds.has(pn.id);
                const grouped = {};
                pn.entries.forEach((e) => {
                  const cat = e.category || 'Autre';
                  if (!grouped[cat]) grouped[cat] = [];
                  grouped[cat].push(e);
                });

                return (
                  <div key={pn.id} className="relative pl-12 fade-in">
                    <div className="absolute left-2.5 top-5 w-3 h-3 rounded-full bg-fivem border-2 border-dark-900 z-10" />

                    <div className="glass rounded-xl overflow-hidden group">
                      {/* Header */}
                      <button
                        onClick={() => toggleExpand(pn.id)}
                        className="w-full flex items-center gap-3 p-4 text-left hover:bg-dark-500/30 transition-all"
                      >
                        {expanded ? <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white">
                            {pn.title || `Patchnote #${pn.id}`}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(pn.created_at)} à {formatTime(pn.created_at)}</span>
                            <span>par {pn.author}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-500">{pn.entries.length} changement{pn.entries.length > 1 ? 's' : ''}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: pn.id, title: pn.title || `Patchnote #${pn.id}` }); }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </button>

                      {/* Entries */}
                      {expanded && (
                        <div className="border-t border-dark-400/50 p-4 space-y-4 fade-in">
                          {Object.entries(grouped).map(([catName, entries]) => (
                            <div key={catName}>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCatColor(catName) }} />
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: getCatColor(catName) }}>{catName}</span>
                                <span className="text-[10px] text-slate-600">({entries.length})</span>
                              </div>
                              <div className="space-y-1.5 ml-5">
                                {entries.map((entry, i) => {
                                  const action = ACTION_CONFIG[entry.action] || ACTION_CONFIG.modification;
                                  const Icon = action.icon;
                                  return (
                                    <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-dark-700/30">
                                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 mt-0.5 ${action.bg} ${action.color}`}>
                                        <Icon className="w-3 h-3" />
                                        {action.label}
                                      </span>
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-white">{entry.name}</p>
                                        {entry.description && (
                                          <p className="text-xs text-slate-400 mt-0.5">{entry.description}</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showImport && (
        <ImportModal
          getTemplate={getJsonTemplate}
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Supprimer ce patchnote ?"
        message={`Le patchnote « ${confirmDelete?.title} » sera définitivement supprimé.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

/* ──────────────────── Import Modal ──────────────────── */

function ImportModal({ getTemplate, onImport, onClose }) {
  const [title, setTitle] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleParse = () => {
    setError('');
    try {
      const data = JSON.parse(jsonText.trim());
      if (!Array.isArray(data)) throw new Error('Le JSON doit être un tableau []');
      const valid = data.every((e) => e.category && e.name && e.action);
      if (!valid) throw new Error('Chaque entrée doit avoir: category, name, action');
      const normalized = data.map((e) => ({
        ...e,
        action: e.action.toLowerCase().trim(),
      }));
      setParsed(normalized);
    } catch (err) {
      setError(err.message);
      setParsed(null);
    }
  };

  const handleSubmit = async () => {
    if (!parsed) return;
    setLoading(true);
    await onImport(title || undefined, parsed);
    setLoading(false);
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(getTemplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-2xl modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-dark-600/95 backdrop-blur-sm flex items-center justify-between p-6 pb-4 border-b border-dark-400/50 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-white">Nouveau Patchnote</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-dark-500 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Titre (optionnel)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="ex: Update v1.3 – Ajout garage + fix HUD"
            />
          </div>

          {/* Template */}
          <div className="p-4 rounded-xl bg-dark-700/50 border border-dark-400/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5" /> Template JSON
              </span>
              <button onClick={copyTemplate} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-fivem transition-colors">
                {copied ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copié !</span></> : <><Copy className="w-3 h-3" />Copier le template</>}
              </button>
            </div>
            <pre className="text-[11px] text-slate-400 bg-dark-900/50 rounded-lg p-3 overflow-x-auto font-mono leading-relaxed">{getTemplate()}</pre>
            <p className="text-[10px] text-slate-600 mt-2">Copie ce template, donne-le à une IA avec ton résumé, puis colle le JSON généré ci-dessous. Les catégories sont détectées automatiquement depuis le JSON.</p>
          </div>

          {/* JSON input */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Coller le JSON</label>
            <textarea
              value={jsonText}
              onChange={(e) => { setJsonText(e.target.value); setParsed(null); setError(''); }}
              className="input-field font-mono text-xs resize-none"
              rows={8}
                placeholder={'[\n  {\n    "category": "Script",\n    "name": "ox_inventory",\n    "action": "ajout",\n    "description": "Description..."\n  }\n]'}
            />
            {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
          </div>

          {/* Parse button */}
          {!parsed && (
            <button
              onClick={handleParse}
              disabled={!jsonText.trim()}
              className="btn-ghost border border-dark-400 w-full flex items-center justify-center gap-2 text-sm disabled:opacity-40"
            >
              <FileJson className="w-4 h-4" />
              Analyser le JSON
            </button>
          )}

          {/* Preview */}
          {parsed && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Aperçu — {parsed.length} changement{parsed.length > 1 ? 's' : ''}
              </h3>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {parsed.map((entry, i) => {
                  const action = ACTION_CONFIG[entry.action] || ACTION_CONFIG.modification;
                  const Icon = action.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-dark-700/30">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 mt-0.5 ${action.bg} ${action.color}`}>
                        <Icon className="w-3 h-3" />
                        {action.label}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-medium">{entry.category}</span>
                          <span className="text-sm font-medium text-white">{entry.name}</span>
                        </div>
                        {entry.description && <p className="text-xs text-slate-400 mt-0.5">{entry.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-400/50">
            <button onClick={onClose} className="btn-ghost text-sm">Annuler</button>
            <button
              onClick={handleSubmit}
              disabled={!parsed || loading}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Créer le patchnote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

