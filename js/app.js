/**
 * App State & Main Controller
 * Ties together: Player, Remote, Storage, UI, M3UParser
 */
const AppState = (() => {
    // ─── State ────────────────────────────────────────────────────────────────
    let allChannels    = [];
    let groups         = [];
    let filteredChannels = [];
    let currentGroupIdx = 0;
    let currentChannel  = null;
    let currentTab      = 'all';  // 'all' | 'favorites' | 'playlists'
    let playlists       = [];
    let currentPlaylistId = null;
    let showInfoBar     = true;
    let infoBarTimer    = null;
    let searchQuery     = '';
    let searchBuffer    = '';
    let searchTimer     = null;
    let targetPlaylistIdForFile = null;

    // ─── UI Auto-hide ─────────────────────────────────────────────────────────
    const SIDEBAR_HIDE_DELAY = 5000; // ms
    let uiVisible  = true;
    let uiTimer    = null;
    let timerFill  = null;

    // ─── Init ─────────────────────────────────────────────────────────────────
    function init() {
        UI.init();
        Remote.init();
        setupRemoteHandlers();
        setupTabBar();       // Setup tab bar immediately so buttons are clickable right away
        updateHintBar();

        const videoEl = document.getElementById('main-video');
        Player.init(videoEl, onPlayerStateChange);

        // Bind global Header Refresh button
        const refreshBtn = document.getElementById('btn-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => refreshCurrentPlaylist());
        }

        // Bind global hidden file input for *.m3u / *.m3u8 files
        const fileInput = document.getElementById('global-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    handleFileImport(e.target.files[0]);
                }
                e.target.value = '';
            });
        }

        // Sanitize and migrate existing playlists in storage
        migrateExistingPlaylists();
        playlists = Storage.getPlaylists();

        timerFill = document.getElementById('sidebar-timer-fill');

        // Show UI on any keypress and handle Mute shortcut (m key)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'm' || e.key === 'M') {
                const isMuted = Player.toggleMute();
                UI.showToast(isMuted ? '🔇 Đã tắt tiếng' : '🔊 Đã bật tiếng');
            }
        });
        startUITimer();

        // Load first playlist asynchronously without blocking UI interactions
        if (playlists.length > 0) {
            loadPlaylist(playlists[0]).then(() => {
                const last = Storage.getLastChannel();
                if (last && allChannels.length > 0) {
                    const ch = allChannels.find(c => c.url === last.url);
                    if (ch) playChannel(ch);
                }
            });
        } else {
            // Automatically add and load the bundled Vietnamese IPTV playlist!
            const defaultPl = Storage.addPlaylist('🇻🇳 Truyền Hình Việt Nam', 'playlist.m3u8');
            playlists = Storage.getPlaylists();
            loadPlaylist(defaultPl).then(() => {
                if (allChannels.length > 0) {
                    playChannel(allChannels[0]);
                }
            }).catch(() => {
                setTimeout(() => promptAddPlaylist(), 400);
            });
        }
    }

    /**
     * Safe URL normalizer (convert github blob to raw, pastebin to raw)
     */
    function safeNormalizeUrl(url) {
        if (!url) return '';
        if (window.M3UParser && typeof M3UParser.normalizeUrl === 'function') {
            return M3UParser.normalizeUrl(url);
        }
        let clean = String(url).trim();
        const ghBlobMatch = clean.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/i);
        if (ghBlobMatch) {
            return `https://raw.githubusercontent.com/${ghBlobMatch[1]}/${ghBlobMatch[2]}/${ghBlobMatch[3]}/${ghBlobMatch[4]}`;
        }
        const pbMatch = clean.match(/^https?:\/\/pastebin\.com\/([a-zA-Z0-9]+)$/i);
        if (pbMatch && pbMatch[1] !== 'raw') {
            return `https://pastebin.com/raw/${pbMatch[1]}`;
        }
        return clean;
    }

    /**
     * Fix any stored playlist URLs (e.g. github.com blob -> raw)
     */
    function migrateExistingPlaylists() {
        const stored = Storage.getPlaylists();
        let changed = false;
        stored.forEach(p => {
            if (p && p.url && !p.url.startsWith('file://')) {
                // Upgrade old iptv-org demo link to our curated local playlist.m3u8
                if (p.url === 'https://iptv-org.github.io/iptv/countries/vn.m3u') {
                    p.url = 'playlist.m3u8';
                    p.name = '🇻🇳 Truyền Hình Việt Nam';
                    changed = true;
                }
                const norm = safeNormalizeUrl(p.url);
                if (norm !== p.url) {
                    p.url = norm;
                    changed = true;
                }
            }
        });
        if (changed) {
            Storage.savePlaylists(stored);
        }
    }

    // ─── UI Show/Hide ─────────────────────────────────────────────────────────
    function showUI() {
        const wasHidden = !uiVisible;
        uiVisible = true;
        document.getElementById('header').classList.remove('ui-hidden');
        document.getElementById('sidebar').classList.remove('ui-hidden');
        document.getElementById('sidebar-timer-bar').classList.remove('ui-hidden');
        // Do NOT show bottom infoBar while channel sidebar is open to keep UI clean
        UI.showInfoBar(false);
        resetUITimer();

        if (wasHidden && currentChannel && UI.getFocusZone() === 'channels') {
            syncFocusToCurrentChannel();
        }
    }

    function hideUI() {
        uiVisible = false;
        document.getElementById('header').classList.add('ui-hidden');
        document.getElementById('sidebar').classList.add('ui-hidden');
        document.getElementById('sidebar-timer-bar').classList.add('ui-hidden');
        UI.showInfoBar(false);
        if (UI.isGroupPanelOpen()) UI.closeGroupPanel();
    }

    function resetUITimer() {
        clearTimeout(uiTimer);
        if (timerFill) {
            timerFill.style.transition = 'none';
            timerFill.style.transform = 'scaleX(1)';
            timerFill.getBoundingClientRect(); // force reflow
            timerFill.style.transition = `transform ${SIDEBAR_HIDE_DELAY}ms linear`;
            timerFill.style.transform = 'scaleX(0)';
        }
        startUITimer();
    }

    function startUITimer() {
        clearTimeout(uiTimer);
        uiTimer = setTimeout(() => {
            if (!UI.isModalVisible()) hideUI();
        }, SIDEBAR_HIDE_DELAY);
    }

    // ─── Playlist Loading ─────────────────────────────────────────────────────
    async function loadPlaylist(playlist, isRefresh = false) {
        if (!playlist) return;
        UI.showLoading(true, isRefresh ? `Đang nạp lại "${playlist.name}"...` : `Đang tải "${playlist.name}"...`);
        try {
            let channels = [];
            const isLocal = (playlist.url && playlist.url.startsWith('file://')) || playlist.isLocalFile;

            if (isLocal) {
                // Local file playlist
                const cachedContent = playlist.content || Storage.getPlaylistContent(playlist.id);
                if (cachedContent && cachedContent.trim().length > 0) {
                    channels = M3UParser.parse(cachedContent);
                } else {
                    // No cached content found: prompt user to pick the file again
                    UI.showLoading(false);
                    UI.showToast(`📂 Playlist "${playlist.name}" là file trên máy. Vui lòng chọn lại file để nạp!`, 4500);
                    targetPlaylistIdForFile = playlist.id;
                    triggerFilePicker();
                    return;
                }
            } else {
                // Web URL playlist: normalize and fetch (with CORS proxy fallback)
                playlist.url = safeNormalizeUrl(playlist.url);
                channels = await M3UParser.fetchAndParse(playlist.url);
            }

            // Merge favorites
            const favs = Storage.getFavorites();
            channels.forEach(ch => {
                ch.favorite = favs.some(f => f.url === ch.url);
            });

            allChannels = channels;
            currentPlaylistId = playlist.id;
            Storage.saveSetting('lastPlaylistId', playlist.id);

            // Update stored channel count & normalized URL
            Storage.updatePlaylist(playlist.id, {
                channelCount: channels.length,
                url: playlist.url
            });
            playlist.channelCount = channels.length;
            playlists = Storage.getPlaylists();

            buildGroups();
            switchTab(currentTab);
            UI.showLoading(false);

            // Thông báo số lượng kênh nạp được
            if (channels.length > 0) {
                const msg = isRefresh
                    ? `🔄 Đã nạp lại thành công ${channels.length} kênh từ "${playlist.name}"!`
                    : `🎉 Đã nạp thành công ${channels.length} kênh từ "${playlist.name}"!`;
                UI.showToast(msg, 4000);
            } else {
                UI.showToast(`⚠️ Playlist "${playlist.name}" không có kênh nào (0 kênh)!`, 5000);
            }
        } catch (err) {
            UI.showLoading(false);
            console.error('Playlist load error:', err);
            UI.showToast(`❌ Lỗi nạp playlist: ${err.message}`, 5500);
        }
    }

    function buildGroups() {
        const grouped = M3UParser.groupByCategory(allChannels);
        groups = [
            { name: '📋 Tất cả', count: allChannels.length, key: '__all__' },
            ...Object.entries(grouped).map(([name, chs]) => ({ name, count: chs.length, key: name }))
        ];
        UI.renderGroups(groups);
    }

    function getChannelsForCurrentView() {
        let channels;
        if (currentTab === 'favorites') {
            channels = Storage.getFavorites();
        } else {
            if (currentGroupIdx === 0) {
                channels = allChannels;
            } else {
                const g = groups[currentGroupIdx];
                channels = allChannels.filter(ch => ch.group === g.key);
            }
        }
        if (searchQuery) {
            channels = M3UParser.search(channels, searchQuery);
        }
        return channels;
    }

    function findChannelIndex(channel, list) {
        if (!channel || !list || !list.length) return -1;
        // 1. Exact object reference match
        let idx = list.indexOf(channel);
        if (idx !== -1) return idx;

        // 2. By unique id if present
        if (channel.id !== undefined && channel.id !== null) {
            idx = list.findIndex(c => c.id === channel.id);
            if (idx !== -1) return idx;
        }

        // 3. By both name and url
        if (channel.name && channel.url) {
            idx = list.findIndex(c => c.name === channel.name && c.url === channel.url);
            if (idx !== -1) return idx;
        }

        // 4. By url
        if (channel.url) {
            idx = list.findIndex(c => c.url === channel.url);
            if (idx !== -1) return idx;
        }

        // 5. By name
        if (channel.name) {
            idx = list.findIndex(c => c.name === channel.name);
            if (idx !== -1) return idx;
        }

        return -1;
    }

    function syncFocusToCurrentChannel() {
        if (!filteredChannels || !filteredChannels.length) return;
        const activeIdx = findChannelIndex(currentChannel, filteredChannels);
        UI.setFocusZone('channels');
        UI.setFocusChannelIdx(activeIdx >= 0 ? activeIdx : 0, filteredChannels.length);
        UI.scrollToPlayingChannel();
    }

    function refreshChannelList() {
        filteredChannels = getChannelsForCurrentView();
        UI.renderChannels(filteredChannels);
        syncFocusToCurrentChannel();
    }

    // ─── Refresh Playlist ─────────────────────────────────────────────────────
    async function refreshCurrentPlaylist() {
        if (!currentPlaylistId) {
            UI.showToast('⚠️ Chưa chọn playlist nào để nạp lại!');
            return;
        }
        const pl = playlists.find(p => p.id === currentPlaylistId);
        if (pl) {
            await loadPlaylist(pl, true);
        } else {
            UI.showToast('⚠️ Không tìm thấy thông tin playlist!');
        }
    }

    async function refreshPlaylistById(id) {
        const pl = playlists.find(p => p.id === id);
        if (!pl) return;
        
        // If it's a local file and has no content, ask to select file
        const isLocal = (pl.url && pl.url.startsWith('file://')) || pl.isLocalFile;
        const cached = Storage.getPlaylistContent(pl.id);
        if (isLocal && (!cached || cached.length === 0)) {
            targetPlaylistIdForFile = pl.id;
            UI.showToast(`📂 Vui lòng chọn file "${pl.name}.m3u" từ máy để nạp lại!`, 4000);
            triggerFilePicker();
            return;
        }

        await loadPlaylist(pl, true);
        if (UI.isModalVisible()) {
            showPlaylistManager(); // refresh list in modal
        }
    }

    // ─── File Import (.m3u, .m3u8) ────────────────────────────────────────────
    function triggerFilePicker(targetId = null) {
        targetPlaylistIdForFile = targetId;
        const fileInput = document.getElementById('global-file-input');
        if (fileInput) {
            fileInput.click();
        }
    }

    function handleFileImport(file) {
        if (!file) return;
        const validExts = ['.m3u', '.m3u8', '.txt'];
        const fileName = file.name || 'playlist.m3u8';
        const hasValidExt = validExts.some(ext => fileName.toLowerCase().endsWith(ext));
        
        if (!hasValidExt) {
            UI.showToast('⚠️ Vui lòng chọn file có đuôi .m3u hoặc .m3u8', 4000);
            return;
        }

        UI.showLoading(true, `Đang đọc file "${fileName}"...`);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const channels = M3UParser.parse(text);
                UI.showLoading(false);

                if (!channels || channels.length === 0) {
                    UI.showToast(`⚠️ File "${fileName}" không chứa kênh hợp lệ nào!`, 5000);
                    return;
                }

                let pl;
                if (targetPlaylistIdForFile) {
                    Storage.updatePlaylist(targetPlaylistIdForFile, {
                        content: text,
                        channelCount: channels.length,
                        url: 'file://' + fileName
                    });
                    pl = playlists.find(p => p.id === targetPlaylistIdForFile);
                    if (pl) pl.content = text;
                    targetPlaylistIdForFile = null;
                } else {
                    const playlistName = fileName.replace(/\.(m3u8?|txt)$/i, '');
                    pl = Storage.addPlaylist(playlistName, 'file://' + fileName, text, channels.length);
                }

                playlists = Storage.getPlaylists();
                UI.hideModal();
                await loadPlaylist(pl || playlists[playlists.length - 1]);
            } catch (err) {
                UI.showLoading(false);
                console.error('File import error:', err);
                UI.showToast(`❌ Lỗi đọc file: ${err.message}`, 4000);
            }
        };

        reader.onerror = () => {
            UI.showLoading(false);
            UI.showToast('❌ Không thể mở file đã chọn!', 4000);
        };

        reader.readAsText(file);
    }

    // ─── Tab System ───────────────────────────────────────────────────────────
    function setupTabBar() {
        const tabs = document.querySelectorAll('.tab-item');
        tabs.forEach(t => {
            t.addEventListener('click', (e) => {
                e.preventDefault();
                showUI();
                const tab = t.dataset.tab;
                switchTab(tab);
            });
        });
    }

    function switchTab(tab) {
        currentTab = tab;
        if (tab !== 'favorites' && tab !== 'playlists') currentGroupIdx = 0;
        UI.updateTab(tab);
        
        if (tab === 'playlists') {
            showPlaylistManager();
        } else {
            refreshChannelList();
        }
    }

    // ─── Group Selection ──────────────────────────────────────────────────────
    function selectGroup(idx) {
        currentGroupIdx = idx;
        refreshChannelList();
    }

    function getSelectedGroupIdx() { return currentGroupIdx; }

    function getCurrentChannelNumber() {
        if (!currentChannel) return 1;
        let idx = findChannelIndex(currentChannel, filteredChannels);
        if (idx >= 0) return idx + 1;
        idx = findChannelIndex(currentChannel, allChannels);
        return idx >= 0 ? idx + 1 : 1;
    }

    // ─── Channel Playback ─────────────────────────────────────────────────────
    function playChannel(channel) {
        currentChannel = channel;
        Player.play(channel.url);
        Storage.saveLastChannel(channel);

        const chNum = getCurrentChannelNumber();
        UI.showChannelSwitchCard(channel, chNum);
        UI.updateNowPlaying(channel, chNum);
        refreshChannelList();

        // Luôn đảm bảo tiêu điểm nằm ngay kênh vừa phát
        const activeIdx = findChannelIndex(currentChannel, filteredChannels);
        if (activeIdx >= 0) {
            UI.setFocusZone('channels');
            UI.setFocusChannelIdx(activeIdx, filteredChannels.length);
        }
        UI.scrollToPlayingChannel();
    }

    function playNext() {
        if (!filteredChannels.length) return;
        const idx = findChannelIndex(currentChannel, filteredChannels);
        const next = filteredChannels[(idx + 1) % filteredChannels.length];
        if (next) playChannel(next);
    }

    function playPrev() {
        if (!filteredChannels.length) return;
        const idx = findChannelIndex(currentChannel, filteredChannels);
        const prev = filteredChannels[(idx - 1 + filteredChannels.length) % filteredChannels.length];
        if (prev) playChannel(prev);
    }

    function getCurrentChannel() { return currentChannel; }

    // ─── Player State ─────────────────────────────────────────────────────────
    function onPlayerStateChange(state, url) {
        UI.updatePlayerStatus(state);
        if (state === Player.STATE.ERROR) {
            UI.showToast('⚠️ Lỗi phát kênh. Nhấn OK hoặc CH± để thử lại.', 4000);
        }
    }

    // ─── Favorites ────────────────────────────────────────────────────
    function toggleFavoriteCurrentChannel() {
        if (!currentChannel) {
            UI.showToast('Chưa có kênh nào đang phát');
            return;
        }
        const isFav = Storage.toggleFavorite(currentChannel);
        currentChannel.favorite = isFav;
        UI.showToast(isFav ? `⭐ Đã thêm "${currentChannel.name}" vào yêu thích` : `🗑 Đã bỏ yêu thích`);
        UI.refreshChannelFavBadge(currentChannel.url, isFav);
        if (currentTab === 'favorites') refreshChannelList();
    }

    // ─── Direct Channel Dialing & Search ──────────────────────────────────────
    function handleNumKey(num) {
        searchBuffer += num;
        UI.showDialNumber(searchBuffer);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            const dialNum = parseInt(searchBuffer, 10);
            const targetList = filteredChannels.length ? filteredChannels : allChannels;

            // 1. Direct channel number jump (1-based index)
            if (!isNaN(dialNum) && dialNum >= 1 && dialNum <= targetList.length) {
                const ch = targetList[dialNum - 1];
                if (ch) {
                    playChannel(ch);
                    UI.showToast(`📺 Chuyển đến kênh ${dialNum}: ${ch.name}`);
                }
            } else {
                // 2. Filter search query fallback
                searchQuery = searchBuffer;
                refreshChannelList();
                if (searchQuery) UI.showToast(`🔍 Tìm kiếm: ${searchQuery}`);
            }

            searchBuffer = '';
            UI.hideDialNumber(800);
        }, 1100);
    }

    // ─── Add Playlist Modal ───────────────────────────────────────────────────
    function promptAddPlaylist() {
        const inputId = 'playlist-url-input';
        const nameId = 'playlist-name-input';
        UI.showModal(
            '📡 Thêm Playlist IPTV',
            `<div class="modal-form">
                <label>Tên Playlist</label>
                <input type="text" id="${nameId}" class="modal-input" placeholder="Ví dụ: Kênh Việt Nam" value="My Playlist" />
                
                <label>Đường dẫn M3U / M3U8 (URL hoặc GitHub)</label>
                <input type="text" id="${inputId}" class="modal-input" placeholder="https://... hoặc link github.com/.../TV.m3u" />
                <p class="modal-hint">Hỗ trợ link M3U/M3U8 trực tiếp, link GitHub blob, Pastebin, hoặc tải file từ máy.</p>
            </div>`,
            [
                {
                    label: '✅ Thêm từ URL',
                    action: 'confirm',
                    callback: async () => {
                        const nameEl = document.getElementById(nameId);
                        const urlEl = document.getElementById(inputId);
                        const name = nameEl ? nameEl.value.trim() : 'My Playlist';
                        let url = urlEl ? urlEl.value.trim() : '';
                        if (!url) { UI.showToast('Vui lòng nhập đường dẫn URL'); return; }
                        
                        url = safeNormalizeUrl(url);

                        UI.hideModal();
                        switchTab('all');
                        const pl = Storage.addPlaylist(name || 'My Playlist', url);
                        playlists = Storage.getPlaylists();
                        await loadPlaylist(pl);
                    }
                },
                {
                    label: '📂 Nạp từ file (.m3u, .m3u8)',
                    action: 'import-file',
                    callback: () => {
                        triggerFilePicker();
                    }
                },
                {
                    label: '🇻🇳 Kênh VN Mặc Định',
                    action: 'demo',
                    callback: async () => {
                        UI.hideModal();
                        switchTab('all');
                        const defaultUrl = 'playlist.m3u8';
                        const pl = Storage.addPlaylist('🇻🇳 Truyền Hình Việt Nam', defaultUrl);
                        playlists = Storage.getPlaylists();
                        await loadPlaylist(pl);
                    }
                },
                {
                    label: '❌ Hủy',
                    action: 'cancel',
                    callback: () => {
                        UI.hideModal();
                        switchTab('all');
                    }
                }
            ]
        );
    }

    function showPlaylistManager() {
        playlists = Storage.getPlaylists();
        const items = (playlists || []).map((pl, i) => {
            if (!pl) return '';
            const isLocal = (pl.url && typeof pl.url === 'string' && pl.url.startsWith('file://')) || pl.isLocalFile;
            const badgeText = pl.channelCount ? (pl.channelCount + ' kênh') : (isLocal ? 'File trên máy' : 'Chưa tải');
            return `
            <div class="playlist-item ${pl.id === currentPlaylistId ? 'active' : ''}" data-id="${pl.id}" data-idx="${i}">
                <div class="playlist-info-box">
                    <div class="playlist-name-row">
                        <span class="playlist-title">${isLocal ? '📁' : '📋'} ${escHtml(pl.name || 'Playlist')}</span>
                        <span class="playlist-badge-count">${badgeText}</span>
                    </div>
                    <span class="playlist-url" title="${escHtml(pl.url || '')}">${escHtml(pl.url || '')}</span>
                </div>
                <div class="playlist-actions">
                    <button class="btn-load" onclick="AppState.loadPlaylistById(${pl.id})">▶ Xem</button>
                    <button class="btn-refresh-pl" onclick="AppState.refreshPlaylistById(${pl.id})" title="Nạp lại danh sách kênh">🔄 Nạp lại</button>
                    <button class="btn-del" onclick="AppState.deletePlaylist(${pl.id})" title="Xóa playlist này">🗑</button>
                </div>
            </div>
            `;
        }).join('');

        UI.showModal(
            '📡 Quản lý Playlist',
            `<div class="playlist-manager">
                ${items || '<p style="text-align:center;color:rgba(255,255,255,0.4);padding:24px 0;">Chưa có playlist nào được lưu.</p>'}
            </div>`,
            [
                { label: '➕ Thêm URL', action: 'add', callback: () => { UI.hideModal(); promptAddPlaylist(); } },
                { label: '📂 Nạp từ file (.m3u8/.m3u)', action: 'file', callback: () => triggerFilePicker() },
                {
                    label: '❌ Đóng',
                    action: 'cancel',
                    callback: () => {
                        UI.hideModal();
                        switchTab('all');
                    }
                }
            ]
        );
    }

    async function loadPlaylistById(id) {
        const pl = playlists.find(p => p.id === id);
        if (!pl) return;
        UI.hideModal();
        switchTab('all');
        await loadPlaylist(pl);
    }

    function deletePlaylist(id) {
        Storage.removePlaylist(id);
        playlists = Storage.getPlaylists();
        showPlaylistManager(); // refresh list in modal
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ─── Remote Handlers ──────────────────────────────────────────────────────
    function setupRemoteHandlers() {
        const wrapAction = (fn, allowWhenHidden = false) => (...args) => {
            const wasHidden = !uiVisible;
            showUI();
            if (wasHidden && !allowWhenHidden) {
                // Khi UI đang ẩn: bấm phím chỉ đánh thức UI và focus đúng kênh đang phát
                syncFocusToCurrentChannel();
                return;
            }
            fn(...args);
        };

        Remote.on('UP', wrapAction(() => {
            if (UI.isModalVisible()) { navigateModalBtn(-1); return; }
            if (UI.getFocusZone() === 'groups') {
                UI.setFocusGroupIdx(UI.getFocusGroupIdx() - 1, groups.length);
            } else {
                let curIdx = UI.getFocusChannelIdx();
                const playingIdx = findChannelIndex(currentChannel, filteredChannels);
                if (curIdx === 0 && playingIdx > 0) {
                    curIdx = playingIdx;
                }
                UI.setFocusChannelIdx(curIdx - 1, filteredChannels.length);
            }
        }));

        Remote.on('DOWN', wrapAction(() => {
            if (UI.isModalVisible()) { navigateModalBtn(1); return; }
            if (UI.getFocusZone() === 'groups') {
                UI.setFocusGroupIdx(UI.getFocusGroupIdx() + 1, groups.length);
            } else {
                let curIdx = UI.getFocusChannelIdx();
                const playingIdx = findChannelIndex(currentChannel, filteredChannels);
                if (curIdx === 0 && playingIdx > 0) {
                    curIdx = playingIdx;
                }
                UI.setFocusChannelIdx(curIdx + 1, filteredChannels.length);
            }
        }));

        Remote.on('LEFT', wrapAction(() => {
            if (UI.isModalVisible()) return;
            if (UI.getFocusZone() === 'channels') {
                UI.openGroupPanel();
                UI.setFocusGroupIdx(currentGroupIdx, groups.length);
            } else if (UI.getFocusZone() === 'groups') {
                UI.closeGroupPanel();
            }
        }));

        Remote.on('RIGHT', wrapAction(() => {
            if (UI.isModalVisible()) return;
            if (UI.getFocusZone() === 'groups') {
                selectGroup(UI.getFocusGroupIdx());
                UI.closeGroupPanel();
            }
        }));

        Remote.on('ENTER', wrapAction(() => {
            if (UI.isModalVisible()) {
                const btn = document.querySelector('.modal-btn.modal-focused');
                if (btn) btn.click();
                return;
            }
            if (UI.getFocusZone() === 'groups') {
                selectGroup(UI.getFocusGroupIdx());
                UI.closeGroupPanel();
            } else {
                const ch = filteredChannels[UI.getFocusChannelIdx()];
                if (ch) playChannel(ch);
            }
        }));

        Remote.on('BACK', wrapAction(() => {
            if (UI.isModalVisible()) {
                UI.hideModal();
                switchTab('all');
                return;
            }
            if (UI.isGroupPanelOpen()) {
                UI.closeGroupPanel();
                return;
            }
            if (searchQuery) {
                searchQuery = '';
                searchBuffer = '';
                refreshChannelList();
                UI.showToast('Đã xóa tìm kiếm');
            }
        }, true));

        Remote.on('EXIT', () => {
            if (window.tizen && tizen.application) {
                tizen.application.getCurrentApplication().exit();
            }
        });

        Remote.on('CH_UP',   wrapAction(() => playNext(), true));
        Remote.on('CH_DOWN', wrapAction(() => playPrev(), true));

        Remote.on('PLAY',       () => Player.resume());
        Remote.on('PAUSE',      () => Player.pause());
        Remote.on('PLAY_PAUSE', () => Player.togglePlayPause());
        Remote.on('STOP',       () => Player.stop());

        Remote.on('RED', wrapAction(() => refreshCurrentPlaylist(), true));
        Remote.on('YELLOW', wrapAction(() => toggleFavoriteCurrentChannel(), true));
        
        // Phím BLUE (Xanh dương) mở danh sách Quản lý Playlist
        Remote.on('BLUE', wrapAction(() => {
            showPlaylistManager();
        }, true));

        Remote.on('GREEN',  wrapAction(() => {
            hideUI();
            UI.showInfoBar(true);
            setTimeout(() => UI.showInfoBar(false), 4500);
        }, true));
        Remote.on('INFO',   wrapAction(() => {
            hideUI();
            UI.showInfoBar(true);
            setTimeout(() => UI.showInfoBar(false), 4500);
        }, true));

        // ── Volume & Mute Keys ───────────────────────────────────────────────
        Remote.on('VOL_UP', wrapAction(() => {
            Player.setVolume(Player.getVolume() + 0.1);
            UI.showToast(`🔊 Âm lượng: ${Math.round(Player.getVolume() * 100)}%`);
        }, true));
        Remote.on('VOL_DOWN', wrapAction(() => {
            Player.setVolume(Player.getVolume() - 0.1);
            UI.showToast(`🔉 Âm lượng: ${Math.round(Player.getVolume() * 100)}%`);
        }, true));
        Remote.on('MUTE', wrapAction(() => {
            const isMuted = Player.toggleMute();
            UI.showToast(isMuted ? '🔇 Đã tắt tiếng' : '🔊 Đã bật tiếng');
        }, true));

        for (let i = 0; i <= 9; i++) {
            Remote.on('NUM_' + i, wrapAction(() => handleNumKey(String(i)), true));
        }
    }

    function navigateModalBtn(dir) {
        const btns = document.querySelectorAll('.modal-btn');
        if (!btns.length) return;
        let idx = Array.from(btns).findIndex(b => b.classList.contains('modal-focused'));
        if (idx === -1) idx = 0;
        btns[idx].classList.remove('modal-focused');
        idx = (idx + dir + btns.length) % btns.length;
        btns[idx].classList.add('modal-focused');
    }

    function updateHintBar() {
        const hint = document.getElementById('hint-bar');
        if (hint) {
            hint.innerHTML = `
                <span>🔴 Nạp lại (Refresh)</span>
                <span>🟡 Yêu thích</span>
                <span>🟢 Hiện thông tin</span>
                <span>🔵 Playlists (Quản lý)</span>
                <span>CH±  Đổi kênh</span>
            `;
        }
    }

    return {
        init,
        selectGroup, getSelectedGroupIdx,
        playChannel, playNext, playPrev, getCurrentChannel, getCurrentChannelNumber,
        promptAddPlaylist, showPlaylistManager, loadPlaylistById, deletePlaylist,
        refreshCurrentPlaylist, refreshPlaylistById,
        triggerFilePicker, handleFileImport,
        toggleFavoriteCurrentChannel,
        switchTab,
        showUI, hideUI,
    };
})();

// ─── Boot ────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    AppState.init();
});
