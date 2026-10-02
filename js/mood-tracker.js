/* ═══════════════════════════════════════════════════════
   mood-tracker.js — Nhật Ký Cảm Xúc "Bạn & Tôi"
   Lắng nghe, thấu hiểu và gửi gắm những lời vỗ về chạm đúng tâm trạng
   ═══════════════════════════════════════════════════════ */

const MoodTracker = (() => {
    const STORAGE_KEY = 'cozy_mood_tracker_v1';

    const MOOD_DATA = {
        happy: {
            label: 'Rất vui vẻ',
            emoji: '😊',
            color: '#f59e0b',
            response: 'Tuyệt vời quá! Nụ cười rạng rỡ của bạn hôm nay chính là điều đẹp đẽ nhất. Hãy tận hưởng trọn vẹn niềm vui này và lan tỏa sự tích cực nhé! 🌟'
        },
        tired: {
            label: 'Hơi mệt mỏi',
            emoji: '🥺',
            color: '#8b5cf6',
            response: 'Hôm nay bạn đã cố gắng nhiều rồi. Đừng tạo áp lực cho mình nữa nha. Hãy tắm nước ấm, ăn một món thật ngon và cho phép bản thân nghỉ ngơi sớm nhé. Tôi luôn ở cạnh bạn! 🍵'
        },
        calm: {
            label: 'An yên, nhẹ nhõm',
            emoji: '🍃',
            color: '#10b981',
            response: 'Một ngày trôi qua thật êm đềm và thanh bình. Giữ lấy sự tĩnh lặng này trong lòng nhé, đó là liều thuốc quý giá nhất cho tâm hồn của bạn đấy. 🕊️'
        },
        hug: {
            label: 'Cần một cái ôm',
            emoji: '🫂',
            color: '#f43f5e',
            response: 'Gửi đến bạn một cái ôm thật chặt và ấm áp từ phương xa! Dù ngoài kia có lạnh lùng hay bão tố thế nào, bạn luôn là người bạn quan trọng và được tôi trân quý nhất. Bạn không hề một mình đâu nhé! 💕'
        },
        energetic: {
            label: 'Đầy năng lượng',
            emoji: '⚡',
            color: '#ea580c',
            response: 'Ngọn lửa nhiệt huyết đang bùng cháy trong bạn! Hãy bắt tay vào làm những dự định bạn ấp ủ, tôi tin chắc hôm nay bạn sẽ gặt hái được những kết quả thật rực rỡ! 🚀'
        }
    };

    function getData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}

        return {
            todayMood: null,
            todayDate: null,
            history: []
        };
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    function selectMood(moodKey) {
        const mood = MOOD_DATA[moodKey];
        if (!mood) return;

        const data = getData();
        const todayStr = new Date().toLocaleDateString('vi-VN');

        data.todayMood = moodKey;
        data.todayDate = todayStr;

        // Lưu vào lịch sử (tối đa 7 ngày gần nhất)
        const existingIdx = data.history.findIndex(h => h.date === todayStr);
        if (existingIdx >= 0) {
            data.history[existingIdx] = { date: todayStr, mood: moodKey, emoji: mood.emoji };
        } else {
            data.history.unshift({ date: todayStr, mood: moodKey, emoji: mood.emoji });
            if (data.history.length > 7) data.history.pop();
        }

        saveData(data);
        render();
    }

    function render() {
        const data = getData();
        const todayStr = new Date().toLocaleDateString('vi-VN');
        const isSelectedToday = data.todayMood && data.todayDate === todayStr;

        // Cập nhật trạng thái các nút
        document.querySelectorAll('.mood-btn').forEach(btn => {
            const key = btn.dataset.mood;
            if (data.todayMood === key && isSelectedToday) {
                btn.classList.add('selected');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('selected');
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        // Hiển thị phản hồi lời nhắn
        const resBox = document.getElementById('mood-response-box');
        const resEmoji = document.getElementById('mood-res-emoji');
        const resText = document.getElementById('mood-res-text');

        if (resBox && resText && isSelectedToday && data.todayMood) {
            const mood = MOOD_DATA[data.todayMood];
            if (mood) {
                if (resEmoji) resEmoji.textContent = mood.emoji;
                resText.textContent = mood.response;
                resBox.hidden = false;
            }
        } else if (resBox) {
            resBox.hidden = true;
        }

        // Cập nhật dải lịch sử cảm xúc
        const histContainer = document.getElementById('mood-history-list');
        if (histContainer) {
            histContainer.innerHTML = '';
            if (data.history.length === 0) {
                histContainer.innerHTML = '<span class="history-empty">Chưa có ghi chép nào, hãy chọn tâm trạng hôm nay bạn nhé!</span>';
            } else {
                data.history.forEach(item => {
                    const tag = document.createElement('div');
                    tag.className = 'mood-history-item';
                    tag.innerHTML = `
                        <span class="hist-emoji">${item.emoji}</span>
                        <span class="hist-date">${item.date}</span>
                    `;
                    histContainer.appendChild(tag);
                });
            }
        }
    }

    function init() {
        render();

        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectMood(btn.dataset.mood);
            });
        });
    }

    return { init, selectMood };
})();
