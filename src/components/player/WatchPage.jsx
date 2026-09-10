// WatchPage.jsx
import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import Playlist from './Playlist';
import { streamAPI } from '../../api';
import Spinner from '../common/Spinner';

// Clean video name helper
const cleanVideoName = (name) => {
  if (!name) return 'Unnamed Video';
  let cleaned = name.replace(/_/g, ' ');
  cleaned = cleaned.replace(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i, '');
  cleaned = cleaned.replace(/\b\w/g, l => l.toUpperCase());
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
};

const WatchPage = ({ 
  sectionId, 
  sectionName, 
  initialVideoId,
  onClose 
}) => {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [currentVideoId, setCurrentVideoId] = useState(initialVideoId);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sectionId) {
      loadVideos();
    }
  }, [sectionId]);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await streamAPI.getSectionVideos(sectionId);
      console.log('📹 Section videos response:', data);
      
      // Clean video names
      const cleanedVideos = (data.videos || []).map(v => ({
        ...v,
        video_name: cleanVideoName(v.video_name)
      }));
      
      setVideos(cleanedVideos);
      
      // 🔑 CRITICAL: Store the session ID
      if (data.session_id) {
        setSessionId(data.session_id);
        console.log('✅ Session ID stored:', data.session_id);
      } else {
        console.warn('⚠️ No session ID returned from server');
      }
      
      // Set current video
      if (initialVideoId && cleanedVideos.some(v => v.video_id === initialVideoId)) {
        setCurrentVideoId(initialVideoId);
      } else if (cleanedVideos.length > 0) {
        setCurrentVideoId(cleanedVideos[0].video_id);
      }
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVideo = (videoId) => {
    if (videoId && videoId !== currentVideoId) {
      console.log('🎬 Selecting video:', videoId);
      setCurrentVideoId(videoId);
    }
  };

  const handleVideoEnded = () => {
    const currentIndex = videos.findIndex(v => v.video_id === currentVideoId);
    if (currentIndex !== -1 && currentIndex < videos.length - 1) {
      setCurrentVideoId(videos[currentIndex + 1].video_id);
    }
  };

  const handleVideoError = (err) => {
    console.error('Video error:', err);
  };

  const currentVideo = videos.find(v => v.video_id === currentVideoId);

  if (loading) {
    return (
      <div className="watch-loading">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="init-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '12px', color: 'var(--ink-soft)' }}>Loading lectures...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watch-error-container">
        <div className="empty">
          <span className="empty-icon">
            <i className="fas fa-exclamation-circle"></i>
          </span>
          <h3>Couldn't load lectures</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadVideos}>
            <i className="fas fa-sync"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-view active">
      {/* Breadcrumbs */}
      <div className="crumbs">
        <span className="crumb" onClick={onClose} style={{ cursor: 'pointer' }}>
          <i className="fas fa-arrow-left"></i> My Courses
        </span>
        <span className="crumb-sep">/</span>
        <span className="crumb current">{sectionName || 'Section'}</span>
      </div>

      <div className="watch-layout">
        {/* Left Column: Player */}
        <div className="video-player-panel">
          {currentVideo && sessionId ? (
            <VideoPlayer
              key={currentVideoId} // Force re-render on video change
              videoId={currentVideoId}
              videoName={currentVideo.video_name}
              sessionId={sessionId}
              onEnded={handleVideoEnded}
              onError={handleVideoError}
            />
          ) : (
            <div className="empty" style={{ minHeight: '300px' }}>
              <span className="empty-icon">
                <i className="fas fa-video"></i>
              </span>
              <h3>No video selected</h3>
              <p>Select a video from the playlist to start watching.</p>
            </div>
          )}
        </div>

        {/* Right Column: Playlist */}
        <Playlist
          videos={videos}
          currentVideoId={currentVideoId}
          sectionName={sectionName}
          onSelectVideo={handleSelectVideo}
        />
      </div>
    </div>
  );
};

export default WatchPage;