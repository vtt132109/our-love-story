/* ═══════════════════════════════════════════════════════
   tamagotchi-plant.js — Chậu Cây Thần Kỳ của Bạn & Tôi
   Chăm sóc, tưới nước, tắm nắng và khen ngợi để cây lớn dần
   ═══════════════════════════════════════════════════════ */

const TamagotchiPlant = (() => {
    const STORAGE_KEY = 'cozy_tamagotchi_plant_v1';

    const STAGES = [
        {
            level: 1,
            name: 'Hạt Mầm Tình Yêu',
            emoji: '🌱',
            minExp: 0,
            maxExp: 40,
            desc: 'Một hạt mầm vừa được gieo xuống từ tình yêu của hai đứa mình, đang mong chờ sự chăm sóc ngọt ngào từ bạn!'
        },
        {
            level: 2,
            name: 'Mầm Xanh Nhú Lá',
            emoji: '🌿',
            minExp: 40,
            maxExp: 100,
            desc: 'Mầm tình yêu đã nhú lên những chiếc lá non mơn mởn, khẽ đung đưa đón chào bạn ghé thăm mỗi ngày.'
        },
        {
            level: 3,
            name: 'Nụ Hoa E Ấp',
            emoji: '🌷',
            minExp: 100,
            maxExp: 180,
            desc: 'Một nụ hoa xinh xắn đang chúm chím chờ ngày bung nở rạng rỡ nhất dưới ánh nắng tình yêu của hai đứa mình!'
        },
        {
            level: 4,
            name: 'Cây Tình Yêu Nở Rộ Rực Rỡ',
            emoji: '🌳🌸',
            minExp: 180,
            maxExp: 180,
            desc: 'Tuyệt vời quá! Cây tình yêu của bạn và tôi đã nở hoa sum suê, tỏa ngát hương thơm và là minh chứng cho tình yêu bền chặt của hai đứa mình!'
        }
    ];

    const COMPLIMENTS = [
        'Cây cảm nhận được tình yêu ngọt ngào của bạn và tôi nên vươn cao thêm một chút! ✨',
        'Cây thì thầm: "Hạnh phúc nhất là được lớn lên trong tình yêu của hai bạn!" 💖',
        'Tình yêu dịu dàng bạn dành cho tôi và cho cây chính là phép màu tuyệt vời nhất! 🌸',
        'Chiếc lá khẽ đung đưa như đang mỉm cười chúc cho tình yêu của hai đứa mình mãi nồng nàn! 🍃'
    ];

    function getData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}

        return {
            exp: 15,
            water: 50,
            sun: 50,
            love: 50,
            totalInteractions: 0
        };
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    function getCurrentStage(exp) {
        for (let i = STAGES.length - 1; i >= 0; i--) {
            if (exp >= STAGES[i].minExp) return STAGES[i];
        }
        return STAGES[0];
    }

    function render() {
        const data = getData();
        const stage = getCurrentStage(data.exp);

        const iconEl = document.getElementById('plant-avatar');
        const nameEl = document.getElementById('plant-stage-name');
        const descEl = document.getElementById('plant-stage-desc');
        const expFill = document.getElementById('plant-exp-fill');
        const expText = document.getElementById('plant-exp-text');
        const levelBadge = document.getElementById('plant-level-badge');

        if (iconEl) iconEl.textContent = stage.emoji;
        if (nameEl) nameEl.textContent = stage.name;
        if (descEl) descEl.textContent = stage.desc;
        if (levelBadge) levelBadge.textContent = `Cấp ${stage.level}`;

        if (expFill && expText) {
            if (stage.level >= 4) {
                expFill.style.width = '100%';
                expText.textContent = `${data.exp} Điểm (Đạt cấp tối đa 🌟)`;
            } else {
                const stageSpan = stage.maxExp - stage.minExp;
                const currentSpan = data.exp - stage.minExp;
                const pct = Math.min(100, Math.max(0, (currentSpan / stageSpan) * 100));
                expFill.style.width = `${pct}%`;
                expText.textContent = `${data.exp} / ${stage.maxExp} Điểm`;
            }
        }

        // Cập nhật các chỉ số
        const waterVal = document.getElementById('val-water');
        const sunVal = document.getElementById('val-sun');
        const loveVal = document.getElementById('val-love');

        if (waterVal) waterVal.textContent = `${data.water}%`;
        if (sunVal) sunVal.textContent = `${data.sun}%`;
        if (loveVal) loveVal.textContent = `${data.love}%`;
    }

    function popEffect(emoji, targetSelector) {
        const target = document.querySelector(targetSelector) || document.body;
        const rect = target.getBoundingClientRect();

        for (let i = 0; i < 6; i++) {
            const span = document.createElement('span');
            span.textContent = emoji;
            span.className = 'plant-pop-item';
            span.style.left = `${rect.left + rect.width / 2 + (Math.random() * 60 - 30)}px`;
            span.style.top = `${rect.top + (Math.random() * 40 - 20)}px`;
            document.body.appendChild(span);

            setTimeout(() => {
                span.style.transform = `translate(${(Math.random() - 0.5) * 80}px, -70px) scale(1.3)`;
                span.style.opacity = '0';
            }, 20);

            setTimeout(() => span.remove(), 900);
        }

        // Rung nhẹ chậu cây
        const avatar = document.getElementById('plant-avatar');
        if (avatar) {
            avatar.classList.add('plant-bounce');
            setTimeout(() => avatar.classList.remove('plant-bounce'), 500);
        }
    }

    function showPlantMessage(msg) {
        const msgEl = document.getElementById('plant-status-msg');
        if (msgEl) {
            msgEl.textContent = msg;
            msgEl.classList.remove('fade');
            void msgEl.offsetWidth; // Reflow
            msgEl.classList.add('fade');
        }
    }

    function doWater() {
        const data = getData();
        data.water = Math.min(100, data.water + 15);
        data.exp += 8;
        data.totalInteractions += 1;
        saveData(data);
        popEffect('💧', '#plant-avatar');
        showPlantMessage('Bạn đã tưới cho cây một ngụm nước ngọt mát lành! (+8 Exp) 💧');
        render();
    }

    function doSun() {
        const data = getData();
        data.sun = Math.min(100, data.sun + 15);
        data.exp += 8;
        data.totalInteractions += 1;
        saveData(data);
        popEffect('☀️', '#plant-avatar');
        showPlantMessage('Ánh nắng ấm áp đang sưởi ấm từng kẽ lá non! (+8 Exp) ☀️');
        render();
    }

    function doLove() {
        const data = getData();
        data.love = Math.min(100, data.love + 20);
        data.exp += 12;
        data.totalInteractions += 1;
        saveData(data);
        popEffect('💖', '#plant-avatar');
        const randomComp = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
        showPlantMessage(`${randomComp} (+12 Exp)`);
        render();
    }

    function init() {
        render();

        document.getElementById('btn-plant-water')?.addEventListener('click', doWater);
        document.getElementById('btn-plant-sun')?.addEventListener('click', doSun);
        document.getElementById('btn-plant-love')?.addEventListener('click', doLove);
    }

    return { init, doWater, doSun, doLove };
})();
