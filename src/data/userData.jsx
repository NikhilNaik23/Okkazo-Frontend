import React from 'react';
import { BsTicketPerforated, BsStar, BsShare, BsPersonPlus } from "react-icons/bs";

export const userProfileData = {
    name: "Alex Morgan",
    fullName: "Alex Morgan", // Added for EditProfile compatibility
    memberSince: "January 2023",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 012-3456",
    location: "San Francisco, CA",
    avatar: "https://ui-avatars.com/api/?name=Alex+Morgan&background=d7a444&color=0b2d49&size=200",
    bio: "Tech enthusiast and art lover. I enjoy attending community-driven events and networking with professionals across industries.",
    interests: ["Music", "Arts", "Tech", "Sustainability", "Workshops", "Networking"]
};

export const userActivitiesData = [
    {
        id: 1,
        type: "purchase",
        title: "Purchased tickets for Neon Lights Concert",
        description: "Alex bought 2 General Admission tickets for the event on Oct 28.",
        time: "2 hours ago",
        icon: <BsTicketPerforated className="text-emerald-500" />,
        bgColor: "bg-emerald-50"
    },
    {
        id: 2,
        type: "review",
        title: "Left a review for Tech Future Summit",
        description: '"Amazing organization and insightful panels. Highly recommend!"',
        time: "1 day ago",
        icon: <BsStar className="text-amber-500" />,
        bgColor: "bg-amber-50"
    },
    {
        id: 3,
        type: "share",
        title: 'Shared "AI for Good" Hackathon',
        description: "Event shared to Facebook and LinkedIn networks.",
        time: "3 days ago",
        icon: <BsShare className="text-blue-500" />,
        bgColor: "bg-blue-50"
    },
    {
        id: 4,
        type: "follow",
        title: 'Followed "Green Earth Collective"',
        description: "Now receiving updates for new sustainability events from this organizer.",
        time: "1 week ago",
        icon: <BsPersonPlus className="text-teal-500" />,
        bgColor: "bg-teal-50"
    }
];
