export const termsOfService = {
  title: "Terms of Service",
  intro: "Welcome to Okkazo Vendor Platform",
  description: "By registering as a vendor on Okkazo, you agree to the following terms and conditions:",
  sections: [
    {
      title: "1. Vendor Eligibility",
      content: "You must be a legally registered business entity with valid documentation to register as a vendor. All information provided must be accurate and up-to-date."
    },
    {
      title: "2. Service Standards",
      content: "Vendors are expected to maintain high-quality service standards, respond to inquiries within 24 hours, and honor all confirmed bookings."
    },
    {
      title: "3. Fees & Payments",
      content: "Okkazo charges a platform fee on successful bookings. Payment processing is handled securely through our payment partners."
    },
    {
      title: "4. Content Guidelines",
      content: "All content uploaded must be original or properly licensed. Inappropriate or misleading content will result in account suspension."
    },
    {
      title: "5. Termination",
      content: "Okkazo reserves the right to terminate vendor accounts that violate these terms or receive consistent negative feedback."
    }
  ],
  lastUpdated: "January 2026"
};

export const privacyPolicy = {
  title: "Privacy Policy",
  intro: "Your Privacy Matters to Us",
  description: "This policy describes how Okkazo collects, uses, and protects your personal information.",
  sections: [
    {
      title: "1. Information We Collect",
      content: "We collect business information, contact details, identity documents, and service-related data that you provide during registration and platform usage."
    },
    {
      title: "2. How We Use Your Information",
      content: "Your information is used to verify your identity, process bookings, facilitate payments, and improve our platform services."
    },
    {
      title: "3. Data Security",
      content: "We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your data."
    },
    {
      title: "4. Data Sharing",
      content: "We do not sell your personal data. Information may be shared with event organizers for booking purposes and with payment processors for transactions."
    },
    {
      title: "5. Your Rights",
      content: "You have the right to access, correct, or delete your personal information. Contact our support team for any privacy-related requests."
    }
  ],
  lastUpdated: "January 2026"
};

export const fileUploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB in bytes
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
  maxOtherProofs: 3
};
