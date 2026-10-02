
        // Stopwatch State Variables
        let timerState = 'READY'; // READY, RUNNING, PAUSED
        let startTime = 0;        // Timestamp when started/resumed
        let elapsedBeforePause = 0; // Total accumulated milliseconds before current segment
        let totalElapsed = 0;     // Current total elapsed milliseconds
        let animationFrameId = null; // requestAnimationFrame ID

        // Laps Data
        let laps = [];

        // DOM Element References
        const timerDisplay = document.getElementById('timerDisplay');
        const startBtn = document.getElementById('startBtn');
        const startBtnText = document.getElementById('startBtnText');
        const pauseBtn = document.getElementById('pauseBtn');
        const lapBtn = document.getElementById('lapBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        const stateBadge = document.getElementById('stateBadge');
        const stateDot = document.getElementById('stateDot');
        const stateText = document.getElementById('stateText');
        const stopwatchCard = document.getElementById('stopwatchCard');

        const statsContainer = document.getElementById('statsContainer');
        const lapsSection = document.getElementById('lapsSection');
        const lapsListContainer = document.getElementById('lapsListContainer');
        const lapCountBadge = document.getElementById('lapCountBadge');

        const fastestLapVal = document.getElementById('fastestLapVal');
        const fastestLapNum = document.getElementById('fastestLapNum');
        const slowestLapVal = document.getElementById('slowestLapVal');
        const slowestLapNum = document.getElementById('slowestLapNum');
        const averageLapVal = document.getElementById('averageLapVal');

        const shortcutsBtn = document.getElementById('shortcutsBtn');
        const shortcutsModal = document.getElementById('shortcutsModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const closeModalAction = document.getElementById('closeModalAction');

        // Format milliseconds into HH : MM : SS . MS
        function formatTime(ms) {
            const totalMs = Math.floor(ms);
            const milliseconds = Math.floor((totalMs % 1000));
            const totalSeconds = Math.floor(totalMs / 1000);
            const seconds = totalSeconds % 60;
            const totalMinutes = Math.floor(totalSeconds / 60);
            const minutes = totalMinutes % 60;
            const hours = Math.floor(totalMinutes / 60);

            const hh = String(hours).padStart(2, '0');
            const mm = String(minutes).padStart(2, '0');
            const ss = String(seconds).padStart(2, '0');
            const mmm = String(milliseconds).padStart(3, '0');

            return { hh, mm, ss, mmm };
        }

        // Render formatted time onto the display element
        function updateDisplay(ms) {
            const { hh, mm, ss, mmm } = formatTime(ms);
            timerDisplay.innerHTML = `${hh}<span class="text-gray-500 font-light mx-1">:</span>${mm}<span class="text-gray-500 font-light mx-1">:</span>${ss}<span class="text-gray-500 font-light mx-1">.</span><span class="text-indigo-400 text-3xl sm:text-5xl md:text-6xl">${mmm}</span>`;
        }

        // High precision animation loop using performance.now()
        function updateTimer() {
            if (timerState === 'RUNNING') {
                const now = performance.now();
                totalElapsed = elapsedBeforePause + (now - startTime);
                updateDisplay(totalElapsed);
                animationFrameId = requestAnimationFrame(updateTimer);
            }
        }

        // Update UI state badges and buttons accessibility / styling
        function setUIState(newState) {
            timerState = newState;

            // State Badge update
            stateBadge.className = "px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 border ";
            stateDot.className = "w-2 h-2 rounded-full transition-colors ";

            if (timerState === 'READY') {
                stateBadge.classList.add('bg-gray-800', 'text-gray-400', 'border-gray-700/50');
                stateDot.classList.add('bg-gray-400');
                stateText.textContent = 'READY';
                stopwatchCard.classList.remove('running-glow', 'border-indigo-500/40');
                
                // Button states
                startBtn.disabled = false;
                startBtn.className = "min-h-[48px] px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm sm:text-base shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400";
                startBtnText.textContent = 'Start';

                pauseBtn.disabled = true;
                pauseBtn.className = "min-h-[48px] px-4 py-3 rounded-xl bg-amber-600/50 text-amber-200/50 cursor-not-allowed font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 focus:outline-none";

                lapBtn.disabled = true;
                lapBtn.className = "min-h-[48px] px-4 py-3 rounded-xl bg-indigo-600/50 text-indigo-200/50 cursor-not-allowed font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 focus:outline-none";

            } else if (timerState === 'RUNNING') {
                stateBadge.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/30');
                stateDot.classList.add('bg-emerald-400', 'animate-pulse');
                stateText.textContent = 'RUNNING';
                stopwatchCard.classList.add('running-glow', 'border-indigo-500/40');

                // Button states
                startBtn.disabled = true;
                startBtn.className = "min-h-[48px] px-4 py-3 rounded-xl bg-emerald-600/50 text-emerald-200/50 cursor-not-allowed font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 focus:outline-none";
                startBtnText.textContent = 'Start';

                pauseBtn.disabled = false;
                pauseBtn.className = "min-h-[48px] px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm sm:text-base shadow-lg shadow-amber-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400";

                lapBtn.disabled = false;
                lapBtn.className = "min-h-[48px] px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm sm:text-base shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400";

            } else if (timerState === 'PAUSED') {
                stateBadge.classList.add('bg-amber-500/10', 'text-amber-400', 'border-amber-500/30');
                stateDot.classList.add('bg-amber-400');
                stateText.textContent = 'PAUSED';
                stopwatchCard.classList.remove('running-glow');
                stopwatchCard.classList.add('border-amber-500/30');

                // Button states
                startBtn.disabled = false;
                startBtn.className = "min-h-[48px] px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm sm:text-base shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400";
                startBtnText.textContent = 'Resume';

                pauseBtn.disabled = true;
                pauseBtn.className = "min-h-[48px] px-4 py-3 rounded-xl bg-amber-600/50 text-amber-200/50 cursor-not-allowed font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 focus:outline-none";

                lapBtn.disabled = true;
                lapBtn.className = "min-h-[48px] px-4 py-3 rounded-xl bg-indigo-600/50 text-indigo-200/50 cursor-not-allowed font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 focus:outline-none";
            }
        }

        // Start or Resume action
        function startStopwatch() {
            if (timerState === 'RUNNING') return;
            startTime = performance.now();
            setUIState('RUNNING');
            animationFrameId = requestAnimationFrame(updateTimer);
        }

        // Pause action
        function pauseStopwatch() {
            if (timerState !== 'RUNNING') return;
            cancelAnimationFrame(animationFrameId);
            elapsedBeforePause = totalElapsed;
            setUIState('PAUSED');
        }

        // Reset action
        function resetStopwatch() {
            cancelAnimationFrame(animationFrameId);
            totalElapsed = 0;
            elapsedBeforePause = 0;
            startTime = 0;
            laps = [];
            updateDisplay(0);
            setUIState('READY');
            renderLaps();
        }

        // Record a lap
        function recordLap() {
            if (timerState !== 'RUNNING') return;

            const currentTotal = totalElapsed;
            const previousTotal = laps.length > 0 ? laps[0].totalTime : 0;
            const lapDuration = currentTotal - previousTotal;

            const newLap = {
                number: laps.length + 1,
                totalTime: currentTotal,
                duration: lapDuration
            };

            // Newest lap on top
            laps.unshift(newLap);
            renderLaps();
        }

        // Calculate and display Lap statistics (Fastest, Slowest, Average)
        function updateLapStatistics() {
            if (laps.length === 0) {
                statsContainer.classList.add('hidden');
                lapsSection.classList.add('hidden');
                return;
            }

            statsContainer.classList.remove('hidden');
            lapsSection.classList.remove('hidden');
            lapCountBadge.textContent = `${laps.length} ${laps.length === 1 ? 'Lap' : 'Laps'}`;

            let fastest = laps[0];
            let slowest = laps[0];
            let totalDuration = 0;

            laps.forEach(lap => {
                totalDuration += lap.duration;
                if (lap.duration < fastest.duration) fastest = lap;
                if (lap.duration > slowest.duration) slowest = lap;
            });

            const avgDuration = totalDuration / laps.length;

            const fTime = formatTime(fastest.duration);
            fastestLapVal.textContent = `${fTime.mm}:${fTime.ss}.${fTime.mmm}`;
            fastestLapNum.textContent = `#${fastest.number}`;

            const sTime = formatTime(slowest.duration);
            slowestLapVal.textContent = `${sTime.mm}:${sTime.ss}.${sTime.mmm}`;
            slowestLapNum.textContent = `#${slowest.number}`;

            const aTime = formatTime(avgDuration);
            averageLapVal.textContent = `${aTime.mm}:${aTime.ss}.${aTime.mmm}`;
        }

        // Render Lap List in DOM
        function renderLaps() {
            updateLapStatistics();
            if (laps.length === 0) {
                lapsListContainer.innerHTML = '';
                return;
            }

            let fastestNum = -1;
            let slowestNum = -1;

            if (laps.length > 1) {
                let f = laps[0];
                let s = laps[0];
                laps.forEach(l => {
                    if (l.duration < f.duration) f = l;
                    if (l.duration > s.duration) s = l;
                });
                fastestNum = f.number;
                slowestNum = s.number;
            }

            let html = '';
            laps.forEach((lap) => {
                const dur = formatTime(lap.duration);
                const tot = formatTime(lap.totalTime);

                let badgeHtml = '';
                if (lap.number === fastestNum && laps.length > 1) {
                    badgeHtml = `<span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Fastest</span>`;
                } else if (lap.number === slowestNum && laps.length > 1) {
                    badgeHtml = `<span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Slowest</span>`;
                }

                html += `
                    <div class="flex items-center justify-between p-3 rounded-2xl bg-darkBg/50 border border-cardBorder hover:border-gray-700 transition-all">
                        <div class="flex items-center gap-3">
                            <span class="text-xs font-mono font-bold text-gray-400 bg-cardBorder px-2.5 py-1 rounded-xl">#${lap.number}</span>
                            <div>
                                <div class="mono-digits text-sm font-semibold text-white">+${dur.mm}:${dur.ss}.${dur.mmm}</div>
                                <div class="text-[11px] text-gray-400">Total: ${tot.mm}:${tot.ss}.${tot.mmm}</div>
                            </div>
                        </div>
                        <div>
                            ${badgeHtml}
                        </div>
                    </div>
                `;
            });

            lapsListContainer.innerHTML = html;
        }

        // Event Listeners for Buttons
        startBtn.addEventListener('click', () => {
            if (timerState === 'RUNNING') return;
            if (timerState === 'READY' || timerState === 'PAUSED') {
                startStopwatch();
            }
        });

        pauseBtn.addEventListener('click', () => {
            if (timerState === 'RUNNING') {
                pauseStopwatch();
            }
        });

        lapBtn.addEventListener('click', () => {
            if (timerState === 'RUNNING') {
                recordLap();
            }
        });

        resetBtn.addEventListener('click', () => {
            resetStopwatch();
        });

        // Keyboard Shortcuts Handler
        document.addEventListener('keydown', (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
                return;
            }

            const key = e.key.toLowerCase();

            if (key === ' ') {
                e.preventDefault();
                if (timerState === 'RUNNING') {
                    pauseStopwatch();
                } else {
                    startStopwatch();
                }
            } else if (key === 'l') {
                e.preventDefault();
                if (timerState === 'RUNNING') {
                    recordLap();
                }
            } else if (key === 'r') {
                e.preventDefault();
                resetStopwatch();
            }
        });

        // Modal Controls
        shortcutsBtn.addEventListener('click', () => {
            shortcutsModal.classList.remove('hidden');
        });

        closeModalBtn.addEventListener('click', () => {
            shortcutsModal.classList.add('hidden');
        });

        closeModalAction.addEventListener('click', () => {
            shortcutsModal.classList.add('hidden');
        });

        shortcutsModal.addEventListener('click', (e) => {
            if (e.target === shortcutsModal) {
                shortcutsModal.classList.add('hidden');
            }
        });

        // Initialize state display on load
        setUIState('READY');
