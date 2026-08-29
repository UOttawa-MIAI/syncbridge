'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { ComposerForm, ComposerData } from '@/components/composer-form';
import { DiscordPreview } from '@/components/discord-preview';
import { Eye, Edit3, Info } from 'lucide-react';

export default function DashboardPage() {
  const [formData, setFormData] = useState<ComposerData>({
    title: '',
    body: '',
    accentColor: '#8F001A',
    bannerUrl: ''
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [mobileTab, setMobileTab] = useState<'composer' | 'preview'>('composer');

  const rolePing = process.env.NEXT_PUBLIC_DISCORD_ROLE_PING || '@everyone';
  const senderName = process.env.NEXT_PUBLIC_SENDER_NAME || 'uOttawa Faculty Desk';
  const targetChannel = process.env.NEXT_PUBLIC_DISCORD_CHANNEL || 'school-announcements';

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch('/api/announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rolePing,
          senderName,
          targetChannel,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to publish announcement');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const supportEmail = process.env.SUPPORT_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@uottawa.ca';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
        {/* Mobile View Switcher Tabs (Visible only on small screens) */}
        <div className="flex lg:hidden rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setMobileTab('composer')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition ${mobileTab === 'composer'
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
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition ${mobileTab === 'preview'
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
            </div>

            <ComposerForm
              data={formData}
              onChange={setFormData}
              onPublish={handlePublish}
              isPublishing={isPublishing}
              rolePing={rolePing}
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
              rolePing={rolePing}
              accentColor={formData.accentColor}
              bannerUrl={formData.bannerUrl}
              senderName={senderName}
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
