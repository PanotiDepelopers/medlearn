/**
 * Check if the user has any approved purchases
 * Returns true if they have at least one approved purchase
 */
export const hasApprovedPurchases = (user) => {
  if (!user || !user.purchases || !Array.isArray(user.purchases)) {
    return false;
  }
  
  return user.purchases.some(
    (purchase) => 
      purchase.status === 'approved' || 
      purchase.status === 'approved_manual'
  );
};

/**
 * Get the default landing page based on user purchases
 */
export const getLandingRoute = (user) => {
  return hasApprovedPurchases(user) ? '/my-courses' : '/';
};