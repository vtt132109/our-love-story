/* ═══════════════════════════════════════════════════════
   app.js — Nhạc trưởng điều khiển chính, Chế độ Tối & Tối ưu 60FPS
   ═══════════════════════════════════════════════════════ */

(() => {
    // ══════════════ 1. QUẢN LÝ CHẾ ĐỘ SÁNG / TỐI (THEME MANAGER) ══════════════
    const ThemeManager = (() => {
        const STORAGE_KEY = 'cozy_theme_preference';
        let onThemeChangeCallbacks = [];

        function getPreferredTheme() {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'dark' || saved === 'light') return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        function applyTheme(theme) {
            const toggleIcon = document.getElementById('theme-toggle-icon');
            const toggleLabel = document.getElementById('theme-toggle-label');
            const toggleBtn = document.getElementById('btn-theme-toggle');

            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                if (toggleIcon) toggleIcon.textContent = '☀️';
                if (toggleLabel) toggleLabel.textContent = 'Sáng';
                if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Chuyển sang chế độ sáng');
            } else {
                document.documentElement.removeAttribute('data-theme');
                if (toggleIcon) toggleIcon.textContent = '🌙';
                if (toggleLabel) toggleLabel.textContent = 'Tối';
                if (toggleBtn) toggleBtn.setAttribute('aria-label', 'Chuyển sang chế độ tối');
            }

            try {
                localStorage.setItem(STORAGE_KEY, theme);
            } catch (e) {
                console.warn('Không thể lưu theme vào localStorage:', e);
            }

            // Gọi các callback lắng nghe đổi theme (như đổi màu canvas)
            onThemeChangeCallbacks.forEach(cb => cb(theme));
        }

        function toggleTheme() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            applyTheme(isDark ? 'light' : 'dark');
        }

        function onThemeChange(callback) {
            onThemeChangeCallbacks.push(callback);
        }

        function init() {
            const toggleBtn = document.getElementById('btn-theme-toggle');
            toggleBtn?.addEventListener('click', toggleTheme);

            // Áp dụng theme lúc khởi động
            const currentTheme = getPreferredTheme();
            applyTheme(currentTheme);

            // Tự động chuyển theo hệ điều hành nếu người dùng chưa chọn thủ công
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(STORAGE_KEY)) {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }

        return { init, toggleTheme, applyTheme, onThemeChange, isDark: () => document.documentElement.getAttribute('data-theme') === 'dark' };
    })();

    // ══════════════ 2. HIỆU ỨNG NỀN BOKEH THƠ MỘNG (60FPS GPU SPRITE) ══════════════
    function initBackground() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Bảng màu ngày (Pastel nắng mai) & Bảng màu đêm (Đom đóm & sao trời)
        const paletteDay = [
            { r: 251, g: 146, b: 60, a: 0.18 },  // Warm Peach
            { r: 244, g: 114, b: 182, a: 0.18 }, // Soft Pink
            { r: 245, g: 158, b: 11, a: 0.15 },  // Sun Yellow
            { r: 52, g: 211, b: 153, a: 0.15 }   // Leaf Green
        ];

        const paletteNight = [
            { r: 168, g: 85, b: 247, a: 0.22 },  // Lavender
            { r: 99, g: 102, b: 241, a: 0.22 },  // Indigo Star
            { r: 253, g: 224, b: 71, a: 0.16 },  // Moon Gold
            { r: 244, g: 114, b: 182, a: 0.18 }  // Rose Nebula
        ];

        let sprites = [];

        function buildSprites(palette) {
            const spriteSize = 64;
            return palette.map(col => {
                const offscreen = document.createElement('canvas');
                offscreen.width = spriteSize;
                offscreen.height = spriteSize;
                const offCtx = offscreen.getContext('2d');
                const center = spriteSize / 2;
                const grad = offCtx.createRadialGradient(center, center, 0, center, center, center);
                grad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${col.a})`);
                grad.addColorStop(0.5, `rgba(${col.r}, ${col.g}, ${col.b}, ${col.a * 0.6})`);
                grad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);

                offCtx.fillStyle = grad;
                offCtx.beginPath();
                offCtx.arc(center, center, center, 0, Math.PI * 2);
                offCtx.fill();
                return offscreen;
            });
        }

        sprites = buildSprites(ThemeManager.isDark() ? paletteNight : paletteDay);

        // Đổi màu hạt khi chuyển giao diện Sáng / Tối
        ThemeManager.onThemeChange((theme) => {
            sprites = buildSprites(theme === 'dark' ? paletteNight : paletteDay);
            // Cập nhật lại sprite cho các hạt đang bay
            particles.forEach(p => {
                p.sprite = sprites[Math.floor(Math.random() * sprites.length)];
            });
        });

        let particles = [];
        let animId = null;
        let isTabActive = true;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resize();
        window.addEventListener('resize', resize, { passive: true });

        const count = Math.min(Math.floor(window.innerWidth / 80), 16);
        for (let i = 0; i < count; i++) {
            const spriteIndex = Math.floor(Math.random() * sprites.length);
            const size = Math.random() * 32 + 28;
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: size,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                sprite: sprites[spriteIndex]
            });
        }

        function drawFrame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (!prefersReducedMotion) {
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.x < -p.size) p.x = canvas.width + p.size;
                    if (p.x > canvas.width + p.size) p.x = -p.size;
                    if (p.y < -p.size) p.y = canvas.height + p.size;
                    if (p.y > canvas.height + p.size) p.y = -p.size;
                }

                ctx.drawImage(p.sprite, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
            }
        }

        function animate() {
            if (!isTabActive) return;
            drawFrame();
            animId = requestAnimationFrame(animate);
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isTabActive = false;
                if (animId) cancelAnimationFrame(animId);
            } else {
                isTabActive = true;
                animId = requestAnimationFrame(animate);
            }
        });

        if (prefersReducedMotion) {
            drawFrame();
        } else {
            animate();
        }
    }

    // Phím ESC để đóng mọi modal đang mở
    function initGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(m => m.hidden = true);
            }
        });
    }

    // Khởi động toàn bộ trang web khi DOM sẵn sàng
    document.addEventListener('DOMContentLoaded', () => {
        ThemeManager.init();
        initBackground();
        initGlobalShortcuts();

        // Khởi tạo các module
        FlowerGarden.init();
        Goodnight.init();
        CheerUp.init();
        MiniGames.init();

        console.log('🌸 Chào mừng bạn đến với Góc Nhỏ Của Bạn & Tôi! (Dark Mode & 60FPS Ready)');
    });
})();
