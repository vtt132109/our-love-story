/* ═══════════════════════════════════════════════════════
   cheer-up.js — Lời khuyên vui vẻ & nạp năng lượng
   ═══════════════════════════════════════════════════════ */

const CheerUp = (() => {
    const defaultAdvices = [
        'Nếu hôm nay có điều gì làm bạn phiền lòng, bạn cứ tựa vào vai tôi mà thở phào nhé. Dù thế nào đi nữa, tôi vẫn luôn ở đây yêu thương và chở che cho bạn!',
        'Lời dặn của tôi dành cho người yêu: Đừng để bản thân héo úa nha bạn! Hãy uống ngay một ly nước mát, ăn một món bạn thích, tôi xót bạn lắm đấy!',
        'Bạn không cần phải gồng mình hoàn hảo đâu. Trong mắt tôi, bạn đã là người tuyệt vời và đáng yêu nhất rồi. Cứ tự tin là chính mình nhé, có tôi thương bạn!',
        'Nếu thấy mệt quá thì lại đây tôi ôm một cái nào! Một cái ôm ấm áp và một ly trà sữa ngọt ngào sẽ nạp đầy năng lượng cho người tôi yêu!',
        'Đừng bận tâm những lời phán xét ngoài kia. Trong thế giới của hai đứa mình, bạn là bông hoa rực rỡ và quý giá nhất đời tôi!',
        'Gặp chuyện khó giải quyết hả bạn yêu? Đừng lo, có tôi cùng bạn chia sẻ mọi điều. Hai đứa mình bên nhau thì không gì là không vượt qua được!',
        'Hôm nay bạn nhớ mỉm cười thật tươi nhé! Nụ cười xinh đẹp của bạn là nguồn sáng lớn nhất sưởi ấm trái tim tôi mỗi ngày đấy!',
        'Mọi chuyện rồi sẽ êm đẹp thôi người thương ơi. Dù ngày nắng hay ngày mưa, tôi mãi mãi là hậu phương vững chắc nhất của bạn!'
    ];

    const STORAGE_KEY = 'cozy_admin_cheer_advices';

    function getAdvices() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {}
        return defaultAdvices;
    }

    function setAdvices(list) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {}
    }

    let lastIndex = -1;

    function getRandomAdvice() {
        const cheerAdvices = getAdvices();
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * cheerAdvices.length);
        } while (newIndex === lastIndex && cheerAdvices.length > 1);
        lastIndex = newIndex;
        return cheerAdvices[newIndex];
    }

    function openModal() {
        const modal = document.getElementById('modal-cheer');
        if (!modal) return;
        renderAdvice();
        modal.hidden = false;
        burstJoyParticles();
    }

    function closeModal() {
        const modal = document.getElementById('modal-cheer');
        if (modal) modal.hidden = true;
    }

    function renderAdvice() {
        const msgEl = document.getElementById('cheer-message');
        if (msgEl) {
            msgEl.style.opacity = 0;
            setTimeout(() => {
                msgEl.textContent = getRandomAdvice();
                msgEl.style.opacity = 1;
            }, 150);
        }
    }

    // Hiệu ứng tung hoa tươi vui vẻ khi nhận lời khuyên
    function burstJoyParticles() {
        const dialog = document.querySelector('.modal__dialog--cheer');
        if (!dialog) return;

        const emojis = ['🌻', '✨', '🎉', '🌸', '💖', '🍀', '☀️'];
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('span');
            p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            p.style.position = 'absolute';
            p.style.left = '50%';
            p.style.top = '30%';
            p.style.fontSize = `${Math.random() * 0.8 + 1}rem`;
            p.style.pointerEvents = 'none';
            p.style.zIndex = '10';
            p.style.transition = 'all 1s cubic-bezier(0.25, 1, 0.5, 1)';
            dialog.appendChild(p);

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 140 + 60;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;

            setTimeout(() => {
                p.style.transform = `translate(${x}px, ${y}px) scale(0)`;
                p.style.opacity = '0';
            }, 20);

            setTimeout(() => p.remove(), 1100);
        }
    }

    function init() {
        // Nút mở modal từ Header và Card chính
        document.getElementById('btn-header-cheer')?.addEventListener('click', openModal);
        document.getElementById('btn-open-cheer')?.addEventListener('click', openModal);
        document.getElementById('card-trigger-cheer')?.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') openModal();
        });

        // Nút trong modal
        document.getElementById('btn-close-cheer')?.addEventListener('click', closeModal);
        document.getElementById('cheer-backdrop')?.addEventListener('click', closeModal);
        document.getElementById('btn-more-cheer')?.addEventListener('click', () => {
            renderAdvice();
            burstJoyParticles();
        });
    }

    return { init, openModal, getAdvices, setAdvices, defaultAdvices };
})();

window.CheerUp = CheerUp;
