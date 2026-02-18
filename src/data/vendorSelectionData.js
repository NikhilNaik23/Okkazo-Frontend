// Vendor Selection Mock Data

// Generate mock reviews data
export const generateReviews = (count = 42) => Array.from({ length: count }).map((_, i) => ({
    id: i,
    user: `User ${i + 1}`,
    rating: 4 + Math.random(),
    date: new Date(2025, 0, 15 - i).toLocaleDateString(),
    text: "Absolutely stunning experience! The attention to detail was immaculate and the team went above and beyond to ensure our day was perfect. Highly recommended for anyone looking for luxury service."
}));

// Category Specific Packages
export const categoryPackages = {
    "Venue": [
        {
            id: 'venue-basic',
            name: "Silver Hall Access",
            tier: "Economy Tier",
            price: 50000,
            unit: "Per Day",
            desc: "Standard hall rental for small gatherings",
            includes: ["Main Hall Access (6 Hours)", "Basic Lighting", "Cleaning Services", "Power Backup", "Valet Parking (Limited)"]
        },
        {
            id: 'venue-standard',
            name: "Gold Banquet Access",
            tier: "Mid Tier",
            price: 120000,
            unit: "Per Day",
            desc: "Premium banquet hall for weddings",
            includes: ["Grand Ballroom Access (12 Hours)", "Premium Lighting & Audio", "Bridal Changing Room", "Full Power Backup", "Dedicated Valet Team"]
        },
        {
            id: 'venue-premium',
            name: "Royal Palace Rental",
            tier: "Luxury Tier",
            price: 350000,
            unit: "Per Day",
            desc: "Exclusive access to the entire property",
            includes: ["Full Property Access (24 Hours)", "Luxury Suites for Stay", "Event Coordinator", "Decor Setup Assistance", "VVIP Valet & Security"]
        }
    ],
    "Catering & Drinks": [
        {
            id: 'cat-basic',
            name: "Basic Feast",
            tier: "Economy Tier",
            price: 450,
            unit: "Per Plate",
            desc: "Essential catering services",
            includes: ["Welcome Drink", "2 Starters", "2 Solid Curries", "1 Liquid Curry / Dal", "1 Rice Item"]
        },
        {
            id: 'cat-std',
            name: "Grand Feast",
            tier: "Mid Tier",
            price: 750,
            unit: "Per Plate",
            desc: "Popular choice for events",
            includes: ["Welcome Drink", "3 Starters", "2 Solid Curries", "2 Liquid Curries", "2 Rice Items", "Dessert Counter"]
        },
        {
            id: 'cat-prem',
            name: "Royal Banquet",
            tier: "Luxury Tier",
            price: 1200,
            unit: "Per Plate",
            desc: "Complete luxury culinary experience",
            includes: ["Welcome Drink (2 Options)", "5 Starters (Veg/Non-Veg)", "3 Premium Curries", "Biryani & Rice", "Assorted Breads", "Premium Desserts"]
        }
    ],
    "Photography": [
        {
            id: 'photo-basic',
            name: "Candid Basic",
            tier: "Economy Tier",
            price: 25000,
            unit: "Per Event",
            desc: "Essential photography coverage",
            includes: ["1 Candid Photographer", "6 Hours Coverage", "200 Edited Pictures", "Digital Album"]
        },
        {
            id: 'photo-std',
            name: "Storyteller Package",
            tier: "Mid Tier",
            price: 55000,
            unit: "Per Event",
            desc: "Comprehensive event coverage",
            includes: ["1 Candid + 1 Traditional Photographer", "Full Day Coverage", "500 Edited Pictures", "Hardcover Album", "Teaser Video"]
        },
        {
            id: 'photo-prem',
            name: "Cinematic Experience",
            tier: "Luxury Tier",
            price: 120000,
            unit: "Per Event",
            desc: "Complete cinematic documentation",
            includes: ["2 Candid + 2 Traditional Photographers", "Drone Coverage", "Cinematic Wedding Film", "Premium Photo Book", "Same Day Edit"]
        }
    ],
    "Videography": [
        {
            id: 'video-basic',
            name: "Highlight Reel",
            tier: "Economy Tier",
            price: 30000,
            unit: "Per Event",
            desc: "Short cinematic highlight",
            includes: ["1 Videographer", "5 Minute Highlight", "Raw Footage"]
        },
        {
            id: 'video-std',
            name: "Full Feature",
            tier: "Mid Tier",
            price: 65000,
            unit: "Per Event",
            desc: "Full length wedding film",
            includes: ["2 Videographers", "20 Minute Feature Film", "Teaser Trailer", "Drone Shots"]
        },
        {
            id: 'video-prem',
            name: "Director's Cut",
            tier: "Luxury Tier",
            price: 150000,
            unit: "Per Event",
            desc: "Movie-style production",
            includes: ["Cinematography Team", "45 Minute Feature Film", "Instagram Reels", "Pre-Wedding Shoot", "Drone & Crane Shots"]
        }
    ],
    "Decor & Styling": [
        {
            id: 'decor-basic',
            name: "Floral Touch",
            tier: "Economy Tier",
            price: 40000,
            unit: "Per Event",
            desc: "Simple and elegant floral decor",
            includes: ["Stage Floral Setup", "Entrance Arch", "Basic Seating Arrangement"]
        },
        {
            id: 'decor-std',
            name: "Themed Ambience",
            tier: "Mid Tier",
            price: 100000,
            unit: "Per Event",
            desc: "Cohesive theme styling",
            includes: ["Themed Stage & Backdrop", "Entrance Walkway Decor", "Centerpieces", "Ambient Lighting"]
        },
        {
            id: 'decor-prem',
            name: "Luxury Transformation",
            tier: "Luxury Tier",
            price: 300000,
            unit: "Per Event",
            desc: "Complete venue transformation",
            includes: ["Custom Fabrication", "Imported Flowers", "Ceiling Drapes & Chandeliers", "Photo Booths", "Lounge Setup"]
        }
    ],
    "Entertainment & Artists": [
        {
            id: 'ent-basic',
            name: "DJ Night",
            tier: "Economy Tier",
            price: 15000,
            unit: "Per Event",
            desc: "Get the party started",
            includes: ["Professional DJ", "Sound System (Basic)", "4 Hours Performance"]
        },
        {
            id: 'ent-std',
            name: "Live Band",
            tier: "Mid Tier",
            price: 45000,
            unit: "Per Event",
            desc: "Energetic live performance",
            includes: ["4-Piece Live Band", "Premium Sound System", "3 Sets of 45 Mins", "Genre of Choice"]
        },
        {
            id: 'ent-prem',
            name: "Celebrity Artist",
            tier: "Luxury Tier",
            price: 200000,
            unit: "Per Event",
            desc: "Star-studded performance",
            includes: ["Known Artist/Performer", "Concert Grade Sound & Light", "Meet & Greet", "90 Minute Show"]
        }
    ],
    "Makeup & Grooming": [
        {
            id: 'mua-basic',
            name: "Party Makeup",
            tier: "Economy Tier",
            price: 5000,
            unit: "Per Person",
            desc: "Standard party look",
            includes: ["Base Makeup", "Hairstyling", "Draping"]
        },
        {
            id: 'mua-std',
            name: "Bridal HD",
            tier: "Mid Tier",
            price: 15000,
            unit: "Per Person",
            desc: "High definition bridal look",
            includes: ["HD Makeup", "Advanced Hairstyling", "Lashes & Lenses", "Trial Session"]
        },
        {
            id: 'mua-prem',
            name: "Airbrush Signature",
            tier: "Luxury Tier",
            price: 35000,
            unit: "Per Person",
            desc: "Flawless long-lasting look",
            includes: ["Airbrush Makeup", "Premium Skin Prep", "Luxury Hairstyling", "Touch-ups", "Draping Assistance"]
        }
    ],
    "Invitations & Printing": [
        {
            id: 'inv-basic',
            name: "Digital Suite",
            tier: "Economy Tier",
            price: 3000,
            unit: "Fixed Price",
            desc: "Eco-friendly digital invites",
            includes: ["Save the Date (Digital)", "Main Invite (PDF/Image)", "RSVP Link"]
        },
        {
            id: 'inv-std',
            name: "Classic Cards",
            tier: "Mid Tier",
            price: 15000,
            unit: "Per 100 Cards",
            desc: "Traditional printed cards",
            includes: ["Premium Paper Card", "Matching Envelope", "Gold Foiling", "100 Units"]
        },
        {
            id: 'inv-prem',
            name: "Luxury Box",
            tier: "Luxury Tier",
            price: 50000,
            unit: "Per 100 Boxes",
            desc: "Opulent invitation boxes",
            includes: ["Hardcover Box", "Custom Inserts", "Dry Fruits/Chocolates", "Wax Seal", "100 Units"]
        }
    ],
    "Sound & Lighting": [
        {
            id: 'sl-basic',
            name: "PA System",
            tier: "Economy Tier",
            price: 10000,
            unit: "Per Event",
            desc: "Basic audio for speeches",
            includes: ["2 Speakers", "2 Microphones", "Mixer", "Technician"]
        },
        {
            id: 'sl-std',
            name: "Dance Floor Setup",
            tier: "Mid Tier",
            price: 35000,
            unit: "Per Event",
            desc: "Audio and mood lighting",
            includes: ["Subwoofers & Tops", "DJ Gear", "Par Lights (8)", "Smoke Machine"]
        },
        {
            id: 'sl-prem',
            name: "Concert Grade",
            tier: "Luxury Tier",
            price: 85000,
            unit: "Per Event",
            desc: "Professional stage production",
            includes: ["Line Array System", "Intelligent Lighting", "LED Wall", "Trussing", "Sound Engineer"]
        }
    ],
    "Equipment Rental": [
        {
            id: 'rent-basic',
            name: "Furniture Basics",
            tier: "Economy Tier",
            price: 50,
            unit: "Per Item",
            desc: "Standard chair rental",
            includes: ["Banquet Chair", "Table (Round/Rect)", "Basic Linen"]
        },
        {
            id: 'rent-std',
            name: "Lounge Setup",
            tier: "Mid Tier",
            price: 15000,
            unit: "Per Set",
            desc: "Comfortable seating area",
            includes: ["2 Sofas", "Center Table", "Rug", "Cushions"]
        },
        {
            id: 'rent-prem',
            name: "Luxury Tent",
            tier: "Luxury Tier",
            price: 50000,
            unit: "Per Structure",
            desc: "Premium outdoor cover",
            includes: ["German Hanger Tent", "AC Units", "Carpet Flooring", "Chandelier Points"]
        }
    ],
    "Security & Safety": [
        {
            id: 'sec-basic',
            name: "Bouncers Team",
            tier: "Economy Tier",
            price: 15000,
            unit: "Per Team/Event",
            desc: "Crowd management",
            includes: ["4 Bouncers", "6 Hours shift", "Communication Sets"]
        },
        {
            id: 'sec-std',
            name: "Exec Protection",
            tier: "Mid Tier",
            price: 35000,
            unit: "Per Event",
            desc: "Enhanced security for guests",
            includes: ["Head of Security", "6 Bouncers", "Valet Management", "Metal Detectors"]
        },
        {
            id: 'sec-prem',
            name: "VIP Protocol",
            tier: "Luxury Tier",
            price: 80000,
            unit: "Per Event",
            desc: "High profile event security",
            includes: ["Armed Guards (Licensed)", "VIP Escort Team", "Surveillance Setup", "Ambulance on Standby"]
        }
    ],
    "Transportation": [
        {
            id: 'trans-basic',
            name: "Shuttle Service",
            tier: "Economy Tier",
            price: 8000,
            unit: "Per Tempo/Day",
            desc: "Guest pickups",
            includes: ["12 Seater Tempo Traveller", "8 Hours / 80km", "Driver"]
        },
        {
            id: 'trans-std',
            name: "Luxury Sedan",
            tier: "Mid Tier",
            price: 15000,
            unit: "Per Car/Day",
            desc: "Premium guest travel",
            includes: ["Mercedes/BMW Sedan", "8 Hours / 80km", "Chauffeur", "Water & Tissues"]
        },
        {
            id: 'trans-prem',
            name: "Vintage Arrival",
            tier: "Luxury Tier",
            price: 45000,
            unit: "Per Event",
            desc: "Grand entry vehicle",
            includes: ["Vintage Rolls/Bentley", "4 Hours", "Decorated", "Chauffeur in Uniform"]
        }
    ],
    "Live Streaming & Media": [
        {
            id: 'stream-basic',
            name: "Single Cam Stream",
            tier: "Economy Tier",
            price: 15000,
            unit: "Per Event",
            desc: "Basic youtube live",
            includes: ["1 HD Camera", "Encoder Setup", "Youtube Link"]
        },
        {
            id: 'stream-std',
            name: "Multi-Cam Setup",
            tier: "Mid Tier",
            price: 35000,
            unit: "Per Event",
            desc: "TV style broadcast",
            includes: ["3 Camera Setup", "Live Switching Console", "Graphics Overlay", "Dedicated Internet"]
        },
        {
            id: 'stream-prem',
            name: "Virtual Experience",
            tier: "Luxury Tier",
            price: 75000,
            unit: "Per Event",
            desc: "Interactive virtual event",
            includes: ["Zoom/Platform Management", "Virtual Host", "Breakout Rooms", "Interactive Polls"]
        }
    ],
    "Cake & Desserts": [
        {
            id: 'cake-basic',
            name: "Classic Tier",
            tier: "Economy Tier",
            price: 4000,
            unit: "Kg",
            desc: "Beautiful 2-tier cake",
            includes: ["2 Tier Cake (3kg)", "Standard Flavors", "Basic Floral Decor"]
        },
        {
            id: 'cake-std',
            name: "Designer Cake",
            tier: "Mid Tier",
            price: 12000,
            unit: "Kg",
            desc: "Custom themed cake",
            includes: ["3 Tier Cake (5kg)", "Premium Flavors", "Fondant Art Work", "Delivery & Setup"]
        },
        {
            id: 'cake-prem',
            name: "Dessert Table",
            tier: "Luxury Tier",
            price: 35000,
            unit: "Per Table",
            desc: "Full dessert spread",
            includes: ["Main Cake", "Cupcakes & Macarons", "Jar Desserts", "Styled Table Setup"]
        }
    ]
};

// Default fallback
export const servicePackages = categoryPackages["Catering & Drinks"];

// Vendor highlights
export const vendorHighlights = ['Premium Aesthetics', 'Custom Layouts', 'Dedicated Concierge', 'Valet Service'];

// Filter options
export const filterOptions = ['Nearest', 'Top Rated', 'Trending'];

// Price format helper
export const formatPrice = (p) => "₹" + (p >= 1000 ? (p / 1000).toFixed(0) + 'k' : p);
