import React, { useEffect, useMemo, useState } from "react";
import { MdPlace } from "react-icons/md";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const EVENTS_PER_SLIDE = 3;
const MAX_PUBLIC_EVENTS = 24;
const PREVIEW_IMAGES = [
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop",
];

const pickPreviewImage = (idx = 0) => PREVIEW_IMAGES[idx % PREVIEW_IMAGES.length];

const shuffleEvents = (items = []) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const toEventTimeMs = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return Number.POSITIVE_INFINITY;
  return d.getTime();
};

const formatDateParts = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return { month: "TBA", day: "--" };
  return {
    month: d.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
    day: String(d.getDate()).padStart(2, "0"),
  };
};

const TrendingEvents = () => {
  const [publicEvents, setPublicEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchPublicEvents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/public/events/marketplace/events?limit=${MAX_PUBLIC_EVENTS}`,
          { method: "GET" }
        );
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Failed to fetch public events");
        }

        const events = Array.isArray(data?.data?.events) ? data.data.events : [];
        if (active) setPublicEvents(events);
      } catch (error) {
        if (active) setPublicEvents([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchPublicEvents();
    return () => {
      active = false;
    };
  }, []);

  const normalizedEvents = useMemo(() => publicEvents.map((event, idx) => ({
    id: event?.eventId || `public-${idx}`,
    title: event?.eventTitle || "Upcoming Event",
    tag: event?.eventType || "Event",
    location: event?.locationName || "TBA",
    dateValue: event?.eventDate || null,
    date: formatDateParts(event?.eventDate),
    image: pickPreviewImage(idx),
  })), [publicEvents]);

  const orderedEvents = useMemo(() => (
    [...normalizedEvents].sort((a, b) => toEventTimeMs(a.dateValue) - toEventTimeMs(b.dateValue))
  ), [normalizedEvents]);

  const previewPool = useMemo(() => orderedEvents.slice(0, MAX_PUBLIC_EVENTS), [orderedEvents]);
  const shuffledEvents = useMemo(() => shuffleEvents(previewPool), [previewPool]);

  const slides = useMemo(() => {
    const result = [];
    for (let i = 0; i < shuffledEvents.length; i += EVENTS_PER_SLIDE) {
      result.push(shuffledEvents.slice(i, i + EVENTS_PER_SLIDE));
    }
    return result;
  }, [shuffledEvents]);

  const totalSlides = Math.max(1, slides.length);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    setSlideIndex(0);
  }, [totalSlides]);

  useEffect(() => {
    if (totalSlides <= 1) return undefined;
    const id = setInterval(() => {
      setSlideIndex((current) => (current + 1) % totalSlides);
    }, 10000);
    return () => clearInterval(id);
  }, [totalSlides]);

  const displayedEvents = slides[slideIndex] || [];
  const handlePrev = () => setSlideIndex((current) => (current - 1 + totalSlides) % totalSlides);
  const handleNext = () => setSlideIndex((current) => (current + 1) % totalSlides);

  return (
    <section id="exploreEvents" className="py-20 bg-[#f8f9fa] flex justify-center">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-[#09637E] mb-2">
              Trending Public Events
            </h2>
            <p className="text-gray-500">
              Join thousands of others at these upcoming workshops and concerts.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={totalSlides <= 1}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
            >
              &lt;
            </button>
            <button
              onClick={handleNext}
              disabled={totalSlides <= 1}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading && displayedEvents.length === 0 && [1, 2, 3].map((item) => (
            <div
              key={`public-event-skeleton-${item}`}
              className="bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="h-64 bg-gray-100 animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-3 w-24 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-5 w-3/4 bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-8 w-32 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}

          {!isLoading && displayedEvents.length === 0 && (
            <div className="col-span-full text-center text-gray-400">
              No live public events right now.
            </div>
          )}

          {displayedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white rounded-xl p-2 text-center min-w-[60px] shadow-sm">
                  <span className="block text-xs font-bold text-gray-400 uppercase">
                    {event.date.month}
                  </span>
                  <span className="block text-xl font-bold text-[#09637E]">
                    {event.date.day}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#088395]">
                    {event.tag}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                    Live
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#09637E] mb-2">
                  {event.title}
                </h3>
                <div className="flex items-center text-gray-400 text-sm mb-6">
                  <MdPlace className="mr-1" />
                  {event.location}
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#09637E]/60">
                    Tickets open
                  </span>
                  <Link to={"/login"}>
                    <button className="px-5 py-2 rounded-lg bg-[#7AB2B2] text-white hover:bg-[#09637E] transition-colors cursor-pointer">
                      Get Tickets
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingEvents;
