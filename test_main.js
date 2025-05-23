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
            // Same functionality as the old menu button
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
                    <div class="difficulty-container">
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

/// Enhanced function to set mobile viewport height with iOS fixes
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
        
        // Fix for iOS selection page sizing
        const selectionContainer = document.querySelector('.selection-container');
        if (selectionContainer) {
            // Ensure container takes appropriate space
            selectionContainer.style.minHeight = 'calc(var(--vh, 1vh) * 70)';
            selectionContainer.style.maxHeight = 'calc(var(--vh, 1vh) * 80)';
            selectionContainer.style.overflow = 'auto';
            selectionContainer.style.webkitOverflowScrolling = 'touch';
            
            // Adjust box sizes for iOS
            const options = document.querySelectorAll('.selection-box');
            if (options.length > 0) {
                // Different sizing based on number of options
                if (options.length > 3) {
                    // For many options, make them more compact
                    options.forEach(option => {
                        option.style.margin = '8px 0';
                        option.style.padding = '12px 10px';
                        option.style.minHeight = '50px';
                    });
                } else {
                    // For fewer options, give them more room
                    options.forEach(option => {
                        option.style.margin = '12px 0';
                        option.style.padding = '15px 12px';
                        option.style.minHeight = '60px';
                    });
                }
            }
        }
        
        // Make sure notification is properly positioned on iOS
        const notification = document.getElementById('notification');
        if (notification) {
            notification.style.top = 'calc(env(safe-area-inset-top) + 10px)';
        }
        
        // Ensure lives container is visible and doesn't overlap
        const livesContainer = document.querySelector('.lives-container');
        if (livesContainer) {
            livesContainer.style.marginTop = '15px';
            livesContainer.style.marginBottom = '10px';
            livesContainer.style.paddingTop = '5px';
            livesContainer.style.paddingBottom = '5px';
        }
    }
    
    // Rest of the original function...
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

// Enhanced touch handling for iOS
function enhanceTouchInteraction() {
    // Get all interactive elements
    const interactiveElements = document.querySelectorAll('button, .selection-box, .header-btn, .theme-toggle');
    
    // Special handling for iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    interactiveElements.forEach(element => {
        // Remove any existing listeners to prevent duplicates
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
        
        // Add enhanced touch handlers
        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchend', handleTouchEnd);
        
        // Additional iOS-specific handling
        if (isIOS) {
            // Prevent any accidental zoom or scroll when tapping
            element.addEventListener('touchmove', function(e) {
                e.preventDefault();
            }, { passive: false });
            
            // Improve tap responsiveness on iOS
            element.style.WebkitTapHighlightColor = 'rgba(0,0,0,0)';
            
            // Ensure proper button behavior
            if (element.tagName.toLowerCase() === 'button' || element.classList.contains('selection-box')) {
                element.style.cursor = 'pointer';
                element.style.WebkitAppearance = 'none';
            }
        }
    });
}

// Add this call to the document ready function to ensure fixes are applied
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Apply iOS fixes immediately
    fixIOSIssues();
    
    // Also re-apply iOS fixes when navigating to new pages
    const originalNavigateTo = navigateTo;
    navigateTo = function(page) {
        originalNavigateTo(page);
        
        // Re-apply iOS fixes after page navigation
        setTimeout(function() {
            fixIOSIssues();
        }, 100);
    };
    
    // Also monitor orientation changes specifically for iOS
    window.addEventListener('orientationchange', function() {
        // Apply iOS fixes after orientation change with a delay
        setTimeout(function() {
            fixIOSIssues();
            setMobileViewportHeight();
        }, 300);
    });
});

