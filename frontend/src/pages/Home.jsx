import React, { useEffect, useState } from 'react';
import apiClient from '../api/axios.js';
import ItemCard from '../components/ItemCard.jsx';
import { Search, Loader2, PackageSearch, X } from 'lucide-react';

// Debounce helper — waits until user stops typing before firing the API call
// This prevents a request on every single keystroke
const useDebounce = (value, delay) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
};

const CATEGORIES = ["Electronics", "Books", "Accessories", "Clothing", "Documents", "Other"];

const Home = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeType, setActiveType] = useState("");       // "" | "LOST" | "FOUND"
    const [activeCategory, setActiveCategory] = useState(""); // "" | category string

    // Debounce the raw searchTerm by 400ms
    // So API is only called 400ms after user stops typing
    const debouncedSearch = useDebounce(searchTerm, 400);

    // Fetch all items on first load (no filters)
    useEffect(() => {
        const fetchAllItems = async () => {
            try {
                const response = await apiClient.get('/items');
                setItems(response.data.data || []);
            } catch (error) {
                console.error("Error fetching items:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllItems();
    }, []);

    // Re-run search whenever debounced query, itemType, or category changes
    useEffect(() => {
        // If all filters are empty, restore full list without calling /search
        if (!debouncedSearch.trim() && !activeType && !activeCategory) {
            const fetchAllItems = async () => {
                setSearching(true);
                try {
                    const response = await apiClient.get('/items');
                    setItems(response.data.data || []);
                } catch (error) {
                    console.error("Error fetching items:", error);
                } finally {
                    setSearching(false);
                }
            };
            fetchAllItems();
            return;
        }

        // Build query string from whatever filters are active
        const params = new URLSearchParams();
        if (debouncedSearch.trim()) params.append('q', debouncedSearch.trim());
        if (activeType) params.append('itemType', activeType);
        if (activeCategory) params.append('category', activeCategory);

        const runSearch = async () => {
            setSearching(true);
            try {
                const response = await apiClient.get(`/items/search?${params.toString()}`);
                setItems(response.data.data || []);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setSearching(false);
            }
        };

        runSearch();
    }, [debouncedSearch, activeType, activeCategory]);

    const handleClearAll = () => {
        setSearchTerm("");
        setActiveType("");
        setActiveCategory("");
    };

    const isFiltering = searchTerm || activeType || activeCategory;

    return (
        <div className="min-h-screen transition-colors duration-300 bg-base-200">

            {/* Hero + Search */}
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
                                    value={searchTerm}
                                    placeholder="Search items, categories, or AI tags..."
                                    className="w-full pl-12 pr-10 transition-all shadow-sm input input-bordered input-lg rounded-2xl bg-base-200 focus:input-primary"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {/* Clear button — only shown when something is typed */}
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute -translate-y-1/2 right-4 top-1/2 text-base-content/40 hover:text-base-content"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex flex-wrap justify-center gap-2 mt-5">
                            {/* LOST / FOUND toggle */}
                            {["LOST", "FOUND"].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setActiveType(prev => prev === type ? "" : type)}
                                    className={`btn btn-sm rounded-xl font-bold ${
                                        activeType === type
                                            ? "btn-primary"
                                            : "btn-outline btn-primary opacity-60"
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}

                            <div className="w-px mx-1 bg-base-300" />

                            {/* Category filters */}
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(prev => prev === cat ? "" : cat)}
                                    className={`btn btn-sm rounded-xl font-bold ${
                                        activeCategory === cat
                                            ? "btn-secondary"
                                            : "btn-ghost opacity-60 hover:opacity-100"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Results */}
            <main className="px-6 py-12 mx-auto max-w-7xl">

                {/* Result count + clear */}
                {!loading && isFiltering && (
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm font-bold text-base-content/50">
                            {searching ? "Searching..." : `${items.length} result${items.length !== 1 ? 's' : ''} found`}
                        </p>
                        <button
                            onClick={handleClearAll}
                            className="text-xs font-bold btn btn-ghost btn-sm text-primary"
                        >
                            <X size={14} /> Clear all filters
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-24">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="font-medium text-base-content/60 animate-pulse">
                            Scanning campus registry...
                        </p>
                    </div>
                ) : searching ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-24">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="font-medium text-base-content/60 animate-pulse">
                            Searching...
                        </p>
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map(item => (
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
                                Try different keywords or browse all categories.
                            </p>
                            <button
                                onClick={handleClearAll}
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