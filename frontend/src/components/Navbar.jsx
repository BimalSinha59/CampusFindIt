import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { LogOut, User, SquaresExclude, PlusCircle, LayoutDashboard, Home, Sun, Moon, ClipboardList, MessageSquare, Bell } from 'lucide-react';

// ─── Notification Socket ─────────────────────────────────────────────────────
// Created at module level so it's one persistent connection for the whole app.
// We pass the JWT token in the auth object
// credentials during the WebSocket handshake (HTTP headers aren't available after the upgrade).
// The socket is created once regardless of re-renders.
const notifSocket = io(import.meta.env.VITE_BACKEND_URL, {
    auth: { token: localStorage.getItem('token') },
    // Don't auto-connect if there's no token (user not logged in)
    autoConnect: !!localStorage.getItem('token')
});
// ─────────────────────────────────────────────────────────────────────────────

const Navbar = () => {
    const navigate = useNavigate();

    // Read user and token from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    const [theme, setTheme] = useState(localStorage.getItem("theme") || "forest");

    // ─── Notification State ───────────────────────────────────────────────────
    const [notifCount, setNotifCount] = useState(0);
    const [notifications, setNotifications] = useState([]); // stores last 5 messages
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const notifRef = useRef(null); // for closing dropdown on outside click
    // ──────────────────────────────────────────────────────────────────────────

    // Apply theme to HTML element
    useEffect(() => {
        document.querySelector('html').setAttribute('data-theme', theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    // ─── Socket Notification Listener ────────────────────────────────────────
    useEffect(() => {
        if (!token) return; // don't set up listener if not logged in

        // Connect the socket if it isn't already connected
        if (!notifSocket.connected) {
            notifSocket.connect();
        }

        const handleNotification = (data) => {
            // Increment the unread badge count
            setNotifCount(prev => prev + 1);
            // Prepend new notification, keep only last 5
            setNotifications(prev => [data, ...prev].slice(0, 5));
        };

        notifSocket.on("new_notification", handleNotification);

        // Cleanup: remove this specific listener when component unmounts
        return () => {
            notifSocket.off("new_notification", handleNotification);
        };
    }, [token]);
    // ─────────────────────────────────────────────────────────────────────────

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleThemeToggle = () => {
        setTheme(theme === "emerald" ? "forest" : "emerald");
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        notifSocket.disconnect(); // cleanly close socket on logout
        navigate('/login');
        window.location.reload();
    };

    // Mark all notifications as read when dropdown is opened
    const handleNotifBellClick = () => {
        setShowNotifDropdown(prev => !prev);
        if (!showNotifDropdown) {
            setNotifCount(0); // clear badge when user opens the dropdown
        }
    };

    const navLinkStyles = ({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 transition-all duration-200 rounded-lg ${
            isActive
                ? "bg-primary/10 text-primary font-black border-b-2 border-primary rounded-b-none"
                : "opacity-70 hover:bg-base-200 font-bold"
        }`;

    return (
        <div className="sticky top-0 z-50 px-4 border-b shadow-sm navbar bg-base-100 border-base-300 sm:px-8">
            {/* Navbar Start: Logo */}
            <div className="navbar-start">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="p-2 transition-transform rounded-lg shadow-md bg-primary group-hover:scale-110">
                        <SquaresExclude className="text-primary-content" size={20} />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-base-content">
                        Campus<span className="text-primary">FindIt</span>
                    </span>
                </Link>
            </div>

            {/* Navbar Center: Main Nav Links */}
            <div className="hidden navbar-center lg:flex">
                <ul className="flex items-center gap-2 p-0 menu menu-horizontal uppercase text-[11px] tracking-wider">
                    <li>
                        <NavLink to="/" className={navLinkStyles}>
                            <Home size={18} /> Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/report" className={navLinkStyles}>
                            <PlusCircle size={18} /> Report
                        </NavLink>
                    </li>
                    {token && (
                        <>
                            <li>
                                <NavLink to="/dashboard" className={navLinkStyles}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/my-claims" className={navLinkStyles}>
                                    <ClipboardList size={18} /> My Claims
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/chat" className={navLinkStyles}>
                                    <MessageSquare size={18} /> Chat
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </div>

            {/* Navbar End: Theme Toggle, Notifications & User Actions */}
            <div className="gap-2 navbar-end">

                {/* Theme Toggle */}
                <label className="btn btn-ghost btn-circle swap swap-rotate text-primary">
                    <input
                        type="checkbox"
                        onChange={handleThemeToggle}
                        checked={theme === "forest"}
                    />
                    <Sun className="swap-on" size={22} />
                    <Moon className="swap-off" size={22} />
                </label>

                {/* ─── Notification Bell (only shown when logged in) ─── */}
                {token && (
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={handleNotifBellClick}
                            className="relative btn btn-ghost btn-circle"
                        >
                            <Bell size={20} className="text-base-content/70" />
                            {/* Red badge — only shown when there are unread notifications */}
                            {notifCount > 0 && (
                                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[9px] font-black text-white bg-error rounded-full">
                                    {notifCount > 5 ? '5+' : notifCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifDropdown && (
                            <div className="absolute right-0 mt-2 w-80 bg-base-100 border border-base-300 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                                <div className="px-4 py-3 border-b border-base-200">
                                    <p className="text-xs font-black tracking-widest uppercase text-base-content/50">
                                        Notifications
                                    </p>
                                </div>
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center">
                                        <Bell size={28} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-xs font-bold opacity-40">No new notifications</p>
                                    </div>
                                ) : (
                                    <ul>
                                        {notifications.map((notif, i) => (
                                            <li
                                                key={i}
                                                onClick={() => {
                                                    setShowNotifDropdown(false);
                                                    navigate('/dashboard');
                                                }}
                                                className="flex items-start gap-3 px-4 py-3 transition-colors border-b cursor-pointer border-base-200 hover:bg-base-200 last:border-b-0"
                                            >
                                                <div className="p-1.5 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                                                    <Bell size={14} />
                                                </div>
                                                <p className="text-xs font-medium leading-relaxed text-base-content/80">
                                                    {notif.message}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {/* ──────────────────────────────────────────────────────── */}

                {token ? (
                    <div className="flex items-center gap-3 ml-2">
                        <div className="flex-col items-end hidden leading-tight md:flex">
                            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Active</span>
                            <span className="text-sm font-bold text-base-content">{user?.fullName?.split(' ')[0]}</span>
                        </div>

                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="overflow-hidden btn btn-ghost btn-circle avatar bg-base-300 ring ring-primary ring-offset-base-100 ring-offset-2">
                                <div className="flex items-center justify-center w-full h-full font-black uppercase text-primary">
                                    {user?.fullName?.[0] || <User size={20} />}
                                </div>
                            </label>
                            <ul tabIndex={0} className="mt-3 z-[1] p-3 shadow-2xl menu menu-sm dropdown-content bg-base-100 rounded-2xl w-60 border border-base-300 animate-in fade-in zoom-in duration-200">
                                <li className="px-4 py-3 mb-2 border-b border-base-300">
                                    <span className="font-black text-[10px] uppercase opacity-50 p-0 tracking-widest">Account</span>
                                    <span className="p-0 font-bold truncate text-md">{user?.fullName}</span>
                                </li>
                                <li><Link to="/dashboard" className="py-2 font-semibold rounded-lg">Dashboard (Reporter)</Link></li>
                                <li><Link to="/my-claims" className="py-2 font-semibold rounded-lg">My Claims (Claimant)</Link></li>
                                <li><Link to="/chat" className="py-2 font-semibold rounded-lg">Messages</Link></li>
                                <div className="my-1 divider"></div>
                                <li className="px-2">
                                    <button onClick={handleLogout} className="w-full font-bold text-white btn btn-error btn-sm rounded-xl">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link to="/login" className="font-bold btn btn-ghost btn-sm">Login</Link>
                        <Link to="/register" className="px-6 font-bold shadow-lg btn btn-primary btn-sm rounded-xl shadow-primary/20 text-primary-content">Join</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;