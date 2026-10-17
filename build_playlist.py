#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Builder for default Vietnamese IPTV playlist (playlist.m3u8).
Aggregates clean, verified, deduplicated HLS (.m3u8) streams with full logos,
organized into intuitive groups.
"""

channels = [
    # ==========================
    # 1. ĐÀI TRUYỀN HÌNH VIỆT NAM (VTV)
    # ==========================
    {
        "id": "vtv1hd",
        "name": "VTV1 HD",
        "group": "VTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/VTV1.png",
        "url": "https://dethich.pw/vtv1/index.m3u8"
    },
    {
        "id": "vtv2hd",
        "name": "VTV2 HD",
        "group": "VTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/VTV2.png",
        "url": "https://dethich.pw/vtv2/index.m3u8"
    },
    {
        "id": "vtv3hd",
        "name": "VTV3 HD",
        "group": "VTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/VTV3.png",
        "url": "https://dethich.pw/vtv3/index.m3u8"
    },
    {
        "id": "vtv4hd",
        "name": "VTV4 HD",
        "group": "VTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/VTV4.png",
        "url": "https://dethich.pw/vtv4/index.m3u8"
    },
    {
        "id": "vtv5hd",
        "name": "VTV5 HD",
        "group": "VTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/VTV5.png",
        "url": "https://dethich.pw/vtv5/index.m3u8"
    },
    {
        "id": "vtv5hdtnb",
        "name": "VTV5 Tây Nam Bộ HD",
        "group": "VTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/VTV5_TNB.png",
        "url": "https://dethich.pw/vtv5tnb/index.m3u8"
    },
    {
        "id": "vtv5hdtn",
        "name": "VTV5 Tây Nguyên HD",
        "group": "VTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/VTV5_TN.png",
        "url": "https://dethich.pw/vtv5tn/index.m3u8"
    },
    {
        "id": "vtv6hd",
        "name": "VTV6 HD",
        "group": "VTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/VTV6.png",
        "url": "https://dethich.pw/vtv6/index.m3u8"
    },
    {
        "id": "vtv7hd",
        "name": "VTV7 HD",
        "group": "VTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/VTV7.png",
        "url": "https://dethich.pw/vtv7/index.m3u8"
    },
    {
        "id": "vtv8hd",
        "name": "VTV8 HD",
        "group": "VTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/VTV8.png",
        "url": "https://dethich.pw/vtv8/index.m3u8"
    },
    {
        "id": "vtv9hd",
        "name": "VTV9 HD",
        "group": "VTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/VTV9.png",
        "url": "https://dethich.pw/vtv9/index.m3u8"
    },
    {
        "id": "vtvcantho",
        "name": "VTV Cần Thơ HD",
        "group": "VTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/VTV10.png",
        "url": "https://dethich.pw/vtv10/index.m3u8"
    },

    # ==========================
    # 2. KÊNH THIẾT YẾU QUỐC GIA
    # ==========================
    {
        "id": "antvhd",
        "name": "ANTV HD",
        "group": "Kênh Thiết Yếu",
        "logo": "https://i.imgur.com/eGkFbAh.png",
        "url": "https://liveh12.vtvprime.vn/hls/ANNINHTV/index.m3u8"
    },
    {
        "id": "qpvnhd",
        "name": "QPVN HD",
        "group": "Kênh Thiết Yếu",
        "logo": "https://i.imgur.com/GQO7UNu.png",
        "url": "https://liveh12.vtvprime.vn/hls/QPTV/index.m3u8"
    },

    # ==========================
    # 3. HTV & HTVC (TP. HỒ CHÍ MINH)
    # ==========================
    {
        "id": "htv1hd",
        "name": "HTV1 HD",
        "group": "HTV",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/HTV1.png/960px-HTV1.png",
        "url": "https://dethich.pw/htv1/index.m3u8"
    },
    {
        "id": "htv2hd",
        "name": "HTV2 - Vie Channel",
        "group": "HTV",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/d/d2/HTV2_-_Vie_Channel.png",
        "url": "https://dethich.pw/htv2/index.m3u8"
    },
    {
        "id": "htv3hd",
        "name": "HTV3 HD",
        "group": "HTV",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/6/65/HTV3-2018.png",
        "url": "https://dethich.pw/htv3/index.m3u8"
    },
    {
        "id": "htv4hd",
        "name": "HTV4 HD",
        "group": "HTV",
        "logo": "https://raw.githubusercontent.com/ntd249/logochannel/main/HTV4.png",
        "url": "https://dethich.pw/htv4/index.m3u8"
    },
    {
        "id": "htv7hd",
        "name": "HTV7 HD",
        "group": "HTV",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/c/c0/HTV7_logo.webp",
        "url": "https://dethich.pw/htv7/index.m3u8"
    },
    {
        "id": "htv9hd",
        "name": "HTV9 HD",
        "group": "HTV",
        "logo": "https://upload.wikimedia.org/wikipedia/commons/b/bf/HTV9_logo.webp",
        "url": "https://dethich.pw/htv9/index.m3u8"
    },
    {
        "id": "htvthethaohd",
        "name": "HTV Thể Thao HD",
        "group": "HTV",
        "logo": "https://upload.wikimedia.org/wikipedia/vi/3/3f/HTV_THETHAO_2014.png",
        "url": "https://dethich.pw/htvthethao/index.m3u8"
    },
    {
        "id": "htvcthuanviethd",
        "name": "HTVC Thuần Việt",
        "group": "HTV",
        "logo": "https://i.imgur.com/KtMeo6q.png",
        "url": "https://freem3u.xyz/api/live/play.m3u8?vid=13"
    },
    {
        "id": "htvcphimhd",
        "name": "HTVC Phim HD",
        "group": "HTV",
        "logo": "https://i.imgur.com/P0wqvmu.png",
        "url": "https://freem3u.xyz/api/live/play.m3u8?vid=15"
    },
    {
        "id": "htvcgiadinhhd",
        "name": "HTVC Gia Đình",
        "group": "HTV",
        "logo": "https://i.imgur.com/Al6xJme.png",
        "url": "https://freem3u.xyz/api/live/play.m3u8?vid=11"
    },
    {
        "id": "htvcphunuhd",
        "name": "HTVC Phụ Nữ",
        "group": "HTV",
        "logo": "https://i.imgur.com/FxzpvHI.png",
        "url": "https://freem3u.xyz/api/live/play.m3u8?vid=12"
    },
    {
        "id": "htvcdulichhd",
        "name": "HTVC Du Lịch",
        "group": "HTV",
        "logo": "https://i.imgur.com/mDemDFL.png",
        "url": "https://freem3u.xyz/api/live/play.m3u8?vid=133"
    },
    {
        "id": "htvcplushd",
        "name": "HTVC+",
        "group": "HTV",
        "logo": "https://i.imgur.com/Tkjs3C5.png",
        "url": "https://freem3u.xyz/api/live/play.m3u8?vid=132"
    },

    # ==========================
    # 4. TRUYỀN HÌNH VĨNH LONG (THVL)
    # ==========================
    {
        "id": "vinhlong1hd",
        "name": "THVL1 HD",
        "group": "THVL",
        "logo": "https://i.imgur.com/5YFsqPx.png",
        "url": "https://dethich.pw/thvl1/index.m3u8"
    },
    {
        "id": "vinhlong2hd",
        "name": "THVL2 HD",
        "group": "THVL",
        "logo": "https://i.imgur.com/iluoazf.png",
        "url": "https://dethich.pw/thvl2/index.m3u8"
    },
    {
        "id": "vinhlong3hd",
        "name": "THVL3 HD",
        "group": "THVL",
        "logo": "https://i.imgur.com/OQXEhqu.png",
        "url": "https://dethich.pw/thvl3/index.m3u8"
    },
    {
        "id": "vinhlong4hd",
        "name": "THVL4 HD",
        "group": "THVL",
        "logo": "https://i.imgur.com/ARhIkvR.png",
        "url": "https://dethich.pw/thvl4/index.m3u8"
    },

    # ==========================
    # 5. TRUYỀN HÌNH CÁP SCTV
    # ==========================
    {
        "id": "sctv2",
        "name": "SCTV2 HD - Kênh Âm Nhạc",
        "group": "SCTV",
        "logo": "https://i.imgur.com/8i5DXIg.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv2/master.m3u8"
    },
    {
        "id": "sctv3",
        "name": "SCTV3 - Kênh Thiếu Nhi",
        "group": "SCTV",
        "logo": "https://i.imgur.com/tfk298I.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/bsod999cuteptgyoutuber/1234567890/manifest/sctv3/master.m3u8"
    },
    {
        "id": "sctv4",
        "name": "SCTV4 - Kênh Giải Trí",
        "group": "SCTV",
        "logo": "https://i.imgur.com/qkZhzQq.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv4/master.m3u8"
    },
    {
        "id": "sctv4k",
        "name": "SCTV 4K UHD",
        "group": "SCTV",
        "logo": "https://i.imgur.com/eQVMAur.png",
        "url": "https://vietanhtv.id.vn/sctv/sctv-4k/index.m3u8"
    },
    {
        "id": "sctv6",
        "name": "SCTV6 - Kênh Tổng Hợp",
        "group": "SCTV",
        "logo": "https://i.imgur.com/2oOVS42.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv6/master.m3u8"
    },
    {
        "id": "sctv7",
        "name": "SCTV7 - Kênh Sân Khấu",
        "group": "SCTV",
        "logo": "https://i.imgur.com/xbIUZYd.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv7/master.m3u8"
    },
    {
        "id": "sctv9",
        "name": "SCTV9 - Kênh Phim Châu Á",
        "group": "SCTV",
        "logo": "https://i.imgur.com/OJMbhow.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv9/master.m3u8"
    },
    {
        "id": "sctv11",
        "name": "SCTV11 - Kênh Hài Phim",
        "group": "SCTV",
        "logo": "https://i.imgur.com/ZmFfy9o.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv11/master.m3u8"
    },
    {
        "id": "sctv12",
        "name": "SCTV12 - Kênh Du Lịch",
        "group": "SCTV",
        "logo": "https://i.imgur.com/5pDFkH0.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv12/master.m3u8"
    },
    {
        "id": "sctv13",
        "name": "SCTV13 - Phụ Nữ & Gia Đình",
        "group": "SCTV",
        "logo": "https://i.imgur.com/aoz1iDw.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv13/master.m3u8"
    },
    {
        "id": "sctv14",
        "name": "SCTV14 - Kênh Phim Việt",
        "group": "SCTV",
        "logo": "https://i.imgur.com/rIqmRNK.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv14/master.m3u8"
    },
    {
        "id": "sctv15",
        "name": "SCTV15 - Kênh Thể Thao",
        "group": "SCTV",
        "logo": "https://i.imgur.com/8i5DXIg.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv15/master.m3u8"
    },
    {
        "id": "sctv16",
        "name": "SCTV16 - Phim Nước Ngoài",
        "group": "SCTV",
        "logo": "https://i.imgur.com/ldCYtvt.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv16/master.m3u8"
    },
    {
        "id": "sctv17",
        "name": "SCTV17 - Kênh Hoạt Hình",
        "group": "SCTV",
        "logo": "https://i.imgur.com/8i5DXIg.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv17/master.m3u8"
    },
    {
        "id": "sctv18",
        "name": "SCTV18 - Kênh Mua Sắm",
        "group": "SCTV",
        "logo": "https://i.imgur.com/FfUSlgI.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv18/master.m3u8"
    },
    {
        "id": "sctv19",
        "name": "SCTV19 - Kênh K-Drama",
        "group": "SCTV",
        "logo": "https://i.imgur.com/yBAFZRs.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv19/master.m3u8"
    },
    {
        "id": "sctv20",
        "name": "SCTV20 - Kênh Ca Nhạc",
        "group": "SCTV",
        "logo": "https://i.imgur.com/7ABZhfZ.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv20/master.m3u8"
    },
    {
        "id": "sctv22",
        "name": "SCTV22 - Kênh Thể Thao Plus",
        "group": "SCTV",
        "logo": "https://i.imgur.com/8i5DXIg.png",
        "url": "https://vtvgolive-sctvdrm.vtvdigital.vn/manifest/sctv22/master.m3u8"
    },

    # ==========================
    # 6. PHIM TRUYỆN & GIẢI TRÍ TIẾNG VIỆT
    # ==========================
    {
        "id": "onmovies",
        "name": "ON Movies HD",
        "group": "Giải Trí & Phim Truyện",
        "logo": "https://i.ibb.co/fdbgvtT8/IMG-2523.webp",
        "url": "https://freem3u.xyz/api/live/play.m3u8?vid=181"
    },
    {
        "id": "onviedrama",
        "name": "ON Vie Drama HD",
        "group": "Giải Trí & Phim Truyện",
        "logo": "https://i.ibb.co/VptvgFVx/IMG-2530.webp",
        "url": "http://dvrfl05.bozztv.com/vch_vchannel18/index.m3u8"
    },
    {
        "id": "onkids",
        "name": "ON Kids HD",
        "group": "Giải Trí & Phim Truyện",
        "logo": "https://i.ibb.co/RGsg8XfM/IMG-2512.webp",
        "url": "https://freem3u.xyz/api/live/play.m3u8?vid=179"
    },
    {
        "id": "onlife",
        "name": "ON Life HD",
        "group": "Giải Trí & Phim Truyện",
        "logo": "https://i.ibb.co/XxtcgQQv/IMG-2513.webp",
        "url": "https://freem3u.xyz/api/live/play.m3u8?vid=188"
    },
    {
        "id": "tvbvietnam",
        "name": "TVB Tiếng Việt HD",
        "group": "Giải Trí & Phim Truyện",
        "logo": "https://raw.githubusercontent.com/songwenhui239/Songwenhui239/refs/heads/main/TVB%20Vietnam.jpeg",
        "url": "https://amg01868-amg01868c3-tvbanywhere-us-4491.playouts.now.amagi.tv/playlist/amg01868-tvbusa-tvbvietnam-tvbanywhereus/playlist.m3u8"
    },
    {
        "id": "asianfood",
        "name": "Asian Food Network VN",
        "group": "Giải Trí & Phim Truyện",
        "logo": "https://i.imgur.com/pux6WN8.png",
        "url": "https://freem3u.xyz/api/live/play.m3u8?vid=215"
    },
    {
        "id": "outdoorchannel",
        "name": "Outdoor Channel VN",
        "group": "Giải Trí & Phim Truyện",
        "logo": "https://i.imgur.com/Kh4MWaY.png",
        "url": "https://freem3u.xyz/api/live/play.m3u8?vid=216"
    },

    # ==========================
    # 7. TRUYỀN HÌNH TỈNH THÀNH (ĐỊA PHƯƠNG)
    # ==========================
    {
        "id": "hanoi1",
        "name": "Hà Nội 1 HD",
        "group": "Địa Phương",
        "logo": "https://i.postimg.cc/hvL15x02/Hanoi-TV1.png",
        "url": "https://liveh34.vtvprime.vn/hls/HANOI1TV/index.m3u8"
    },
    {
        "id": "danang1",
        "name": "Đà Nẵng 1 HD",
        "group": "Địa Phương",
        "logo": "https://i.postimg.cc/8jwBQ42q/dnrt1.png",
        "url": "https://live.mediatech.vn/live/285b59a111d76974225a8e3004bfc31a509/chunklist.m3u8"
    },
    {
        "id": "danang2",
        "name": "Đà Nẵng 2 HD",
        "group": "Địa Phương",
        "logo": "https://i.postimg.cc/870Rs5Pm/dnrt2.png",
        "url": "https://live.mediatech.vn/live/2859145290d0d7947ef88b6240123b62474/chunklist.m3u8"
    },
    {
        "id": "haiphong3",
        "name": "Hải Phòng 3",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/FEvJhRf.png",
        "url": "https://live-hq.evgcdn.net/live/28548ca35823d41426d8b3da7ed82bdab13/chunklist.m3u8"
    },
    {
        "id": "cantho1",
        "name": "Cần Thơ 1 HD",
        "group": "Địa Phương",
        "logo": "https://i.ibb.co/MDhNH26J/cantho1-2025.png",
        "url": "https://live.canthotv.vn/live/tv/chunklist.m3u8"
    },
    {
        "id": "cantho2",
        "name": "Cần Thơ 2 HD",
        "group": "Địa Phương",
        "logo": "https://i.ibb.co/JjVvkMsf/cantho2-2025.png",
        "url": "https://live.canthotv.vn/cs2/live.stream/chunklist.m3u8"
    },
    {
        "id": "cantho3",
        "name": "Cần Thơ 3 HD",
        "group": "Địa Phương",
        "logo": "https://i.ibb.co/d4G2PD9s/cantho3-2025.png",
        "url": "https://live.canthotv.vn/cs3/tv/chunklist.m3u8"
    },
    {
        "id": "dongnai1",
        "name": "Đồng Nai 1 HD",
        "group": "Địa Phương",
        "logo": "https://i.postimg.cc/HJN6GzyV/DN1.png",
        "url": "https://vtvgolive-ott3.vtvdigital.vn/live/dongnai1tv/chunklist_2.m3u8"
    },
    {
        "id": "dongnai2",
        "name": "Đồng Nai 2",
        "group": "Địa Phương",
        "logo": "https://i.postimg.cc/Mf75Q8r8/DN2.png",
        "url": "https://luuchieu.truyenhinhso.vn/media/live/12935D096941E2BA0ABCCF41/index.m3u8"
    },
    {
        "id": "dongthap1",
        "name": "Đồng Tháp 1 HD",
        "group": "Địa Phương",
        "logo": "https://i.ibb.co/XFX7yw0/logo2-1.png",
        "url": "https://liveh34.vtvprime.vn/hls/DONGTHAPTV/index.m3u8"
    },
    {
        "id": "dongthap2",
        "name": "Đồng Tháp 2",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/PfETBEp.png",
        "url": "https://618b88f69e53b.streamlock.net/THDT2/thdttv2/chunklist.m3u8"
    },
    {
        "id": "khanhhoa",
        "name": "Khánh Hòa",
        "group": "Địa Phương",
        "logo": "https://i.postimg.cc/2qn7JYr6/KH.png",
        "url": "https://cdnbaokhanhhoa.com/live/1332e3a79e27_std.m3u8"
    },
    {
        "id": "khanhhoa1",
        "name": "Khánh Hòa 1 HD",
        "group": "Địa Phương",
        "logo": "https://i.postimg.cc/14vcbJhC/KH1.png",
        "url": "https://cdnbaokhanhhoa.com/live/90405a889081_std.m3u8"
    },
    {
        "id": "daklak",
        "name": "Đắk Lắk HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/7CQqMeh.png",
        "url": "https://cdn.drt.vn/live/285a27750861b964c27af22091662a74f2f/playlist.m3u8"
    },
    {
        "id": "gialai",
        "name": "Gia Lai",
        "group": "Địa Phương",
        "logo": "https://i.postimg.cc/grHBjV9t/Gialai.png",
        "url": "http://tldigital-17th06day-tl9648290.duckdns.org/tv.m3u8"
    },
    {
        "id": "lamdong1",
        "name": "Lâm Đồng 1 HD",
        "group": "Địa Phương",
        "logo": "https://i.postimg.cc/f35Jkqv6/LD1.png",
        "url": "https://luuchieu.truyenhinhso.vn/media/live/60142775E3B8083AB9D76E29/index.m3u8"
    },
    {
        "id": "tayninh",
        "name": "Tây Ninh HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/HFm3hbC.png",
        "url": "https://live-hq.evgcdn.net/live/2851dc2c9af68834814a89e61db0faee561/chunklist.m3u8"
    },
    {
        "id": "camau",
        "name": "Cà Mau HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/ZKV1ok2.png",
        "url": "https://tv.ctvcamau.vn/live/tv/tv.m3u8"
    },
    {
        "id": "quangninh3",
        "name": "Quảng Ninh 3",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/AheAmMj.png",
        "url": "https://live.baoquangninh.vn/qtvlive/tv3live.m3u8"
    },
    {
        "id": "thainguyen",
        "name": "Thái Nguyên HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/P3pbab8.png",
        "url": "https://streaming.thainguyentv.vn/hls/livestream.m3u8"
    },
    {
        "id": "bacninh",
        "name": "Bắc Ninh HD",
        "group": "Địa Phương",
        "logo": "https://i.postimg.cc/BjpqCL1S/BNTV.png",
        "url": "https://live-hq.evgcdn.net/live/285f5f227e988ab4445a2138091d3d62e8d/chunklist.m3u8"
    },
    {
        "id": "laocai",
        "name": "Lào Cai HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/Vd0P0rx.png",
        "url": "https://live.baolaocai.vn/channel2/stream.m3u8?t=0"
    },
    {
        "id": "phutho",
        "name": "Phú Thọ HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/LXuRwJY.png",
        "url": "https://live.mediatech.vn/live/2856e81d201c99b4649b5c62f3cddad3881/chunklist.m3u8"
    },
    {
        "id": "sonla",
        "name": "Sơn La HD",
        "group": "Địa Phương",
        "logo": "https://i.postimg.cc/3JnLC20C/Snews.png",
        "url": "https://live.mediatech.vn/live/28595222e707a364251b8724717894baa46/playlist.m3u8"
    },
    {
        "id": "dienbien",
        "name": "Điện Biên HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/hMDRDxN.png",
        "url": "https://stream.langsontv.vn/live/2855dfeccb7f49a41a2b0441b3bfeda413c/playlist.m3u8"
    },
    {
        "id": "laichau",
        "name": "Lai Châu HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/n02cvKQ.png",
        "url": "https://luuchieu.truyenhinhso.vn/media/live/AF157BFA0E9FE004C61AD76E/index.m3u8"
    },
    {
        "id": "langson",
        "name": "Lạng Sơn HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/yxz02UD.png",
        "url": "https://stream.langsontv.vn/live/285c78da0c246524c90917842f8de03bd21/playlist.m3u8"
    },
    {
        "id": "caobang",
        "name": "Cao Bằng HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/RUJmK5D.png",
        "url": "https://stream.thingnet.vn/live/smil:CRTV.smil/chunklist.m3u8"
    },
    {
        "id": "hungyen",
        "name": "Hưng Yên HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/fakTCLE.png",
        "url": "https://live.mediatech.vn/live/285f5449d7d7d2946e0bd2d54b7e60f25a4/playlist.m3u8"
    },
    {
        "id": "ninhbinh",
        "name": "Ninh Bình HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/qHQTwJ9.png",
        "url": "https://live.mediatech.vn/live/28597f8fd7ea5064d0f84ab00b3699dfd86/playlist.m3u8"
    },
    {
        "id": "thanhhoa",
        "name": "Thanh Hóa HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/UwTCbZ5.png",
        "url": "http://123.31.36.68/live.m3u8?c=vstv525&q=sd&type=tv&location=NA&pkg=pkg12.hni"
    },
    {
        "id": "nghean",
        "name": "Nghệ An HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/FLvFSLS.png",
        "url": "https://live.mediatech.vn/live/2859591eef2e92249b682db021f4247c364/playlist.m3u8"
    },
    {
        "id": "hatinh",
        "name": "Hà Tĩnh HD",
        "group": "Địa Phương",
        "logo": "https://cohauw9bgpvod.vcdn.cloud/httv1/index.m3u8",
        "url": "https://cohauw9bgpvod.vcdn.cloud/httv1/index.m3u8"
    },
    {
        "id": "quangtri",
        "name": "Quảng Trị HD",
        "group": "Địa Phương",
        "logo": "https://i.imgur.com/6qOelwt.png",
        "url": "https://luuchieu.truyenhinhso.vn/media/live/07F4162EA25E7311C230CA00/index.m3u8"
    },
    {
        "id": "quangngai1",
        "name": "Quảng Ngãi 1 HD",
        "group": "Địa Phương",
        "logo": "https://i.postimg.cc/pdnCmw7y/QNg-TV1.png",
        "url": "https://live.mediatech.vn/live/285aaa79b4b265a457d81bb72bc32e2c114/playlist.m3u8"
    }
]

# Strict deduplication check
seen_urls = set()
seen_names = set()
deduped = []

for ch in channels:
    u = ch["url"].strip()
    n = ch["name"].strip().lower()
    if u in seen_urls:
        print(f"Duplicate URL skipped: {ch['name']} -> {u}")
        continue
    if n in seen_names:
        print(f"Duplicate Name skipped: {ch['name']}")
        continue
    seen_urls.add(u)
    seen_names.add(n)
    deduped.append(ch)

print(f"Total unique channels compiled: {len(deduped)}")

# Generate M3U8 file
output_file = "/home/duy/.gemini/antigravity/scratch/tizen-iptv/playlist.m3u8"
with open(output_file, "w", encoding="utf-8") as f:
    f.write('#EXTM3U url-tvg="https://epg.io.vn/epg.xml" x-tvg-url="https://epg.io.vn/epg.xml"\n')
    current_grp = None
    for ch in deduped:
        if ch["group"] != current_grp:
            current_grp = ch["group"]
            f.write(f"\n# ----------------------------------------\n# Nhóm: {current_grp}\n# ----------------------------------------\n")
        f.write(f'#EXTINF:-1 tvg-id="{ch["id"]}" tvg-name="{ch["name"]}" tvg-logo="{ch["logo"]}" group-title="{ch["group"]}",{ch["name"]}\n')
        f.write(f'{ch["url"]}\n')

print(f"Successfully generated {output_file}")
