export const DEFAULT_MAX_PRICE_MULTIPLIER = 1.5;

const normalizeKey = (value) => String(value || '').trim().toLowerCase();

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
  const unit = normalizeKey(pricingUnit);
  if (unit === 'per_plate' || unit === 'per_person') return true;
  if (unit === 'event') return false;

  const label = normalizeKey(serviceLabel);
  const category = normalizeKey(serviceCategory);
  const catId = normalizeKey(categoryId);

  if (catId === 'catering') return true;
  if (catId === 'makeup') return true;

  if (label.includes('catering')) return true;
  if (label.includes('makeup')) return true;

  if (category.includes('catering')) return true;
  if (category.includes('makeup')) return true;

  return false;
};

export const computeMoneyRangeFromBase = ({
  basePrice,
  guestCount,
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

  const perAttendee = isPerAttendeePricing({ serviceLabel, serviceCategory, categoryId, pricingUnit });
  const attendeesRaw = Number(guestCount ?? 0);
  const attendeeCountForPricing = perAttendee
    ? Math.max(1, Number.isFinite(attendeesRaw) ? attendeesRaw : 0)
    : 1;

  const min = Math.round(unitPrice * attendeeCountForPricing);
  const max = Math.ceil(min * safeMultiplier);

  return {
    min: Number.isFinite(min) && min > 0 ? min : 0,
    max: Number.isFinite(max) && max > 0 ? max : 0,
  };
};
