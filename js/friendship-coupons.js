/* ═══════════════════════════════════════════════════════
   friendship-coupons.js — Vòng Quay & Ví Phiếu Tình Yêu "Bạn & Tôi"
   - Mỗi 3 ngày nhận được 1 lượt quay miễn phí
   - Đã gỡ bỏ nút reset phiếu để bảo toàn ví của bạn gái
   - Mở rộng kho voucher đa dạng, lãng mạn & hỗ trợ Admin airdrop
   ═══════════════════════════════════════════════════════ */

const FriendshipCoupons = (() => {
    const STORAGE_KEY = 'cozy_love_coupons_wallet_v2';
    const LAST_SPIN_KEY = 'cozy_wheel_last_spin_time';
    const BONUS_SPINS_KEY = 'cozy_wheel_bonus_spins';
    const CUSTOM_POOL_KEY = 'cozy_custom_vouchers_pool';

    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

    // Kho Voucher Tình Yêu 16 loại ngọt ngào & ấm áp
    const DEFAULT_VOUCHER_POOL = [
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
        },
        {
            id: 'scooter_ride',
            icon: '🛵',
            title: 'Phiếu Đèo Đi Hóng Gió Đêm',
            desc: 'Cùng bạn lượn phố đêm, hít hà từng cơn gió mát lành và nghe bạn líu lo trò chuyện.',
            color: '#0284c7'
        },
        {
            id: 'photoshoot',
            icon: '📸',
            title: 'Phiếu Phó Nháy Sống Ảo 100 Tấm',
            desc: 'Kiên nhẫn chụp ảnh cho bạn đến khi nào chọn được tấm ưng ý đăng Facebook/Instagram mới thôi!',
            color: '#db2777'
        },
        {
            id: 'cook',
            icon: '🍳',
            title: 'Phiếu Nấu Món Bạn Thích Ăn',
            desc: 'Tự tay vào bếp chuẩn bị bữa ăn ấm nóng thơm lừng dành riêng cho người tôi yêu thương.',
            color: '#ea580c'
        },
        {
            id: 'movie',
            icon: '🍿',
            title: 'Phiếu Xem Phim Chiếu Rạp Tự Chọn',
            desc: 'Bạn chọn phim và bắp rang bơ, tôi lo mua vé và nắm chặt tay bạn suốt cả buổi xem.',
            color: '#7c3aed'
        },
        {
            id: 'sleep_in',
            icon: '🛌',
            title: 'Phiếu Ngủ Nướng Ngày Chủ Nhật',
            desc: 'Một ngày lười biếng trọn vẹn, cùng nhau ngủ nướng không báo thức và không một chút âu lo.',
            color: '#4f46e5'
        },
        {
            id: 'unconditional_peace',
            icon: '🕊️',
            title: 'Phiếu Làm Hòa Tức Thì',
            desc: 'Bất kể ai đúng ai sai, tôi sẽ lập tức xin lỗi, dỗ dành và làm hòa với bạn ngay không cãi lời.',
            color: '#0d9488'
        },
        {
            id: 'secret_gift',
            icon: '✨',
            title: 'Phiếu Món Quà Bất Ngờ',
            desc: 'Một món quà nhỏ xinh xắn được gửi bất ngờ đến bạn để thắp sáng một ngày thật vui.',
            color: '#ca8a04'
        },
        {
            id: 'sweet_treat',
            icon: '🍰',
            title: 'Phiếu Bánh Ngọt Tráng Miệng',
            desc: 'Một phần bánh ngọt ngào tan chảy như tình yêu tôi dành cho người tôi thương nhất trần đời.',
            color: '#e11d48'
        }
    ];

    function getVoucherPool() {
        try {
            const raw = localStorage.getItem(CUSTOM_POOL_KEY);
            if (raw) {
                const custom = JSON.parse(raw);
                if (Array.isArray(custom) && custom.length > 0) {
                    return [...DEFAULT_VOUCHER_POOL, ...custom];
                }
            }
        } catch (e) {}
        return DEFAULT_VOUCHER_POOL;
    }

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

    // Quản lý lượt quay 3 ngày 1 lần & Bonus Spins từ Admin
    function getBonusSpins() {
        try {
            const val = parseInt(localStorage.getItem(BONUS_SPINS_KEY) || '0', 10);
            return isNaN(val) ? 0 : val;
        } catch {
            return 0;
        }
    }

    function setBonusSpins(count) {
        try {
            localStorage.setItem(BONUS_SPINS_KEY, Math.max(0, count).toString());
        } catch {}
    }

    function getLastSpinTime() {
        try {
            const val = parseInt(localStorage.getItem(LAST_SPIN_KEY) || '0', 10);
            return isNaN(val) ? 0 : val;
        } catch {
            return 0;
        }
    }

    function setLastSpinTime(timestamp) {
        try {
            localStorage.setItem(LAST_SPIN_KEY, timestamp.toString());
        } catch {}
    }

    function getSpinStatus() {
        const bonus = getBonusSpins();
        if (bonus > 0) {
            return {
                canSpin: true,
                bonusSpins: bonus,
                remainingMs: 0,
                statusText: `Bạn có ${bonus} lượt quay đặc biệt! 🎁`
            };
        }

        const last = getLastSpinTime();
        if (!last) {
            // Lần đầu vào trang: được 1 lượt quay miễn phí
            return {
                canSpin: true,
                bonusSpins: 0,
                remainingMs: 0,
                statusText: 'Bạn có 1 lượt quay miễn phí đầu tiên! ✨'
            };
        }

        const elapsed = Date.now() - last;
        const remainingMs = THREE_DAYS_MS - elapsed;

        if (remainingMs <= 0) {
            return {
                canSpin: true,
                bonusSpins: 0,
                remainingMs: 0,
                statusText: 'Đã đến kỳ quay mới! Bạn có 1 lượt quay miễn phí 🎡'
            };
        }

        const hoursTotal = Math.ceil(remainingMs / (1000 * 60 * 60));
        const days = Math.floor(hoursTotal / 24);
        const hours = hoursTotal % 24;

        let timeStr = '';
        if (days > 0) {
            timeStr = `${days} ngày ${hours} giờ`;
        } else {
            const mins = Math.ceil(remainingMs / (1000 * 60));
            timeStr = `${mins} phút`;
        }

        return {
            canSpin: false,
            bonusSpins: 0,
            remainingMs: remainingMs,
            statusText: `Lượt quay kế tiếp sau: ${timeStr} ⏳`
        };
    }

    function updateSpinButtonUI() {
        const btn = document.getElementById('btn-spin-voucher');
        if (!btn) return;

        const status = getSpinStatus();
        let indicator = document.getElementById('spin-cooldown-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'spin-cooldown-indicator';
            indicator.className = 'spin-cooldown-indicator';
            btn.parentNode?.insertBefore(indicator, btn.nextSibling);
        }

        if (status.canSpin) {
            btn.disabled = false;
            btn.classList.remove('btn-spin-disabled');
            indicator.innerHTML = `<span class="badge-spin-ready">✨ ${status.statusText}</span>`;
        } else {
            btn.disabled = true;
            btn.classList.add('btn-spin-disabled');
            indicator.innerHTML = `<span class="badge-spin-wait">🔒 Mỗi 3 ngày được 1 lượt quay — ${status.statusText}</span>`;
        }
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

        const pool = getVoucherPool();
        const total = pool.length;
        const arc = (Math.PI * 2) / total;
        const radius = canvas.width / 2;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(radius, radius);
        ctx.rotate(angle);

        for (let i = 0; i < total; i++) {
            const startAngle = i * arc;
            const endAngle = startAngle + arc;
            const v = pool[i];

            // Slice
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius - 4, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = v.color || '#fb923c';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();

            // Text & Icon
            ctx.save();
            ctx.rotate(startAngle + arc / 2);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px Quicksand, sans-serif';
            ctx.textAlign = 'right';
            ctx.shadowColor = 'rgba(0,0,0,0.35)';
            ctx.shadowBlur = 3;

            // Rút gọn chữ nếu dài
            const displayTitle = v.title.replace('Phiếu ', '');
            ctx.fillText(`${v.icon} ${displayTitle}`, radius - 12, 3);
            ctx.restore();
        }

        // Tâm vòng quay trái tim
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
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

    // ─── 2. QUAY VÒNG QUAY NHẬN PHIẾU (3 NGÀY 1 LẦN) ───
    function spin() {
        if (isSpinning) return;

        const status = getSpinStatus();
        if (!status.canSpin) {
            alert(`Người yêu ơi, vòng quay đang trong thời gian nghỉ ngơi nha! ${status.statusText} 💕`);
            return;
        }

        isSpinning = true;
        const btn = document.getElementById('btn-spin-voucher');
        if (btn) btn.disabled = true;

        const pool = getVoucherPool();
        const total = pool.length;
        const arc = (Math.PI * 2) / total;
        const targetIndex = Math.floor(Math.random() * total);

        const currentBase = ((angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
        const fullRounds = 5 + Math.random() * 3;
        // Mục tiêu căn tại đỉnh 12h: kim là -π/2
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

                // Tiêu thụ lượt quay
                const bonus = getBonusSpins();
                if (bonus > 0) {
                    setBonusSpins(bonus - 1);
                } else {
                    setLastSpinTime(Date.now());
                }

                updateSpinButtonUI();

                const wonVoucher = pool[targetIndex];
                addVoucherToWallet(wonVoucher);
                playWinSound();
                showWinModal(wonVoucher);
            }
        }

        requestAnimationFrame(animate);
    }

    function addVoucherToWallet(voucher, customCount = 1) {
        const wallet = getWalletData();
        const existing = wallet.find(item => item.id === voucher.id);

        if (existing) {
            existing.count += customCount;
            existing.lastWon = new Date().toLocaleDateString('vi-VN');
        } else {
            wallet.unshift({
                id: voucher.id,
                count: customCount,
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
                        <p class="win-note">${voucher.desc} (Phiếu đã được cất an toàn vào Ví Tình Yêu bên dưới nè! 💕)</p>
                    </div>
                </div>
            `;
            resultBox.hidden = false;
        }

        // Bắn hiệu ứng tim bay
        for (let i = 0; i < 10; i++) {
            const heart = document.createElement('span');
            heart.textContent = ['💖', '💕', '✨', '🌸', '🎁'][Math.floor(Math.random() * 5)];
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
        const pool = getVoucherPool();
        container.innerHTML = '';

        let totalAvailable = 0;
        let totalCoupons = 0;

        wallet.forEach(item => {
            const v = pool.find(p => p.id === item.id) || {
                id: item.id,
                icon: '🎁',
                title: 'Phiếu Tình Yêu Đặc Biệt',
                desc: 'Phiếu quà tặng riêng do người yêu gửi đến bạn.',
                color: '#ec4899'
            };

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
        updateSpinButtonUI();

        document.getElementById('btn-spin-voucher')?.addEventListener('click', spin);

        // Cập nhật trạng thái đếm ngược thời gian quay định kỳ mỗi 30s
        setInterval(updateSpinButtonUI, 30000);
    }

    return { 
        init, 
        spin, 
        drawWheel, 
        renderWallet, 
        getWalletData, 
        saveWalletData, 
        getVoucherPool, 
        addVoucherToWallet, 
        getBonusSpins, 
        setBonusSpins, 
        getLastSpinTime, 
        setLastSpinTime, 
        updateSpinButtonUI 
    };
})();

window.FriendshipCoupons = FriendshipCoupons;

