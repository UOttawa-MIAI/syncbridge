import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
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

        {/* Status Indicators & GitHub Link */}
        <div className="flex items-center space-x-4">

          <a
            href="https://github.com/UOttawa-MIAI/syncbridge"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition duration-150 text-xs font-medium group"
            title="View Source on GitHub"
          >
            <Github className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
            <span className="hidden sm:inline">GitHub</span>
            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-400" />
          </a>
        </div>
      </div>
    </header>
  );
};
