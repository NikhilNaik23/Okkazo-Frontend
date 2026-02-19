import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "./CustomDatePicker.css";
import { BsCalendar2Event, BsClock } from 'react-icons/bs';

// Custom input component to match the existing design
const CustomInput = forwardRef(({ value, onClick, placeholder, className }, ref) => (
    <div className="relative group cursor-pointer" onClick={onClick} ref={ref}>
        <div className={`w-full bg-[#EBF4F6] text-[#09637E] p-5 rounded-2xl border border-[#09637E]/5 outline-none group-hover:border-[#088395] group-focus-within:border-[#088395] group-focus-within:bg-white transition-all font-mono text-sm shadow-inner flex items-center justify-between ${className}`}>
            <span className={!value ? "text-[#09637E]/40" : ""}>
                {value || placeholder || "Select Date..."}
            </span>
            <BsCalendar2Event className="text-[#088395] opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
    </div>
));

const CustomDatePicker = ({ selected, onChange, minDate, placeholderText, className }) => {
    return (
        <div className="w-full relative okkazo-datepicker">
            <DatePicker
                selected={selected}
                onChange={onChange}
                minDate={minDate}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText={placeholderText}
                customInput={<CustomInput className={className} />}
                calendarClassName="shadow-xl border-none font-sans"
                popperClassName="z-50"
                showPopperArrow={false}
                popperModifiers={[
                    {
                        name: "offset",
                        options: {
                            offset: [0, 10],
                        },
                    },
                ]}
            />
        </div>
    );
};

export default CustomDatePicker;
