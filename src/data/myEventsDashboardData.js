// MyEvents Mock Data

export const promotedCampaigns = [
    {
        id: 'p1',
        title: "Neon Lights Fest",
        subtitle: "OA PERFORMANCE SERIES",
        status: "Live Campaign",
        revenue: "₹1,24,50,000",
        revenueLabel: "Revenue Generated",
        conversion: "4.82%",
        centerText: "70%",
        gradient: "bg-gradient-to-b from-[#7AB2B2]/80 via-[#EBF4F6]/20 to-[#09637E]/90",
        buttonText: "Campaign Analytics"
    },
    {
        id: 'p2',
        title: "The Winter Gala",
        subtitle: "EXCLUSIVE ACCESS HUB",
        status: "Pending Review",
        revenue: "₹85,00,000",
        revenueLabel: "Revenue Target",
        conversion: null,
        centerText: "Locked",
        gradient: "bg-gradient-to-b from-[#EBF4F6]/80 via-[#7AB2B2]/20 to-white/90",
        buttonText: "Edit Submission"
    },
    {
        id: 'p3',
        title: "Opera Premiere",
        subtitle: "SIGNATURE SERIES",
        status: "Sold Out",
        revenue: "₹2,10,00,000",
        revenueLabel: "Total Revenue",
        conversion: "+342%",
        centerText: "Check",
        gradient: "bg-gradient-to-b from-[#d7a444]/80 via-[#f0dbb0]/20 to-white/90",
        buttonText: "Performance Report"
    }
];

// Get gradient based on index
export const getCardGradient = (idx) => {
    const gradients = [
        'bg-gradient-to-t from-[#09637E]/95 via-[#09637E]/20 to-transparent',
        'bg-gradient-to-t from-[#088395]/95 via-[#088395]/20 to-transparent',
        'bg-gradient-to-t from-[#2d5c58]/95 via-[#2d5c58]/20 to-transparent'
    ];
    return gradients[idx % gradients.length];
};
