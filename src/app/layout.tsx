import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SyncBridge | uOttawa MIAI Faculty Announcement Portal',
  description: 'A seamless, web-based gateway for uOttawa faculty and program directors to broadcast official announcements to the student Discord community.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 flex flex-col">
        {children}
      </body>
    </html>
  );
}
