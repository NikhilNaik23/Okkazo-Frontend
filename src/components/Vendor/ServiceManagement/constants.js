export const SERVICE_CATEGORIES = [
    { id: "venues", label: "Venue", icon: "BsShop" },
    { id: "catering", label: "Catering & Drinks", icon: "MdOutlineRestaurantMenu" },
    { id: "photography", label: "Photography", icon: "BsCamera" },
    { id: "videography", label: "Videography", icon: "BsCameraVideo" },
    { id: "decor", label: "Decor & Styling", icon: "BsPalette" },
    { id: "entertainment", label: "Entertainment & Artists", icon: "BsMusicNoteBeamed" },
    { id: "makeup", label: "Makeup & Grooming", icon: "BsBrush" },
    { id: "invitations", label: "Invitations & Printing", icon: "BsEnvelope" },
    { id: "sound", label: "Sound & Lighting", icon: "BsSpeaker" },
    { id: "rental", label: "Equipment Rental", icon: "BsTools" },
    { id: "security", label: "Security & Safety", icon: "BsShieldCheck" },
    { id: "transport", label: "Transportation", icon: "BsTruck" },
    { id: "media", label: "Live Streaming & Media", icon: "BsBroadcast" },
    { id: "cakes", label: "Cake & Desserts", icon: "MdCake" }
];

export const INITIAL_PACKAGES = [
    {
        id: 1,
        name: "Basic Package",
        tier: "Economy Tier",
        price: "₹450 / plate",
        items: [
            "Welcome Drink", "2 Starters", "2 Solid Curries", "1 Liquid Curry / Dal",
            "1 Rice Item", "2 Indian Breads", "1 Dessert", "Salad & Pickle"
        ],
        accentColor: "border-[#e9eff1]",
        tierBg: "bg-[#e9eff1]",
        tierText: "text-[#708aa0]"
    },
    {
        id: 2,
        name: "Standard Package",
        tier: "Mid Tier",
        price: "₹750 / plate",
        items: [
            "Welcome Drink", "3 Starters", "2 Solid Curries", "2 Liquid Curries / Dal",
            "2 Rice Items", "2–3 Indian Breads", "2 Desserts", "Salad, Pickle & Papad"
        ],
        accentColor: "border-[#d0a862]",
        tierBg: "bg-[#d0a862]",
        tierText: "text-white"
    },
    {
        id: 3,
        name: "Premium Package",
        tier: "Luxury Tier",
        price: "₹1200 / plate",
        items: [
            "Welcome Drink (2 Options)", "4–5 Starters (Veg + Non-Veg Options)",
            "3 Solid Curries", "2 Liquid Curries / Dal", "2–3 Rice Items (Including Biryani)",
            "3–4 Indian Breads", "Live Counter (1–2)", "3 Desserts (Including Premium Sweet)",
            "Salad Bar & Accompaniments"
        ],
        accentColor: "border-[#0b2d49]",
        tierBg: "bg-[#0b2d49]",
        tierText: "text-white"
    }
];

export const INITIAL_VENUES = [
    {
        id: 1,
        name: "Grand Crystal Ballroom",
        location: "Manhattan, NY",
        capacity: 500,
        price: "2,500",
        image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800",
        status: "Active"
    },
    {
        id: 2,
        name: "Rooftop Sky Garden",
        location: "Brooklyn, NY",
        capacity: 150,
        price: "1,800",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800",
        status: "Active"
    }
];
