/* ═══════════════════════════════════════════════════════
   friendship-coupons.js — Tập Phiếu Quà Tặng "Bạn & Tôi"
   Các phiếu đặc quyền ngọt ngào có thể bấm dùng & lưu trữ
   ═══════════════════════════════════════════════════════ */

const FriendshipCoupons = (() => {
    const STORAGE_KEY = 'cozy_friendship_coupons_v1';

    const DEFAULT_COUPONS = [
        {
            id: 'coupon-1',
            icon: '🎫',
            title: 'Phiếu Miễn Trừ Giận Dỗi 24h',
            desc: 'Áp dụng khi có chút hiểu lầm hoặc dỗi hờn, bên kia phải tự động làm hòa và tha thứ vô điều kiện!',
            color: 'orange'
        },
        {
            id: 'coupon-2',
            icon: '🧋',
            title: 'Phiếu Một Ly Trà Sữa Full Topping',
            desc: 'Được quyền yêu cầu một ly trà sữa ngọt ngào bất cứ khi nào bạn thấy thèm hoặc mệt mỏi.',
            color: 'pink'
        },
        {
            id: 'coupon-3',
            icon: '👂',
            title: 'Phiếu Lắng Nghe Tâm Sự Thâu Đêm',
            desc: 'Một buổi tối chỉ để lắng nghe bạn trải lòng, tuyệt đối không ngắt lời, chỉ có sự vỗ về và thấu hiểu.',
            color: 'purple'
        },
        {
            id: 'coupon-4',
            icon: '🍕',
            title: 'Phiếu Đi Ăn Món Bạn Thích Nhất',
            desc: 'Hôm nay bạn là người quyết định thực đơn: dù là lẩu, nướng hay món vỉa hè yêu thích!',
            color: 'amber'
        },
        {
            id: 'coupon-5',
            icon: '💆',
            title: 'Phiếu Xoa Đầu & Đấm Lưng Thư Giãn',
            desc: 'Khi bạn mỏi vai vì ngồi máy tính cả ngày, phiếu này sẽ mang đến sự chăm sóc êm ái nhất.',
            color: 'green'
        },
        {
            id: 'coupon-6',
            icon: '🎁',
            title: 'Phiếu Ước Gì Được Nấy (Đặc Biệt)',
            desc: 'Tấm vé vạn năng dành riêng cho bạn — thực hiện một yêu cầu bất kỳ trong khả năng của tôi!',
            color: 'blue'
        }
    ];

    function getData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}

        const initial = {};
        DEFAULT_COUPONS.forEach(c => {
            initial[c.id] = { used: false, usedAt: null };
        });
        return initial;
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    // Âm thanh đóng dấu vui tai bằng Web Audio
    function playStampSound() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(240, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.13);
        } catch (e) {}
    }

    function toggleCoupon(id) {
        const data = getData();
        const item = data[id] || { used: false, usedAt: null };

        item.used = !item.used;
        item.usedAt = item.used ? new Date().toLocaleDateString('vi-VN') : null;
        data[id] = item;
        saveData(data);

        playStampSound();
        render();
    }

    function render() {
        const container = document.getElementById('coupons-grid');
        if (!container) return;

        const data = getData();
        let usedCount = 0;

        container.innerHTML = '';

        DEFAULT_COUPONS.forEach(coupon => {
            const state = data[coupon.id] || { used: false, usedAt: null };
            if (state.used) usedCount++;

            const card = document.createElement('div');
            card.className = `coupon-card coupon--${coupon.color} ${state.used ? 'is-used' : ''}`;
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `${coupon.title}, trạng thái: ${state.used ? 'Đã sử dụng' : 'Chưa sử dụng'}`);

            card.innerHTML = `
                <div class="coupon-left-deco"></div>
                <div class="coupon-content">
                    <div class="coupon-header">
                        <span class="coupon-icon">${coupon.icon}</span>
                        <h3 class="coupon-title">${coupon.title}</h3>
                    </div>
                    <p class="coupon-desc">${coupon.desc}</p>
                    <div class="coupon-footer">
                        <span class="coupon-badge">${state.used ? `Đã dùng ngày: ${state.usedAt}` : 'Chạm để sử dụng 👆'}</span>
                    </div>
                </div>
                <div class="coupon-stamp" aria-hidden="true">ĐÃ DÙNG</div>
            `;

            card.addEventListener('click', () => toggleCoupon(coupon.id));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCoupon(coupon.id);
                }
            });

            container.appendChild(card);
        });

        const countEl = document.getElementById('coupons-stat-count');
        if (countEl) {
            countEl.textContent = `${DEFAULT_COUPONS.length - usedCount} / ${DEFAULT_COUPONS.length} phiếu còn hạn`;
        }
    }

    function init() {
        render();

        document.getElementById('btn-reset-coupons')?.addEventListener('click', () => {
            const initial = {};
            DEFAULT_COUPONS.forEach(c => {
                initial[c.id] = { used: false, usedAt: null };
            });
            saveData(initial);
            render();
        });
    }

    return { init, toggleCoupon };
})();
