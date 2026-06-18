import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { X, ClipboardList, MessageCircle, Trash2, CheckCircle2 } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const userId = userData?._id; 
            
            if (!userId) {
                setError("Please login to view your dashboard.");
                setLoading(false);
                return;
            }

            const res = await apiClient.get(`/claims/my-items/${userId}`);
            setClaims(res.data.data || []);
        } catch (err) {
            console.error("Error fetching claims:", err);
            setError("Failed to load claims.");
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async (claimId) => {
        try {
            await apiClient.put(`/claims/${claimId}`, { status: 'APPROVED' });

            const res = await apiClient.post('/chats/conversation', { claimId });

            navigate('/chat', { state: { selectedChat: res.data } });
            
        } catch (err) {
            console.error("Chat/Approval error:", err);
            alert("Could not initialize chat or approve claim.");
        }
    };

    const handleDeleteClaim = async (claimId) => {
        if (!window.confirm("Are you sure you want to remove this claim? The claimant will no longer be able to message you about it.")) return;
        try {
            await apiClient.delete(`/claims/${claimId}`);
            setClaims(prev => prev.filter(c => c._id !== claimId));
        } catch (err) {
            alert(err, "Failed to delete claim.");
        }
    };

    const handleMarkAsReturned = async (itemId) => {
        if (!window.confirm("Marking as returned will delete this report and all associated claims/chats permanently. Proceed?")) return;
        try {
            await apiClient.delete(`/items/${itemId}`);
            // Clear all claims related to this item from the UI
            setClaims(prev => prev.filter(c => c.item._id !== itemId));
            alert("Item resolved and removed successfully!");
        } catch (err) {
            alert(err, "Failed to resolve item.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="font-medium text-base-content/60">Fetching received claims...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center mt-20">
                <div className="max-w-md shadow-lg alert alert-error">
                    <X size={24} />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl p-6 mx-auto transition-colors duration-300">
            <header className="flex flex-col gap-4 mb-10 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-base-content">Reporter Dashboard</h1>
                    <p className="text-base-content/60">Manage claims for items you reported</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-2 border shadow-sm stats bg-base-100 rounded-2xl border-base-200">
                        <div className="p-0 stat">
                            <div className="text-xs stat-title text-base-content/50">Active Claims</div>
                            <div className="text-2xl stat-value text-primary">{claims.length}</div>
                        </div>
                    </div>
                </div>
            </header>
            
            {claims.length === 0 ? (
                <div className="p-10 border-2 border-dashed hero bg-base-200 rounded-3xl border-base-300">
                    <div className="flex-col text-center hero-content">
                        <ClipboardList className="text-base-content/20" size={64} />
                        <div className="max-w-md">
                            <h2 className="text-xl font-bold opacity-60">No pending claims</h2>
                            <p className="py-2 opacity-50">Claims for your found or lost items will appear here.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {claims.map(claim => (
                        <div key={claim._id} className="overflow-hidden transition-all border shadow-sm card bg-base-100 border-base-200 hover:shadow-md">
                            <div className="flex flex-col md:flex-row">
                                {/* Item Thumbnail */}
                                <div className="w-full h-48 md:w-48 md:h-auto bg-base-300">
                                    <img 
                                        src={claim.item?.image} 
                                        alt={claim.item?.title} 
                                        className="object-cover w-full h-full"
                                    />
                                </div>

                                <div className="flex-1 p-6">
                                    <div className="flex flex-col justify-between h-full gap-4 lg:flex-row lg:items-start">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold uppercase">{claim.item?.title}</h3>
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase shadow-lg badge ${claim.item?.itemType === 'LOST' ? 'badge-error' : 'badge-success'} border-none text-white`}>{claim.item?.itemType}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="avatar placeholder">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral text-neutral-content">
                                                        <span className="text-xs">{claim.claimant?.fullName?.[0] || 'U'}</span>
                                                    </div>
                                                </div>
                                                <span className="opacity-70 text-base-content">
                                                    Claimed by <span className="font-bold">{claim.claimant?.fullName}</span>
                                                </span>
                                            </div>

                                            <div className="p-4 border rounded-xl bg-base-200/50 border-base-300">
                                                <p className="text-[10px] font-black uppercase text-primary mb-1">Claim Verification Answer:</p>
                                                <p className="italic text-base-content italic-font">"{claim.answer}"</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:justify-center">
                                            <button 
                                                onClick={() => handleStartChat(claim._id)}
                                                className="flex-1 gap-2 btn btn-primary btn-md lg:w-44"
                                            >
                                                <MessageCircle size={18} />
                                                Chat
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleMarkAsReturned(claim.item._id)}
                                                className="flex-1 gap-2 btn btn-success btn-outline btn-md lg:w-44"
                                            >
                                                <CheckCircle2 size={18} />
                                                Resolved
                                            </button>

                                            <button 
                                                onClick={() => handleDeleteClaim(claim._id)}
                                                className="gap-2 btn btn-ghost text-error btn-md lg:w-44"
                                            >
                                                <Trash2 size={18} />
                                                Delete Claim
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;