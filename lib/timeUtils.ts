const JAMAICA_TIMEZONE = 'America/Jamaica';

export function formatJamaicanDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    timeZone: JAMAICA_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatJamaicanDateShort(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    timeZone: JAMAICA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');
}

export function formatTime(timeString: string): string {
  if (!timeString) return 'N/A';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function formatJamaicanDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    timeZone: JAMAICA_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function getCurrentJamaicanTime(): Date {
  const now = new Date();
  const jamaicaTime = new Date(now.toLocaleString('en-US', { timeZone: JAMAICA_TIMEZONE }));
  return jamaicaTime;
}
