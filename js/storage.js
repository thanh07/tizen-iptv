/**
 * LocalStorage persistence layer
 * Manages playlists, favorites, and app settings
 */
const Storage = (() => {
    const KEYS = {
        PLAYLISTS:  'iptv_playlists',
        FAVORITES:  'iptv_favorites',
        SETTINGS:   'iptv_settings',
        LAST_CHAN:  'iptv_last_channel',
        CONTENT_PREFIX: 'iptv_content_',
    };

    // ─── Playlists ───────────────────────────────────────────────────────────

    function getPlaylists() {
        try {
            return JSON.parse(localStorage.getItem(KEYS.PLAYLISTS)) || [];
        } catch (e) { return []; }
    }

    function savePlaylists(playlists) {
        localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
    }

    function savePlaylistContent(id, content) {
        try {
            if (content) {
                localStorage.setItem(KEYS.CONTENT_PREFIX + id, content);
            }
        } catch (e) {
            console.warn('Storage quota warning when saving playlist content:', e);
        }
    }

    function getPlaylistContent(id) {
        try {
            return localStorage.getItem(KEYS.CONTENT_PREFIX + id) || null;
        } catch (e) { return null; }
    }

    function addPlaylist(name, url, content = null, channelCount = 0) {
        const playlists = getPlaylists();
        const isFile = url && url.startsWith('file://');
        const existingIdx = playlists.findIndex(p => (url && p.url === url) || (isFile && p.name === name));
        
        let pl;
        if (existingIdx >= 0) {
            pl = playlists[existingIdx];
            pl.name = name;
            if (url) pl.url = url;
            if (content !== null) {
                pl.content = content;
                savePlaylistContent(pl.id, content);
            }
            if (channelCount > 0) pl.channelCount = channelCount;
            pl.updatedAt = Date.now();
        } else {
            const newId = Date.now();
            pl = {
                id: newId,
                name,
                url,
                channelCount: channelCount || 0,
                isLocalFile: !!isFile,
                addedAt: Date.now(),
                updatedAt: Date.now()
            };
            if (content !== null) {
                pl.content = content;
                savePlaylistContent(newId, content);
            }
            playlists.push(pl);
        }

        savePlaylists(playlists);
        return pl;
    }

    function updatePlaylist(id, updates) {
        const playlists = getPlaylists();
        const pl = playlists.find(p => p.id === id);
        if (pl) {
            if (updates.content) {
                savePlaylistContent(id, updates.content);
            }
            Object.assign(pl, updates, { updatedAt: Date.now() });
            savePlaylists(playlists);
            return pl;
        }
        return null;
    }

    function removePlaylist(id) {
        const playlists = getPlaylists().filter(p => p.id !== id);
        savePlaylists(playlists);
        try {
            localStorage.removeItem(KEYS.CONTENT_PREFIX + id);
        } catch (e) {}
    }

    // ─── Favorites ───────────────────────────────────────────────────────────

    function getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(KEYS.FAVORITES)) || [];
        } catch (e) { return []; }
    }

    function saveFavorites(favs) {
        localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
    }

    function isFavorite(channelUrl) {
        return getFavorites().some(f => f.url === channelUrl);
    }

    function toggleFavorite(channel) {
        const favs = getFavorites();
        const idx = favs.findIndex(f => f.url === channel.url);
        if (idx >= 0) {
            favs.splice(idx, 1);
            saveFavorites(favs);
            return false;
        } else {
            favs.push({ ...channel, favoritedAt: Date.now() });
            saveFavorites(favs);
            return true;
        }
    }

    function addFavorite(channel) {
        if (!isFavorite(channel.url)) {
            const favs = getFavorites();
            favs.push({ ...channel, favoritedAt: Date.now() });
            saveFavorites(favs);
        }
    }

    function removeFavorite(channelUrl) {
        const favs = getFavorites().filter(f => f.url !== channelUrl);
        saveFavorites(favs);
    }

    // ─── Settings ────────────────────────────────────────────────────

    const defaultSettings = {
        volume: 1.0,
        lastPlaylistId: null,
        theme: 'dark',
        showInfoBar: true,
        autoplay: true,
    };

    function getSettings() {
        try {
            return { ...defaultSettings, ...JSON.parse(localStorage.getItem(KEYS.SETTINGS)) };
        } catch (e) { return { ...defaultSettings }; }
    }

    function saveSetting(key, value) {
        const settings = getSettings();
        settings[key] = value;
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    }

    // ─── Last Channel ─────────────────────────────────────────────────────────

    function saveLastChannel(channel) {
        localStorage.setItem(KEYS.LAST_CHAN, JSON.stringify(channel));
    }

    function getLastChannel() {
        try {
            return JSON.parse(localStorage.getItem(KEYS.LAST_CHAN));
        } catch (e) { return null; }
    }

    // ─── Clear ────────────────────────────────────────────────────────────────

    function clearAll() {
        Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    }

    return {
        getPlaylists, addPlaylist, updatePlaylist, removePlaylist,
        savePlaylistContent, getPlaylistContent,
        getFavorites, isFavorite, toggleFavorite, addFavorite, removeFavorite,
        getSettings, saveSetting,
        saveLastChannel, getLastChannel,
        clearAll,
    };
})();
