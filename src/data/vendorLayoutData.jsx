import React from "react";
import { 
  BsGrid, 
  BsBriefcase, 
  BsCalendarCheck, 
  BsPersonBadge,
  BsCashStack,
  BsExclamationCircle
} from "react-icons/bs";

export const vendorSidebarMenus = [
  { name: "Dashboard", icon: <BsGrid />, path: "/vendor/dashboard" },
  { name: "My Services", icon: <BsBriefcase />, path: "/vendor/service-management" },
  { name: "Booked Events", icon: <BsCalendarCheck />, path: "/vendor/booked-events" },
  { name: "Complaints", icon: <BsExclamationCircle />, path: "/vendor/messages" },
  { name: "Ledger", icon: <BsCashStack />, path: "/vendor/dashboard/ledger" },
  { name: "Business Profile", icon: <BsPersonBadge />, path: "/vendor/profile" },
];

export const vendorLayoutData = {
  name: "Gourmet Catering",
  role: "Service Provider"
};
