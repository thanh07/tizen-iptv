/**
 * Samsung Tizen TV Remote Control Handler
 * Registers and handles all remote key events
 */
const Remote = (() => {
    // Key codes for Samsung Tizen TV remote
    const KEYS = {
        UP:           38,
        DOWN:         40,
        LEFT:         37,
        RIGHT:        39,
        ENTER:        13,
        BACK:         10009,
        BACK_ALT:     8,     // Backspace fallback
        EXIT:         10182,

        PLAY:         415,
        PAUSE:        19,
        PLAY_PAUSE:   10252,
        STOP:         413,
        REWIND:       412,
        FF:           417,

        CH_UP:        427,
        CH_DOWN:      428,

        RED:          403,
        GREEN:        404,
        YELLOW:       405,
        BLUE:         406,

        NUM_0: 48, NUM_1: 49, NUM_2: 50, NUM_3: 51, NUM_4: 52,
        NUM_5: 53, NUM_6: 54, NUM_7: 55, NUM_8: 56, NUM_9: 57,

        VOL_UP:       447,
        VOL_DOWN:     448,
        MUTE:         449,

        INFO:         457,
        MENU:         18,
    };

    const handlers = {};

    function init() {
        // Register special keys with Tizen TV Input Device API
        if (window.tizen && window.tizen.tvinputdevice) {
            const keysToRegister = [
                'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue',
                'MediaPlay', 'MediaPause', 'MediaPlayPause', 'MediaStop',
                'MediaRewind', 'MediaFastForward',
                'ChannelUp', 'ChannelDown',
                '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                'VolumeUp', 'VolumeDown', 'VolumeMute',
                'Info',
            ];
            keysToRegister.forEach(key => {
                try {
                    tizen.tvinputdevice.registerKey(key);
                } catch (e) {
                    console.warn('Could not register key:', key, e.message);
                }
            });
        }

        // Global keydown listener
        window.addEventListener('keydown', handleKeyDown, true);

        console.log('[Remote] Initialized');
    }

    function handleKeyDown(e) {
        const code = e.keyCode;
        e.preventDefault();
        e.stopPropagation();

        // Map to action name
        let action = null;
        switch (code) {
            case KEYS.UP:        action = 'UP';        break;
            case KEYS.DOWN:      action = 'DOWN';      break;
            case KEYS.LEFT:      action = 'LEFT';      break;
            case KEYS.RIGHT:     action = 'RIGHT';     break;
            case KEYS.ENTER:     action = 'ENTER';     break;
            case KEYS.BACK:
            case KEYS.BACK_ALT:  action = 'BACK';      break;
            case KEYS.EXIT:      action = 'EXIT';      break;

            case KEYS.PLAY:      action = 'PLAY';      break;
            case KEYS.PAUSE:     action = 'PAUSE';     break;
            case KEYS.PLAY_PAUSE:action = 'PLAY_PAUSE';break;
            case KEYS.STOP:      action = 'STOP';      break;
            case KEYS.REWIND:    action = 'REWIND';    break;
            case KEYS.FF:        action = 'FF';        break;

            case KEYS.CH_UP:     action = 'CH_UP';     break;
            case KEYS.CH_DOWN:   action = 'CH_DOWN';   break;

            case KEYS.RED:       action = 'RED';       break;
            case KEYS.GREEN:     action = 'GREEN';     break;
            case KEYS.YELLOW:    action = 'YELLOW';    break;
            case KEYS.BLUE:      action = 'BLUE';      break;

            case KEYS.VOL_UP:    action = 'VOL_UP';    break;
            case KEYS.VOL_DOWN:  action = 'VOL_DOWN';  break;
            case KEYS.MUTE:      action = 'MUTE';      break;

            case KEYS.INFO:      action = 'INFO';      break;

            default:
                // Number keys
                if (code >= 48 && code <= 57) {
                    action = 'NUM_' + (code - 48);
                }
                break;
        }

        if (action && handlers[action]) {
            handlers[action](e);
        }
    }

    function on(action, callback) {
        handlers[action] = callback;
    }

    function off(action) {
        delete handlers[action];
    }

    function destroy() {
        window.removeEventListener('keydown', handleKeyDown, true);
        if (window.tizen && window.tizen.tvinputdevice) {
            try { tizen.tvinputdevice.unregisterKey('ColorF0Red'); } catch(e) {}
        }
    }

    return { init, on, off, destroy, KEYS };
})();
