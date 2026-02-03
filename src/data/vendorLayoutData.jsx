import React from "react";
import { 
  BsGrid, 
  BsBriefcase, 
  BsCalendarCheck, 
  BsChatDots, 
  BsPersonBadge
} from "react-icons/bs";

export const vendorSidebarMenus = [
  { name: "Dashboard", icon: <BsGrid />, path: "/vendor/dashboard" },
  { name: "My Services", icon: <BsBriefcase />, path: "/vendor/service-management" },
  { name: "Booked Events", icon: <BsCalendarCheck />, path: "/vendor/booked-events" },
  { name: "Messages", icon: <BsChatDots />, path: "/vendor/messages" },
  { name: "Business Profile", icon: <BsPersonBadge />, path: "/vendor/profile" },
];

export const vendorLayoutData = {
  name: "Gourmet Catering",
  role: "Service Provider"
};
