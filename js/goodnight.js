/* ═══════════════════════════════════════════════════════
   goodnight.js — Nút bấm chúc ngủ ngon dịu êm
   ═══════════════════════════════════════════════════════ */

const Goodnight = (() => {
    const nightMessages = [
        'Hôm nay bạn đã vất vả nhiều rồi. Hãy gác lại hết những âu lo, thở một hơi thật sâu và chìm vào giấc ngủ thật êm đềm nhé. Ngày mai sẽ là một ngày mới tràn ngập điều tốt lành đang chờ bạn!',
        'Đêm đã khuya rồi, mắt bạn cũng mỏi rồi đúng không? Tắt màn hình, kéo chăn lên và thả lỏng toàn thân nào. Chúc bạn có những giấc mơ êm như mây trời nhé!',
        'Dù hôm nay có chuyện gì xảy ra đi nữa, bạn cũng đã vượt qua một cách xuất sắc rồi. Hãy tự hào về bản thân và cho phép mình ngủ một giấc thật sâu nhé. Chúc bạn ngủ ngon!',
        'Gửi đến bạn một chút bình yên và một cái ôm ấm áp từ phương xa. Mong mọi muộn phiền tan biến, chỉ còn lại sự an lành bên bạn đêm nay.',
        'Nhắm mắt lại nào bạn ơi. Hãy để những vì sao ngoài cửa sổ trông chừng giấc ngủ cho bạn. Tôi chúc bạn một đêm bình yên tuyệt đối, mai thức dậy với nụ cười trên môi!'
    ];

    let currentMsgIndex = 0;

    function openModal() {
        const modal = document.getElementById('modal-night');
        if (!modal) return;
        renderMessage();
        modal.hidden = false;
        createFireflies();
    }

    function closeModal() {
        const modal = document.getElementById('modal-night');
        if (modal) modal.hidden = true;
    }

    function nextMessage() {
        currentMsgIndex = (currentMsgIndex + 1) % nightMessages.length;
        renderMessage();
    }

    function renderMessage() {
        const msgEl = document.getElementById('night-message');
        if (msgEl) {
            msgEl.style.opacity = 0;
            setTimeout(() => {
                msgEl.textContent = nightMessages[currentMsgIndex];
                msgEl.style.opacity = 1;
            }, 200);
        }
    }

    // Hiệu ứng đom đóm lấp lánh khi mở thiệp ngủ ngon
    function createFireflies() {
        const dialog = document.querySelector('.modal__dialog--night');
        if (!dialog) return;

        for (let i = 0; i < 8; i++) {
            const star = document.createElement('span');
            star.textContent = ['✨', '⭐', '🌟'][Math.floor(Math.random() * 3)];
            star.style.position = 'absolute';
            star.style.left = `${Math.random() * 90 + 5}%`;
            star.style.top = `${Math.random() * 80 + 10}%`;
            star.style.fontSize = `${Math.random() * 0.8 + 0.8}rem`;
            star.style.pointerEvents = 'none';
            star.style.opacity = '0';
            star.style.transition = 'all 1.5s ease-in-out';
            dialog.appendChild(star);

            setTimeout(() => {
                star.style.opacity = '0.9';
                star.style.transform = `translateY(-15px) scale(1.2)`;
            }, 50);

            setTimeout(() => {
                star.style.opacity = '0';
                setTimeout(() => star.remove(), 1000);
            }, 1800);
        }
    }

    function init() {
        // Nút mở modal từ Header và Card chính
        document.getElementById('btn-header-night')?.addEventListener('click', openModal);
        document.getElementById('btn-open-night')?.addEventListener('click', openModal);
        document.getElementById('card-trigger-night')?.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') openModal();
        });

        // Nút trong modal
        document.getElementById('btn-close-night')?.addEventListener('click', closeModal);
        document.getElementById('night-backdrop')?.addEventListener('click', closeModal);
        document.getElementById('btn-sleep-tight')?.addEventListener('click', closeModal);
        document.getElementById('btn-another-night-msg')?.addEventListener('click', nextMessage);
    }

    return { init, openModal };
})();
