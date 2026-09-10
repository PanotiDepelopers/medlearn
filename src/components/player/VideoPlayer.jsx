import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { streamAPI } from '../../api';

// Clean video name helper
const cleanVideoName = (name) => {
  if (!name) return 'Unnamed Video';
  let cleaned = name.replace(/_/g, ' ');
  cleaned = cleaned.replace(/\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i, '');
  cleaned = cleaned.replace(/\b\w/g, l => l.toUpperCase());
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
};

const VideoPlayer = ({ videoId, videoName, sessionId, onEnded, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buffering, setBuffering] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showDiag, setShowDiag] = useState(false);
  const [diagInfo, setDiagInfo] = useState({});
  
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const manifestUrlRef = useRef(null);
  const videoIdRef = useRef(videoId);
  const loadAttemptRef = useRef(0);

  // Complete cleanup function
  const cleanupVideo = () => {
    console.log('🧹 Cleaning up video...');
    
    // Destroy HLS instance
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch (e) {
        console.warn('HLS destroy error:', e);
      }
      hlsRef.current = null;
    }
    
    // Clear video element completely
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        // Remove all sources
        videoRef.current.removeAttribute('src');
        videoRef.current.removeAttribute('srcObject');
        // Force load to clear everything
        videoRef.current.load();
      } catch (e) {
        console.warn('Video cleanup error:', e);
      }
    }
    
    // Revoke blob URL if exists
    if (manifestUrlRef.current) {
      try {
        URL.revokeObjectURL(manifestUrlRef.current);
      } catch (e) {
        console.warn('URL revoke error:', e);
      }
      manifestUrlRef.current = null;
    }
    
    setLoading(true);
    setError(null);
    setCurrentTime(0);
    setProgress(0);
    setDuration(0);
    setBuffering(false);
  };

  // Reset and load video when videoId changes
  useEffect(() => {
    videoIdRef.current = videoId;
    loadAttemptRef.current += 1;
    const currentAttempt = loadAttemptRef.current;
    
    if (!videoId || !sessionId) {
      setError('No video selected');
      setLoading(false);
      return;
    }

    console.log(`🎬 Video changed to: ${videoId} (attempt ${currentAttempt})`);
    
    // Complete cleanup before loading new video
    cleanupVideo();
    
    // Small delay to ensure cleanup is complete and browser caches are cleared
    const timer = setTimeout(() => {
      // Check if we're still on the same video
      if (videoIdRef.current === videoId && loadAttemptRef.current === currentAttempt) {
        loadVideo(currentAttempt);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      cleanupVideo();
    };
  }, [videoId, sessionId]);

  const loadVideo = async (attempt) => {
    // Check if we're still on the same video
    if (videoIdRef.current !== videoId || loadAttemptRef.current !== attempt) {
      console.log('⏭️ Video changed during load, aborting');
      return;
    }

    setLoading(true);
    setError(null);
    setBuffering(false);

    try {
      console.log(`📡 Requesting stream for video: ${videoId} (attempt ${attempt})`);
      
      const data = await streamAPI.getStream(videoId, sessionId);
      console.log('📦 Stream data received:', data);
      
      // Check again if video changed during API call
      if (videoIdRef.current !== videoId || loadAttemptRef.current !== attempt) {
        console.log('⏭️ Video changed during API call, aborting');
        return;
      }
      
      if (data.is_proxied && data.manifest) {
        console.log('📄 Got proxied manifest with segments:', data.segment_count);
        
        setDiagInfo({
          connection: 'Proxy (RAM cached)',
          encryption: data.has_key ? 'AES-128' : 'No encryption',
          segments: data.segment_count || '?'
        });

        // Create new blob URL with unique identifier to force cache bust
        const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 8);
        const manifestBlob = new Blob(
          [data.manifest + '\n# Unique ID: ' + uniqueId + '\n# Video: ' + videoId],
          { type: 'application/vnd.apple.mpegurl' }
        );
        const manifestUrl = URL.createObjectURL(manifestBlob);
        manifestUrlRef.current = manifestUrl;
        
        console.log('🔗 Created new manifest URL:', manifestUrl.substring(0, 50) + '...');

        if (!Hls.isSupported()) {
          if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = manifestUrl;
            videoRef.current.addEventListener('loadedmetadata', () => {
              if (videoIdRef.current === videoId && loadAttemptRef.current === attempt) {
                setLoading(false);
              }
            }, { once: true });
            videoRef.current.play().catch(() => {});
            return;
          }
          setError('This browser cannot play the stream format.');
          setLoading(false);
          return;
        }

        // Destroy any existing HLS instance
        if (hlsRef.current) {
          try {
            hlsRef.current.destroy();
          } catch (e) {}
          hlsRef.current = null;
        }

        // Create NEW HLS instance with cache-busting config
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30,
          backBufferLength: 30,
          maxMaxBufferLength: 60,
          enableSoftwareAES: true,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 6,
          fragLoadingRetryDelay: 1000,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          // Force cache busting
          xhrSetup: function(xhr, url) {
            // Add cache-busting header
            xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            xhr.setRequestHeader('Pragma', 'no-cache');
            xhr.setRequestHeader('Expires', '0');
          }
        });

        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ Manifest parsed successfully for video:', videoId);
          // Check if we're still on the same video
          if (videoIdRef.current === videoId && loadAttemptRef.current === attempt) {
            setLoading(false);
            videoRef.current?.play().catch(() => console.log('Autoplay prevented'));
          }
        });

        hls.on(Hls.Events.ERROR, (evt, data) => {
          console.error('❌ HLS Error:', data.type, data.details);
          if (data.fatal) {
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else {
              setError('The stream connection was lost.');
              setLoading(false);
            }
          }
        });

        hls.on(Hls.Events.STREAM_ENDED, () => {
          console.log('📺 Stream ended for video:', videoId);
          if (onEnded && videoIdRef.current === videoId) {
            onEnded();
          }
        });

        // Load the manifest
        hls.loadSource(manifestUrl);
        hls.attachMedia(videoRef.current);

      } else if (data.stream_url) {
        const finalUrl = data.stream_url;
        setDiagInfo({
          connection: 'Direct',
          encryption: 'None',
          segments: 'N/A'
        });

        if (finalUrl.includes('youtu.be') || finalUrl.includes('youtube.com')) {
          videoRef.current.src = finalUrl;
          videoRef.current.addEventListener('loadedmetadata', () => {
            if (videoIdRef.current === videoId && loadAttemptRef.current === attempt) {
              setLoading(false);
            }
          }, { once: true });
          videoRef.current.play().catch(() => {});
          setLoading(false);
          return;
        }

        if (!Hls.isSupported()) {
          if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = finalUrl;
            videoRef.current.addEventListener('loadedmetadata', () => {
              if (videoIdRef.current === videoId && loadAttemptRef.current === attempt) {
                setLoading(false);
              }
            }, { once: true });
            videoRef.current.play().catch(() => {});
            return;
          }
          setError('This browser cannot play the stream format.');
          setLoading(false);
          return;
        }

        // Destroy any existing HLS instance
        if (hlsRef.current) {
          try {
            hlsRef.current.destroy();
          } catch (e) {}
          hlsRef.current = null;
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30,
          backBufferLength: 30,
          maxMaxBufferLength: 60,
          enableSoftwareAES: true,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 6,
          fragLoadingRetryDelay: 1000,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          xhrSetup: function(xhr, url) {
            xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            xhr.setRequestHeader('Pragma', 'no-cache');
            xhr.setRequestHeader('Expires', '0');
          }
        });

        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ Manifest parsed successfully for video:', videoId);
          if (videoIdRef.current === videoId && loadAttemptRef.current === attempt) {
            setLoading(false);
            videoRef.current?.play().catch(() => {});
          }
        });

        hls.on(Hls.Events.ERROR, (evt, data) => {
          console.error('❌ HLS Error:', data);
          if (data.fatal) {
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else {
              setError('The stream connection was lost.');
              setLoading(false);
            }
          }
        });

        hls.on(Hls.Events.STREAM_ENDED, () => {
          console.log('📺 Stream ended for video:', videoId);
          if (onEnded && videoIdRef.current === videoId) {
            onEnded();
          }
        });

        hls.loadSource(finalUrl);
        hls.attachMedia(videoRef.current);
      } else {
        setError('No stream URL or manifest available.');
        setLoading(false);
      }

    } catch (err) {
      console.error('❌ Stream error:', err);
      if (videoIdRef.current === videoId && loadAttemptRef.current === attempt) {
        if (err.message?.includes('SESSION_EXPIRED')) {
          setError('Session expired. Please reload the section.');
        } else {
          setError(err.message || 'Failed to load video.');
        }
        setLoading(false);
        if (onError) onError(err);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      setCurrentTime(current);
      setDuration(dur);
      setProgress((current / dur) * 100 || 0);
    }
  };

  const handleBufferStart = () => setBuffering(true);
  const handleBufferEnd = () => setBuffering(false);

  const handleRetry = () => {
    loadAttemptRef.current += 1;
    cleanupVideo();
    setTimeout(() => {
      loadVideo(loadAttemptRef.current);
    }, 300);
  };

  const formatTime = (seconds) => {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const displayName = cleanVideoName(videoName);

  if (error) {
    return (
      <div className="player-error-container">
        <div className="player-error-content">
          <div className="player-error-icon">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h3>We couldn't start this lecture</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={handleRetry}>
            <i className="fas fa-sync"></i> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-wrapper">
      <div className="video-player-container">
        <div className="video-player-sizer">
          <video
            ref={videoRef}
            controls
            playsInline
            crossOrigin="anonymous"
            onTimeUpdate={handleTimeUpdate}
            onWaiting={handleBufferStart}
            onPlaying={handleBufferEnd}
            onEnded={onEnded}
          />
          
          {loading && (
            <div className="player-overlay">
              <div className="player-spinner"></div>
              <h4>Preparing lecture…</h4>
              <p>Connecting to streaming server</p>
            </div>
          )}

          {buffering && !loading && (
            <div className="player-buffer">
              <span className="mini-spin"></span>
              Buffering…
            </div>
          )}
        </div>
      </div>

      <div className="video-info-panel">
        <div className="video-title-row">
          <h1>{displayName}</h1>
          <span className="video-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>

        <div className="video-actions">
          <button className="action-btn" onClick={() => setShowDiag(!showDiag)}>
            <i className="fas fa-info-circle"></i> Info
          </button>
        </div>

        {showDiag && (
          <div className="diag-panel">
            <h4>Stream Diagnostics</h4>
            <div className="diag-row">
              <span>Connection: <b>{diagInfo.connection || '—'}</b></span>
              <span>Encryption: <b>{diagInfo.encryption || '—'}</b></span>
              <span>Segments: <b>{diagInfo.segments || '0'}</b></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;