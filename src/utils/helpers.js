export const formatPrice = (price) => {
  return '$' + Number(price).toFixed(2);
};

export const truncateString = (str, maxLength = 50) => {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.charAt(0).toUpperCase();
};

export const getStatusBadge = (status) => {
  const statusMap = {
    approved: { class: 'approved', text: '✅ Approved' },
    pending: { class: 'pending', text: '⏳ Pending' },
    rejected: { class: 'rejected', text: '❌ Rejected' }
  };
  return statusMap[status] || { class: 'pending', text: '📝 ' + status };
};