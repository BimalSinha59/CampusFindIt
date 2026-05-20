import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiClient.post('/users/login', formData);
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/');
            window.location.reload(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-base-200 transition-colors duration-300">
            <div className="w-full max-w-md overflow-hidden border shadow-xl card bg-base-100 border-base-300">
                <div className="p-8 card-body">
                    {/* Header */}
                    <div className="mb-6 text-center">
                        <h1 className="text-3xl font-black tracking-tight text-base-content">Welcome Back</h1>
                        <p className="mt-2 font-medium text-base-content/60">Log in to manage your campus reports</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="py-3 mb-6 duration-300 border-none shadow-sm alert alert-error rounded-2xl bg-error/10 text-error animate-in fade-in">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 stroke-current shrink-0" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div className="form-control">
                            <label className="label">
                                <span className="font-bold label-text text-base-content/70">Email</span>
                            </label>
                            <div className="relative group">
                                <Mail className="absolute transition-colors -translate-y-1/2 left-4 top-1/2 text-base-content/30 group-focus-within:text-primary" size={18} />
                                <input
                                    type="email"
                                    required
                                    placeholder="student_name@example.com"
                                    className="w-full pl-12 transition-all input input-bordered input-primary bg-base-200 focus:bg-base-100 rounded-2xl"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="form-control">
                            <label className="label">
                                <span className="font-bold label-text text-base-content/70">Password</span>
                            </label>
                            <div className="relative group">
                                <Lock className="absolute transition-colors -translate-y-1/2 left-4 top-1/2 text-base-content/30 group-focus-within:text-primary" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 transition-all input input-bordered input-primary bg-base-200 focus:bg-base-100 rounded-2xl"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8 form-control">
                            <button
                                type="submit"
                                disabled={loading}
                                className="text-white shadow-lg btn btn-primary btn-block btn-lg rounded-2xl shadow-primary/20"
                            >
                                {loading ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    <LogIn size={20} className="mr-2" />
                                )}
                                {loading ? 'Verifying Credentials...' : 'Login to Account'}
                            </button>
                        </div>
                    </form>

                    {/* Footer Link */}
                    <div className="justify-center mt-8 card-actions">
                        <p className="text-sm font-medium text-center text-base-content/60">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold link link-primary link-hover">
                                Create one now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;