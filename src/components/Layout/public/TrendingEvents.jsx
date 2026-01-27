import React from "react";
import { MdPlace } from "react-icons/md";
import { trendingEvents } from "../../../data/publicData.jsx";

const events = trendingEvents;

const TrendingEvents = () => {
  return (
    <section id="exploreEvents" className="py-20 bg-[#f8f9fa] flex justify-center">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-[#0b2d49] mb-2">
              Trending Public Events
            </h2>
            <p className="text-gray-500">
              Join thousands of others at these upcoming workshops and concerts.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-200 cursor-pointer">
              &lt;
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-200 cursor-pointer">
              &gt;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
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
                  <span className="block text-xl font-bold text-[#0b2d49]">
                    {event.date.day}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <span
                  className={`text-xs font-bold uppercase tracking-wider mb-2 ${event.tagColor}`}
                >
                  {event.tag}
                </span>
                <h3 className="text-xl font-bold text-[#0b2d49] mb-2">
                  {event.title}
                </h3>
                <div className="flex items-center text-gray-400 text-sm mb-6">
                  <MdPlace className="mr-1" />
                  {event.location}
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xl font-bold text-[#0b2d49]">
                    {event.price}
                  </span>
                  <button className="px-5 py-2 rounded-lg bg-[#f3ddb1] text-[#0b2d49] font-semibold text-sm hover:bg-[#e9ce9d] transition-colors cursor-pointer">
                    Get Tickets
                  </button>
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
