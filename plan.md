# 🌸 Kế Hoạch Trang Web "Khu Vườn Nhỏ Của Bạn & Tôi" (Cozy Mini-Games & Flower Garden)

> **Phong cách:** Đơn giản, ấm áp, chữa lành (Cozy & Wholesome), xưng hô thân mật **"Bạn - Tôi"**.

---

## 🌻 1. Các Tính Năng Cốt Lõi

### 1.1. Bình Hoa Tình Bạn / Mỗi Ngày Nở 1 Bông Hoa 💐
- **Mô tả:** Khi mới vào trang web, bạn sẽ thấy 1 bông hoa đầu tiên xinh xắn trong chậu/bình hoa.
- **Cơ chế điểm danh (Daily Streak):**
  - Lưu trữ ngày truy cập trong `localStorage`.
  - Mỗi ngày mới bạn quay lại trang web, bình hoa sẽ tự động **nở thêm 1 bông hoa mới** với đủ loại sắc màu (Hoa cúc, tulip, hướng dương, hoa hồng, cẩm tú cầu...).
  - Hiển thị số ngày bạn đã đồng hành cùng tôi (`"Bạn đã ghé thăm tôi X ngày rồi đó!"`).
  - Bạn có thể chạm vào từng bông hoa để đọc lời nhắn gửi dễ thương.

### 1.2. Nút Bấm "Chúc Ngủ Ngon" 🌙
- **Mô tả:** Một nút bấm đặc biệt dành cho buổi tối.
- **Trải nghiệm:**
  - Bấm vào: Màn hình chuyển dần sang nền trời đêm êm dịu, vầng trăng khuyết và đàn đom đóm lấp lánh nhẹ nhàng.
  - Hiện ra một tấm thiệp chúc ngủ ngon ấm áp, lời dặn dò bạn hãy buông hết âu lo trong ngày để ngủ thật ngon.
  - Có thể chọn các lời chúc ngủ ngon khác nhau hoặc bật tiếng mưa rơi/nhạc êm dịu.

### 1.3. Nút Bấm "Lời Khuyên Vui Vẻ / Nạp Năng Lượng" ☀️
- **Mô tả:** Chiếc nút bấm hồi máu tinh thần mỗi khi bạn thấy mệt mỏi hay cần một nụ cười.
- **Trải nghiệm:**
  - Bấm vào là rút ngẫu nhiên một lời khuyên dí dỏm, một câu động viên tích cực từ tôi gửi đến bạn (Ví dụ: *"Hôm nay bạn nhớ uống đủ nước nhé, đừng để bản thân bị héo như cái cây!"*, *"Nếu mệt quá thì đi ăn gì ngon đi, mọi chuyện để mai tính!"*).
  - Đi kèm hiệu ứng tung hoa giấy tươi sáng.

### 1.4. Góc Trò Chơi Mini-Games Vui Vẻ 🎮
1. **Hái Hoa Rơi (Falling Petals Catch):** Trò chơi di chuyển giỏ hứng những cánh hoa may mắn rơi từ trên trời xuống, tính điểm vui nhộn.
2. **Lật Thẻ Tìm Cặp (Memory Match):** Trò chơi lật các thẻ bài hoa cỏ, đồ ăn đáng yêu để tìm đôi trùng khớp.
3. **Vòng Quay Niềm Vui Nhỏ (Wheel of Joy):** Quay thưởng những điều tích cực nhỏ bé trong ngày (Ví dụ: *"Uống một ly trà sữa"*, *"Xem một bộ phim hài"*, *"Đi dạo 15 phút"*...).

---

## 🎨 2. Giao Diện & Tông Màu
- **Màu sắc:** Pastel ấm áp (Hồng cam đào `#fed7aa`, Vàng kem `#fef3c7`, Xanh lá xô thơm `#bbf7d0`, Tím oải hương `#e9d5ff`).
- **Font chữ:** Dễ thương, tròn trịa, thân thiện (*Quicksand* & *Dancing Script*).
- **Cách xưng hô:** Tuyệt đối dùng **"Bạn"** và **"Tôi"** trong tất cả lời nhắn, nút bấm và tiêu đề.

