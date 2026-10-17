# 📺 Tizen IPTV Player for Samsung Smart TV

Ứng dụng xem truyền hình IPTV miễn phí chuyên biệt cho **Samsung Smart TV (Tizen OS)** và trình duyệt Web.

![TizenIPTV](icon.png)

## ✨ Tính năng nổi bật

- 🇻🇳 **91 Kênh truyền hình tiếng Việt chọn lọc**: Tích hợp sẵn luồng phát HLS (`.m3u8`) HTTP/HTTPS ổn định, 100% có logo sắc nét và chia nhóm khoa học:
  - **VTV (12 kênh)**: VTV1 - VTV9, VTV5 Tây Nam Bộ, VTV5 Tây Nguyên, VTV Cần Thơ (VTV10).
  - **Kênh Thiết Yếu (2 kênh)**: ANTV HD (Truyền hình CAND), QPVN HD (Truyền hình Quân Đội).
  - **HTV & HTVC (13 kênh)**: HTV1, HTV2, HTV3, HTV4, HTV7, HTV9, HTV Thể Thao, HTVC Thuần Việt, Phim, Gia Đình, Phụ Nữ, Du Lịch, HTVC+.
  - **THVL (4 kênh)**: Vĩnh Long 1, 2, 3, 4.
  - **SCTV (18 kênh)**: SCTV2, SCTV3, SCTV4, SCTV 4K, SCTV6, SCTV7, SCTV9, SCTV11, SCTV12, SCTV13, SCTV14, SCTV15, SCTV16, SCTV17, SCTV18, SCTV19, SCTV20, SCTV22.
  - **Phim & Giải Trí (7 kênh)**: ON Movies, ON Vie Drama, ON Kids, ON Life, TVB Tiếng Việt, Asian Food Network VN, Outdoor Channel VN.
  - **Địa Phương (35 kênh)**: Hà Nội 1, Đà Nẵng 1-2, Hải Phòng, Cần Thơ, Đồng Nai, Đồng Tháp, Khánh Hòa, Đắk Lắk, Gia Lai, Lâm Đồng, Tây Ninh, Cà Mau, v.v.
- 🎨 **Giao diện Glassmorphism 2.0 hiện đại**: Hiệu ứng kính mờ, thẻ kênh nổi bật, thanh tiến trình tự động ẩn khi đang xem phim.
- 🎮 **Tương thích hoàn hảo Remote TV Samsung**:
  - `Lên` / `Xuống`: Chọn kênh trong danh sách.
  - `Trái` / `Phải`: Mở bảng nhóm danh mục kênh / Đóng bảng.
  - `OK` (Enter): Phát kênh được chọn.
  - `CH+` / `CH-`: Chuyển kênh kế tiếp / kênh trước.
  - `Vàng` (Yellow): Đánh dấu kênh yêu thích.
  - `Đỏ` (Red): Làm mới danh sách phát.
  - `Xanh dương` (Blue): Quản lý & thêm playlist M3U/M3U8.
  - `Back`: Quay lại hoặc đóng menu.
- 🚀 **Zero-Setup**: Mở app lần đầu tự động nạp danh sách 91 kênh mặc định và phát ngay VTV1 HD.

## 🛠️ Cấu trúc thư mục

```text
├── config.xml             # Tizen Widget configuration
├── index.html             # Main Web application view
├── icon.png               # Yellow Retro TV app icon (512x512)
├── playlist.m3u8          # Default curated Vietnamese IPTV playlist
├── css/
│   └── style.css          # Glassmorphism 2.0 styles & TV focus UI
├── js/
│   ├── app.js             # Application controller & state machine
│   ├── player.js          # Video engine (HTML5 + Hls.js fallback)
│   ├── remote.js          # Samsung Tizen / Web keyboard remote handler
│   ├── storage.js         # LocalStorage persistence layer
│   ├── ui.js              # UI rendering & DOM bindings
│   └── m3u-parser.js      # M3U/M3U8 parser with auto-normalization
├── lib/
│   └── hls.min.js         # HLS.js video streaming library
└── TizenIPTV.wgt          # Packaged Tizen Widget
```

## 🚀 Hướng dẫn sử dụng

### 1. Xem qua Trình duyệt Web (Mọi thiết bị)
Khởi động máy chủ tĩnh:
```bash
python3 -m http.server 8080
```
Mở trình duyệt trên máy tính, điện thoại hoặc trình duyệt web của Samsung Smart TV và truy cập `http://<IP_MAY_TINH>:8080`.

### 2. Cài đặt trực tiếp lên Samsung Smart TV (Tizen OS)
Yêu cầu: Bật Developer Mode trên TV và cài đặt bằng công cụ `sdb` hoặc `TizenAppInstallerCli`:
```bash
sdb connect <TV_IP>:26101
sdb install TizenIPTV.wgt
```
