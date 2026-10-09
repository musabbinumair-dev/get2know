import React, { useState } from 'react';
import { useSession } from '../services/sessionContext';
import { projectId, authDomain, firestoreDatabaseId, auth } from '../lib/firebase';

export const DebugPanel: React.FC = () => {
  const { user, sessionType, debugLastError, clearDebugLastError } = useSession();
  const [minimized, setMinimized] = useState(false);

  // Check auth state directly from Firebase SDK and app session
  const currentFbUser = auth.currentUser;
  const isSignedIn = Boolean(currentFbUser || (user && user.uid));
  const activeUid = currentFbUser?.uid || user?.uid || 'None';
  const activeEmail = currentFbUser?.email || user?.email || null;

  return (
    <aside
      aria-label="Debug Panel"
      className="fixed bottom-0 left-0 right-0 z-[999999] bg-[#0E1318] text-[#E6EDF3] border-t-2 border-[#F6C343] shadow-[0_-8px_30px_rgba(0,0,0,0.6)] font-mono text-[11px] select-text pointer-events-auto"
    >
      {/* Top Header bar with status badge and minimize/expand toggle */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#171E26] border-b border-[#2D3748] text-[#9BA1A6]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-bold text-[#F6C343] tracking-wide text-[11px]">
            DEBUG PANEL (RUNTIME)
          </span>
          <span className="text-[10px] text-gray-400">
            • {isSignedIn ? `Signed In (${sessionType})` : 'Not Signed In'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {debugLastError && (
            <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/50 text-[10px] font-bold">
              1 ERROR
            </span>
          )}
          <button
            type="button"
            onClick={() => setMinimized((prev) => !prev)}
            className="px-2 py-0.5 rounded bg-[#2D3748] hover:bg-[#3D4758] text-[#E6EDF3] text-[10px] font-bold transition-colors cursor-pointer"
          >
            {minimized ? '▲ Expand' : '▼ Minimize'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!minimized && (
        <div className="px-3 py-2 space-y-2 max-h-[40vh] overflow-y-auto">
          {/* Row 1: Firebase Project & Auth Domain */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-[#131920] p-2 rounded border border-[#232D38]">
            <div>
              <span className="text-[#8B949E] block text-[10px] uppercase font-semibold">
                Firebase Project ID:
              </span>
              <span className="text-[#58A6FF] font-bold break-all">{projectId}</span>
            </div>
            <div>
              <span className="text-[#8B949E] block text-[10px] uppercase font-semibold">
                Auth Domain (runtime):
              </span>
              <span className="text-[#58A6FF] font-bold break-all">{authDomain}</span>
            </div>
            <div>
              <span className="text-[#8B949E] block text-[10px] uppercase font-semibold">
                Firestore DB ID:
              </span>
              <span className="text-[#A5D6FF] font-bold">{firestoreDatabaseId || '(default)'}</span>
            </div>
          </div>

          {/* Row 2: Auth State */}
          <div className="bg-[#131920] p-2 rounded border border-[#232D38] flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div>
                <span className="text-[#8B949E] text-[10px] uppercase font-semibold mr-1">
                  Auth State:
                </span>
                <span
                  className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                    isSignedIn
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  {isSignedIn ? 'SIGNED IN' : 'NOT SIGNED IN'}
                </span>
              </div>

              <div>
                <span className="text-[#8B949E] text-[10px] uppercase font-semibold mr-1">
                  UID:
                </span>
                <span className="text-[#FFD36F] font-bold break-all">{activeUid}</span>
              </div>

              {activeEmail && (
                <div>
                  <span className="text-[#8B949E] text-[10px] uppercase font-semibold mr-1">
                    Email:
                  </span>
                  <span className="text-[#C9D1D9]">{activeEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Last Error from Google sign-in, sign out, and profile save */}
          <div className="bg-[#131920] p-2 rounded border border-[#232D38]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#8B949E] text-[10px] uppercase font-semibold">
                Last Error (Google Sign-In / Sign Out / Profile Save):
              </span>
              {debugLastError && (
                <button
                  type="button"
                  onClick={clearDebugLastError}
                  className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Clear Error
                </button>
              )}
            </div>

            {debugLastError ? (
              <div className="bg-red-950/70 border border-red-500/60 rounded p-2 text-red-200 space-y-1 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] font-bold text-red-300">
                  <span>Action: {debugLastError.action}</span>
                  <span className="text-[10px] text-red-400 font-normal">
                    {debugLastError.timestamp}
                  </span>
                </div>
                <div className="text-[11px]">
                  <span className="text-red-400 font-bold">error.code: </span>
                  <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300 font-bold">
                    {debugLastError.code}
                  </code>
                </div>
                <div className="text-[11px] break-words">
                  <span className="text-red-400 font-bold">error.message: </span>
                  <span className="text-white">{debugLastError.message}</span>
                </div>
              </div>
            ) : (
              <div className="text-emerald-400/90 text-[10px] py-0.5 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>None (No error reported for Google sign-in, sign out, or profile save)</span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
export default DebugPanel;
