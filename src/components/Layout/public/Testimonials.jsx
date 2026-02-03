import React from "react";
import { benefits, testimonial } from "../../../data/publicData.jsx";

const Testimonials = () => {
  return (
    <section className="bg-[#0b2d49] py-20 relative overflow-hidden">
        {/* Background blobs for visual interest - optional based on strict design adherence but looks good */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 flex flex-col lg:flex-row items-center justify-between gap-16">
        {/* Left Side: Text and Benefits */}
        <div className="lg:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 leading-snug">
            Why Thousands of <br /> Organizers Choose Us
          </h2>

          <div className="flex flex-col gap-8">
            {benefits.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-full shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    {item.title}
                  </h4>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Testimonial Card */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end w-full">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md relative">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    {/* Placeholder for user image */}
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h5 className="font-bold text-[#0b2d49]">{testimonial.name}</h5>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{testimonial.role}</p>
                </div>
             </div>
             
             <p className="text-gray-600 italic leading-relaxed mb-6">
                 "{testimonial.quote}"
             </p>
             
             <div className="flex text-[#d7a444] gap-1">
                 {[...Array(testimonial.rating)].map((_, i) => (
                     <span key={i}>★</span>
                 ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
