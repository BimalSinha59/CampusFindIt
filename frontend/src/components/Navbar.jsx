import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LogOut, User, SquaresExclude, PlusCircle, LayoutDashboard, Home, Sun, Moon, ClipboardList, MessageSquare } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    
    // Get initial state from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "forest");

    useEffect(() => {
        document.querySelector('html').setAttribute('data-theme', theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const handleThemeToggle = () => {
        setTheme(theme === "caramellatte" ? "forest" : "caramellatte");
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        window.location.reload();
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

            {/* Navbar End: Theme Toggle & User Actions */}
            <div className="gap-2 navbar-end">
                <label className="btn btn-ghost btn-circle swap swap-rotate text-primary">
                    <input 
                        type="checkbox" 
                        onChange={handleThemeToggle} 
                        checked={theme === "forest"} 
                    />
                    <Sun className="swap-on" size={22} />
                    <Moon className="swap-off" size={22} />
                </label>

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