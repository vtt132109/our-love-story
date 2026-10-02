/* ═══════════════════════════════════════════════════════
   friendship-coupons.js — Vòng Quay & Ví Phiếu Tình Yêu "Bạn & Tôi"
   Quay vòng quay để trúng phiếu tình yêu và cất vào ví sử dụng
   ═══════════════════════════════════════════════════════ */

const FriendshipCoupons = (() => {
    const STORAGE_KEY = 'cozy_love_coupons_wallet_v2';

    const VOUCHER_POOL = [
        {
            id: 'kiss',
            icon: '💋',
            title: 'Phiếu Nụ Hôn Ngọt Ngào',
            desc: 'Một nụ hôn ấm áp và dịu dàng nhất từ tôi gửi đến bạn, bất cứ lúc nào bạn muốn.',
            color: '#f43f5e'
        },
        {
            id: 'hug',
            icon: '🫂',
            title: 'Phiếu Cái Ôm Siết Thật Chặt',
            desc: 'Một cái ôm siết thật chặt và ấm áp, xua tan mọi âu lo và mỏi mệt trong lòng bạn.',
            color: '#ec4899'
        },
        {
            id: 'forgive',
            icon: '🎫',
            title: 'Phiếu Miễn Trừ Giận Dỗi 24h',
            desc: 'Dù có chuyện gì, tôi hứa sẽ chủ động làm hòa, xin lỗi và ôm bạn vào lòng vô điều kiện.',
            color: '#fb923c'
        },
        {
            id: 'milktea',
            icon: '🧋',
            title: 'Phiếu Trà Sữa Tình Yêu',
            desc: 'Một ly trà sữa full topping đúng vị bạn thích, tôi sẽ mua và mang đến tận tay bạn!',
            color: '#f59e0b'
        },
        {
            id: 'dinner',
            icon: '🍕',
            title: 'Phiếu Đi Ăn Món Bạn Thích',
            desc: 'Hôm nay bạn là người quyết định thực đơn, tôi sẽ đưa bạn đi ăn bất cứ món gì bạn thèm!',
            color: '#10b981'
        },
        {
            id: 'massage',
            icon: '💆',
            title: 'Phiếu Xoa Đầu & Đấm Lưng',
            desc: 'Tôi sẽ xoa đầu, bóp vai và chăm sóc bạn thật chu đáo để bạn được thả lỏng hoàn toàn.',
            color: '#06b6d4'
        },
        {
            id: 'listen',
            icon: '👂',
            title: 'Phiếu Lắng Nghe Thâu Đêm',
            desc: 'Một buổi tối tôi chỉ ngồi nghe bạn tâm sự, vỗ về và thấu hiểu mọi nỗi niềm của bạn.',
            color: '#8b5cf6'
        },
        {
            id: 'wish',
            icon: '🎁',
            title: 'Phiếu Ước Gì Được Nấy',
            desc: 'Tấm vé vạn năng dành riêng cho bạn — bất kể bạn ước điều gì, tôi cũng sẽ cố hết sức vì bạn!',
            color: '#d946ef'
        }
    ];

    let canvas, ctx;
    let angle = 0;
    let isSpinning = false;

    function getWalletData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}

        // Mặc định tặng sẵn 2 phiếu đầu tiên khi mới vào trang
        return [
            { id: 'hug', count: 1, used: 0, lastWon: new Date().toLocaleDateString('vi-VN') },
            { id: 'forgive', count: 1, used: 0, lastWon: new Date().toLocaleDateString('vi-VN') }
        ];
    }

    function saveWalletData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    // Âm thanh chúc mừng / trúng thưởng bằng Web Audio
    function playWinSound() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const actx = new AudioContextClass();
            const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
            notes.forEach((freq, idx) => {
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, actx.currentTime + idx * 0.08);
                gain.gain.setValueAtTime(0.2, actx.currentTime + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + idx * 0.08 + 0.25);

                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(actx.currentTime + idx * 0.08);
                osc.stop(actx.currentTime + idx * 0.08 + 0.26);
            });
        } catch (e) {}
    }

    // Âm thanh đóng dấu phiếu
    function playStampSound() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const actx = new AudioContextClass();
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(260, actx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(70, actx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.3, actx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(actx.destination);
            osc.start();
            osc.stop(actx.currentTime + 0.13);
        } catch (e) {}
    }

    // ─── 1. VẼ VÒNG QUAY VOUCHER ───
    function drawWheel() {
        if (!canvas) {
            canvas = document.getElementById('voucher-wheel-canvas');
            if (!canvas) return;
            ctx = canvas.getContext('2d');
        }

        const total = VOUCHER_POOL.length;
        const arc = (Math.PI * 2) / total;
        const radius = canvas.width / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(angle);

        for (let i = 0; i < total; i++) {
            const startAngle = i * arc;
            const endAngle = startAngle + arc;
            const v = VOUCHER_POOL[i];

            // Slice
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius - 4, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = v.color;
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            // Text & Icon
            ctx.save();
            ctx.rotate(startAngle + arc / 2);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11.5px Quicksand, sans-serif';
            ctx.textAlign = 'right';
            ctx.shadowColor = 'rgba(0,0,0,0.35)';
            ctx.shadowBlur = 4;
            ctx.fillText(`${v.icon} ${v.title}`, radius - 16, 4);
            ctx.restore();
        }

        // Tâm vòng quay trái tim
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💖', 0, 1);

        ctx.restore();
    }

    // ─── 2. QUAY VÒNG QUAY NHẬN PHIẾU ───
    function spin() {
        if (isSpinning) return;
        isSpinning = true;

        const btn = document.getElementById('btn-spin-voucher');
        if (btn) btn.disabled = true;

        const total = VOUCHER_POOL.length;
        const arc = (Math.PI * 2) / total;
        const targetIndex = Math.floor(Math.random() * total);

        const currentBase = ((angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
        const fullRounds = 5 + Math.random() * 3;
        // Mục tiêu căn tại đỉnh 12h: góc kim là -π/2
        const targetNormalized = ((Math.PI * 2 * 10 - targetIndex * arc - arc / 2 - Math.PI / 2) % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);
        const forwardDelta = (targetNormalized - currentBase + Math.PI * 2) % (Math.PI * 2);
        const totalRotation = fullRounds * Math.PI * 2 + forwardDelta;

        const startAngle = angle;
        const duration = 3800;
        const startTime = performance.now();

        function animate(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            angle = startAngle + totalRotation * eased;

            drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isSpinning = false;
                if (btn) btn.disabled = false;

                const wonVoucher = VOUCHER_POOL[targetIndex];
                addVoucherToWallet(wonVoucher);
                playWinSound();
                showWinModal(wonVoucher);
            }
        }

        requestAnimationFrame(animate);
    }

    function addVoucherToWallet(voucher) {
        const wallet = getWalletData();
        const existing = wallet.find(item => item.id === voucher.id);

        if (existing) {
            existing.count += 1;
            existing.lastWon = new Date().toLocaleDateString('vi-VN');
        } else {
            wallet.unshift({
                id: voucher.id,
                count: 1,
                used: 0,
                lastWon: new Date().toLocaleDateString('vi-VN')
            });
        }

        saveWalletData(wallet);
        renderWallet();
    }

    function useVoucher(id) {
        const wallet = getWalletData();
        const item = wallet.find(w => w.id === id);
        if (!item) return;

        if (item.count > item.used) {
            item.used += 1;
            item.lastUsed = new Date().toLocaleDateString('vi-VN');
            saveWalletData(wallet);
            playStampSound();
            renderWallet();
        }
    }

    function showWinModal(voucher) {
        const resultBox = document.getElementById('voucher-result-banner');
        if (resultBox) {
            resultBox.innerHTML = `
                <div class="voucher-win-pill">
                    <span class="win-icon">${voucher.icon}</span>
                    <div class="win-text-box">
                        <strong>Chúc mừng bạn yêu! Bạn vừa quay trúng:</strong>
                        <span class="win-title">${voucher.title}</span>
                        <p class="win-note">${voucher.desc} (Phiếu đã được cất vào Ví Tình Yêu của bạn bên dưới nè! 💕)</p>
                    </div>
                </div>
            `;
            resultBox.hidden = false;
        }

        // Bắn hiệu ứng tim bay
        for (let i = 0; i < 10; i++) {
            const heart = document.createElement('span');
            heart.textContent = ['💖', '💕', '✨', '🌸'][Math.floor(Math.random() * 4)];
            heart.style.position = 'fixed';
            heart.style.left = `${50 + (Math.random() * 30 - 15)}%`;
            heart.style.top = '45%';
            heart.style.fontSize = '1.8rem';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '9999';
            heart.style.transition = 'all 1.1s cubic-bezier(0.16, 1, 0.3, 1)';
            document.body.appendChild(heart);

            setTimeout(() => {
                heart.style.transform = `translate(${(Math.random() - 0.5) * 160}px, -110px) scale(1.4)`;
                heart.style.opacity = '0';
            }, 20);

            setTimeout(() => heart.remove(), 1200);
        }
    }

    // ─── 3. VÍ PHIẾU TÌNH YÊU (WALLET RENDER) ───
    function renderWallet() {
        const container = document.getElementById('coupons-grid');
        const statCount = document.getElementById('coupons-stat-count');
        if (!container) return;

        const wallet = getWalletData();
        container.innerHTML = '';

        let totalAvailable = 0;
        let totalCoupons = 0;

        wallet.forEach(item => {
            const v = VOUCHER_POOL.find(p => p.id === item.id);
            if (!v) return;

            const remaining = item.count - item.used;
            totalAvailable += remaining;
            totalCoupons += item.count;

            const isAllUsed = remaining <= 0;

            const card = document.createElement('div');
            card.className = `coupon-card ${isAllUsed ? 'is-used' : ''}`;
            card.style.borderColor = v.color;
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `${v.title}, còn ${remaining} lượt dùng`);

            card.innerHTML = `
                <div class="coupon-left-deco" style="background: ${v.color}"></div>
                <div class="coupon-content">
                    <div class="coupon-header">
                        <span class="coupon-icon">${v.icon}</span>
                        <div>
                            <h3 class="coupon-title">${v.title}</h3>
                            <span class="coupon-quantity-tag">Sở hữu: x${item.count} (Còn ${remaining} lần dùng)</span>
                        </div>
                    </div>
                    <p class="coupon-desc">${v.desc}</p>
                    <div class="coupon-footer">
                        ${!isAllUsed 
                            ? `<button class="btn-use-coupon" type="button">Dùng 1 phiếu ngay 💕</button>`
                            : `<span class="coupon-badge-used">Đã dùng hết vào ngày: ${item.lastUsed || item.lastWon}</span>`
                        }
                    </div>
                </div>
                <div class="coupon-stamp" aria-hidden="true">${isAllUsed ? 'ĐÃ DÙNG HẾT' : 'ĐÃ DÙNG 1 LẦN'}</div>
            `;

            if (!isAllUsed) {
                const useBtn = card.querySelector('.btn-use-coupon');
                useBtn?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    useVoucher(v.id);
                });

                card.addEventListener('click', () => useVoucher(v.id));
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        useVoucher(v.id);
                    }
                });
            }

            container.appendChild(card);
        });

        if (statCount) {
            statCount.textContent = `Bạn đang có ${totalAvailable} phiếu khả dụng trong ví`;
        }
    }

    function init() {
        drawWheel();
        renderWallet();

        document.getElementById('btn-spin-voucher')?.addEventListener('click', spin);

        document.getElementById('btn-reset-coupons')?.addEventListener('click', () => {
            const initial = [
                { id: 'hug', count: 1, used: 0, lastWon: new Date().toLocaleDateString('vi-VN') },
                { id: 'forgive', count: 1, used: 0, lastWon: new Date().toLocaleDateString('vi-VN') }
            ];
            saveWalletData(initial);
            renderWallet();
        });
    }

    return { init, spin, drawWheel };
})();
