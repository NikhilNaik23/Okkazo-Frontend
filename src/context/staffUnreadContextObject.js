import { createContext } from 'react';

const StaffUnreadContext = createContext({
  unreadByAuthId: {},
  totalUnreadCount: 0,
  setActiveConversationAuthId: () => {},
  refreshUnreadCounts: async () => {},
});

export default StaffUnreadContext;