---

## ⚡ 3. Đã Hoàn Thành Tối Ưu UI/UX & Hiệu Năng (60FPS & WCAG AA)
- [x] **Khắc phục lỗi Tương Phản (Hỏng):** Toàn bộ nút chính `.btn-primary`, `.btn-action--sun`, `.flower-day-tag`, và điểm số đã được nâng cấp độ tương phản vượt tiêu chuẩn WCAG AA ($\ge 5.2:1$).
- [x] **Chuẩn hóa Design System (Lệch Hệ):** Gom toàn bộ mã màu con về hệ biến CSS `:root`, chuẩn hóa thang bo góc 3 bậc (`10px`, `16px`, `24px`).
- [x] **Khắc phục triệt để hiện tượng giật lag:**
  - Loại bỏ hoàn toàn `ctx.filter = 'blur(6px)'` vốn gây nghẽn CPU rasterizer 1500 lần/giây.
  - Áp dụng kỹ thuật **Pre-rendered Bokeh Sprite Texture Blitting** trên Canvas, chạy mượt mà 60FPS với mức tiêu thụ CPU $\approx 0\%$.
  - Tích hợp **Page Visibility API** tạm dừng render nền khi người dùng ẩn tab.
  - Chuyển đổi `transition: all` sang phần cứng compositor GPU chuyên dụng (`transform`, `opacity`, `box-shadow`).
- [x] **Trợ năng (Accessibility - a11y):** Bổ sung đầy đủ phím Tab, Enter/Space và viền focus ring `:focus-visible` cho các thẻ hoa và trò chơi lật bài.
- [x] **Chế độ Tối (Dark Mode Toggle):**
  - Tích hợp nút chuyển đổi giao diện Sáng / Tối (`#btn-theme-toggle`) trên thanh điều hướng header (`🌙 Tối` $\leftrightarrow$ `☀️ Sáng`).
  - Hệ màu ban đêm Sapphire/Indigo huyền diệu, tương phản cao, bảo vệ mắt.
  - Tự động lưu lựa chọn của người dùng vào `localStorage` (`cozy_theme_preference`) và đồng bộ theo cài đặt hệ điều hành (`prefers-color-scheme`).
  - Hạt bokeh nền canvas tự động chuyển đổi sang ánh sao đêm lấp lánh khi bật chế độ tối.

---

## 🌟 4. Các Tính Năng Mới Bổ Sung (Vừa Hoàn Thành)
- [x] **Hộp Âm Thanh Bình Yên (Web Audio API Synthesizer):**
  - Tổng hợp 4 âm thanh thư giãn tự nhiên trực tiếp trên trình duyệt (Mưa rào dịu êm 🌧️, Lò sưởi ấm áp 🪵, Sóng biển rì rào 🌊, Đêm hè thanh bình 🌙).
  - Không tốn băng thông, không phụ thuộc file MP3 ngoài, có thanh chỉnh âm lượng trực quan.
- [x] **Chậu Cây Thần Kỳ (Tamagotchi Mini-Plant):**
  - Trải nghiệm nuôi dưỡng mầm cây tình bạn: Tưới nước 💧, Tắm nắng ☀️, Khen ngợi 💖.
  - Tích lũy điểm kinh nghiệm để lớn dần qua 4 giai đoạn (*Hạt mầm $\rightarrow$ Mầm non $\rightarrow$ Chồi hoa $\rightarrow$ Cây hoa đại thụ nở rực rỡ*).
- [x] **Nhật Ký Cảm Xúc Mỗi Ngày (Daily Mood Tracker):**
  - Lắng nghe và vỗ về tâm trạng hôm nay (*Rất vui, Hơi mệt, An yên, Cần cái ôm, Đầy năng lượng*).
  - Gửi gắm những lời nhắn chữa lành riêng biệt và lưu lịch sử cảm xúc 7 ngày gần nhất.
