export const promoteEventSteps = [
    { id: 1, label: "Details", desc: "Event name & description" },
    { id: 2, label: "Sphere", desc: "Category & fields" },
    { id: 3, label: "Media", desc: "Banner & images" },
    { id: 4, label: "Tickets", desc: "Pricing & availability" },
    { id: 5, label: "Schedule", desc: "Dates & timing" },
    { id: 6, label: "Promote", desc: "Optional boost" },
    { id: 7, label: "Verify", desc: "Authenticity & Permissions" },
    { id: 8, label: "Review", desc: "Final verification" }
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
    promotions: {}
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
