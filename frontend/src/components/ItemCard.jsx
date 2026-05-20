import React from 'react';
import { MapPin, Calendar, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ItemCard = ({ item }) => {
    const isLost = item.itemType === 'LOST';

    return (
        <div className="overflow-hidden transition-all duration-300 border shadow-sm card bg-base-100 border-base-200 hover:shadow-md group">
            {/* Image Section */}
            <figure className="relative w-full overflow-hidden bg-base-200" style={{ height: '260px' }}>
                <img
                    src={item.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={item.title}
                    className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase text-white ${
                    isLost ? 'bg-error' : 'bg-success'
                }`}>
                    {item.itemType}
                </div>
            </figure>

            {/* Content Section */}
            <div className="p-5 card-body">
                {/* Header */}
                <div className="grid grid-cols-[1fr_auto] gap-2 items-start mb-2">
                    <h3 className="text-lg font-bold leading-tight uppercase break-words card-title">
                        {item.title}
                    </h3>
                    <div className="badge badge-outline badge-primary text-[10px] uppercase font-bold px-2 py-1 shrink-0">
                        {item.category}
                    </div>
                </div>

                <p className="h-10 mb-4 text-sm text-base-content/70 line-clamp-2">
                    {item.description}
                </p>

                <div className="pt-4 space-y-2 border-t border-base-200">
                    <div className="flex items-center text-xs text-base-content/60">
                        <MapPin size={14} className="mr-2 text-primary shrink-0" />
                        <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center text-xs text-base-content/60">
                        <Calendar size={14} className="mr-2 text-primary shrink-0" />
                        {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                </div>

                {/* AI Tags Section */}
                <div className="flex flex-wrap gap-2 mt-4">
                    {item.aiTags?.slice(0, 3).map((tag, index) => (
                        <div key={index} className="flex items-center text-[10px] opacity-50">
                            <Tag size={10} className="mr-1" /> {tag}
                        </div>
                    ))}
                </div>

                <div className="mt-5 card-actions">
                    <Link to={`/item/${item._id}`} className="w-full">
                        <button className="btn btn-primary btn-outline btn-block rounded-xl group">
                            View Details
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;