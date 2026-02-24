import './globals.css';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { CurrencyProvider } from '@/lib/contexts/CurrencyContext';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import FinancialAdvisor from '@/components/FinancialAdvisor';
import { Analytics } from '@vercel/analytics/next';

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fin-nuvora.vercel.app';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FinNuvora — AI-Powered Financial Management Platform',
    template: '%s | FinNuvora',
  },
  description:
    'FinNuvora is an AI-powered personal finance platform. Track expenses, manage portfolios, monitor crypto, get AI insights, set financial goals, and optimize taxes — all in one dashboard.',
  keywords: [
    'FinNuvora',
    'Fin Nuvora',
    'finnuvora',
    'AI financial management',
    'personal finance tracker',
    'AI portfolio tracker',
    'expense tracker',
    'crypto portfolio',
    'financial advisor AI',
    'budget planner',
    'investment tracker',
    'tax summary tool',
    'fintech',
    'money management app',
  ],
  authors: [{ name: 'FinNuvora Team' }],
  creator: 'FinNuvora',
  publisher: 'FinNuvora',
  applicationName: 'FinNuvora',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  themeColor: '#F5A623',
  colorScheme: 'dark',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinNuvora',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    viewportFit: 'cover',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'FinNuvora',
    title: 'FinNuvora — AI-Powered Financial Management Platform',
    description:
      'Track expenses, manage portfolios, monitor crypto, and get AI-driven financial insights. Your all-in-one personal finance dashboard.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FinNuvora — AI-Powered Financial Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinNuvora — AI-Powered Financial Management',
    description:
      'Track expenses, manage portfolios, monitor crypto, and get AI-driven financial insights.',
    images: ['/og-image.png'],
    creator: '@finnuvora',
  },
  alternates: {
    canonical: '/',
  },
  category: 'finance',
  verification: {
    google: 'j8xEoKJ5Kkzs8JFEYELJwsApTB8qgghaPiCLDiUX7qs',
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'FinNuvora',
  alternateName: ['Fin Nuvora', 'finnuvora'],
  url: SITE_URL,
  description:
    'AI-powered personal finance platform for tracking expenses, managing portfolios, monitoring crypto, and getting financial insights.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  creator: {
    '@type': 'Organization',
    name: 'FinNuvora',
    url: SITE_URL,
  },
  featureList: [
    'AI Financial Advisor',
    'Expense Tracking',
    'Portfolio Management',
    'Crypto Portfolio Tracking',
    'Tax Summary & Export',
    'Goal Setting',
    'Bank Integration',
    'P2P Payment Requests',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="canonical" href={SITE_URL} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${sans.variable} ${display.variable} bg-background text-text-primary antialiased transition-colors duration-300`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`,
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            <CurrencyProvider>
              {children}
              <FinancialAdvisor />
              <Analytics />
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
