import { ChevronRight } from 'lucide-react';

export function MetricCard({ title, count, icon: Icon, color, onClick, description }) {
    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-all cursor-pointer group`}
        >
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={48} />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                    <Icon size={16} />
                    <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
                </div>

                <div className="flex items-end space-x-2">
                    <span className="text-3xl font-bold text-white">{count}</span>
                    <span className="text-xs text-slate-500 mb-1.5">{description}</span>
                </div>
            </div>

            <div className="absolute bottom-3 right-3 text-slate-600 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
            </div>
        </div>
    );
}
