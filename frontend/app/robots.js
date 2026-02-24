export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fin-nuvora.vercel.app';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/api/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
