export const dummyVendors = {
  Venue: Array.from({ length: 10 }, (_, i) => ({
    id: `venue-${i}`,
    name: `Venue ${i + 1}: The Grand Hall`,
    rating: 4.5 + (i % 5) * 0.1,
    reviews: 120 + i * 10,
    priceMin: 2000 + i * 500,
    priceMax: 5000 + i * 1000,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2698&auto=format&fit=crop",
    location: "Downtown, City"
  })),
  Catering: Array.from({ length: 10 }, (_, i) => ({
    id: `catering-${i}`,
    name: `Catering ${i + 1}: Gourmet Delights`,
    rating: 4.2 + (i % 5) * 0.1,
    reviews: 80 + i * 5,
    priceMin: 50 + i * 10, // Per guest maybe
    priceMax: 150 + i * 20,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2670&auto=format&fit=crop",
    type: "Italian & Continental"
  })),
  Photography: Array.from({ length: 10 }, (_, i) => ({
    id: `photo-${i}`,
    name: `Studio ${i + 1}: Lens Magic`,
    rating: 4.8,
    reviews: 45 + i,
    priceMin: 1000 + i * 200,
    priceMax: 3000 + i * 500,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2528&auto=format&fit=crop",
    style: "Candid & Artistic"
  })),
  Decor: Array.from({ length: 10 }, (_, i) => ({
    id: `decor-${i}`,
    name: `Decor ${i + 1}: Elegant Themes`,
    rating: 4.6,
    reviews: 60 + i * 2,
    priceMin: 1500 + i * 300,
    priceMax: 4000 + i * 600,
    image: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?q=80&w=2670&auto=format&fit=crop",
    theme: "Modern Vintage"
  })),
  Entertainment: Array.from({ length: 10 }, (_, i) => ({
    id: `ent-${i}`,
    name: `Band ${i + 1}: The Groovers`,
    rating: 4.9,
    reviews: 200 + i * 15,
    priceMin: 800 + i * 100,
    priceMax: 2500 + i * 300,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2670&auto=format&fit=crop",
    genre: "Live Jazz"
  })),
  Transport: Array.from({ length: 10 }, (_, i) => ({
    id: `trans-${i}`,
    name: `Transport ${i + 1}: Luxury Rides`,
    rating: 4.3,
    reviews: 30 + i,
    priceMin: 200 + i * 50,
    priceMax: 1000 + i * 100,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2670&auto=format&fit=crop",
    fleet: "Limousines & Vans"
  })),
};
