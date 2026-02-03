export const eventDetailsData = {
  title: "Annual Tech Gala 2024",
  status: "IN PROGRESS",
  category: "Corporate Event",
  subCategory: "Private Category",
  services: [
    { type: "VENUE", name: "Crystal Hall Pavilion", icon: "Building2" },
    { type: "CATERING", name: "Premium Fusion Menu", icon: "Utensils" },
    { type: "PHOTOGRAPHY", name: "Cinematic High-Key", icon: "Camera" },
  ],
  budget: {
    original: "15,000.00",
    revised: "18,200.00",
    final: "22,900.00"
  },
  transactions: [
    { id: "TXN-882190", date: "22 Oct, 2023", amount: "12,400.00", method: "Wire Transfer", status: "PAID" },
    { id: "TXN-882245", date: "28 Oct, 2023", amount: "4,500.00", method: "Credit Card", status: "PENDING" },
  ],
  manager: "Marcus Aurelius",
  vendors: [
    { name: "Luxe Catering Co.", status: "CONFIRMED" },
    { name: "Neon Sound Systems", status: "PENDING" }
  ],
  logs: [
    { title: "Contract approved by Admin", time: "Today • 10:45 AM", type: "success" },
    { title: "Vendor requested budget revision", time: "Yesterday • 4:20 PM", type: "warning" },
    { title: "Initial planning phase complete", time: "Oct 20 • 9:15 AM", type: "info" }
  ]
};
