import TaskCard from './TaskCard';
import { ClipboardList, Loader, FlaskConical, CheckCircle2 } from 'lucide-react';

const COLUMNS = [
  { key: 'todo', label: 'À faire', color: 'blue', icon: ClipboardList },
  { key: 'in_progress', label: 'En cours', color: 'amber', icon: Loader },
  { key: 'testing', label: 'En test', color: 'purple', icon: FlaskConical },
  { key: 'done', label: 'Terminé', color: 'emerald', icon: CheckCircle2 },
];

const COLOR_MAP = {
  blue: { dot: 'bg-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
  amber: { dot: 'bg-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
  purple: { dot: 'bg-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
  emerald: { dot: 'bg-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
};

export default function TaskBoard({ tasks, onStatusChange, onEditTask }) {
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onStatusChange(parseInt(taskId, 10), status);
  };

  return (
    <div className="flex-1 overflow-x-auto p-6">
      <div className="grid grid-cols-4 gap-5 h-full min-w-[900px]">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          const colors = COLOR_MAP[col.color];
          const Icon = col.icon;

          return (
            <div
              key={col.key}
              className="flex flex-col min-h-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl mb-3 ${colors.bg} border ${colors.border}`}>
                <Icon className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-200">{col.label}</h3>
                <span className="ml-auto text-xs font-medium text-slate-500 tabular-nums">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {colTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-dark-400/50 text-slate-600 text-xs">
                    Glisser une tâche ici
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => onEditTask(task)}
                      onStatusChange={onStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
