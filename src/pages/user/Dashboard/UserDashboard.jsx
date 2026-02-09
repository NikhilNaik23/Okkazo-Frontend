import React from "react";
import { popularEvents, allEvents } from "../../../data/eventsData";
import HeroSlider from "../../../components/User/Dashboard/HeroSlider";
import EventRow from "../../../components/User/Dashboard/EventRow";

// --- Main Dashboard ---

const UserDashboard = () => {
    // Grouping events
    const topTenEvents = allEvents.slice(0, 10);
    const musicEvents = allEvents.filter(e => ['Music', 'Concert', 'Festival', 'Entertainment'].includes(e.tag));
    const businessEvents = allEvents.filter(e => ['Business', 'Tech', 'Conference', 'Workshop'].includes(e.tag));
    const creativeEvents = allEvents.filter(e => ['Art', 'Arts', 'Painting', 'Photography'].includes(e.tag));

    return (
        <div className="min-h-screen bg-[#EBF4F6] pb-20 overflow-x-hidden overflow-y-hidden">
            {/* Hero Section */}
            <HeroSlider events={popularEvents} />

            {/* Content Stacks */}
            <div className="relative z-30 space-y-8 px-4 md:px-8 mt-8 pb-12">
                <EventRow title="Top 10 Trending Events Near You" events={topTenEvents} isTopTen={true} />
                <EventRow title="Music & Entertainment" events={musicEvents} />
                <EventRow title="Business & Technology" events={businessEvents} />
                <EventRow title="Creative Arts & Culture" events={creativeEvents} />

                {/* "Because you watched..." style recommendation but statically named for now */}
                <EventRow title="Recommended for You" events={[...allEvents].reverse().slice(0, 8)} />
            </div>
        </div>
    );
};

export default UserDashboard;
