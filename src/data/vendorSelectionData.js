// Vendor Selection Mock Data

// Generate mock reviews data
export const generateReviews = (count = 42) => Array.from({ length: count }).map((_, i) => ({
    id: i,
    user: `User ${i + 1}`,
    rating: 4 + Math.random(),
    date: new Date(2025, 0, 15 - i).toLocaleDateString(),
    text: "Absolutely stunning experience! The attention to detail was immaculate and the team went above and beyond to ensure our day was perfect. Highly recommended for anyone looking for luxury service."
}));

// Standard service packages
export const servicePackages = [
    { name: "Full Day Coverage", price: 85000, desc: "Up to 12 hours of coverage with 2 photographers" },
    { name: "Cinematic Film", price: 60000, desc: "5-7 minute highlight reel and full ceremony edit" },
    { name: "Pre-Wedding Shoot", price: 25000, desc: "4 hour session at location of choice" },
    { name: "Drone Coverage", price: 15000, desc: "Aerial shots for venue and entry" },
    { name: "Express Editing", price: 10000, desc: "Same day edit slideshow for reception" }
];

// Vendor highlights
export const vendorHighlights = ['Premium Aesthetics', 'Custom Layouts', 'Dedicated Concierge', 'Valet Service'];

// Filter options
export const filterOptions = ['Nearest', 'Top Rated', 'Trending'];

// Price format helper
export const formatPrice = (p) => "₹" + (p >= 1000 ? (p / 1000).toFixed(0) + 'k' : p);
