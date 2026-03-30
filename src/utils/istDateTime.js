const IST_TIMEZONE = 'Asia/Kolkata';
const IST_OFFSET = '+05:30';

const IST_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: IST_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const toDateOrNull = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const getIstParts = (value) => {
  const d = toDateOrNull(value);
  if (!d) return null;

  const parts = IST_FORMATTER.formatToParts(d);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
    second: map.second,
  };
};

export const toIstDayString = (value) => {
  const parts = getIstParts(value);
  if (!parts) return null;
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const toIstIsoString = (value) => {
  const parts = getIstParts(value);
  if (!parts) return null;
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${IST_OFFSET}`;
};

export const toIstDateTimeLocalInput = (value) => {
  const parts = getIstParts(value);
  if (!parts) return null;
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

export const getIstDayStringFromNow = (daysAhead = 0) => {
  const todayIst = toIstDayString(new Date());
  if (!todayIst) return null;

  const base = new Date(`${todayIst}T00:00:00${IST_OFFSET}`);
  base.setUTCDate(base.getUTCDate() + (Number(daysAhead) || 0));
  return toIstDayString(base);
};

export const getInclusiveIstDayRange = (startValue, endValue) => {
  const startDay = toIstDayString(startValue);
  const endDay = toIstDayString(endValue || startValue);
  if (!startDay || !endDay) return [];

  const start = new Date(`${startDay}T00:00:00${IST_OFFSET}`);
  const end = new Date(`${endDay}T00:00:00${IST_OFFSET}`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const days = [];
  const cursor = new Date(start.getTime());
  const safeEnd = start.getTime() <= end.getTime() ? end : start;
  let guard = 0;

  while (cursor.getTime() <= safeEnd.getTime() && guard < 400) {
    const day = toIstDayString(cursor);
    if (day) days.push(day);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard += 1;
  }

  return days;
};
