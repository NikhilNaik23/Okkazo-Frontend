const getRandomLocation = () => {
    const locations = ["Banjara Hills, Hyderabad", "Jubilee Hills, Hyderabad", "Koramangala, Bangalore", "Indiranagar, Bangalore", "Marine Drive, Mumbai", "Juhu, Mumbai", "Connaught Place, Delhi", "Vasant Vihar, Delhi", "Anna Nagar, Chennai", "Boat Club Road, Pune"];
    return locations[Math.floor(Math.random() * locations.length)];
};

const venueNames = ["Taj Falaknuma Palace", "The Leela Palace", "ITC Grand Chola", "Oberoi Udaivilas", "Rambagh Palace", "Umaid Bhawan Palace", "The Lalit Great Eastern", "Suryagarh Jaisalmer", "Wildflower Hall", "Kumarakom Lake Resort", "The Khyber Himalayan Resort", "Neemrana Fort-Palace", "Alila Fort Bishangarh", "RAAS Devigarh", "Evolve Back", "WelcomHotel The Savoy", "Mayfair Spa Resort", "Glenburn Tea Estate", "Ri Kynjai", "The Tamara Coorg", "Vivanta by Taj", "Radisson Blu", "Novotel Convention Centre", "Marriott Marquis", "Hyatt Regency"];

const cateringNames = ["Indian Accent Catering", "Bukhara Banquets", "Karim's Royal Kitchen", "Paradise Biryani Catering", "Oh! Calcutta Events", "Punjab Grill Outdoor", "Mainland China Catering", "Saravana Bhavan Events", "Haldiram's Banquets", "Bikanervala Catering", "Copper Chimney Events", "Moti Mahal Delux", "Tunday Kababi", "Gajalee Coastal Food", "Dakshin Flavors", "Chokhi Dhani Catering", "Barbeque Nation Events", "Absolute Barbecues", "Chaayos Events", "Keventers Shakes", "Cream Stone Creations", "Theobroma Patisserie", "Kayani Bakery", "Le15 Patisserie", "Glen's Bakehouse"];

const photoNames = ["Stellar Frames", "Golden Hour", "Eternal Memories", "Lens Maestro", "Pixel Perfect", "Shutter Story", "Focus Fab", "Snap Soul", "Visual Vibes", "Capture Crew", "Moment Makers", "Flash Fame", "Angle Art", "View Vivid", "Portrait Pro", "Candid Click", "Freeze Frame", "Aperture Ace", "Zoom Zeal", "Exposure Elite", "Shadow & Light", "Contrast Kings", "Iso Icons", "Raw Realness", "Edited Elegance"];

const videoNames = ["Cinematic Souls", "Motion Magic", "Eternal Reels", "Frame Flow", "Visual Verse", "Dynamic Docs", "Life in Motion", "Vivid Videos", "Story Stream", "Lens Legends", "Capture Cut", "Moment Movies", "Pro Productions", "Elite Edits", "Prime Pixels"];

const decorNames = ["Floral Fantasy", "Elegant Edges", "Dream Decor", "Royal Themes", "Rustic Charm", "Modern Muse", "Crystal Clear", "Velvet Vibe", "Golden Touch", "Bloom & Bliss", "Style Spectrum", "Artistic Ambience", "Divine Designs", "Enchanted Events", "Chic Celebrations"];

const soundNames = ["Sonic Boom", "Clear Beats", "Echo Events", "Pulse Productions", "Vibe Audio", "Rhythm Rentals", "Harmony Hub", "Audio Ace", "Dynamic DJs", "Pure Sound", "Infinite Waves", "Crystal Audio", "Resonance Records", "Sound Spectrum", "Live Lattice"];

const cakeNames = ["Sweet Surrender", "Sugar Sculpt", "Velvet Frost", "Crumb & Co", "Heavenly Bites", "Royal Crumb", "Artisan Cakes", "Sweet Symphony", "Glaze Galore", "Petite Pastries", "Tiered Treasures", "Frosting Fairy", "Confection Cloud", "Dulce Delights", "Baker's Bliss"];

const itemImages = {
    Venue: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2698&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1541310592916-7fb19bf478cc?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1562663474-6cbb3fee4c77?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517457373958-b7bdd458ad20?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2669&auto=format&fit=crop"
    ],
    Catering: [
        "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2670&auto=format&fit=crop"
    ],
    Photography: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2528&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1554080353-a576cf803bda?q=80&w=2574&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1453060113865-9689b592457a?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=2588&auto=format&fit=crop"
    ],
    Decor: [
        "https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2669&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522673607200-1648832cee98?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517457373958-b7bdd458ad20?q=80&w=2670&auto=format&fit=crop"
    ],
    Artists: [
        "https://images.unsplash.com/photo-1514525253361-bee8d4a4608c?q=80&w=2574&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2670&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2670&auto=format&fit=crop"
    ]
};

