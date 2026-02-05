import React, { useState, useEffect } from "react";
import { BsCalendarEventFill, BsShop } from "react-icons/bs";
import Lottie from "lottie-react";
import birthdayLottie from "../../../assets/lottie/birthday.json";
import weddingLottie from "../../../assets/lottie/wedding.json";
import eventLottie from "../../../assets/lottie/event.json";
import { Link } from "react-router-dom";

const Hero = () => {
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
  const animations = [weddingLottie, birthdayLottie, eventLottie];

  const handleAnimationComplete = () => {
    if (currentAnimationIndex === 0) {
      setTimeout(() => {
        setCurrentAnimationIndex((prevIndex) => (prevIndex + 1) % animations.length);
      }, 800);
    } else {
      setCurrentAnimationIndex((prevIndex) => (prevIndex + 1) % animations.length);
    }
  };

  return (
    <section className="flex min-h-[90vh] w-full items-center justify-center bg-[#EBF4F6] pt-16">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Side: Content */}
        <div className="lg:w-1/2 flex flex-col items-start text-left">
          <p className="text-md text-[#09637E] font-semibold px-6 py-2 bg-[#7AB2B2]/30 rounded-2xl mb-6">
            ALL-IN-ONE EVENT MANAGEMENT
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-[#09637E] leading-tight">
            Revolutionize Your <br />{" "}
            <span className="text-[#088395]">Events</span> Today
          </h1>
          <p className="text-lg mt-7 text-[#09637E] max-w-xl">
            The most intuitive platform to plan, market, and manage tickets sales
            for concerts, workshops, and corporate summits. All in one place.
          </p>
          <div className="mt-10 flex flex-wrap gap-5">
            <Link to="/login">
              <button className="py-3 px-8 rounded-xl cursor-pointer text-white bg-[#09637E] hover:bg-[#08556d] transition-all transform hover:scale-105 flex justify-center items-center gap-3 text-md font-bold shadow-lg">
                <BsCalendarEventFill fill="#ffffff" />
                Start Planning
              </button>
            </Link>
            <Link to="/vendor/register">
              <button className="py-3 px-8 rounded-xl cursor-pointer hover:bg-[#7AB2B2]/10 transition-all transform hover:scale-105 text-[#09637E] bg-[#ffffff] border-2 border-[#09637E] flex justify-center items-center gap-3 text-md font-bold shadow-md">
                <BsShop fill="#1565C0" />
                Join as vendor
              </button>
            </Link>
          </div>
        </div>

        {/* Right Side: Lottie Animation Slideshow */}
        <div className="lg:w-1/2 w-full flex justify-center items-center min-h-[400px] lg:min-h-[500px]">
          <div className="w-full max-w-md lg:max-w-xl aspect-square flex items-center justify-center">
            <Lottie
              key={currentAnimationIndex}
              animationData={animations[currentAnimationIndex]}
              loop={false}
              speed={2}
              onComplete={handleAnimationComplete}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
