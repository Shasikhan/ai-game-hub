const holes = document.querySelectorAll('.hole');
const moles = document.querySelectorAll('.mole');
const scoreBoard = document.querySelector('#score');
const highScoreBoard = document.querySelector('#highScore');
const timeLeft = document.querySelector('#time');
const startButton = document.querySelector('#startGame');
const stopButton = document.querySelector('#stopGame');
const soundToggle = document.querySelector('#soundToggle');

// Modal elements
const gameOverModal = document.querySelector('#gameOverModal');
const difficultyModal = document.querySelector('#difficultyModal');
const finalScore = document.querySelector('#finalScore');
const highScoreText = document.querySelector('.high-score-text');
const playAgainButton = document.querySelector('#playAgain');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

let lastHole;
let timeUp = false;
let score = 0;
let gameTimer;
let highScore = localStorage.getItem('whackAMoleHighScore') || 0;
let currentDifficulty = localStorage.getItem('whackAMoleDifficulty') || 'medium';
highScoreBoard.textContent = highScore;

// Audio Context
let audioContext;

const difficulties = {
    easy: { minTime: 1000, maxTime: 1500 },
    medium: { minTime: 500, maxTime: 1000 },
    hard: { minTime: 200, maxTime: 800 }
};

// Sound generation functions
function createAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function generateWhackSound() {
    const context = createAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(500, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, context.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
}

function generateGameStartSound() {
    const context = createAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(262, context.currentTime); // C4
    oscillator.frequency.setValueAtTime(330, context.currentTime + 0.1); // E4
    oscillator.frequency.setValueAtTime(392, context.currentTime + 0.2); // G4
    
    gainNode.gain.setValueAtTime(0.5, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.3);
}

function generateGameOverSound() {
    const context = createAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(392, context.currentTime); // G4
    oscillator.frequency.setValueAtTime(349.23, context.currentTime + 0.1); // F4
    oscillator.frequency.setValueAtTime(330, context.currentTime + 0.2); // E4
    oscillator.frequency.setValueAtTime(262, context.currentTime + 0.3); // C4
    
    gainNode.gain.setValueAtTime(0.5, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.4);
}

function playSound(soundFunction) {
    if (soundToggle.checked) {
        soundFunction();
    }
}

function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHole) {
        return randomHole(holes);
    }
    lastHole = hole;
    return hole;
}

function peep() {
    const difficulty = difficulties[currentDifficulty];
    const time = randomTime(difficulty.minTime, difficulty.maxTime);
    const hole = randomHole(holes);
    hole.classList.add('up');
    
    setTimeout(() => {
        hole.classList.remove('up');
        if (!timeUp) peep();
    }, time);
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('whackAMoleHighScore', highScore);
        highScoreBoard.textContent = highScore;
        return true;
    }
    return false;
}

function showDifficultyModal() {
    difficultyModal.classList.add('show');
    
    // Update selected button
    difficultyButtons.forEach(btn => {
        if (btn.dataset.difficulty === currentDifficulty) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function hideDifficultyModal() {
    difficultyModal.classList.remove('show');
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    localStorage.setItem('whackAMoleDifficulty', difficulty);
    hideDifficultyModal();
}

// Initialize difficulty buttons
difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const difficulty = btn.dataset.difficulty;
        setDifficulty(difficulty);
        playSound(generateGameStartSound);
        
        // Visual feedback
        difficultyButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        // Auto-start game after selecting difficulty
        setTimeout(() => {
            hideDifficultyModal();
            startGame(false); // Pass false to prevent playing sound again
        }, 300);
    });
});

function startGame(playStartSound = true) {
    // Initialize audio context on first user interaction
    createAudioContext();
    if (playStartSound) {
        playSound(generateGameStartSound);
    }
    
    scoreBoard.textContent = 0;
    timeUp = false;
    score = 0;
    timeLeft.textContent = 30;
    peep();
    startButton.classList.add('hidden');
    stopButton.classList.remove('hidden');
    
    gameTimer = setInterval(() => {
        const currentTime = parseInt(timeLeft.textContent) - 1;
        timeLeft.textContent = currentTime;
        if (currentTime <= 0) {
            endGame();
        }
    }, 1000);
    
    setTimeout(endGame, 30000);
}

function endGame() {
    timeUp = true;
    clearInterval(gameTimer);
    startButton.classList.remove('hidden');
    stopButton.classList.add('hidden');
    
    const isNewHighScore = score > highScore;
    if (isNewHighScore) {
        highScore = score;
        localStorage.setItem('whackAMoleHighScore', highScore);
    }
    showGameOverModal(isNewHighScore);
}

// Add stop button functionality
stopButton.addEventListener('click', () => {
    endGame();
    holes.forEach(hole => hole.classList.remove('up'));
});

function showGameOverModal(isNewHighScore) {
    finalScore.textContent = score;
    highScoreText.textContent = isNewHighScore 
        ? ` New High Score! ` 
        : `High Score: ${highScore}`;
    
    gameOverModal.classList.add('show');
    
    // Add event listener for play again button
    playAgainButton.addEventListener('click', () => {
        gameOverModal.classList.remove('show');
        startGame();
    }, { once: true }); // Remove listener after use
    
    // Add keyboard listener for Enter key
    const keyHandler = (e) => {
        if (e.code === 'Enter') {
            gameOverModal.classList.remove('show');
            startGame();
            document.removeEventListener('keydown', keyHandler);
        }
    };
    document.addEventListener('keydown', keyHandler);
}

function hideGameOverModal() {
    gameOverModal.classList.remove('show');
}

function whack(e) {
    if (!e.isTrusted) return;
    if (!this.parentNode.classList.contains('up')) return;
    
    playSound(generateWhackSound);
    score++;
    this.parentNode.classList.remove('up');
    scoreBoard.textContent = score;
    this.classList.add('whacked');
    setTimeout(() => this.classList.remove('whacked'), 300);
}

// Add event listeners
moles.forEach(mole => mole.addEventListener('click', whack));
startButton.addEventListener('click', showDifficultyModal);

// Add keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !startButton.disabled) {
        showDifficultyModal();
    }
});
