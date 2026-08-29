'use client';

import React, { useState, useRef } from 'react';
import {
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
  Palette,
  AtSign,
  Image as ImageIcon,
  Bold,
  List,
  Link2,
  RotateCcw,
  User,
  Info,
  Bell,
  BellOff,
  ChevronDown
} from 'lucide-react';

export interface ComposerData {
  title: string;
  body: string;
  senderName: string;
  rolePing: string;
  accentColor: string;
  bannerUrl: string;
}

interface ComposerFormProps {
  data: ComposerData;
  onChange: (data: ComposerData) => void;
  onPublish: () => Promise<void>;
  isPublishing: boolean;
  targetChannel: string;
}

const PRESET_TEMPLATES = [
  {
    name: '🎓 Guest Lecture / Keynote',
    title: 'Distinguished Speaker Series: AI & Robotics Keynote',
    body: 'We are thrilled to announce our upcoming guest lecture featuring **Dr. Elena Vance** from OpenAI.\n\n* **Date & Time**: Friday, Oct 16 | 2:00 PM – 3:30 PM EDT\n* **Location**: STEM Complex (STM) 117 / Zoom\n* **Topic**: *Frontiers in Scalable Reinforcement Learning*\n\n👉 **[Click here to RSVP on the Faculty Portal](https://www.uottawa.ca/faculty-engineering)**',
    color: '#8F001A',
    rolePing: '@everyone',
  },
  {
    name: '💼 Career & Co-op Opportunity',
    title: 'New Graduate AI Research Internships (Winter 2027)',
    body: 'The Vector Institute and partner labs have opened priority applications for MIAI graduate students.\n\n* **Roles**: Applied ML Intern, Computer Vision Fellow\n* **Eligibility**: Enrolled MIAI students in good standing\n* **Application Deadline**: September 30, 2026\n\n📌 Check the link below to submit your CV and cover letter directly.',
    color: '#16A34A',
    rolePing: '@everyone',
  },
  {
    name: '⏰ Academic Deadline Notice',
    title: 'Reminder: Fall 2026 Course Drop & Registration Deadline',
    body: 'Please note the official academic dates for the current term:\n\n1. **Last day to modify course selection**: Sept 22, 2026\n2. **Financial credit deadline**: Oct 5, 2026\n\nFor degree audit and elective substitution questions, please contact the Graduate Studies Office at `engineering.grad@uottawa.ca`.',
    color: '#D97706',
    rolePing: '@everyone',
  },
];

const COLOR_PALETTES = [
  { name: 'uOttawa Garnet', value: '#8F001A' },
  { name: 'Sapphire Blue', value: '#2563EB' },
  { name: 'Emerald Green', value: '#16A34A' },
  { name: 'Amber Gold', value: '#D97706' },
  { name: 'Royal Purple', value: '#7C3AED' },
];

