export const metadata = {
    title: 'Terms of Service',
    description:
        'Read FinNuvora\'s terms of service. Understand the rules and guidelines for using our AI-powered financial management platform.',
    alternates: { canonical: '/terms' },
    openGraph: {
        title: 'FinNuvora Terms of Service',
        description: 'Rules and guidelines for using the FinNuvora platform.',
        url: '/terms',
    },
};

export default function TermsLayout({ children }) {
    return children;
}
