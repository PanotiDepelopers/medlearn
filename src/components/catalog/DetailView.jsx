import React, { useState, useEffect } from 'react';
import { catalogAPI } from '../../api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';
import toast from 'react-hot-toast';

const DetailView = ({ itemId, itemType, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const { addToCart, cart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const loadItem = async () => {
      setLoading(true);
      try {
        let data;
        if (itemType === 'package') {
          data = await catalogAPI.getPackage(itemId);
          setItem(data.package);
        } else {
          data = await catalogAPI.getCourse(itemId);
          setItem(data.course);
        }
      } catch (error) {
        toast.error('Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [itemId, itemType]);

  const isInCart = cart.items?.some(i => i.item_id === String(itemId));
  const isOwned = user?.purchases?.some(p => 
    p.items?.some(i => i.item_id === String(itemId) && p.status === 'approved')
  );

  const handleAddToCart = () => {
    if (!item) return;
    addToCart({
      item_id: String(itemId),
      item_type: itemType,
      name: item.package_name || item.course_name || 'Item',
      price: parseFloat(item.package_price || item.price || 0),
      duration: item.duration || '3 months'
    });
  };

  const handleRemoveFromCart = () => {
    // This would need access to removeFromCart from context
    toast.info('Remove from cart functionality');
  };

  if (loading) {
    return (
      <div className="detail-view">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spinner size="large" />
          <p style={{ marginTop: '12px', color: 'var(--gray)' }}>Loading details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="detail-view">
        <button className="back-btn" onClick={onClose}>
          <i className="fas fa-arrow-left"></i> Back to Catalog
        </button>
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--danger)' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '40px' }}></i>
          <p style={{ marginTop: '12px' }}>Item not found</p>
        </div>
      </div>
    );
  }

  const name = item.package_name || item.course_name || 'Item';
  const price = item.package_price || item.price || 0;
  const isApproved = item.is_approved || false;
  const isPending = item.is_pending || false;

  return (
    <div className="detail-view">
      <button className="back-btn" onClick={onClose}>
        <i className="fas fa-arrow-left"></i> Back to Catalog
      </button>
      <div className="detail-header">
        <div>
          <h2>{itemType === 'package' ? '📦 ' : '📚 '} {name}</h2>
          {item.package_description && (
            <p style={{ color: 'var(--gray)', marginTop: '4px' }}>{item.package_description}</p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="price">${(parseFloat(price) || 0).toFixed(2)}</div>
          <div style={{ fontSize: '14px', color: 'var(--gray)' }}>{item.duration || '3 months'}</div>
        </div>
      </div>

      <div className="detail-actions">
        {isOwned || isApproved ? (
          <span className="status-badge approved">✅ Purchased</span>
        ) : isPending ? (
          <span className="status-badge pending">⏳ Pending Approval</span>
        ) : isInCart ? (
          <>
            <span className="status-badge in-cart">🛒 In Cart</span>
            <button onClick={handleRemoveFromCart} className="btn-danger" style={{ padding: '6px 16px' }}>
              Remove from Cart
            </button>
          </>
        ) : (
          <button onClick={handleAddToCart} className="btn-primary">
            🛒 Add to Cart
          </button>
        )}
      </div>

      <div className="detail-meta">
        <span><i className="fas fa-clock"></i> {item.duration || '3 months'}</span>
        {item.courses && <span><i className="fas fa-book"></i> {item.courses.length} courses</span>}
        {item.lessons && <span><i className="fas fa-video"></i> {item.lessons} lessons</span>}
        {item.sections_count && <span><i className="fas fa-list"></i> {item.sections_count} sections</span>}
      </div>

      {itemType === 'package' && item.courses && (
        <>
          <h3 style={{ marginBottom: '12px' }}>📚 Courses in this Package</h3>
          <div className="courses-list">
            {item.courses.map(course => (
              <div key={course.course_id} className="course-item">
                <h4>{course.course_name}</h4>
                <p>📖 {course.lessons || 0} lessons • {course.sections_count || 0} sections</p>
              </div>
            ))}
          </div>
        </>
      )}

      {itemType === 'course' && item.sections && (
        <>
          <h3 style={{ marginBottom: '12px' }}>📖 Course Sections</h3>
          <div className="courses-list">
            {item.sections.map(section => (
              <div key={section.section_id} className="course-item">
                <h4>{section.section_name}</h4>
                <p>🎬 {section.video_count || 0} videos {section.has_subsections ? '• Has subsections' : ''}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DetailView;