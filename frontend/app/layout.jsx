import './globals.css';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { CurrencyProvider } from '@/lib/contexts/CurrencyContext';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import FinancialAdvisor from '@/components/FinancialAdvisor';

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

export const metadata = {
  title: 'FinNuvora - AI-Powered Financial Management',
  description: 'Track, manage, and grow your wealth with AI insights.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} bg-background text-text-primary antialiased transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <CurrencyProvider>
              {children}
              <FinancialAdvisor />
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
