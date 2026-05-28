type DateStyle = 'short' | 'long';

export const formatOrderDate = (value: string | Date, language: string, style: DateStyle = 'short') => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(language.startsWith('ar') ? 'ar-EG' : 'en-US', {
    day: '2-digit',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};
