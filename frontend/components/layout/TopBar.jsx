import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, LogOut, User, Settings, Menu } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeCookie } from '@/lib/cookies';

export default function TopBar({ user, title, onMenuToggle }) {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [localProfilePic, setLocalProfilePic] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Load from local storage on mount
        const savedPic = typeof window !== 'undefined' ? localStorage.getItem('profilePicture') : null;
        if (savedPic) {
            setLocalProfilePic(savedPic);
        }

        // Listen for updates
        const handleProfileUpdate = () => {
            const newPic = localStorage.getItem('profilePicture');
            if (newPic) setLocalProfilePic(newPic);
        };

        window.addEventListener('profilePictureUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profilePictureUpdated', handleProfileUpdate);
    }, []);

    const handleLogout = () => {
        removeCookie('authToken');
        removeCookie('userData');
        router.push('/auth/login');
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="h-16 lg:h-20 px-4 lg:px-8 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-10">
            {/* Left: Hamburger + Title */}
            <div className="flex items-center gap-3">
                {/* Hamburger - mobile only */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 -ml-1 text-text-secondary hover:text-text-primary rounded-xl hover:bg-white/5 transition-colors"
                >
                    <Menu size={22} />
                </button>

                <h1 className="text-lg lg:text-2xl font-bold text-text-primary">{title}</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 lg:gap-4">
                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-3 lg:pl-4 border-l border-border cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-text-primary">{user?.name || 'User'}</div>
                            <div className="text-xs text-text-secondary">Welcome Back!</div>
                        </div>
                        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-surface-elevated border border-border overflow-hidden">
                            {localProfilePic || user?.profilePicture ? (
                                <img
                                    src={localProfilePic || (user.profilePicture.startsWith('blob:') ? user.profilePicture : `${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}${user.profilePicture}`)}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-secondary font-bold">
                                    {user?.name?.[0] || 'U'}
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-surface-elevated border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-2">
                                <Link
                                    href="/dashboard/profile"
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-white/5 rounded-lg transition-colors"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <User size={16} />
                                    Profile Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
