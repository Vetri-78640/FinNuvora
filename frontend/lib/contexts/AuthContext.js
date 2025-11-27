'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { userAPI } from '@/lib/api';
import { getCookie, setCookie, removeCookie } from '@/lib/cookies';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = getCookie('authToken');
            if (!token) {
                setLoading(false);
                return;
            }

            const { data } = await userAPI.getProfile();
            if (data.success) {
                let userData = data.user;

                // Auto-detect currency if not set
                if (!userData.currency || userData.currency === 'USD') {
                    let detectedCurrency = 'USD'; // Default

                    // Method 1: Try geolocation API first (most accurate)
                    try {
                        const position = await new Promise((resolve, reject) => {
                            if ('geolocation' in navigator) {
                                navigator.geolocation.getCurrentPosition(resolve, reject, {
                                    timeout: 5000,
                                    maximumAge: 300000 // Cache for 5 minutes
                                });
                            } else {
                                reject(new Error('Geolocation not supported'));
                            }
                        });

                        // Use reverse geocoding API to get country from coordinates
                        const { latitude, longitude } = position.coords;
                        const geoResponse = await fetch(
                            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                        );
                        const geoData = await geoResponse.json();
                        const countryCode = geoData.countryCode;

                        // Map country code to currency
                        const currencyMap = {
                            'IN': 'INR',
                            'GB': 'GBP',
                            'EU': 'EUR', // Generic EU
                            'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR', 'NL': 'EUR',
                            'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'IE': 'EUR', 'GR': 'EUR',
                            'JP': 'JPY',
                            'CA': 'CAD',
                            'AU': 'AUD',
                            'US': 'USD'
                        };

                        if (currencyMap[countryCode]) {
                            detectedCurrency = currencyMap[countryCode];
                            console.log('✅ Currency detected via geolocation:', detectedCurrency, `(${countryCode})`);
                        }
                    } catch (geoError) {
                        // Method 2: Fallback to timezone detection
                        console.log('Geolocation unavailable, using timezone detection');
                        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                        if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || timeZone.includes('India')) {
                            detectedCurrency = 'INR';
                        } else if (timeZone.includes('Europe') || timeZone.includes('Paris') || timeZone.includes('Berlin') || timeZone.includes('Madrid')) {
                            detectedCurrency = 'EUR';
                        } else if (timeZone.includes('London')) {
                            detectedCurrency = 'GBP';
                        } else if (timeZone.includes('Tokyo')) {
                            detectedCurrency = 'JPY';
                        } else if (timeZone.includes('Toronto') || timeZone.includes('Vancouver')) {
                            detectedCurrency = 'CAD';
                        } else if (timeZone.includes('Sydney') || timeZone.includes('Melbourne')) {
                            detectedCurrency = 'AUD';
                        }

                        console.log('✅ Currency detected via timezone:', detectedCurrency);
                    }

                    if (detectedCurrency !== 'USD') {
                        try {
                            // Update profile with detected currency
                            await userAPI.updateProfile({ currency: detectedCurrency });
                            userData.currency = detectedCurrency;
                        } catch (e) {
                            console.error('Failed to set auto-detected currency', e);
                        }
                    }
                }

                setUser(userData);
            }
        } catch (error) {
            console.error('Auth check failed', error);
            removeCookie('authToken');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, token) => {
        setCookie('authToken', token, 7);
        setUser(userData);
        router.push('/dashboard');
    };

    const logout = () => {
        removeCookie('authToken');
        setUser(null);
        router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
