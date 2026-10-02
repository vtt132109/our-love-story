/* ═══════════════════════════════════════════════════════
   minigames.js — Góc trò chơi nhỏ vui vẻ
   ═══════════════════════════════════════════════════════ */

const MiniGames = (() => {
    // ══════════════ 1. TAB CONTROLLER ══════════════
    function initTabs() {
        const tabs = document.querySelectorAll('.game-tab');
        const panels = document.querySelectorAll('.game-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.tab;

                // Nếu rời khỏi tab Hái Hoa Rơi, tạm dừng game đang chạy để tránh rò rỉ timer
                if (targetId !== 'game-catch') {
                    CatchGame.stopGame();
                }

                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                panels.forEach(p => {
                    p.classList.remove('active');
                    p.hidden = true;
                });

                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                const activePanel = document.getElementById(targetId);
                if (activePanel) {
                    activePanel.classList.add('active');
                    activePanel.hidden = false;
                }

                // Kích hoạt canvas lại nếu chuyển qua tab game
                if (targetId === 'game-wheel') {
                    JoyWheel.drawWheel();
                }
            });
        });
    }

    // ══════════════ 2. GAME: HÁI HOA RƠI ══════════════
    const CatchGame = (() => {
        let canvas, ctx;
        let isRunning = false;
        let score = 0;
        let highScore = 0;
        let basket = { x: 260, y: 320, width: 80, height: 40 };
        let flowers = [];
        let particles = [];
        let animationId;
        let spawnInterval;
        const FLOWER_TYPES = ['🌸', '🌻', '🌷', '🌼', '🌺', '🍀'];

        let gameTimerId = null;

        function init() {
            canvas = document.getElementById('catch-canvas');
            if (!canvas) return;
            ctx = canvas.getContext('2d');

            try {
                highScore = parseInt(localStorage.getItem('catch_high_score') || '0', 10);
            } catch { highScore = 0; }
            const hsEl = document.getElementById('catch-highscore');
            if (hsEl) hsEl.textContent = highScore;

            // Di chuyển giỏ theo chuột hoặc cảm ứng
            function updateBasketPosition(clientX) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const mouseX = (clientX - rect.left) * scaleX;
                basket.x = Math.max(0, Math.min(canvas.width - basket.width, mouseX - basket.width / 2));
            }

            canvas.addEventListener('mousemove', e => updateBasketPosition(e.clientX));
            canvas.addEventListener('touchmove', e => {
                if (e.touches.length > 0) {
                    updateBasketPosition(e.touches[0].clientX);
                }
            }, { passive: true });

            document.getElementById('btn-start-catch')?.addEventListener('click', startGame);
        }

        function startGame() {
            if (isRunning) return;
            isRunning = true;
            score = 0;
            flowers = [];
            particles = [];
            document.getElementById('catch-score').textContent = '0';
            document.getElementById('catch-overlay')?.classList.add('hidden');

            clearInterval(spawnInterval);
            clearTimeout(gameTimerId);

            spawnInterval = setInterval(spawnFlower, 900);
            gameLoop();

            // Giới hạn 45 giây mỗi ván
            gameTimerId = setTimeout(() => {
                endGame();
            }, 45000);
        }

        function stopGame() {
            if (!isRunning) return;
            isRunning = false;
            clearInterval(spawnInterval);
            clearTimeout(gameTimerId);
            cancelAnimationFrame(animationId);
        }

        function endGame() {
            isRunning = false;
            clearInterval(spawnInterval);
            clearTimeout(gameTimerId);
            cancelAnimationFrame(animationId);

            if (score > highScore) {
                highScore = score;
                localStorage.setItem('catch_high_score', highScore.toString());
                document.getElementById('catch-highscore').textContent = highScore;
            }

            const overlay = document.getElementById('catch-overlay');
            if (overlay) {
                overlay.querySelector('.overlay-msg').textContent = `Hết giờ! Bạn đã hái được ${score} điểm hoa! 💐`;
                overlay.querySelector('button').textContent = 'Chơi lại ván mới 🌸';
                overlay.classList.remove('hidden');
            }
        }

        function spawnFlower() {
            if (!isRunning) return;
            flowers.push({
                x: Math.random() * (canvas.width - 40) + 20,
                y: -30,
                speed: Math.random() * 1.5 + 2,
                emoji: FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)],
                size: 26,
                rotation: 0,
                rotSpeed: (Math.random() - 0.5) * 0.05
            });
        }

        function gameLoop() {
            if (!isRunning) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Vẽ giỏ hứng hoa
            ctx.fillStyle = '#ea580c';
            ctx.beginPath();
            ctx.roundRect(basket.x, basket.y, basket.width, basket.height, [6, 6, 20, 20]);
            ctx.fill();
            ctx.fillStyle = '#fed7aa';
            ctx.font = 'bold 13px Quicksand, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🧺 Giỏ hoa', basket.x + basket.width / 2, basket.y + 25);

            // Cập nhật và vẽ các bông hoa rơi
            for (let i = flowers.length - 1; i >= 0; i--) {
                const f = flowers[i];
                f.y += f.speed;
                f.rotation += f.rotSpeed;

                ctx.save();
                ctx.translate(f.x, f.y);
                ctx.rotate(f.rotation);
                ctx.font = `${f.size}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(f.emoji, 0, 0);
                ctx.restore();

                // Kiểm tra va chạm với giỏ
                if (
                    f.y + f.size / 2 >= basket.y &&
                    f.y - f.size / 2 <= basket.y + basket.height &&
                    f.x >= basket.x - 10 &&
                    f.x <= basket.x + basket.width + 10
                ) {
                    score += 10;
                    document.getElementById('catch-score').textContent = score;

                    // Hiệu ứng tia sáng nhỏ
                    for (let p = 0; p < 5; p++) {
                        particles.push({
                            x: f.x,
                            y: f.y,
                            vx: (Math.random() - 0.5) * 4,
                            vy: (Math.random() - 0.5) * 4 - 2,
                            life: 1,
                            char: '✨'
                        });
                    }

                    flowers.splice(i, 1);
                    continue;
                }

                // Rơi qua đáy màn hình
                if (f.y > canvas.height + 40) {
                    flowers.splice(i, 1);
                }
            }

            // Vẽ hạt hiệu ứng
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.04;
                ctx.font = '12px serif';
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillText(p.char, p.x, p.y);
                ctx.globalAlpha = 1;
                if (p.life <= 0) particles.splice(i, 1);
            }

            animationId = requestAnimationFrame(gameLoop);
        }

        return { init, stopGame };
    })();

    // ══════════════ 3. GAME: LẬT THẺ TÌM CẶP ══════════════
    const MemoryGame = (() => {
        const ICONS = ['🌸', '🌻', '🍓', '🍰', '🧋', '🧸'];
        let cards = [];
        let flippedCards = [];
        let matchedCount = 0;
        let moves = 0;
        let isLock = false;

        function init() {
            document.getElementById('btn-reset-memory')?.addEventListener('click', startNewGame);
            startNewGame();
        }

        function startNewGame() {
            const grid = document.getElementById('memory-grid');
            if (!grid) return;

            matchedCount = 0;
            moves = 0;
            flippedCards = [];
            isLock = false;

            document.getElementById('memory-moves').textContent = '0';
            document.getElementById('memory-matches').textContent = '0';

            // Nhân đôi danh sách icon và xáo trộn
            const deck = [...ICONS, ...ICONS].sort(() => Math.random() - 0.5);

            grid.innerHTML = '';
            cards = deck.map((icon, index) => {
                const cardEl = document.createElement('div');
                cardEl.className = 'memory-card';
                cardEl.dataset.icon = icon;
                cardEl.dataset.index = index;
                cardEl.textContent = '❓';
                cardEl.setAttribute('role', 'button');
                cardEl.setAttribute('tabindex', '0');
                cardEl.setAttribute('aria-label', `Ô thẻ số ${index + 1}, chưa lật`);

                cardEl.addEventListener('click', () => handleCardClick(cardEl, icon));
                cardEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(cardEl, icon);
                    }
                });
                grid.appendChild(cardEl);
                return cardEl;
            });
        }

        function handleCardClick(cardEl, icon) {
            if (isLock || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) {
                return;
            }

            cardEl.classList.add('flipped');
            cardEl.textContent = icon;
            cardEl.setAttribute('aria-label', `Ô thẻ số ${parseInt(cardEl.dataset.index) + 1} mở ra: ${icon}`);
            flippedCards.push({ el: cardEl, icon });

            if (flippedCards.length === 2) {
                moves += 1;
                document.getElementById('memory-moves').textContent = moves;
                checkMatch();
            }
        }

        function checkMatch() {
            const [first, second] = flippedCards;
            if (first.icon === second.icon) {
                first.el.classList.add('matched');
                second.el.classList.add('matched');
                first.el.setAttribute('aria-label', `Đã ghép đúng cặp: ${first.icon}`);
                second.el.setAttribute('aria-label', `Đã ghép đúng cặp: ${second.icon}`);
                matchedCount += 1;
                document.getElementById('memory-matches').textContent = matchedCount;
                flippedCards = [];

                if (matchedCount === ICONS.length) {
                    setTimeout(() => {
                        const movesEl = document.getElementById('memory-moves');
                        if (movesEl) {
                            movesEl.textContent = `${moves} (Tuyệt vời! Bạn đã ghép xong 🎉)`;
                        }
                    }, 200);
                }
            } else {
                isLock = true;
                setTimeout(() => {
                    first.el.classList.remove('flipped');
                    second.el.classList.remove('flipped');
                    first.el.textContent = '❓';
                    second.el.textContent = '❓';
                    first.el.setAttribute('aria-label', `Ô thẻ số ${parseInt(first.el.dataset.index) + 1}, chưa lật`);
                    second.el.setAttribute('aria-label', `Ô thẻ số ${parseInt(second.el.dataset.index) + 1}, chưa lật`);
                    flippedCards = [];
                    isLock = false;
                }, 750);
            }
        }

        return { init, startNewGame };
    })();

    // ══════════════ 4. GAME: VÒNG QUAY NIỀM VUI ══════════════
    const JoyWheel = (() => {
        let canvas, ctx;
        let angle = 0;
        let isSpinning = false;

        const options = [
            'Uống trà sữa 🧋',
            'Nghe nhạc chill 🎧',
            'Ăn món bạn thích 🍕',
            'Xem phim hài 🎬',
            'Ngủ thêm 20 phút 😴',
            'Đi dạo hóng gió 🍃',
            'Tự khen mình 1 câu 🌟',
            'Đọc vài trang sách 📖'
        ];

        const colors = [
            '#fb923c', '#f472b6', '#f59e0b', '#34d399',
            '#a855f7', '#38bdf8', '#fb7185', '#10b981'
        ];

        function init() {
            canvas = document.getElementById('joy-wheel-canvas');
            if (!canvas) return;
            ctx = canvas.getContext('2d');

            drawWheel();

            document.getElementById('btn-spin-joy')?.addEventListener('click', spin);
        }

        function drawWheel() {
            if (!canvas || !ctx) return;
            const total = options.length;
            const arc = (Math.PI * 2) / total;
            const radius = canvas.width / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(radius, radius);
            ctx.rotate(angle);

            for (let i = 0; i < total; i++) {
                const startAngle = i * arc;
                const endAngle = startAngle + arc;

                // Slice
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius - 4, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();

                // Text
                ctx.save();
                ctx.rotate(startAngle + arc / 2);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px Quicksand, sans-serif';
                ctx.textAlign = 'right';
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                ctx.shadowBlur = 4;
                ctx.fillText(options[i], radius - 18, 4);
                ctx.restore();
            }

            // Center Pin
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#fb923c';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.restore();
        }

        function spin() {
            if (isSpinning) return;
            isSpinning = true;
            const btn = document.getElementById('btn-spin-joy');
            if (btn) btn.disabled = true;

            const total = options.length;
            const arc = (Math.PI * 2) / total;
            const targetIndex = Math.floor(Math.random() * total);

            // Chuẩn hóa góc quay hiện tại về miền [0, 2π)
            const currentBase = ((angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
            // Quay ít nhất 5 vòng + ngẫu nhiên thêm 1-3 vòng
            const fullRounds = 5 + Math.random() * 3;
            // Mục tiêu dừng tại đỉnh 12h: góc kim là -π/2
            const targetNormalized = ((Math.PI * 2 * 10 - targetIndex * arc - arc / 2 - Math.PI / 2) % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);
            const forwardDelta = (targetNormalized - currentBase + Math.PI * 2) % (Math.PI * 2);
            const totalRotation = fullRounds * Math.PI * 2 + forwardDelta;

            const startAngle = angle;
            const duration = 3800;
            const startTime = performance.now();

            function animate(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                angle = startAngle + totalRotation * eased;

                drawWheel();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    isSpinning = false;
                    if (btn) btn.disabled = false;

                    const resultBox = document.getElementById('wheel-result-box');
                    const resultText = document.getElementById('wheel-result-text');
                    if (resultBox && resultText) {
                        resultText.textContent = options[targetIndex];
                        resultBox.hidden = false;
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        return { init, drawWheel };
    })();

    function init() {
        initTabs();
        CatchGame.init();
        MemoryGame.init();
        JoyWheel.init();
    }

    return { init };
})();
