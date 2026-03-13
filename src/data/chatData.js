export const chatContacts = [
    {
        id: 'u1',
        name: 'David H.',
        role: 'System Admin',
        type: 'admin',
        lastSeen: '10 mins ago',
        online: true,
        permissions: 'All Access',
    },
    {
        id: 'u2',
        name: 'Elena Wells',
        role: 'Host',
        type: 'client',
        lastSeen: '2 hours ago',
        online: false,
    },
    {
        id: 'u3',
        name: 'Marcus',
        role: 'On-site Staff',
        type: 'team',
        lastSeen: 'Just now',
        online: true,
    },
    {
        id: 'u4',
        name: 'Sarah Jenkins',
        role: 'Lead Planner',
        type: 'team',
        lastSeen: '1 hour ago',
        online: false,
    },
    {
        id: 'v1',
        name: 'Gourmet Catering',
        role: 'Catering',
        type: 'vendor',
        lastSeen: 'Just now',
        online: true,
        service: 'Food & Beverage'
    },
    {
        id: 'v2',
        name: 'Crystal Clear AV',
        role: 'A/V Team',
        type: 'vendor',
        lastSeen: '15 mins ago',
        online: false,
        service: 'Audio/Visual'
    }
];

export const chatMessages = [
    {
        id: 1,
        senderId: 'manager', 
        receiverId: 'v1',
        text: 'Hello Gourmet Catering, are we still on track for the 10 AM setup?',
        timestamp: '10:00 AM',
        status: 'read'
    },
    {
        id: 2,
        senderId: 'v1',
        receiverId: 'manager',
        text: 'Yes everything is on schedule! We are loading the trucks now.',
        timestamp: '10:05 AM',
        status: 'read'
    },
    {
        id: 3,
        senderId: 'manager',
        receiverId: 'v1',
        text: 'Perfect. The loading dock is clear.',
        timestamp: '10:10 AM',
        status: 'delivered'
    },
    {
        id: 4,
        senderId: 'u3', // Marcus
        receiverId: 'manager',
        text: 'Setup is starting in the main hall.',
        timestamp: '09:00 AM',
        status: 'read'
    },
    {
        id: 5,
        senderId: 'u2', // Client
        receiverId: 'manager',
        text: 'Can we check the floor plan one more time when you arrive?',
        timestamp: 'Yesterday',
        status: 'read'
    },
    {
        id: 6,
        senderId: 'u3', // Marcus
        receiverId: 'manager',
        text: 'The stage equipment has arrived.',
        timestamp: '09:15 AM',
        status: 'delivered'
    }
];
