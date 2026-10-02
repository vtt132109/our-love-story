/* ═══════════════════════════════════════════════════════
   flower-garden.js — Bình hoa tích lũy mỗi ngày
   ═══════════════════════════════════════════════════════ */

const FlowerGarden = (() => {
    const STORAGE_KEY = 'cozy_flower_garden_v1';

    // Danh sách các loài hoa và lời nhắn gửi từ Tôi đến Bạn
    const flowerCatalog = [
        {
            name: 'Hoa Hướng Dương 🌻',
            emoji: '🌻',
            message: 'Chào người yêu dấu của tôi! Tôi trồng tặng bạn bông hướng dương này, như tình yêu tôi luôn hướng về một mình bạn — người thắp sáng cả thế giới của tôi!'
        },
        {
            name: 'Hoa Cúc Họa Mi 🌼',
            emoji: '🌼',
            message: 'Hôm nay bạn lại đến bên tôi rồi! Cúc họa mi nhỏ nhắn như tình yêu giản dị mà son sắt tôi dành cho bạn. Chỉ cần có bạn, ngày nào cũng là ngày bình yên.'
        },
        {
            name: 'Hoa Tulip Hồng 🌷',
            emoji: '🌷',
            message: 'Bông tulip hồng ngọt ngào này nhắc bạn rằng: Tôi yêu từng nụ cười, từng ánh mắt dịu dàng của bạn. Bạn là điều ngọt ngào nhất đời tôi.'
        },
        {
            name: 'Hoa Hồng Đỏ 🌹',
            emoji: '🌹',
            message: 'Một bông hồng rực rỡ tượng trưng cho tình yêu nồng nàn tôi trao trọn cho bạn! Trong mắt tôi, bạn là người duy nhất khiến trái tim tôi rung động say đắm.'
        },
        {
            name: 'Hoa Oải Hương 🪻',
            emoji: '🪻',
            message: 'Mùi hương oải hương dịu êm như vòng tay tôi ôm bạn mỗi tối. Dù ngoài kia có sóng gió thế nào, lòng tôi mãi mãi là chốn bình yên che chở cho bạn.'
        },
        {
            name: 'Hoa Anh Đào 🌸',
            emoji: '🌸',
            message: 'Những cánh hoa anh đào mong manh nhưng tình cảm tôi dành cho bạn thì ngàn năm không đổi. Cảm ơn bạn đã yêu tôi và là người yêu tuyệt vời nhất của tôi!'
        },
        {
            name: 'Hoa Cẩm Tú Cầu 🌺',
            emoji: '🌺',
            message: 'Tú cầu tượng trưng cho sự gắn kết vĩnh cửu và lòng biết ơn sâu sắc vì bạn đã bước vào cuộc đời tôi. Tôi yêu bạn nhiều hơn những gì lời nói có thể diễn tả.'
        },
        {
            name: 'Nhành Cỏ Bốn Lá 🍀',
            emoji: '🍀',
            message: 'Gặp được bạn và được bạn yêu chính là điều may mắn lớn nhất cuộc đời tôi! Tôi hứa sẽ luôn nắm chặt tay bạn đi qua mọi thăng trầm.'
        },
        {
            name: 'Hoa Sen Thanh Tịnh 🪷',
            emoji: '🪷',
            message: 'Bông sen thuần khiết như tình yêu trong trẻo mà sâu nặng của hai đứa mình. Dù năm tháng trôi qua, tôi vẫn mãi yêu bạn như thuở ban đầu.'
        },
        {
            name: 'Hoa Chuông Tình Yêu 🔔',
            emoji: '🎐',
            message: 'Bình hoa tình yêu của bạn và tôi đang ngày một rực rỡ rồi! Từng giây phút được yêu bạn là từng khoảnh khắc quý giá nhất đời tôi!'
        }
    ];

    function getData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                // Lần đầu vào trang: tặng ngay 1 bông hoa đầu tiên
                const today = new Date().toDateString();
                const initData = {
                    count: 1,
                    lastVisit: today,
                    history: [
                        {
                            dayIndex: 1,
                            date: new Date().toLocaleDateString('vi-VN'),
                            flower: flowerCatalog[0]
                        }
                    ]
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(initData));
                return initData;
            }
            return JSON.parse(raw);
        } catch {
            return {
                count: 1,
                lastVisit: new Date().toDateString(),
                history: [{ dayIndex: 1, date: new Date().toLocaleDateString('vi-VN'), flower: flowerCatalog[0] }]
            };
        }
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Lỗi lưu trữ hoa:', e);
        }
    }

    function checkDailyBloom() {
        const data = getData();
        const today = new Date().toDateString();

        // Nếu là ngày mới thì nở thêm 1 bông hoa mới
        if (data.lastVisit !== today) {
            data.lastVisit = today;
            data.count += 1;

            const catalogIndex = (data.count - 1) % flowerCatalog.length;
            data.history.push({
                dayIndex: data.count,
                date: new Date().toLocaleDateString('vi-VN'),
                flower: flowerCatalog[catalogIndex]
            });

            saveData(data);
        }
        return data;
    }

    function addDemoDay() {
        const data = getData();
        data.count += 1;
        const catalogIndex = (data.count - 1) % flowerCatalog.length;
        data.history.push({
            dayIndex: data.count,
            date: new Date().toLocaleDateString('vi-VN'),
            flower: flowerCatalog[catalogIndex]
        });
        saveData(data);
        renderGarden();
    }

    function openFlowerModal(item) {
        const modal = document.getElementById('modal-flower');
        if (!modal) return;

        document.getElementById('flower-modal-icon').textContent = item.flower.emoji;
        document.getElementById('flower-modal-title').textContent = `${item.flower.name} (Ngày thứ ${item.dayIndex})`;
        document.getElementById('flower-modal-text').textContent = item.flower.message;

        modal.hidden = false;
    }

    function renderGarden() {
        const data = getData();
        const container = document.getElementById('flower-garden');
        const countEl = document.getElementById('flower-count');
        const streakEl = document.getElementById('streak-text');

        if (countEl) countEl.textContent = data.count;
        if (streakEl) {
            streakEl.textContent = data.count === 1
                ? 'Hôm nay là ngày đầu tiên bạn và tôi bắt đầu cùng nhau vun đắp tình yêu này!'
                : `Hai đứa mình đã yêu nhau và đồng hành được ${data.count} ngày rồi đó! Yêu bạn rất nhiều! 💕`;
        }

        if (!container) return;
        container.innerHTML = '';

        data.history.forEach((item, index) => {
            const flowerEl = document.createElement('div');
            flowerEl.className = 'flower-item';
            flowerEl.setAttribute('role', 'button');
            flowerEl.setAttribute('tabindex', '0');
            flowerEl.setAttribute('aria-label', `${item.flower.name}, bấm để đọc lời nhắn`);
            flowerEl.style.animationDelay = `${index * 0.08}s`;

            flowerEl.innerHTML = `
                <div class="flower-petal">${item.flower.emoji}</div>
                <div class="flower-stem"></div>
                <span class="flower-day-tag">Ngày ${item.dayIndex}</span>
            `;

            flowerEl.addEventListener('click', () => openFlowerModal(item));
            flowerEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openFlowerModal(item);
                }
            });

            container.appendChild(flowerEl);
        });
    }

    function waterAnimation() {
        const container = document.getElementById('flower-garden');
        if (!container) return;

        const flowers = container.querySelectorAll('.flower-petal');
        flowers.forEach(petal => {
            petal.style.transform = 'scale(1.25) rotate(10deg)';
            setTimeout(() => {
                petal.style.transform = 'scale(1) rotate(0deg)';
            }, 400);
        });

        // Tạo hiệu ứng giọt nước bay
        for (let i = 0; i < 10; i++) {
            const drop = document.createElement('span');
            drop.textContent = '💧';
            drop.style.position = 'fixed';
            drop.style.left = `${50 + (Math.random() * 20 - 10)}%`;
            drop.style.top = '40%';
            drop.style.fontSize = '1.5rem';
            drop.style.pointerEvents = 'none';
            drop.style.zIndex = '999';
            drop.style.transition = 'all 1s ease-out';
            document.body.appendChild(drop);

            setTimeout(() => {
                drop.style.transform = `translate(${(Math.random() - 0.5) * 160}px, 120px) scale(0)`;
                drop.style.opacity = '0';
            }, 20);

            setTimeout(() => drop.remove(), 1100);
        }
    }

    function init() {
        checkDailyBloom();
        renderGarden();

        document.getElementById('btn-water-today')?.addEventListener('click', waterAnimation);
        document.getElementById('btn-demo-next-day')?.addEventListener('click', () => {
            addDemoDay();
            waterAnimation();
        });

        // Đóng modal hoa
        const modal = document.getElementById('modal-flower');
        document.getElementById('btn-close-flower')?.addEventListener('click', () => {
            if (modal) modal.hidden = true;
        });
        document.getElementById('btn-close-flower-btn')?.addEventListener('click', () => {
            if (modal) modal.hidden = true;
        });
        document.getElementById('flower-backdrop')?.addEventListener('click', () => {
            if (modal) modal.hidden = true;
        });
    }

    return { init, addDemoDay };
})();
