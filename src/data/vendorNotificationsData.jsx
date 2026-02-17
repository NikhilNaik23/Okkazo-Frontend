import React from 'react';
import { BsCalendarCheck, BsCashCoin, BsChatQuote, BsExclamationCircle, BsMegaphone, BsShop } from "react-icons/bs";

export const vendorNotificationsData = {
    new: [
        {
            id: 1,
            title: "New Booking Request",
            message: "You have a new booking request for 'Neon Lights Concert' on Oct 28. Please review and confirm.",
            time: "10 mins ago",
            unread: true,
            icon: <BsCalendarCheck className="text-[#0b2d49]" />,
            bgColor: "bg-[#d7a444]/20"
        },
        {
            id: 2,
            title: "Payment Received",
            message: "Payment of $1,200 for 'Tech Future Summit' has been credited to your account.",
            time: "2 hours ago",
            unread: true,
            icon: <BsCashCoin className="text-[#d7a444]" />,
            bgColor: "bg-[#0b2d49]/10"
        }
    ],
    earlier: [
        {
            id: 3,
            title: "New Review Received",
            message: "Sarah J. left a 5-star review: 'Amazing service! The food was delicious and presentation was top notch.'",
            time: "Yesterday, 9:00 AM",
            unread: false,
            icon: <BsChatQuote className="text-emerald-600" />,
            bgColor: "bg-emerald-50"
        },
        {
            id: 4,
            title: "Document Expiry Warning",
            message: "Your business license is expiring in 30 days. Please update your documents to avoid service interruption.",
            time: "Oct 23, 2023",
            unread: false,
            icon: <BsExclamationCircle className="text-rose-600" />,
            bgColor: "bg-rose-50"
        }
    ],
    promotions: [
        {
            id: 5,
            title: "Boost Your Visibility",
            message: "Get 20% off on 'Featured Vendor' placement this week. Reach more customers instantly.",
            time: "Oct 21, 2023",
            unread: false,
            icon: <BsMegaphone className="text-purple-600" />,
            bgColor: "bg-purple-50"
        },
        {
            id: 6,
            title: "Vendor Community Meetup",
            message: "Join us for the monthly vendor networking event. Connect and grow with fellow pros.",
            time: "Oct 18, 2023",
            unread: false,
            icon: <BsShop className="text-indigo-600" />,
            bgColor: "bg-indigo-50"
        }
    ]
};
