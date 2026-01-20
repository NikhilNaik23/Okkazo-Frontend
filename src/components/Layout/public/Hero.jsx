import React from "react";
import { BsCalendarEventFill, BsShop } from "react-icons/bs";

const Hero = () => {
  return (
    <section className="flex min-h-full w-full items-center justify-center bg-linear-to-r from-[#b6bfc7] via-[#fbf5ea] to-[#efdec8] mt-20">
      <div className="flex flex-col mb-20 items-center justify-center mt-20 ">
        <p className="text-md text-[#233f58] font-semibold px-6 py-2 bg-[#9daab5] rounded-2xl">
          ALL-IN-ONE EVENT MANAGEMENT
        </p>
        <p className="text-6xl font-semibold mt-5">
          Revolutionize Your <br />{" "}
          <span className="pl-15 text-[#233f58]">Events</span> Today
        </p>
        <p className="text-lg mt-7 text-[#233f58]">
          The most intuitive platform to plan, market, and manage tickets sales
          for
          <br />{" "}
          <span className="pl-10">
            concerts, workshops, and corporate summits
          </span>
          . All in one place.
        </p>
        <div className="mt-10 flex gap-5">
          <button className="py-2 px-4 rounded-xl cursor-pointer text-white bg-[#0a263e] flex justify-center items-center gap-3 text-md">
            <BsCalendarEventFill fill="#ffffff" />
            Start Planning
          </button>
          <button className="py-2 px-4 rounded-xl cursor-pointer hover:bg-[#f9efdf] text-[#0a263e] bg-[#ffffff] flex justify-center items-center gap-3 text-md">
            <BsShop fill="#0a263e" />
            Join as vendor
          </button>
        </div>
        <div
          className="mt-10 rounded-2xl p-1"
        >
          <img
            src="src/assets/images/hero_image.png"
            alt="event_image"
            className="shadow-gray-400 shadow-2xl w-100 md:w-250 rounded-2xl bg-white"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
