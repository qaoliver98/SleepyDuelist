// Initialize variables
let score = 0;
let questionCount = 0;
let lives = 3;
let currentDifficulty = 'easy'; // Default difficulty
let lastScore = null; // Track the last score
let isProcessing = false; // Global variable to track processing state

// Function to show/hide the header menu button
function toggleHeaderMenuButton(show) {
    const headerMenuBtn = document.getElementById('headerMenuBtn');
    if (headerMenuBtn) {
        headerMenuBtn.style.display = show ? 'inline-block' : 'none';
    }
}

// Add event listener for the header menu button
function initializeHeaderMenuButton() {
    const headerMenuBtn = document.getElementById('headerMenuBtn');
    if (headerMenuBtn) {
        headerMenuBtn.addEventListener('click', function() {
            showNotification('Returning to menu...', 'success');
            setTimeout(() => {
                location.reload();
            }, 500);
        });
    }
}

// Get notification element
const notification = document.getElementById('notification');

// Function to show notification
function showNotification(message, isSuccess) {
    notification.textContent = message;
    notification.className = 'notification ' + (isSuccess ? 'success' : 'error');
    notification.classList.add('show');
    
    // Hide notification after 1.5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 1500);
}

// Game over function
function showGameOver() {
    const finalScore = score;
    document.getElementById('finalScoreDisplay').textContent = `Your final score: ${finalScore}`;
    document.getElementById('difficultyPlayed').textContent = `Difficulty: ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}`;
    document.getElementById('gameOverOverlay').classList.add('show');
    
    // Save the last score
    lastScore = {
        score: finalScore,
        totalQuestions: questionCount - 1,
        difficulty: currentDifficulty
    };
    
    // Add event listeners for game over buttons after showing overlay
    setTimeout(() => {
        const playAgainButton = document.getElementById('playAgainButton');
        const shareScoreButton = document.getElementById('shareScoreButton');
        
        if (playAgainButton) {
            addClickListener(playAgainButton, () => {
                document.getElementById('gameOverOverlay').classList.remove('show');
                navigateTo('home');
            });
        }
        
        if (shareScoreButton) {
            addClickListener(shareScoreButton, () => {
                const shareableText = generateShareableScore();
                
                // Copy to clipboard
                navigator.clipboard.writeText(shareableText)
                    .then(() => {
                        showCopyNotification();
                    })
                    .catch(err => {
                        console.error('Could not copy text: ', err);
                        
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = shareableText;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-999999px';
                        textArea.style.top = '-999999px';
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        
                        try {
                            document.execCommand('copy');
                            showCopyNotification();
                        } catch (err) {
                            alert('Failed to copy to clipboard. Please try again.');
                        }
                        
                        document.body.removeChild(textArea);
                    });
            });
        }
    }, 100);
}

// Function to get a random card from a list
function getRandomCard(cardList) {
    const randomIndex = Math.floor(Math.random() * cardList.length);
    return cardList[randomIndex];
}

// Function to get random unique cards
function getRandomUniqueCards(cardList, count) {
    const cards = [];
    const usedIndices = new Set();
    
    while (cards.length < count) {
        const randomIndex = Math.floor(Math.random() * cardList.length);
        if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            cards.push(cardList[randomIndex]);
        }
    }
    
    return cards;
}

// Function to generate lives HTML
function generateLivesHTML() {
    toggleHeaderMenuButton(true);
    let livesHTML = '';
    for (let i = 0; i < lives; i++) {
        livesHTML += '<span class="life">❤️</span>';
    }
    return livesHTML;
}

