import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Loader2,
  Mountain,
  Droplets,
  CloudLightning,
  Waves,
  Sun,
  Moon
} from 'lucide-react';

interface HazardHighlight {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  image: string;
}

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo, theme, toggleTheme } = useApp();
  
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingType, setLoadingType] = useState<'standard' | 'demo' | null>(null);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoadingType('standard');
    setTimeout(() => {
      login(username.trim() || 'sdma_admin', password || 'demo1234', 'SDMA Admin');
      setIsSubmitting(false);
      setLoadingType(null);
    }, 400);
  };

  const handleDemoLogin = () => {
    setIsSubmitting(true);
    setLoadingType('demo');
    setTimeout(() => {
      loginAsDemo('SDMA Admin');
      setIsSubmitting(false);
      setLoadingType(null);
    }, 400);
  };

  const hazardHighlights: HazardHighlight[] = [
    {
      id: 'landslide',
      name: 'Landslide',
      subtitle: 'SLOPE RISK MONITORING',
      icon: <Mountain className="w-5 h-5 text-rose-400" />,
      accentColor: 'bg-rose-500',
      borderColor: '#EF4444',
      image: '/assets/landslide_bg.jpg?v=3'
    },
    {
      id: 'flood',
      name: 'Flood',
      subtitle: 'RIVER & BASIN INTELLIGENCE',
      icon: <Droplets className="w-5 h-5 text-sky-400" />,
      accentColor: 'bg-sky-500',
      borderColor: '#0284C7',
      image: '/assets/flood_bg.jpg?v=3'
    },
    {
      id: 'cloudburst',
      name: 'Cloudburst',
      subtitle: 'PRECIPITATION RISK ANALYSIS',
      icon: <CloudLightning className="w-5 h-5 text-amber-400" />,
      accentColor: 'bg-amber-500',
      borderColor: '#F59E0B',
      image: '/assets/cloudburst_bg.jpg?v=3'
    },
    {
      id: 'coastal-erosion',
      name: 'Coastal Erosion',
      subtitle: 'SHORELINE CHANGE ASSESSMENT',
      icon: <Waves className="w-5 h-5 text-teal-400" />,
      accentColor: 'bg-teal-500',
      borderColor: '#0D9488',
      image: '/assets/coastal_bg.jpg?v=3'
    }
  ];

  return (
    <div className={`min-h-screen w-full relative flex flex-col justify-between font-sans transition-colors duration-200 ${
      theme === 'light' 
        ? 'bg-[#FAF4E8] text-[#0F172A] selection:bg-[#00897B] selection:text-white' 
        : 'bg-[#091118] text-slate-100 selection:bg-[#00897B] selection:text-black'
    } overflow-x-hidden`}>
      
      {/* 1. Sandalwood Color Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Rich Sandalwood Color Gradient Canvas */}
        <div className={`absolute inset-0 transition-colors duration-500 ${
          theme === 'light'
            ? 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#EFE0CB]'
            : 'bg-gradient-to-br from-[#080E14] via-[#0E1722] to-[#080E14]'
        }`} />

        {/* Subtle geographic terrain watermark overlay at gentle opacity */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105 ${
            theme === 'light' ? 'opacity-[0.08] mix-blend-multiply filter contrast-125' : 'opacity-[0.14] filter contrast-110'
          }`}
          style={{ backgroundImage: `url('/assets/login_bg.jpg?v=5')` }}
        />
        
        {/* Warm Sandalwood Radial Glow & Coordinates Grid */}
        <div className={`absolute inset-0 ${
          theme === 'light'
            ? 'bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.7)_0%,transparent_70%),linear-gradient(to_right,rgba(168,132,94,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,132,94,0.035)_1px,transparent_1px)]'
            : 'bg-[radial-gradient(ellipse_at_top_left,rgba(78,216,180,0.05)_0%,transparent_70%),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]'
        } bg-[size:auto,64px_64px,64px_64px]`} />

      </div>

      {/* 2. Top Navigation Bar with Theme Toggle */}
      <header className={`relative z-20 w-full border-b transition-colors ${
        theme === 'light'
          ? 'border-[#EADCCB]/80 bg-[#FFFDF9]/85 backdrop-blur-md'
          : 'border-slate-800/80 bg-[#0C141C]/85 backdrop-blur-md'
      } px-6 sm:px-10 lg:px-16 py-3.5`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          
          {/* Upper-left: NIVARA Logo & Platform Identification */}
          <div className="flex items-center gap-3.5">
            <img 
              src="/assets/nivara_logo.png" 
              alt="NIVARA Logo" 
              className="w-11 h-11 rounded-full object-contain shadow-md shrink-0 border border-emerald-500/30"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <span className={`text-xl font-bold tracking-tight font-sans ${
                  theme === 'light' ? 'text-[#0F172A]' : 'text-white'
                }`}>
                  NIVARA
                </span>
                <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${
                  theme === 'light'
                    ? 'bg-teal-50 text-[#00796B] border-teal-200/80'
                    : 'bg-[#0F1E28] text-[#4ED8B4] border-[#1A3849]'
                }`}>
                  NATIONAL SDMA DECISION SYSTEM
                </span>
              </div>
              <p className={`text-[11px] font-sans hidden sm:block ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Disaster Intelligence System
              </p>
            </div>
          </div>

          {/* Right Controls: Theme Toggle & Status Badge */}
          <div className="flex items-center gap-3">
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
          </div>

        </div>
      </header>

      {/* 3. Main Two-Panel Content Container */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-8 sm:py-12 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-center">
          
          {/* ============================================================ */}
          {/* LEFT PANEL (~58% Desktop): Disaster Intelligence Identity    */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6 sm:space-y-8">
            
            {/* Tagline & Headline in Clean Box Aligned 100% with the 4 Hazard Cards Below */}
            <div className={`w-full space-y-3.5 backdrop-blur-md rounded-2xl p-6 sm:p-7 border transition-all ${
              theme === 'light'
                ? 'bg-white/95 border-[#EADCCB] shadow-[0_10px_30px_rgba(139,115,85,0.06)]'
                : 'bg-[#0D1620]/90 border-[#1C2C3D] shadow-[0_20px_40px_rgba(0,0,0,0.5)]'
            }`}>
              
              <div className={`flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-mono font-bold tracking-widest uppercase ${
                theme === 'light' ? 'text-slate-600' : 'text-teal-400'
              }`}>
                <span className="whitespace-nowrap">REAL-TIME INTELLIGENCE</span>
                <span className="text-slate-300 dark:text-slate-600 font-normal">|</span>
                <span className="whitespace-nowrap">EARLY ACTION</span>
                <span className="text-slate-300 dark:text-slate-600 font-normal">|</span>
                <span className="whitespace-nowrap">RESILIENT COMMUNITIES</span>
              </div>

              {/* Main Authority Headline */}
              <h1 className={`text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-extrabold tracking-tight leading-[1.14] ${
                theme === 'light' ? 'text-slate-950' : 'text-white'
              }`}>
                Early Warnings.<br />
                Smarter Decisions.<br />
                Safer Communities.
              </h1>

              {/* Subtle 3px NIVARA Teal Accent Line */}
              <div className="w-16 h-1 bg-[#00897B] rounded-full mt-2" />

              {/* Exact Description Paragraph */}
              <p className={`text-sm sm:text-base leading-relaxed font-sans pt-1 font-medium ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                NIVARA uses real-time data, AI models, and geospatial intelligence to predict disaster risks, prioritize evacuations, and save lives.
              </p>

            </div>

            {/* 4 Square-shaped Photographic Hazard Cards */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 select-none pt-1">
              {hazardHighlights.map((hazard) => (
                <div 
                  key={hazard.id}
                  className="group relative flex flex-col justify-end aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden shadow-xl border border-white/60 dark:border-white/10 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 bg-slate-900"
                >
                  {/* Top 3.5px hazard accent color line */}
                  <div className={`h-[3.5px] w-full absolute top-0 inset-x-0 z-20 ${hazard.accentColor}`} />

                  {/* Full photographic field background */}
                  <img 
                    src={hazard.image} 
                    alt={hazard.name} 
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Bottom Atmospheric Dark Gradient for Crisp Text Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent pointer-events-none z-10" />

                  {/* Content inside Square Card */}
                  <div className="relative z-20 p-3 sm:p-4 flex flex-col items-center text-center">
                    {/* Circle icon badge matching reference */}
                    <div 
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 bg-black/60 backdrop-blur-md flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 mb-2"
                      style={{ borderColor: hazard.borderColor }}
                    >
                      {hazard.icon}
                    </div>

                    {/* Bold Title - Explicit Pure White for Uncompromised Visibility */}
                    <div 
                      style={{ color: '#FFFFFF' }}
                      className="!text-white font-extrabold text-xs sm:text-sm lg:text-base tracking-tight leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap"
                    >
                      {hazard.name}
                    </div>

                    {/* Subtitle - Crisp Light Slate for Perfect Readability */}
                    <div 
                      style={{ color: '#E2E8F0' }}
                      className="!text-slate-200 text-[7px] sm:text-[8px] lg:text-[9px] font-mono font-medium uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap mt-0.5"
                    >
                      {hazard.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ============================================================ */}
          {/* RIGHT PANEL (~42% Desktop): Clean Enterprise Login Card      */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 w-full max-w-[480px] lg:max-w-[490px] xl:max-w-[510px] mx-auto lg:ml-auto">
            <div className={`p-8 sm:p-10 rounded-3xl border space-y-6 transition-all ${
              theme === 'light'
                ? 'bg-white/95 backdrop-blur-md border-[#EADCCB] shadow-[0_20px_50px_rgba(139,115,85,0.08)]'
                : 'bg-[#0D1620] border-[#1C2C3D] shadow-[0_25px_60px_rgba(0,0,0,0.6)]'
            }`}>
              
              {/* Official Government of India & Ministry Header Lockup */}
              <div className="flex flex-col items-center justify-center text-center space-y-3 pb-1">
                <div className="flex items-center justify-center gap-3">
                  <img 
                    src="/assets/emblem_india_transparent.png" 
                    alt="State Emblem of India" 
                    className={`h-14 w-auto object-contain transition-all ${
                      theme === 'light' ? 'filter brightness-90 contrast-125' : 'filter invert brightness-150 contrast-125'
                    }`} 
                  />
                  <div className="text-left border-l-2 pl-3 border-slate-300 dark:border-slate-700">
                    <div className={`text-xs font-serif font-bold tracking-wide leading-tight ${
                      theme === 'light' ? 'text-[#1E293B]' : 'text-slate-200'
                    }`}>
                      गृह मंत्रालय
                    </div>
                    <div className={`text-[10px] font-mono tracking-wider font-semibold uppercase leading-tight mt-0.5 ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      MINISTRY OF
                    </div>
                    <div className={`text-xs font-extrabold tracking-wide uppercase leading-tight ${
                      theme === 'light' ? 'text-[#0F172A]' : 'text-white'
                    }`}>
                      HOME AFFAIRS
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-center">
                  <h2 className={`text-2xl sm:text-[28px] font-black tracking-tight font-sans ${
                    theme === 'light' ? 'text-[#0F172A]' : 'text-white'
                  }`}>
                    Welcome
                  </h2>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleStandardLogin} className="space-y-4 pt-1">
                
                {/* Username Field */}
                <div className="space-y-1.5">
                  <label className={`text-xs sm:text-sm font-semibold ${
                    theme === 'light' ? 'text-[#1E293B]' : 'text-slate-200'
                  }`}>
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all shadow-2xs outline-none ${
                        theme === 'light'
                          ? 'bg-slate-50/70 border-[#D6DEE7] text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-[#0F172A] focus:ring-2 focus:ring-slate-900/10'
                          : 'bg-[#070D14] border-[#1C2C3D] text-white placeholder-slate-500 focus:border-[#4ED8B4] focus:ring-2 focus:ring-[#4ED8B4]/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className={`text-xs sm:text-sm font-semibold ${
                    theme === 'light' ? 'text-[#1E293B]' : 'text-slate-200'
                  }`}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all shadow-2xs outline-none ${
                        theme === 'light'
                          ? 'bg-slate-50/70 border-[#D6DEE7] text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-[#0F172A] focus:ring-2 focus:ring-slate-900/10'
                          : 'bg-[#070D14] border-[#1C2C3D] text-white placeholder-slate-500 focus:border-[#4ED8B4] focus:ring-2 focus:ring-[#4ED8B4]/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className={`text-xs font-semibold transition-colors cursor-pointer ${
                      theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Primary Action Button: Login */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-75 mt-3 active:scale-[0.99] shadow-md ${
                    theme === 'light'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-800/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                  }`}
                >
                  {loadingType === 'standard' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span className="text-white font-bold">Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-white font-bold">Login</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </>
                  )}
                </button>

              </form>

              {/* Clean Enterprise Divider: OR */}
              <div className="relative flex items-center justify-center py-0.5">
                <div className={`border-t w-full ${theme === 'light' ? 'border-[#E2E8F0]' : 'border-[#1C2C3D]'}`} />
                <span className={`px-3 text-xs font-semibold uppercase tracking-wider ${
                  theme === 'light' ? 'bg-white text-slate-400' : 'bg-[#0D1620] text-slate-500'
                }`}>
                  OR
                </span>
                <div className={`border-t w-full ${theme === 'light' ? 'border-[#E2E8F0]' : 'border-[#1C2C3D]'}`} />
              </div>

              {/* Secondary Action Button: Login as Demo User */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer group shadow-2xs ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-50 active:scale-[0.99] border-[#D6DEE7] text-[#1E293B] hover:border-[#00897B]/60'
                    : 'bg-[#101B26] hover:bg-[#162534] active:scale-[0.99] border-[#1C2C3D] text-slate-200 hover:border-[#4ED8B4]/60'
                }`}
              >
                {loadingType === 'demo' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#00897B]" />
                    <span className={theme === 'light' ? 'text-[#00897B]' : 'text-[#4ED8B4]'}>Entering Command Center...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className={`w-4.5 h-4.5 group-hover:scale-105 transition-transform ${
                      theme === 'light' ? 'text-[#00897B]' : 'text-[#4ED8B4]'
                    }`} />
                    <span>Login as Demo User</span>
                  </>
                )}
              </button>

              {/* Disaster Resilient India Graphic Watermark at Bottom of Card */}
              <div className="pt-2 flex flex-col items-center justify-center text-center select-none">
                <svg viewBox="0 0 320 45" className="w-full h-8 text-slate-300 dark:text-slate-600 opacity-65">
                  <path d="M10 40 L30 40 L30 30 L45 30 L45 40 L70 40 L70 24 L85 24 L85 40 L110 40 L110 18 L125 12 L140 18 L140 40 L160 40 L160 10 L163 10 L163 6 L175 6 L175 12 L165 12 L165 40 L180 40 L180 18 L195 12 L210 18 L210 40 L235 40 L235 24 L250 24 L250 40 L275 40 L275 30 L290 30 L290 40 L310 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  {/* Small flag atop the monument */}
                  <line x1="163" y1="6" x2="163" y2="1" stroke="currentColor" strokeWidth="1.2" />
                  <rect x="163" y="1" width="10" height="1.8" fill="#FF9933" />
                  <rect x="163" y="2.8" width="10" height="1.8" fill="#FFFFFF" />
                  <rect x="163" y="4.6" width="10" height="1.8" fill="#138808" />
                </svg>
                <div className={`text-[10px] font-mono tracking-widest uppercase mt-1 ${
                  theme === 'light' ? 'text-slate-400 font-semibold' : 'text-slate-500'
                }`}>
                  DISASTER RESILIENT INDIA
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* 4. Bottom Standard Institutional Footer Strip */}
      <footer className={`relative z-20 w-full border-t py-3 px-6 sm:px-10 lg:px-16 mt-auto transition-colors ${
        theme === 'light'
          ? 'border-[#EADCCB]/80 bg-[#FFFDF9]/85 backdrop-blur-md text-slate-600'
          : 'border-slate-800/80 bg-[#0C141C]/85 backdrop-blur-md text-slate-400'
      }`}>
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${theme === 'light' ? 'text-[#0F172A]' : 'text-white'}`}>NIVARA</span>
            <span>•</span>
            <span>FOR A SAFER, STRONGER, MORE RESILIENT INDIA</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-slate-400">
            <span>INDIA</span>
            <span>|</span>
            <span>MONITOR</span>
            <span>|</span>
            <span>ANALYZE</span>
            <span>|</span>
            <span>RESPOND</span>
            <span>|</span>
            <span>RECOVER</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 w-6 h-1.5 rounded overflow-hidden">
              <span className="w-1/2 h-full bg-amber-500" />
              <span className="w-1/2 h-full bg-emerald-600" />
            </div>
            <span>PEOPLE • PLACES • PREPARE • PROTECT</span>
          </div>
        </div>
      </footer>

      {/* 5. Clean Enterprise Forgot Password / Demo Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl space-y-4 ${
            theme === 'light'
              ? 'bg-white border-[#D9E1E5]'
              : 'bg-[#0D1620] border-[#1C2C3D]'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${
                theme === 'light' ? 'text-[#0F172A]' : 'text-white'
              }`}>
                <ShieldCheck className="w-4 h-4 text-[#00897B]" />
                Demo Credentials & Access
              </h3>
              <button 
                onClick={() => setShowForgotModal(false)}
                className={`text-xs cursor-pointer ${
                  theme === 'light' ? 'text-slate-400 hover:text-[#0F172A]' : 'text-slate-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            </div>
            <p className={`text-xs leading-relaxed ${
              theme === 'light' ? 'text-[#475569]' : 'text-slate-300'
            }`}>
              For operational drills and system evaluation, you can enter any credentials or click <strong>Login as Demo User</strong> for instant access.
            </p>
            <div className={`p-3 rounded-xl border font-mono text-[11px] space-y-1 ${
              theme === 'light'
                ? 'bg-slate-50 border-[#D9E1E5] text-slate-700'
                : 'bg-[#080F16] border-[#1C2C3D] text-slate-300'
            }`}>
              <div>Username: <strong className="text-[#00897B]">sdma_admin</strong></div>
              <div>Password: <strong className="text-[#00897B]">demo1234</strong></div>
            </div>
            <button
              onClick={() => {
                setShowForgotModal(false);
                handleDemoLogin();
              }}
              className="w-full py-2.5 rounded-xl bg-[#00897B] hover:bg-[#00796B] text-white font-semibold text-xs cursor-pointer shadow-xs"
            >
              Enter Dashboard as Demo User
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default LoginPage;
