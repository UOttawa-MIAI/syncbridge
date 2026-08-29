import React from 'react';
import { Hash } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export interface DiscordPreviewProps {
  title: string;
  body: string;
  targetChannel: string;
  rolePing: string;
  accentColor: string;
  bannerUrl?: string;
  senderName: string;
}

export const DiscordPreview: React.FC<DiscordPreviewProps> = ({
  title,
  body,
  targetChannel,
  rolePing,
  accentColor,
  bannerUrl,
  senderName,
}) => {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full bg-[#313338] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-[#dbdee1]">
      {/* Discord Header Bar */}
      <div className="h-12 px-4 bg-[#2b2d31] border-b border-[#1f2023] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Hash className="w-5 h-5 text-[#80848e]" />
          <span className="font-semibold text-sm text-white">{targetChannel}</span>
        </div>
        <div className="text-[11px] font-mono text-[#949ba4] bg-[#1e1f22] px-2 py-0.5 rounded border border-[#2b2d31]">
          channel
        </div>
      </div>

      {/* Discord Chat Area */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
        {/* Message Item */}
        <div className="flex space-x-3 sm:space-x-4">
          {/* Avatar */}
          <img
            src="/logo.png"
            alt="uOttawa MIAI Avatar"
            className="w-10 h-10 rounded-full bg-garnet-950 border border-garnet-700/80 flex-shrink-0 object-contain shadow-md p-0.5"
          />

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            {/* Header: Sender + Bot Badge + Timestamp */}
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm text-white hover:underline cursor-pointer">
                {senderName}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#5865f2] text-[10px] font-bold text-white uppercase tracking-wider">
                APP
              </span>
              <span className="text-xs text-[#949ba4]">Today at {timeString}</span>
            </div>

            {/* Role Ping Mention (if selected) */}
            {rolePing && rolePing !== 'none' && (
              <div className="mt-1">
                <span className="inline-block px-1.5 py-0.5 rounded bg-[#5865f2]/20 text-[#c9cdfb] text-xs font-medium hover:bg-[#5865f2]/30 cursor-pointer">
                  {rolePing}
                </span>
              </div>
            )}

            {/* Rich Embed Card */}
            <div
              className="mt-2.5 rounded-lg bg-[#2b2d31] border-l-4 p-4 shadow-md max-w-xl"
              style={{ borderLeftColor: accentColor || '#8F001A' }}
            >
              {/* Embed Title */}
              <h3 className="font-bold text-base text-white tracking-tight break-words">
                {title || 'Announcement Title Preview...'}
              </h3>

              {/* Embed Body (Rendered Markdown) */}
              <div className="mt-2 text-sm text-[#dbdee1] space-y-2 prose prose-invert max-w-none text-xs sm:text-sm break-words leading-relaxed">
                {body ? (
                  <ReactMarkdown>{body}</ReactMarkdown>
                ) : (
                  <p className="text-[#949ba4] italic">
                    Type your announcement content in the composer to preview how it renders live in Discord...
                  </p>
                )}
              </div>

              {/* Banner Image Preview (if provided) */}
              {bannerUrl && (
                <div className="mt-3 rounded-md overflow-hidden max-h-48 border border-slate-700/50">
                  <img
                    src={bannerUrl}
                    alt="Announcement banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Embed Footer */}
              <div className="mt-3 pt-2 border-t border-[#35373c] flex items-center justify-between text-[11px] text-[#949ba4]">
                <span>Today at {timeString}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
