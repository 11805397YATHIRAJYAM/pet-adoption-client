import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return '';
  try {
    return format(typeof date === 'string' ? parseISO(date) : date, fmt);
  } catch {
    return '';
  }
};

export const timeAgo = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true });
  } catch {
    return '';
  }
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
};

export const formatPetAge = (age) => {
  if (!age) return 'Unknown';
  const { value, unit } = age;
  return `${value} ${unit}${value !== 1 ? '' : ''}`;
};

export const getStatusColor = (status) => {
  const colors = {
    available: 'badge-green',
    pending: 'badge-orange',
    adopted: 'badge-blue',
    fostered: 'badge-blue',
    hold: 'badge-gray',
    approved: 'badge-green',
    rejected: 'badge-red',
    cancelled: 'badge-gray',
    under_review: 'badge-orange',
    info_requested: 'badge-orange',
    confirmed: 'badge-green',
    completed: 'badge-blue',
    active: 'badge-green',
  };
  return colors[status] || 'badge-gray';
};

export const getStatusLabel = (status) => {
  const labels = {
    available: 'Available',
    pending: 'Pending',
    adopted: 'Adopted',
    fostered: 'Fostered',
    hold: 'On Hold',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    under_review: 'Under Review',
    info_requested: 'Info Requested',
    confirmed: 'Confirmed',
    completed: 'Completed',
    active: 'Active',
    no_show: 'No Show',
    rescheduled: 'Rescheduled',
  };
  return labels[status] || status;
};

export const getPetImageUrl = (pet) => {
  if (!pet) return '/placeholder-pet.jpg';
  const primary = pet.images?.find((i) => i.isPrimary) || pet.images?.[0];
  return primary?.url || '/placeholder-pet.jpg';
};

export const getAvatarUrl = (user) => {
  return user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=f97316&color=fff&rounded=true`;
};

export const truncate = (str, len = 100) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
};

export const buildQueryString = (params) => {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return new URLSearchParams(filtered).toString();
};
