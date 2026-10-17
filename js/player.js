/**
 * HLS Video Player wrapper for Tizen TV
 * Supports HLS.js with native fallback & robust audio handling
 */
const Player = (() => {
    let hls = null;
    let videoEl = null;
    let currentUrl = null;
    let onStateChange = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const STATE = {
        IDLE: 'idle',
        LOADING: 'loading',
        PLAYING: 'playing',
        PAUSED: 'paused',
        ERROR: 'error',
        BUFFERING: 'buffering',
    };

    let currentState = STATE.IDLE;

    function init(videoElement, stateCallback) {
        videoEl = videoElement;
        onStateChange = stateCallback;

        // Default to unmuted with full volume
        videoEl.muted = false;
        videoEl.volume = 1.0;

        videoEl.addEventListener('playing',   () => {
            setState(STATE.PLAYING);
            checkMutedState();
        });
        videoEl.addEventListener('pause',     () => setState(STATE.PAUSED));
        videoEl.addEventListener('waiting',   () => setState(STATE.BUFFERING));
        videoEl.addEventListener('canplay',   () => {
            if (currentState === STATE.BUFFERING) setState(STATE.PLAYING);
        });
        videoEl.addEventListener('error',     () => {
            if (currentState !== STATE.ERROR) setState(STATE.ERROR);
        });
        videoEl.addEventListener('volumechange', () => {
            checkMutedState();
        });
    }

    function checkMutedState() {
        const btn = document.getElementById('btn-unmute-overlay');
        if (btn) {
            btn.style.display = (videoEl && videoEl.muted) ? 'flex' : 'none';
        }
    }

    function setState(state) {
        currentState = state;
        if (onStateChange) onStateChange(state, currentUrl);
    }

    function play(url) {
        if (!url) return;
        currentUrl = url;
        retryCount = 0;
        setState(STATE.LOADING);

        // Try unmuting when playing new channel
        if (videoEl) {
            videoEl.muted = false;
            videoEl.volume = 1.0;
        }

        // Destroy previous HLS instance
        if (hls) {
            hls.destroy();
            hls = null;
        }

        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            _playWithHls(url);
        } else if (videoEl && videoEl.canPlayType('application/vnd.apple.mpegurl')) {
            _playNative(url);
        } else {
            _playNative(url);
        }
    }

    function _playWithHls(url) {
        hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 10,
            lowLatencyMode: false,
            enableWorker: true,
            xhrSetup: function(xhr) {
                xhr.withCredentials = false;
            }
        });

        hls.loadSource(url);
        hls.attachMedia(videoEl);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            _attemptPlay();
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            console.warn('HLS Error:', data.type, data.details, data.fatal);
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        if (retryCount < MAX_RETRIES) {
                            retryCount++;
                            console.log(`Network error, retry ${retryCount}/${MAX_RETRIES}...`);
                            setTimeout(() => hls.startLoad(), 2000);
                        } else {
                            setState(STATE.ERROR);
                        }
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        if (retryCount < MAX_RETRIES) {
                            retryCount++;
                            console.log('Media error, recovering...');
                            hls.recoverMediaError();
                        } else {
                            setState(STATE.ERROR);
                        }
                        break;
                    default:
                        setState(STATE.ERROR);
                        break;
                }
            }
        });
    }

    function _playNative(url) {
        if (!videoEl) return;
        videoEl.src = url;
        videoEl.load();
        _attemptPlay();
    }

    function _attemptPlay() {
        if (!videoEl) return;
        // Attempt play with audio first
        const p = videoEl.play();
        if (p !== undefined) {
            p.then(() => {
                checkMutedState();
            }).catch(e => {
                console.warn('Autoplay with sound was blocked by browser. Playing muted fallback:', e);
                // Fallback to muted playback so video can at least start
                videoEl.muted = true;
                videoEl.play().catch(err2 => console.error('Even muted play failed:', err2));
                checkMutedState();
            });
        }
    }

    function unmute() {
        if (videoEl) {
            videoEl.muted = false;
            videoEl.volume = 1.0;
            checkMutedState();
        }
    }

    function toggleMute() {
        if (videoEl) {
            videoEl.muted = !videoEl.muted;
            checkMutedState();
            return videoEl.muted;
        }
        return false;
    }

    function pause() {
        if (videoEl && !videoEl.paused) {
            videoEl.pause();
        }
    }

    function resume() {
        if (videoEl && videoEl.paused) {
            videoEl.play().catch(e => console.warn(e));
        }
    }

    function togglePlayPause() {
        if (!videoEl) return;
        if (videoEl.paused) {
            resume();
        } else {
            pause();
        }
    }

    function stop() {
        if (hls) {
            hls.destroy();
            hls = null;
        }
        if (videoEl) {
            videoEl.pause();
            videoEl.removeAttribute('src');
            videoEl.load();
        }
        currentUrl = null;
        setState(STATE.IDLE);
    }

    function setVolume(vol) {
        if (videoEl) {
            videoEl.volume = Math.max(0, Math.min(1, vol));
            if (videoEl.volume > 0 && videoEl.muted) {
                videoEl.muted = false;
            }
            checkMutedState();
        }
    }

    function getVolume() {
        return videoEl ? videoEl.volume : 1;
    }

    function isMuted() {
        return videoEl ? videoEl.muted : false;
    }

    function retry() {
        if (currentUrl) {
            retryCount = 0;
            play(currentUrl);
        }
    }

    function isPlaying() {
        return currentState === STATE.PLAYING;
    }

    function getCurrentUrl() { return currentUrl; }
    function getState() { return currentState; }

    return {
        init, play, pause, resume, stop, togglePlayPause, retry,
        unmute, toggleMute, isMuted, setVolume, getVolume,
        isPlaying, getCurrentUrl, getState, STATE
    };
})();
