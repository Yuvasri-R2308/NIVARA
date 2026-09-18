import React from 'react';
import { useApp } from '../context/AppContext';
import { HazardType } from '../types';
import { 
  Mountain, 
  Droplets, 
  CloudLightning, 
  Waves, 
  ShieldAlert, 
  ArrowRight, 
  Activity, 
  MapPin, 
  Database, 
  FileText, 
  Users, 
  Scale, 
  CheckCircle2, 
  AlertTriangle,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { IndiaDisasterMap } from '../components/common/IndiaDisasterMap';

interface HazardCardConfig {
  id: HazardType;
  name: string;
  location: string;
  state: string;
  badge: string;
  badgeColor: string;
  lightBadgeColor: string;
  borderColor: string;
  lightBorderColor: string;
  topAccentColor: string;
  iconBg: string;
  lightIconBg: string;
  image: string;
  icon: React.ReactNode;
  description: string;
}

export const NivaraHome: React.FC = () => {
  const { selectHazard, theme, toggleTheme, logout } = useApp();

  const hazardCards: HazardCardConfig[] = [
    {
      id: 'landslide',
      name: 'Landslide',
      location: 'Meppadi, Wayanad',
      state: 'Kerala',
      badge: 'Critical Red Zone',
      badgeColor: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
      lightBadgeColor: 'bg-white/95 text-rose-700 border-rose-200/80 font-semibold shadow-xs',
      borderColor: 'border-rose-900/30 hover:border-rose-500/50',
      lightBorderColor: 'border-[#D9E1E5] hover:border-rose-300/60',
      topAccentColor: 'bg-rose-600',
      iconBg: 'bg-rose-950/80 border-rose-500/50 text-rose-400',
      lightIconBg: 'bg-white/95 border-white/80 text-rose-600 shadow-xs',
      image: '/assets/landslide_bg.jpg?v=3',
      icon: <Mountain className="w-5 h-5" />,
      description: 'Slope saturation and debris flow early warning.'
    },
    {
      id: 'flood',
      name: 'Flood',
      location: 'Dibrugarh & Basin',
      state: 'Assam',
      badge: 'High Breach Risk',
      badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-500/50',
      lightBadgeColor: 'bg-white/95 text-blue-700 border-blue-200/80 font-semibold shadow-xs',
      borderColor: 'border-blue-900/30 hover:border-blue-500/50',
      lightBorderColor: 'border-[#D9E1E5] hover:border-blue-300/60',
      topAccentColor: 'bg-blue-600',
      iconBg: 'bg-blue-950/80 border-blue-500/50 text-blue-400',
      lightIconBg: 'bg-white/95 border-white/80 text-blue-600 shadow-xs',
      image: '/assets/flood_bg.jpg?v=3',
      icon: <Droplets className="w-5 h-5" />,
      description: 'River inundation & embankment breach intelligence.'
    },
    {
      id: 'cloudburst',
      name: 'Cloudburst',
      location: 'Kedarnath Valley',
      state: 'Uttarakhand',
      badge: 'Flash Flood Threat',
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
      lightBadgeColor: 'bg-white/95 text-amber-800 border-amber-200/80 font-semibold shadow-xs',
      borderColor: 'border-amber-900/30 hover:border-amber-500/50',
      lightBorderColor: 'border-[#D9E1E5] hover:border-amber-300/60',
      topAccentColor: 'bg-amber-500',
      iconBg: 'bg-amber-950/80 border-amber-500/50 text-amber-400',
      lightIconBg: 'bg-white/95 border-white/80 text-amber-600 shadow-xs',
      image: '/assets/cloudburst_bg.jpg?v=3',
      icon: <CloudLightning className="w-5 h-5" />,
      description: 'Orographic moisture surge and runoff trajectory.'
    },
    {
      id: 'coastal-erosion',
      name: 'Coastal Erosion',
      location: 'Podampeta Coast',
      state: 'Odisha',
      badge: 'Shoreline Retreat',
      badgeColor: 'bg-teal-950/80 text-teal-300 border-teal-500/50',
      lightBadgeColor: 'bg-white/95 text-teal-800 border-teal-200/80 font-semibold shadow-xs',
      borderColor: 'border-teal-900/30 hover:border-teal-500/50',
      lightBorderColor: 'border-[#D9E1E5] hover:border-teal-300/60',
      topAccentColor: 'bg-teal-600',
      iconBg: 'bg-teal-950/80 border-teal-500/50 text-teal-400',
      lightIconBg: 'bg-white/95 border-white/80 text-teal-600 shadow-xs',
      image: '/assets/coastal_bg.jpg?v=3',
      icon: <Waves className="w-5 h-5" />,
      description: 'Multi-decadal shoreline scarp retreat & resettlement.'
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-200 ${
      theme === 'light' ? 'bg-[#F4F6F9] text-slate-900' : 'bg-[#091118] text-slate-100'
    }`}>
      {/* Subtle GIS Coordinate Markings & Grid Background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10">
        <div className={`absolute inset-0 ${
          theme === 'light' 
            ? 'bg-[linear-gradient(to_right,rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.025)_1px,transparent_1px)]'
            : 'bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]'
        } bg-[size:48px_48px]`} />
        
        {/* Faint Technical Lat/Long Coordinate Stamps */}
        <div className="absolute top-24 left-8 font-mono text-[10px] text-slate-500/30 tracking-widest hidden xl:block">
          28.994° N / 77.209° E
        </div>
        <div className="absolute bottom-28 right-10 font-mono text-[10px] text-slate-500/30 tracking-widest hidden xl:block">
          85.139° E / 19.421° N
        </div>
      </div>

      {/* Top Bar with System Identity */}
      <header className={`border-b px-6 lg:px-12 py-3 sticky top-0 z-30 transition-colors ${
        theme === 'light' 
          ? 'bg-white border-[#D9E1E5] shadow-[0_1px_3px_rgba(15,23,42,0.04)]' 
          : 'bg-[#0C141C]/95 border-[#182433] backdrop-blur'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img 
              src="/assets/nivara_logo.png" 
              alt="NIVARA Logo" 
              className="w-11 h-11 rounded-full object-contain shadow-md shrink-0 border border-emerald-500/30"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className={`font-sans text-xl lg:text-2xl font-bold tracking-tight ${
                  theme === 'light' ? 'text-[#0F172A]' : 'text-white'
                }`}>
                  NIVARA
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                  theme === 'light'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                    : 'bg-[#0F1E28] text-[#4ED8B4] border-[#1A3849]'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ED8B4]" />
                  NATIONAL SDMA DECISION SYSTEM
                </span>
              </div>
              <p className={`text-xs font-sans mt-0.5 ${
                theme === 'light' ? 'text-[#526173]' : 'text-slate-400'
              }`}>
                Multi-Hazard Risk Assessment, Priority Evacuation & Smart Relocation Platform
              </p>
            </div>
          </div>

          {/* Right Controls: Theme Toggle, Authenticated Operator & Logout */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Direct Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer border ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-50 border-[#D9E1E5] text-slate-700 shadow-xs'
                  : 'bg-[#101B26] hover:bg-[#162534] border-[#1C2C3D] text-slate-200'
              }`}
              title={theme === 'light' ? "Switch to Dark Theme" : "Switch to Light Theme"}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span>Dark Theme</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Theme</span>
                </>
              )}
            </button>

            {/* Exclusive Home Page Logout Button */}
            <button
              onClick={logout}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer border ${
                theme === 'light'
                  ? 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-700'
                  : 'bg-rose-950/20 hover:bg-rose-950/40 border-rose-900/40 text-rose-300'
              }`}
              title="End session and return to Login Screen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 py-7 lg:py-9 space-y-8">
        
        {/* Hero Section with Tactical GIS India Map Overview */}
        <div className={`relative overflow-hidden rounded-2xl p-7 lg:p-8 border transition-all ${
          theme === 'light'
            ? 'bg-white border-[#D9E1E5] shadow-[0_2px_8px_rgba(15,23,42,0.04)]'
            : 'bg-[#0D1620] border-[#1C2C3D]'
        }`}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border ${
                theme === 'light'
                  ? 'bg-teal-50 border-teal-200/80 text-[#00796B]'
                  : 'bg-[#0F242B] border-[#16444F] text-[#4ED8B4]'
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
                </span>
                <span>4 ACTIVE OPERATIONAL CRISIS THEATERS</span>
              </div>

              <h2 className={`text-3xl lg:text-4xl font-sans font-bold tracking-tight ${
                theme === 'light' ? 'text-[#0F172A]' : 'text-white'
              }`}>
                Select a <span className={theme === 'light' ? 'text-[#00897B]' : 'text-[#4ED8B4]'}>Disaster Area</span>
              </h2>

              <p className={`text-sm lg:text-[15px] font-sans leading-relaxed ${
                theme === 'light' ? 'text-[#526173]' : 'text-slate-300'
              }`}>
                Choose a disaster area to open its dedicated dashboard for risk monitoring, evacuation, and safe relocation. Interactive operational pins highlight each crisis theater across India.
              </p>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Click any node on the national map or select a card below</span>
              </div>
            </div>

            {/* Clarity-Enhanced National India Disaster Operations Map (Exact Compact Size as Before) */}
            <div className="hidden lg:flex items-center justify-center relative w-72 h-48 shrink-0">
              <IndiaDisasterMap
                theme={theme}
                onSelectHazard={selectHazard}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* 4 Clean, Focused Hazard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {hazardCards.map((card) => (
            <div 
              key={card.id}
              className={`group relative flex flex-col justify-between rounded-2xl transition-all duration-200 overflow-hidden cursor-pointer h-full border ${
                theme === 'light'
                  ? `bg-white ${card.lightBorderColor} shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)] hover:-translate-y-1`
                  : `bg-[#0D1620] ${card.borderColor} hover:shadow-lg hover:-translate-y-1`
              }`}
              onClick={() => selectHazard(card.id)}
            >
              {/* Top Hazard Accent Line (3px) */}
              <div className={`h-[3px] w-full shrink-0 ${card.topAccentColor}`} />

              {/* Real Aerial / Satellite Photo Area (160px) */}
              <div className={`relative w-full h-40 overflow-hidden bg-slate-900 shrink-0 border-b ${
                theme === 'light' ? 'border-[#D9E1E5]' : 'border-slate-800'
              }`}>
                <img 
                  src={card.image} 
                  alt={card.name} 
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    theme === 'light'
                      ? 'opacity-85 group-hover:opacity-95 group-hover:scale-105'
                      : 'opacity-60 group-hover:opacity-75 group-hover:scale-105'
                  }`}
                />
                {/* Subtle dark gradient overlay ONLY at top of image for crisp icon & badge readability */}
                <div className={`absolute inset-0 pointer-events-none ${
                  theme === 'light'
                    ? 'bg-gradient-to-b from-black/55 via-black/15 to-transparent'
                    : 'bg-gradient-to-t from-[#0D1620] via-[#0D1620]/60 to-transparent'
                }`} />

                {/* Floating Icon Chip & Status Badge */}
                <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border ${
                    theme === 'light' ? card.lightIconBg : card.iconBg
                  }`}>
                    {card.icon}
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold tracking-wider uppercase border backdrop-blur-md ${
                    theme === 'light' ? card.lightBadgeColor : card.badgeColor
                  }`}>
                    {card.badge}
                  </span>
                </div>
              </div>

              {/* Card Body Content Area */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className={`text-[26px] font-sans font-bold tracking-tight transition-colors leading-tight ${
                    theme === 'light' ? 'text-[#0F172A] group-hover:text-[#00897B]' : 'text-white group-hover:text-[#4ED8B4]'
                  }`}>
                    {card.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs font-sans mt-2">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${theme === 'light' ? 'text-[#00897B]' : 'text-teal-400'}`} />
                    <span className={`font-semibold ${theme === 'light' ? 'text-[#1E293B]' : 'text-slate-200'}`}>
                      {card.location}
                    </span>
                    <span className={theme === 'light' ? 'text-slate-300' : 'text-slate-500'}>•</span>
                    <span className={theme === 'light' ? 'text-[#64748B]' : 'text-slate-400'}>
                      {card.state}
                    </span>
                  </div>

                  <p className={`text-[14px] font-sans leading-[1.55] mt-3 min-h-[44px] ${
                    theme === 'light' ? 'text-[#526173]' : 'text-slate-400'
                  }`}>
                    {card.description}
                  </p>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-5 mt-auto">
                  <button 
                    onClick={() => selectHazard(card.id)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold font-sans flex items-center justify-center gap-2 bg-[#00897B] hover:bg-[#00796B] text-white shadow-xs transition-all duration-150 cursor-pointer active:scale-[0.99]"
                  >
                    <span>Enter Command Center</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};
