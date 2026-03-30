export const DEFAULT_MAX_PRICE_MULTIPLIER = 1.5;

const normalizeKey = (value) => String(value || '').trim().toLowerCase();

const PER_ATTENDEE_CATEGORY_IDS = new Set(['catering', 'makeup']);
const PER_DAY_CATEGORY_IDS = new Set([
  'venues',
  'photography',
  'videography',
  'decor',
  'entertainment',
  'sound',
  'rental',
  'security',
  'transport',
  'media',
]);
const FIXED_CATEGORY_IDS = new Set(['cakes', 'invitations']);

const normalizeServiceContext = ({ serviceLabel, serviceCategory, categoryId, pricingUnit } = {}) => {
  const unit = normalizeKey(pricingUnit);
  const label = normalizeKey(serviceLabel);
  const category = normalizeKey(serviceCategory);
  const catId = normalizeKey(categoryId);

  return {
    unit,
    label,
    category,
    catId,
    merged: `${label} ${category} ${catId}`.trim(),
  };
};

const toPositiveNumberOrNull = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
};

const toTierTicketCount = (tierLike) => {
  const n = Number(
    tierLike?.ticketCount ?? tierLike?.quantity ?? tierLike?.count ?? tierLike?.tickets ?? 0
  );
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const toInclusiveDayCount = (startValue, endValue) => {
  const start = new Date(startValue);
  const end = new Date(endValue ?? startValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  const safeEnd = endUtc >= startUtc ? endUtc : startUtc;
  const diffDays = Math.floor((safeEnd - startUtc) / (24 * 60 * 60 * 1000)) + 1;

  return Number.isFinite(diffDays) && diffDays > 0 ? diffDays : null;
};

export const derivePricingDemandFromEvent = (eventLike = {}) => {
  const listingTypeRaw = String(eventLike?.listingType || eventLike?.category || '').trim().toLowerCase();
  const isPublic = listingTypeRaw === 'public';

  const tickets = eventLike?.tickets && typeof eventLike.tickets === 'object' ? eventLike.tickets : {};
  const ticketTiers = Array.isArray(eventLike?.ticketTiers)
    ? eventLike.ticketTiers
    : (Array.isArray(tickets?.tiers) ? tickets.tiers : []);
  const ticketDayWiseAllocations = Array.isArray(eventLike?.ticketDayWiseAllocations)
    ? eventLike.ticketDayWiseAllocations
    : (Array.isArray(tickets?.dayWiseAllocations) ? tickets.dayWiseAllocations : []);

  const guestCount = toPositiveNumberOrNull(eventLike?.guestCount ?? eventLike?.pax);
  const tierTicketsTotal = ticketTiers.reduce((sum, tier) => sum + toTierTicketCount(tier), 0);
  const attendeesFromTickets = toPositiveNumberOrNull(tierTicketsTotal);
  const attendeeCount = guestCount ?? attendeesFromTickets;

  const nonZeroDayAllocations = ticketDayWiseAllocations.filter((row) => {
    const n = Number(row?.ticketCount ?? 0);
    return Number.isFinite(n) && n > 0;
  }).length;

  const daysFromAllocations = toPositiveNumberOrNull(nonZeroDayAllocations || ticketDayWiseAllocations.length);
  const daysFromSchedule = toInclusiveDayCount(
    eventLike?.schedule?.startAt ?? eventLike?.eventDateFrom,
    eventLike?.schedule?.endAt ?? eventLike?.eventDateTo
  );
  const publicDayCount = toPositiveNumberOrNull(eventLike?.publicDayCount);

  const dayCount = isPublic
    ? (daysFromAllocations ?? daysFromSchedule ?? publicDayCount ?? 1)
    : 1;

  return {
    isPublic,
    attendeeCount: attendeeCount ?? null,
    dayCount: dayCount ?? 1,
  };
};

export const resolveServicePricingModel = ({ serviceLabel, serviceCategory, categoryId, pricingUnit } = {}) => {
  const { unit, catId, merged } = normalizeServiceContext({ serviceLabel, serviceCategory, categoryId, pricingUnit });

  if (unit === 'per_plate' || unit === 'per_person') return 'per_attendee';
  if (unit === 'per_day' || unit === 'event' || unit === 'per_event' || unit === 'per_shift') return 'per_day';
  if (unit === 'per_kg' || unit === 'per_100_units' || unit === 'fixed') return 'fixed';

  if (PER_ATTENDEE_CATEGORY_IDS.has(catId)) return 'per_attendee';
  if (PER_DAY_CATEGORY_IDS.has(catId)) return 'per_day';
  if (FIXED_CATEGORY_IDS.has(catId)) return 'fixed';

  if (merged.includes('catering') || merged.includes('makeup') || merged.includes('grooming')) return 'per_attendee';
  if (
    merged.includes('venue')
    || merged.includes('photo')
    || merged.includes('video')
    || merged.includes('decor')
    || merged.includes('entertainment')
    || merged.includes('sound')
    || merged.includes('lighting')
    || merged.includes('rental')
    || merged.includes('security')
    || merged.includes('transport')
    || merged.includes('media')
  ) {
    return 'per_day';
  }
  if (merged.includes('cake') || merged.includes('dessert') || merged.includes('invitation') || merged.includes('printing')) {
    return 'fixed';
  }

  return 'per_day';
};

export const inferPricingUnit = ({ serviceLabel, serviceCategory, categoryId, pricingUnit } = {}) => {
  const normalizedUnit = normalizeKey(pricingUnit);
  if (normalizedUnit) {
    return String(pricingUnit).trim().toUpperCase();
  }

  const model = resolveServicePricingModel({ serviceLabel, serviceCategory, categoryId, pricingUnit });
  const { catId, merged } = normalizeServiceContext({ serviceLabel, serviceCategory, categoryId, pricingUnit });

  if (model === 'per_attendee') {
    if (catId === 'catering' || merged.includes('catering')) return 'PER_PLATE';
    return 'PER_PERSON';
  }

  if (model === 'fixed') {
    if (catId === 'cakes' || merged.includes('cake') || merged.includes('dessert')) return 'PER_KG';
    if (catId === 'invitations' || merged.includes('invitation') || merged.includes('printing')) return 'PER_100_UNITS';
    return 'FIXED';
  }

  return 'EVENT';
};

/**
 * Derive whether a service price should be multiplied by guestCount.
 *
 * Source of truth: vendor "Add New Service" UI labels.
 * - Catering & Drinks: per plate
 * - Makeup & Grooming: per person
 *
 * Everything else defaults to fixed/event pricing.
 */
export const isPerAttendeePricing = ({ serviceLabel, serviceCategory, categoryId, pricingUnit } = {}) => {
  return resolveServicePricingModel({ serviceLabel, serviceCategory, categoryId, pricingUnit }) === 'per_attendee';
};

export const computeMoneyRangeFromBase = ({
  basePrice,
  guestCount,
  dayCount,
  maxMultiplier = DEFAULT_MAX_PRICE_MULTIPLIER,
  serviceLabel,
  serviceCategory,
  categoryId,
  pricingUnit,
} = {}) => {
  const unitPrice = Number(basePrice ?? 0);
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) return { min: 0, max: 0 };

  const safeMultiplier = Number.isFinite(Number(maxMultiplier)) && Number(maxMultiplier) > 0
    ? Number(maxMultiplier)
    : DEFAULT_MAX_PRICE_MULTIPLIER;

  const pricingModel = resolveServicePricingModel({ serviceLabel, serviceCategory, categoryId, pricingUnit });
  const perAttendee = pricingModel === 'per_attendee';
  const perDay = pricingModel === 'per_day';
  const attendeesRaw = Number(guestCount ?? 0);
  const daysRaw = Number(dayCount ?? 1);
  const attendeeCountForPricing = perAttendee
    ? Math.max(1, Number.isFinite(attendeesRaw) ? attendeesRaw : 0)
    : 1;
  const dayCountForPricing = perDay
    ? Math.max(1, Number.isFinite(daysRaw) ? daysRaw : 1)
    : 1;

  const quantityMultiplier = perAttendee ? attendeeCountForPricing : (perDay ? dayCountForPricing : 1);

  const min = Math.round(unitPrice * quantityMultiplier);
  const max = Math.ceil(min * safeMultiplier);

  return {
    min: Number.isFinite(min) && min > 0 ? min : 0,
    max: Number.isFinite(max) && max > 0 ? max : 0,
  };
};
