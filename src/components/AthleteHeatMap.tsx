import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { motion, AnimatePresence } from "motion/react";
import { hometownAthletes, Athlete } from "../data/hometownAthletes";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface StateData {
  state: string;
  total: number;
  athletes: Athlete[];
}

export default React.memo(function AthleteHeatMap() {
  const [activeState, setActiveState] = useState<StateData | null>(null);

  const fetchStateData = (stateName: string) => {
    const athletes = hometownAthletes[stateName] || [];
    setActiveState({
      state: stateName,
      total: athletes.length,
      athletes
    });
  };

  const hasData = activeState && activeState.total > 0;

  return (
    <div className="w-full relative h-[70vh] sm:h-full py-4 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
      <motion.div 
        layout
        className={`w-full px-2 transition-all duration-700 ease-in-out z-10 flex items-center justify-center ${activeState ? 'lg:w-[60%]' : 'lg:w-[80%] max-w-5xl'}`}
      >
        <ComposableMap projection="geoAlbersUsa" className="w-full h-auto drop-shadow-2xl">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.name as string;
                const isSelected = activeState?.state === stateName;
                const hasAthletes = (hometownAthletes[stateName] || []).length > 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => fetchStateData(stateName)}
                    style={{
                      default: {
                        fill: isSelected ? "#ef4444" : hasAthletes ? "url(#rwb-gradient)" : "rgba(255,255,255,0.2)",
                        outline: "none",
                        stroke: "rgba(255,255,255,0.7)",
                        strokeWidth: 0.5,
                        transition: "all 250ms"
                      },
                      hover: {
                        fill: "#ef4444",
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: "#dc2626",
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
          <defs>
            <linearGradient id="rwb-gradient" x1="0" y1="0" x2="800" y2="600" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#db2424" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#2a52be" />
            </linearGradient>
          </defs>
        </ComposableMap>
      </motion.div>

      <AnimatePresence>
        {activeState && (
          <motion.div 
            layout
            initial={{ opacity: 0, x: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 50 : 0, y: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : 150, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 50 : 0, y: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 0 : 150, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-6 bg-black/60 backdrop-blur-sm lg:relative lg:inset-auto lg:bg-transparent lg:backdrop-blur-none pointer-events-auto lg:w-[35%] lg:mt-0"
          >
            <div className="bg-gradient-to-b from-blue-900/60 to-red-900/60 backdrop-blur-3xl border border-white/20 p-6 rounded-3xl text-white shadow-[0_0_40px_rgba(255,255,255,0.1)] flex flex-col gap-4 w-full max-h-[70vh] sm:max-h-[85vh] overflow-hidden lg:h-[600px] relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
              
              <button 
                 onClick={() => setActiveState(null)}
                 className="absolute top-6 right-6 text-white/50 hover:text-white z-10 transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
              >
                ✕
              </button>
              
              <div className="border-b border-white/20 pb-4 shrink-0">
                <h3 className="text-3xl font-extrabold tracking-wide uppercase">{activeState.state}</h3>
                {activeState.total === 0 ? (
                   <p className="text-base text-white/70 mt-2 leading-relaxed">
                     No athletes currently listed for {activeState.state}.
                   </p>
                ) : (
                  <p className="text-sm text-blue-200 mt-2 font-medium tracking-widest uppercase">{activeState.total} Featured Athletes</p>
                )}
              </div>
              
              {hasData && (
                <div className="flex flex-col flex-1 gap-3 overflow-y-auto no-scrollbar pb-8 -mx-2 px-2">
                   {activeState.athletes.map((athlete, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className="flex flex-col p-4 bg-white/10 rounded-xl gap-2 border border-white/20 shadow-sm hover:bg-white/20 hover:scale-[1.02] transition-all cursor-default"
                      >
                        <span className="font-bold text-white text-lg tracking-wide">{athlete.name}</span>
                        <div className="flex justify-between items-center text-white/80 font-semibold text-xs tracking-wider uppercase">
                           <span className="text-white/60">{athlete.sport}</span>
                           <span className={athlete.type === 'Olympics' ? "text-red-200 drop-shadow-md font-bold" : "text-blue-200 drop-shadow-md font-bold"}>
                             {athlete.type}
                           </span>
                        </div>
                      </motion.div>
                   ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
