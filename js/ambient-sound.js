/* ═══════════════════════════════════════════════════════
   ambient-sound.js — Hộp âm thanh bình yên tổng hợp bằng Web Audio API
   Không cần tải file ngoài, nhẹ tuyệt đối, chạy mượt mà 60fps
   ═══════════════════════════════════════════════════════ */

const AmbientSound = (() => {
    let audioCtx = null;
    let currentSound = null;
    let masterGain = null;
    let isPlaying = false;
    let activeNodes = [];

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContextClass();
            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
            masterGain.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function stopCurrent() {
        activeNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                node.disconnect();
            } catch (e) {}
        });
        activeNodes = [];
        isPlaying = false;
        updateUI();
    }

    // 🌧️ 1. Tiếng mưa rào dịu êm (Pink Noise filtered)
    function playRain() {
        const ctx = getAudioContext();
        stopCurrent();

        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
            b6 = white * 0.115926;
        }

        const rainSource = ctx.createBufferSource();
        rainSource.buffer = noiseBuffer;
        rainSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.6, ctx.currentTime);

        rainSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);

        rainSource.start();
        activeNodes.push(rainSource, filter, gainNode);
        isPlaying = true;
        currentSound = 'rain';
        updateUI();
    }

    // 🪵 2. Tiếng lửa lò sưởi ấm áp (Low rumble + random crackles)
    function playFireplace() {
        const ctx = getAudioContext();
        stopCurrent();

        // Nền tiếng rực ấm áp
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 1.8;
        }

        const rumbleSource = ctx.createBufferSource();
        rumbleSource.buffer = noiseBuffer;
        rumbleSource.loop = true;

        const rumbleFilter = ctx.createBiquadFilter();
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.setValueAtTime(250, ctx.currentTime);

        const rumbleGain = ctx.createGain();
        rumbleGain.gain.setValueAtTime(0.7, ctx.currentTime);

        rumbleSource.connect(rumbleFilter);
        rumbleFilter.connect(rumbleGain);
        rumbleGain.connect(masterGain);
        rumbleSource.start();
        activeNodes.push(rumbleSource, rumbleFilter, rumbleGain);

        // Sinh tiếng lách tách củi nổ ngẫu nhiên
        const crackleInterval = setInterval(() => {
            if (!isPlaying || currentSound !== 'fire') {
                clearInterval(crackleInterval);
                return;
            }
            if (Math.random() > 0.4) {
                const popOsc = ctx.createOscillator();
                const popGain = ctx.createGain();
                popOsc.type = 'triangle';
                popOsc.frequency.setValueAtTime(Math.random() * 600 + 400, ctx.currentTime);
                popGain.gain.setValueAtTime(Math.random() * 0.15 + 0.05, ctx.currentTime);
                popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

                popOsc.connect(popGain);
                popGain.connect(masterGain);
                popOsc.start();
                popOsc.stop(ctx.currentTime + 0.05);
            }
        }, 120);

        isPlaying = true;
        currentSound = 'fire';
        updateUI();
    }

    // 🌊 3. Tiếng sóng biển rì rào
    function playWaves() {
        const ctx = getAudioContext();
        stopCurrent();

        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.2;
        }

        const waveSource = ctx.createBufferSource();
        waveSource.buffer = noiseBuffer;
        waveSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);

        // Chu kỳ sóng cuộn 4.5 giây
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.22, ctx.currentTime);
        lfoGain.gain.setValueAtTime(280, ctx.currentTime);

        lfo.connect(filter.frequency);

        const waveGain = ctx.createGain();
        waveGain.gain.setValueAtTime(0.65, ctx.currentTime);

        waveSource.connect(filter);
        filter.connect(waveGain);
        waveGain.connect(masterGain);

        waveSource.start();
        lfo.start();
        activeNodes.push(waveSource, filter, lfo, lfoGain, waveGain);

        isPlaying = true;
        currentSound = 'waves';
        updateUI();
    }

    // 🌙 4. Tiếng dế đêm hè thanh bình
    function playNightCrickets() {
        const ctx = getAudioContext();
        stopCurrent();

        // Gió đêm nhẹ
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.04;
        }
        const windSource = ctx.createBufferSource();
        windSource.buffer = noiseBuffer;
        windSource.loop = true;
        const windFilter = ctx.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.setValueAtTime(320, ctx.currentTime);
        windSource.connect(windFilter);
        windFilter.connect(masterGain);
        windSource.start();
        activeNodes.push(windSource, windFilter);

        // Tiếng dế kêu lặp
        const cricketInterval = setInterval(() => {
            if (!isPlaying || currentSound !== 'crickets') {
                clearInterval(crackleInterval);
                return;
            }
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(4500, ctx.currentTime);
            osc.frequency.setValueAtTime(4650, ctx.currentTime + 0.03);

            gain.gain.setValueAtTime(0.04, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            osc.stop(ctx.currentTime + 0.09);
        }, 350);

        isPlaying = true;
        currentSound = 'crickets';
        updateUI();
    }

    function toggleSound(soundType) {
        if (isPlaying && currentSound === soundType) {
            stopCurrent();
        } else {
            if (soundType === 'rain') playRain();
            else if (soundType === 'fire') playFireplace();
            else if (soundType === 'waves') playWaves();
            else if (soundType === 'crickets') playNightCrickets();
        }
    }

    function setVolume(val) {
        if (!masterGain && !audioCtx) getAudioContext();
        if (masterGain) {
            masterGain.gain.setValueAtTime(val, audioCtx.currentTime);
        }
    }

    function updateUI() {
        document.querySelectorAll('.ambient-btn').forEach(btn => {
            const type = btn.dataset.sound;
            if (isPlaying && currentSound === type) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        const statusEl = document.getElementById('ambient-status-text');
        if (statusEl) {
            if (isPlaying) {
                const names = {
                    rain: 'Đang phát: Mưa rào dịu êm 🌧️',
                    fire: 'Đang phát: Lò sưởi ấm áp 🪵',
                    waves: 'Đang phát: Sóng biển rì rào 🌊',
                    crickets: 'Đang phát: Đêm hè thanh bình 🌙'
                };
                statusEl.textContent = names[currentSound] || 'Đang phát âm thanh thư giãn';
            } else {
                statusEl.textContent = 'Chọn một âm thanh để bật cảm giác bình yên...';
            }
        }
    }

    function init() {
        document.querySelectorAll('.ambient-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sound = btn.dataset.sound;
                toggleSound(sound);
            });
        });

        const volSlider = document.getElementById('ambient-volume');
        volSlider?.addEventListener('input', (e) => {
            setVolume(parseFloat(e.target.value));
        });

        document.getElementById('btn-stop-ambient')?.addEventListener('click', stopCurrent);
    }

    return { init, toggleSound, stopCurrent, setVolume };
})();