export const ComposerForm: React.FC<ComposerFormProps> = ({
  data,
  onChange,
  onPublish,
  isPublishing,
  targetChannel,
}) => {
  const [publishStatus, setPublishStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyTemplate = (template: typeof PRESET_TEMPLATES[0]) => {
    if (data.body && data.body.length > 30) {
      const confirmChange = window.confirm(
        'Applying this template will replace your current title and body text. Do you want to proceed?'
      );
      if (!confirmChange) return;
    }

    onChange({
      ...data,
      title: template.title,
      body: template.body,
      accentColor: template.color,
      rolePing: template.rolePing,
    });
  };

  const handleClearForm = () => {
    if (window.confirm('Clear all fields to start with a blank announcement?')) {
      onChange({
        ...data,
        title: '',
        body: '',
        bannerUrl: '',
        rolePing: '@everyone',
      });
    }
  };

  // Word-like Selection & Cursor-aware formatting
  const applyFormatting = (formatType: 'bold' | 'list' | 'link') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = data.body;
    const selectedText = currentText.substring(start, end);

    let newText = '';
    let newCursorStart = start;
    let newCursorEnd = end;

    if (formatType === 'bold') {
      if (selectedText) {
        newText = currentText.substring(0, start) + `**${selectedText}**` + currentText.substring(end);
        newCursorStart = start + 2;
        newCursorEnd = end + 2;
      } else {
        newText = currentText.substring(0, start) + '**bold text**' + currentText.substring(end);
        newCursorStart = start + 2;
        newCursorEnd = start + 11;
      }
    } else if (formatType === 'list') {
      if (selectedText) {
        const lines = selectedText.split('\n');
        const bulleted = lines.map((line) => (line.startsWith('* ') ? line : `* ${line}`)).join('\n');
        newText = currentText.substring(0, start) + bulleted + currentText.substring(end);
        newCursorStart = start;
        newCursorEnd = start + bulleted.length;
      } else {
        const prefix = start > 0 && currentText[start - 1] !== '\n' ? '\n* ' : '* ';
        newText = currentText.substring(0, start) + prefix + 'List item' + currentText.substring(end);
        newCursorStart = start + prefix.length;
        newCursorEnd = newCursorStart + 9;
      }
    } else if (formatType === 'link') {
      if (selectedText) {
        newText = currentText.substring(0, start) + `[${selectedText}](https://...)` + currentText.substring(end);
        newCursorStart = start + selectedText.length + 3;
        newCursorEnd = newCursorStart + 10;
      } else {
        newText = currentText.substring(0, start) + '[Link Title](https://example.com)' + currentText.substring(end);
        newCursorStart = start + 1;
        newCursorEnd = start + 11;
      }
    }

    onChange({ ...data, body: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }, 0);
  };

  const handlePublishClick = async () => {
    setPublishStatus(null);
    try {
      await onPublish();
      setPublishStatus({ success: true, message: 'Announcement successfully broadcasted to Discord!' });
    } catch (err: any) {
      setPublishStatus({ success: false, message: err.message || 'Failed to dispatch webhook' });
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Quick Templates Bar (Collapsible on Mobile, Expanded on Desktop) */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3 sm:p-0 sm:border-0 sm:bg-transparent">
        <div className="flex items-center justify-between mb-2.5">
          <button
            type="button"
            onClick={() => setIsTemplatesOpen(!isTemplatesOpen)}
            className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-garnet-400" />
            <span>Starter Templates</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 sm:hidden ${
                isTemplatesOpen ? 'rotate-180 text-garnet-400' : ''
              }`}
            />
          </button>
          <button
            type="button"
            onClick={handleClearForm}
            className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center space-x-1 transition cursor-pointer"
            title="Clear all fields"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Blank</span>
          </button>
        </div>

        {/* Template Grid: Collapsed on Mobile (< sm) unless toggled; Always Visible on Desktop (>= sm) */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 ${isTemplatesOpen ? 'grid' : 'hidden sm:grid'}`}>
          {PRESET_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => {
                applyTemplate(tmpl);
                setIsTemplatesOpen(false); // auto-collapse on mobile after picking
              }}
              className="text-left px-3 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-garnet-700/60 text-xs font-medium text-slate-300 transition duration-150 flex items-center justify-between group"
            >
              <span className="truncate">{tmpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target Channel, Sender Name & Role Notification Ping Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: Target Channel (Read-only / Pinned) */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-garnet-400" />
            <span>Target Channel</span>
          </label>
          <div className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono flex items-center justify-between">
            <span>{targetChannel.startsWith('#') ? targetChannel : `#${targetChannel}`}</span>
          </div>
        </div>

        {/* Column 2: Sender Name */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5 mb-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Sender Name</span>
          </label>
          <input
            type="text"
            value={data.senderName}
            onChange={(e) => onChange({ ...data, senderName: e.target.value })}
            placeholder="e.g. uOttawa Faculty Desk"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-garnet-600 font-medium"
          />
        </div>

        {/* Column 3: Target Notification Role */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <AtSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Notification Ping</span>
            </label>

            {/* Info Tooltip */}
            <div className="relative group cursor-help">
              <span className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center space-x-0.5">
                <span>Info</span>
                <Info className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
              </span>

              {/* Tooltip Popover */}
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-30 w-60 p-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-[11px] text-slate-300 font-sans leading-relaxed pointer-events-none">
                <p className="font-semibold text-white mb-0.5">Notification Ping</p>
                <p className="text-slate-400">
                  Tag <strong className="text-emerald-400 font-mono">@everyone</strong> to notify all channel members with an unread badge. Set to <span className="font-mono text-slate-300">none</span> for silent announcements.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <input
              type="text"
              value={data.rolePing}
              onChange={(e) => onChange({ ...data, rolePing: e.target.value })}
              placeholder="@everyone, @here, or none"
              className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-garnet-600 font-mono"
            />
            {/* Quick helper buttons */}
            <button
              type="button"
              onClick={() => onChange({ ...data, rolePing: '@everyone' })}
              className={`px-2 py-2 rounded-xl text-[11px] font-mono font-medium border transition flex items-center space-x-1 ${data.rolePing === '@everyone'
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400'
                }`}
              title="Tag @everyone (All Members)"
            >
              <Bell className="w-3 h-3 text-emerald-400" />
              <span className="hidden xl:inline">@all</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, rolePing: 'none' })}
              className={`px-2 py-2 rounded-xl text-[11px] font-mono font-medium border transition flex items-center space-x-1 ${data.rolePing === 'none' || data.rolePing === ''
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-500'
                }`}
              title="Silent (No Ping)"
            >
              <BellOff className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Announcement Title */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
          Announcement Title <span className="text-garnet-400">*</span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="e.g. Fall 2026 AI Capstone Seminar & Project Kickoff"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-garnet-600 font-medium"
        />
      </div>

      {/* Content Body & Word-Like Formatting Toolbar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Announcement Content (Markdown) <span className="text-garnet-400">*</span>
          </label>
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 font-medium hidden sm:inline mr-1">Select text & click:</span>
            <button
              type="button"
              onClick={() => applyFormatting('bold')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 active:bg-garnet-800 text-slate-200 text-xs font-bold transition flex items-center space-x-1"
              title="Bold selected text (or insert **bold**)"
            >
              <Bold className="w-3 h-3" />
              <span className="text-[11px]">B</span>
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('list')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 active:bg-garnet-800 text-slate-200 text-xs transition flex items-center space-x-1"
              title="Bullet list selected lines"
            >
              <List className="w-3 h-3" />
              <span className="text-[11px]">List</span>
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('link')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 active:bg-garnet-800 text-slate-200 text-xs transition flex items-center space-x-1"
              title="Convert selected text into link"
            >
              <Link2 className="w-3 h-3" />
              <span className="text-[11px]">Link</span>
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          rows={6}
          value={data.body}
          onChange={(e) => onChange({ ...data, body: e.target.value })}
          placeholder="Write your announcement details here... Select any text and click Bold, List, or Link above to format."
          className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-garnet-600 font-sans leading-relaxed resize-y"
        />
        <div className="flex justify-end mt-1 text-[11px] text-slate-500">
          <span>{data.body.length} characters</span>
        </div>
      </div>

      {/* Color Accent & Banner URL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5 mb-2">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span>Card Accent Color</span>
          </label>
          <div className="flex items-center space-x-2">
            {COLOR_PALETTES.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onChange({ ...data, accentColor: color.value })}
                className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 flex items-center justify-center ${data.accentColor === color.value ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80'
                  }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5 mb-2">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Banner Image URL (Optional)</span>
          </label>
          <input
            type="url"
            value={data.bannerUrl}
            onChange={(e) => onChange({ ...data, bannerUrl: e.target.value })}
            placeholder="https://example.com/banner.jpg"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-garnet-600 font-mono"
          />
        </div>
      </div>

      {/* Status Feedback */}
      {publishStatus && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-3 border ${publishStatus.success
            ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
            : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
        >
          {publishStatus.success ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          )}
          <span>{publishStatus.message}</span>
        </div>
      )}

      {/* Publish Button */}
      <button
        type="button"
        disabled={isPublishing || !data.title || !data.body}
        onClick={handlePublishClick}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg transition duration-200 ${isPublishing || !data.title || !data.body
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          : 'bg-garnet-800 hover:bg-garnet-700 text-white shadow-garnet-900/40 border border-garnet-600 cursor-pointer active:scale-[0.99]'
          }`}
      >
        {isPublishing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Broadcasting to Discord...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Publish Announcement to Discord</span>
          </>
        )}
      </button>
    </div>
  );
};