// Function to create the selection page based on difficulty
function createSelectionPage() {
    questionCount++;
    
    let selectionBoxesHTML = '';
    let realCardsToShow = 1; // Number of real cards to show
    let optionsCount; // Total number of options
    
    // Set options based on difficulty
    switch (currentDifficulty) {
        case 'easy':
            optionsCount = 2; // 1 is real, 1 is fake
            break;
        case 'medium':
            optionsCount = 3; // 1 is real, 2 are fake
            break;
        case 'hard':
            optionsCount = 5; // 1 is real, 4 are fake
            break;
        default:
            optionsCount = 2;
    }
    
    // Get random real card(s) - using the imported yugiohCards from external file
    const selectedRealCards = getRandomUniqueCards(yugiohCards, realCardsToShow);
    
    // Get random fake cards - using the imported fakeYugiohCards from external file
    const selectedFakeCards = getRandomUniqueCards(fakeYugiohCards, optionsCount - realCardsToShow);
    
    // Combine all cards and shuffle
    const allCards = [...selectedRealCards, ...selectedFakeCards];
    for (let i = allCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    
    // Create HTML for each card option
    allCards.forEach((card, index) => {
        const isRealCard = selectedRealCards.includes(card);
        selectionBoxesHTML += `
            <div class="selection-box" id="option${index + 1}" data-is-real="${isRealCard}">
                <p>${card}</p>
            </div>
        `;
    });
    
    // Create mobile-friendly controls container
    const controlsHTML = window.innerWidth <= 768 ? 
        `<div class="mobile-controls-container">
            <button class="menu-btn" id="menuButton">Menu</button>
            <div class="score-display">Score: ${score}</div>
            <div class="difficulty-display">Difficulty: ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}</div>
        </div>` :
        `<div class="score-display">Score: ${score}</div>
        <div class="difficulty-display">Difficulty: ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}</div>
        <button class="menu-btn" id="menuButton">Menu</button>`;
    
    return `
        ${controlsHTML}
        <div class="game-content">
            <div class="selection-container">
                ${selectionBoxesHTML}
            </div>
            <div class="lives-container">
                ${generateLivesHTML()}
            </div>
        </div>
    `;
}

// Store base page content
const pages = {
    home: function() {
        let lastScoreHTML = '';
        
        // Add last score section if there's a previous score
        if (lastScore) {
            lastScoreHTML = `
                <div class="last-score" style="display: block;">
                    Your last score: ${lastScore.score}
                    (Difficulty: ${lastScore.difficulty.charAt(0).toUpperCase() + lastScore.difficulty.slice(1)})
                </div>
            `;
        }
        
        return `
            <div class="home-container">
                <h2 class="home-title">Real or Fake: Yu-Gi-Oh! Quiz</h2>
                    
                    <div class="gif-container">
                        <img src="https://i.imgur.com/a6uqaY7.gif" alt="Yu-Gi-Oh Card Animation" class="game-gif">
                    </div>
                <br>
                <p style="margin-bottom: 1.5rem; font-size: 1.2rem;">Test your knowledge by identifying real Yu-Gi-Oh! cards! Click on the box with the card's name that you think is real. Good luck!</p>
                
                ${lastScoreHTML}
                
                <div>
                    <p style="margin-bottom: 1rem; font-size: 1.1rem; font-weight: bold;">Select Difficulty:</p>
                    <div class="difficulty-container" style="display: flex; gap: 0.5rem; justify-content: center; margin: 0 auto;">
                        <button id="easyBtn" class="difficulty-btn active">Easy</button>
                        <button id="mediumBtn" class="difficulty-btn">Medium</button>
                        <button id="hardBtn" class="difficulty-btn">Hard</button>
                    </div>
                </div>
                
                <div style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                    <p><strong>Easy:</strong> 2 Options (1 Correct Card)</p>
                    <p><strong>Medium:</strong> 3 Options (1 Correct Card)</p>
                    <p><strong>Hard:</strong> 5 Options (1 Correct Card)</p>
                </div>
                
                <button id="beginButton" class="begin-btn" style="margin-top: 2rem;">Begin</button>
            </div>
        `;
    },
    selection: createSelectionPage
};

// Enhanced function to set mobile viewport height with iOS fixes
function setMobileViewportHeight() {
    // First we get the viewport height and multiply it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // iOS-specific viewport adjustments
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
        // Adjust for iOS safe areas
        document.body.style.paddingTop = 'env(safe-area-inset-top)';
        document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
        
        // Ensure the content is properly positioned
        const mainContent = document.getElementById('pageContent');
        if (mainContent) {
            mainContent.style.minHeight = 'calc(var(--vh, 1vh) * 100 - env(safe-area-inset-top) - env(safe-area-inset-bottom))';
        }
    }
    
    // Check if the content fits within the viewport
    const mainContent = document.getElementById('pageContent');
    if (mainContent) {
        // If we're on the selection page
        const selectionContainer = document.querySelector('.selection-container');
        if (selectionContainer) {
            // Adjust sizes dynamically based on the number of options and screen height
            const options = document.querySelectorAll('.selection-box');
            if (options.length > 0) {
                // If we have too many options and screen is small, reduce padding even more
                if (options.length >= 4 && window.innerHeight < 700) {
                    options.forEach(option => {
                        option.style.padding = '0.8rem 0.6rem';
                        option.style.minHeight = '40px';
                    });
                }
                // If we have 5 options (hard mode) on a very small screen
                if (options.length === 5 && window.innerHeight < 600) {
                    options.forEach(option => {
                        option.style.padding = '0.6rem 0.4rem';
                        option.style.minHeight = '35px';
                        option.querySelector('p').style.fontSize = '0.9rem';
                    });
                }
            }
        }
    }
}

