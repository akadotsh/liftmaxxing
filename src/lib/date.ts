export const formatDateKey = (date: Date) =>
  [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0'))
    .join('-');

export const parseDateKey = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const displayDate = (date: string) =>
  parseDateKey(date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const isValidDateKey = (date: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  formatDateKey(parseDateKey(date)) === date &&
  date <= formatDateKey(new Date());
