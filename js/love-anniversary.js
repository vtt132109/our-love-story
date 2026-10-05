/* ═══════════════════════════════════════════════════════
   love-anniversary.js — Đếm ngày yêu (từ 14/8) & Đếm ngược sinh nhật (14/10)
   - Đồng hồ thời gian thực (ticker) cập nhật từng giây
   - Đếm ngược sinh nhật bạn gái 14/10 & Kích hoạt chế độ sinh nhật
   - Tương thích cấu hình tùy chỉnh từ trang Admin
   ═══════════════════════════════════════════════════════ */

const LoveAnniversary = (() => {
    const CONFIG_KEY = 'cozy_love_anniversary_config';

    const DEFAULT_CONFIG = {
        startDate: '2026-08-14T00:00:00', // Ngày bắt đầu hẹn hò 14/8/2026
        birthdayMonth: 10,                 // Tháng 10
        birthdayDay: 14,                   // Ngày 14
        birthdayTitle: 'Chúc Mừng Sinh Nhật Người Yêu Của Anh! 🎂💖',
        birthdayTo: 'Gửi người yêu thương nhất của anh 💕',
        birthdayMessage: `Hôm nay là ngày 14/10 — ngày tuyệt vời nhất vì đã mang một công chúa ngọt ngào đến bên cuộc đời anh.

Cảm ơn em đã luôn ở đây, cùng anh đi qua bao thăng trầm, thắp sáng thế giới của anh bằng nụ cười dịu dàng của em.

Chúc em tuổi mới luôn rực rỡ, bình an, hạnh phúc và mãi mãi có anh bên cạnh chở che. Anh yêu em nhất trên đời! 💕`,
        birthdaySign: 'Yêu em mãi mãi, Tris 💖'
    };

    function getConfig() {
        try {
            const raw = localStorage.getItem(CONFIG_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.startDate && parsed.startDate.includes('2024-08-14')) {
                    parsed.startDate = '2026-08-14T00:00:00';
                    localStorage.setItem(CONFIG_KEY, JSON.stringify(parsed));
                }
                return { ...DEFAULT_CONFIG, ...parsed };
            }
        } catch (e) {}
        return DEFAULT_CONFIG;
    }

    function saveConfig(cfg) {
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
        } catch (e) {}
    }

    // ─── 1. BỘ ĐẾM NGÀY YÊU NHAU (TỪ 14/08) ───
    function updateLoveCounter() {
        const cfg = getConfig();
        const start = new Date(cfg.startDate).getTime();
        const now = Date.now();
        const diff = Math.max(0, now - start);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        const daysEl = document.getElementById('love-days-count');
        const hoursEl = document.getElementById('love-hours-count');
        const minsEl = document.getElementById('love-mins-count');
        const secsEl = document.getElementById('love-secs-count');

        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
        if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
    }

    // ─── 2. ĐẾM NGƯỢC SINH NHẬT BẠN GÁI (CHÍNH XÁC ĐẾN 0H NGÀY 14/10) ───
    function getNextBirthdayDate() {
        const cfg = getConfig();
        const now = new Date();
        const currentYear = now.getFullYear();

        // 00:00:00 ngày 14/10
        const bdayStart = new Date(currentYear, cfg.birthdayMonth - 1, cfg.birthdayDay, 0, 0, 0);
        // 23:59:59.999 ngày 14/10
        const bdayEnd = new Date(currentYear, cfg.birthdayMonth - 1, cfg.birthdayDay, 23, 59, 59, 999);

        // Kiểm tra xem hiện tại đã đến hoặc đang trong ngày 14/10 hay chưa (bắt đầu đúng từ 00:00:00)
        const isTodayBirthday = (now.getTime() >= bdayStart.getTime() && now.getTime() <= bdayEnd.getTime());

        if (isTodayBirthday) {
            return { targetDate: bdayStart, isToday: true };
        }

        if (now.getTime() > bdayEnd.getTime()) {
            // Đã qua 14/10 năm nay, đếm đến 14/10 năm sau
            const bdayNextYear = new Date(currentYear + 1, cfg.birthdayMonth - 1, cfg.birthdayDay, 0, 0, 0);
            return { targetDate: bdayNextYear, isToday: false };
        }

        // Chưa đến 00:00:00 ngày 14/10
        return { targetDate: bdayStart, isToday: false };
    }

    function updateBirthdayCountdown() {
        const { targetDate, isToday } = getNextBirthdayDate();
        const now = Date.now();

        const bannerEl = document.getElementById('bday-active-banner');
        const countdownBox = document.getElementById('bday-countdown-box');
        const daysEl = document.getElementById('bday-days-count');
        const hoursEl = document.getElementById('bday-hours-count');
        const minsEl = document.getElementById('bday-mins-count');
        const secsEl = document.getElementById('bday-secs-count');

        if (isToday) {
            if (bannerEl) bannerEl.hidden = false;
            if (countdownBox) countdownBox.hidden = true;
            return;
        }

        if (bannerEl) bannerEl.hidden = true;
        if (countdownBox) countdownBox.hidden = false;

        const diff = Math.max(0, targetDate.getTime() - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
        if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
    }

    // ─── 3. MODAL BỨC THƯ SINH NHẬT BÍ MẬT & PHÁO HOA ───
    function openBirthdayModal() {
        const modal = document.getElementById('modal-birthday');
        if (!modal) return;

        const cfg = getConfig();
        const titleEl = document.getElementById('bday-modal-title');
        const toEl = document.getElementById('bday-modal-to');
        const msgEl = document.getElementById('bday-modal-message');
        const signEl = document.getElementById('bday-modal-sign');

        if (titleEl) titleEl.textContent = cfg.birthdayTitle || 'Chúc Mừng Sinh Nhật Người Yêu Của Anh! 🎂💖';
        if (toEl) toEl.textContent = cfg.birthdayTo || 'Gửi người yêu thương nhất của anh 💕';
        if (msgEl) msgEl.textContent = cfg.birthdayMessage;
        if (signEl) signEl.textContent = cfg.birthdaySign || 'Yêu em mãi mãi, Tris 💖';

        modal.hidden = false;
        triggerBirthdayConfetti();
    }

    function closeBirthdayModal() {
        const modal = document.getElementById('modal-birthday');
        if (modal) modal.hidden = true;
    }

    function triggerBirthdayConfetti() {
        const emojis = ['🎂', '🎉', '🎁', '🎈', '💖', '✨', '💐', '🍰', '⭐'];
        for (let i = 0; i < 28; i++) {
            const p = document.createElement('span');
            p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            p.style.position = 'fixed';
            p.style.left = `${Math.random() * 90 + 5}%`;
            p.style.top = '-20px';
            p.style.fontSize = `${Math.random() * 1.4 + 1.2}rem`;
            p.style.pointerEvents = 'none';
            p.style.zIndex = '99999';
            p.style.transition = `transform ${Math.random() * 2 + 2}s cubic-bezier(0.25, 1, 0.5, 1), opacity 2.5s ease-out`;
            document.body.appendChild(p);

            const endX = (Math.random() - 0.5) * 200;
            const endY = window.innerHeight + 50;
            const rotate = (Math.random() - 0.5) * 720;

            setTimeout(() => {
                p.style.transform = `translate(${endX}px, ${endY}px) rotate(${rotate}deg)`;
                p.style.opacity = '0.9';
            }, 30);

            setTimeout(() => p.remove(), 4000);
        }
    }

    let isInitialized = false;

    function init() {
        if (isInitialized) return;
        isInitialized = true;

        let hasAutoTriggered = false;

        function tick() {
            updateLoveCounter();
            updateBirthdayCountdown();

            const { isToday } = getNextBirthdayDate();
            // Tự động mở bức thư đúng lúc 00:00:00 ngày 14/10 hoặc khi vừa mở trang vào ngày 14/10
            if (isToday && !hasAutoTriggered) {
                hasAutoTriggered = true;
                setTimeout(openBirthdayModal, 1200);
            }
        }

        tick();
        // Ticker chạy mỗi giây
        setInterval(tick, 1000);

        // Sự kiện mở modal sinh nhật khi bạn gái bấm xem lại vào đúng ngày 14/10
        document.getElementById('btn-open-bday-card')?.addEventListener('click', openBirthdayModal);

        // Đóng modal sinh nhật
        document.getElementById('btn-close-bday')?.addEventListener('click', closeBirthdayModal);
        document.getElementById('bday-backdrop')?.addEventListener('click', closeBirthdayModal);
        document.getElementById('btn-bday-accept')?.addEventListener('click', () => {
            closeBirthdayModal();
            triggerBirthdayConfetti();
        });
    }

    // Tự động kích hoạt ngay khi nạp để cập nhật ngay lập tức các con số
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { 
        init, 
        getConfig, 
        saveConfig, 
        updateLoveCounter, 
        updateBirthdayCountdown, 
        openBirthdayModal, 
        triggerBirthdayConfetti 
    };
})();

window.LoveAnniversary = LoveAnniversary;

