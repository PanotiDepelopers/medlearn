import React, { useState, useEffect, useMemo } from 'react';
import { catalogAPI } from '../../api';
import CatalogCard from './CatalogCard';
import DetailView from './DetailView';
import Spinner from '../common/Spinner';

const CatalogGrid = () => {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await catalogAPI.getAll();
      setPackages(data.packages || []);
      setCourses(data.individual_courses || []);
    } catch (error) {
      console.error('Failed to load catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleViewDetail = (id, type) => {
    setSelectedItem(id);
    setSelectedType(type);
  };

  const handleCloseDetail = async () => {
    setSelectedItem(null);
    setSelectedType(null);
    await loadCatalog();
  };

  // Filter packages and courses based on search query
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return { packages, courses };
    }

    const matchPackage = (pkg) => {
      const name = (pkg.package_name || '').toLowerCase();
      const desc = (pkg.package_description || '').toLowerCase();
      return name.includes(query) || desc.includes(query);
    };

    const matchCourse = (course) => {
      const name = (course.course_name || '').toLowerCase();
      return name.includes(query);
    };

    return {
      packages: packages.filter(matchPackage),
      courses: courses.filter(matchCourse)
    };
  }, [searchQuery, packages, courses]);

  const totalResults = filteredData.packages.length + filteredData.courses.length;
  const hasNoResults = !loading && searchQuery.trim() && totalResults === 0;

  if (selectedItem) {
    return <DetailView itemId={selectedItem} itemType={selectedType} onClose={handleCloseDetail} />;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spinner size="large" />
        <p style={{ marginTop: '12px', color: 'var(--ink-soft)' }}>Loading courses...</p>
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <div className="catalog-search">
        <i className="fas fa-search catalog-search-icon"></i>
        <input
          type="text"
          className="catalog-search-input"
          placeholder="Search courses and packages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="catalog-search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Result count when searching */}
      {searchQuery.trim() && !hasNoResults && (
        <p className="catalog-search-count">
          {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
        </p>
      )}

      {/* No results */}
      {hasNoResults && (
        <div className="empty" style={{ marginTop: '2rem' }}>
          <span className="empty-icon">
            <i className="fas fa-search" style={{ fontSize: '22px' }}></i>
          </span>
          <h3>No results found</h3>
          <p>No courses or packages match "{searchQuery}". Try a different search term.</p>
          <button
            className="btn-primary"
            style={{ marginTop: '12px', maxWidth: '200px' }}
            onClick={() => setSearchQuery('')}
          >
            <i className="fas fa-times"></i> Clear Search
          </button>
        </div>
      )}

      {/* Results */}
      {!hasNoResults && (
        <div className="catalog-grid">
          {filteredData.packages.length > 0 && (
            <>
              <h3 style={{ gridColumn: '1 / -1', marginTop: '8px', fontSize: '22px' }}>
                📦 Packages
              </h3>
              {filteredData.packages.map((pkg) => (
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

          {filteredData.courses.length > 0 && (
            <>
              <h3 style={{ gridColumn: '1 / -1', marginTop: '24px', fontSize: '22px' }}>
                📚 Individual Courses
              </h3>
              {filteredData.courses.map((course) => (
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

          {!searchQuery.trim() && packages.length === 0 && courses.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
              <i className="fas fa-box-open" style={{ fontSize: '48px', opacity: 0.3 }}></i>
              <p style={{ marginTop: '12px', color: 'var(--gray)' }}>No courses available yet.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CatalogGrid;