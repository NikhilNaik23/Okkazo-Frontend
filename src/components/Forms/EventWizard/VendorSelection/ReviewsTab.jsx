import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BsChevronLeft, BsChevronRight, BsStarFill } from 'react-icons/bs';
import { generateReviews } from '../../../../data/vendorSelectionData';

const ReviewsTab = ({ vendor }) => {
    const [page, setPage] = useState(1);
    const PER_PAGE = 3;

    // Mock Reviews Data
    const reviews = useMemo(() => generateReviews(42), []);

    const totalPages = Math.ceil(reviews.length / PER_PAGE);
    const currentReviews = reviews.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <motion.div
            key="Reviews"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 flex flex-col p-10"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-serif-premium text-primary">Client Experiences</h3>
                    <p className="text-gray-400 text-xs font-bold mt-2">Total Reviews: <span className="text-primary">{reviews.length}</span></p>
                </div>
                <div className="flex items-center gap-2 text-amber-400 bg-amber-50 px-4 py-2 rounded-full">
                    <span className="text-lg font-bold text-primary">{vendor.rating}</span>
                    <div className="flex text-xs"><BsStarFill /><BsStarFill /><BsStarFill /><BsStarFill /><BsStarFill className="text-amber-200" /></div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                {currentReviews.map(review => (
                    <div key={review.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold uppercase">
                                    {review.user.substring(0, 1)}
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-primary uppercase tracking-wider">{review.user}</h5>
                                    <span className="text-[10px] text-gray-400">{review.date}</span>
                                </div>
                            </div>
                            <div className="flex text-amber-400 text-[9px] gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <BsStarFill key={i} className={i < Math.floor(review.rating) ? "" : "text-gray-200"} />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed font-light">"{review.text}"</p>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-primary hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary transition-all"
                    >
                        <BsChevronLeft size={10} />
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-primary hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary transition-all"
                    >
                        <BsChevronRight size={10} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ReviewsTab;
