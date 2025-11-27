'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getCookie, setCookie } from '@/lib/cookies';

const ThemeContext = createContext({
    theme: 'dark',
    setTheme: () => { },
});

export function ThemeProvider({ children }) {
    // Always default to dark, ignore cookies/system
    const [theme] = useState('dark');

    useEffect(() => {
        // Force dark theme on mount
        const root = window.document.documentElement;
        root.setAttribute('data-theme', 'dark');
        root.classList.add('dark'); // Ensure tailwind dark mode works if class strategy is used
    }, []);

    // No-op for setting theme
    const setTheme = () => { };

    return (
        <ThemeContext.Provider value={{ theme: 'dark', setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}



export const useTheme = () => useContext(ThemeContext);