// Function to navigate between pages
function navigateTo(page) {
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
        document.getElementById('easyBtn').addEventListener('click', () => {
            setDifficulty('easy');
        });
        
        document.getElementById('mediumBtn').addEventListener('click', () => {
            setDifficulty('medium');
        });
        
        document.getElementById('hardBtn').addEventListener('click', () => {
            setDifficulty('hard');
        });
        
        document.getElementById('beginButton').addEventListener('click', () => {
            // Reset score when starting a new game
            score = 0;
            questionCount = 0;
            lives = 3;
            navigateTo('selection');
        });
        
        // Add touch event listeners for buttons on the home page
        addTouchListeners([
            'easyBtn', 'mediumBtn', 'hardBtn', 'beginButton'
        ].map(id => document.getElementById(id)));
        
    } else if (page === 'selection') {
        // Add click event for menu button
        document.getElementById('menuButton').addEventListener('click', () => {
            navigateTo('home');
        });
        
        // Add touch event listener for menu button
        addTouchListeners([document.getElementById('menuButton')]);
        
        // Add click events for all option boxes
        const options = document.querySelectorAll('.selection-box');
        
        // Function to handle option box clicks
        function handleOptionClick(option, allOptions) {
            // Prevent multiple clicks while processing an answer
            if (isProcessing) return;
            
            // Set flag to prevent further clicks
            isProcessing = true;
            
            // Disable all option boxes visually
            allOptions.forEach(opt => {
                opt.style.pointerEvents = 'none';
                opt.style.opacity = '0.7';
            });
            
            const isRealCard = option.getAttribute('data-is-real') === 'true';
            
            if (isRealCard) {
                // If correct
                score++;
                option.style.backgroundColor = '#9ee2a2'; // Green background
                option.style.borderColor = '#2e6934'; // Dark green border
                showNotification('Correct! That is a real card!', true);
            } else {
                // If incorrect
                lives--;
                option.style.backgroundColor = '#ffb7c5'; // Pink background
                option.style.borderColor = '#993344'; // Dark pink border
                
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
                navigateTo('selection'); // Load new cards
                isProcessing = false; // Reset processing flag for next question
            }, 1800); // Increased from 1000ms to 2000ms
        }
    
        // Add click event listeners to all option boxes
        options.forEach(option => {
            option.addEventListener('click', function() {
                handleOptionClick(this, options);
            });
            
            // Add touch events for mobile devices
            option.addEventListener('touchstart', function(e) {
                this.classList.add('button-active');
            }, { passive: true });
            
            option.addEventListener('touchend', function(e) {
                e.preventDefault(); // Prevent default behavior
                this.classList.remove('button-active');
                handleOptionClick(this, options);
            });
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
            // Optimize touch areas for better mobile interaction
            const options = document.querySelectorAll('.selection-box');
            options.forEach(option => {
                // Ensure touch targets are large enough
                option.style.minHeight = '50px';
                
                // Fix any iOS-specific issues with touch events
                option.addEventListener('touchstart', function(e) {
                    // Prevent default only if needed to avoid conflicts
                    if (!e.target.closest('input, textarea')) {
                        e.preventDefault();
                    }
                }, { passive: false });
            });
            
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
            });
            
            // Make sure the begin button is prominent and easily tappable
            const beginBtn = document.getElementById('beginButton');
            if (beginBtn) {
                beginBtn.style.minHeight = '50px';
                beginBtn.style.minWidth = '200px';
            }
        }
    }
    
    // Handle game over overlay positioning for mobile
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    if (gameOverOverlay) {
        // Use the custom vh variable for better mobile positioning
        gameOverOverlay.style.height = 'calc(var(--vh, 1vh) * 100)';
    }
    
    // Call enhanced touch interaction after DOM updates
    setTimeout(enhanceTouchInteraction, 50);
}

// Function to add touch event listeners to elements
function addTouchListeners(elements) {
    elements.forEach(element => {
        if (!element) return; // Skip null elements
        
        // Remove existing touch listeners to prevent duplicates
        element.removeEventListener('touchstart', touchStartHandler);
        element.removeEventListener('touchend', touchEndHandler);
        
        // Add touch event listeners
        element.addEventListener('touchstart', touchStartHandler, { passive: true });
        element.addEventListener('touchend', touchEndHandler);
    });
}

