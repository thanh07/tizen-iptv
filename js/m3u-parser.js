/**
 * M3U/M3U8 Playlist Parser
 * Parses standard M3U/M3U8 playlists with EXTINF metadata
 */
const M3UParser = (() => {
    /**
     * Normalize URL: convert Github blob URLs to raw.githubusercontent.com, Pastebin to raw, etc.
     */
    function normalizeUrl(url) {
        if (!url) return '';
        let clean = url.trim();

        // GitHub blob: https://github.com/user/repo/blob/branch/path/to/file.m3u
        // -> https://raw.githubusercontent.com/user/repo/branch/path/to/file.m3u
        const ghBlobMatch = clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/i);
        if (ghBlobMatch) {
            return `https://raw.githubusercontent.com/${ghBlobMatch[1]}/${ghBlobMatch[2]}/${ghBlobMatch[3]}/${ghBlobMatch[4]}`;
        }

        // Pastebin: https://pastebin.com/xxxx -> https://pastebin.com/raw/xxxx
        const pbMatch = clean.match(/^https?:\/\/pastebin\.com\/([a-zA-Z0-9]+)$/i);
        if (pbMatch && pbMatch[1] !== 'raw') {
            return `https://pastebin.com/raw/${pbMatch[1]}`;
        }

        // GitLab blob -> raw
        const glMatch = clean.match(/^https?:\/\/gitlab\.com\/([^\/]+)\/([^\/]+)\/-\/blob\/([^\/]+)\/(.+)$/i);
        if (glMatch) {
            return `https://gitlab.com/${glMatch[1]}/${glMatch[2]}/-/raw/${glMatch[3]}/${glMatch[4]}`;
        }

        return clean;
    }

    /**
     * Parse M3U text content into array of channel objects
     */
    function parse(text) {
        if (!text) return [];
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        const channels = [];
        let meta = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.startsWith('#EXTM3U')) {
                continue;
            }

            if (line.startsWith('#EXTINF:')) {
                meta = parseExtinf(line);
                continue;
            }

            // Keep meta intact across custom tags like #EXTVLCOPT, #EXTGRP, etc.
            if (line.startsWith('#')) {
                if (line.startsWith('#EXTGRP:') && meta && meta.group === 'Chung') {
                    const grp = line.substring(8).trim();
                    if (grp) meta.group = grp;
                }
                continue;
            }

            // A non-comment line is treated as a stream URL
            if (line.length > 5) {
                const channel = {
                    id: channels.length,
                    url: line,
                    name: meta ? (meta.name || `Kênh ${channels.length + 1}`) : `Kênh ${channels.length + 1}`,
                    logo: meta ? (meta.logo || '') : '',
                    group: meta ? (meta.group || 'Chung') : 'Chung',
                    tvgId: meta ? (meta.tvgId || '') : '',
                    tvgName: meta ? (meta.tvgName || '') : '',
                    favorite: false,
                };
                channels.push(channel);
                meta = null;
            }
        }

        return channels;
    }

    /**
     * Parse a single #EXTINF line
     */
    function parseExtinf(line) {
        const result = {
            name: '',
            logo: '',
            group: 'Chung',
            tvgId: '',
            tvgName: '',
        };

        const commaIdx = line.lastIndexOf(',');
        if (commaIdx !== -1) {
            result.name = line.substring(commaIdx + 1).trim();
        }

        const attrStr = line.substring(8, commaIdx !== -1 ? commaIdx : undefined);

        result.tvgId    = extractAttr(attrStr, 'tvg-id');
        result.tvgName  = extractAttr(attrStr, 'tvg-name');
        result.logo     = extractAttr(attrStr, 'tvg-logo') || extractAttr(attrStr, 'group-logo');
        result.group    = extractAttr(attrStr, 'group-title') || 'Chung';

        if (!result.name && result.tvgName) result.name = result.tvgName;

        return result;
    }

    function extractAttr(str, attr) {
        const re = new RegExp(attr + '=["\']([^"\']*)["\']', 'i');
        const m = str.match(re);
        return m ? m[1].trim() : '';
    }

    /**
     * Group channels by their group-title
     */
    function groupByCategory(channels) {
        const groups = {};
        channels.forEach(ch => {
            const g = ch.group || 'Chung';
            if (!groups[g]) groups[g] = [];
            groups[g].push(ch);
        });
        return groups;
    }

    /**
     * Fetch and parse an M3U playlist from URL with CORS Proxy fallback
     */
    async function fetchAndParse(url) {
        if (!url) throw new Error('Đường dẫn playlist trống');
        
        // Prevent browser fetch from failing on file:// URLs
        if (url.startsWith('file://')) {
            throw new Error('Playlist này là file trên máy. Vui lòng bấm "Nạp từ file" để chọn file từ máy.');
        }

        const normalized = normalizeUrl(url);
        let text = '';
        let lastError = null;

        // Attempt 1: Direct fetch
        try {
            const response = await fetch(normalized, {
                headers: {
                    'Accept': 'text/plain, application/vnd.apple.mpegurl, audio/x-mpegurl, */*'
                }
            });
            if (response.ok) {
                text = await response.text();
            } else {
                throw new Error('Mã phản hồi HTTP: ' + response.status);
            }
        } catch (err) {
            lastError = err;
            console.warn('Direct fetch failed for:', normalized, err.message);

            // Do not use public CORS proxies for relative URLs or local files
            if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
                throw err;
            }

            // Attempt 2: CORS Proxy (allorigins)
            try {
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(normalized)}`;
                const resProxy = await fetch(proxyUrl);
                if (resProxy.ok) {
                    text = await resProxy.text();
                } else {
                    throw new Error('Proxy status: ' + resProxy.status);
                }
            } catch (err2) {
                // Attempt 3: Alternative CORS Proxy (corsproxy.io)
                try {
                    const proxy2Url = `https://corsproxy.io/?url=${encodeURIComponent(normalized)}`;
                    const resProxy2 = await fetch(proxy2Url);
                    if (resProxy2.ok) {
                        text = await resProxy2.text();
                    } else {
                        throw new Error(lastError ? lastError.message : 'Lỗi kết nối mạng');
                    }
                } catch (err3) {
                    throw new Error('Không thể kết nối đến URL này (Lỗi mạng hoặc CORS): ' + (lastError ? lastError.message : 'NetworkError'));
                }
            }
        }

        // Validate content is not an HTML webpage
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            throw new Error('Đường dẫn trả về trang web HTML, không phải file playlist M3U/M3U8 thô');
        }

        return parse(text);
    }

    /**
     * Filter channels by search query
     */
    function search(channels, query) {
        const q = query.toLowerCase().trim();
        if (!q) return channels;
        return channels.filter(ch =>
            ch.name.toLowerCase().includes(q) ||
            ch.group.toLowerCase().includes(q)
        );
    }

    return { parse, fetchAndParse, groupByCategory, search, normalizeUrl };
})();
