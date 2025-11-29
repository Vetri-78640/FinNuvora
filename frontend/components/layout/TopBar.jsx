import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, LogOut, User, Settings } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeCookie } from '@/lib/cookies';

export default function TopBar({ user, title }) {
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
        <div className="h-20 px-8 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-10">
            {/* Title/Breadcrumb */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 bg-surface border border-border rounded-full text-sm text-text-primary focus:outline-none focus:border-primary w-64 transition-colors"
                    />
                </div>

                {/* Notifications */}
                <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
                </button>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 pl-4 border-l border-border cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-text-primary">{user?.name || 'User'}</div>
                            <div className="text-xs text-text-secondary">Welcome Back!</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-surface-elevated border border-border overflow-hidden">
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
