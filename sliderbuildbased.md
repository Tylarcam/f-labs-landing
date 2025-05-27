<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cyberpunk Interface Sliders</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: #0a0a0a;
            font-family: 'Orbitron', monospace;
            color: #00ff88;
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }
        
        /* Animated background grid */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: gridMove 20s linear infinite;
            pointer-events: none;
            z-index: -1;
        }
        
        @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
            position: relative;
        }
        
        .header {
            text-align: center;
            margin-bottom: 60px;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #00ff88, transparent);
            animation: pulse 2s ease-in-out infinite;
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #00ff88;
            text-shadow: 0 0 20px #00ff88;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }
        
        .slider-section {
            margin-bottom: 40px;
            background: linear-gradient(145deg, rgba(0, 20, 40, 0.3), rgba(0, 40, 20, 0.2));
            border: 1px solid rgba(0, 255, 136, 0.3);
            border-radius: 10px;
            padding: 30px;
            position: relative;
            backdrop-filter: blur(10px);
        }
        
        .slider-section::before {
            content: '';
            position: absolute;
            top: -1px;
            left: -1px;
            right: -1px;
            bottom: -1px;
            background: linear-gradient(45deg, #00ff88, transparent, #0088ff, transparent, #00ff88);
            border-radius: 10px;
            z-index: -1;
            opacity: 0.5;
            animation: borderGlow 3s ease-in-out infinite;
        }
        
        @keyframes borderGlow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
        }
        
        .slider-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .slider-label h3 {
            font-size: 1.2rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #00ff88;
        }
        
        .slider-value {
            font-size: 1.1rem;
            font-weight: 700;
            color: #0088ff;
            text-shadow: 0 0 10px #0088ff;
            min-width: 80px;
            text-align: right;
        }
        
        .slider-container {
            position: relative;
            height: 60px;
            display: flex;
            align-items: center;
        }
        
        .slider {
            width: 100%;
            height: 8px;
            border-radius: 4px;
            background: linear-gradient(90deg, #001122, #002244);
            border: 1px solid rgba(0, 255, 136, 0.5);
            outline: none;
            cursor: pointer;
            position: relative;
            appearance: none;
            -webkit-appearance: none;
        }
        
        .slider::-webkit-slider-track {
            height: 8px;
            border-radius: 4px;
            background: linear-gradient(90deg, #001122, #002244);
            border: 1px solid rgba(0, 255, 136, 0.5);
        }
        
        .slider::-webkit-slider-thumb {
            appearance: none;
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: linear-gradient(45deg, #00ff88, #0088ff);
            border: 2px solid #00ff88;
            cursor: pointer;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
            position: relative;
            z-index: 2;
        }
        
        .slider::-webkit-slider-thumb:hover {
            box-shadow: 0 0 30px rgba(0, 255, 136, 1);
            transform: scale(1.1);
        }
        
        .slider::-moz-range-track {
            height: 8px;
            border-radius: 4px;
            background: linear-gradient(90deg, #001122, #002244);
            border: 1px solid rgba(0, 255, 136, 0.5);
        }
        
        .slider::-moz-range-thumb {
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: linear-gradient(45deg, #00ff88, #0088ff);
            border: 2px solid #00ff88;
            cursor: pointer;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.8);
        }
        
        /* Progress fill effect */
        .slider-progress {
            position: absolute;
            top: 50%;
            left: 0;
            height: 8px;
            background: linear-gradient(90deg, #00ff88, #0088ff);
            border-radius: 4px;
            transform: translateY(-50%);
            pointer-events: none;
            box-shadow: 0 0 10px rgba(0, 255, 136, 0.6);
            z-index: 1;
        }
        
        .slider-ticks {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            height: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-top: 5px;
        }
        
        .tick {
            width: 1px;
            height: 10px;
            background: rgba(0, 255, 136, 0.4);
            position: relative;
        }
        
        .tick:nth-child(5n) {
            height: 15px;
            background: rgba(0, 255, 136, 0.8);
        }
        
        .tick:nth-child(5n)::after {
            content: attr(data-value);
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.7rem;
            color: rgba(0, 255, 136, 0.6);
            margin-top: 2px;
        }
        
        /* Special effects */
        .glitch {
            position: relative;
        }
        
        .glitch::before,
        .glitch::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.8;
        }
        
        .glitch::before {
            animation: glitch-1 2s infinite;
            color: #ff0040;
            z-index: -1;
        }
        
        .glitch::after {
            animation: glitch-2 2s infinite;
            color: #00ffff;
            z-index: -2;
        }
        
        @keyframes glitch-1 {
            0%, 14%, 15%, 49%, 50%, 99%, 100% {
                transform: translate(0);
            }
            15%, 49% {
                transform: translate(-2px, 2px);
            }
        }
        
        @keyframes glitch-2 {
            0%, 20%, 21%, 62%, 63%, 99%, 100% {
                transform: translate(0);
            }
            21%, 62% {
                transform: translate(2px, -2px);
            }
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .slider-section {
                padding: 20px;
            }
            
            .slider-label {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            
            .slider-value {
                text-align: left;
            }
        }
        
        /* Terminal-style info panel */
        .info-panel {
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #00ff88;
            border-radius: 5px;
            padding: 20px;
            margin-top: 40px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
        }
        
        .info-panel::before {
            content: '> SYSTEM STATUS: ACTIVE';
            display: block;
            color: #00ff88;
            margin-bottom: 10px;
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="glitch" data-text="NEURAL INTERFACE">NEURAL INTERFACE</h1>
            <p>Cybersecurity Protocol v3.14.159</p>
        </div>
        
        <div class="slider-section">
            <div class="slider-label">
                <h3>FIREWALL STRENGTH</h3>
                <div class="slider-value" id="value1">75%</div>
            </div>
            <div class="slider-container">
                <input type="range" min="0" max="100" value="75" class="slider" id="slider1">
                <div class="slider-progress" id="progress1"></div>
                <div class="slider-ticks">
                    <div class="tick" data-value="0"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="25"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="50"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="75"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="100"></div>
                </div>
            </div>
        </div>
        
        <div class="slider-section">
            <div class="slider-label">
                <h3>ENCRYPTION LEVEL</h3>
                <div class="slider-value" id="value2">42%</div>
            </div>
            <div class="slider-container">
                <input type="range" min="0" max="100" value="42" class="slider" id="slider2">
                <div class="slider-progress" id="progress2"></div>
                <div class="slider-ticks">
                    <div class="tick" data-value="0"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="25"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="50"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="75"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="100"></div>
                </div>
            </div>
        </div>
        
        <div class="slider-section">
            <div class="slider-label">
                <h3>NEURAL BANDWIDTH</h3>
                <div class="slider-value" id="value3">88%</div>
            </div>
            <div class="slider-container">
                <input type="range" min="0" max="100" value="88" class="slider" id="slider3">
                <div class="slider-progress" id="progress3"></div>
                <div class="slider-ticks">
                    <div class="tick" data-value="0"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="25"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="50"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="75"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="100"></div>
                </div>
            </div>
        </div>
        
        <div class="slider-section">
            <div class="slider-label">
                <h3>QUANTUM PROCESSING</h3>
                <div class="slider-value" id="value4">63%</div>
            </div>
            <div class="slider-container">
                <input type="range" min="0" max="100" value="63" class="slider" id="slider4">
                <div class="slider-progress" id="progress4"></div>
                <div class="slider-ticks">
                    <div class="tick" data-value="0"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="25"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="50"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="75"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick"></div>
                    <div class="tick" data-value="100"></div>
                </div>
            </div>
        </div>
        
        <div class="info-panel">
            <div style="color: #666;">CONNECTION_STATUS: SECURE</div>
            <div style="color: #0088ff;">UPLINK_ACTIVE: TRUE</div>
            <div style="color: #00ff88;">NEURAL_SYNC: OPTIMAL</div>
            <div style="color: #ff6600;">THREAT_LEVEL: MINIMAL</div>
        </div>
    </div>
    
    <script>
        // Initialize sliders with interactive functionality
        function initializeSlider(sliderId, valueId, progressId) {
            const slider = document.getElementById(sliderId);
            const valueDisplay = document.getElementById(valueId);
            const progress = document.getElementById(progressId);
            
            function updateSlider() {
                const value = slider.value;
                valueDisplay.textContent = value + '%';
                progress.style.width = value + '%';
                
                // Add glitch effect on high values
                if (value > 80) {
                    valueDisplay.style.animation = 'glitch-1 0.5s infinite';
                } else {
                    valueDisplay.style.animation = 'none';
                }
            }
            
            // Initial update
            updateSlider();
            
            // Update on input
            slider.addEventListener('input', updateSlider);
            
            // Add hover effects
            slider.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.8)';
            });
            
            slider.addEventListener('mouseleave', function() {
                this.style.boxShadow = 'none';
            });
        }
        
        // Initialize all sliders
        initializeSlider('slider1', 'value1', 'progress1');
        initializeSlider('slider2', 'value2', 'progress2');
        initializeSlider('slider3', 'value3', 'progress3');
        initializeSlider('slider4', 'value4', 'progress4');
        
        // Add random fluctuations for realism
        setInterval(() => {
            const sliders = ['slider3', 'slider4']; // Only neural bandwidth and quantum processing
            const randomSlider = sliders[Math.floor(Math.random() * sliders.length)];
            const slider = document.getElementById(randomSlider);
            const currentValue = parseInt(slider.value);
            const fluctuation = Math.random() * 4 - 2; // ±2
            const newValue = Math.max(0, Math.min(100, currentValue + fluctuation));
            
            slider.value = newValue;
            slider.dispatchEvent(new Event('input'));
        }, 3000);
        
        // Add typing effect to info panel
        const infoPanelLines = document.querySelectorAll('.info-panel div');
        let lineIndex = 0;
        
        function typeEffect() {
            if (lineIndex < infoPanelLines.length) {
                const line = infoPanelLines[lineIndex];
                const text = line.textContent;
                line.textContent = '';
                line.style.opacity = '1';
                
                let charIndex = 0;
                const typeInterval = setInterval(() => {
                    if (charIndex < text.length) {
                        line.textContent += text[charIndex];
                        charIndex++;
                    } else {
                        clearInterval(typeInterval);
                        lineIndex++;
                        setTimeout(typeEffect, 200);
                    }
                }, 50);
            }
        }
        
        // Start typing effect after page load
        setTimeout(typeEffect, 1000);
    </script>
</body>
</html>