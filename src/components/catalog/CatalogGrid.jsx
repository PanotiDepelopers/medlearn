import React, { useState, useEffect } from 'react';
import { catalogAPI } from '../../api';
import { useCart } from '../../context/CartContext';
import CatalogCard from './CatalogCard';
import DetailView from './DetailView';
import Spinner from '../common/Spinner';

const CatalogGrid = () => {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const { loadCart } = useCart();

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await catalogAPI.getAll();
      setPackages(data.packages || []);
      setCourses(data.individual_courses || []);
      await loadCart(); // Just update cart state, no page refresh
    } catch (error) {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message: 'Failed to load catalog', type: 'error' }
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
    // Listen for cart updates to refresh button states
    const handleCartUpdate = () => {
      loadCart();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleViewDetail = (id, type) => {
    setSelectedItem(id);
    setSelectedType(type);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
    setSelectedType(null);
    // Refresh catalog data when closing detail
    loadCatalog();
  };

  if (selectedItem) {
    return <DetailView itemId={selectedItem} itemType={selectedType} onClose={handleCloseDetail} />;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spinner size="large" />
        <p style={{ marginTop: '12px', color: 'var(--gray)' }}>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="catalog-grid">
      {packages.length > 0 && (
        <>
          <h3 style={{ gridColumn: '1 / -1', marginTop: '8px', fontSize: '22px' }}>
            📦 Packages
          </h3>
          {packages.map((pkg) => (
            <CatalogCard
              key={pkg.package_id}
              id={pkg.package_id}
              name={pkg.package_name}
              price={pkg.package_price}
              description={pkg.package_description}
              type="package"
              duration={pkg.duration}
              meta={[`📚 ${pkg.course_count || 0} courses`, `🕐 ${pkg.duration || '6 months'}`]}
              isApproved={pkg.is_approved}
              isPending={pkg.is_pending}
              onViewDetail={handleViewDetail}
            />
          ))}
        </>
      )}
      
      {courses.length > 0 && (
        <>
          <h3 style={{ gridColumn: '1 / -1', marginTop: '24px', fontSize: '22px' }}>
            📚 Individual Courses
          </h3>
          {courses.map((course) => (
            <CatalogCard
              key={course.course_id}
              id={course.course_id}
              name={course.course_name}
              price={course.price}
              description={`Course with ${course.lessons || 0} lessons`}
              type="course"
              duration={course.duration}
              meta={[`📖 ${course.lessons || 0} lessons`, `🕐 ${course.duration || '3 months'}`]}
              isApproved={course.is_approved}
              isPending={course.is_pending}
              onViewDetail={handleViewDetail}
            />
          ))}
        </>
      )}

      {packages.length === 0 && courses.length === 0 && (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
          <i className="fas fa-box-open" style={{ fontSize: '48px', opacity: 0.3 }}></i>
          <p style={{ marginTop: '12px', color: 'var(--gray)' }}>No courses available yet.</p>
        </div>
      )}
    </div>
  );
};

export default CatalogGrid;