export const promoteEventSteps = [
    { id: 1, label: "Details", desc: "Event name & category" },
    { id: 2, label: "Media", desc: "Banner & images" },
    { id: 3, label: "Tickets", desc: "Pricing & availability" },
    { id: 4, label: "Schedule", desc: "Dates & timing" },
    { id: 5, label: "Promote", desc: "Optional boost" },
    { id: 6, label: "Verify", desc: "Authenticity & Permissions" },
    { id: 7, label: "Review", desc: "Final verification" }
];

export const initialPromoteEventState = {
    eventName: "",
    eventDescription: "",
    category: "Concert",
    customCategory: "",
    privacy: "public",
    startDate: "",
    endDate: "",
    ticketReleaseDate: "",
    ticketSalesEndDate: "",
    address: "",
    lat: null,
    lng: null,
    totalCapacity: "",
    ticketType: "paid", // "paid" or "free"
    tickets: [],
    banner: null,
    bannerFile: null,   // raw File object for upload
    authDocuments: [],  // Array of { name, size, type, file, preview }
    promotions: {
        featured: false,
        email: false,
        social: false,
        insights: false,
        budget: 0
    }
};

export const eventCategories = [
    "Concert", "Festival", "Exhibition", "Workshop", "Seminar", "Other"
];
export const promotePrices = {
    featured: 500,
    email: 250,
    social: 150,
    insights: 100
};
