import React from 'react';

export const termsContent = (
    <div className="space-y-4">
        <p>
            <strong>1. Acceptance of Terms</strong>
            <br />
            By accessing and using Okkazo, you agree to be bound by these Terms and
            Conditions.
        </p>
        <p>
            <strong>2. User Accounts</strong>
            <br />
            You are responsible for maintaining the confidentiality of your account
            credentials and for all activities that occur under your account.
        </p>
        <p>
            <strong>3. Event Management</strong>
            <br />
            Organizers must provide accurate information about events. Okkazo is not
            responsible for cancellations or disputes between organizers and
            attendees.
        </p>
        <p>
            <strong>4. Payments & Refunds</strong>
            <br />
            All transactions are processed securely. Refund policies are determined
            by the individual event organizers.
        </p>
        <p>
            <strong>5. Termination</strong>
            <br />
            We reserve the right to terminate accounts that violate our community
            guidelines or terms of service.
        </p>
    </div>
);

export const privacyContent = (
    <div className="space-y-4">
        <p>
            <strong>1. Information Collection</strong>
            <br />
            We collect information you provide directly to us, such as your name,
            email, and payment details.
        </p>
        <p>
            <strong>2. Use of Information</strong>
            <br />
            We use your info to facilitate event registration, improve our services,
            and communicate with you.
        </p>
        <p>
            <strong>3. Data Sharing</strong>
            <br />
            We do not sell your personal data. We share data with event organizers
            for the events you register for.
        </p>
        <p>
            <strong>4. Security</strong>
            <br />
            We employ industry-standard security measures to protect your data.
        </p>
        <p>
            <strong>5. Your Rights</strong>
            <br />
            You have the right to access, correct, or delete your personal
            information at any time.
        </p>
    </div>
);

// Input field icons as SVG paths
export const inputIcons = {
    user: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
    ),
    email: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
    ),
    password: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
    ),
    confirmPassword: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
    )
};
