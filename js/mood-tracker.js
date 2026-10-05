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
            response: 'Thấy người yêu tôi vui là lòng tôi như nở hoa! Nụ cười rạng rỡ của bạn là điều tôi yêu nhất trên cõi đời này. Hãy tận hưởng trọn vẹn niềm hạnh phúc này nhé bạn yêu! 🌟'
        },
        tired: {
            label: 'Hơi mệt mỏi',
            emoji: '🥺',
            color: '#8b5cf6',
            response: 'Người thương của tôi mệt rồi hả? Lại đây tôi ôm bạn một cái thật chặt nào! Tắm nước ấm, ăn món bạn thích và nghỉ ngơi sớm đi nhé. Mọi chuyện để tôi lo, tôi xót bạn lắm! 🍵'
        },
        calm: {
            label: 'An yên, nhẹ nhõm',
            emoji: '🍃',
            color: '#10b981',
            response: 'Thật an yên khi biết bạn của tôi đang có một ngày nhẹ nhõm. Từng khoảnh khắc bình yên bên bạn là điều vô giá mà tôi luôn muốn gìn giữ suốt đời. 🕊️'
        },
        hug: {
            label: 'Cần một cái ôm',
            emoji: '🫂',
            color: '#f43f5e',
            response: 'Tôi ôm bạn vào lòng thật chặt nè! Dù ngoài kia có bão giông hay lạnh lẽo thế nào, bạn luôn là người tôi yêu thương và trân quý nhất. Bạn mãi mãi không cô đơn vì có tôi ở đây rồi! 💕'
        },
        energetic: {
            label: 'Đầy năng lượng',
            emoji: '⚡',
            color: '#ea580c',
            response: 'Người tôi yêu hôm nay tuyệt vời quá! Ngọn lửa nhiệt huyết của bạn làm tôi say đắm. Cứ tự tin tiến bước nhé, tôi mãi là người hâm mộ trung thành và yêu bạn cuồng nhiệt nhất! 🚀'
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
        const now = new Date();
        const todayStr = now.toLocaleDateString('vi-VN');
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        data.todayMood = moodKey;
        data.todayDate = todayStr;
        data.todayTime = timeStr;

        // Lưu vào lịch sử (giữ tối đa 30 ngày)
        const record = {
            date: todayStr,
            time: timeStr,
            mood: moodKey,
            emoji: mood.emoji,
            label: mood.label,
            response: mood.response
        };

        const existingIdx = data.history.findIndex(h => h.date === todayStr);
        if (existingIdx >= 0) {
            data.history[existingIdx] = record;
        } else {
            data.history.unshift(record);
            if (data.history.length > 30) data.history.pop();
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

    return { 
        init, 
        selectMood, 
        getData, 
        saveData, 
        MOOD_DATA, 
        render 
    };
})();

window.MoodTracker = MoodTracker;

