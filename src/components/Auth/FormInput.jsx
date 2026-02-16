import React from 'react';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { inputIcons } from '../../data/registerData';

const FormInput = ({
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    label,
    required = false,
    iconType,
    showPassword,
    onTogglePassword,
    focusColor = "#088395"
}) => {
    const isPasswordField = type === "password" || (type === "text" && onTogglePassword);
    const actualType = isPasswordField && showPassword ? "text" : type;
    const focusClass = focusColor === "#d7a444" 
        ? "focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444]"
        : "focus:border-[#088395] focus:ring-1 focus:ring-[#088395]";

    return (
        <div>
            <label className="block text-sm font-semibold text-[#09637E] mb-1">
                {label}
            </label>
            <div className="relative">
                <input
                    type={actualType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white ${focusClass} outline-none transition-all pl-10`}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {inputIcons[iconType]}
                    </svg>
                </div>
                {isPasswordField && onTogglePassword && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        {showPassword ? <BsEyeSlash /> : <BsEye />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default FormInput;
