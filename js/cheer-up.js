/* ═══════════════════════════════════════════════════════
   cheer-up.js — Lời khuyên vui vẻ & nạp năng lượng
   ═══════════════════════════════════════════════════════ */

const CheerUp = (() => {
    const cheerAdvices = [
        'Nếu hôm nay có điều gì làm bạn không vui, bạn cứ thở phào một cái rồi mỉm cười nhé. Mặt trời vẫn mọc, hoa vẫn nở, và tôi luôn ở đây để cổ vũ bạn!',
        'Lời khuyên vàng hôm nay: Đừng để bản thân bị "héo úa" như cái cây thiếu nước! Hãy đứng dậy uống ngay một ly nước mát và vươn vai thư giãn 30 giây nha bạn.',
        'Bạn không cần phải hoàn hảo 100% mọi lúc đâu. Chỉ cần hôm nay bạn đã cố gắng hết sức mình, dù kết quả thế nào thì đối với tôi bạn cũng đã rất tuyệt vời rồi!',
        'Nếu thấy mệt quá thì hãy đi tìm một món gì đó ngọt ngào để ăn đi! Khoa học đã chứng minh đồ ngọt giúp não bộ tiết ra dopamine làm bạn vui hơn đấy!',
        'Đừng so sánh nhịp sống của mình với ai khác cả. Mỗi bông hoa đều có mùa nở rộ của riêng nó, và bạn cũng đang tỏa sáng theo cách rất riêng của bạn!',
        'Gặp chuyện khó giải quyết? Hãy chia nhỏ nó ra như ăn một chiếc bánh pizza vậy — ăn từng miếng nhỏ một, bạn sẽ thấy mọi thứ dễ dàng hơn nhiều.',
        'Hôm nay bạn nhớ mỉm cười thật tươi nhé! Nụ cười của bạn có sức mạnh lan tỏa niềm vui đến cả những người xung quanh và cả tôi nữa đấy!',
        'Cứ bình tĩnh mà sống, việc gì đến sẽ đến, việc gì qua sẽ qua. Mọi chuyện rồi sẽ đâu vào đấy thôi, tôi tin chắc ở bạn!'
    ];

    let lastIndex = -1;

    function getRandomAdvice() {
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

    return { init, openModal };
})();
