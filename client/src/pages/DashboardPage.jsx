import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import {
  ListTodo, CheckCircle2, Loader, FlaskConical, TrendingUp,
  Lightbulb, ArrowRight, AlertOctagon, AlertTriangle,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentIdeas, setRecentIdeas] = useState([]);

  useEffect(() => {
    Promise.all([
      api.stats.get(),
      api.tasks.list({}),
      api.ideas.list({}),
    ]).then(([s, t, i]) => {
      setStats(s);
      setRecentTasks(t.slice(0, 8));
      setRecentIdeas(i.slice(0, 4));
    }).catch(console.error);
  }, []);

  const total = stats?.total || 0;
  const done = stats?.statuses?.done || 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
        <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de ton projet FiveM</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ListTodo} label="À faire" value={stats?.statuses?.todo || 0} color="blue" />
        <StatCard icon={Loader} label="En cours" value={stats?.statuses?.in_progress || 0} color="amber" />
        <StatCard icon={FlaskConical} label="En test" value={stats?.statuses?.testing || 0} color="purple" />
        <StatCard icon={CheckCircle2} label="Terminé" value={done} color="emerald" />
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-fivem" />
            <h2 className="text-lg font-semibold text-white">Progression globale</h2>
          </div>
          <span className="text-2xl font-bold text-fivem">{progress}%</span>
        </div>
        <div className="w-full h-4 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-fivem to-orange-500 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>{done} terminée{done > 1 ? 's' : ''}</span>
          <span>{total} tâche{total > 1 ? 's' : ''} au total</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {stats?.categories && stats.categories.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Progression par catégorie</h2>
            <div className="space-y-3">
              {stats.categories.map((cat) => {
                const pct = cat.total > 0 ? Math.round((cat.done / cat.total) * 100) : 0;
                return (
                  <div key={cat.id} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-slate-300 flex-1 truncate">{cat.name}</span>
                    <span className="text-xs text-slate-500 tabular-nums">{cat.done}/{cat.total}</span>
                    <div className="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Priorités</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <PriorityCard icon={AlertOctagon} label="Critique" count={stats?.priorities?.critical || 0} color="red" />
            <PriorityCard icon={AlertTriangle} label="Haute" count={stats?.priorities?.high || 0} color="amber" />
            <PriorityCard label="Moyenne" count={stats?.priorities?.medium || 0} color="blue" />
            <PriorityCard label="Basse" count={stats?.priorities?.low || 0} color="slate" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-blue-400" />
              Tâches récentes
            </h2>
            <Link to="/tasks" className="text-xs text-fivem hover:text-fivem-light flex items-center gap-1 transition-colors">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentTasks.length === 0 ? (
              <p className="text-sm text-slate-600">Aucune tâche</p>
            ) : recentTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-500/50 transition-all">
                <StatusDot status={task.status} />
                <span className="text-sm text-slate-300 flex-1 truncate">{task.title}</span>
                {task.category_name && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md" style={{ color: task.category_color, backgroundColor: `${task.category_color}15` }}>
                    {task.category_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Idées récentes
            </h2>
            <Link to="/ideas" className="text-xs text-fivem hover:text-fivem-light flex items-center gap-1 transition-colors">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentIdeas.length === 0 ? (
              <p className="text-sm text-slate-600">Aucune idée pour le moment</p>
            ) : recentIdeas.map((idea) => (
              <div key={idea.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-500/50 transition-all">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: idea.color }} />
                <span className="text-sm text-slate-300 flex-1 truncate">{idea.title}</span>
                {idea.pinned && <span className="text-[10px] text-amber-400">📌</span>}
                {idea.files?.length > 0 && (
                  <span className="text-[10px] text-slate-500">{idea.files.length} fichier{idea.files.length > 1 ? 's' : ''}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4" />}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function PriorityCard({ icon: Icon, label, count, color }) {
  const colors = {
    red: 'text-red-400', amber: 'text-amber-400', blue: 'text-blue-400', slate: 'text-slate-400',
  };
  return (
    <div className="bg-dark-700/50 rounded-xl p-3 flex items-center gap-3">
      {Icon && <Icon className={`w-4 h-4 ${colors[color]}`} />}
      <div>
        <p className={`text-lg font-bold ${colors[color]}`}>{count}</p>
        <p className="text-[10px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function StatusDot({ status }) {
  const colors = {
    todo: 'bg-blue-500', in_progress: 'bg-amber-500', testing: 'bg-purple-500', done: 'bg-emerald-500',
  };
  return <div className={`w-2 h-2 rounded-full shrink-0 ${colors[status] || 'bg-slate-500'}`} />;
}
