import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Power,
  Volume2,
  Palette,
  Sparkles,
  Info,
  Globe,
  PartyPopper,
  Check,
} from 'lucide-react';
import { AssistantState, AtmosphereTheme, VoiceOption } from '../types';
import { ATMOSPHERE_THEMES } from './AtmosphereBackground';
import { SUPPORTED_LANGUAGES } from '../data/languages';

interface ControlsProps {
  state: AssistantState;
  isMuted: boolean;
  theme: AtmosphereTheme;
  voice: VoiceOption;
  language: string;
  onTogglePower: () => void;
  onToggleMute: () => void;
  onInterrupt: () => void;
  onChangeTheme: (theme: AtmosphereTheme) => void;
  onChangeVoice: (voice: VoiceOption) => void;
  onChangeLanguage: (langCode: string) => void;
  onOpenOccasions: () => void;
  onOpenInfo: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  state,
  isMuted,
  theme,
  voice,
  language,
  onTogglePower,
  onToggleMute,
  onInterrupt,
  onChangeTheme,
  onChangeVoice,
  onChangeLanguage,
  onOpenOccasions,
  onOpenInfo,
}) => {
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const isConnected = state === 'listening' || state === 'speaking';
  const currentTheme = ATMOSPHERE_THEMES[theme];
  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const closeAllPopovers = () => {
    setShowThemePicker(false);
    setShowVoicePicker(false);
    setShowLangPicker(false);
  };

  return (
    <div id="controls-bar" className="relative w-full max-w-xl mx-auto px-3 pb-6 z-20">
      {/* Atmosphere Theme Popover */}
      {showThemePicker && (
        <div
          id="theme-picker-popover"
          className="absolute bottom-20 left-2 sm:left-6 bg-zinc-950/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl z-30 flex flex-col gap-1.5 min-w-[210px] animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-pink-400" />
            Atmosphere Mood
          </div>
          {(Object.keys(ATMOSPHERE_THEMES) as AtmosphereTheme[]).map((tKey) => {
            const item = ATMOSPHERE_THEMES[tKey];
            const isSelected = theme === tKey;
            return (
              <button
                key={tKey}
                onClick={() => {
                  onChangeTheme(tKey);
                  setShowThemePicker(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.primary }}
                  />
                  {item.name}
                </div>
                {isSelected && <span className="text-pink-400 text-xs">Active</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Voice Picker Popover */}
      {showVoicePicker && (
        <div
          id="voice-picker-popover"
          className="absolute bottom-20 right-2 sm:right-24 bg-zinc-950/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl z-30 flex flex-col gap-1.5 min-w-[220px] animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            Voice Model (Gemini Live)
          </div>
          {(['Aoede', 'Kore', 'Zephyr'] as VoiceOption[]).map((vKey) => {
            const isSelected = voice === vKey;
            return (
              <button
                key={vKey}
                onClick={() => {
                  onChangeVoice(vKey);
                  setShowVoicePicker(false);
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <div className="text-left">
                    <div className="font-semibold">{vKey}</div>
                    <div className="text-[10px] text-zinc-400">
                      {vKey === 'Aoede'
                        ? 'Sassy & Confident'
                        : vKey === 'Kore'
                        ? 'Warm & Expressive'
                        : 'Calm & Chill'}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-pink-400" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Language Picker Popover */}
      {showLangPicker && (
        <div
          id="language-picker-popover"
          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-zinc-950/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl z-30 flex flex-col gap-1 min-w-[260px] max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5 sticky top-0 bg-zinc-950/95 pb-1 border-b border-white/10 mb-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Spoken Language
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onChangeLanguage(lang.code);
                  setShowLangPicker(false);
                }}
                className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all ${
                  isSelected
                    ? 'bg-pink-500/20 text-pink-200 border border-pink-500/40 font-semibold'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{lang.flag}</span>
                  <div className="text-left">
                    <span className="font-medium">{lang.label}</span>
                    <span className="text-[10px] text-zinc-400 ml-1.5">({lang.nativeLabel})</span>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-pink-400" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Bottom Navigation Dock */}
      <div className="flex items-center justify-between bg-zinc-950/70 backdrop-blur-2xl border border-white/10 rounded-full px-3 sm:px-4 py-2 shadow-2xl gap-1 sm:gap-2">
        {/* Atmosphere Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={() => {
            setShowThemePicker(!showThemePicker);
            setShowVoicePicker(false);
            setShowLangPicker(false);
          }}
          className={`p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all ${
            showThemePicker ? 'bg-white/10 text-white' : ''
          }`}
          title="Change Atmosphere Mood"
          aria-label="Change Atmosphere"
        >
          <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Language Selector Toggle */}
        <button
          id="lang-toggle-btn"
          onClick={() => {
            setShowLangPicker(!showLangPicker);
            setShowThemePicker(false);
            setShowVoicePicker(false);
          }}
          className={`px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
            showLangPicker
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'text-zinc-300 hover:text-white bg-white/5 border-white/10 hover:bg-white/10'
          }`}
          title="Change Spoken Language"
          aria-label="Change Language"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline text-xs">{activeLang.code === 'auto' ? 'Auto' : activeLang.label}</span>
          <span className="sm:hidden text-xs">{activeLang.flag}</span>
        </button>

        {/* Special Occasions & Celebration Vault Toggle */}
        <button
          id="occasions-toggle-btn"
          onClick={() => {
            closeAllPopovers();
            onOpenOccasions();
          }}
          className="px-2.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-pink-300 hover:text-pink-100 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 transition-all active:scale-95 shadow-sm"
          title="Special Occasions & Celebrations Memory"
          aria-label="Special Occasions"
        >
          <PartyPopper className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline text-xs">Celebrations</span>
        </button>

        {/* Central Power / Connection Action */}
        <button
          id="center-power-btn"
          onClick={() => {
            closeAllPopovers();
            onTogglePower();
          }}
          className={`relative px-4 sm:px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm flex items-center gap-2 transition-all duration-300 active:scale-95 shadow-lg ${
            isConnected
              ? 'bg-rose-600/90 hover:bg-rose-600 text-white shadow-rose-900/40'
              : state === 'connecting'
              ? 'bg-amber-500/80 hover:bg-amber-500 text-black shadow-amber-900/40 animate-pulse'
              : 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:opacity-95 text-white font-semibold shadow-pink-900/40'
          }`}
          style={{
            boxShadow: isConnected
              ? `0 0 20px rgba(244, 63, 94, 0.4)`
              : `0 0 25px ${currentTheme.glow}`,
          }}
        >
          <Power className="w-4 h-4" />
          <span>
            {isConnected ? 'End' : state === 'connecting' ? 'Connecting' : 'Wake Roxy'}
          </span>
        </button>

        {/* Mute Toggle */}
        <button
          id="mute-toggle-btn"
          onClick={onToggleMute}
          disabled={!isConnected}
          className={`p-2.5 rounded-full active:scale-95 transition-all ${
            !isConnected
              ? 'text-zinc-600 cursor-not-allowed'
              : isMuted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          aria-label="Toggle Microphone"
        >
          {isMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Voice Selector Toggle */}
        <button
          id="voice-toggle-btn"
          onClick={() => {
            setShowVoicePicker(!showVoicePicker);
            setShowThemePicker(false);
            setShowLangPicker(false);
          }}
          className={`p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all ${
            showVoicePicker ? 'bg-white/10 text-white' : ''
          }`}
          title="Select Gemini Voice"
          aria-label="Select Voice"
        >
          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Persona Info Modal Button */}
        <button
          id="info-toggle-btn"
          onClick={() => {
            closeAllPopovers();
            onOpenInfo();
          }}
          className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          title="About Roxy Persona"
          aria-label="Persona Details"
        >
          <Info className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};