export const dummyVendors = {
  "Venue": Array.from({ length: 30 }, (_, i) => ({
    id: `venue-${i}`,
    name: venueNames[i % venueNames.length],
    rating: (4.2 + Math.random() * 0.8).toFixed(1),
    reviews: 50 + Math.floor(Math.random() * 450),
    priceMin: (100000 + (i % 10) * 25000),
    priceMax: (100000 + (i % 10) * 25000) * 1.5,
    image: itemImages.Venue[i % itemImages.Venue.length],
    location: getRandomLocation(),
    isPopular: i < 6,
    capacity: 100 + Math.floor(Math.random() * 1900) // Random capacity 100-2000
  })),
  "Catering & Drinks": Array.from({ length: 30 }, (_, i) => ({
    id: `catering-${i}`,
    name: cateringNames[i % cateringNames.length],
    rating: (4.1 + Math.random() * 0.9).toFixed(1),
    reviews: 30 + Math.floor(Math.random() * 200),
    priceMin: (500 + (i % 5) * 200),
    priceMax: (500 + (i % 5) * 200) * 1.5,
    image: itemImages.Catering[i % itemImages.Catering.length],
    location: getRandomLocation(),
    isPopular: i < 6,
    type: i % 2 === 0 ? "Fusion & Continental" : "Traditional Indian"
  })),
  "Photography": Array.from({ length: 30 }, (_, i) => ({
    id: `photo-${i}`,
    name: photoNames[i % photoNames.length],
    rating: (4.5 + Math.random() * 0.5).toFixed(1),
    reviews: 20 + Math.floor(Math.random() * 150),
    priceMin: (30000 + (i % 4) * 15000),
    priceMax: (30000 + (i % 4) * 15000) * 2,
    image: itemImages.Photography[i % itemImages.Photography.length],
    location: getRandomLocation(),
    isPopular: i < 6,
    style: i % 3 === 0 ? "Candid" : i % 3 === 1 ? "Traditional" : "Cinematic"
  })),
  "Videography": Array.from({ length: 25 }, (_, i) => ({
    id: `video-${i}`,
    name: videoNames[i % videoNames.length],
    rating: (4.4 + Math.random() * 0.6).toFixed(1),
    reviews: 15 + Math.floor(Math.random() * 100),
    priceMin: (25000 + (i % 5) * 10000),
    priceMax: (25000 + (i % 5) * 10000) * 1.8,
    image: itemImages.Photography[(i + 2) % itemImages.Photography.length],
    location: getRandomLocation(),
    isPopular: i < 5
  })),
  "Decor & Styling": Array.from({ length: 25 }, (_, i) => ({
    id: `decor-${i}`,
    name: decorNames[i % decorNames.length],
    rating: (4.2 + Math.random() * 0.8).toFixed(1),
    reviews: 40 + Math.floor(Math.random() * 120),
    priceMin: (50000 + (i % 5) * 20000),
    priceMax: (50000 + (i % 5) * 20000) * 2,
    image: itemImages.Decor[i % itemImages.Decor.length],
    location: getRandomLocation(),
    isPopular: i < 5
  })),
  "Entertainment & Artists": Array.from({ length: 25 }, (_, i) => ({
    id: `ent-${i}`,
    name: `Group ${i + 1}`,
    rating: (4.6 + Math.random() * 0.4).toFixed(1),
    reviews: 60 + Math.floor(Math.random() * 300),
    priceMin: (20000 + (i % 5) * 15000),
    priceMax: (20000 + (i % 5) * 15000) * 1.5,
    image: itemImages.Artists[i % itemImages.Artists.length],
    location: getRandomLocation(),
    isPopular: i < 4
  })),
  "Makeup & Grooming": Array.from({ length: 20 }, (_, i) => ({
    id: `makeup-${i}`,
    name: `Stylist ${i + 1}`,
    rating: (4.5 + Math.random() * 0.5).toFixed(1),
    reviews: 25 + Math.floor(Math.random() * 80),
    priceMin: (15000 + (i % 4) * 5000),
    priceMax: (15000 + (i % 4) * 5000) * 1.6,
    image: itemImages.Photography[i % itemImages.Photography.length],
    location: getRandomLocation(),
    isPopular: i < 3
  })),
  "Invitations & Printing": Array.from({ length: 20 }, (_, i) => ({
    id: `invite-${i}`,
    name: `Studio ${i + 1}`,
    rating: (4.3 + Math.random() * 0.7).toFixed(1),
    reviews: 30 + Math.floor(Math.random() * 150),
    priceMin: (50 + (i % 5) * 50),
    priceMax: (50 + (i % 5) * 50) * 2,
    image: itemImages.Decor[(i + 1) % itemImages.Decor.length],
    location: getRandomLocation(),
    isPopular: i < 4
  })),
  "Sound & Lighting": Array.from({ length: 20 }, (_, i) => ({
    id: `sound-${i}`,
    name: soundNames[i % soundNames.length],
    rating: (4.5 + Math.random() * 0.5).toFixed(1),
    reviews: 20 + Math.floor(Math.random() * 110),
    priceMin: (30000 + (i % 5) * 10000),
    priceMax: (30000 + (i % 5) * 10000) * 1.5,
    image: itemImages.Venue[(i + 3) % itemImages.Venue.length],
    location: getRandomLocation(),
    isPopular: i < 4
  })),
  "Equipment Rental": Array.from({ length: 15 }, (_, i) => ({
    id: `rental-${i}`,
    name: `Rental Service ${i + 1}`,
    rating: (4.0 + Math.random() * 1.0).toFixed(1),
    reviews: 10 + Math.floor(Math.random() * 50),
    priceMin: (10000 + (i % 5) * 5000),
    priceMax: (10000 + (i % 5) * 5000) * 1.4,
    image: itemImages.Venue[i % itemImages.Venue.length],
    location: getRandomLocation(),
    isPopular: i < 3
  })),
  "Security & Safety": Array.from({ length: 10 }, (_, i) => ({
    id: `security-${i}`,
    name: `Guard Force ${i + 1}`,
    rating: (4.8 + Math.random() * 0.2).toFixed(1),
    reviews: 40 + Math.floor(Math.random() * 150),
    priceMin: (20000 + (i % 3) * 10000),
    priceMax: (20000 + (i % 3) * 10000) * 1.2,
    image: itemImages.Artists[(i + 2) % itemImages.Artists.length],
    location: getRandomLocation(),
    isPopular: i < 2
  })),
  "Transportation": Array.from({ length: 15 }, (_, i) => ({
    id: `transport-${i}`,
    name: `Fleet ${i + 1}`,
    rating: (4.4 + Math.random() * 0.6).toFixed(1),
    reviews: 25 + Math.floor(Math.random() * 90),
    priceMin: (5000 + (i % 5) * 2000),
    priceMax: (5000 + (i % 5) * 2000) * 1.5,
    image: itemImages.Venue[(i + 1) % itemImages.Venue.length],
    location: getRandomLocation(),
    isPopular: i < 3
  })),
  "Live Streaming & Media": Array.from({ length: 12 }, (_, i) => ({
    id: `live-${i}`,
    name: `Stream Team ${i + 1}`,
    rating: (4.6 + Math.random() * 0.4).toFixed(1),
    reviews: 15 + Math.floor(Math.random() * 60),
    priceMin: (15000 + (i % 4) * 8000),
    priceMax: (15000 + (i % 4) * 8000) * 1.7,
    image: itemImages.Photography[(i + 4) % itemImages.Photography.length],
    location: getRandomLocation(),
    isPopular: i < 3
  })),
  "Cake & Desserts": Array.from({ length: 25 }, (_, i) => ({
    id: `cake-${i}`,
    name: cakeNames[i % cakeNames.length],
    rating: (4.7 + Math.random() * 0.3).toFixed(1),
    reviews: 35 + Math.floor(Math.random() * 180),
    priceMin: (5000 + (i % 5) * 3000),
    priceMax: (5000 + (i % 5) * 3000) * 2,
    image: itemImages.Catering[(i + 2) % itemImages.Catering.length],
    location: getRandomLocation(),
    isPopular: i < 5
  })),
  "Experimental": [
    {
      id: "exp-1",
      name: "Burger Eating Buffalo",
      rating: 5.0,
      reviews: 420,
      priceMin: 99999,
      priceMax: 150000,
      image: "https://images.unsplash.com/photo-1552167909-6447ec158525?q=80&w=2670&auto=format&fit=crop",
      location: "Dreamland",
      isPopular: true
    }
  ]
};

