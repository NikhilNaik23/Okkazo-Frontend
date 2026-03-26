import { useContext } from 'react';
import StaffUnreadContext from './staffUnreadContextObject';

export const useStaffUnread = () => useContext(StaffUnreadContext);
