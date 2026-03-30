const toIntOr = (value, fallback = 0) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getTierDescriptors = (tickets = []) => {
  return (Array.isArray(tickets) ? tickets : []).map((t, idx) => ({
    id: String(t?.id ?? `tier-${idx}`),
    name: String(t?.name || '').trim(),
    quantity: Math.max(0, toIntOr(t?.quantity, 0)),
  }));
};

export const getDayTierTotal = (dayEntry = {}, tierIds = []) => {
  return tierIds.reduce((sum, tierId) => sum + Math.max(0, toIntOr(dayEntry?.[tierId], 0)), 0);
};

export const normalizeDayTierAllocations = ({
  days = [],
  tickets = [],
  existing = {},
  dayAllocations = {},
  ticketType = 'paid',
} = {}) => {
  const tierDescriptors = getTierDescriptors(tickets);
  const tierIds = tierDescriptors.map((t) => t.id);
  const tierCaps = Object.fromEntries(tierDescriptors.map((t) => [t.id, t.quantity]));
  const out = {};

  for (const day of (Array.isArray(days) ? days : [])) {
    const source = existing && typeof existing === 'object' && existing[day] && typeof existing[day] === 'object'
      ? existing[day]
      : {};

    const entry = {};
    for (const tierId of tierIds) {
      const parsed = toIntOr(source[tierId], NaN);
      if (!Number.isFinite(parsed) || parsed < 0) {
        entry[tierId] = '';
        continue;
      }
      entry[tierId] = Math.min(parsed, Math.max(0, tierCaps[tierId] || 0));
    }

    if (ticketType === 'free' && tierIds.length === 1) {
      const dayTotal = Math.max(0, toIntOr(dayAllocations?.[day], 0));
      entry[tierIds[0]] = dayTotal;
    }

    out[day] = entry;
  }

  return out;
};

export const validateDayTierAllocations = ({
  days = [],
  tickets = [],
  dayAllocations = {},
  dayTierAllocations = {},
} = {}) => {
  const safeDays = Array.isArray(days) ? days : [];
  const tierDescriptors = getTierDescriptors(tickets);
  const tierIds = tierDescriptors.map((t) => t.id);

  const tierTargetById = Object.fromEntries(tierDescriptors.map((t) => [t.id, t.quantity]));
  const tierTotalById = Object.fromEntries(tierIds.map((id) => [id, 0]));
  const dayTotalByDay = {};

  const hasDays = safeDays.length > 0;
  const allDaysHaveAllocations = hasDays && safeDays.every((day) => Math.max(0, toIntOr(dayAllocations?.[day], 0)) > 0);

  const perDayTotalsMatch = hasDays && safeDays.every((day) => {
    const dayEntry = dayTierAllocations?.[day] && typeof dayTierAllocations[day] === 'object'
      ? dayTierAllocations[day]
      : {};

    const dayTotal = getDayTierTotal(dayEntry, tierIds);
    dayTotalByDay[day] = dayTotal;

    for (const tierId of tierIds) {
      tierTotalById[tierId] += Math.max(0, toIntOr(dayEntry[tierId], 0));
    }

    const expectedDay = Math.max(0, toIntOr(dayAllocations?.[day], 0));
    return dayTotal === expectedDay;
  });

  const perTierTotalsMatch = tierIds.every((tierId) => {
    return Math.max(0, toIntOr(tierTotalById[tierId], 0)) === Math.max(0, toIntOr(tierTargetById[tierId], 0));
  });

  return {
    hasDays,
    allDaysHaveAllocations,
    perDayTotalsMatch,
    perTierTotalsMatch,
    tierTargetById,
    tierTotalById,
    dayTotalByDay,
    isValid: hasDays && allDaysHaveAllocations && perDayTotalsMatch && perTierTotalsMatch,
  };
};

export const mapDayTierAllocationsFromBackend = ({
  dayWiseAllocations = [],
  tickets = [],
} = {}) => {
  const safeRows = Array.isArray(dayWiseAllocations) ? dayWiseAllocations : [];
  const safeTickets = Array.isArray(tickets) ? tickets : [];

  const nameToId = Object.fromEntries(
    safeTickets
      .map((t) => ({
        id: String(t?.id ?? ''),
        name: String(t?.name || '').trim(),
      }))
      .filter((t) => t.id && t.name)
      .map((t) => [t.name, t.id])
  );

  const out = {};
  for (const row of safeRows) {
    const day = String(row?.day || '').trim();
    if (!day) continue;

    const breakdown = Array.isArray(row?.tierBreakdown) ? row.tierBreakdown : [];
    const entry = {};

    for (const item of breakdown) {
      const tierName = String(item?.tierName || '').trim();
      const tierId = nameToId[tierName];
      if (!tierId) continue;
      const count = Math.max(0, toIntOr(item?.ticketCount, 0));
      entry[tierId] = count;
    }

    out[day] = entry;
  }

  return out;
};
