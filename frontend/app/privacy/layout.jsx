export const metadata = {
    title: 'Privacy Policy',
    description:
        'Read FinNuvora\'s privacy policy. Learn how we collect, use, and protect your personal and financial data.',
    alternates: { canonical: '/privacy' },
    openGraph: {
        title: 'FinNuvora Privacy Policy',
        description: 'How FinNuvora collects, uses, and protects your personal data.',
        url: '/privacy',
    },
};

export default function PrivacyLayout({ children }) {
    return children;
}
