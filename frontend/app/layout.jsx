import './globals.css';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';

export const metadata = {
  title: 'FinNuvora — Intelligent Wealth Management For Visionary Investors',
  description:
    'Build generational wealth with a modern fintech platform that unifies portfolios, insights, and AI-powered financial automation.',
};

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} bg-background text-text-primary`}>
        <div className="relative min-h-screen">{children}</div>
      </body>
    </html>
  );
}
