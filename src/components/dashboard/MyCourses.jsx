import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { purchasedAPI, streamAPI } from '../../api';
import Spinner from '../common/Spinner';
import WatchPage from '../player/WatchPage';

// Helper to clean video names
const cleanVideoName = (name) => {
  if (!name) return 'Unnamed Video';
  // Replace underscores with spaces
  let cleaned = name.replace(/_/g, ' ');
  // Remove file extensions
  cleaned = cleaned.replace(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i, '');
  // Capitalize first letter of each word
  cleaned = cleaned.replace(/\b\w/g, l => l.toUpperCase());
  // Remove multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
};

const MyCourses = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [watchData, setWatchData] = useState(null);
  const [viewMode, setViewMode] = useState('packages');
  const [viewHistory, setViewHistory] = useState([]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await purchasedAPI.getPackages();
      setPackages(data.packages || []);
    } catch (error) {
      console.error('Failed to load packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPackageCourses = async (packageId) => {
    setLoading(true);
    try {
      const data = await purchasedAPI.getPackageCourses(packageId);
      setCourses(data.courses || []);
      setViewMode('courses');
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseSections = async (courseId) => {
    setLoading(true);
    try {
      const data = await purchasedAPI.getCourseSections(courseId);
      setSections(data.sections || []);
      setViewMode('sections');
    } catch (error) {
      console.error('Failed to load sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setViewHistory(prev => [...prev, { mode: 'packages', data: pkg }]);
    if (pkg.is_unassigned) {
      setCourses(pkg.courses || []);
      setViewMode('courses');
    } else {
      loadPackageCourses(pkg.package_id);
    }
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setViewHistory(prev => [...prev, { mode: 'courses', data: course }]);
    loadCourseSections(course.course_id);
  };

  const handleSelectSection = (section) => {
    if (section.video_count > 0) {
      setWatchData({
        sectionId: section.section_id,
        sectionName: section.section_name || 'Section',
        initialVideoId: null
      });
      setViewMode('watch');
    } else if (section.subsections && section.subsections.length > 0) {
      // For sections with subsections, we need to handle this differently
      // For now, let's show a dialog or navigate to a subsection view
      alert('This section has subsections. Click on a subsection to view videos.');
    } else {
      alert('This section has no videos available.');
    }
  };

  const handleSelectSubsection = async (subsectionId, subsectionName) => {
    try {
      const data = await streamAPI.getSubsectionVideos(subsectionId);
      if (data.videos && data.videos.length > 0) {
        // Clean video names
        const cleanedVideos = data.videos.map(v => ({
          ...v,
          video_name: cleanVideoName(v.video_name)
        }));
        setWatchData({
          sectionId: subsectionId,
          sectionName: subsectionName || 'Subsection',
          initialVideoId: cleanedVideos[0]?.video_id || null,
          videos: cleanedVideos,
          sessionId: data.session_id
        });
        setViewMode('watch');
      } else {
        alert('This subsection has no videos available.');
      }
    } catch (error) {
      console.error('Failed to load subsection videos:', error);
      alert('Failed to load videos for this subsection.');
    }
  };

  const handleBack = () => {
    if (viewMode === 'watch') {
      setViewMode('sections');
      setWatchData(null);
    } else if (viewMode === 'sections') {
      setViewMode('courses');
      setSections([]);
      setSelectedCourse(null);
      setViewHistory(viewHistory.filter(h => h.mode !== 'sections'));
    } else if (viewMode === 'courses') {
      setViewMode('packages');
      setCourses([]);
      setSelectedPackage(null);
      setViewHistory(viewHistory.filter(h => h.mode !== 'courses'));
    }
  };

  const handleCloseWatch = () => {
    setViewMode('sections');
    setWatchData(null);
    if (selectedCourse) {
      loadCourseSections(selectedCourse.course_id);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div className="init-spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: '12px', color: 'var(--ink-soft)' }}>Loading your courses...</p>
      </div>
    );
  }

  // Watch Mode
  if (viewMode === 'watch' && watchData) {
    return (
      <WatchPage
        sectionId={watchData.sectionId}
        sectionName={watchData.sectionName}
        initialVideoId={watchData.initialVideoId}
        onClose={handleCloseWatch}
      />
    );
  }

  // Render Packages
  if (viewMode === 'packages') {
    if (packages.length === 0) {
      return (
        <div className="empty" style={{ marginTop: '2rem' }}>
          <span className="empty-icon">
            <i className="fas fa-book-open" style={{ fontSize: '22px' }}></i>
          </span>
          <h3>No Courses Yet</h3>
          <p>You haven't purchased any courses. Browse the catalog to get started!</p>
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

    return (
      <>
        <div className="view-head">
          <div className="view-head-text">
            <div className="view-title-group">
              <h1>📚 My Courses</h1>
              <p>Access your purchased courses and packages</p>
            </div>
          </div>
        </div>

        <div className="grid-view">
          {packages.map((pkg) => (
            <button 
              key={pkg.package_id || 'unassigned'} 
              className="tile"
              onClick={() => handleSelectPackage(pkg)}
            >
              <div className="tile-top">
                <span className="tile-icon is-teal">
                  <i className="fas fa-box"></i>
                </span>
                {pkg.is_unassigned && <span className="pill warn">Individual</span>}
              </div>
              <div className="tile-name">{pkg.package_name || 'Unnamed Package'}</div>
              <div className="tile-meta">
                <span className="chip">{pkg.course_count || 0} courses</span>
                <span className="chip" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                  <i className="fas fa-check-circle"></i> Purchased
                </span>
              </div>
              <div className="tile-foot">
                <span className="tile-cta">
                  View Courses <i className="fas fa-chevron-right"></i>
                </span>
              </div>
            </button>
          ))}
        </div>
      </>
    );
  }

  // Render Courses
  if (viewMode === 'courses') {
    return (
      <>
        <div className="view-head">
          <div className="view-head-text">
            <button className="view-back" onClick={handleBack}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="view-title-group">
              <h1>{selectedPackage?.package_name || 'Courses'}</h1>
              <p>{courses.length} courses available</p>
            </div>
          </div>
        </div>

        <div className="grid-view">
          {courses.map((course) => (
            <button 
              key={course.course_id} 
              className="tile"
              onClick={() => handleSelectCourse(course)}
            >
              <div className="tile-top">
                <span className="tile-icon">
                  <i className="fas fa-graduation-cap"></i>
                </span>
              </div>
              <div className="tile-name">{course.course_name || 'Unnamed Course'}</div>
              <div className="tile-meta">
                <span className="chip">📖 {course.lessons || 0} lessons</span>
                <span className="chip">📚 {course.sections_count || 0} sections</span>
              </div>
              <div className="tile-foot">
                <span className="tile-cta">
                  Start Learning <i className="fas fa-chevron-right"></i>
                </span>
              </div>
            </button>
          ))}
        </div>
      </>
    );
  }

  // Render Sections
  if (viewMode === 'sections') {
    return (
      <>
        <div className="view-head">
          <div className="view-head-text">
            <button className="view-back" onClick={handleBack}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="view-title-group">
              <h1>{selectedCourse?.course_name || 'Sections'}</h1>
              <p>{sections.length} sections available</p>
            </div>
          </div>
        </div>

        <div className="list-view">
          {sections.map((section) => {
            const hasVideos = section.video_count > 0;
            const hasSubsections = section.subsections && section.subsections.length > 0;
            
            return (
              <div 
                key={section.section_id} 
                className={`row ${!hasVideos && !hasSubsections ? 'is-inert' : ''}`}
                onClick={() => {
                  if (hasVideos) {
                    handleSelectSection(section);
                  } else if (hasSubsections) {
                    // Show subsections directly
                    // For now, just show the first subsection's videos
                    const firstSub = section.subsections[0];
                    if (firstSub) {
                      handleSelectSubsection(firstSub.subsection_id, firstSub.subsection_name);
                    }
                  }
                }}
              >
                <span className="row-icon">
                  <i className={`fas ${hasVideos ? 'fa-play-circle' : hasSubsections ? 'fa-folder' : 'fa-folder-open'}`}></i>
                </span>
                <span className="row-body">
                  <span className="row-top">
                    <span className="row-name">{section.section_name || 'Unnamed Section'}</span>
                    {hasSubsections && <span className="row-tag" style={{ fontSize: '0.6rem', background: 'var(--teal-soft)', color: 'var(--teal)' }}>Subsections</span>}
                  </span>
                  <span className="row-meta">
                    <span className="chip">
                      <i className="fas fa-video"></i> {section.video_count || 0} videos
                    </span>
                    {hasSubsections && (
                      <span className="chip" style={{ fontSize: '0.6rem' }}>
                        <i className="fas fa-folder"></i> {section.subsections.length} groups
                      </span>
                    )}
                  </span>
                  {/* Subsections */}
                  {hasSubsections && (
                    <div style={{ marginTop: '8px', paddingLeft: '8px', borderLeft: '2px solid var(--accent-soft)' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                        Subsections
                      </div>
                      {section.subsections.slice(0, 5).map(sub => (
                        <div 
                          key={sub.subsection_id}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            fontSize: '0.72rem', 
                            color: 'var(--ink-soft)', 
                            padding: '2px 0',
                            cursor: 'pointer',
                            transition: 'color 0.2s ease'
                          }}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleSelectSubsection(sub.subsection_id, sub.subsection_name);
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink-soft)'}
                        >
                          <span style={{ color: 'var(--accent)', fontSize: '10px' }}>▸</span>
                          <span>{sub.subsection_name || 'Unnamed'}</span>
                          <span style={{ fontSize: '0.6rem', color: 'var(--ink-faint)' }}>
                            ({sub.video_count || 0} videos)
                          </span>
                        </div>
                      ))}
                      {section.subsections.length > 5 && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--ink-faint)', padding: '2px 0' }}>
                          + {section.subsections.length - 5} more
                        </div>
                      )}
                    </div>
                  )}
                </span>
                <span className="row-actions">
                  {hasVideos && <span className="chev"><i className="fas fa-chevron-right"></i></span>}
                </span>
              </div>
            );
          })}

          {sections.length === 0 && (
            <div className="empty">
              <span className="empty-icon">
                <i className="fas fa-folder-open" style={{ fontSize: '22px' }}></i>
              </span>
              <h3>No sections available</h3>
              <p>This course doesn't have any sections yet.</p>
            </div>
          )}
        </div>
      </>
    );
  }

  return null;
};

export default MyCourses;