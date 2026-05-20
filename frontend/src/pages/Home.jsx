import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios.js';
import ItemCard from '../components/ItemCard.jsx';
import { Search, Loader2, PackageSearch } from 'lucide-react';

const Home = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await apiClient.get('/items');
                setItems(response.data.data || []);
            } catch (error) {
                console.error("Error fetching items:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const filteredItems = items.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.aiTags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen transition-colors duration-300 bg-base-200">
            {/* Hero Section */}
            <header className="py-12 border-b hero bg-base-100 border-base-300">
                <div className="text-center hero-content">
                    <div className="max-w-2xl">
                        <h1 className="mb-4 text-4xl font-black md:text-5xl">
                            Campus <span className="text-primary">Lost & Found</span>
                        </h1>
                        <p className="max-w-lg mx-auto mb-8 text-base-content/70">
                            The smartest way to reconnect with your belongings. 
                            Search the registry, report findings, and recover what's yours.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-xl mx-auto form-control">
                            <div className="relative group">
                                <Search 
                                    className="absolute transition-colors -translate-y-1/2 left-4 top-1/2 text-base-content/40 group-focus-within:text-primary" 
                                    size={20} 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Search items, categories, or tags..." 
                                    className="w-full pl-12 transition-all shadow-sm input input-bordered input-lg rounded-2xl bg-base-200 focus:input-primary"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Items Grid */}
            <main className="px-6 py-12 mx-auto max-w-7xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-24">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="font-medium text-base-content/60 animate-pulse">
                            Scanning campus registry...
                        </p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredItems.map(item => (
                            <ItemCard key={item._id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 border shadow-inner hero bg-base-100 rounded-3xl border-base-300">
                        <div className="flex-col text-center hero-content">
                            <div className="p-6 mb-4 rounded-full bg-base-200">
                                <PackageSearch className="text-base-content/20" size={50} />
                            </div>
                            <h3 className="text-2xl font-bold opacity-70">No matches found</h3>
                            <p className="max-w-xs text-base-content/50">
                                Try different keywords or browse all categories to find what you're looking for.
                            </p>
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="mt-4 rounded-lg btn btn-outline btn-primary btn-sm"
                            >
                                Clear Search
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;