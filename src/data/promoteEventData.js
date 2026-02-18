export const promoteEventSteps = [
    { id: 1, label: "Details", desc: "Event name & category" },
    { id: 2, label: "Media", desc: "Banner & images" },
    { id: 3, label: "Tickets", desc: "Pricing & availability" },
    { id: 4, label: "Schedule", desc: "Dates & timing" },
    { id: 5, label: "Promote", desc: "Optional boost" },
    { id: 6, label: "Review", desc: "Final verification" }
];

export const initialPromoteEventState = {
    eventName: "",
    category: "Music",
    privacy: "public",
    startDate: "",
    endDate: "",
    address: "",
    lat: null,
    lng: null,
    totalCapacity: "",
    ticketType: "paid", // "paid" or "free"
    tickets: [],
    banner: null,
    promotions: {
        featured: false,
        email: false,
        social: false,
        insights: false,
        budget: 0
    }
};

export const eventCategories = [
    'Music', 
    'Art & Culture', 
    'Food & Drink', 
    'Nightlife', 
    'Wellness',
    'Technology',
    'Conferences',
    'Sports'
];
export const promotePrices = {
    featured: 500,
    email: 250,
    social: 150,
    insights: 100
};
