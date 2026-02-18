import { useState, useEffect } from 'react';
import { useTabs } from './hooks/useTabs';
import { MetricCard } from './components/MetricCard';
import { Activity, Copy, MonitorPlay, Zap, ArrowLeft, Trash2, Layers, Archive, ToggleLeft, ToggleRight, ChevronRight, Target, CircleAlert } from 'lucide-react';
import { useFocus } from './hooks/useFocus';

function App() {
  const {
    allTabs, inactiveTabs, duplicateTabs, heavyTabs, loading,
    autoCleanEnabled, toggleAutoClean, groupTabsByDomain, suspendAllInactive,
    closeTab, closeTabs
  } = useTabs();

  const { isFocusActive, focusEndTime, startFocus, stopFocus } = useFocus();
  const [view, setView] = useState('dashboard'); // 'dashboard', 'inactive', 'duplicates', 'heavy', 'autoclean', 'focus'

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

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => setView('autoclean')}
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all group flex flex-col items-center justify-center space-y-2"
              >
                <Layers size={20} className="text-indigo-400 group-hover:text-indigo-300" />
                <span className="text-xs font-medium text-slate-300">Auto Clean</span>
              </button>

              <button
                onClick={() => setView('focus')}
                className={`p-3 rounded-xl border transition-all group flex flex-col items-center justify-center space-y-2 ${isFocusActive ? 'bg-amber-900/20 border-amber-500/50 animate-pulse' : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-amber-500/30'}`}
              >
                <Target size={20} className={isFocusActive ? "text-amber-400" : "text-amber-500/80 group-hover:text-amber-400"} />
                <span className={`text-xs font-medium ${isFocusActive ? 'text-amber-200' : 'text-slate-300'}`}>{isFocusActive ? 'Focus Active' : 'Focus Mode'}</span>
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

        {view === 'focus' && (
          <FocusView
            isActive={isFocusActive}
            endTime={focusEndTime}
            onStart={startFocus}
            onStop={stopFocus}
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

function FocusView({ isActive, endTime, onStart, onStop }) {
  const [duration, setDuration] = useState(25);
  const [allowStr, setAllowStr] = useState("google.com, linkedin.com, github.com");
  const [timeLeft, setTimeLeft] = useState("");

  // Use a ref to store the interval ID
  const [intervalId, setIntervalId] = useState(null);

  // Effect to handle the timer
  useEffect(() => {
    if (!isActive || !endTime) {
      setTimeLeft("");
      return;
    }

    const tick = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00");
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
      }
    };

    tick(); // Initial call
    const id = setInterval(tick, 1000);
    setIntervalId(id);

    return () => clearInterval(id);
  }, [isActive, endTime]);


  if (isActive) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] animate-in fade-in zoom-in duration-300">
        <div className="w-32 h-32 rounded-full border-4 border-amber-500/30 flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin duration-[3000ms]"></div>
          <div className="text-4xl font-bold font-mono text-white tracking-widest">{timeLeft}</div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Focus Mode On</h2>
        <p className="text-slate-400 mb-8 text-center px-4">Distracting sites are blocked.<br />You got this!</p>

        <button
          onClick={onStop}
          className="px-8 py-3 bg-slate-800 hover:bg-rose-900/50 text-white hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 rounded-full font-medium transition-all"
        >
          Stop Session
        </button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Focus Mode</h2>
        <p className="text-sm text-slate-400">Block distractions and stay in the zone.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block uppercase tracking-wider">Duration (Minutes)</label>
          <div className="grid grid-cols-4 gap-2">
            {[15, 25, 45, 60].map(m => (
              <button
                key={m}
                onClick={() => setDuration(m)}
                className={`py-2 rounded-lg border text-sm font-medium transition-all ${duration === m ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 mb-2 block uppercase tracking-wider">Allowed Domains</label>
          <textarea
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none h-24 placeholder:text-slate-600"
            value={allowStr}
            onChange={(e) => setAllowStr(e.target.value)}
            placeholder="google.com, github.com..."
          />
          <p className="text-[10px] text-slate-500 mt-1 flex items-center"><CircleAlert size={10} className="mr-1" /> Comma separated. All other sites will be blocked.</p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              const list = allowStr.split(',').map(s => s.trim().replace('https://', '').replace('http://', '').replace('/', '')).filter(s => s.length > 0);
              onStart(duration, list);
            }}
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-amber-900/20 transition-all flex items-center justify-center space-x-2"
          >
            <Target size={20} />
            <span>Start Focus Session</span>
          </button>
        </div>
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
