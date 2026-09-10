import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import Spinner from '../common/Spinner';

const Purchases = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const data = await authAPI.verify();
      setPurchases(data.purchases || []);
      
      // Update user context
      updateUser({
        purchases: data.purchases || [],
        hasSubscription: data.hasSubscription || false,
        subscription: data.subscription || {}
      });
    } catch (error) {
      console.error('Failed to load purchases:', error);
      // Fallback to local data
      setPurchases(user?.purchases || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'approved': { class: 'approved', icon: '✅', text: 'Approved' },
      'approved_manual': { class: 'approved', icon: '✅', text: 'Approved' },
      'pending_approval': { class: 'pending', icon: '⏳', text: 'Pending Approval' },
      'pending': { class: 'pending', icon: '⏳', text: 'Pending' },
      'rejected': { class: 'rejected', icon: '❌', text: 'Rejected' }
    };
    const result = statusMap[status] || statusMap['pending'];
    return result;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="init-spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: '12px', color: 'var(--ink-soft)' }}>Loading purchase history...</p>
      </div>
    );
  }

  if (!purchases || purchases.length === 0) {
    return (
      <div className="empty" style={{ marginTop: '2rem' }}>
        <span className="empty-icon">
          <i className="fas fa-receipt" style={{ fontSize: '22px' }}></i>
        </span>
        <h3>No Purchase History</h3>
        <p>You haven't made any purchases yet.</p>
        <button 
          className="btn-primary" 
          style={{ marginTop: '16px' }} 
          onClick={() => window.location.href = '/'}
        >
          <i className="fas fa-shopping-bag"></i> Browse Courses
        </button>
      </div>
    );
  }

  // Sort by date (newest first)
  const sortedPurchases = [...purchases].sort((a, b) => {
    const dateA = a.purchaseDate ? new Date(a.purchaseDate) : new Date(0);
    const dateB = b.purchaseDate ? new Date(b.purchaseDate) : new Date(0);
    return dateB - dateA;
  });

  return (
    <>
      <div className="view-head">
        <div className="view-head-text">
          <div className="view-title-group">
            <h1>📋 Purchase History</h1>
            <p>{purchases.length} purchase{purchases.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="list-view">
        {sortedPurchases.map((purchase, index) => {
          const statusInfo = getStatusBadge(purchase.status);
          const itemNames = purchase.items?.map(i => i.name || 'Unnamed').join(', ') || 'Unknown items';
          const totalAmount = purchase.total || 0;
          const purchaseType = purchase.type || 'package';
          const purchaseDate = formatDate(purchase.purchaseDate);
          
          // Determine border color based on status
          const borderColor = statusInfo.class === 'approved' ? 'var(--success)' :
                             statusInfo.class === 'pending' ? 'var(--warning)' : 'var(--danger)';

          return (
            <div 
              key={purchase._id || index} 
              className="row" 
              style={{ 
                borderLeft: `4px solid ${borderColor}`,
                cursor: 'default'
              }}
            >
              <span className="row-icon" style={{ 
                background: statusInfo.class === 'approved' ? 'var(--success-soft)' :
                           statusInfo.class === 'pending' ? 'var(--warning-soft)' : 'var(--danger-soft)',
                color: statusInfo.class === 'approved' ? 'var(--success)' :
                       statusInfo.class === 'pending' ? 'var(--warning)' : 'var(--danger)'
              }}>
                <i className={`fas ${statusInfo.class === 'approved' ? 'fa-check-circle' :
                                   statusInfo.class === 'pending' ? 'fa-clock' : 'fa-times-circle'}`}></i>
              </span>
              
              <span className="row-body">
                <span className="row-top">
                  <span className="row-name">{itemNames}</span>
                  <span className="row-tag" style={{ 
                    background: statusInfo.class === 'approved' ? 'var(--success-soft)' :
                               statusInfo.class === 'pending' ? 'var(--warning-soft)' : 'var(--danger-soft)',
                    color: statusInfo.class === 'approved' ? 'var(--success)' :
                           statusInfo.class === 'pending' ? 'var(--warning)' : 'var(--danger)'
                  }}>
                    {statusInfo.icon} {statusInfo.text}
                  </span>
                </span>
                <span className="row-meta">
                  <span className="chip">
                    <i className="fas fa-calendar"></i> {purchaseDate}
                  </span>
                  <span className="chip">
                    <i className="fas fa-tag"></i> ${totalAmount.toFixed(2)}
                  </span>
                  <span className="chip">
                    <i className="fas fa-box"></i> {purchaseType}
                  </span>
                  {purchase._id && (
                    <span className="chip" style={{ fontSize: '0.6rem', color: 'var(--ink-faint)' }}>
                      ID: {String(purchase._id).substring(0, 8)}
                    </span>
                  )}
                </span>
                
                {/* Show items if multiple */}
                {purchase.items && purchase.items.length > 1 && (
                  <div style={{ 
                    marginTop: '8px', 
                    paddingLeft: '8px', 
                    borderLeft: '2px solid var(--accent-soft)'
                  }}>
                    <div style={{ 
                      fontSize: '0.68rem', 
                      fontWeight: 600, 
                      color: 'var(--ink-faint)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.04em', 
                      marginBottom: '4px' 
                    }}>
                      <i className="fas fa-list"></i> {purchase.items.length} items
                    </div>
                    {purchase.items.slice(0, 5).map((item, idx) => (
                      <div 
                        key={idx}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontSize: '0.72rem', 
                          color: 'var(--ink-soft)', 
                          padding: '2px 0'
                        }}
                      >
                        <span style={{ color: 'var(--accent)', fontSize: '10px' }}>▸</span>
                        <span>{item.name || 'Unnamed'}</span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--ink-faint)' }}>
                          ({item.item_type || 'item'})
                        </span>
                        {item.price > 0 && (
                          <span style={{ fontSize: '0.6rem', color: 'var(--ink-faint)' }}>
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    ))}
                    {purchase.items.length > 5 && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--ink-faint)', padding: '2px 0' }}>
                        + {purchase.items.length - 5} more items
                      </div>
                    )}
                  </div>
                )}
              </span>
              <span className="row-actions">
                <span className="chev">
                  <i className="fas fa-chevron-right" style={{ color: 'var(--ink-faint)', fontSize: '12px' }}></i>
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Purchases;