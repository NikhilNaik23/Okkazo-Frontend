import React from "react";

const Toggle = ({ active, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-14 h-8 rounded-full transition-all relative ${active ? "bg-[#0caf7d]" : "bg-gray-200"}`}
    >
        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm ${active ? "right-1" : "left-1"}`}></div>
    </button>
);

export default Toggle;
