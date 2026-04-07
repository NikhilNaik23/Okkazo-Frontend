import React from 'react';
import {
  BsBell,
  BsCalendarCheck,
  BsCashCoin,
  BsExclamationTriangle,
  BsMegaphone,
  BsShieldLock,
  BsTicketPerforated,
} from 'react-icons/bs';

const toDate = (value) => {
  if (!value) return null;
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const formatRelativeTime = (value) => {
  const dt = toDate(value);
  if (!dt) return 'Just now';

  const diffMs = dt.getTime() - Date.now();
  const absMs = Math.abs(diffMs);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMs < minute) {
    return 'Just now';
  }

  if (absMs < hour) {
    return relativeFormatter.format(Math.round(diffMs / minute), 'minute');
  }

  if (absMs < day) {
    return relativeFormatter.format(Math.round(diffMs / hour), 'hour');
  }

  if (absMs < 7 * day) {
    return relativeFormatter.format(Math.round(diffMs / day), 'day');
  }

  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dt.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
};

const getVisualByCategory = ({ category, type }) => {
  const categoryUpper = String(category || '').trim().toUpperCase();
  const typeUpper = String(type || '').trim().toUpperCase();

  if (categoryUpper === 'PROMOTION') {
    return {
      icon: <BsMegaphone className="text-purple-600" />,
      bgColor: 'bg-purple-50',
    };
  }

  if (categoryUpper === 'TICKET' || typeUpper.includes('TICKET')) {
    return {
      icon: <BsTicketPerforated className="text-emerald-500" />,
      bgColor: 'bg-emerald-50',
    };
  }

  if (categoryUpper === 'PAYMENT' || categoryUpper === 'PAYOUT') {
    return {
      icon: <BsCashCoin className="text-amber-500" />,
      bgColor: 'bg-amber-50',
    };
  }

  if (categoryUpper === 'SECURITY') {
    return {
      icon: <BsShieldLock className="text-rose-500" />,
      bgColor: 'bg-rose-50',
    };
  }

  if (categoryUpper === 'EVENT') {
    return {
      icon: <BsCalendarCheck className="text-blue-500" />,
      bgColor: 'bg-blue-50',
    };
  }

  if (typeUpper.includes('FAILED') || typeUpper.includes('REJECTED')) {
    return {
      icon: <BsExclamationTriangle className="text-rose-500" />,
      bgColor: 'bg-rose-50',
    };
  }

  return {
    icon: <BsBell className="text-sky-500" />,
    bgColor: 'bg-sky-50',
  };
};

export const mapNotificationsForUI = (items = []) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item, idx) => {
      const id = String(item?.notificationId || item?._id || `notification-${idx}`).trim();
      const title = String(item?.title || 'Notification').trim() || 'Notification';
      const message = String(item?.message || '').trim() || 'You have a new notification.';
      const unread = Boolean(item?.unread);
      const createdAt = toDate(item?.createdAt);
      const time = formatRelativeTime(createdAt || item?.createdAt);
      const visual = getVisualByCategory(item || {});

      return {
        id,
        title,
        message,
        time,
        unread,
        icon: visual.icon,
        bgColor: visual.bgColor,
        actionUrl: item?.actionUrl || null,
        category: String(item?.category || '').trim().toUpperCase(),
        type: String(item?.type || '').trim().toUpperCase(),
        createdAt: createdAt ? createdAt.toISOString() : null,
      };
    })
    .sort((a, b) => {
      const aTime = toDate(a.createdAt)?.getTime() || 0;
      const bTime = toDate(b.createdAt)?.getTime() || 0;
      return bTime - aTime;
    });
};

export const groupNotificationsForUI = (items = []) => {
  const normalized = mapNotificationsForUI(items);

  const unreadItems = normalized.filter((item) => item.unread);
  const pastItems = normalized.filter((item) => !item.unread);

  return {
    new: unreadItems,
    promotions: pastItems.filter((item) => item.category === 'PROMOTION'),
    earlier: pastItems.filter((item) => item.category !== 'PROMOTION'),
    all: normalized,
  };
};
