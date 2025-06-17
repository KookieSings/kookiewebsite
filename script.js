// Window management
function openWindow(id) {
    const window = document.getElementById(id);
    window.style.display = 'flex';
    // Center the window (redundant with CSS but ensures it stays centered)
    window.style.left = '50%';
    window.style.top = '50%';
    window.style.transform = 'translate(-50%, -50%)';
    focusWindow(id);
    toggleStartMenu();
}

function closeWindow(id) {
    document.getElementById(id).style.display = 'none';
    document.querySelector(`.task-button[onclick="focusWindow('${id}')"]`).classList.remove('active');
}

function minimizeWindow(id) {
    document.getElementById(id).style.display = 'none';
    document.querySelector(`.task-button[onclick="focusWindow('${id}')"]`).classList.remove('active');
}

function focusWindow(id) {
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
        window.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
    document.getElementById(id).style.display = 'flex';
    
    const buttons = document.querySelectorAll('.task-button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`.task-button[onclick="focusWindow('${id}')"]`).classList.add('active');
}


// Make windows draggable
document.querySelectorAll('.window-header').forEach(header => {
    header.addEventListener('mousedown', function(e) {
        const window = this.parentElement;
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.onmouseup = function() {
            document.onmouseup = null;
            document.onmousemove = null;
        };
        
        document.onmousemove = function(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            window.style.top = (window.offsetTop - pos2) + "px";
            window.style.left = (window.offsetLeft - pos1) + "px";
        };
    });
});

// Googly eyes follow mouse
// Cache eye elements at startup
const leftEye = document.querySelector('.eye:first-child');
const leftPupil = leftEye.querySelector('.pupil');
const rightEye = document.querySelector('.eye:last-child');
const rightPupil = rightEye.querySelector('.pupil');

// Cache eye dimensions and positions
let leftRect, rightRect;
let lastAnimationFrame = 0;

function updateEyePositions(e) {
    // Use requestAnimationFrame for smooth sync
    cancelAnimationFrame(lastAnimationFrame);
    lastAnimationFrame = requestAnimationFrame(() => {
        // Get fresh eye positions
        leftRect = leftEye.getBoundingClientRect();
        rightRect = rightEye.getBoundingClientRect();
        
        // Process left eye
        const leftCenterX = leftRect.left + leftRect.width/2;
        const leftCenterY = leftRect.top + leftRect.height/2;
        const leftDx = e.clientX - leftCenterX;
        const leftDy = e.clientY - leftCenterY;
        const leftAngle = Math.atan2(leftDy, leftDx);
        
        // Process right eye
        const rightCenterX = rightRect.left + rightRect.width/2;
        const rightCenterY = rightRect.top + rightRect.height/2;
        const rightDx = e.clientX - rightCenterX;
        const rightDy = e.clientY - rightCenterY;
        const rightAngle = Math.atan2(rightDy, rightDx);
        
        // Calculate positions (elliptical orbit)
        const leftEdgeX = Math.cos(leftAngle) * (leftRect.width/2 - 6);
        const leftEdgeY = Math.sin(leftAngle) * (leftRect.height/2 - 12);
        const rightEdgeX = Math.cos(rightAngle) * (rightRect.width/2 - 6);
        const rightEdgeY = Math.sin(rightAngle) * (rightRect.height/2 - 12);
        
        // Apply transformations in same frame
        leftPupil.style.transform = `
            translate(${leftEdgeX}px, ${leftEdgeY}px)
        `;
        
        rightPupil.style.transform = `
            translate(${rightEdgeX}px, ${rightEdgeY}px)
        `;
    });
}

// Use pointermove instead of mousemove for better performance
document.addEventListener('pointermove', updateEyePositions);

// Initial positioning
window.addEventListener('load', () => {
    leftRect = leftEye.getBoundingClientRect();
    rightRect = rightEye.getBoundingClientRect();
    
    // Start with eyes looking forward
    leftPupil.style.transform = 'translate(0px, -36px) rotate(0rad)';
    rightPupil.style.transform = 'translate(0px, -36px) rotate(0rad)';
});




// Initialize
window.onload = function() {
    openWindow('main-window');
};

function reduceColorDepth() {
    document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);
        ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
            const color = style.getPropertyValue(prop);
            if (color && color !== 'rgba(0, 0, 0, 0)') {
                const rgb = color.match(/\d+/g);
                if (rgb && rgb.length >= 3) {
                    // Reduce to 16-bit (5-6-5) color depth
                    const r = Math.round(rgb[0]/51) * 51;
                    const g = Math.round(rgb[1]/51) * 51;
                    const b = Math.round(rgb[2]/51) * 51;
                    el.style[prop] = `rgb(${r}, ${g}, ${b})`;
                }
            }
        });
    });
}