// Simplified click handler that doesn't clone elements
function addClickListener(element, callback) {
    // Remove existing event listeners by replacing the element
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    
    // Add click event
    newElement.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        callback();
    });
    
    // Add touch event for mobile
    newElement.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        callback();
    });
    
    // Add visual feedback for touch
    newElement.addEventListener('touchstart', function(e) {
        e.preventDefault();
        this.style.opacity = '0.7';
        this.style.transform = 'scale(0.98)';
    }, { passive: false });
    
    newElement.addEventListener('touchend', function(e) {
        setTimeout(() => {
            this.style.opacity = '';
            this.style.transform = '';
        }, 100);
    });
    
    return newElement;
}

// Function to navigate between pages
function navigateTo(page) {
    // Reset processing state when navigating to any page
    isProcessing = false;
    
    const pageContent = document.getElementById('pageContent');
    
    // Update selection page content with new cards if needed
    if (page === 'selection') {
        pageContent.innerHTML = createSelectionPage();
    } else if (page === 'home') {
        // Use the function to get dynamic home content with last score
        pageContent.innerHTML = pages.home();
    }
    
    // Add event listeners after page content is loaded
    if (page === 'home') {
        // Add event listeners for difficulty buttons
        const easyBtn = document.getElementById('easyBtn');
        const mediumBtn = document.getElementById('mediumBtn');
        const hardBtn = document.getElementById('hardBtn');
        const beginBtn = document.getElementById('beginButton');
        
        if (easyBtn) {
            addClickListener(easyBtn, () => setDifficulty('easy'));
        }
        if (mediumBtn) {
            addClickListener(mediumBtn, () => setDifficulty('medium'));
        }
        if (hardBtn) {
            addClickListener(hardBtn, () => setDifficulty('hard'));
        }
        if (beginBtn) {
            addClickListener(beginBtn, () => {
                // Reset score when starting a new game
                score = 0;
                questionCount = 0;
                lives = 3;
                isProcessing = false; // Ensure processing state is reset
                navigateTo('selection');
            });
        }
        
    } else if (page === 'selection') {
        // Add click event for menu button
        const menuButton = document.getElementById('menuButton');
        if (menuButton) {
            addClickListener(menuButton, () => {
                showNotification('Returning to menu...', 'success');
                setTimeout(() => {
                    navigateTo('home');
                }, 500);
            });
        }
        
        // Add click events for all option boxes
        const options = document.querySelectorAll('.selection-box');
        
        // Function to handle option box clicks
        function handleOptionClick(clickedOption) {
            // Prevent multiple clicks while processing an answer
            if (isProcessing) {
                console.log('Already processing, ignoring click');
                return;
            }
            
            // Set flag to prevent further clicks
            isProcessing = true;
            console.log('Processing answer...');
            
            // Get fresh list of all options (in case DOM changed)
            const allOptions = document.querySelectorAll('.selection-box');
            
            // Disable all option boxes visually
            allOptions.forEach(opt => {
                opt.style.pointerEvents = 'none';
                opt.style.opacity = '0.7';
            });
            
            const isRealCard = clickedOption.getAttribute('data-is-real') === 'true';
            
            if (isRealCard) {
                // If correct
                score++;
                clickedOption.style.backgroundColor = '#9ee2a2'; // Green background
                clickedOption.style.borderColor = '#2e6934'; // Dark green border
                showNotification('Correct! That is a real card!', true);
            } else {
                // If incorrect
                lives--;
                clickedOption.style.backgroundColor = '#ffb7c5'; // Pink background
                clickedOption.style.borderColor = '#993344'; // Dark pink border
                
                // Find and highlight the correct answer
                allOptions.forEach(opt => {
                    if (opt.getAttribute('data-is-real') === 'true') {
                        opt.style.backgroundColor = '#9ee2a2'; // Green background
                        opt.style.borderColor = '#2e6934'; // Dark green border
                        
                        // Add a "Real Card" label
                        const realCardLabel = document.createElement('div');
                        realCardLabel.textContent = '✓ Real Card';
                        realCardLabel.style.color = '#2e6934';
                        realCardLabel.style.fontWeight = 'bold';
                        realCardLabel.style.marginTop = '10px';
                        opt.appendChild(realCardLabel);
                    }
                });
                
                showNotification('Incorrect! That is NOT a real card!', false);
                
                // Check if out of lives
                if (lives <= 0) {
                    showGameOver();
                    toggleHeaderMenuButton(false);
                    return;
                }
            }
            
            // Longer delay before loading new question to allow player to see the correct answer
            setTimeout(() => {
                console.log('Loading new question...');
                navigateTo('selection'); // Load new cards - this will reset isProcessing
            }, 1800);
        }
    
        // Add click event listeners to all option boxes
        options.forEach((option, index) => {
            // Use a direct event listener approach to avoid complexity
            option.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Option ${index + 1} clicked`);
                handleOptionClick(this);
            });
            
            // Add touch event for mobile
            option.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Option ${index + 1} touched`);
                handleOptionClick(this);
            });
            
            // Add visual feedback for touch
            option.addEventListener('touchstart', function(e) {
                e.preventDefault();
                if (!isProcessing) {
                    this.style.transform = 'scale(0.98)';
                    this.style.opacity = '0.8';
                }
            }, { passive: false });
            
            // Reset visual feedback
            option.addEventListener('touchend', function(e) {
                setTimeout(() => {
                    this.style.transform = '';
                    this.style.opacity = '';
                }, 100);
            });
            
            // Ensure touch targets are properly sized
            option.style.minHeight = '50px';
            option.style.touchAction = 'manipulation';
            option.style.webkitTapHighlightColor = 'transparent';
        });
    }
    
    // Then adjust viewport heights after content is loaded
    setTimeout(setMobileViewportHeight, 50);
    
    // Additional mobile optimizations for specific pages
    if (page === 'selection') {
        // Ensure we're at the top of the page when navigating to a new question
        window.scrollTo(0, 0);
        
        // Add specific optimizations for the option boxes on smaller screens
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            // Fix iOS momentum scrolling issues in the game content area
            const gameContent = document.querySelector('.game-content');
            if (gameContent) {
                gameContent.style.webkitOverflowScrolling = 'touch';
            }
        }
    } else if (page === 'home') {
        // Home page specific mobile optimizations
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            // Ensure buttons are properly sized for touch
            const difficultyBtns = document.querySelectorAll('.difficulty-btn');
            difficultyBtns.forEach(btn => {
                btn.style.minWidth = '80px';
                btn.style.minHeight = '44px';
                btn.style.touchAction = 'manipulation';
            });
            
            // Make sure the begin button is prominent and easily tappable
            const beginBtn = document.getElementById('beginButton');
            if (beginBtn) {
                beginBtn.style.minHeight = '50px';
                beginBtn.style.minWidth = '200px';
                beginBtn.style.touchAction = 'manipulation';
            }
        }
    }
    
    // Handle game over overlay positioning for mobile
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    if (gameOverOverlay) {
        // Use the custom vh variable for better mobile positioning
        gameOverOverlay.style.height = 'calc(var(--vh, 1vh) * 100)';
    }
}

