// helpers.js
export const getWaterLevelStatus = (level) => {
  if (level === null || level === undefined || level < 0) return { status: 'ERROR', color: 'text-muted', badge: 'badge-neutral' };
  if (level > 40) return { status: 'NORMAL', color: 'text-success', badge: 'badge-success' };
  if (level > 0) return { status: 'LOW_WATER', color: 'text-warning', badge: 'badge-warning' };
  return { status: 'EMPTY', color: 'text-danger', badge: 'badge-danger' };
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
};

export const formatTimeAgo = (isoString) => {
  if (!isoString) return '--';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '--';
  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min ago`;
  if (seconds > 0) return `${seconds} sec ago`;
  return 'Just now';
};

export const getBatteryHealth = (percentage) => {
  if (percentage === null || percentage === undefined) return { label: 'UNKNOWN', color: 'neutral' };
  if (percentage > 50) return { label: 'GOOD', color: 'success' };
  if (percentage >= 20) return { label: 'FAIR', color: 'warning' };
  return { label: 'LOW', color: 'danger' };
};

export const getSignalStrengthLabel = (strength) => {
  if (strength === null || strength === undefined) return { label: 'UNKNOWN', color: 'neutral' };
  if (strength > 80) return { label: 'Excellent', color: 'success' };
  if (strength >= 60) return { label: 'Good', color: 'success' };
  if (strength >= 40) return { label: 'Fair', color: 'warning' };
  return { label: 'Poor', color: 'danger' };
};
