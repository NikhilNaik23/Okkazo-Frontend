import React from 'react';
import { BsTicketPerforated, BsChatLeftText, BsArrowRepeat, BsStar, BsTag, BsStars } from "react-icons/bs";

export const notificationsData = {
    new: [
        {
            id: 1,
            title: "Booking Confirmed!",
            message: "Your ticket for 'Neon Lights Concert' has been successfully booked. Check your email for details.",
            time: "2 mins ago",
            unread: true,
            icon: <BsTicketPerforated className="text-emerald-500" />,
            bgColor: "bg-emerald-50"
        },
        {
            id: 2,
            title: "Message from Organizer",
            message: "The event manager for 'Tech Future Summit' sent you a message regarding the agenda.",
            time: "1 hour ago",
            unread: true,
            icon: <BsChatLeftText className="text-blue-500" />,
            bgColor: "bg-blue-50"
        }
    ],
    earlier: [
        {
            id: 3,
            title: "Event Time Changed",
            message: "'Abstract Painting Workshop' has been rescheduled to 7:30 PM this Friday.",
            time: "Yesterday, 4:30 PM",
            unread: false,
            icon: <BsArrowRepeat className="text-amber-500" />,
            bgColor: "bg-amber-50"
        },
        {
            id: 4,
            title: "How was the event?",
            message: "Share your experience at 'Morning Yoga by the Lake' and help others discover it.",
            time: "Oct 24, 2023",
            unread: false,
            icon: <BsStar className="text-indigo-500" />,
            bgColor: "bg-indigo-50"
        }
    ],
    promotions: [
        {
            id: 5,
            title: "Flash Sale: 20% Off",
            message: "Get 20% discount on all music festivals this weekend. Use code FEST20.",
            time: "Oct 22, 2023",
            unread: false,
            icon: <BsTag className="text-rose-500" />,
            bgColor: "bg-rose-50"
        },
        {
            id: 6,
            title: "Recommended for you",
            message: "Based on your interests: 'AI for Good Hackathon' is happening next week.",
            time: "Oct 20, 2023",
            unread: false,
            icon: <BsStars className="text-purple-500" />,
            bgColor: "bg-purple-50"
        }
    ]
};
