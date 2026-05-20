import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import { MapPin, Calendar, ShieldCheck, X, Send, AlertCircle, Clock } from 'lucide-react';

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [claimData, setClaimData] = useState({ answer: "" });
    const [submitting, setSubmitting] = useState(false);
    const [hasAlreadyClaimed, setHasAlreadyClaimed] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchItemData = async () => {
            try {
                const res = await apiClient.get(`/items/${id}`);
                setItem(res.data.data);

                if (currentUser) {
                    const claimsRes = await apiClient.get(`/claims/my-items/${currentUser._id}`);
                    const existingClaim = claimsRes.data.data.find(c => c.item?._id === id);
                    if (existingClaim) setHasAlreadyClaimed(true);
                }
            } catch (err) {
                console.error("Error fetching item details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchItemData();
    }, [id, currentUser?._id, currentUser]);

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        if (!token) { navigate('/login'); return; }
        
        setSubmitting(true);
        try {
            await apiClient.post('/claims', {
                item: id,
                claimant: currentUser._id,
                answer: claimData.answer
            });
            setShowModal(false);
            setHasAlreadyClaimed(true);
            alert("Claim submitted successfully! The owner will review it in their dashboard.");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit claim.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl p-6 mx-auto space-y-8 animate-pulse">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="w-full skeleton h-96 rounded-3xl"></div>
                    <div className="space-y-4">
                        <div className="w-20 h-4 skeleton"></div>
                        <div className="w-full h-10 skeleton"></div>
                        <div className="w-full h-24 skeleton"></div>
                        <div className="w-full h-12 skeleton"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!item) return <div className="py-20 text-xl font-bold text-center opacity-50">Item not found.</div>;

    const isOwner = currentUser?._id === item.owner?._id;

    return (
        <div className="max-w-4xl p-6 mx-auto transition-colors duration-300">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">

                {/* Left: Image */}
                <div className="relative w-full overflow-hidden bg-base-200 rounded-3xl group" style={{ height: '420px' }}>
                    <img
                        src={item.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                        alt={item.title}
                        className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase text-white ${
                        item.itemType === 'LOST' ? 'bg-error' : 'bg-success'
                    }`}>
                        {item.itemType}
                    </div>
                </div>

                {/* Right: Details */}
                <div className="flex flex-col">
                    <div className="mb-6">
                        <h1 className="mb-2 text-4xl font-black tracking-tight capitalize text-base-content">{item.title}</h1>
                        <div className="font-bold badge badge-primary badge-outline">{item.category || 'General'}</div>
                    </div>

                    <div className="flex items-center gap-4 p-4 mb-8 border bg-base-200 rounded-2xl border-base-300">
                        <div className="flex items-center justify-center w-12 h-12 text-lg font-bold rounded-full shadow-lg bg-primary text-primary-content shrink-0">
                            {item.owner?.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest opacity-70">Posted By</p>
                            <p className="font-bold text-base-content">{item.owner?.fullName}</p>
                        </div>
                    </div>

                    <div className="mb-8 space-y-4 text-base-content/70">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-base-200 text-primary"><MapPin size={18}/></div>
                            <span className="font-medium">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-base-200 text-primary"><Calendar size={18}/></div>
                            <span className="font-medium">{new Date(item.createdAt).toDateString()}</span>
                        </div>
                    </div>

                    <div className="pt-6 mb-8 border-t border-base-300">
                        <h3 className="mb-3 text-xs font-black tracking-widest uppercase text-base-content/40">Description</h3>
                        <p className="text-lg italic leading-relaxed text-base-content/80">"{item.description}"</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto">
                        {!token ? (
                            <button onClick={() => navigate('/login')} className="btn btn-neutral btn-block btn-lg rounded-2xl">
                                Login to Claim
                            </button>
                        ) : isOwner ? (
                            <div className="shadow-sm alert alert-warning rounded-2xl bg-warning/10 border-warning/20">
                                <AlertCircle size={20} />
                                <span className="text-sm font-bold">You posted this. Check your dashboard for claims!</span>
                            </div>
                        ) : hasAlreadyClaimed ? (
                            <div className="shadow-sm alert alert-info rounded-2xl bg-info/10 border-info/20">
                                <Clock size={20} />
                                <span className="text-sm font-bold">Claim already submitted. Waiting for owner's response.</span>
                            </div>
                        ) : (
                            <button onClick={() => setShowModal(true)} className="shadow-xl btn btn-primary btn-block btn-lg rounded-2xl shadow-primary/20 group">
                                <ShieldCheck size={20} className="transition-transform group-hover:scale-110" />
                                Claim This Item
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Claim Modal */}
            {showModal && (
                <div className="modal modal-open modal-bottom sm:modal-middle">
                    <div className="relative p-8 border modal-box bg-base-100 border-base-300 rounded-3xl">
                        <button onClick={() => setShowModal(false)} className="absolute btn btn-sm btn-circle btn-ghost right-4 top-4">
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="p-4 mb-4 rounded-full bg-primary/10 text-primary">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-2xl font-black">Prove Ownership</h2>
                            <p className="mt-2 text-base-content/60">
                                {item.itemType === 'FOUND'
                                    ? `The finder asked: "${item.claimQuestion || 'Please provide details to verify ownership.'}"`
                                    : "Describe a specific detail only the owner would know."
                                }
                            </p>
                        </div>
                        <form onSubmit={handleClaimSubmit} className="space-y-6">
                            <textarea
                                required
                                placeholder="Your detailed response..."
                                className="w-full h-32 font-medium transition-all textarea textarea-bordered textarea-primary rounded-2xl bg-base-200 focus:bg-base-100"
                                onChange={(e) => setClaimData({ ...claimData, answer: e.target.value })}
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn btn-primary btn-block btn-lg rounded-2xl"
                            >
                                {submitting ? <span className="loading loading-spinner"></span> : <Send size={18} />}
                                {submitting ? "Processing..." : "Submit Claim Request"}
                            </button>
                        </form>
                    </div>
                    <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                </div>
            )}
        </div>
    );
};

export default ItemDetail;