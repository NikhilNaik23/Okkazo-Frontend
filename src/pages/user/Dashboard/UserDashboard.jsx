import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { popularEvents, allEvents } from "../../../data/eventsData";
import HeroSlider from "../../../components/User/Dashboard/HeroSlider";
import EventRow from "../../../components/User/Dashboard/EventRow";

// --- Main Dashboard ---

const UserDashboard = () => {
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get("search")?.toLowerCase() || "";

    // Grouping events with Search Filter
    // We filter the source 'allEvents' first if there is a search query
    // This allows the search to work across all categories.

    const filteredAllEvents = useMemo(() => {
        if (!searchQuery) return allEvents;

        return allEvents.filter(e =>
            e.title.toLowerCase().includes(searchQuery) ||
            e.tag.toLowerCase().includes(searchQuery) ||
            e.location.toLowerCase().includes(searchQuery)
        );
    }, [searchQuery]);

    // Derive categories from the filtered list
    // Note: If a search is active, "Top 10" will just be "Top 10 of matches" which makes sense.
    const topTenEvents = filteredAllEvents.slice(0, 10);
    const musicEvents = filteredAllEvents.filter(e => ['Music', 'Concert', 'Festival', 'Entertainment'].includes(e.tag));
    const businessEvents = filteredAllEvents.filter(e => ['Business', 'Tech', 'Conference', 'Workshop'].includes(e.tag));
    const creativeEvents = filteredAllEvents.filter(e => ['Art', 'Arts', 'Painting', 'Photography'].includes(e.tag));

    // Recommended
    const recommendedEvents = [...filteredAllEvents].reverse().slice(0, 8);

    const hasResults = filteredAllEvents.length > 0;

    return (
        <div className="bg-[#EBF4F6] pb-20 overflow-x-hidden overflow-y-hidden">
            {/* Hero Section - Hide if searching to focus on results? Or keep it? 
                Let's keep it but maybe only if no search logic is active? 
                Actually, usually dashboard search replaces the "browse" experience.
                Let's hide HeroSlider if searching to bring results up.
            */}
            {!searchQuery && <HeroSlider events={popularEvents} />}

            {/* Content Stacks */}
            <div className={`relative z-30 space-y-8 px-4 md:px-8 pb-12 ${searchQuery ? "mt-28" : "mt-8"}`}>

                {searchQuery && (
                    <div className="mb-8">
                        <h2 className="text-3xl font-serif-premium text-[#09637E] italic">
                            Search Results for "{searchQuery}"
                        </h2>
                        <p className="text-sm text-[#09637E]/60 uppercase tracking-widest mt-2">
                            Found {filteredAllEvents.length} events
                        </p>
                    </div>
                )}

                {hasResults ? (
                    <>
                        {topTenEvents.length > 0 && <EventRow title={searchQuery ? "Top Matches" : "Top 10 Trending Events Near You"} events={topTenEvents} isTopTen={!searchQuery} />}
                        {musicEvents.length > 0 && <EventRow title="Music & Entertainment" events={musicEvents} />}
                        {businessEvents.length > 0 && <EventRow title="Business & Technology" events={businessEvents} />}
                        {creativeEvents.length > 0 && <EventRow title="Creative Arts & Culture" events={creativeEvents} />}

                        {recommendedEvents.length > 0 && <EventRow title={searchQuery ? "More Results" : "Recommended for You"} events={recommendedEvents} />}
                    </>
                ) : (
                    <div className="text-center py-20 opacity-50">
                        <p className="font-serif-premium text-2xl text-[#09637E]">No events found.</p>
                        <p className="text-sm font-medium mt-2 text-[#09637E]/60">Try adjusting your search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
