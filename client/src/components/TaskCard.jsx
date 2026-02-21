import {
  ChevronRight, AlertTriangle, AlertOctagon, Minus, ArrowDown,
} from 'lucide-react';

const PRIORITY_CONFIG = {
  critical: { icon: AlertOctagon, class: 'text-red-400 bg-red-500/10', label: 'Critique' },
  high: { icon: AlertTriangle, class: 'text-amber-400 bg-amber-500/10', label: 'Haute' },
  medium: { icon: Minus, class: 'text-blue-400 bg-blue-500/10', label: 'Moyenne' },
  low: { icon: ArrowDown, class: 'text-slate-400 bg-slate-500/10', label: 'Basse' },
};

export default function TaskCard({ task, onEdit, onStatusChange }) {
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const PriorityIcon = priority.icon;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id.toString());
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const nextStatus = {
    todo: 'in_progress',
    in_progress: 'testing',
    testing: 'done',
    done: 'todo',
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onEdit}
      className="glass rounded-xl p-4 cursor-pointer hover:border-dark-400 hover:bg-dark-500/60 transition-all group fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white leading-snug mb-2 group-hover:text-fivem-light transition-colors">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {task.category_name && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-md border"
                style={{
                  color: task.category_color,
                  backgroundColor: `${task.category_color}15`,
                  borderColor: `${task.category_color}30`,
                }}
              >
                {task.category_name}
              </span>
            )}

            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md ${priority.class}`}>
              <PriorityIcon className="w-3 h-3" />
              {priority.label}
            </span>
          </div>

          {task.notes && (
            <p className="text-[11px] text-fivem/60 mt-2 italic line-clamp-1">
              💡 {task.notes}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(task.id, nextStatus[task.status]);
          }}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-fivem hover:bg-fivem/10 transition-all opacity-0 group-hover:opacity-100"
          title="Avancer le statut"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