// Enhanced iOS fix function
function fixIOSIssues() {
    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        // Add iOS-specific class to body
        document.body.classList.add('ios-device');
        
        // Fix for double-tap zoom on buttons
        const allButtons = document.querySelectorAll('button, .selection-box, .header-btn');
        allButtons.forEach(button => {
            button.style.touchAction = 'manipulation';
            button.style.webkitTapHighlightColor = 'transparent';
        });
        
        // Fix iOS scrolling issues
        document.body.style.webkitOverflowScrolling = 'touch';
    }
}

// Function to generate shareable score text
function generateShareableScore() {
    const finalScore = score;
    const totalQuestions = questionCount;
    const difficultyText = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    
    // Choose emoji based on difficulty
    let difficultyEmoji;
    switch(currentDifficulty) {
        case 'easy':
            difficultyEmoji = '🟢'; // Green circle for easy
            break;
        case 'medium':
            difficultyEmoji = '🟡'; // Yellow circle for medium
            break;
        case 'hard':
            difficultyEmoji = '🔴'; // Red circle for hard
            break;
        default:
            difficultyEmoji = '⚪'; // White circle for default
    }
    
    // Generate emoji pattern based on score
    let emojiPattern = '';
    if (finalScore >= 90) {
        emojiPattern = '⭐⭐⭐⭐⭐';
    } else if (finalScore >= 50) {
        emojiPattern = '⭐⭐⭐⭐';
    } else if (finalScore >= 30) {
        emojiPattern = '⭐⭐⭐';
    } else if (finalScore >= 10) {
        emojiPattern = '⭐⭐';
    } else {
        emojiPattern = '⭐';
    }
    
    // Create shareable text
    const shareText = `Sleepy Duelist Quiz ${difficultyEmoji}\nScore: ${finalScore}\n${emojiPattern}\nPlay at: sleepyduelist.xyz`;
    
    return shareText;
}

