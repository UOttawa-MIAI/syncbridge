'use client';

import React from 'react';
import { Github, ExternalLink, LogIn, LogOut, UserCheck } from 'lucide-react';

export const Navbar: React.FC<{
  user?: { email: string } | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}> = ({ user, onOpenAuth, onSignOut }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="uOttawa MIAI Logo"
            className="w-10 h-10 rounded-xl object-contain border border-garnet-700/60 shadow-lg shadow-garnet-900/30 bg-garnet-950 p-0.5"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-100 text-lg tracking-tight">SyncBridge</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-garnet-950 text-garnet-300 border border-garnet-800/80 font-medium">
                uOttawa MIAI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Faculty & Director Announcement Gateway</p>
          </div>
        </div>

        {/* Right Section: Auth State & GitHub Link */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* User Auth Status */}
          {user ? (
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-1 pr-2">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-950/70 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs font-medium">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[140px] sm:max-w-[200px] truncate">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="text-xs text-slate-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-slate-800/80 transition flex items-center space-x-1"
                title="Sign out of SyncBridge"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-garnet-900/70 hover:bg-garnet-800 border border-garnet-700/80 text-garnet-100 text-xs font-medium shadow-sm transition"
            >
              <LogIn className="w-3.5 h-3.5 text-garnet-300" />
              <span>Faculty Sign In</span>
            </button>
          )}

          {/* GitHub Repo */}
          <a
            href="https://github.com/UOttawa-MIAI/syncbridge"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition duration-150 text-xs font-medium group"
            title="View Source on GitHub"
          >
            <Github className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
            <span className="hidden md:inline">GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-400" />
          </a>
        </div>
      </div>
    </header>
  );
};