window.addEventListener('load', () => {
    reduceColorDepth();
    // Run again after all elements are loaded
    setTimeout(reduceColorDepth, 500);
});

// Dithering patterns (Bayer 4x4 matrix)
const BAYER_MATRIX = [
    [ 1,  9,  3, 11],
    [13,  5, 15,  7],
    [ 4, 12,  2, 10],
    [16,  8, 14,  6]
];

// Convert all gradients to dithered patterns
function ditherGradients() {
    // Find all elements with gradients
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const background = styles.backgroundImage;
        
        if (background.includes('gradient')) {
            // Extract gradient colors
            const matches = background.match(/rgba?\([^)]+\)/g);
            if (matches && matches.length >= 2) {
                const color1 = matches[0];
                const color2 = matches[1];
                
                // Create dithered background
                element.style.backgroundImage = 'none';
                element.style.backgroundColor = color1;
                element.style.position = 'relative';
                element.style.overflow = 'hidden';
                
                // Create dither pattern overlay
                const ditherOverlay = document.createElement('div');
                ditherOverlay.style.position = 'absolute';
                ditherOverlay.style.top = '0';
                ditherOverlay.style.left = '0';
                ditherOverlay.style.width = '100%';
                ditherOverlay.style.height = '100%';
                ditherOverlay.style.background = `
                    repeating-conic-gradient(
                        ${color1} 0% 25%, 
                        ${color2} 0% 50%
                    ) 
                    0 0 / 4px 4px
                `;
                ditherOverlay.style.opacity = '0.5';
                ditherOverlay.style.mixBlendMode = 'overlay';
                
                element.appendChild(ditherOverlay);
            }
        }
    });
}





// Initialize taskbar clock
function initTaskbarClock() {
    const clock = document.getElementById('taskbar-clock');
    const ctx = clock.getContext('2d');
    
    // Set canvas dimensions to match display size
    clock.width = 80;
    clock.height = 80;
    
    // Disable anti-aliasing
    ctx.imageSmoothingEnabled = false;
    
    function drawClock() {
        // Clear canvas
        ctx.clearRect(0, 0, clock.width, clock.height);
        
        // Draw clock face
        ctx.beginPath();
        ctx.arc(40, 40, 35, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw hour marks
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI / 6) - Math.PI / 2;
            const markLength = i % 3 === 0 ? 8 : 5;
            ctx.beginPath();
            ctx.moveTo(
                40 + Math.cos(angle) * 30,
                40 + Math.sin(angle) * 30
            );
            ctx.lineTo(
                40 + Math.cos(angle) * (35 - markLength),
                40 + Math.sin(angle) * (35 - markLength)
            );
            ctx.lineWidth = i % 3 === 0 ? 3 : 2;
            ctx.stroke();
        }
        
        // Get current time
        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        
        // Draw hour hand
        const hourAngle = (hours * 30 + minutes * 0.5) * Math.PI / 180 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(40, 40);
        ctx.lineTo(
            40 + Math.cos(hourAngle) * 20,
            40 + Math.sin(hourAngle) * 20
        );
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Draw minute hand
        const minuteAngle = minutes * 6 * Math.PI / 180 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(40, 40);
        ctx.lineTo(
            40 + Math.cos(minuteAngle) * 30,
            40 + Math.sin(minuteAngle) * 30
        );
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw center dot
        ctx.beginPath();
        ctx.arc(40, 40, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#000000';
        ctx.fill();
    }
    
    // Initial draw and update every minute
    drawClock();
    setInterval(drawClock, 60000);
}

// video contyrols

function videoClose(videoid) {
    var video = document.getElementById(videoid);
    video.pause();
    video.currentTime = 0;   
}

function videoOpen(videoid2) {
    var video2 = document.getElementById(videoid2);
    video2.play();  
}




// boot sequence
window.onload = function() {
    initTaskbarClock();
    openWindow('main-window');
};
