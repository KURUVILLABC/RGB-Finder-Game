// JavaScript logic for the RGB Color Guessing Game

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const startBtn = document.getElementById('start-button');
const restartBtn = document.getElementById('restart-button');
const colorCodeSpan = document.getElementById('color-code');
const colorBoxes = Array.from(document.getElementsByClassName('color-box'));
const messageDiv = document.getElementById('message');
const scoreDiv = document.getElementById('score');
const finalScoreDiv = document.getElementById('final-score');
const bestScoreDiv = document.getElementById('best-score');
const soundCorrect = document.getElementById('sound-correct');
const soundWrong = document.getElementById('sound-wrong');
const easyBtn = document.getElementById('easy-btn');
const hardBtn = document.getElementById('hard-btn');

let score = 0;
let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
let bestUniqueScore = localStorage.getItem('bestUniqueScore') ? parseInt(localStorage.getItem('bestUniqueScore')) : 0;
let correctColor = '';
let mode = 'easy';
let roundStartTime = 0;
let totalTime = 0;
let roundTimes = [];

// Chart.js graph instance
let skillChart = null;

const base_points = 100;
const average_time_per_round = 5;
const bonus_per_second = 5;

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function showDifficultyScreen() {
    startScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    difficultyScreen.classList.remove('hidden');
}

function chooseDifficulty(selectedMode) {
    mode = selectedMode;
    difficultyScreen.classList.add('hidden'); // Hide difficulty screen
    gameScreen.classList.remove('hidden');    // Show game screen
    startGame();
}

function startGame() {
    score = 0;
    totalTime = 0;
    roundTimes = [];
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    difficultyScreen.classList.add('hidden'); // Ensure difficulty screen is hidden
    scoreDiv.textContent = '';
    messageDiv.textContent = '';
    nextRound();
}

function nextRound() {
    let colors = [];
    for (let i = 0; i < 6; i++) {
        colors.push(getRandomColor());
    }
    const correctIdx = Math.floor(Math.random() * 6);
    correctColor = colors[correctIdx];
    colorCodeSpan.textContent = correctColor;
    colorBoxes.forEach((box, idx) => {
        box.style.background = colors[idx];
        box.setAttribute('data-color', colors[idx]);
        box.style.borderColor = 'transparent';
        box.style.animation = 'appear 0.5s';
    });
    if (mode === 'hard') {
        roundStartTime = Date.now();
    }
}

function handleColorClick(e) {
    const chosenColor = e.target.getAttribute('data-color');
    if (!chosenColor) return;
    let timeTaken = 0;
    if (mode === 'hard') {
        timeTaken = Math.floor((Date.now() - roundStartTime) / 1000);
        totalTime += timeTaken;
        roundTimes.push(timeTaken);
    }
    if (chosenColor === correctColor) {
        soundCorrect.currentTime = 0;
        soundCorrect.play();
        score++;
        if (mode === 'hard') {
            scoreDiv.textContent = `Score: ${score} | Time: ${totalTime}s`;
        } else {
            scoreDiv.textContent = `Score: ${score}`;
        }
        messageDiv.textContent = mode === 'hard'
            ? `🎉 Correct! (${timeTaken}s)`
            : '🎉 Correct! Next round...';
        messageDiv.style.color = '#00ffae';
        e.target.style.borderColor = '#00ffae';
        setTimeout(() => {
            messageDiv.textContent = '';
            nextRound();
        }, 900);
    } else {
        soundWrong.currentTime = 0;
        soundWrong.play();
        messageDiv.textContent = '❌ Wrong! Game Over.';
        messageDiv.style.color = '#ff3b3b';
        e.target.style.borderColor = '#ff3b3b';
        setTimeout(() => {
            endGame();
        }, 900);
    }
}

function endGame() {
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    const skillChartCanvas = document.getElementById('skillChart');
    const scoreMainDiv = document.getElementById('score-main');
    const scoreBestDiv = document.getElementById('score-best');
    const scoreDetailsDiv = document.getElementById('score-details');

    if (mode === 'hard') {
        skillChartCanvas.style.display = 'block';
        let expected_time = score * average_time_per_round;
        let time_diff = expected_time - totalTime;
        let uniqueScore = score * base_points + time_diff * bonus_per_second;
        if (uniqueScore < 0) uniqueScore = 0;
        uniqueScore = Math.floor(uniqueScore / 10);

        // Update best unique score
        if (uniqueScore > bestUniqueScore) {
            bestUniqueScore = uniqueScore;
            localStorage.setItem('bestUniqueScore', bestUniqueScore);
        }

        scoreMainDiv.textContent = `Score: ${uniqueScore}`;
        scoreBestDiv.textContent = `Best Score: ${bestUniqueScore}`;
        scoreDetailsDiv.innerHTML = `
            <span>Rounds Completed: ${score}</span> &nbsp;|&nbsp;
            <span>Total Time: ${totalTime}s</span>
        `;

        // Draw skill graph
        setTimeout(() => {
            const ctx = skillChartCanvas.getContext('2d');
            if (skillChart) skillChart.destroy();
            skillChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: roundTimes.map((_, i) => `Round ${i + 1}`),
                    datasets: [{
                        label: 'Time Taken (s)',
                        data: roundTimes,
                        backgroundColor: 'rgba(0,195,255,0.2)',
                        borderColor: '#00c3ff',
                        borderWidth: 3,
                        pointBackgroundColor: '#ffff1c',
                        pointRadius: 6,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true }
                    },
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'Your Color Choosing Skill (Time per Round)'
                        }
                    }
                }
            });
        }, 300);
    } else {
        skillChartCanvas.style.display = 'none';
        scoreMainDiv.textContent = `Practice Complete!`;
        scoreBestDiv.textContent = '';
        scoreDetailsDiv.innerHTML = `
            <span>Rounds Completed: ${score}</span> &nbsp;|&nbsp;
            <span>Total Time: ${totalTime}s</span>
        `;
    }
}

startBtn.addEventListener('click', showDifficultyScreen);
easyBtn.addEventListener('click', () => chooseDifficulty('easy'));
hardBtn.addEventListener('click', () => chooseDifficulty('hard'));
restartBtn.addEventListener('click', () => {
    showDifficultyScreen();
});
colorBoxes.forEach(box => box.addEventListener('click', handleColorClick));

window.onload = () => {
    startScreen.classList.remove('hidden');
    difficultyScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
};

document.addEventListener('DOMContentLoaded', function () {
    const aboutContainer = document.querySelector('.about-icon-container');
    const tooltip = aboutContainer.querySelector('.about-tooltip');
    let hideTimeout;

    aboutContainer.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
    });

    aboutContainer.addEventListener('mouseleave', () => {
        hideTimeout = setTimeout(() => {
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '0';
        }, 2000);
    });

    tooltip.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
    });

    tooltip.addEventListener('mouseleave', () => {
        hideTimeout = setTimeout(() => {
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '0';
        }, 500);
    });
});