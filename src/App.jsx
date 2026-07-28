import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Calendar, Users, Activity, Settings, Plus, Minus, 
  Play, Pause, RotateCcw, AlertCircle, Clock, Check, X, Shield, ChevronRight
} from 'lucide-react';

// ==========================================
// 🔴 BACKEND DATABASE CONFIGURATION 🔴
// ==========================================
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAxP8GhEYdLVRPwhukUhyBOZKYtaGx0aT8",
  authDomain: "football-tournament-43652.firebaseapp.com",
  databaseURL: "https://football-tournament-43652-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "football-tournament-43652",
  storageBucket: "football-tournament-43652.firebasestorage.app",
  messagingSenderId: "884314452484",
  appId: "1:884314452484:web:55958d9ca7acc6adebbb51",
  measurementId: "G-9622VER5MM"
};

let db = null;
let appDataRef = null;
let isFirebaseConnected = false;

if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    appDataRef = doc(db, 'khajanav', 'tournamentData');
    isFirebaseConnected = true;
  } catch (error) {
    console.error("Firebase init error", error);
  }
}

const initialTeams = [
  { id: 't1', name: 'Sunnathth Sulthans', color: '#3B82F6' },
  { id: 't2', name: 'Vridhdha Vidanmar', color: '#10B981' },
  { id: 't3', name: 'Kambi Pada', color: '#F59E0B' },
  { id: 't4', name: 'Pele Aadikal', color: '#EF4444' }
];

const initialMatches = [
  { id: 'm1', stage: 'group', team1: 't1', team2: 't2', status: 'upcoming', time: '2026-08-07T20:00', score1: 0, score2: 0, stats: { t1Sot:0, t1Corners:0, t1Fouls:0, t2Sot:0, t2Corners:0, t2Fouls:0 }, events: [], shootout: null, timer: { isRunning: false, baseElapsed: 0, lastStartTime: null, stoppage: 0, period: '1st Half' } },
  { id: 'm2', stage: 'group', team1: 't3', team2: 't4', status: 'upcoming', time: '2026-08-07T20:45', score1: 0, score2: 0, stats: { t1Sot:0, t1Corners:0, t1Fouls:0, t2Sot:0, t2Corners:0, t2Fouls:0 }, events: [], shootout: null, timer: { isRunning: false, baseElapsed: 0, lastStartTime: null, stoppage: 0, period: '1st Half' } },
  { id: 'm3', stage: 'group', team1: 't1', team2: 't3', status: 'upcoming', time: '2026-08-07T21:30', score1: 0, score2: 0, stats: { t1Sot:0, t1Corners:0, t1Fouls:0, t2Sot:0, t2Corners:0, t2Fouls:0 }, events: [], shootout: null, timer: { isRunning: false, baseElapsed: 0, lastStartTime: null, stoppage: 0, period: '1st Half' } },
  { id: 'm4', stage: 'group', team1: 't2', team2: 't4', status: 'upcoming', time: '2026-08-07T22:15', score1: 0, score2: 0, stats: { t1Sot:0, t1Corners:0, t1Fouls:0, t2Sot:0, t2Corners:0, t2Fouls:0 }, events: [], shootout: null, timer: { isRunning: false, baseElapsed: 0, lastStartTime: null, stoppage: 0, period: '1st Half' } },
  { id: 'm5', stage: 'group', team1: 't1', team2: 't4', status: 'upcoming', time: '2026-08-07T23:00', score1: 0, score2: 0, stats: { t1Sot:0, t1Corners:0, t1Fouls:0, t2Sot:0, t2Corners:0, t2Fouls:0 }, events: [], shootout: null, timer: { isRunning: false, baseElapsed: 0, lastStartTime: null, stoppage: 0, period: '1st Half' } },
  { id: 'm6', stage: 'group', team1: 't2', team2: 't3', status: 'upcoming', time: '2026-08-07T23:45', score1: 0, score2: 0, stats: { t1Sot:0, t1Corners:0, t1Fouls:0, t2Sot:0, t2Corners:0, t2Fouls:0 }, events: [], shootout: null, timer: { isRunning: false, baseElapsed: 0, lastStartTime: null, stoppage: 0, period: '1st Half' } },
  { id: 'sf1', stage: 'semi', team1: null, team2: null, status: 'upcoming', time: '2026-08-08T00:30', score1: 0, score2: 0, stats: { t1Sot:0, t1Corners:0, t1Fouls:0, t2Sot:0, t2Corners:0, t2Fouls:0 }, events: [], shootout: null, timer: { isRunning: false, baseElapsed: 0, lastStartTime: null, stoppage: 0, period: '1st Half' } },
  { id: 'f1', stage: 'final', team1: null, team2: null, status: 'upcoming', time: '2026-08-08T01:15', score1: 0, score2: 0, stats: { t1Sot:0, t1Corners:0, t1Fouls:0, t2Sot:0, t2Corners:0, t2Fouls:0 }, events: [], shootout: null, timer: { isRunning: false, baseElapsed: 0, lastStartTime: null, stoppage: 0, period: '1st Half' } }
];

const LiveTimerDisplay = ({ timer, match }) => {
  const [display, setDisplay] = useState('00:00');
  const [isRed, setIsRed] = useState(false);
  
  useEffect(() => {
    let interval;
    const targetSeconds = (match.halfDuration || 15) * 60;

    const updateDisplay = () => {
      let currentElapsed = timer.baseElapsed;
      if (timer.isRunning && timer.lastStartTime) {
        currentElapsed += Math.floor((Date.now() - timer.lastStartTime) / 1000);
      }
      
      const m = Math.floor(currentElapsed / 60).toString().padStart(2, '0');
      const s = (currentElapsed % 60).toString().padStart(2, '0');
      setDisplay(`${m}:${s}`);

      // Clock should turn red if elapsed time exceeds half duration boundaries
      let overtime = false;
      if (timer.period === '1st Half' && currentElapsed >= targetSeconds) overtime = true;
      else if (timer.period === '2nd Half' && currentElapsed >= targetSeconds * 2) overtime = true;
      else if (timer.period === 'ET 1st Half' && currentElapsed >= targetSeconds * 2 + (5 * 60)) overtime = true;
      else if (timer.period === 'ET 2nd Half' && currentElapsed >= targetSeconds * 2 + (10 * 60)) overtime = true;

      setIsRed(overtime);
    };
    
    updateDisplay();
    if (timer.isRunning) interval = setInterval(updateDisplay, 1000);
    return () => clearInterval(interval);
  }, [timer, match]);

  return <span className={isRed ? "text-rose-500 font-black drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]" : ""}>{display}</span>;
};

