import React from "react";
import { BsCalendarEventFill, BsShop } from "react-icons/bs";

const Hero = () => {
  return (
    <section className="flex min-h-full w-full items-center justify-center bg-linear-to-r from-[#e9eff1] via-[#f3ddb1] to-[#e9eff1] mt-20">
      <div className="flex flex-col mb-20 items-center justify-center mt-20 ">
        <p className="text-md text-[#0b2d49] font-semibold px-6 py-2 bg-[#d7a444]/50 rounded-2xl">
          ALL-IN-ONE EVENT MANAGEMENT
        </p>
        <p className="text-6xl font-semibold mt-5 text-[#0b2d49]">
          Revolutionize Your <br />{" "}
          <span className="pl-15 text-[#d7a444]">Events</span> Today
        </p>
        <p className="text-lg mt-7 text-[#0b2d49]">
          The most intuitive platform to plan, market, and manage tickets sales
          for
          <br />{" "}
          <span className="pl-10">
            concerts, workshops, and corporate summits
          </span>
          . All in one place.
        </p>
        <div className="mt-10 flex gap-5">
          <button className="py-2 px-4 rounded-xl cursor-pointer text-white bg-[#0b2d49] hover:bg-[#071d30] transition-colors flex justify-center items-center gap-3 text-md">
            <BsCalendarEventFill fill="#ffffff" />
            Start Planning
          </button>
          <button className="py-2 px-4 rounded-xl cursor-pointer hover:bg-[#d0a862] transition-colors text-[#0b2d49] bg-[#ffffff] flex justify-center items-center gap-3 text-md">
            <BsShop fill="#0b2d49" />
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
