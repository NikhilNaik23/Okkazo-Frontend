import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BsChevronLeft, BsChevronRight, BsStarFill } from 'react-icons/bs';

const ReviewsTab = ({ vendor }) => {
    const [page, setPage] = useState(1);
    const PER_PAGE = 3;

    const reviews = useMemo(() => {
        const backendRows = Array.isArray(vendor?.reviewEntries)
            ? vendor.reviewEntries
            : [];

        return backendRows.map((row, index) => {
            const rawRating = Number(row?.rating);
            const rating = Number.isFinite(rawRating)
                ? Math.max(1, Math.min(5, Math.round(rawRating)))
                : 0;

            const reviewText = String(row?.review || row?.text || '').trim();
            const submittedAt = row?.submittedAt ? new Date(row.submittedAt) : null;
            const dateLabel = submittedAt && !Number.isNaN(submittedAt.getTime())
                ? submittedAt.toLocaleDateString('en-IN')
                : 'Recent';

            return {
                id: row?.id || `${vendor?.vendorAuthId || 'review'}-${index + 1}`,
                user: String(row?.user || row?.reviewerName || 'Client').trim() || 'Client',
                date: dateLabel,
                rating,
                text: reviewText,
            };
        }).filter((row) => row.rating > 0 && row.text);
    }, [vendor?.reviewEntries, vendor?.vendorAuthId]);

    const averageRating = useMemo(() => {
        const summaryAverage = Number(vendor?.reviewSummary?.averageRating);
        if (Number.isFinite(summaryAverage) && summaryAverage > 0) {
            return Number(summaryAverage.toFixed(1));
        }

        if (reviews.length > 0) {
            const avg = reviews.reduce((sum, row) => sum + Number(row.rating || 0), 0) / reviews.length;
            return Number(avg.toFixed(1));
        }

        const fallback = Number(vendor?.rating);
        return Number.isFinite(fallback) ? Number(fallback.toFixed(1)) : 0;
    }, [reviews, vendor?.rating, vendor?.reviewSummary?.averageRating]);

    const totalReviewCount = useMemo(() => {
        const summaryCount = Number(vendor?.reviewSummary?.totalReviews);
        if (Number.isFinite(summaryCount) && summaryCount >= 0) {
            return summaryCount;
        }

        const reviewCount = Number(vendor?.reviewCount ?? vendor?.reviews);
        if (Number.isFinite(reviewCount) && reviewCount >= 0) {
            return reviewCount;
        }

        return reviews.length;
    }, [reviews.length, vendor?.reviewCount, vendor?.reviewSummary?.totalReviews, vendor?.reviews]);

    useEffect(() => {
        setPage(1);
    }, [vendor?.vendorAuthId, vendor?.serviceId, reviews.length]);

    const totalPages = Math.max(1, Math.ceil(reviews.length / PER_PAGE));
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
                    <p className="text-gray-400 text-xs font-bold mt-2">Total Reviews: <span className="text-primary">{totalReviewCount}</span></p>
                </div>
                <div className="flex items-center gap-2 text-amber-400 bg-amber-50 px-4 py-2 rounded-full">
                    <span className="text-lg font-bold text-primary">{averageRating.toFixed(1)}</span>
                    <div className="flex text-xs">
                        {[...Array(5)].map((_, i) => (
                            <BsStarFill key={`avg-star-${i}`} className={i < Math.floor(averageRating) ? '' : 'text-amber-200'} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                {reviews.length === 0 && (
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                        <p className="text-gray-500 text-sm font-medium">No customer reviews yet for this service.</p>
                    </div>
                )}

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
