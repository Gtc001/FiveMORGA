import { Search, Plus, Filter, Menu } from 'lucide-react';

const PRIORITY_LABELS = {
  '': 'Toutes priorités',
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
  critical: 'Critique',
};

export default function StatsBar({
  stats, search, onSearch, filterPriority, onFilterPriority,
  onNewTask, sidebarOpen, onToggleSidebar,
}) {
  const total = stats?.total || 0;
  const done = stats?.statuses?.done || 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <header className="shrink-0 border-b border-dark-400/50 bg-dark-800/50 backdrop-blur-sm">
      <div className="flex items-center gap-4 px-6 py-4">
        {!sidebarOpen && (
          <button onClick={onToggleSidebar} className="text-slate-400 hover:text-white transition-colors mr-1">
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Rechercher une tâche..."
                className="input-field !pl-10 text-sm !py-2"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <select
                value={filterPriority}
                onChange={(e) => onFilterPriority(e.target.value)}
                className="input-field text-sm !py-2 !pl-9 !pr-8 appearance-none cursor-pointer min-w-[150px]"
              >
                {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto shrink-0">
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-dark-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fivem to-orange-500 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 tabular-nums font-medium">{progress}%</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <StatusPill color="bg-blue-500" label="À faire" count={stats?.statuses?.todo || 0} />
                <StatusPill color="bg-amber-500" label="En cours" count={stats?.statuses?.in_progress || 0} />
                <StatusPill color="bg-purple-500" label="En test" count={stats?.statuses?.testing || 0} />
                <StatusPill color="bg-emerald-500" label="Terminé" count={done} />
              </div>
            </div>

            <button onClick={onNewTask} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle tâche</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function StatusPill({ color, label, count }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-400">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span>{count}</span>
    </div>
  );
}
