import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { Package, MessageCircle, Clock, Trash2, Lock } from 'lucide-react';

const MyClaims = () => {
    const navigate = useNavigate();
    const [myClaims, setMyClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMyClaims();
    }, []);

    const fetchMyClaims = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const userId = userData?._id;

            if (!userId) {
                setError("Please login to view your claims.");
                setLoading(false);
                return;
            }

            const res = await apiClient.get(`/claims/user/${userId}`);
            setMyClaims(res.data.data || []);
        } catch (err) {
            console.error("Error fetching my claims:", err);
            setError("Failed to load your claims.");
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawClaim = async (claimId) => {
        if (!window.confirm("Do you want to withdraw this claim?")) return;
        try {
            await apiClient.delete(`/claims/${claimId}`);
            setMyClaims(prev => prev.filter(c => c._id !== claimId));
        } catch (err) {
            console.error("Withdraw error:", err);
            alert("Failed to withdraw claim.");
        }
    };

    const goToChat = (claimId) => {
        navigate('/chat', { 
            state: { activeClaimId: claimId } 
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-xs font-bold tracking-widest uppercase opacity-40">Loading your claims...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <div className="p-4 mb-4 rounded-full bg-error/10 text-error">
                    <Package size={48} />
                </div>
                <h2 className="text-xl font-bold tracking-tight uppercase">{error}</h2>
                <button onClick={() => navigate('/login')} className="px-8 mt-4 font-black uppercase btn btn-primary rounded-xl">Login Now</button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl p-6 mx-auto duration-500 animate-in fade-in">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                        <Package size={24} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight uppercase text-base-content">My Claims</h1>
                </div>
                <p className="font-medium text-base-content/60">
                    Track items you've claimed. You can chat once the reporter initiates the conversation.
                </p>
            </header>

            {myClaims.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed bg-base-200/50 rounded-3xl border-base-300">
                    <Package size={80} className="mb-4 opacity-10" />
                    <h2 className="text-2xl font-bold tracking-widest uppercase opacity-40">No claims found</h2>
                    <button 
                        onClick={() => navigate('/')} 
                        className="mt-6 font-black uppercase shadow-lg btn btn-primary btn-wide rounded-2xl shadow-primary/20"
                    >
                        Browse Items
                    </button>
                </div>
            ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {myClaims.map((claim) => (
                        <div key={claim._id} className="overflow-hidden transition-all border shadow-md group hover:shadow-2xl card bg-base-100 border-base-200 hover:-translate-y-1 rounded-3xl">
                            <figure className="relative h-48 overflow-hidden">
                                <img 
                                    src={claim.item?.image || 'https://via.placeholder.com/400x300?text=No+Image'} 
                                    alt={claim.item?.title} 
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-3 left-3">
                                    <div className={`px-3 py-1 text-[10px] font-black uppercase shadow-lg badge ${claim.item?.itemType === 'Lost' ? 'badge-error' : 'badge-success'} border-none text-white`}>
                                        {claim.item?.itemType}
                                    </div>
                                </div>
                            </figure>

                            <div className="p-6 card-body">
                                <h2 className="text-xl font-black uppercase card-title text-base-content line-clamp-1">
                                    {claim.item?.title}
                                </h2>
                                
                                <div className="flex items-center gap-2 mt-1 mb-4 text-[11px] font-bold uppercase opacity-50">
                                    <Clock size={14} />
                                    Claimed on {new Date(claim.createdAt).toLocaleDateString()}
                                </div>

                                <div className="p-4 mb-6 text-sm border rounded-2xl bg-base-200/30 border-base-300">
                                    <p className="mb-1 text-[10px] font-black uppercase text-primary tracking-tighter">Verification Answer:</p>
                                    <p className="italic leading-relaxed opacity-80 line-clamp-2">"{claim.answer}"</p>
                                </div>

                                <div className="flex flex-col gap-2 mt-auto card-actions">
                                    {/* DISABLED BUTTON */}
                                    {claim.status === "APPROVED" ? (
                                        <button 
                                            onClick={() => goToChat(claim._id)}
                                            className="flex-1 gap-2 font-black uppercase shadow-md btn btn-primary rounded-xl"
                                        >
                                            <MessageCircle size={20} />
                                            Open Messages
                                        </button>
                                    ) : (
                                        <div className="w-full tooltip tooltip-top" data-tip={claim.status === "REJECTED" ? "Claim Rejected" : "Waiting for reporter..."}>
                                            <button 
                                                disabled
                                                className="w-full gap-2 font-black uppercase btn btn-disabled rounded-xl opacity-60"
                                            >
                                                <Lock size={18} />
                                                {claim.status === "REJECTED" ? "Rejected" : "Chat Locked"}
                                            </button>
                                        </div>
                                    )}
                                    
                                    <button 
                                        onClick={() => handleWithdrawClaim(claim._id)}
                                        className="gap-2 font-bold transition-colors btn btn-ghost btn-sm text-error/60 hover:text-error hover:bg-error/10 rounded-xl"
                                    >
                                        <Trash2 size={16} />
                                        Withdraw Claim
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyClaims;