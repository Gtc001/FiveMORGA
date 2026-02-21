import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'success' }) {
  const isError = type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 fade-in">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border ${
        isError
          ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      }`}>
        {isError ? (
          <AlertCircle className="w-4 h-4 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
