import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Camera, Send, HelpCircle } from 'lucide-react';

const ReportItem = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
    }, [navigate]);

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        itemType: 'LOST',
        category: '',
        claimQuestion: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            alert("Please select an image first.");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append("file", image);
            
            const PRESET_NAME = import.meta.env.VITE_CLOUDINARY_PRESET_NAME;
            const API_URL = import.meta.env.VITE_CLOUDINARY_API_URL;
            
            data.append("upload_preset", PRESET_NAME); 

            // Upload to Cloudinary
            const cloudRes = await fetch(API_URL, {
                method: "POST",
                body: data
            });
            
            if (!cloudRes.ok) {
                const errorData = await cloudRes.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Cloudinary upload failed with status ${cloudRes.status}`);
            }
            
            const cloudData = await cloudRes.json();
            const imageUrl = cloudData.secure_url;
            const aiTagsFromCloud = cloudData.tags || [];

            const savedUser = localStorage.getItem('user');
            if (!savedUser) {
                throw new Error("User session not found. Please log in again.");
            }
            const userData = JSON.parse(savedUser);

            const finalData = { 
                title: formData.title,
                description: formData.description,
                location: formData.location,
                itemType: formData.itemType,
                category: formData.category,
                image: imageUrl,
                owner: userData._id,
                
                claimQuestion: formData.itemType === 'FOUND' ? formData.claimQuestion : undefined,
                
                aiTags: [...new Set([...aiTagsFromCloud, formData.category?.toLowerCase()])]
                    .filter(Boolean)
            };

            await apiClient.post('/items', finalData);
            navigate('/'); 

        } catch (error) {
            console.error("Submission error details:", error);
            alert(error.message || "Failed to report item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen px-4 py-12 transition-colors duration-300 bg-base-200">
            <div className="max-w-2xl mx-auto border shadow-xl card bg-base-100 border-base-300">
                <div className="p-8 card-body">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-black tracking-tight text-base-content">Report an Item</h2>
                        <p className="mt-1 font-medium text-base-content/60">Help your campus community find what they lost.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Custom Image Upload Area */}
                        <div className={`group relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 bg-base-200/50 
                            ${image ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary'}`}>
                            <input 
                                type="file" required 
                                onChange={(e) => setImage(e.target.files[0])} 
                                className="hidden" id="imageInput" accept="image/*"
                            />
                            <label htmlFor="imageInput" className="flex flex-col items-center cursor-pointer">
                                <div className={`p-4 rounded-full mb-3 transition-colors ${image ? 'bg-primary text-white' : 'bg-base-300 text-base-content/40 group-hover:bg-primary group-hover:text-white'}`}>
                                    <Camera size={32} />
                                </div>
                                <span className="text-sm font-black tracking-widest uppercase opacity-60">
                                    {image ? "Image Selected" : "Upload Item Photo"}
                                </span>
                                <p className="mt-1 text-xs text-base-content/40">
                                    {image ? image.name : "PNG, JPG or WEBP (Max 5MB)"}
                                </p>
                            </label>
                        </div>

                        {/* Selectors */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="w-full form-control">
                                <label className="label"><span className="font-bold label-text">Report Type</span></label>
                                <select 
                                    className="w-full font-medium select select-bordered select-primary bg-base-200 rounded-2xl"
                                    value={formData.itemType}
                                    onChange={(e) => setFormData({...formData, itemType: e.target.value})}
                                >
                                    <option value="LOST">I Lost Something</option>
                                    <option value="FOUND">I Found Something</option>
                                </select>
                            </div>

                            <div className="w-full form-control">
                                <label className="label"><span className="font-bold label-text">Category</span></label>
                                <select 
                                    required
                                    className="w-full font-medium select select-bordered select-primary bg-base-200 rounded-2xl"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="" disabled>Select Category</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Documents">Documents</option>
                                    <option value="Accessories">Accessories</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Books">Books</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Text Inputs */}
                        <div className="form-control">
                            <label className="label"><span className="font-bold label-text">Item Title</span></label>
                            <input 
                                type="text" placeholder="e.g., Blue HydroFlask Bottle" required
                                className="w-full transition-all input input-bordered input-primary bg-base-200 rounded-2xl"
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="font-bold label-text">Detailed Description</span></label>
                            <textarea 
                                placeholder="Provide specific details (scratches, stickers, etc.)" required
                                className="w-full leading-relaxed transition-all textarea textarea-bordered textarea-primary bg-base-200 h-28 rounded-2xl"
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="font-bold label-text">Last Seen Location</span></label>
                            <input 
                                type="text" placeholder="e.g., Library 3rd Floor" required
                                className="w-full transition-all input input-bordered input-primary bg-base-200 rounded-2xl"
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                        </div>

                        {/* Conditional Verification Question */}
                        {formData.itemType === 'FOUND' && (
                            <div className="p-6 duration-300 alert bg-primary/10 border-primary/20 rounded-3xl animate-in slide-in-from-top">
                                <div className="w-full space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase text-primary">
                                        <HelpCircle size={16} /> Verification Question
                                    </div>
                                    <p className="text-xs italic text-base-content/60">Ask a question that only the true owner can answer.</p>
                                    <input 
                                        type="text" required
                                        placeholder="e.g., What is the lock screen wallpaper?"
                                        className="w-full input input-bordered input-primary bg-base-100 rounded-2xl"
                                        onChange={(e) => setFormData({...formData, claimQuestion: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button 
                                disabled={loading}
                                className="font-black tracking-widest text-white uppercase shadow-xl btn btn-primary btn-block btn-lg rounded-2xl shadow-primary/20"
                            >
                                {loading ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    <>
                                        <Send size={18} className="mr-2" />
                                        Submit Report
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportItem;