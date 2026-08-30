'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/navbar';
import { ComposerForm, ComposerData } from '@/components/composer-form';
import { DiscordPreview } from '@/components/discord-preview';
import { AuthModal } from '@/components/auth-modal';
import { Eye, Edit3, Info, Lock } from 'lucide-react';

import { APP_CONFIG } from '@/lib/config';

const DRAFT_STORAGE_KEY = 'syncbridge_announcement_draft_v1';

export default function DashboardPage() {
  const { defaultSender, defaultRole, targetChannel, supportEmail, accentColor } = APP_CONFIG;

  // Form State with localStorage persistence
  const [formData, setFormData] = useState<ComposerData>({
    title: '',
    body: '',
    senderName: defaultSender,
    rolePing: defaultRole,
    accentColor: accentColor,
    bannerUrl: '',
  });

  // Auth & Modal State
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingPublish, setPendingPublish] = useState(false);

  const [isPublishing, setIsPublishing] = useState(false);
  const [mobileTab, setMobileTab] = useState<'composer' | 'preview'>('composer');

  // 1. Check existing session on mount
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to check session:', err);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkSession();

    // Restore draft from localStorage if available
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch (e) {
      console.error('Failed to load draft from localStorage:', e);
    }
  }, [checkSession]);

  // Autosave draft changes to localStorage
  const handleFormChange = (newData: ComposerData) => {
    setFormData(newData);
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(newData));
    } catch (e) {
      console.error('Failed to save draft to localStorage:', e);
    }
  };

  // Perform the actual API broadcast
  const executeBroadcast = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          targetChannel,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Session expired or invalid; prompt login
          setUser(null);
          setIsAuthModalOpen(true);
        }
        throw new Error(json.error || 'Failed to publish announcement');
      }

      // Successful publish: optionally keep draft or clear if desired
      // We keep it in state so users can review what was sent
    } finally {
      setIsPublishing(false);
      setPendingPublish(false);
    }
  };

  // Called when user clicks "Publish Announcement to Discord"
  const handlePublish = async () => {
    if (!user) {
      setPendingPublish(true);
      setIsAuthModalOpen(true);
      return;
    }

    await executeBroadcast();
  };

  // Handle successful login from AuthModal
  const handleAuthSuccess = async (authenticatedUser: { email: string }) => {
    setUser(authenticatedUser);
    setIsAuthModalOpen(false);

    // If the user clicked publish before logging in, resume broadcast automatically!
    if (pendingPublish) {
      setTimeout(() => {
        executeBroadcast();
      }, 100);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingPublish(false);
        }}
        onSuccess={handleAuthSuccess}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
        {/* Mobile View Switcher Tabs (Visible only on small screens) */}
        <div className="flex lg:hidden rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setMobileTab('composer')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition ${
              mobileTab === 'composer'
                ? 'bg-garnet-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>1. Composer Form</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition ${
              mobileTab === 'preview'
                ? 'bg-garnet-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2. Live Discord Preview</span>
          </button>
        </div>

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Announcement Composer (7 cols on desktop) */}
          <div className={`lg:col-span-7 space-y-3 ${mobileTab === 'composer' ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-garnet-400" />
                <span>Compose Notice</span>
              </h2>

              {!user && (
                <span className="text-[11px] text-slate-400 flex items-center space-x-1 font-medium bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Sign in required on publish</span>
                </span>
              )}
            </div>

            <ComposerForm
              data={formData}
              onChange={handleFormChange}
              onPublish={handlePublish}
              isPublishing={isPublishing}
              targetChannel={targetChannel}
            />
          </div>

          {/* Right Column: Live Discord Simulation (5 cols on desktop) */}
          <div className={`lg:col-span-5 space-y-3 lg:sticky lg:top-20 ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Discord Live Preview</span>
              </h2>

              {/* WYSIWYG Badge with Tooltip */}
              <div className="relative group cursor-help">
                <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/70 hover:bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-800/80 flex items-center space-x-1 transition shadow-sm">
                  <span>WYSIWYG</span>
                  <Info className="w-3 h-3 text-emerald-400/80" />
                </span>

                {/* Tooltip Bubble */}
                <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-30 w-64 p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-[11px] text-slate-300 font-sans leading-relaxed pointer-events-none">
                  <p className="font-semibold text-white mb-1 flex items-center justify-between">
                    <span className="text-emerald-400 font-mono">WYSIWYG</span>
                    <span className="text-[10px] text-slate-400 font-normal">What You See Is What You Get</span>
                  </p>
                  <p className="text-slate-400">
                    Live simulation of the exact Markdown embed, colors, role pings, and layout as they will appear in Discord upon broadcast.
                  </p>
                </div>
              </div>
            </div>

            <DiscordPreview
              title={formData.title}
              body={formData.body}
              targetChannel={targetChannel}
              rolePing={formData.rolePing}
              accentColor={formData.accentColor}
              bannerUrl={formData.bannerUrl}
              senderName={formData.senderName}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>
          SyncBridge • Open-source initiative by the uOttawa MIAI Community • Support:{' '}
          <a
            href={`mailto:${supportEmail}`}
            className="text-slate-400 hover:text-garnet-300 underline font-mono"
          >
            {supportEmail}
          </a>
        </p>
      </footer>
    </div>
  );
}