// Enhanced feedback for copy notification
function showCopyNotification() {
    // Create if it doesn't exist
    let copyNotification = document.getElementById('copyNotification');
    if (!copyNotification) {
        copyNotification = document.createElement('div');
        copyNotification.id = 'copyNotification';
        copyNotification.className = 'copy-notification';
        copyNotification.textContent = 'Score copied to clipboard!';
        document.body.appendChild(copyNotification);
    }
    
    // Show notification with enhanced animation
    copyNotification.classList.add('show');
    copyNotification.style.animation = 'none'; // Reset animation
    setTimeout(() => {
        copyNotification.style.animation = 'copyFadeIn 0.3s ease-in-out';
    }, 10);
    
    // Hide after delay
    setTimeout(() => {
        copyNotification.style.animation = 'copyFadeOut 0.3s ease-in-out';
        setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 300);
    }, 2000);
}

// Function to set difficulty
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // Update active button styling
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetBtn = document.getElementById(`${difficulty}Btn`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the header menu button
    initializeHeaderMenuButton();
    
    // Make sure it's hidden initially
    toggleHeaderMenuButton(false);
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
    @keyframes copyFadeIn {
        from { opacity: 0; transform: translate(-50%, -60%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
    }
    @keyframes copyFadeOut {
        from { opacity: 1; transform: translate(-50%, -50%); }
        to { opacity: 0; transform: translate(-50%, -60%); }
    }
    `;
    document.head.appendChild(style);
    
    // Set mobile viewport height
    setMobileViewportHeight();
    
    // Fix iOS-specific issues
    fixIOSIssues();
    
    // Set up copy notification if it doesn't exist
    if (!document.getElementById('copyNotification')) {
        const copyNotification = document.createElement('div');
        copyNotification.id = 'copyNotification';
        copyNotification.className = 'copy-notification';
        copyNotification.textContent = 'Score copied to clipboard!';
        document.body.appendChild(copyNotification);
    }
    
    // Check if card lists are available
    if (typeof yugiohCards === 'undefined' || typeof fakeYugiohCards === 'undefined') {
        console.error('Card lists not found! Make sure cardLists.js is properly loaded.');
        alert('Error: Card lists not loaded. Please check the console for more information.');
    } else {
        // Load the home page
        navigateTo('home');
    }
    
    // Add touchscreen detection class to body
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.classList.add('touchscreen');
    }
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    if (themeToggle) {
        // Check for saved theme preference or use preferred color scheme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
            themeToggle.textContent = '☀️';
        } else if (savedTheme === 'light') {
            body.classList.remove('dark-theme');
            themeToggle.textContent = '🌙';
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            body.classList.add('dark-theme');
            themeToggle.textContent = '☀️';
        }
        
        // Toggle theme with improved mobile handling
        addClickListener(themeToggle, () => {
            if (body.classList.contains('dark-theme')) {
                body.classList.remove('dark-theme');
                themeToggle.textContent = '🌙';
                localStorage.setItem('theme', 'light');
            } else {
                body.classList.add('dark-theme');
                themeToggle.textContent = '☀️';
                localStorage.setItem('theme', 'dark');
            }
        });
    }
    
    // Add event listeners for resizing and orientation change
    window.addEventListener('resize', setMobileViewportHeight);
    window.addEventListener('orientationchange', () => {
        // Small delay to ensure the browser has updated orientation
        setTimeout(setMobileViewportHeight, 100);
    });
    
    // Add event listener for play again button
    const playAgainButton = document.getElementById('playAgainButton');
    if (playAgainButton) {
        addClickListener(playAgainButton, () => {
            document.getElementById('gameOverOverlay').classList.remove('show');
            navigateTo('home');
        });
    }
    
    // Add event listener for share score button
    const shareScoreButton = document.getElementById('shareScoreButton');
    if (shareScoreButton) {
        addClickListener(shareScoreButton, () => {
            const shareableText = generateShareableScore();
            
            // Copy to clipboard
            navigator.clipboard.writeText(shareableText)
                .then(() => {
                    showCopyNotification();
                })
                .catch(err => {
                    console.error('Could not copy text: ', err);
                    
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = shareableText;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    
                    try {
                        document.execCommand('copy');
                        showCopyNotification();
                    } catch (err) {
                        alert('Failed to copy to clipboard. Please try again.');
                    }
                    
                    document.body.removeChild(textArea);
                });
        });
    }
});