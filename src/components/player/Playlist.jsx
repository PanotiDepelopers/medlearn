import React from 'react';

// Clean video name helper
const cleanVideoName = (name) => {
  if (!name) return 'Unnamed Video';
  let cleaned = name.replace(/_/g, ' ');
  cleaned = cleaned.replace(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i, '');
  cleaned = cleaned.replace(/\b\w/g, l => l.toUpperCase());
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
};

const Playlist = ({ videos, currentVideoId, sectionName, onSelectVideo }) => {
  const handleVideoClick = (videoId) => {
    if (onSelectVideo) {
      onSelectVideo(videoId);
    }
  };

  return (
    <div className="playlist-panel">
      <div className="playlist-box">
        <div className="playlist-header">
          <h3><i className="fas fa-list-ul"></i> Up Next</h3>
          <p>{sectionName || 'Section'}</p>
        </div>
        <div className="playlist-items">
          {videos.length === 0 ? (
            <div className="playlist-empty">
              <i className="fas fa-video-slash"></i>
              <p>No videos available</p>
            </div>
          ) : (
            videos.map((video, index) => {
              const isActive = String(video.video_id) === String(currentVideoId);
              const displayName = cleanVideoName(video.video_name);
              return (
                <div
                  key={video.video_id || index}
                  className={`playlist-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleVideoClick(video.video_id)}
                >
                  <div className="playlist-thumb">
                    <i className={`fas ${isActive ? 'fa-play-circle' : 'fa-play'}`}></i>
                  </div>
                  <div className="playlist-info">
                    <h4>{displayName}</h4>
                    <span>
                      <i className="fas fa-clock"></i> {video.video_length_minutes ? `${video.video_length_minutes}m` : 'Lecture'}
                    </span>
                  </div>
                  <span className="playing-indicator">{isActive ? '▶' : ''}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Playlist;