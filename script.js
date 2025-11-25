// Game states
const STATES = {
    INITIAL: 'initial',
    WAITING: 'waiting',
    READY: 'ready',
    RESULT: 'result'
};

// Game variables
let currentState = STATES.INITIAL;
let startTime = 0;
let timeoutId = null;

// DOM elements
const body = document.body;
const message = document.getElementById('message');
const container = document.getElementById('game-container');

// Initialize game
function init() {
    currentState = STATES.INITIAL;
    body.className = 'waiting';
    message.textContent = '點擊螢幕開始';
    clearTimeout(timeoutId);
}

// Start game
function startGame() {
    currentState = STATES.WAITING;
    body.className = 'waiting';
    message.textContent = '等待...';
    
    // Random delay between 1500ms and 3500ms
    const randomDelay = Math.floor(Math.random() * (3500 - 1500 + 1)) + 1500;
    
    timeoutId = setTimeout(() => {
        showGreen();
    }, randomDelay);
}

// Show green screen and start timing
function showGreen() {
    currentState = STATES.READY;
    body.className = 'ready';
    message.textContent = '點擊！';
    startTime = performance.now();
}

// Handle too early click
function handleTooEarly() {
    clearTimeout(timeoutId);
    currentState = STATES.RESULT;
    body.className = 'tooEarly';
    message.textContent = '太早了！請點擊以重新開始';
}

// Calculate and display result
function showResult() {
    const endTime = performance.now();
    const reactionTime = Math.round(endTime - startTime);
    currentState = STATES.RESULT;
    body.className = 'waiting';
    message.textContent = `您的成績是 ${reactionTime} ms\n\n點擊以重新開始`;
}

// Main click handler
function handleClick() {
    switch (currentState) {
        case STATES.INITIAL:
        case STATES.RESULT:
            startGame();
            break;
        
        case STATES.WAITING:
            // Too early click
            handleTooEarly();
            break;
        
        case STATES.READY:
            // Successful click
            showResult();
            break;
    }
}

// Event listener
container.addEventListener('click', handleClick);

// Initialize on load
init();