const StandingsWidget = ({ standings }) => (
  <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden flex flex-col h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
    <div className="p-6 border-b border-white/10 bg-white/[0.02] flex items-center gap-3">
      <Trophy className="text-zinc-400" size={20} />
      <h3 className="font-bold text-white tracking-tight text-lg">Points Table</h3>
    </div>
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/[0.02] border-b border-white/5">
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pos</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Club</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">P</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">W</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">D</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">L</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">GF</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">GA</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">GD</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white text-center">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {standings.map((t, idx) => (
            <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
              <td className="p-4 font-outfit font-bold text-zinc-500">{idx + 1}</td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{backgroundColor: t.color, boxShadow: `0 0 10px ${t.color}`}} />
                  <span className="font-bold text-zinc-200 group-hover:text-white transition-colors truncate max-w-[120px] sm:max-w-none block">{t.name}</span>
                </div>
              </td>
              <td className="p-4 text-center font-semibold text-zinc-400 tabular-nums">{t.p}</td>
              <td className="p-4 text-center font-semibold text-zinc-400 tabular-nums">{t.w}</td>
              <td className="p-4 text-center font-semibold text-zinc-400 tabular-nums">{t.d}</td>
              <td className="p-4 text-center font-semibold text-zinc-400 tabular-nums">{t.l}</td>
              <td className="p-4 text-center font-semibold text-zinc-500 tabular-nums">{t.gf}</td>
              <td className="p-4 text-center font-semibold text-zinc-500 tabular-nums">{t.ga}</td>
              <td className="p-4 text-center font-semibold text-zinc-400 tabular-nums">{t.gd > 0 ? `+${t.gd}` : t.gd}</td>
              <td className="p-4 text-center font-black text-white text-lg tabular-nums">{t.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MatchDashboard = ({ matchId, onClose, matches, teams, players, isAdmin, syncToDB, getTeam }) => {
  const match = matches.find(m => m.id === matchId);
  const [dialogState, setDialogState] = useState(null); 
  const [deleteMode, setDeleteMode] = useState(false);

  if (!match) return null;

  const t1 = getTeam(match.team1);
  const t2 = getTeam(match.team2);

  const updateLiveMatch = (updater) => {
    const updatedMatch = updater(JSON.parse(JSON.stringify(match)));
    const newMatches = matches.map(m => m.id === match.id ? updatedMatch : m);
    syncToDB(null, newMatches, null);
  };

  const getCurrentMatchMinute = () => {
    let currentElapsed = match.timer.baseElapsed;
    if (match.timer.isRunning && match.timer.lastStartTime) {
      currentElapsed += Math.floor((Date.now() - match.timer.lastStartTime) / 1000);
    }
    return Math.floor(currentElapsed / 60) + 1;
  };

  const toggleTimer = () => {
    if (!isAdmin || match.status === 'completed') return;
    updateLiveMatch(m => {
      if (m.timer.isRunning) {
         if (m.timer.lastStartTime) {
            m.timer.baseElapsed += Math.floor((Date.now() - m.timer.lastStartTime) / 1000);
         }
         m.timer.isRunning = false;
         m.timer.lastStartTime = null;
      } else {
         m.timer.isRunning = true;
         m.timer.lastStartTime = Date.now();
      }
      return m;
    });
  };

  const triggerResetTimer = () => {
     if (!isAdmin || match.status === 'completed') return;
     setDialogState('RESET_TIMER');
  };

  const addEvent = (teamId, playerId, type) => {
    if (!isAdmin) return;
    const minute = getCurrentMatchMinute();
    updateLiveMatch(m => {
      m.events.push({ id: Date.now().toString(), team: teamId, player: playerId, type, minute, period: m.timer.period });
      if (type === 'goal') {
         if (teamId === t1.id) { m.score1++; m.stats.t1Sot++; }
         else { m.score2++; m.stats.t2Sot++; }
      }
      return m;
    });
  };
  
  const removeEvent = (teamId, playerId, type) => {
    if (!isAdmin) return;
    updateLiveMatch(m => {
      const eventsReversed = [...m.events].reverse();
      const idx = eventsReversed.findIndex(e => e.team === teamId && e.player === playerId && e.type === type);
      if (idx !== -1) {
        const originalIdx = m.events.length - 1 - idx;
        m.events.splice(originalIdx, 1);
        if (type === 'goal') {
           if (teamId === t1.id) { m.score1 = Math.max(0, m.score1 - 1); m.stats.t1Sot = Math.max(0, m.stats.t1Sot - 1); }
           else { m.score2 = Math.max(0, m.score2 - 1); m.stats.t2Sot = Math.max(0, m.stats.t2Sot - 1); }
        }
      }
      return m;
    });
  };

  const handleProgression = () => {
    if (!isAdmin) return;
    
    if (match.status === 'upcoming') {
      setDialogState('START_MATCH');
    } 
    else if (match.status === 'live' && match.timer.period === '1st Half') {
      updateLiveMatch(m => {
        m.timer.period = 'HT'; m.timer.isRunning = false;
        if (m.timer.lastStartTime) {
            m.timer.baseElapsed += Math.floor((Date.now() - m.timer.lastStartTime) / 1000); 
        }
        m.timer.lastStartTime = null;
        return m;
      });
    }
    else if (match.status === 'live' && match.timer.period === 'HT') {
      updateLiveMatch(m => {
        m.timer.period = '2nd Half'; m.timer.isRunning = true; m.timer.lastStartTime = Date.now(); m.timer.stoppage = 0;
        // Strictly set clock to start at half duration (e.g., 10:00 or 15:00)
        m.timer.baseElapsed = (m.halfDuration || 15) * 60; 
        return m;
      });
    }
    else if (match.status === 'live' && match.timer.period === '2nd Half') {
      if (match.stage !== 'group' && match.score1 === match.score2) {
        setDialogState('TIED_MATCH');
      } else {
        updateLiveMatch(m => {
          m.status = 'completed'; m.timer.period = 'FT'; m.timer.isRunning = false;
          if (m.timer.lastStartTime) { m.timer.baseElapsed += Math.floor((Date.now() - m.timer.lastStartTime) / 1000); }
          m.timer.lastStartTime = null;
          return m;
        });
      }
    }
    else if (match.timer.period === 'ET 1st Half') {
       updateLiveMatch(m => { 
           m.timer.period = 'ET HT'; m.timer.isRunning = false; 
           if (m.timer.lastStartTime) { m.timer.baseElapsed += Math.floor((Date.now() - m.timer.lastStartTime) / 1000); }
           m.timer.lastStartTime = null;
           return m; 
       });
    }
    else if (match.timer.period === 'ET HT') {
       updateLiveMatch(m => { m.timer.period = 'ET 2nd Half'; m.timer.isRunning = true; m.timer.lastStartTime = Date.now(); return m; });
    }
    else if (match.timer.period === 'ET 2nd Half') {
       if (match.score1 === match.score2) {
          updateLiveMatch(m => {
            m.status = 'completed'; m.timer.period = 'Pens'; m.timer.isRunning = false; m.shootout = { t1: [{player:'', res:null}, {player:'', res:null}, {player:'', res:null}], t2: [{player:'', res:null}, {player:'', res:null}, {player:'', res:null}], tossWinner: null };
            if (m.timer.lastStartTime) { m.timer.baseElapsed += Math.floor((Date.now() - m.timer.lastStartTime) / 1000); }
            m.timer.lastStartTime = null;
            return m;
          });
       } else {
          updateLiveMatch(m => {
            m.status = 'completed'; m.timer.period = 'FT'; m.timer.isRunning = false;
            if (m.timer.lastStartTime) { m.timer.baseElapsed += Math.floor((Date.now() - m.timer.lastStartTime) / 1000); }
            m.timer.lastStartTime = null;
            return m;
          });
       }
    }
  };

  const getProgressionBtnText = () => {
    if (match.status === 'upcoming') return 'Start Match';
    if (match.status === 'completed' && match.timer.period !== 'Pens') return 'Match Ended';
    if (match.timer.period === '1st Half') return 'End 1st Half';
    if (match.timer.period === 'HT') return 'Start 2nd Half';
    if (match.timer.period === '2nd Half') return 'End Match';
    if (match.timer.period === 'ET 1st Half') return 'End ET 1st Half';
    if (match.timer.period === 'ET HT') return 'Start ET 2nd Half';
    if (match.timer.period === 'ET 2nd Half') return 'End Extra Time';
    if (match.timer.period === 'Pens') return 'End Shootout';
    return 'Advance';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-50 overflow-y-auto">
      <div className="min-h-screen p-0 sm:p-6 flex justify-center relative">
        
        {dialogState && (
           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-zinc-950 border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
                 {dialogState === 'RESET_TIMER' && (
                    <>
                       <RotateCcw size={40} className="text-amber-500 mb-4" />
                       <h3 className="text-white font-bold text-lg mb-2">Reset Clock Timer?</h3>
                       <p className="text-zinc-400 text-sm mb-6">This will reset the elapsed time to 00:00 and pause the clock. Scores and events will remain.</p>
                       <div className="flex gap-3 w-full">
                          <button onClick={() => setDialogState(null)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-colors">Cancel</button>
                          <button onClick={() => {
                             updateLiveMatch(m => {
                                m.timer.baseElapsed = 0;
                                m.timer.stoppage = 0;
                                m.timer.isRunning = false;
                                m.timer.lastStartTime = null;
                                return m;
                             });
                             setDialogState(null);
                          }} className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-widest transition-colors">Reset Time</button>
                       </div>
                    </>
                 )}
                 {dialogState === 'RESET_MATCH' && (
                    <>
                       <AlertCircle size={40} className="text-rose-500 mb-4" />
                       <h3 className="text-white font-bold text-lg mb-2">Reset Entire Match?</h3>
                       <p className="text-zinc-400 text-sm mb-6">This will clear all scores, stats, and events, reverting the match to upcoming. Ideal for clearing trial runs.</p>
                       <div className="flex gap-3 w-full">
                          <button onClick={() => setDialogState(null)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-colors">Cancel</button>
                          <button onClick={() => {
                             updateLiveMatch(m => {
                                m.status = 'upcoming';
                                m.score1 = 0;
                                m.score2 = 0;
                                m.stats = { t1Sot:0, t1Corners:0, t1Fouls:0, t2Sot:0, t2Corners:0, t2Fouls:0 };
                                m.events = [];
                                m.shootout = null;
                                m.timer = { isRunning: false, baseElapsed: 0, lastStartTime: null, stoppage: 0, period: '1st Half' };
                                m.halfDuration = 15;
                                return m;
                             });
                             setDialogState(null);
                          }} className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-widest transition-colors">Confirm Reset</button>
                       </div>
                    </>
                 )}
                 {dialogState === 'START_MATCH' && (
                    <>
                       <Play size={40} className="text-emerald-500 mb-4" />
                       <h3 className="text-white font-bold text-lg mb-2">Start Match</h3>
                       <p className="text-zinc-400 text-sm mb-6">Enter the duration for one half.</p>
                       <input type="number" defaultValue={15} id="halfDurationInput" className="w-full bg-black border border-white/20 text-white text-center font-bold rounded-xl p-3 mb-6 outline-none focus:border-white/40 transition-colors" />
                       <div className="flex gap-3 w-full">
                          <button onClick={() => setDialogState(null)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest transition-colors">Cancel</button>
                          <button onClick={() => {
                             const duration = document.getElementById('halfDurationInput').value || 15;
                             updateLiveMatch(m => {
                                m.status = 'live'; 
                                m.timer.period = '1st Half'; 
                                m.timer.isRunning = true; 
                                m.timer.lastStartTime = Date.now(); 
                                m.timer.baseElapsed = 0;
                                m.halfDuration = parseInt(duration);
                                return m;
                             });
                             setDialogState(null);
                          }} className="flex-1 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs uppercase tracking-widest transition-colors">Start</button>
                       </div>
                    </>
                 )}
                 {dialogState === 'TIED_MATCH' && (
                    <>
                       <AlertCircle size={40} className="text-amber-500 mb-4" />
                       <h3 className="text-white font-bold text-lg mb-2">Match Tied!</h3>
                       <p className="text-zinc-400 text-sm mb-6">Full time reached. How should the match proceed?</p>
                       <div className="flex flex-col gap-3 w-full">
                          <button onClick={() => {
                             updateLiveMatch(m => {
                                m.timer.period = 'ET 1st Half'; m.timer.isRunning = true; m.timer.lastStartTime = Date.now(); m.timer.stoppage = 0;
                                return m;
                             });
                             setDialogState(null);
                          }} className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest transition-colors border border-white/10">Extra Time</button>
                          <button onClick={() => {
                             updateLiveMatch(m => {
                                m.status = 'completed'; m.timer.period = 'Pens'; m.timer.isRunning = false; 
                                m.shootout = { t1: [{player:'', res:null}, {player:'', res:null}, {player:'', res:null}], t2: [{player:'', res:null}, {player:'', res:null}, {player:'', res:null}], tossWinner: null };
                                return m;
                             });
                             setDialogState(null);
                          }} className="w-full py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 font-bold text-xs uppercase tracking-widest transition-colors border border-rose-500/20">Penalties</button>
                       </div>
                    </>
                 )}
              </div>
           </div>
        )}

        <div className="bg-[#0a0a0a] sm:border border-white/10 w-full max-w-6xl sm:rounded-[2rem] shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col relative my-auto overflow-hidden min-h-screen sm:min-h-0">
          
          <div className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 p-3 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-xl">
            <div className="flex items-center justify-between w-full sm:w-auto gap-2">
               {isAdmin && (
                 <button onClick={() => setDialogState('RESET_MATCH')} className="bg-rose-500/10 text-rose-500 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                    <RotateCcw size={14}/> <span className="hidden sm:inline">Reset Match</span>
                 </button>
               )}
               {isAdmin && match.status !== 'completed' && (
                  <button onClick={handleProgression} className="bg-white text-black px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-colors flex items-center gap-1 sm:gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)] whitespace-nowrap">
                     {getProgressionBtnText()} <ChevronRight size={14}/>
                  </button>
               )}
               {(!isAdmin || match.status === 'completed') && (
                  <span className="text-white font-bold text-sm sm:text-lg truncate max-w-[200px]">{t1.name} vs {t2.name}</span>
               )}
               <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors sm:hidden shrink-0">
                  <X size={18} />
               </button>
            </div>
            
            <div className="flex items-center w-full sm:w-auto">
               <div className="flex flex-1 items-center justify-between bg-zinc-900 rounded-full px-3 py-1.5 border border-white/10">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{match.timer.period}</span>
                     <div className="text-lg sm:text-xl font-bold font-outfit text-white tabular-nums flex items-center gap-1">
                        <LiveTimerDisplay timer={match.timer} match={match} />
                        {match.timer.stoppage > 0 && <span className="text-rose-500 text-[10px] sm:text-sm w-4">+{match.timer.stoppage}</span>}
                     </div>
                  </div>
                  {isAdmin && match.status !== 'completed' && (
                     <div className="flex items-center ml-2 sm:ml-4 border-l border-white/10 pl-2 sm:pl-4 gap-1.5 sm:gap-2">
                        <button onClick={toggleTimer} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${match.timer.isRunning ? 'bg-amber-500/20 text-amber-500' : 'bg-white/10 text-white'}`}>
                           {match.timer.isRunning ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor" className="ml-0.5"/>}
                        </button>
                        <button onClick={triggerResetTimer} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-zinc-400 hover:text-white transition-colors">
                           <RotateCcw size={14} />
                        </button>
                        <button onClick={() => updateLiveMatch(m => { m.timer.stoppage += 1; return m; })} className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold text-[10px] transition-colors">
                           +1
                        </button>
                     </div>
                  )}
               </div>
               
               <button onClick={onClose} className="hidden sm:flex w-10 h-10 rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white items-center justify-center transition-colors ml-4 shrink-0">
                  <X size={20} />
               </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-10 flex-1 overflow-y-auto">
            <div className="flex flex-row items-center justify-center gap-2 sm:gap-8 md:gap-16 mb-8 md:mb-12">
               <div className="flex-1 text-center bg-white/[0.02] p-3 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-white/5 w-full relative">
                  <div className="w-10 sm:w-16 h-1 sm:h-2 mx-auto rounded-full mb-3 sm:mb-6 shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{backgroundColor: t1.color}} />
                  <h3 className="font-outfit font-black text-white mb-3 sm:mb-6 text-[11px] sm:text-3xl uppercase tracking-tight line-clamp-2 min-h-[2rem] sm:min-h-0 flex items-center justify-center">{t1.name}</h3>
                  <div className="flex items-center justify-center gap-2 sm:gap-6">
                     {isAdmin && <button onClick={()=>updateLiveMatch(m=>{ m.score1 = Math.max(0, m.score1-1); m.stats.t1Sot = Math.max(0, m.stats.t1Sot-1); return m;})} className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors shrink-0"><Minus size={14}/></button>}
                     <span className="text-4xl sm:text-8xl font-black font-outfit text-white tabular-nums w-10 sm:w-24 leading-none shrink-0">{match.score1}</span>
                     {isAdmin && <button onClick={()=>updateLiveMatch(m=>{ m.score1 += 1; m.stats.t1Sot += 1; return m;})} className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center transition-colors shrink-0"><Plus size={14}/></button>}
                  </div>
               </div>
               
               <div className="text-zinc-600 font-black font-outfit text-xs sm:text-2xl uppercase tracking-[0.2em] shrink-0">VS</div>
               
               <div className="flex-1 text-center bg-white/[0.02] p-3 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-white/5 w-full relative">
                  <div className="w-10 sm:w-16 h-1 sm:h-2 mx-auto rounded-full mb-3 sm:mb-6 shadow-[0_0_15px_rgba(255,255,255,0.2)]" style={{backgroundColor: t2.color}} />
                  <h3 className="font-outfit font-black text-white mb-3 sm:mb-6 text-[11px] sm:text-3xl uppercase tracking-tight line-clamp-2 min-h-[2rem] sm:min-h-0 flex items-center justify-center">{t2.name}</h3>
                  <div className="flex items-center justify-center gap-2 sm:gap-6">
                     {isAdmin && <button onClick={()=>updateLiveMatch(m=>{ m.score2 = Math.max(0, m.score2-1); m.stats.t2Sot = Math.max(0, m.stats.t2Sot-1); return m;})} className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors shrink-0"><Minus size={14}/></button>}
                     <span className="text-4xl sm:text-8xl font-black font-outfit text-white tabular-nums w-10 sm:w-24 leading-none shrink-0">{match.score2}</span>
                     {isAdmin && <button onClick={()=>updateLiveMatch(m=>{ m.score2 += 1; m.stats.t2Sot += 1; return m;})} className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center transition-colors shrink-0"><Plus size={14}/></button>}
                  </div>
               </div>
            </div>

            <div className="bg-white/[0.02] rounded-3xl border border-white/5 p-4 sm:p-8 mb-8 md:mb-12">
               <h4 className="text-center text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 sm:mb-8">Match Statistics</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                  {[ {key:'Sot', label:'Shots on Target'}, {key:'Corners', label:'Corners'}, {key:'Fouls', label:'Fouls'} ].map(stat => (
                     <div key={stat.key} className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">{stat.label}</span>
                        <div className="flex items-center gap-6 w-full justify-between bg-zinc-900/50 p-3 rounded-2xl border border-white/5">
                           <div className="flex items-center gap-3">
                              {isAdmin && <button onClick={()=>updateLiveMatch(m=>{ m.stats[`t1${stat.key}`] = Math.max(0, m.stats[`t1${stat.key}`]-1); return m;})} className="text-zinc-500 hover:text-white p-1"><Minus size={14}/></button>}
                              <span className="text-xl font-bold text-white w-6 text-center tabular-nums">{match.stats[`t1${stat.key}`]}</span>
                              {isAdmin && <button onClick={()=>updateLiveMatch(m=>{ m.stats[`t1${stat.key}`]++; return m;})} className="text-zinc-500 hover:text-white p-1"><Plus size={14}/></button>}
                           </div>
                           <div className="w-px h-6 bg-white/10" />
                           <div className="flex items-center gap-3">
                              {isAdmin && <button onClick={()=>updateLiveMatch(m=>{ m.stats[`t2${stat.key}`] = Math.max(0, m.stats[`t2${stat.key}`]-1); return m;})} className="text-zinc-500 hover:text-white p-1"><Minus size={14}/></button>}
                              <span className="text-xl font-bold text-white w-6 text-center tabular-nums">{match.stats[`t2${stat.key}`]}</span>
                              {isAdmin && <button onClick={()=>updateLiveMatch(m=>{ m.stats[`t2${stat.key}`]++; return m;})} className="text-zinc-500 hover:text-white p-1"><Plus size={14}/></button>}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div>
               {!isAdmin ? (
                  // VIEWER VIEW: Show Match Timeline / Important Moments
                  <div>
                    <h4 className="text-center text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6 sm:mb-8">Important Moments</h4>
                    <div className="bg-white/[0.02] rounded-3xl border border-white/5 p-4 sm:p-8">
                       {match.events.length === 0 ? (
                         <p className="text-zinc-500 text-center text-sm font-bold py-8">No significant events yet.</p>
                       ) : (
                         <div className="flex flex-col gap-2 relative before:absolute before:inset-y-0 before:w-px before:bg-white/10 before:left-1/2 before:-translate-x-1/2">
                           {[...match.events].sort((a,b) => a.minute - b.minute).map(e => {
                              const p = players.find(x => x.id === e.player);
                              const t = getTeam(e.team);
                              const isT1 = e.team === match.team1;
                              return (
                                <div key={e.id} className={`flex items-center gap-4 py-2 w-1/2 relative ${isT1 ? 'flex-row self-start pr-8 justify-end' : 'flex-row-reverse self-end pl-8 justify-end'}`}>
                                   <div className={`flex flex-col ${isT1 ? 'text-right' : 'text-left'}`}>
                                      <span className="font-bold text-white text-sm sm:text-base">{p?.name || 'Unknown Player'}</span>
                                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest" style={{color: t.color}}>{t.name}</span>
                                   </div>
                                   <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border border-white/10 bg-[#0a0a0a] shadow-sm z-10 absolute top-1/2 -translate-y-1/2 ${isT1 ? '-right-4 sm:-right-5' : '-left-4 sm:-left-5'}`}>
                                      {e.type === 'goal' ? '⚽' : e.type === 'assist' ? '👟' : e.type === 'yellow' ? <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm shadow-sm" /> : e.type === 'red' ? <div className="w-2.5 h-3.5 bg-rose-500 rounded-sm shadow-sm" /> : '🧤'}
                                   </div>
                                   <span className={`text-xs font-black text-zinc-500 w-8 absolute top-1/2 -translate-y-1/2 ${isT1 ? '-right-[3.5rem] sm:-right-[4.5rem] text-left' : '-left-[3.5rem] sm:-left-[4.5rem] text-right'}`}>{e.minute}'</span>
                                </div>
                              )
                           })}
                         </div>
                       )}
                    </div>
                  </div>
               ) : (
                  // ADMIN VIEW: Show Full Rosters with Event Controls
                  <>
                     <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Match Rosters</h4>
                        <button onClick={() => setDeleteMode(!deleteMode)} className={`text-[10px] font-bold px-4 py-2 rounded-lg uppercase tracking-widest transition-colors ${deleteMode ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(243,64,84,0.5)]' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}>
                           {deleteMode ? 'Delete Mode Active' : 'Enable Delete Mode'}
                        </button>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        {[t1, t2].map(team => (
                           <div key={team.id} className="bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden">
                              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                                 <div className="w-1.5 h-4 rounded-full" style={{backgroundColor: team.color}} />
                                 <h3 className="font-outfit font-bold text-white text-sm sm:text-lg uppercase tracking-tight">{team.name}</h3>
                              </div>
                              <div className="divide-y divide-white/5 p-1 sm:p-2">
                                 {players.filter(p => p.teamId === team.id).map((p, pIdx) => {
                                    const pEvents = match.events.filter(e => e.player === p.id);
                                    const goals = pEvents.filter(e => e.type === 'goal');
                                    const assists = pEvents.filter(e => e.type === 'assist').length;
                                    const yellows = pEvents.filter(e => e.type === 'yellow').length;
                                    const reds = pEvents.filter(e => e.type === 'red').length;
                                    const saves = pEvents.filter(e => e.type === 'save').length;
                                    
                                    const isCaptain = pIdx === 0;
                                    const isIcon = pIdx === 1;

                                    return (
                                       <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-white/[0.02] transition-colors gap-4 rounded-xl">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400 font-bold text-[9px] border border-white/5 relative">
                                                {p.position}
                                                {isCaptain && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-black text-[8px] font-black rounded-full flex items-center justify-center border border-black shadow-[0_0_8px_rgba(245,158,11,0.5)]">C</span>}
                                                {isIcon && !isCaptain && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-black shadow-[0_0_8px_rgba(168,85,247,0.5)]">★</span>}
                                             </div>
                                             <div>
                                                <span className="font-bold text-zinc-200 block text-sm">{p.name}</span>
                                                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                                   {goals.map((g, i) => <span key={i} className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">⚽ {g.minute}'</span>)}
                                                   {assists > 0 && <span className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">{assists} Ast</span>}
                                                   {yellows > 0 && <span className="text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded flex items-center gap-1"><div className="w-2 h-2.5 bg-yellow-400 rounded-sm shadow-sm" /> {yellows}</span>}
                                                   {reds > 0 && <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded flex items-center gap-1"><div className="w-2 h-2.5 bg-rose-500 rounded-sm shadow-sm" /> {reds}</span>}
                                                   {saves > 0 && p.position === 'GK' && <span className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">🧤 {saves}</span>}
                                                </div>
                                             </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-1 self-start sm:self-auto flex-wrap">
                                             {[ 
                                                { type: 'goal', icon: '⚽', hasStat: goals.length > 0 },
                                                { type: 'assist', icon: '👟', hasStat: assists > 0 },
                                                { type: 'yellow', customIcon: <div className="w-2 h-2.5 bg-yellow-400 rounded-sm shadow-sm" />, hasStat: yellows > 0 },
                                                { type: 'red', customIcon: <div className="w-2 h-2.5 bg-rose-500 rounded-sm shadow-sm" />, hasStat: reds > 0 }
                                             ].map(act => (
                                                <div key={act.type} className={`flex items-center rounded-lg border overflow-hidden transition-all h-8 ${act.hasStat ? 'border-white/20 bg-white/10' : 'border-white/5 bg-transparent'}`}>
                                                   <button onClick={() => deleteMode ? removeEvent(team.id, p.id, act.type) : addEvent(team.id, p.id, act.type)} className={`px-2 h-full flex items-center justify-center hover:bg-white/10 ${deleteMode ? 'hover:bg-rose-500/20' : ''}`}>
                                                      {act.customIcon || <span className="text-[12px]">{act.icon}</span>}
                                                   </button>
                                                </div>
                                             ))}
                                             {p.position === 'GK' && (
                                                <div className={`flex items-center rounded-lg border overflow-hidden transition-all h-8 ml-1 ${saves > 0 ? 'border-purple-500/30 bg-purple-500/10' : 'border-white/5 bg-transparent'}`}>
                                                   <button onClick={() => deleteMode ? removeEvent(team.id, p.id, 'save') : addEvent(team.id, p.id, 'save')} className={`px-2 h-full flex items-center justify-center hover:bg-white/10 ${deleteMode ? 'hover:bg-rose-500/20' : ''}`}>
                                                      <span className="text-[12px]">🧤</span>
                                                   </button>
                                                </div>
                                             )}
                                          </div>
                                       </div>
                                    )
                                 })}
                              </div>
                           </div>
                        ))}
                     </div>
                  </>
               )}
            </div>

            {match.shootout && (
               <div className="mt-12 bg-white/[0.02] rounded-3xl border border-white/10 shadow-lg p-8 md:p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none">🥅</div>
                  <h3 className="font-bold text-white text-center mb-10 uppercase tracking-[0.3em] text-sm flex justify-center items-center gap-3">
                     <div className="w-8 h-px bg-white/20"/> Penalty Shootout <div className="w-8 h-px bg-white/20"/>
                  </h3>
                  
                  <div className="flex flex-col md:flex-row justify-around gap-12 relative z-10">
                     {[ {key:'t1', t:t1}, {key:'t2', t:t2} ].map(teamObj => (
                        <div key={teamObj.key} className="flex-1 flex flex-col items-center">
                           <h4 className="font-outfit font-black text-2xl mb-8 border-b-2 pb-2 inline-block px-4 text-white" style={{borderColor: teamObj.t.color}}>{teamObj.t.name}</h4>
                           
                           <div className="flex flex-col gap-4 w-full">
                              {match.shootout[teamObj.key].map((kickObj, i) => {
                                 const res = kickObj.res;
                                 const playerId = kickObj.player || '';
                                 return (
                                    <div key={i} className="flex items-center gap-3 w-full bg-zinc-900/50 p-2 rounded-xl border border-white/5">
                                       <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest w-6 text-center shrink-0">{i+1}</span>
                                       {isAdmin ? (
                                          <select
                                             value={playerId}
                                             onChange={e => updateLiveMatch(m => { m.shootout[teamObj.key][i].player = e.target.value; return m; })}
                                             className="text-xs p-2 border border-white/10 rounded-lg flex-1 outline-none font-bold bg-black text-white"
                                          >
                                             <option value="">Select Kicker</option>
                                             {players.filter(p => p.teamId === teamObj.t.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                          </select>
                                       ) : (
                                          <span className="text-sm font-bold flex-1 truncate text-zinc-300 px-2">{players.find(p => p.id === playerId)?.name || 'Kicker TBD'}</span>
                                       )}

                                       <div className="flex items-center gap-1 shrink-0 bg-black/50 rounded-lg p-1 border border-white/5">
                                          <button 
                                             onClick={() => isAdmin && updateLiveMatch(m => { m.shootout[teamObj.key][i].res = 'goal'; return m; })} 
                                             className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${res === 'goal' ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-transparent text-zinc-600 hover:text-white hover:bg-white/5'} ${!isAdmin && 'pointer-events-none'}`}
                                          >⚽</button>
                                          <button 
                                             onClick={() => isAdmin && updateLiveMatch(m => { m.shootout[teamObj.key][i].res = 'save'; return m; })} 
                                             className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${res === 'save' ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-transparent text-zinc-600 hover:text-white hover:bg-white/5'} ${!isAdmin && 'pointer-events-none'}`}
                                          >🧤</button>
                                          <button 
                                             onClick={() => isAdmin && updateLiveMatch(m => { m.shootout[teamObj.key][i].res = 'miss'; return m; })} 
                                             className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${res === 'miss' ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-transparent text-zinc-600 hover:text-white hover:bg-white/5'} ${!isAdmin && 'pointer-events-none'}`}
                                          ><X size={16}/></button>
                                          {isAdmin && res !== null && (
                                             <button onClick={() => updateLiveMatch(m => { m.shootout[teamObj.key][i].res = null; return m; })} className="w-6 h-8 text-zinc-500 hover:text-rose-500 flex items-center justify-center"><RotateCcw size={12}/></button>
                                          )}
                                       </div>
                                    </div>
                                 )
                              })}
                              {isAdmin && (
                                 <button onClick={() => updateLiveMatch(m => { m.shootout[teamObj.key].push({player:'', res:null}); return m; })} className="mt-2 w-full py-3 rounded-xl border border-dashed border-white/20 text-zinc-500 flex items-center justify-center hover:border-white/40 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest gap-2">
                                    <Plus size={14} /> Add Kicker
                                 </button>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>

                  {isAdmin && (
                     <div className="flex flex-col items-center justify-center gap-4 mt-12 p-6 bg-zinc-900/50 rounded-2xl border border-white/5 max-w-lg mx-auto relative z-10">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Sudden Death / Coin Toss Winner</span>
                        <div className="flex gap-4 w-full">
                           <button onClick={()=>updateLiveMatch(m=>{m.shootout.tossWinner = m.shootout.tossWinner === t1.id ? null : t1.id; return m;})} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${match.shootout.tossWinner === t1.id ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-black border border-white/10 text-zinc-400 hover:bg-white/5'}`}>{t1.name}</button>
                           <button onClick={()=>updateLiveMatch(m=>{m.shootout.tossWinner = m.shootout.tossWinner === t2.id ? null : t2.id; return m;})} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${match.shootout.tossWinner === t2.id ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-black border border-white/10 text-zinc-400 hover:bg-white/5'}`}>{t2.name}</button>
                        </div>
                     </div>
                  )}
                  {match.shootout.tossWinner && !isAdmin && (
                     <div className="mt-12 p-6 bg-black border border-white/10 text-white text-center rounded-2xl max-w-lg mx-auto shadow-2xl relative z-10">
                        <span className="font-bold uppercase tracking-widest text-[10px] bg-white/10 px-3 py-1.5 rounded-full text-zinc-300">Shootout Winner</span>
                        <h3 className="font-outfit font-black text-3xl mt-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">{getTeam(match.shootout.tossWinner).name}</h3>
                     </div>
                  )}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('fixtures');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  
  const [teams, setTeams] = useState(initialTeams);
  const [matches, setMatches] = useState(initialMatches);
  const [players, setPlayers] = useState([]);
  const [editingMatchId, setEditingMatchId] = useState(null);

  const [addPlayerTeamId, setAddPlayerTeamId] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('FWD');
  const [adminMvpPlayer, setAdminMvpPlayer] = useState('');

  useEffect(() => {
    if (isFirebaseConnected && appDataRef) {
      const unsubscribe = onSnapshot(appDataRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.teams) setTeams(data.teams);
          if (data.matches) setMatches(data.matches);
          if (data.players) setPlayers(data.players);
        } else {
          setDoc(appDataRef, { teams: initialTeams, matches: initialMatches, players: [] });
        }
      });
      return () => unsubscribe();
    } 
    else {
      try {
        const storedTeams = localStorage.getItem('khajTeamsV4');
        const storedMatches = localStorage.getItem('khajMatchesV4');
        const storedPlayers = localStorage.getItem('khajPlayersV4');
        
        if (storedTeams) setTeams(JSON.parse(storedTeams));
        else localStorage.setItem('khajTeamsV4', JSON.stringify(initialTeams));
        
        if (storedMatches) setMatches(JSON.parse(storedMatches));
        else localStorage.setItem('khajMatchesV4', JSON.stringify(initialMatches));
        
        if (storedPlayers) setPlayers(JSON.parse(storedPlayers));
      } catch (e) { console.error(e); }

      const handleStorageChange = (e) => {
        if (e.key === 'khajTeamsV4') setTeams(JSON.parse(e.newValue));
        if (e.key === 'khajMatchesV4') setMatches(JSON.parse(e.newValue));
        if (e.key === 'khajPlayersV4') setPlayers(JSON.parse(e.newValue));
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const syncToDB = (t, m, p) => {
    if (t) setTeams(t);
    if (m) setMatches(m);
    if (p) setPlayers(p);

    if (isFirebaseConnected && appDataRef) {
      const payload = {};
      if (t) payload.teams = t;
      if (m) payload.matches = m;
      if (p) payload.players = p;
      setDoc(appDataRef, payload, { merge: true }).catch(e => console.error("Firebase Sync Error", e));
    } else {
      if (t) localStorage.setItem('khajTeamsV4', JSON.stringify(t));
      if (m) localStorage.setItem('khajMatchesV4', JSON.stringify(m));
      if (p) localStorage.setItem('khajPlayersV4', JSON.stringify(p));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginPass === 'ece252') { setIsAdmin(true); setShowLogin(false); setLoginPass(''); setLoginError(''); }
    else { setLoginError('Incorrect Password'); }
  };

  const getTeam = (id) => teams.find(t => t.id === id) || { name: 'TBD', color: '#cbd5e1' };

  const calculateStandings = () => {
    let table = teams.map(t => ({ id: t.id, name: t.name, color: t.color, p:0, w:0, d:0, l:0, gf:0, ga:0, gd:0, pts:0 }));
    
    matches.filter(m => m.stage === 'group' && m.status === 'completed').forEach(m => {
      const t1 = table.find(t => t.id === m.team1);
      const t2 = table.find(t => t.id === m.team2);
      if(!t1 || !t2) return;
      
      t1.p++; t2.p++;
      t1.gf += m.score1; t1.ga += m.score2;
      t2.gf += m.score2; t2.ga += m.score1;
      
      if (m.score1 > m.score2) { t1.w++; t1.pts += 3; t2.l++; }
      else if (m.score1 < m.score2) { t2.w++; t2.pts += 3; t1.l++; }
      else { t1.d++; t2.d++; t1.pts += 1; t2.pts += 1; }
    });
    
    table.forEach(t => t.gd = t.gf - t.ga);
    table.sort((a,b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    return table;
  };

  const standings = calculateStandings();

  useEffect(() => {
    const groupMatchesCompleted = matches.filter(m => m.stage === 'group' && m.status === 'completed').length === 6;
    if (groupMatchesCompleted) {
       let changed = false;
       const newMatches = matches.map(m => {
         if (m.id === 'sf1' && m.status === 'upcoming' && !m.team1) {
           changed = true; return { ...m, team1: standings[1]?.id || null, team2: standings[2]?.id || null };
         }
         if (m.id === 'f1' && m.status === 'upcoming' && !m.team1) {
           const sf = matches.find(x => x.id === 'sf1');
           if (sf && sf.status === 'completed') {
             changed = true;
             const sfWinner = sf.score1 > sf.score2 ? sf.team1 : (sf.score2 > sf.score1 ? sf.team2 : (sf.shootout?.tossWinner || sf.team1));
             return { ...m, team1: standings[0]?.id || null, team2: sfWinner || null };
           }
         }
         return m;
       });
       if (changed) syncToDB(null, newMatches, null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches]);

  const liveMatch = matches.find(m => m.status === 'live');
  const upcomingMatch = !liveMatch ? matches.find(m => m.status === 'upcoming') : null;
  const heroMatch = liveMatch || upcomingMatch;
  const isLive = !!liveMatch;

  const finalMatch = matches.find(m => m.id === 'f1');
  const isTournamentOver = finalMatch && finalMatch.status === 'completed';
  let tournamentWinner = null;
  let tournamentRunnerUp = null;
  
  if (isTournamentOver) {
     tournamentWinner = finalMatch.score1 > finalMatch.score2 ? finalMatch.team1 : (finalMatch.score2 > finalMatch.score1 ? finalMatch.team2 : (finalMatch.shootout?.tossWinner || finalMatch.team1));
     tournamentRunnerUp = tournamentWinner === finalMatch.team1 ? finalMatch.team2 : finalMatch.team1;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-white selection:text-black relative overflow-hidden flex flex-col">
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@500;700;900&display=swap');
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; font-family: 'Inter', sans-serif; }
        .font-outfit { font-family: 'Outfit', sans-serif; }
        body { margin: 0; padding: 0; overflow-x: hidden; background-color: #050505; }
      `}} />

      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-outfit font-black tracking-tight text-white leading-none shadow-sm">KHAJANAV '26</h1>
            </div>
          </div>
          <div>
            {isAdmin ? (
              <div className="flex items-center gap-3">
                 {!isFirebaseConnected && <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest hidden sm:block">Local Mode</span>}
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" title="Admin Mode Active"></div>
              </div>
            ) : (
              <button onClick={() => setShowLogin(true)} className="w-8 h-8 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center" title="Admin Login">
                 <div className="w-1 h-1 rounded-full bg-zinc-600"></div>
              </button>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem] max-w-sm w-full shadow-[0_0_60px_rgba(0,0,0,0.8)]">
              <h2 className="text-xl font-black font-outfit text-white uppercase tracking-tight mb-6 flex items-center gap-2"><Settings size={20}/> System Access</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} placeholder="Passcode" className="w-full bg-black border border-white/10 text-white rounded-xl p-4 font-bold outline-none focus:border-white/30 transition-colors" />
                {loginError && <p className="text-rose-500 text-xs font-bold">{loginError}</p>}
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-white text-black font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-md hover:bg-zinc-200 transition-colors">Authorize</button>
                  <button type="button" onClick={()=>{setShowLogin(false); setLoginError('');}} className="flex-1 bg-white/5 text-zinc-400 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-white/10 hover:text-white transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 flex flex-col">
        
        {isTournamentOver ? (
           <div className="w-full bg-gradient-to-br from-amber-500/20 to-amber-900/40 border border-amber-500/30 rounded-[2rem] p-10 md:p-16 mb-12 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.15)]">
              <Trophy size={64} className="text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
              <h2 className="text-[10px] font-bold text-amber-500/80 uppercase tracking-[0.4em] mb-4">Champions of Khajanav '26</h2>
              <h1 className="text-5xl md:text-7xl font-outfit font-black text-white uppercase tracking-tighter mb-4">{getTeam(tournamentWinner).name}</h1>
              <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mt-4">Runners Up: <span className="text-zinc-200">{getTeam(tournamentRunnerUp).name}</span></p>
           </div>
        ) : heroMatch ? (
           <div className="w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 sm:p-8 md:p-12 mb-10 flex flex-col md:flex-row items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden">
              
              {/* Responsive Date/Time Block */}
              <div className="flex flex-col items-center md:items-start z-10 mb-8 md:mb-0 w-full md:w-auto">
                 <div className={`text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-4 md:mb-6 border ${isLive ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse' : 'bg-white/5 text-zinc-400 border-white/10'}`}>
                    {isLive ? 'LIVE NOW' : 'NEXT MATCH'}
                 </div>
                 {isLive && (
                    <div className="text-4xl md:text-5xl font-outfit font-black text-white flex items-center justify-center md:justify-start gap-4 mb-2 tabular-nums tracking-tighter w-full">
                       <LiveTimerDisplay timer={heroMatch.timer} match={heroMatch} />
                       {heroMatch.timer.stoppage > 0 && <span className="text-rose-500 text-2xl">+{heroMatch.timer.stoppage}'</span>}
                       <span className="text-sm font-semibold text-zinc-500 uppercase tracking-widest ml-2 bg-white/5 px-3 py-1 rounded-lg">{heroMatch.timer.period}</span>
                    </div>
                 )}
                 {!isLive && (
                    <div className="flex items-center justify-center md:justify-start gap-3 text-white font-outfit text-4xl md:text-5xl font-black mt-2 w-full">
                       <Clock size={32} className="text-zinc-500 md:w-10 md:h-10"/>
                       {new Date(heroMatch.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </div>
                 )}
              </div>

              {/* Responsive Team Names Block */}
              <div className="flex items-center justify-between md:justify-center gap-2 sm:gap-6 md:gap-12 z-10 w-full md:w-auto mt-2 md:mt-0 px-2 md:px-0">
                 <div className="flex flex-col items-center flex-1 md:flex-none">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full mb-3 md:mb-4 shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{backgroundColor: getTeam(heroMatch.team1).color, boxShadow: `0 0 20px ${getTeam(heroMatch.team1).color}`}} />
                    <span className="font-outfit font-black text-base sm:text-xl md:text-4xl text-white uppercase tracking-tight text-center leading-tight break-words max-w-[120px] md:max-w-[200px]">{getTeam(heroMatch.team1).name}</span>
                    {isLive && <motion.span key={heroMatch.score1} initial={{scale:1.5, color:getTeam(heroMatch.team1).color}} animate={{scale:1, color:"#ffffff"}} className="text-5xl md:text-7xl font-black font-outfit tabular-nums mt-3 md:mt-4 tracking-tighter">{heroMatch.score1}</motion.span>}
                 </div>
                 <span className="text-xl sm:text-3xl md:text-5xl font-black text-zinc-700 italic px-1 md:px-0">VS</span>
                 <div className="flex flex-col items-center flex-1 md:flex-none">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full mb-3 md:mb-4 shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{backgroundColor: getTeam(heroMatch.team2).color, boxShadow: `0 0 20px ${getTeam(heroMatch.team2).color}`}} />
                    <span className="font-outfit font-black text-base sm:text-xl md:text-4xl text-white uppercase tracking-tight text-center leading-tight break-words max-w-[120px] md:max-w-[200px]">{getTeam(heroMatch.team2).name}</span>
                    {isLive && <motion.span key={heroMatch.score2} initial={{scale:1.5, color:getTeam(heroMatch.team2).color}} animate={{scale:1, color:"#ffffff"}} className="text-5xl md:text-7xl font-black font-outfit tabular-nums mt-3 md:mt-4 tracking-tighter">{heroMatch.score2}</motion.span>}
                 </div>
              </div>
           </div>
        ) : null}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 flex-1">
           <div className="xl:col-span-2 flex flex-col h-full">
              <div className="flex overflow-x-auto gap-2 mb-8 bg-white/[0.02] p-2 rounded-2xl border border-white/10 backdrop-blur-md">
                {[
                  { id: 'fixtures', label: 'Matches', icon: Calendar },
                  { id: 'teams', label: 'Squads', icon: Users },
                  { id: 'stats', label: 'Stats', icon: Activity },
                  { id: 'standings_mobile', label: 'Table (Mobile)', icon: Trophy, hiddenDesktop: true }
                ].map(tab => {
                  const Icon = tab.icon;
                  if (tab.hiddenDesktop) return (
                     <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`xl:hidden flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white/10 text-white shadow-sm border border-white/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
                        <Icon size={14} /> {tab.label.replace(' (Mobile)', '')}
                     </button>
                  );
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id.replace('_mobile',''))} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white/10 text-white shadow-sm border border-white/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
                      <Icon size={14} /> {tab.label}
                    </button>
                  )
                })}
              </div>

              <div className="flex-1">
                 <AnimatePresence mode="wait">
                   <motion.div key={activeTab} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} transition={{duration:0.2}} className="h-full">
                     
                     {activeTab === 'fixtures' && (
                       <div className="space-y-12 pb-10">
                         {['group', 'semi', 'final'].map(stage => {
                           const stageMatches = matches.filter(m => m.stage === stage);
                           if (stageMatches.length === 0) return null;
                           
                           return (
                             <div key={stage}>
                               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                                 {stage === 'group' ? 'Group Stage' : stage === 'semi' ? 'Semi Finals' : 'Grand Final'}
                                 <div className="flex-1 h-px bg-white/10" />
                               </h3>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {stageMatches.map(m => {
                                   const mt1 = getTeam(m.team1);
                                   const mt2 = getTeam(m.team2);
                                   const isInteractive = (m.team1 && m.team2);
                                   const isMatchLive = m.status === 'live';
                                   
                                   return (
                                     <div 
                                       key={m.id} 
                                       onClick={() => isInteractive && setEditingMatchId(m.id)}
                                       className={`bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/5 p-6 transition-all group relative overflow-hidden shadow-[0_4px_24px_0_rgba(0,0,0,0.2)]
                                         ${isInteractive ? 'cursor-pointer hover:bg-white/[0.05] hover:border-white/20' : ''}
                                         ${isMatchLive ? 'md:col-span-2 bg-white/[0.05] border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]' : ''}`}
                                     >
                                       <div className="flex justify-between items-center mb-6">
                                         <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border 
                                            ${m.status === 'live' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse' : 
                                              m.status === 'completed' ? 'bg-white/5 text-zinc-500 border-white/10' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                           {m.status}
                                         </span>
                                         
                                         {isAdmin && m.status === 'upcoming' ? (
                                            <input 
                                               type="datetime-local" 
                                               value={m.time}
                                               onClick={e => e.stopPropagation()}
                                               onChange={e => {
                                                  const newMatches = matches.map(x => x.id === m.id ? {...x, time: e.target.value} : x);
                                                  syncToDB(null, newMatches, null);
                                               }}
                                               className="bg-black/50 border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-1 outline-none focus:border-white/30"
                                            />
                                         ) : (
                                            <span className="text-[10px] font-bold text-zinc-500 tracking-widest">{new Date(m.time).toLocaleString([], {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                                         )}
                                       </div>

                                       <div className={`flex ${isMatchLive ? 'flex-row justify-around items-center' : 'flex-col space-y-4'}`}>
                                         <div className="flex items-center justify-between gap-4">
                                           <div className="flex items-center gap-3">
                                             <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{backgroundColor: mt1.color, boxShadow: `0 0 10px ${mt1.color}`}} />
                                             <span className={`font-outfit font-bold uppercase tracking-tight ${isMatchLive ? 'text-2xl text-white' : 'text-lg text-zinc-200'}`}>{mt1.name}</span>
                                           </div>
                                           <span className={`font-outfit font-black tabular-nums ${isMatchLive ? 'text-4xl text-white' : 'text-2xl text-zinc-400'}`}>{m.score1}</span>
                                         </div>
                                         {isMatchLive && <div className="text-zinc-600 font-black italic">VS</div>}
                                         <div className="flex items-center justify-between gap-4">
                                           <div className="flex items-center gap-3">
                                             <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{backgroundColor: mt2.color, boxShadow: `0 0 10px ${mt2.color}`}} />
                                             <span className={`font-outfit font-bold uppercase tracking-tight ${isMatchLive ? 'text-2xl text-white' : 'text-lg text-zinc-200'}`}>{mt2.name}</span>
                                           </div>
                                           <span className={`font-outfit font-black tabular-nums ${isMatchLive ? 'text-4xl text-white' : 'text-2xl text-zinc-400'}`}>{m.score2}</span>
                                         </div>
                                       </div>
                                       
                                       {isMatchLive && (
                                          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center items-center gap-4">
                                             <div className="text-2xl font-black font-outfit text-white tabular-nums tracking-tighter flex items-center gap-2">
                                                <LiveTimerDisplay timer={m.timer} match={m} />
                                                {m.timer.stoppage > 0 && <span className="text-rose-500 text-lg">+{m.timer.stoppage}</span>}
                                             </div>
                                             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{m.timer.period}</span>
                                          </div>
                                       )}
                                     </div>
                                   )
                                 })}
                               </div>
                             </div>
                           )
                         })}
                       </div>
                     )}

                     {activeTab === 'teams' && (
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                         {teams.map(team => (
                           <div key={team.id} className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                             <div className="p-6 border-b border-white/5 flex items-center justify-between relative overflow-hidden">
                               <div className="absolute inset-0 opacity-20 pointer-events-none" style={{background: `linear-gradient(45deg, transparent, ${team.color})`}}/>
                               <div className="flex items-center gap-4 relative z-10">
                                 <div className="relative">
                                   <div className="w-12 h-12 rounded-2xl shadow-lg border border-white/20" style={{backgroundColor: team.color}} />
                                   {isAdmin && (
                                     <input 
                                       type="color" value={team.color}
                                       onChange={e => { const newTeams = teams.map(t => t.id === team.id ? {...t, color: e.target.value} : t); syncToDB(newTeams, null, null); }}
                                       className="absolute inset-0 opacity-0 cursor-pointer"
                                     />
                                   )}
                                 </div>
                                 <h3 className="font-outfit font-black text-2xl text-white uppercase tracking-tight">{team.name}</h3>
                               </div>
                             </div>
                             
                             <div className="p-6 flex-1 bg-black/20">
                               {isAdmin && (
                                  <div className="mb-6 flex justify-between items-center">
                                     <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Manage Roster</span>
                                     <button onClick={() => setAddPlayerTeamId(team.id)} className="text-[9px] font-bold bg-white text-black px-4 py-2 rounded-lg uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors shadow-sm flex items-center gap-1">
                                       <Plus size={12}/> Register Player
                                     </button>
                                  </div>
                               )}

                               {addPlayerTeamId === team.id && (
                                  <div className="flex flex-col gap-2 p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
                                     <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">New Player Entry</span>
                                     <div className="flex gap-2">
                                       <input type="text" placeholder="Player Name" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} className="text-xs p-2.5 border border-white/10 rounded-lg flex-1 outline-none focus:border-white/30 font-bold text-white bg-black" />
                                       <select value={newPlayerPos} onChange={e => setNewPlayerPos(e.target.value)} className="text-xs p-2.5 border border-white/10 rounded-lg outline-none focus:border-white/30 font-bold text-white bg-black">
                                          <option value="FWD">FWD</option><option value="MID">MID</option><option value="DEF">DEF</option><option value="GK">GK</option>
                                       </select>
                                     </div>
                                     <div className="flex gap-2 mt-2">
                                       <button onClick={() => {
                                          if(newPlayerName.trim()) {
                                             const newPlayers = [...players, { id: Date.now().toString(), name: newPlayerName.trim(), teamId: team.id, position: newPlayerPos }];
                                             syncToDB(null, null, newPlayers); setNewPlayerName('');
                                          }
                                          setAddPlayerTeamId(null);
                                       }} className="bg-white hover:bg-zinc-200 text-black flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors">Save</button>
                                       <button onClick={() => setAddPlayerTeamId(null)} className="bg-transparent border border-white/10 hover:bg-white/5 text-zinc-400 flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors">Cancel</button>
                                     </div>
                                  </div>
                               )}

                               <div className="relative w-full aspect-[4/5] md:aspect-[3/4] bg-zinc-950 border-2 border-white/10 rounded-2xl mb-6 overflow-hidden flex flex-col justify-evenly py-4">
                                  <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-col justify-between items-center py-4">
                                     <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
                                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white rounded-full"></div>
                                     <div className="w-1/2 h-16 border-b border-l border-r border-white"></div>
                                     <div className="w-1/2 h-16 border-t border-l border-r border-white"></div>
                                  </div>
                                  
                                  {players.filter(p => p.teamId === team.id).length === 0 ? (
                                     <div className="absolute inset-0 flex items-center justify-center"><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Squad Empty</p></div>
                                  ) : (
                                     ['FWD', 'MID', 'DEF', 'GK'].map(pos => {
                                        const posPlayers = players.filter(p => p.teamId === team.id && p.position === pos);
                                        if (posPlayers.length === 0) return <div key={pos} className="h-10"></div>;
                                        return (
                                           <div key={pos} className="flex justify-center gap-4 md:gap-8 w-full z-10 px-4">
                                              {posPlayers.map(p => {
                                                 const pIdx = players.filter(x => x.teamId === team.id).findIndex(x => x.id === p.id);
                                                 const isCaptain = pIdx === 0;
                                                 const isIcon = pIdx === 1;
                                                 return (
                                                    <div key={p.id} className="flex flex-col items-center group relative">
                                                       <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-zinc-950 shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center text-white font-bold text-xs relative" style={{backgroundColor: team.color}}>
                                                          {p.name.substring(0,2).toUpperCase()}
                                                          {isCaptain && <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 text-black text-[8px] font-black rounded-full flex items-center justify-center border border-black z-20">C</span>}
                                                          {isIcon && !isCaptain && <span className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-black z-20">★</span>}
                                                       </div>
                                                       <span className="mt-2 text-[9px] md:text-[10px] font-bold text-zinc-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] md:max-w-[80px] text-center">{p.name}</span>
                                                       
                                                       {isAdmin && (
                                                          <button onClick={() => syncToDB(null, null, players.filter(x => x.id !== p.id))} className="absolute -top-2 -left-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30">
                                                             <X size={12}/>
                                                          </button>
                                                       )}
                                                    </div>
                                                 )
                                              })}
                                           </div>
                                        )
                                     })
                                  )}
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}

                     {activeTab === 'stats' && (
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                         {[
                           { title: 'Golden Boot', icon: '⚽', desc: 'Most Goals Scored',
                             data: players.map(p => ({
                               ...p,
                               stat: matches.reduce((sum, m) => sum + m.events.filter(e => e.player === p.id && e.type === 'goal').length, 0)
                             })).filter(p => p.stat > 0).sort((a,b) => b.stat - a.stat)
                           },
                           { title: 'Playmaker', icon: '👟', desc: 'Most Assists',
                             data: players.map(p => ({
                               ...p,
                               stat: matches.reduce((sum, m) => sum + m.events.filter(e => e.player === p.id && e.type === 'assist').length, 0)
                             })).filter(p => p.stat > 0).sort((a,b) => b.stat - a.stat)
                           },
                           { title: 'Golden Glove', icon: '🧤', desc: 'Saves (2pt), Clean Sheets (2pt), Pen Saves (4pt)',
                             data: players.filter(p => p.position === 'GK').map(p => {
                               const teamMatches = matches.filter(m => m.status === 'completed' && (m.team1 === p.teamId || m.team2 === p.teamId));
                               let pts = 0; let totalSaves = 0; let cleanSheets = 0;
                               
                               teamMatches.forEach(m => {
                                  const isT1 = m.team1 === p.teamId;
                                  const goalsConceded = isT1 ? m.score2 : m.score1;
                                  const oppSot = isT1 ? m.stats.t2Sot : m.stats.t1Sot;
                                  
                                  const baseSaves = Math.max(0, oppSot - goalsConceded);
                                  const explicitSaves = m.events.filter(e => e.player === p.id && e.type === 'save').length;
                                  const matchSaves = Math.max(baseSaves, explicitSaves);
                                  
                                  let penSaves = 0;
                                  if (m.shootout) {
                                     const oppKey = isT1 ? 't2' : 't1';
                                     penSaves = m.shootout[oppKey].filter(k => k.res === 'save').length;
                                  }

                                  totalSaves += matchSaves + penSaves;
                                  pts += (matchSaves * 2);
                                  pts += (penSaves * 4);
                                  
                                  if (goalsConceded === 0) { cleanSheets++; pts += 2; }
                               });
                               
                               return { ...p, stat: pts, totalSaves, cleanSheets };
                             }).filter(p => p.stat > 0).sort((a,b) => b.stat - a.stat)
                           },
                           { title: 'Best Player', icon: '🌟', desc: 'Performance Points Leaderboard',
                             data: players.map(p => ({ ...p, stat: p.mvpPoints || 0 })).filter(p => p.stat > 0).sort((a,b) => b.stat - a.stat)
                           }
                         ].map(board => (
                           <div key={board.title} className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 relative overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                             <div className="absolute top-0 right-0 p-8 opacity-5 text-7xl pointer-events-none">{board.icon}</div>
                             <h3 className="font-outfit font-black text-2xl text-white uppercase tracking-tight mb-2 relative z-10">{board.title}</h3>
                             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8 relative z-10">{board.desc}</p>
                             
                             {board.title === 'Best Player' && isAdmin && (
                                <div className="mb-8 p-4 bg-black/50 border border-white/10 rounded-2xl flex flex-col gap-4 backdrop-blur-md relative z-10">
                                   <select value={adminMvpPlayer} onChange={e => setAdminMvpPlayer(e.target.value)} className="text-xs p-3 border border-white/10 rounded-xl outline-none font-bold bg-zinc-900 text-white">
                                      <option value="">Select Player to Evaluate...</option>
                                      {players.map(p => <option key={p.id} value={p.id}>{p.name} ({getTeam(p.teamId).name} - {p.position})</option>)}
                                   </select>
                                   {adminMvpPlayer && (
                                      <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                         <span className="text-xs font-bold text-zinc-300">Points:</span>
                                         <div className="flex items-center gap-4">
                                            <button onClick={() => {
                                               const newPlayers = players.map(p => p.id === adminMvpPlayer ? {...p, mvpPoints: (p.mvpPoints||0)-1} : p);
                                               syncToDB(null, null, newPlayers);
                                            }} className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"><Minus size={14}/></button>
                                            <span className="font-outfit font-black text-xl text-white tabular-nums w-8 text-center">{players.find(p=>p.id===adminMvpPlayer)?.mvpPoints || 0}</span>
                                            <button onClick={() => {
                                               const newPlayers = players.map(p => p.id === adminMvpPlayer ? {...p, mvpPoints: (p.mvpPoints||0)+1} : p);
                                               syncToDB(null, null, newPlayers);
                                            }} className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"><Plus size={14}/></button>
                                         </div>
                                      </div>
                                   )}
                                </div>
                             )}

                             <div className="space-y-3 relative z-10">
                               {board.data.length === 0 ? (
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-center py-4">No records yet.</p>
                               ) : (
                                 board.data.slice(0, 5).map((p, idx) => (
                                   <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                     <div className="flex items-center gap-4">
                                       <span className="font-outfit font-black text-zinc-500 w-4 text-center">{idx + 1}</span>
                                       <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{backgroundColor: getTeam(p.teamId).color}} />
                                       <div>
                                          <span className="font-bold text-white text-sm block">{p.name}</span>
                                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{getTeam(p.teamId).name} • {p.position}</span>
                                       </div>
                                     </div>
                                     <div className="flex flex-col items-end">
                                        <span className="font-outfit font-black text-xl text-white">{p.stat}</span>
                                        {board.title === 'Golden Glove' && (
                                           <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{p.totalSaves} SV • {p.cleanSheets} CS</span>
                                        )}
                                     </div>
                                   </div>
                                 ))
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                     
                     {activeTab === 'standings_mobile' && (
                        <div className="xl:hidden pb-10">
                           <StandingsWidget standings={standings} />
                        </div>
                     )}

                   </motion.div>
                 </AnimatePresence>
              </div>
           </div>

           <div className="hidden xl:block xl:col-span-1 h-full">
              <div className="sticky top-28 h-[calc(100vh-140px)]">
                 <StandingsWidget standings={standings} />
              </div>
           </div>

        </div>
      </main>

      {editingMatchId && (
        <MatchDashboard 
          matchId={editingMatchId} 
          onClose={() => setEditingMatchId(null)} 
          matches={matches} 
          teams={teams} 
          players={players} 
          isAdmin={isAdmin} 
          syncToDB={syncToDB} 
          getTeam={getTeam} 
        />
      )}
    </div>
  );
}