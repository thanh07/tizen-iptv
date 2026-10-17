/**
 * UI Manager — Renders and manages focus navigation for Tizen TV
 *
 * NEW BEHAVIOUR
 * ─────────────
 * • Sidebar mặc định chỉ hiện channel-panel (group-panel ẩn)
 * • Nhấn ← từ channel-panel → group-panel trượt ra
 * • Nhấn ← từ group-panel / → từ group-panel → group-panel ẩn lại
 * • Kênh đang phát được highlight + auto-scroll tới
 * • Info bar luôn visible khi UI hiện, ẩn khi fullscreen
 */
const UI = (() => {
    // ─── Focus System ─────────────────────────────────────────────────────────
    let focusZone    = 'channels';   // 'groups' | 'channels' | 'modal'
    let focusGroupIdx   = 0;
    let focusChannelIdx = 0;
    let groupPanelOpen  = false;     // ← NEW: group panel starts hidden

    // ─── DOM refs ─────────────────────────────────────────────────────────────
    let els = {};

    function init() {
        els = {
            groupPanel:     document.getElementById('group-panel'),
            groupList:      document.getElementById('group-list'),
            channelList:    document.getElementById('channel-list'),
            video:          document.getElementById('main-video'),
            playerOverlay:  document.getElementById('player-overlay'),
            channelName:    document.getElementById('current-channel-name'),
            channelLogo:    document.getElementById('current-channel-logo'),
            infoMeta:       document.getElementById('info-meta'),
            statusIcon:     document.getElementById('status-icon'),
            statusText:     document.getElementById('status-text'),
            infoBar:        document.getElementById('info-bar'),
            tabBar:         document.getElementById('tab-bar'),
            modal:          document.getElementById('modal'),
            modalTitle:     document.getElementById('modal-title'),
            modalBody:      document.getElementById('modal-body'),
            loadingSpinner: document.getElementById('loading-spinner'),
            hintBar:        document.getElementById('hint-bar'),
            toast:          document.getElementById('toast'),
            noChannels:     document.getElementById('no-channels'),
        };

        // Group panel starts collapsed
        _setGroupPanelOpen(false, false);
    }

    // ─── Group Panel Show/Hide ────────────────────────────────────────────────
    function _setGroupPanelOpen(open, animate = true) {
        groupPanelOpen = open;
        if (!els.groupPanel) return;
        if (!animate) els.groupPanel.style.transition = 'none';
        els.groupPanel.classList.toggle('group-panel-hidden', !open);
        if (!animate) {
            // Force reflow then re-enable transitions
            els.groupPanel.getBoundingClientRect();
            els.groupPanel.style.transition = '';
        }
    }

    function openGroupPanel() {
        _setGroupPanelOpen(true);
        focusZone = 'groups';
        updateGroupFocus();
        updateChannelFocus();
    }

    function closeGroupPanel() {
        _setGroupPanelOpen(false);
        focusZone = 'channels';
        updateGroupFocus();
        updateChannelFocus();
    }

    function isGroupPanelOpen() { return groupPanelOpen; }

    // ─── Groups ───────────────────────────────────────────────────────────────
    function renderGroups(groups) {
        if (!els.groupList) return;
        els.groupList.innerHTML = '';
        groups.forEach((g, i) => {
            const li = document.createElement('li');
            li.className = 'group-item';
            li.dataset.idx = i;
            li.innerHTML = `<span class="group-icon">📂</span><span class="group-name">${escHtml(g.name)}</span><span class="group-count">${g.count}</span>`;
            li.addEventListener('click', () => {
                AppState.selectGroup(i);
                closeGroupPanel();
            });
            els.groupList.appendChild(li);
        });
        updateGroupFocus();
    }

    function updateGroupFocus() {
        if (!els.groupList) return;
        const items = els.groupList.querySelectorAll('.group-item');
        items.forEach((item, i) => {
            item.classList.toggle('focused',  focusZone === 'groups' && i === focusGroupIdx);
            item.classList.toggle('selected', i === AppState.getSelectedGroupIdx());
        });
        const focused = els.groupList.querySelector('.focused');
        if (focused) focused.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // ─── Channels ─────────────────────────────────────────────────────────────
    function renderChannels(channels) {
        if (!els.channelList) return;
        els.channelList.innerHTML = '';

        if (!channels || channels.length === 0) {
            if (els.noChannels) els.noChannels.style.display = 'flex';
            return;
        }
        if (els.noChannels) els.noChannels.style.display = 'none';

        const currentCh = AppState.getCurrentChannel();

        channels.forEach((ch, i) => {
            const li = document.createElement('li');
            li.className = 'channel-item';
            li.dataset.idx = i;
            li.dataset.url = ch.url;

            const isFav    = Storage.isFavorite(ch.url);
            const isActive = currentCh && (
                ch === currentCh ||
                (currentCh.id !== undefined && ch.id !== undefined && currentCh.id === ch.id) ||
                (currentCh.name === ch.name && currentCh.url === ch.url) ||
                (currentCh.url === ch.url)
            );

            if (isActive) li.classList.add('playing');   // ← highlight playing

            li.innerHTML = `
                <div class="channel-num">${i + 1}</div>
                <div class="channel-logo-wrap">
                    ${ch.logo
                        ? `<img class="channel-logo" src="${escHtml(ch.logo)}" alt="" onerror="this.style.display='none'">`
                        : '<div class="channel-logo-placeholder">📺</div>'}
                </div>
                <div class="channel-info">
                    <div class="channel-name">${escHtml(ch.name)}</div>
                    <div class="channel-group">${escHtml(ch.group)}</div>
                </div>
                ${isFav    ? '<div class="channel-fav-badge">⭐</div>'  : ''}
                ${isActive ? '<div class="channel-playing-badge">▶</div>' : ''}
            `;
            li.addEventListener('click', () => {
                AppState.playChannel(ch);
                setFocusZone('channels');
                setFocusChannelIdx(i, channels.length);
            });
            els.channelList.appendChild(li);
        });

        updateChannelFocus();
        scrollToPlayingChannel();   // ← auto-scroll to currently playing
    }

    /** Scroll the channel list so the playing item is visible */
    function scrollToPlayingChannel() {
        if (!els.channelList) return;
        const target = els.channelList.querySelector('.channel-item.playing') || els.channelList.querySelector('.channel-item.focused');
        if (target) target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    function updateChannelFocus() {
        if (!els.channelList) return;
        const items = els.channelList.querySelectorAll('.channel-item');
        items.forEach((item, i) => {
            item.classList.toggle('focused', focusZone === 'channels' && i === focusChannelIdx);
        });
        const focused = els.channelList.querySelector('.focused');
        if (focused) focused.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function refreshChannelFavBadge(channelUrl, isFav) {
        const items = els.channelList ? els.channelList.querySelectorAll('.channel-item') : [];
        items.forEach(item => {
            if (item.dataset.url === channelUrl) {
                const existing = item.querySelector('.channel-fav-badge');
                if (isFav && !existing) {
                    const badge = document.createElement('div');
                    badge.className = 'channel-fav-badge';
                    badge.textContent = '⭐';
                    item.appendChild(badge);
                } else if (!isFav && existing) {
                    existing.remove();
                }
            }
        });
    }

    // ─── Player Info Bar ─────────────────────────────────────────────────────
    function updateNowPlaying(channel) {
        if (!channel) return;
        if (els.channelName) els.channelName.textContent = channel.name;
        if (els.infoMeta)    els.infoMeta.textContent    = channel.group || 'Live Stream';
        if (els.channelLogo) {
            if (channel.logo) {
                els.channelLogo.src = channel.logo;
                els.channelLogo.style.display = 'block';
            } else {
                els.channelLogo.style.display = 'none';
            }
        }
    }

    function updatePlayerStatus(state) {
        const map = {
            'idle':      { icon: '⏹', text: 'Ready',       cls: '' },
            'loading':   { icon: '⏳', text: 'Loading...',  cls: 'loading' },
            'playing':   { icon: '▶',  text: 'Playing',     cls: 'playing' },
            'paused':    { icon: '⏸',  text: 'Paused',      cls: '' },
            'error':     { icon: '⚠',  text: 'Error',       cls: 'error' },
            'buffering': { icon: '⏳', text: 'Buffering...', cls: 'loading' },
        };
        const s = map[state] || map['idle'];
        if (els.statusIcon)    els.statusIcon.textContent = s.icon;
        if (els.statusText)    els.statusText.textContent = s.text;
        if (els.playerOverlay) els.playerOverlay.className = 'player-overlay ' + s.cls;
    }

    /** Info bar shown/hidden (slides up from bottom) */
    function showInfoBar(show) {
        if (els.infoBar) els.infoBar.classList.toggle('visible', show);
    }

    // ─── Loading Spinner ─────────────────────────────────────────────────────
    function showLoading(show, text) {
        if (els.loadingSpinner) {
            els.loadingSpinner.style.display = show ? 'flex' : 'none';
            const t = els.loadingSpinner.querySelector('.loading-text');
            if (t) t.textContent = text || 'Loading...';
        }
    }

    // ─── Tab Bar ─────────────────────────────────────────────────────────────
    function updateTab(tab) {
        if (!els.tabBar) return;
        els.tabBar.querySelectorAll('.tab-item').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
    }

    // ─── Modal ────────────────────────────────────────────────────────────────
    function showModal(title, bodyHTML, buttons) {
        if (!els.modal) return;
        els.modalTitle.textContent = title;
        els.modalBody.innerHTML   = bodyHTML;

        const btnContainer = els.modal.querySelector('.modal-buttons');
        if (btnContainer && buttons) {
            btnContainer.innerHTML = '';
            buttons.forEach((b, i) => {
                const btn = document.createElement('button');
                btn.className   = 'modal-btn' + (i === 0 ? ' primary modal-focused' : '');
                btn.textContent = b.label;
                btn.dataset.action = b.action;
                btn.addEventListener('click', () => b.callback && b.callback());
                btnContainer.appendChild(btn);
            });
        }

        els.modal.classList.add('visible');
        focusZone = 'modal';
    }

    function hideModal() {
        if (els.modal) els.modal.classList.remove('visible');
        focusZone = 'channels';
        updateChannelFocus();
    }

    function isModalVisible() {
        return els.modal && els.modal.classList.contains('visible');
    }

    // ─── Toast ────────────────────────────────────────────────────────────────
    let toastTimer = null;
    function showToast(msg, duration) {
        if (!els.toast) return;
        els.toast.textContent = msg;
        els.toast.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => els.toast.classList.remove('visible'), duration || 2500);
    }

    // ─── Focus Navigation ────────────────────────────────────────────────────
    function getFocusZone()  { return focusZone; }
    function setFocusZone(zone) {
        focusZone = zone;
        updateGroupFocus();
        updateChannelFocus();
    }

    function getFocusGroupIdx()   { return focusGroupIdx; }
    function getFocusChannelIdx() { return focusChannelIdx; }

    function setFocusGroupIdx(idx, groupCount) {
        focusGroupIdx = Math.max(0, Math.min(groupCount - 1, idx));
        updateGroupFocus();
    }

    function setFocusChannelIdx(idx, channelCount) {
        focusChannelIdx = Math.max(0, Math.min(channelCount - 1, idx));
        updateChannelFocus();
    }

    // ─── Helper ───────────────────────────────────────────────────────────────
    function escHtml(str) {
        if (!str) return '';
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    return {
        init,
        // Group panel
        openGroupPanel, closeGroupPanel, isGroupPanelOpen,
        // Render
        renderGroups, updateGroupFocus,
        renderChannels, updateChannelFocus, refreshChannelFavBadge,
        scrollToPlayingChannel,
        // Player
        updateNowPlaying, updatePlayerStatus,
        showInfoBar, showLoading, updateTab,
        // Modal / Toast
        showModal, hideModal, isModalVisible,
        showToast,
        // Focus
        getFocusZone, setFocusZone,
        getFocusGroupIdx, getFocusChannelIdx,
        setFocusGroupIdx, setFocusChannelIdx,
    };
})();
