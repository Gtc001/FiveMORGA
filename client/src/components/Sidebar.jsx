import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Flame, LayoutGrid, Plus, Trash2, LogOut, ChevronLeft,
  Cpu, Monitor, Store, Car, Landmark, Gamepad2, Skull, Lightbulb, Folder,
} from 'lucide-react';

const ICON_MAP = {
  cpu: Cpu, monitor: Monitor, store: Store, car: Car,
  bank: Landmark, gamepad: Gamepad2, skull: Skull, lightbulb: Lightbulb,
  folder: Folder,
};

export default function Sidebar({
  categories, selectedCategory, onSelectCategory,
  onCreateCategory, onDeleteCategory, open, onToggle,
}) {
  const { user, logout } = useAuth();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateCategory({ name: newName.trim(), color: newColor });
    setNewName('');
    setNewColor('#6366f1');
    setShowNew(false);
  };

  if (!open) return null;

  return (
    <aside className="w-64 h-screen flex flex-col bg-dark-800 border-r border-dark-400/50 shrink-0 slide-in">
      <div className="p-5 flex items-center justify-between border-b border-dark-400/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fivem to-orange-600 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">FiveM ORGA</h1>
            <p className="text-[10px] text-slate-500 mt-0.5">Gestionnaire de projet</p>
          </div>
        </div>
        <button onClick={onToggle} className="text-slate-500 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
            selectedCategory === null
              ? 'bg-fivem/10 text-fivem border border-fivem/20'
              : 'text-slate-300 hover:bg-dark-600 border border-transparent'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="font-medium">Toutes les tâches</span>
        </button>

        <div className="pt-3 pb-1 px-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Catégories</span>
        </div>

        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Folder;
          return (
            <div key={cat.id} className="group relative">
              <button
                onClick={() => onSelectCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-dark-600 border border-dark-400'
                    : 'text-slate-300 hover:bg-dark-600/60 border border-transparent'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <Icon className="w-4 h-4" style={{ color: cat.color }} />
                </div>
                <span className="flex-1 text-left truncate font-medium">{cat.name}</span>
                <span className="text-xs text-slate-500 tabular-nums">{cat.task_count}</span>
              </button>
              <button
                onClick={() => onDeleteCategory(cat.id)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {showNew ? (
          <form onSubmit={handleCreate} className="p-2 space-y-2 fade-in">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom de la catégorie"
              className="input-field text-sm !py-2"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <button type="submit" className="btn-primary text-xs flex-1 !py-2">Créer</button>
              <button type="button" onClick={() => setShowNew(false)} className="btn-ghost text-xs !py-2">
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowNew(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-fivem hover:bg-fivem/5 transition-all border border-transparent"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle catégorie</span>
          </button>
        )}
      </div>

      <div className="p-4 border-t border-dark-400/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center text-sm font-semibold text-fivem uppercase">
              {user?.username?.[0] || '?'}
            </div>
            <span className="text-sm text-slate-300 font-medium">{user?.username}</span>
          </div>
          <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors p-1.5">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
