import { useState } from 'react';
import { useTabs } from './hooks/useTabs';
import { MetricCard } from './components/MetricCard';
import { Activity, Copy, MonitorPlay, Zap, ArrowLeft, Trash2, Layers, Archive, ToggleLeft, ToggleRight, ChevronRight } from 'lucide-react';

function App() {
  const {
    allTabs, inactiveTabs, duplicateTabs, heavyTabs, loading,
    autoCleanEnabled, toggleAutoClean, groupTabsByDomain, suspendAllInactive,
    closeTab, closeTabs
  } = useTabs();
  const [view, setView] = useState('dashboard'); // 'dashboard', 'inactive', 'duplicates', 'heavy', 'autoclean'

  const totalTabs = allTabs.length;

  // Health Score Calculation (Simple version)
  const healthScore = Math.max(0, 100 - (inactiveTabs.length * 2) - (duplicateTabs.length * 5) - (heavyTabs.length * 3));

  const getHealthColor = (score) => {
    if (score > 80) return 'text-emerald-400';
    if (score > 50) return 'text-amber-400';
    return 'text-rose-400';
  }

  if (loading) {
    return (
      <div className="flex bg-slate-950 items-center justify-center h-screen text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="w-[400px] min-h-[500px] bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">

      {/* Header */}
      <header className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
        {view !== 'dashboard' ? (
          <button onClick={() => setView('dashboard')} className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap size={18} className="text-white fill-indigo-100" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">TabSense</h1>
          </div>
        )}

        <div className="flex items-center space-x-2 bg-slate-900 rounded-full px-3 py-1 border border-slate-800">
          <span className="text-xs text-slate-400">Health:</span>
          <span className={`text-sm font-bold ${getHealthColor(healthScore)}`}>{healthScore}</span>
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {view === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                title="Inactive"
                count={inactiveTabs.length}
                icon={Activity}
                color="text-slate-400"
                description="> 30m"
                onClick={() => setView('inactive')}
              />
              <MetricCard
                title="Duplicates"
                count={duplicateTabs.length}
                icon={Copy}
                color="text-rose-400"
                description="copies"
                onClick={() => setView('duplicates')}
              />
            </div>
            <MetricCard
              title="Heavy Tabs"
              count={heavyTabs.length}
              icon={MonitorPlay}
              color="text-amber-400"
              description="High memory"
              onClick={() => setView('heavy')}
            />

            <div className="pt-2">
              <button
                onClick={() => setView('autoclean')}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 hover:border-indigo-500/60 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Layers size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">Auto Clean</div>
                    <div className="text-xs text-slate-400">Group & Suspend</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-white" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 mt-2">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Total Active Tabs</h3>
              <div className="text-4xl font-bold text-indigo-400">{totalTabs}</div>
            </div>
          </div>
        )}

        {view === 'autoclean' && (
          <AutoCleanView
            autoCleanEnabled={autoCleanEnabled}
            toggleAutoClean={toggleAutoClean}
            onGroup={groupTabsByDomain}
            onSuspend={suspendAllInactive}
          />
        )}

        {(view === 'inactive' || view === 'duplicates' || view === 'heavy') && (
          <TabListView
            type={view}
            tabs={view === 'inactive' ? inactiveTabs : view === 'duplicates' ? duplicateTabs : heavyTabs}
            onClose={closeTab}
            onCloseAll={closeTabs}
          />
        )}
      </main>
    </div>
  );
}

function AutoCleanView({ autoCleanEnabled, toggleAutoClean, onGroup, onSuspend }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Auto Clean</h2>
        <p className="text-sm text-slate-400">Organize and optimize your browser.</p>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div>
          <div className="font-medium text-white">Background Auto-Clean</div>
          <div className="text-xs text-slate-500">Suspend inactive tabs every 20m</div>
        </div>
        <button
          onClick={() => toggleAutoClean(!autoCleanEnabled)}
          className={`text-2xl transition-colors ${autoCleanEnabled ? 'text-indigo-400' : 'text-slate-600'}`}
        >
          {autoCleanEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={onGroup}
          className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition-all flex items-center space-x-3 text-left"
        >
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Layers size={20} />
          </div>
          <div>
            <div className="font-medium text-white">Group by Domain</div>
            <div className="text-xs text-slate-400">Organize cluttered tabs</div>
          </div>
        </button>

        <button
          onClick={onSuspend}
          className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition-all flex items-center space-x-3 text-left"
        >
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
            <Archive size={20} />
          </div>
          <div>
            <div className="font-medium text-white">Suspend Inactive</div>
            <div className="text-xs text-slate-400">Free up memory now</div>
          </div>
        </button>
      </div>
    </div>
  )
}


function TabListView({ type, tabs, onClose, onCloseAll }) {
  const title = type === 'inactive' ? 'Inactive Tabs' : type === 'duplicates' ? 'Duplicate Tabs' : 'Heavy Tabs';
  const description = type === 'inactive' ? 'Tabs not used for > 30 mins' : type === 'duplicates' ? 'Exact URL duplicates' : 'Media or resource heavy sites';

  if (tabs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4">
          <Zap size={24} className="opacity-20" />
        </div>
        <p>No {type} tabs found.</p>
        <p className="text-xs mt-1">Great job!</p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      <button
        onClick={() => onCloseAll(tabs.map(t => t.id))}
        className="w-full mb-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/20"
      >
        <Trash2 size={16} />
        <span>Close All ({tabs.length})</span>
      </button>

      <div className="space-y-2">
        {tabs.map(tab => (
          <div key={tab.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 group hover:border-slate-700 transition-colors">
            <div className="flex items-center space-x-3 overflow-hidden">
              {tab.favIconUrl ? (
                <img src={tab.favIconUrl} alt="" className="w-4 h-4 rounded-sm" onError={(e) => e.target.style.display = 'none'} />
              ) : (
                <div className="w-4 h-4 rounded-sm bg-slate-700" />
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-slate-200 truncate pr-2" title={tab.title}>{tab.title}</span>
                <span className="text-xs text-slate-500 truncate" title={tab.url}>{new URL(tab.url).hostname}</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App;
