// Game states
const STATES = {
    INITIAL: 'initial',
    WAITING: 'waiting',
    READY: 'ready',
    RESULT: 'result'
};

// Storage key
const STORAGE_KEY = 'rtt_scores';

// Game variables
let currentState = STATES.INITIAL;
let startTime = 0;
let timeoutId = null;
let scores = [];

// DOM elements
const body = document.body;
const message = document.getElementById('message');
const container = document.getElementById('game-container');
const bestScoreElement = document.getElementById('best-score');
const avgScoreElement = document.getElementById('avg-score');
const historyList = document.getElementById('history-list');

// ============ LocalStorage Functions ============

// Load scores from LocalStorage
function loadScores() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Validate that it's an array
            if (Array.isArray(parsed)) {
                return parsed.filter(score => typeof score === 'number' && score > 0);
            }
        }
    } catch (error) {
        console.error('Error loading scores:', error);
    }
    return [];
}

// Save score to LocalStorage
function saveScore(score) {
    try {
        // Validate score
        if (typeof score !== 'number' || score <= 0) {
            console.error('Invalid score:', score);
            return;
        }

        // Add to scores array
        scores.push(score);

        // Save to LocalStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

// ============ Statistics Functions ============

// Get best score (minimum)
function getBestScore(scoreArray) {
    if (!scoreArray || scoreArray.length === 0) return null;
    return Math.min(...scoreArray);
}

// Get average score
function getAverageScore(scoreArray) {
    if (!scoreArray || scoreArray.length === 0) return null;
    const sum = scoreArray.reduce((a, b) => a + b, 0);
    return Math.round(sum / scoreArray.length);
}

// ============ UI Update Functions ============

// Update statistics display
function updateStatistics() {
    const best = getBestScore(scores);
    const avg = getAverageScore(scores);

    if (bestScoreElement) {
        bestScoreElement.textContent = best !== null ? `${best} ms` : '--';
    }

    if (avgScoreElement) {
        avgScoreElement.textContent = avg !== null ? `${avg} ms` : '--';
    }
}

// Update history display (last 5 scores)
function updateHistory() {
    if (!historyList) return;

    // Clear current list
    historyList.innerHTML = '';

    if (scores.length === 0) {
        const noDataItem = document.createElement('li');
        noDataItem.className = 'no-data';
        noDataItem.textContent = '尚無紀錄';
        historyList.appendChild(noDataItem);
        return;
    }

    // Get last 5 scores (most recent first)
    const recentScores = scores.slice(-5).reverse();

    recentScores.forEach((score, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'score-item';
        if (index === 0) {
            listItem.classList.add('latest');
        }
        listItem.textContent = `${score} ms`;
        historyList.appendChild(listItem);
    });
}

// ============ Game Functions ============

// Initialize game
function init() {
    currentState = STATES.INITIAL;
    body.className = 'waiting';
    message.textContent = '點擊螢幕開始';
    clearTimeout(timeoutId);

    // Load scores and update UI
    scores = loadScores();
    updateStatistics();
    updateHistory();
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

    // Save score and update UI
    saveScore(reactionTime);
    updateStatistics();
    updateHistory();
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

// Event listener - full screen click handling
body.addEventListener('click', handleClick);

// Initialize on load
init();

