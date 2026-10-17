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
    let currentRenderedChannels = [];

    // ─── DOM refs ─────────────────────────────────────────────────────────────
    let els = {};
    let switchCardTimer = null;
    let dialTimer = null;

    function init() {
        els = {
            groupPanel:             document.getElementById('group-panel'),
            groupList:              document.getElementById('group-list'),
            channelList:            document.getElementById('channel-list'),
            video:                  document.getElementById('main-video'),
            playerOverlay:          document.getElementById('player-overlay'),
            channelName:            document.getElementById('current-channel-name'),
            channelLogo:            document.getElementById('current-channel-logo'),
            currentLogoPlaceholder: document.getElementById('current-logo-placeholder'),
            currentChannelNum:      document.getElementById('current-channel-num'),
            osdGroupName:           document.getElementById('osd-group-name'),
            osdProgramTitle:        document.getElementById('osd-program-title'),
            osdTimeStart:           document.getElementById('osd-time-start'),
            osdTimeEnd:             document.getElementById('osd-time-end'),
            osdProgressFill:        document.getElementById('osd-progress-fill'),
            infoBar:                document.getElementById('info-bar'),
            liveClock:              document.getElementById('live-clock'),
            channelSwitchCard:      document.getElementById('channel-switch-card'),
            csChannelLogo:          document.getElementById('cs-channel-logo'),
            csLogoPlaceholder:      document.getElementById('cs-logo-placeholder'),
            csGroupName:            document.getElementById('cs-group-name'),
            csChannelName:          document.getElementById('cs-channel-name'),
            csChannelNum:           document.getElementById('cs-channel-num'),
            channelDialHud:         document.getElementById('channel-dial-hud'),
            dialNumber:             document.getElementById('dial-number'),
            channelCountBadge:      document.getElementById('channel-count-badge'),
            epgPanel:               document.getElementById('epg-panel'),
            epgNowTime:             document.getElementById('epg-now-time'),
            epgNowTitle:            document.getElementById('epg-now-title'),
            epgNowProgress:         document.getElementById('epg-now-progress'),
            epgNextTime:            document.getElementById('epg-next-time'),
            epgNextTitle:           document.getElementById('epg-next-title'),
            statusIcon:             document.getElementById('status-icon'),
            statusText:             document.getElementById('status-text'),
            tabBar:                 document.getElementById('tab-bar'),
            modal:                  document.getElementById('modal'),
            modalTitle:             document.getElementById('modal-title'),
            modalBody:              document.getElementById('modal-body'),
            loadingSpinner:         document.getElementById('loading-spinner'),
            hintBar:                document.getElementById('hint-bar'),
            toast:                  document.getElementById('toast'),
            noChannels:             document.getElementById('no-channels'),
        };

        // Group panel starts collapsed
        _setGroupPanelOpen(false, false);

        // Start live real-time digital clock
        startLiveClock();
    }

    // ─── Live Clock ───────────────────────────────────────────────────────────
    function startLiveClock() {
        function update() {
            if (!els.liveClock) return;
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const hoursStr = String(hours).padStart(2, '0');
            els.liveClock.textContent = `${hoursStr}:${minutes} ${ampm}`;
        }
        update();
        setInterval(update, 1000);
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

    // ─── EPG Estimator ───────────────────────────────────────────────────────
    function getEstimatedEpg(channel) {
        const now = new Date();
        const curMins = now.getMinutes();
        const curHours = now.getHours();

        // 30-minute program blocks (00-30, 30-00)
        const startSlotMins = curMins >= 30 ? 30 : 0;
        const endSlotMins = startSlotMins === 30 ? 0 : 30;
        const endSlotHours = (startSlotMins === 30 ? curHours + 1 : curHours) % 24;

        function formatTime(h, m) {
            const ampm = h >= 12 ? 'PM' : 'AM';
            let displayH = h % 12;
            if (displayH === 0) displayH = 12;
            return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
        }

        const startTimeStr = formatTime(curHours, startSlotMins);
        const endTimeStr = formatTime(endSlotHours, endSlotMins);
        const nextEndTimeStr = formatTime((endSlotHours + (endSlotMins === 30 ? 0 : 1)) % 24, endSlotMins === 30 ? 0 : 30);

        const elapsedMins = (curMins - startSlotMins + 60) % 30;
        const progressPercent = Math.min(100, Math.max(8, Math.round((elapsedMins / 30) * 100)));

        const group = (channel && channel.group ? channel.group.toLowerCase() : '');
        const name = (channel && channel.name ? channel.name.toLowerCase() : '');

        let nowTitle = 'Chương trình phát sóng trực tiếp';
        let nextTitle = 'Chương trình tiếp theo';

        if (group.includes('phim') || name.includes('movie') || name.includes('cinema') || name.includes('drama') || name.includes('tvb')) {
            nowTitle = 'Phim Truyện: Lá Thư Định Mệnh (Tập ' + (curHours + 1) + ')';
            nextTitle = 'Phim Truyện: Hạnh Phúc Đến Vạn Gia (Tập ' + (curHours + 2) + ')';
        } else if (group.includes('thể thao') || group.includes('sport') || name.includes('sport') || name.includes('on sports')) {
            nowTitle = 'Trực Tiếp: V-League 1 / Ngoại Hạng Anh';
            nextTitle = 'Bản Tin Thể Thao 24/7 & Bình Luận Sau Trận Đấu';
        } else if (group.includes('thiếu nhi') || group.includes('kids') || name.includes('kid') || name.includes('cartoon') || name.includes('on kids')) {
            nowTitle = 'Kns - Hãy Để Rác Đúng Nơi Quy Định';
            nextTitle = 'Thế Giới Hoạt Hình & Vui Cùng Bé';
        } else if (group.includes('tin tức') || group.includes('thời sự') || name.includes('news') || name.includes('vtv1')) {
            nowTitle = 'Bản Tin Thời Sự & Tin Tức 24 Giờ';
            nextTitle = 'Toàn Cảnh Thế Giới & Tiêu Điểm Kinh Tế';
        } else if (group.includes('nhạc') || group.includes('music') || name.includes('music')) {
            nowTitle = 'Giai Điệu Trẻ & Ca Khúc Quốc Tế Được Yêu Thích';
            nextTitle = 'Top Hits Âm Nhạc Việt Nam';
        } else {
            nowTitle = (channel ? channel.name : 'Truyền Hình') + ' - Phát Sóng Trực Tiếp';
            nextTitle = (channel ? channel.name : 'Truyền Hình') + ' - Chương Trình Kế Tiếp';
        }

        return {
            startTime: startTimeStr,
            endTime: endTimeStr,
            nextEndTime: nextEndTimeStr,
            progress: progressPercent,
            nowTitle,
            nextTitle
        };
    }

    // ─── Floating Channel Switch Card ─────────────────────────────────────────
    function showChannelSwitchCard(channel, channelNum) {
        if (!els.channelSwitchCard || !channel) return;
        clearTimeout(switchCardTimer);

        if (els.csChannelName) els.csChannelName.textContent = channel.name;
        if (els.csGroupName)   els.csGroupName.textContent   = channel.group || 'Truyền Hình';
        if (els.csChannelNum)  els.csChannelNum.textContent  = channelNum !== undefined && channelNum !== null ? channelNum : '';

        if (els.csChannelLogo && els.csLogoPlaceholder) {
            if (channel.logo) {
                els.csChannelLogo.src = channel.logo;
                els.csChannelLogo.style.display = 'block';
                els.csLogoPlaceholder.style.display = 'none';
            } else {
                els.csChannelLogo.style.display = 'none';
                els.csLogoPlaceholder.style.display = 'block';
            }
        }

        els.channelSwitchCard.classList.add('visible');
    }

    function hideChannelSwitchCard(delay = 0) {
        if (!els.channelSwitchCard) return;
        clearTimeout(switchCardTimer);
        if (delay > 0) {
            switchCardTimer = setTimeout(() => {
                if (els.channelSwitchCard) els.channelSwitchCard.classList.remove('visible');
            }, delay);
        } else {
            els.channelSwitchCard.classList.remove('visible');
        }
    }

    // ─── Direct Dial HUD ──────────────────────────────────────────────────────
    function showDialNumber(numStr) {
        if (!els.channelDialHud || !els.dialNumber) return;
        clearTimeout(dialTimer);
        els.dialNumber.textContent = numStr;
        els.channelDialHud.classList.add('visible');
    }

    function hideDialNumber(delay = 1200) {
        if (!els.channelDialHud) return;
        clearTimeout(dialTimer);
        dialTimer = setTimeout(() => {
            if (els.channelDialHud) els.channelDialHud.classList.remove('visible');
        }, delay);
    }

    // ─── Channels ─────────────────────────────────────────────────────────────
    function renderChannels(channels) {
        currentRenderedChannels = channels || [];
        if (!els.channelList) return;
        els.channelList.innerHTML = '';

        if (els.channelCountBadge) {
            els.channelCountBadge.textContent = (channels ? channels.length : 0) + ' kênh';
        }

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

        // Update EPG Panel on the right when focus moves
        if (currentRenderedChannels && currentRenderedChannels[focusChannelIdx]) {
            updateEpgPanel(currentRenderedChannels[focusChannelIdx], focusChannelIdx + 1);
        }
    }

    function updateEpgPanel(channel, channelNum) {
        if (!channel) return;
        const epg = getEstimatedEpg(channel);
        if (els.epgNowTime)     els.epgNowTime.textContent     = `${epg.startTime} - ${epg.endTime}`;
        if (els.epgNowTitle)    els.epgNowTitle.textContent    = epg.nowTitle;
        if (els.epgNowProgress) els.epgNowProgress.style.width = epg.progress + '%';
        if (els.epgNextTime)    els.epgNextTime.textContent    = `${epg.endTime} - ${epg.nextEndTime}`;
        if (els.epgNextTitle)   els.epgNextTitle.textContent   = epg.nextTitle;
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

    // ─── Player Info Bar (Modern OSD) ─────────────────────────────────────────
    function updateNowPlaying(channel, channelNum) {
        if (!channel) return;
        if (els.channelName)       els.channelName.textContent       = channel.name;
        if (els.currentChannelNum) els.currentChannelNum.textContent = channelNum !== undefined && channelNum !== null ? channelNum : '';
        if (els.osdGroupName)      els.osdGroupName.textContent      = channel.group || 'Live Stream';

        if (els.channelLogo) {
            if (channel.logo) {
                els.channelLogo.src = channel.logo;
                els.channelLogo.style.display = 'block';
                if (els.currentLogoPlaceholder) els.currentLogoPlaceholder.style.display = 'none';
            } else {
                els.channelLogo.style.display = 'none';
                if (els.currentLogoPlaceholder) els.currentLogoPlaceholder.style.display = 'block';
            }
        }

        const epg = getEstimatedEpg(channel);
        if (els.osdProgramTitle) els.osdProgramTitle.textContent = epg.nowTitle;
        if (els.osdTimeStart)    els.osdTimeStart.textContent    = epg.startTime;
        if (els.osdTimeEnd)      els.osdTimeEnd.textContent      = epg.endTime;
        if (els.osdProgressFill) els.osdProgressFill.style.width = epg.progress + '%';

        updateEpgPanel(channel, channelNum);
    }

    function updatePlayerStatus(state) {
        const map = {
            'idle':      { icon: '⏹', text: 'Ready',        cls: '' },
            'loading':   { icon: '⏳', text: 'Đang tải...',  cls: 'loading' },
            'playing':   { icon: '▶',  text: 'Đang phát',   cls: 'playing' },
            'paused':    { icon: '⏸',  text: 'Tạm dừng',    cls: '' },
            'error':     { icon: '⚠',  text: 'Lỗi luồng',   cls: 'error' },
            'buffering': { icon: '⏳', text: 'Đang đệm...',  cls: 'loading' },
        };
        const s = map[state] || map['idle'];
        if (els.statusIcon)    els.statusIcon.textContent = s.icon;
        if (els.statusText)    els.statusText.textContent = s.text;
        if (els.playerOverlay) els.playerOverlay.className = 'player-overlay ' + s.cls;

        // Sync Floating Channel Switch Card
        if (state === 'loading' || state === 'buffering') {
            const ch = AppState.getCurrentChannel();
            if (ch) {
                showChannelSwitchCard(ch, AppState.getCurrentChannelNumber ? AppState.getCurrentChannelNumber() : null);
            }
        } else if (state === 'playing') {
            // Keep card briefly then dismiss smoothly
            hideChannelSwitchCard(2500);
        } else if (state === 'error') {
            hideChannelSwitchCard(0);
        }
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
        showChannelSwitchCard, hideChannelSwitchCard,
        showDialNumber, hideDialNumber,
        updateEpgPanel,
        // Modal / Toast
        showModal, hideModal, isModalVisible,
        showToast,
        // Focus
        getFocusZone, setFocusZone,
        getFocusGroupIdx, getFocusChannelIdx,
        setFocusGroupIdx, setFocusChannelIdx,
    };
})();