- [x] **Tập Phiếu Quà Tặng "Bạn & Tôi" (Friendship Coupons):**
  - 6 tấm vé đặc quyền ngọt ngào (Miễn trừ giận dỗi, Trà sữa full topping, Lắng nghe thâu đêm, Đi ăn món thích nhất, Xoa đầu thư giãn, Ước gì được nấy).
  - Hiệu ứng đóng dấu "ĐÃ DÙNG" đỏ chót kèm âm thanh sống động và lưu trạng thái vào `localStorage`.
- [x] **Vệt Chuột Nở Hoa & Lấp Lánh (Interactive Petal & Sparkle Trail):**
  - Tự động sinh vệt cánh hoa anh đào và ánh sao li ti khi di chuột hoặc lướt cảm ứng, đạt chuẩn 60FPS không giật lag.

---

## 💖 5. Đợt Nâng Cấp Tình Yêu & Bảng Điều Khiển Admin (Mới Hoàn Thành)
- [x] **Cố định 5 bông hoa cho 5 ngày đầu tiên & gỡ nút thử nghiệm:**
  - Khởi tạo mặc định 5 bông hoa đang khoe sắc trong bình kèm thông điệp riêng cho từng ngày.
  - Tự động nâng cấp dữ liệu người dùng nếu đang có ít hơn 5 hoa.
  - Loại bỏ hoàn toàn nút demo `#btn-demo-next-day`, đưa nút "Tưới hoa hôm nay 💧" về vị trí trang nhã trung tâm.
- [x] **Đếm ngày hẹn hò bắt đầu từ 14/08:**
  - Đồng hồ thời gian thực (ticker) cập nhật từng giây: `X ngày : Y giờ : Z phút : S giây` kèm hiệu ứng nhịp đập trái tim (*pulsing heartbeat*).
- [x] **Hẹn ngày sinh nhật bạn gái (14/10) & Chế độ sinh nhật đặc biệt:**
  - Đếm ngược chính xác từng ngày, giờ, phút, giây đến 14/10.
  - Kích hoạt chế độ sinh nhật bùng nổ: pháo hoa giấy (*confetti*), bóng bay lơ lửng, popup thiệp chúc mừng sinh nhật ngọt ngào.
- [x] **Nâng cấp Vòng Quay & Ví Phiếu Tình Yêu:**
  - Bỏ nút reset phiếu để bảo toàn ví của bạn gái.
  - Mở rộng kho voucher lên 16 loại phong phú, lãng mạn.
  - Áp dụng cơ chế **3 ngày được quay 1 lần (Rate Limiting)** có hiển thị trạng thái và thời gian chờ cụ thể.
- [x] **Trang Quản Trị Bí Mật Của Tris (`admin.html`) & Lá Thư Sinh Nhật Khóa Hẹn Giờ:**
  - Bảo mật bằng mã PIN 4 số (Mặc định `1408`).
  - Quản lý danh sách câu khuyên yêu thương (thêm/sửa/xóa).
  - Quản lý lời chúc ngủ ngon ban đêm (thêm/sửa/xóa).
  - Bơm/Airdrop voucher trực tiếp vào ví của bạn gái bất kỳ lúc nào.
  - Thưởng thêm lượt quay vòng quay hoặc mở khóa quay ngay lập tức.
  - Tùy chỉnh ngày bắt đầu hẹn hò (14/8/2026 - hiện đếm chính xác 52 ngày yêu) và ngày sinh nhật (14/10).
  - **Khu vực soạn thảo lá thư chúc mừng sinh nhật bí mật:**
    - Cho phép Tris nhập đầy đủ: Lời mở đầu / Người nhận (`To`), Tiêu đề thiệp, Nội dung tâm thư (hỗ trợ xuống dòng nhiều đoạn), và Chữ ký kết thư (`Sign`).
    - **Cơ chế khóa hẹn giờ nghiêm ngặt:** Trên trang người yêu hoàn toàn ẩn bức thư (không có bất kỳ nút xem trước nào).
    - **Đúng 00:00:00 ngày 14/10**, hệ thống tự động bung mở toàn màn hình bức thư cùng hiệu ứng pháo hoa rực rỡ!
    - Trang Admin cung cấp bản xem thử (`admin-modal-letter`) dành riêng cho Tris kiểm tra trước độ hoàn mỹ của lá thư.