// Touch event handlers
function touchStartHandler(e) {
    this.classList.add('button-active');
}

function touchEndHandler(e) {
    e.preventDefault(); // Prevent default to avoid delay
    this.classList.remove('button-active');
    
    // If this is a selection box, handle the click logic
    if (this.classList.contains('selection-box')) {
        const options = document.querySelectorAll('.selection-box');
        handleOptionClick(this, options);
    } else {
        // For other buttons, trigger a click event
        this.click();
    }
}

// Enhanced touch handling for all interactive elements
function enhanceTouchInteraction() {
    // Get all interactive elements
    const interactiveElements = document.querySelectorAll('button, .selection-box, .header-btn, .theme-toggle');
    
    interactiveElements.forEach(element => {
        // Remove any existing listeners to prevent duplicates
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchend', handleTouchEnd);
        
        // Add enhanced touch handlers
        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchend', handleTouchEnd);
    });
}

// Touch handlers with improved feedback
function handleTouchStart(e) {
    // Add visual feedback class
    this.classList.add('button-active');
    
    // For selection boxes in the game, add extra visual emphasis
    if (this.classList.contains('selection-box')) {
        this.style.transform = 'scale(0.98)';
        this.style.transition = 'transform 0.1s ease-in-out';
    }
}

function handleTouchEnd(e) {
    // Remove visual feedback
    this.classList.remove('button-active');
    
    // Reset any additional styles we added
    if (this.classList.contains('selection-box')) {
        this.style.transform = '';
    }
    
    // Prevent default behavior for buttons to avoid delay
    if (this.tagName.toLowerCase() === 'button' || this.classList.contains('selection-box') || this.classList.contains('header-btn')) {
        e.preventDefault();
    }
}

// Enhanced iOS fix function with improved element positioning
function fixIOSIssues() {
    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        // Add iOS-specific class to body
        document.body.classList.add('ios-device');
        
        // Fix for iOS input focusing issues
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                // Add padding to bottom of page to prevent content from being hidden behind keyboard
                // Use setTimeout to ensure this happens after keyboard appears
                setTimeout(() => {
                    document.body.style.paddingBottom = '150px';
                    // Scroll to the focused input
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            });
            
            input.addEventListener('blur', function() {
                // Remove padding when keyboard is hidden
                document.body.style.paddingBottom = '0';
            });
        });
        
        // Fix for double-tap zoom on buttons
        const allButtons = document.querySelectorAll('button, .selection-box, .header-btn');
        allButtons.forEach(button => {
            button.style.touchAction = 'manipulation';
        });
        
        // Fix for iOS Safari overlapping elements - adjust z-index
        // Ensure notification doesn't get hidden
        const notification = document.getElementById('notification');
        if (notification) {
            notification.style.zIndex = '1000';
        }
        
        // Ensure game over overlay appears on top
        const gameOverOverlay = document.getElementById('gameOverOverlay');
        if (gameOverOverlay) {
            gameOverOverlay.style.zIndex = '1001';
        }
        
        // Handle iOS-specific positioning for selection boxes
        adjustIOSSelectionBoxes();
        
        // Fix iOS scrolling issues
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // Prevent scrolling when interacting with game elements
        preventIOSScrollingIssues();
    }
}

// Function to adjust selection boxes specifically for iOS
function adjustIOSSelectionBoxes() {
    const selectionBoxes = document.querySelectorAll('.selection-box');
    if (selectionBoxes.length > 0) {
        selectionBoxes.forEach((box, index) => {
            // Add iOS-specific styling
            box.classList.add('ios-selection-box');
            
            // Ensure proper spacing between boxes
            box.style.marginBottom = '15px';
            
            // Adjust box heights for better touch targets
            box.style.minHeight = '60px';
            
            // Ensure text doesn't overflow
            const textElement = box.querySelector('p');
            if (textElement) {
                textElement.style.maxWidth = '100%';
                textElement.style.overflow = 'hidden';
                textElement.style.textOverflow = 'ellipsis';
            }
        });
        
        // Adjust container to prevent boxes from overlapping
        const container = document.querySelector('.selection-container');
        if (container) {
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '12px';
            container.style.paddingBottom = '20px'; // Add padding at bottom
        }
    }
}

