import React, { useState, useEffect } from 'react';
import {
  CACHE_DECODED_URLS,
  ASSET_LOAD_TIMINGS,
  getRouteConfig,
  assetsFor,
  getAllGatedRoutesAudit,
} from '../lib/preload';
import { useLocation } from 'react-router-dom';
import { useSession } from '../services/sessionContext';

export const DebugPreloadOverlay: React.FC = () => {
  const location = useLocation();
  const { profile } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'assets' | 'routes'>('assets');
  const [, setNow] = useState(Date.now());

  const searchParams = new URLSearchParams(location.search);
  const isDebug = searchParams.get('debug') === '1';
  const isThrottled = searchParams.get('throttle') === 'slow';

  useEffect(() => {
    if (!isDebug) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [isDebug]);

  if (!isDebug) return null;

  const currentPath = location.pathname;
  const config = getRouteConfig(currentPath);
  const requiredUrls = assetsFor(currentPath, { userProfile: profile });

  const loadedCount = requiredUrls.filter((u) => CACHE_DECODED_URLS.has(u)).length;
  const pendingCount = requiredUrls.length - loadedCount;
  const auditList = getAllGatedRoutesAudit();

  const toggleThrottle = () => {
    const params = new URLSearchParams(window.location.search);
    if (isThrottled) {
      params.delete('throttle');
    } else {
      params.set('throttle', 'slow');
    }
    window.location.search = params.toString();
  };

  const clearCacheAndReload = () => {
    CACHE_DECODED_URLS.clear();
    ASSET_LOAD_TIMINGS.clear();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999999] font-['Nunito',sans-serif] text-xs select-none">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-[#17181B] text-white px-3 py-1.5 rounded-full shadow-2xl border border-white/20 font-black flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#A8BF6E] animate-pulse" />
          <span>?debug=1 ({pendingCount > 0 ? `${pendingCount} pending` : 'All Loaded'})</span>
        </button>
      ) : (
        <div className="bg-[#17181B]/95 text-white p-4 rounded-2xl shadow-2xl border border-white/20 w-[360px] max-h-[85vh] flex flex-col gap-3 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <div className="font-black text-sm text-[#FEDF6B]">Preloader Gating (?debug=1)</div>
              <div className="text-[11px] text-white/60">Active: {config.id} ({config.path})</div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white font-black text-base px-1 cursor-pointer"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white/5 p-2 rounded-lg">
              <div className="text-white/50">Theme / Bg</div>
              <div className="font-bold text-[#9DBDFD] flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: config.bg }} />
                {config.theme} ({config.bg})
              </div>
            </div>
            <div className="bg-white/5 p-2 rounded-lg">
              <div className="text-white/50">Assets Ready</div>
              <div className="font-bold text-white mt-0.5">
                {loadedCount} / {requiredUrls.length} decoded
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={toggleThrottle}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] text-center transition-colors cursor-pointer ${
                isThrottled
                  ? 'bg-[#F9A6D2] text-[#17181B]'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {isThrottled ? '⚡ Throttling: SLOW (active)' : '🐢 Throttle Slow (?throttle=slow)'}
            </button>
            <button
              type="button"
              onClick={clearCacheAndReload}
              className="py-1.5 px-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-[11px] cursor-pointer"
              title="Clear decoded assets set and reload"
            >
              Clear Cache
            </button>
          </div>

          {/* Navigation tabs between current assets and route audit table */}
          <div className="flex border-b border-white/10 pb-1 gap-2 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('assets')}
              className={`pb-1 cursor-pointer ${
                activeTab === 'assets' ? 'text-[#FEDF6B] border-b-2 border-[#FEDF6B]' : 'text-white/60'
              }`}
            >
              Route Assets ({requiredUrls.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('routes')}
              className={`pb-1 cursor-pointer ${
                activeTab === 'routes' ? 'text-[#FEDF6B] border-b-2 border-[#FEDF6B]' : 'text-white/60'
              }`}
            >
              All Gated Routes ({auditList.length})
            </button>
          </div>

          {activeTab === 'assets' ? (
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[240px] pr-1">
              {requiredUrls.map((url) => {
                const isLoaded = CACHE_DECODED_URLS.has(url);
                const duration = ASSET_LOAD_TIMINGS.get(url);
                const fileName = url.split('/').pop() || url;
                return (
                  <div
                    key={url}
                    className="flex items-center justify-between text-[10.5px] bg-white/5 px-2 py-1 rounded"
                  >
                    <span className="truncate max-w-[210px]" title={url}>
                      {fileName}
                    </span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        isLoaded
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300 animate-pulse'
                      }`}
                    >
                      {isLoaded ? (duration !== undefined ? `${duration}ms` : 'cached') : 'loading…'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-1 overflow-y-auto max-h-[240px] pr-1">
              {auditList.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center justify-between text-[10.5px] bg-white/5 px-2 py-1 rounded"
                >
                  <span className="font-mono text-white/90 truncate max-w-[220px]">
                    {item.path}
                  </span>
                  <span className="font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded text-[9.5px]">
                    gated: YES
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
