// Initialize variables
let score = 0;
let timer;
let gameRunning = false;
let totalAttempts = 0;
let startTime;
let matchedPairs = 0;
let wordList = [];

// Theme toggle functionality
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Load saved theme from localStorage
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.classList.add(savedTheme);
    themeToggleButton.textContent = savedTheme === 'dark-theme' ? 'Switch to Light Theme' : 'Switch to Dark Theme';
}

// Toggle theme and update button text
themeToggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    const isDarkTheme = body.classList.contains('dark-theme');
    themeToggleButton.textContent = isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme';

    // Save the theme preference to localStorage
    localStorage.setItem('theme', isDarkTheme ? 'dark-theme' : 'light-theme');
});

// Generate the matching game
document.getElementById('generate-game').addEventListener('click', () => {
    if (gameRunning) return; // Prevents multiple game starts
    gameRunning = true;
    startTime = new Date(); // Record the start time
    totalAttempts = 0;
    score = 0;
    matchedPairs = 0;
    wordList = [];

    const englishText = document.getElementById('english-words').value.trim();
    const koreanText = document.getElementById('korean-words').value.trim();

    // Split the input into arrays of words
    const englishWords = englishText.split('\n').map(word => word.trim()).filter(word => word);
    const koreanWords = koreanText.split('\n').map(word => word.trim()).filter(word => word);

    // Validate input
    if (englishWords.length !== koreanWords.length) {
        alert('The number of words in both columns must match!');
        gameRunning = false;
        return;
    } else if (englishWords.length > 100) {
        alert('Please enter up to 100 words only.');
        gameRunning = false;
        return;
    }

    // Hide input areas and show game area
    document.getElementById('input-area').style.display = 'none';
    document.getElementById('game-area').style.display = 'block';
    document.getElementById('score').textContent = `Score: 0`;

    const column1 = document.getElementById('column1');
    const column2 = document.getElementById('column2');
    column1.innerHTML = '';
    column2.innerHTML = '';

    // Create lists of word pairs
    for (let i = 0; i < englishWords.length; i++) {
        wordList.push({ word1: englishWords[i], word2: koreanWords[i], matched: false });
    }

    // Shuffle the second column for the game
    const shuffledList = [...wordList].sort(() => 0.5 - Math.random());

    // Populate the first column with English words
    wordList.forEach(pair => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';
        wordDiv.textContent = pair.word1;
        wordDiv.setAttribute('data-word', pair.word1);
        column1.appendChild(wordDiv);
    });

    // Populate the second column with Korean words for drag-and-drop
    shuffledList.forEach(pair => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';
        wordDiv.textContent = pair.word2;
        wordDiv.setAttribute('draggable', true);
        wordDiv.setAttribute('data-word', pair.word1);
        wordDiv.addEventListener('dragstart', drag);
        column2.appendChild(wordDiv);
    });

    // Start the game timer (e.g., 5 minutes)
    startTimer(300);
});

// Drag-and-drop functions
function drag(event) {
    event.dataTransfer.setData('text', event.target.getAttribute('data-word'));
}

document.querySelectorAll('.column').forEach(column => {
    column.addEventListener('dragover', (event) => {
        event.preventDefault();
    });
    column.addEventListener('drop', (event) => {
        event.preventDefault();

        const word = event.dataTransfer.getData('text');
        const targetWordElement = event.target;
        const targetColumn = targetWordElement.closest('.column');

        // Check if the drop target is in the first column
        if (targetColumn && targetColumn.id === 'column1') {
            const targetWord = targetWordElement.getAttribute('data-word');

            // Find the word pair in the wordList
            const pair = wordList.find(pair => pair.word1 === targetWord);

            // Check if the match is correct and not already matched
            if (pair && pair.word1 === word && !pair.matched) {
                targetWordElement.classList.add('correct');
                targetWordElement.style.backgroundColor = 'var(--correct-bg-color)';
                pair.matched = true;
                matchedPairs++;
                score += 10;
                document.getElementById('score').textContent = `Score: ${score}`;

                // Check if all pairs are matched
                if (matchedPairs === wordList.length) {
                    endGame(true); // Trigger win condition
                }
            } else if (pair && !pair.matched) {
                targetWordElement.style.backgroundColor = 'var(--incorrect-bg-color)';
            }
        } else {
            // If not a valid drop target, display an error
            alert('Please drop the word onto the correct column!');
        }
    });
});

// Timer function
function startTimer(duration) {
    let timeLeft = duration;
    document.getElementById('timer-display').style.display = 'block';
    updateTimerDisplay(timeLeft);

    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame(false); // End game due to time running out
        }
    }, 1000);
}

// Update timer display function
function updateTimerDisplay(timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    document.getElementById('time-left').textContent = formattedTime;
}

// End the game
function endGame(won) {
    gameRunning = false;
    clearInterval(timer);
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('timer-display').style.display = 'none';
    document.getElementById('game-over').style.display = 'block';

    const finalMessage = document.getElementById('final-message');
    finalMessage.textContent = won ? 'YOU WIN' : 'GAME OVER';

    // Calculate and display the correct percentage
    const correctPercentage = ((score / 10) / wordList.length) * 100;
    document.getElementById('correct-percentage').textContent = correctPercentage.toFixed(2);

    // Display the time taken in minutes:seconds format
    const endTime = new Date();
    const timeTakenInSeconds = Math.round((endTime - startTime) / 1000);
    const minutes = Math.floor(timeTakenInSeconds / 60);
    const seconds = timeTakenInSeconds % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    document.getElementById('time-taken').textContent = `Time taken: ${formattedTime}`;

    // Display final score
    document.getElementById('final-score').textContent = score;
}

// Reset the game for a new round
function resetGame() {
    gameRunning = false;
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('input-area').style.display = 'block';
    document.getElementById('score').textContent = 'Score: 0';
    document.querySelectorAll('.word').forEach(word => word.style.backgroundColor = '');
    score = 0;
    totalAttempts = 0;
    matchedPairs = 0;
    wordList = [];
}