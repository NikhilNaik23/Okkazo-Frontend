export const planningWizardSteps = [
  { id: 1, title: "Event Details", desc: "Basic info & preferences" },
  { id: 2, title: "Category Selection", desc: "Choose service categories" },
  { id: 3, title: "Payment", desc: "Secure your booking" },
  { id: 4, title: "Vendor Selection", desc: "Choose your team" },
  { id: 5, title: "Review & Bill", desc: "Finalize your plan" },
  { id: 6, title: "Confirmation", desc: "All set!" }
];

export const vendorServiceCategories = [
  "Venue",
  "Catering & Drinks",
  "Photography",
  "Videography",
  "Decor & Styling",
  "Entertainment & Artists",
  "Makeup & Grooming",
  "Invitations & Printing",
  "Sound & Lighting",
  "Equipment Rental",
  "Security & Safety",
  "Transportation",
  "Live Streaming & Media",
  "Cake & Desserts",
];

// High Demand Logic:
// - Dates from Today+6 to Today+20 are High Demand.
// - Dates before Today+6 are unavailable (handled by minDate).
// - Dates after Today+20 are Standard.

export const isDateHighDemand = (dateString) => {
    if (!dateString) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);
    
    // transform into milliseconds
    const diffTime = selectedDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // High demand window: 6 to 20 days from now
    return diffDays >= 6 && diffDays <= 20;
};
