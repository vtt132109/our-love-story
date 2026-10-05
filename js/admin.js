/* ═══════════════════════════════════════════════════════
   ADMIN.JS — Xử lý logic bảng điều khiển quản trị tình yêu của Tris
   ═══════════════════════════════════════════════════════ */

(() => {
    const PIN_STORAGE_KEY = 'cozy_admin_pin_code';
    const SESSION_KEY = 'cozy_admin_session_auth';
    const DEFAULT_PIN = '1408'; // Mặc định là ngày 14/08

    // Keys lưu trữ của hệ thống
    const CHEER_KEY = 'cozy_admin_cheer_advices';
    const NIGHT_KEY = 'cozy_admin_night_messages';
    const WALLET_KEY = 'cozy_love_coupons_wallet_v2';
    const BONUS_SPINS_KEY = 'cozy_wheel_bonus_spins';
    const LAST_SPIN_KEY = 'cozy_wheel_last_spin_time';
    const CUSTOM_POOL_KEY = 'cozy_custom_vouchers_pool';
    const ANNIVERSARY_KEY = 'cozy_love_anniversary_config';
    const GARDEN_KEY = 'cozy_flower_garden_v1';

    // ─── 1. XÁC THỰC MÃ PIN BẢO MẬT ───
    function getStoredPin() {
        return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
    }

    function checkAuth() {
        return sessionStorage.getItem(SESSION_KEY) === 'authenticated';
    }

    function showAdminApp() {
        const pinScreen = document.getElementById('pin-screen');
        const adminApp = document.getElementById('admin-app');
        if (pinScreen) pinScreen.style.display = 'none';
        if (adminApp) adminApp.style.display = 'block';

        initDashboard();
    }

    function showPinScreen() {
        const pinScreen = document.getElementById('pin-screen');
        const adminApp = document.getElementById('admin-app');
        if (pinScreen) pinScreen.style.display = 'flex';
        if (adminApp) adminApp.style.display = 'none';
    }

    function initPinAuth() {
        if (checkAuth()) {
            showAdminApp();
            return;
        }

        showPinScreen();

        const digits = document.querySelectorAll('.pin-digit');
        const submitBtn = document.getElementById('btn-pin-submit');
        const errorMsg = document.getElementById('pin-error-msg');

        digits.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < digits.length - 1) {
                    digits[index + 1].focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    digits[index - 1].focus();
                }
                if (e.key === 'Enter') {
                    verifyPin();
                }
            });
        });

        submitBtn?.addEventListener('click', verifyPin);

        function verifyPin() {
            let entered = '';
            digits.forEach(d => entered += d.value);

            if (entered === getStoredPin()) {
                sessionStorage.setItem(SESSION_KEY, 'authenticated');
                if (errorMsg) errorMsg.textContent = '';
                showAdminApp();
            } else {
                if (errorMsg) errorMsg.textContent = 'Mã PIN chưa chính xác! Gợi ý: Ngày kỷ niệm 14/08';
                digits.forEach(d => {
                    d.value = '';
                    d.style.borderColor = '#ef4444';
                    setTimeout(() => d.style.borderColor = '', 1000);
                });
                digits[0]?.focus();
            }
        }
    }

    function showToast(message) {
        let toast = document.getElementById('adm-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'adm-toast';
            toast.className = 'adm-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span>✨</span><span>${message}</span>`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ─── 2. QUẢN LÝ TABS ───
    function initTabs() {
        const tabs = document.querySelectorAll('.adm-tab');
        const panels = document.querySelectorAll('.adm-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                tab.classList.add('active');
                const target = tab.getAttribute('data-target');
                document.getElementById(target)?.classList.add('active');
            });
        });

        // Nút Đăng xuất
        document.getElementById('btn-logout')?.addEventListener('click', () => {
            sessionStorage.removeItem(SESSION_KEY);
            location.reload();
        });

        // Nút Đổi PIN
        document.getElementById('btn-change-pin')?.addEventListener('click', () => {
            const currentPin = prompt('Nhập mã PIN hiện tại của bạn:');
            if (currentPin !== getStoredPin()) {
                alert('Mã PIN hiện tại không đúng!');
                return;
            }
            const newPin = prompt('Nhập mã PIN mới (4 chữ số):');
            if (newPin && newPin.length === 4) {
                localStorage.setItem(PIN_STORAGE_KEY, newPin);
                showToast('Đã đổi mã PIN thành công!');
            } else {
                alert('Mã PIN phải gồm đúng 4 chữ số!');
            }
        });
    }

    // ─── 3. QUẢN LÝ LỜI KHUYÊN YÊU THƯƠNG (CHEER UP) ───
    const DEFAULT_CHEERS = [
        'Nếu hôm nay có điều gì làm bạn phiền lòng, bạn cứ tựa vào vai tôi mà thở phào nhé. Dù thế nào đi nữa, tôi vẫn luôn ở đây yêu thương và chở che cho bạn!',
        'Lời dặn của tôi dành cho người yêu: Đừng để bản thân héo úa nha bạn! Hãy uống ngay một ly nước mát, ăn một món bạn thích, tôi xót bạn lắm đấy!',
        'Bạn không cần phải gồng mình hoàn hảo đâu. Trong mắt tôi, bạn đã là người tuyệt vời và đáng yêu nhất rồi. Cứ tự tin là chính mình nhé, có tôi thương bạn!',
        'Nếu thấy mệt quá thì lại đây tôi ôm một cái nào! Một cái ôm ấm áp và một ly trà sữa ngọt ngào sẽ nạp đầy năng lượng cho người tôi yêu!',
        'Đừng bận tâm những lời phán xét ngoài kia. Trong thế giới của hai đứa mình, bạn là bông hoa rực rỡ và quý giá nhất đời tôi!',
        'Gặp chuyện khó giải quyết hả bạn yêu? Đừng lo, có tôi cùng bạn chia sẻ mọi điều. Hai đứa mình bên nhau thì không gì là không vượt qua được!',
        'Hôm nay bạn nhớ mỉm cười thật tươi nhé! Nụ cười xinh đẹp của bạn là nguồn sáng lớn nhất sưởi ấm trái tim tôi mỗi ngày đấy!',
        'Mọi chuyện rồi sẽ êm đẹp thôi người thương ơi. Dù ngày nắng hay ngày mưa, tôi mãi mãi là hậu phương vững chắc nhất của bạn!'
    ];

    function getCheers() {
        try {
            const raw = localStorage.getItem(CHEER_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return DEFAULT_CHEERS;
    }

    function saveCheers(list) {
        localStorage.setItem(CHEER_KEY, JSON.stringify(list));
    }

    function renderCheers() {
        const container = document.getElementById('cheer-list-container');
        if (!container) return;

        const list = getCheers();
        container.innerHTML = '';

        list.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'adm-item-card';
            card.innerHTML = `
                <div class="adm-item-left">
                    <span class="adm-item-num">${index + 1}</span>
                    <p class="adm-item-text">${item}</p>
                </div>
                <div class="adm-item-actions">
                    <button class="adm-btn-edit btn-edit-cheer" data-index="${index}" type="button">Sửa ✏️</button>
                    <button class="adm-btn-danger btn-del-cheer" data-index="${index}" type="button">Xóa 🗑️</button>
                </div>
            `;
            container.appendChild(card);
        });

        // Gán sự kiện sửa / xóa
        container.querySelectorAll('.btn-del-cheer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                const current = getCheers();
                if (current.length <= 1) {
                    alert('Bạn cần giữ ít nhất 1 câu khuyên yêu thương!');
                    return;
                }
                if (confirm('Bạn có chắc muốn xóa câu này?')) {
                    current.splice(idx, 1);
                    saveCheers(current);
                    renderCheers();
                    showToast('Đã xóa câu khuyên thành công!');
                }
            });
        });

        container.querySelectorAll('.btn-edit-cheer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                const current = getCheers();
                const newVal = prompt('Chỉnh sửa câu khuyên:', current[idx]);
                if (newVal && newVal.trim()) {
                    current[idx] = newVal.trim();
                    saveCheers(current);
                    renderCheers();
                    showToast('Đã cập nhật câu khuyên!');
                }
            });
        });
    }

    function initCheerManager() {
        renderCheers();

        document.getElementById('btn-add-cheer')?.addEventListener('click', () => {
            const input = document.getElementById('input-new-cheer');
            const val = input?.value?.trim();
            if (!val) {
                alert('Vui lòng nhập nội dung câu khuyên!');
                return;
            }
            const list = getCheers();
            list.unshift(val);
            saveCheers(list);
            input.value = '';
            renderCheers();
            showToast('Đã thêm lời khuyên ngọt ngào mới! 💖');
        });

        document.getElementById('btn-reset-cheer-defaults')?.addEventListener('click', () => {
            if (confirm('Khôi phục danh sách câu khuyên mặc định ban đầu?')) {
                saveCheers(DEFAULT_CHEERS);
                renderCheers();
                showToast('Đã khôi phục câu khuyên mặc định!');
            }
        });
    }

    // ─── 4. QUẢN LÝ LỜI CHÚC NGỦ NGON (GOODNIGHT) ───
    const DEFAULT_NIGHTS = [
        'Hôm nay người thương của tôi đã vất vả nhiều rồi. Hãy gác lại hết âu lo, để tôi ôm bạn vào giấc ngủ thật êm đềm nhé. Trong tim tôi lúc nào cũng chỉ có bạn!',
        'Đêm đã khuya rồi, mắt người yêu tôi cũng mỏi rồi đúng không? Tắt màn hình, kéo chăn ấm lên nào. Chúc bạn có những giấc mơ ngập tràn hoa thơm và hình bóng hai đứa mình nhé!',
        'Dù hôm nay có mệt mỏi thế nào, bạn cũng đã làm rất tuyệt vời rồi. Tôi tự hào về bạn và yêu bạn nhiều lắm. Cho phép mình ngủ một giấc thật sâu trong sự chở che của tôi nhé. Yêu bạn!',
        'Gửi đến người yêu dấu ngàn nụ hôn êm ái và một cái ôm siết thật chặt. Mong mọi muộn phiền tan biến, chỉ còn lại sự ấm áp và bình yên bên bạn đêm nay.',
        'Nhắm mắt lại nào bạn yêu của tôi. Hãy để những vì sao đêm nay thay tôi trông chừng giấc ngủ cho bạn. Tôi chúc bạn ngủ thật ngon, mai thức dậy lại có tôi thương bạn thật nhiều!'
    ];

    function getNights() {
        try {
            const raw = localStorage.getItem(NIGHT_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return DEFAULT_NIGHTS;
    }

    function saveNights(list) {
        localStorage.setItem(NIGHT_KEY, JSON.stringify(list));
    }

    function renderNights() {
        const container = document.getElementById('night-list-container');
        if (!container) return;

        const list = getNights();
        container.innerHTML = '';

        list.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'adm-item-card';
            card.innerHTML = `
                <div class="adm-item-left">
                    <span class="adm-item-num">${index + 1}</span>
                    <p class="adm-item-text">${item}</p>
                </div>
                <div class="adm-item-actions">
                    <button class="adm-btn-edit btn-edit-night" data-index="${index}" type="button">Sửa ✏️</button>
                    <button class="adm-btn-danger btn-del-night" data-index="${index}" type="button">Xóa 🗑️</button>
                </div>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll('.btn-del-night').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                const current = getNights();
                if (current.length <= 1) {
                    alert('Bạn cần giữ ít nhất 1 câu chúc ngủ ngon!');
                    return;
                }
                if (confirm('Bạn có chắc muốn xóa lời chúc này?')) {
                    current.splice(idx, 1);
                    saveNights(current);
                    renderNights();
                    showToast('Đã xóa lời chúc ngủ ngon!');
                }
            });
        });

        container.querySelectorAll('.btn-edit-night').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'), 10);
                const current = getNights();
                const newVal = prompt('Chỉnh sửa lời chúc ngủ ngon:', current[idx]);
                if (newVal && newVal.trim()) {
                    current[idx] = newVal.trim();
                    saveNights(current);
                    renderNights();
                    showToast('Đã cập nhật lời chúc ngủ ngon!');
                }
            });
        });
    }

    function initNightManager() {
        renderNights();

        document.getElementById('btn-add-night')?.addEventListener('click', () => {
            const input = document.getElementById('input-new-night');
            const val = input?.value?.trim();
            if (!val) {
                alert('Vui lòng nhập nội dung lời chúc ngủ ngon!');
                return;
            }
            const list = getNights();
            list.unshift(val);
            saveNights(list);
            input.value = '';
            renderNights();
            showToast('Đã thêm lời chúc ngủ ngon mới! 🌙');
        });

        document.getElementById('btn-reset-night-defaults')?.addEventListener('click', () => {
            if (confirm('Khôi phục danh sách lời chúc ngủ ngon mặc định?')) {
                saveNights(DEFAULT_NIGHTS);
                renderNights();
                showToast('Đã khôi phục chúc ngủ ngon mặc định!');
            }
        });
    }

    // ─── 5. QUẢN LÝ VOUCHER & AIRDROP VÀO VÍ BẠN GÁI ───
    function getAllVouchers() {
        if (window.FriendshipCoupons?.getVoucherPool) {
            return window.FriendshipCoupons.getVoucherPool();
        }
        // Fallback đọc trực tiếp
        try {
            const raw = localStorage.getItem(CUSTOM_POOL_KEY);
            if (raw) return JSON.parse(raw);
        } catch {}
        return [];
    }

    function renderVoucherAirdropOptions() {
        const select = document.getElementById('select-airdrop-voucher');
        if (!select) return;

        const pool = getAllVouchers();
        select.innerHTML = '';

        pool.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.id;
            opt.textContent = `${v.icon} ${v.title}`;
            select.appendChild(opt);
        });
    }

    function updateSpinStatusView() {
        const infoEl = document.getElementById('bonus-spin-count-display');
        const lastSpinEl = document.getElementById('last-spin-time-display');

        const bonus = parseInt(localStorage.getItem(BONUS_SPINS_KEY) || '0', 10);
        if (infoEl) infoEl.textContent = `${bonus} lượt thưởng`;

        const last = parseInt(localStorage.getItem(LAST_SPIN_KEY) || '0', 10);
        if (lastSpinEl) {
            if (!last) {
                lastSpinEl.textContent = 'Chưa quay lần nào (Sẵn sàng quay ngay)';
            } else {
                const dateStr = new Date(last).toLocaleString('vi-VN');
                const diff = Date.now() - last;
                const threeDays = 3 * 24 * 60 * 60 * 1000;
                if (diff >= threeDays) {
                    lastSpinEl.textContent = `${dateStr} (Đã đủ 3 ngày — Sẵn sàng quay ngay)`;
                } else {
                    const hoursLeft = Math.ceil((threeDays - diff) / (1000 * 60 * 60));
                    lastSpinEl.textContent = `${dateStr} (Còn chờ khoảng ${hoursLeft} giờ)`;
                }
            }
        }
    }

    function renderWalletInspection() {
        const container = document.getElementById('admin-wallet-inspection');
        if (!container) return;

        let wallet = [];
        try {
            const raw = localStorage.getItem(WALLET_KEY);
            if (raw) wallet = JSON.parse(raw);
        } catch {}

        const pool = getAllVouchers();
        container.innerHTML = '';

        if (wallet.length === 0) {
            container.innerHTML = '<p class="adm-card-desc">Hiện chưa có phiếu nào trong ví bạn gái.</p>';
            return;
        }

        wallet.forEach(item => {
            const v = pool.find(p => p.id === item.id) || { title: item.id, icon: '🎫', color: '#fb923c' };
            const remaining = item.count - item.used;

            const div = document.createElement('div');
            div.className = 'adm-item-card';
            div.innerHTML = `
                <div class="adm-item-left">
                    <span style="font-size: 1.6rem;">${v.icon}</span>
                    <div>
                        <strong style="color: #fed7aa;">${v.title}</strong>
                        <div style="font-size: 0.85rem; color: #94a3b8;">
                            Tổng nhận: x${item.count} | Đã dùng: ${item.used} | <span style="color: #34d399; font-weight: 700;">Còn lại: ${remaining}</span>
                        </div>
                    </div>
                </div>
                <div class="adm-item-actions">
                    <button class="adm-btn-primary btn-add-more-voucher" data-id="${item.id}" type="button">+1 Phiếu</button>
                </div>
            `;
            container.appendChild(div);
        });

        container.querySelectorAll('.btn-add-more-voucher').forEach(b => {
            b.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                airdropToWallet(id, 1);
            });
        });
    }

    function airdropToWallet(voucherId, count) {
        let wallet = [];
        try {
            const raw = localStorage.getItem(WALLET_KEY);
            if (raw) wallet = JSON.parse(raw);
        } catch {}

        const existing = wallet.find(item => item.id === voucherId);
        if (existing) {
            existing.count += count;
            existing.lastWon = new Date().toLocaleDateString('vi-VN');
        } else {
            wallet.unshift({
                id: voucherId,
                count: count,
                used: 0,
                lastWon: new Date().toLocaleDateString('vi-VN')
            });
        }

        localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
        renderWalletInspection();
        showToast(`Đã gửi tặng x${count} phiếu vào ví bạn gái thành công! 🎁`);
    }

    function initVoucherManager() {
        renderVoucherAirdropOptions();
        updateSpinStatusView();
        renderWalletInspection();

        // Nút Gửi Airdrop Voucher
        document.getElementById('btn-airdrop-submit')?.addEventListener('click', () => {
            const select = document.getElementById('select-airdrop-voucher');
            const qtyInput = document.getElementById('input-airdrop-qty');
            const voucherId = select?.value;
            const qty = parseInt(qtyInput?.value || '1', 10);

            if (!voucherId) {
                alert('Vui lòng chọn loại phiếu cần gửi tặng!');
                return;
            }

            airdropToWallet(voucherId, Math.max(1, qty));
        });

        // Nút Tặng +1 Lượt Quay Miễn Phí
        document.getElementById('btn-add-bonus-spin')?.addEventListener('click', () => {
            const current = parseInt(localStorage.getItem(BONUS_SPINS_KEY) || '0', 10);
            localStorage.setItem(BONUS_SPINS_KEY, (current + 1).toString());
            updateSpinStatusView();
            showToast('Đã thưởng thêm +1 lượt quay vòng quay cho bạn gái! 🎡');
        });

        // Nút Reset Thời Gian Chờ (Cho Phép Quay Ngay)
        document.getElementById('btn-reset-spin-cooldown')?.addEventListener('click', () => {
            localStorage.removeItem(LAST_SPIN_KEY);
            updateSpinStatusView();
            showToast('Đã mở khóa lượt quay ngay lập tức (Bỏ qua 3 ngày chờ)! ⚡');
        });

        // Nút Tạo Thêm Loại Voucher Mới
        document.getElementById('btn-create-voucher')?.addEventListener('click', () => {
            const title = document.getElementById('input-new-voucher-title')?.value?.trim();
            const icon = document.getElementById('input-new-voucher-icon')?.value?.trim() || '🎁';
            const desc = document.getElementById('input-new-voucher-desc')?.value?.trim();
            const color = document.getElementById('input-new-voucher-color')?.value || '#fb923c';

            if (!title || !desc) {
                alert('Vui lòng nhập tên phiếu và mô tả!');
                return;
            }

            const newId = 'custom_' + Date.now();
            const newVoucher = { id: newId, icon, title, desc, color };

            let customPool = [];
            try {
                const raw = localStorage.getItem(CUSTOM_POOL_KEY);
                if (raw) customPool = JSON.parse(raw);
            } catch {}

            customPool.push(newVoucher);
            localStorage.setItem(CUSTOM_POOL_KEY, JSON.stringify(customPool));

            // Reset inputs
            document.getElementById('input-new-voucher-title').value = '';
            document.getElementById('input-new-voucher-desc').value = '';

            renderVoucherAirdropOptions();
            showToast(`Đã tạo loại phiếu "${title}" thành công!`);
        });
    }

    // ─── 6. CÀI ĐẶT LÁ THƯ SINH NHẬT BÍ MẬT & NGÀY KỶ NIỆM ───
    function initAnniversarySettings() {
        let cfg = {
            startDate: '2026-08-14T00:00:00',
            birthdayMonth: 10,
            birthdayDay: 14,
            birthdayTitle: 'Chúc Mừng Sinh Nhật Người Yêu Của Anh! 🎂💖',
            birthdayTo: 'Gửi người yêu thương nhất của anh 💕',
            birthdayMessage: `Hôm nay là ngày 14/10 — ngày tuyệt vời nhất vì đã mang một công chúa ngọt ngào đến bên cuộc đời anh.

Cảm ơn em đã luôn ở đây, cùng anh đi qua bao thăng trầm, thắp sáng thế giới của anh bằng nụ cười dịu dàng của em.

Chúc em tuổi mới luôn rực rỡ, bình an, hạnh phúc và mãi mãi có anh bên cạnh chở che. Anh yêu em nhất trên đời! 💕`,
            birthdaySign: 'Yêu em mãi mãi, Tris 💖'
        };

        try {
            const raw = localStorage.getItem(ANNIVERSARY_KEY);
            if (raw) cfg = { ...cfg, ...JSON.parse(raw) };
        } catch {}

        // Form elements
        const inputStart = document.getElementById('input-anniversary-date');
        const inputBdayMonth = document.getElementById('input-bday-month');
        const inputBdayDay = document.getElementById('input-bday-day');
        const inputBdayTo = document.getElementById('input-bday-to');
        const inputBdayTitle = document.getElementById('input-bday-title');
        const inputBdayMsg = document.getElementById('input-bday-msg');
        const inputBdaySign = document.getElementById('input-bday-sign');
        const datingHint = document.getElementById('dating-duration-hint');
        const countdownText = document.getElementById('admin-bday-countdown');

        if (inputStart) inputStart.value = cfg.startDate.substring(0, 10);
        if (inputBdayMonth) inputBdayMonth.value = cfg.birthdayMonth;
        if (inputBdayDay) inputBdayDay.value = cfg.birthdayDay;
        if (inputBdayTo) inputBdayTo.value = cfg.birthdayTo || 'Gửi người yêu thương nhất của anh 💕';
        if (inputBdayTitle) inputBdayTitle.value = cfg.birthdayTitle || 'Chúc Mừng Sinh Nhật Người Yêu Của Anh! 🎂💖';
        if (inputBdayMsg) inputBdayMsg.value = cfg.birthdayMessage;
        if (inputBdaySign) inputBdaySign.value = cfg.birthdaySign || 'Yêu em mãi mãi, Tris 💖';

        // Tính toán số ngày yêu và đếm ngược theo thời gian thực
        function updateAnniversaryHints() {
            const now = new Date();
            const startVal = inputStart?.value || '2026-08-14';
            const startTime = new Date(`${startVal}T00:00:00`).getTime();
            const diffLove = Math.max(0, now.getTime() - startTime);
            const daysLove = Math.floor(diffLove / (1000 * 60 * 60 * 24));
            if (datingHint) {
                datingHint.textContent = `Bắt đầu từ ${startVal}: Hiện đã đồng hành cùng nhau ${daysLove} ngày yêu ngọt ngào! 💕`;
            }

            // Đếm ngược đến 00:00:00 ngày sinh nhật
            const bMonth = parseInt(inputBdayMonth?.value || '10', 10);
            const bDay = parseInt(inputBdayDay?.value || '14', 10);
            const currentYear = now.getFullYear();
            const bdayStart = new Date(currentYear, bMonth - 1, bDay, 0, 0, 0);
            const bdayEnd = new Date(currentYear, bMonth - 1, bDay, 23, 59, 59, 999);

            if (now.getTime() >= bdayStart.getTime() && now.getTime() <= bdayEnd.getTime()) {
                if (countdownText) countdownText.innerHTML = '<span style="color: #34d399;">🎉 ĐÃ ĐẾN GIỜ! Bức thư đang tự động bung mở pháo hoa trên màn hình của bạn gái!</span>';
            } else {
                let target = bdayStart;
                if (now.getTime() > bdayEnd.getTime()) {
                    target = new Date(currentYear + 1, bMonth - 1, bDay, 0, 0, 0);
                }
                const diffBday = Math.max(0, target.getTime() - now.getTime());
                const d = Math.floor(diffBday / (1000 * 60 * 60 * 24));
                const h = Math.floor((diffBday / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diffBday / (1000 * 60)) % 60);
                const s = Math.floor((diffBday / 1000) % 60);
                if (countdownText) {
                    countdownText.textContent = `${d} ngày ${h} giờ ${m} phút ${s} giây (Mở chính xác lúc 00:00 ngày ${bDay}/${bMonth})`;
                }
            }
        }

        updateAnniversaryHints();
        setInterval(updateAnniversaryHints, 1000);

        inputStart?.addEventListener('change', updateAnniversaryHints);
        inputBdayDay?.addEventListener('input', updateAnniversaryHints);
        inputBdayMonth?.addEventListener('input', updateAnniversaryHints);

        // Lưu thông điệp bức thư sinh nhật
        document.getElementById('btn-save-anniversary')?.addEventListener('click', () => {
            const startVal = inputStart?.value || '2026-08-14';
            const bMonth = parseInt(inputBdayMonth?.value || '10', 10);
            const bDay = parseInt(inputBdayDay?.value || '14', 10);
            const bTo = inputBdayTo?.value?.trim() || 'Gửi người yêu thương nhất của anh 💕';
            const bTitle = inputBdayTitle?.value?.trim() || 'Chúc Mừng Sinh Nhật Người Yêu Của Anh! 🎂💖';
            const bMsg = inputBdayMsg?.value?.trim() || '';
            const bSign = inputBdaySign?.value?.trim() || 'Yêu em mãi mãi, Tris 💖';

            const updatedCfg = {
                startDate: `${startVal}T00:00:00`,
                birthdayMonth: bMonth,
                birthdayDay: bDay,
                birthdayTo: bTo,
                birthdayTitle: bTitle,
                birthdayMessage: bMsg,
                birthdaySign: bSign
            };

            localStorage.setItem(ANNIVERSARY_KEY, JSON.stringify(updatedCfg));
            showToast('Đã lưu thông điệp lá thư chúc mừng sinh nhật thành công! 💌✨');
        });

        // Lưu ngày hẹn hò & sinh nhật
        document.getElementById('btn-save-dates')?.addEventListener('click', () => {
            const startVal = inputStart?.value || '2026-08-14';
            const bMonth = parseInt(inputBdayMonth?.value || '10', 10);
            const bDay = parseInt(inputBdayDay?.value || '14', 10);

            let currentCfg = cfg;
            try {
                const raw = localStorage.getItem(ANNIVERSARY_KEY);
                if (raw) currentCfg = { ...currentCfg, ...JSON.parse(raw) };
            } catch {}

            currentCfg.startDate = `${startVal}T00:00:00`;
            currentCfg.birthdayMonth = bMonth;
            currentCfg.birthdayDay = bDay;

            localStorage.setItem(ANNIVERSARY_KEY, JSON.stringify(currentCfg));
            updateAnniversaryHints();
            showToast('Đã cập nhật ngày kỷ niệm hẹn hò và mốc sinh nhật! ⏱️💖');
        });

        // Modal Xem Thử Lá Thư Riêng Trong Admin (Chỉ Tris xem)
        const previewModal = document.getElementById('admin-modal-letter');
        const previewTo = document.getElementById('adm-preview-to');
        const previewTitle = document.getElementById('adm-preview-title');
        const previewMsg = document.getElementById('adm-preview-msg');
        const previewSign = document.getElementById('adm-preview-sign');

        function openAdminPreview() {
            if (!previewModal) return;
            if (previewTo) previewTo.textContent = inputBdayTo?.value?.trim() || 'Gửi người yêu thương nhất của anh 💕';
            if (previewTitle) previewTitle.textContent = inputBdayTitle?.value?.trim() || 'Chúc Mừng Sinh Nhật Người Yêu Của Anh! 🎂💖';
            if (previewMsg) previewMsg.textContent = inputBdayMsg?.value || '';
            if (previewSign) previewSign.textContent = inputBdaySign?.value?.trim() || 'Yêu em mãi mãi, Tris 💖';

            previewModal.hidden = false;
        }

        function closeAdminPreview() {
            if (previewModal) previewModal.hidden = true;
        }

        document.getElementById('btn-admin-preview-letter')?.addEventListener('click', openAdminPreview);
        document.getElementById('btn-close-admin-preview')?.addEventListener('click', closeAdminPreview);
        document.getElementById('admin-preview-backdrop')?.addEventListener('click', closeAdminPreview);
        document.getElementById('btn-admin-preview-confirm')?.addEventListener('click', closeAdminPreview);
    }

    // ─── 7. QUẢN LÝ BÌNH HOA ───
    function initGardenManager() {
        const countDisplay = document.getElementById('admin-flower-count-display');

        function updateGardenStatus() {
            try {
                const raw = localStorage.getItem(GARDEN_KEY);
                if (raw) {
                    const data = JSON.parse(raw);
                    if (countDisplay) countDisplay.textContent = `${data.count} đóa hoa`;
                    return;
                }
            } catch {}
            if (countDisplay) countDisplay.textContent = '5 đóa hoa (Mặc định)';
        }

        updateGardenStatus();

        document.getElementById('btn-ensure-5-flowers')?.addEventListener('click', () => {
            if (window.FlowerGarden?.getData) {
                const data = window.FlowerGarden.getData();
                if (data.count < 5) data.count = 5;
                window.FlowerGarden.saveData(data);
            }
            updateGardenStatus();
            showToast('Đã đảm bảo bình hoa có đủ 5 đóa hoa rực rỡ! 💐');
        });

        document.getElementById('btn-admin-add-flower')?.addEventListener('click', () => {
            if (window.FlowerGarden?.addDemoDay) {
                window.FlowerGarden.addDemoDay();
                updateGardenStatus();
                showToast('Đã trồng thêm 1 đóa hoa bất ngờ cho bạn gái! 🌸');
            }
        });
    }

    function initDashboard() {
        initTabs();
        initCheerManager();
        initNightManager();
        initVoucherManager();
        initAnniversarySettings();
        initGardenManager();
    }

    // Khởi động khi tải xong DOM
    document.addEventListener('DOMContentLoaded', () => {
        initPinAuth();
    });
})();