// Function to prevent iOS scrolling issues during game play
function preventIOSScrollingIssues() {
    const gameContent = document.querySelector('.game-content');
    if (gameContent) {
        // Prevent scroll when touching game elements
        gameContent.addEventListener('touchmove', function(e) {
            // Only prevent default if not on an actual scrollable element
            if (!e.target.closest('.scrollable-area')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // Fix for iOS mobile controls
    const mobileControls = document.querySelector('.mobile-controls-container');
    if (mobileControls) {
        // Ensure controls are visible and don't overlap
        mobileControls.style.position = 'sticky';
        mobileControls.style.top = '0';
        mobileControls.style.zIndex = '100';
        mobileControls.style.backgroundColor = 'var(--bg-color)'; // Match page background
        mobileControls.style.paddingTop = '10px';
        mobileControls.style.paddingBottom = '10px';
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
    
    document.getElementById(`${difficulty}Btn`).classList.add('active');
}

// Function to reposition game elements based on screen size
function repositionGameElements() {
    const isMobile = window.innerWidth <= 768;
    const gameContent = document.querySelector('.game-content');
    
    if (gameContent) {
        if (isMobile) {
            // Rearrange elements for mobile layout
            const menuBtn = document.getElementById('menuButton');
            const scoreDisplay = document.querySelector('.score-display');
            const difficultyDisplay = document.querySelector('.difficulty-display');
            
            if (menuBtn && scoreDisplay && difficultyDisplay) {
                // Move elements to the start of game content
                gameContent.prepend(difficultyDisplay);
                gameContent.prepend(scoreDisplay);
                gameContent.prepend(menuBtn);
            }
        }
    }
}

// DOM Observer to watch for content changes
const observeDOM = (function(){
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    
    return function(obj, callback){
        if(!obj || obj.nodeType !== 1) return; 
        
        if(MutationObserver){
            // Define a new observer
            const mutationObserver = new MutationObserver(callback);
            
            // Have the observer observe the element for changes in children
            mutationObserver.observe(obj, { childList:true, subtree:true });
            return mutationObserver;
        }
        // No MutationObserver support, fall back to DOMNodeInserted
        else if(window.addEventListener){
            obj.addEventListener('DOMNodeInserted', callback, false);
            obj.addEventListener('DOMNodeRemoved', callback, false);
        }
    };
})();

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
    
    // Add touch event listeners
    enhanceTouchInteraction();
    
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
    
    // Observe changes to the page content and enhance touch interactions
    observeDOM(document.getElementById('pageContent'), function(mutations) {
        // Add a small delay to ensure the DOM is fully updated
        setTimeout(enhanceTouchInteraction, 50);
    });
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
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
    
    // Toggle theme
    themeToggle.addEventListener('click', () => {
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
    
    // Add event listeners for resizing and orientation change
    window.addEventListener('resize', setMobileViewportHeight);
    window.addEventListener('orientationchange', () => {
        // Small delay to ensure the browser has updated orientation
        setTimeout(setMobileViewportHeight, 100);
    });
    
    // Add event listener for play again button
    document.getElementById('playAgainButton').addEventListener('click', () => {
        document.getElementById('gameOverOverlay').classList.remove('show');
        navigateTo('home');
    });
    
    // Add event listener for share score button
    document.getElementById('shareScoreButton').addEventListener('click', () => {
        const shareableText = generateShareableScore();
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareableText)
            .then(() => {
                showCopyNotification();
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                alert('Failed to copy to clipboard. Please try again.');
            });
    });
});
