/*
 * This file is part of the Blackjack Game project.
 * 
 * License: This code is free to use and modify, but you must provide recognition to the original developer.
 * Author: CTechDigital.com 
 */

document.addEventListener("DOMContentLoaded", function () {
    const dealerCardsElement = document.getElementById('dealer-cards');
    const playerCardsElement = document.getElementById('player-cards');
    const dealerScoreElement = document.getElementById('dealer-score');
    const playerScoreElement = document.getElementById('player-score');
    const messageElement = document.getElementById('message');
    const hitButtonPlayer = document.getElementById('hit-button-player');
    const standButtonPlayer = document.getElementById('stand-button-player');
    const hitButtonSplit = document.getElementById('hit-button-split');
    const standButtonSplit = document.getElementById('stand-button-split');
    const dealButton = document.getElementById('deal-button');
    const blackjackOverlay = document.getElementById('blackjack-overlay');
    const splitButton = document.getElementById('split-button');
    const splitHandElement = document.getElementById('split-hand');
    const splitCardsElement = document.getElementById('split-cards');
    const splitScoreElement = document.getElementById('split-score');
    
    let deck = [];
    let dealerHand = [];
    let playerHand = [];
    let splitHand = []; 
    let activeHand = 'player';
    let gameInProgress = true; 

    function initDeck() {
        const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push(`${rank}-${suit}`);
            }
        }
    }

    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function dealInitialCards() {
        for (let i = 0; i < 2; i++) {
            dealerHand.push(deck.pop());
            playerHand.push(deck.pop());
        }
        checkSplitOption(); 
    }

    function calculateHandScore(hand) {
        let score = 0;
        let numberOfAces = 0;

        console.log("Calculating score for hand:", hand);

        for (const card of hand) {
            const [rank, _] = card.split('-');
            if (rank === 'ace') {
                numberOfAces++;
            } else {
                score += getCardValue(rank);
            }
        }

        score += numberOfAces; 
        
        for (let i = 0; i < numberOfAces; i++) {
            if (score + 10 <= 21) {
                score += 10;
            } else {
                break; 
            }
        }

        console.log(`Final score: ${score}`); 
        return score; 
    }

    function getCardValue(rank) {
        if (['jack', 'queen', 'king'].includes(rank)) {
            return 10;
        } else if (rank === 'ace') {
            return 11;
        } else {
            return parseInt(rank);
        }
    }

    function updateScoreDisplay() {
        dealerScoreElement.textContent = `Score: ${calculateHandScore(dealerHand)}`;
        playerScoreElement.textContent = `Score: ${calculateHandScore(playerHand)}`;
        if (splitHand.length > 0) {
            splitScoreElement.textContent = `Score: ${calculateHandScore(splitHand)}`;
            splitHandElement.classList.remove('hidden');
        } else {
            splitHandElement.classList.add('hidden');
        }
    }

    function drawCard(hand, handElement) {
        const card = deck.pop();
        hand.push(card);
        console.log(`Drew card: ${card}`); 
        
        const img = document.createElement('img');
        img.src = `assets/images/cards/webp/${card}.webp`;
        img.alt = card;
        img.id = card;
        handElement.appendChild(img);
        
        const container = handElement.closest('#player, #split-hand, #dealer');
        if (container) {
            
            const baseWidth = 300;
            const cardWidth = 115;
            const desiredWidth = Math.max(baseWidth, (hand.length * cardWidth));
            container.style.minWidth = `${desiredWidth}px`;
            container.style.width = `${desiredWidth}px`;
            

            if (container.id === 'player' || container.id === 'split-hand') {
                const playerContainer = document.getElementById('player-container');
                let totalWidth = 0;
                
                
                if (playerHand.length > 0) {
                    const playerWidth = Math.max(300, playerHand.length * 115);
                    totalWidth += playerWidth + 20; 
                }
        
                if (splitHand.length > 0) {
                    const splitWidth = Math.max(300, splitHand.length * 115);
                    totalWidth += splitWidth;
                }
                
                playerContainer.style.maxWidth = splitHand.length > 0 ? `${totalWidth}px` : '350px';
            }
        }
        
        handElement.scrollLeft = handElement.scrollWidth;
    }

    function updateMessage(message) {
        messageElement.textContent = message;
    }

    function setButtonState(enabled) {
        hitButtonPlayer.disabled = !enabled;
        standButtonPlayer.disabled = !enabled;
        hitButtonSplit.disabled = !enabled;
        standButtonSplit.disabled = !enabled;
    }

    function checkForBlackjack() {
        const playerScore = calculateHandScore(playerHand);

        if (playerScore === 21 && playerHand.length === 2) {
            blackjackOverlay.classList.remove('hidden');
            updateMessage('Blackjack!');
        }
    }

    function checkSplitOption() {
        if (
            playerHand.length === 2 &&
            playerHand[0].split('-')[0] === playerHand[1].split('-')[0]
        ) {
            splitButton.disabled = false; 
        } else {
            splitButton.disabled = true;
        }
    }

    function handleSplit() {
        if (playerHand.length === 2) {
            playerCardsElement.innerHTML = '';
            splitCardsElement.innerHTML = '';
            
            splitHand.push(playerHand.pop());
            
            document.getElementById('player-container').classList.add('split-active');
            
            const playerImg = document.createElement('img');
            playerImg.src = `assets/images/cards/webp/${playerHand[0]}.webp`;
            playerImg.alt = playerHand[0];
            playerImg.id = playerHand[0];
            playerCardsElement.appendChild(playerImg);
            
            const splitImg = document.createElement('img');
            splitImg.src = `assets/images/cards/webp/${splitHand[0]}.webp`;
            splitImg.alt = splitHand[0];
            splitImg.id = splitHand[0];
            splitCardsElement.appendChild(splitImg);
            
            updateMessage('Hand split! Play your first hand.');

            drawCard(playerHand, playerCardsElement);
            drawCard(splitHand, splitCardsElement);

            updateScoreDisplay();
            splitButton.disabled = true;
        }
    }

    function playSplitHand() {
        activeHand = 'split'; 
        updateMessage('Playing split hand.');
        updateScoreDisplay();
    }

    blackjackOverlay.addEventListener('click', function () {
        blackjackOverlay.classList.add('hidden');
    });

    function resetGame() {
        deck = [];
        dealerHand = [];
        playerHand = [];
        splitHand = [];
        activeHand = 'player';
        dealerCardsElement.innerHTML = '';
        playerCardsElement.innerHTML = '';
        dealerScoreElement.textContent = 'Score: 0';
        playerScoreElement.textContent = 'Score: 0';
        splitScoreElement.textContent = 'Score: 0';
        messageElement.textContent = '';
        blackjackOverlay.classList.add('hidden'); 
        gameInProgress = true; 
        splitButton.disabled = true;
        setButtonState(true); 
        
        document.getElementById('player-container').classList.remove('split-active');
        
      
        document.getElementById('player').style.minWidth = '300px';
        document.getElementById('player').style.width = 'auto';
        document.getElementById('dealer').style.minWidth = '300px';
        document.getElementById('dealer').style.width = 'auto';
        const splitHandElement = document.getElementById('split-hand');
        splitHandElement.style.minWidth = '300px';
        splitHandElement.style.width = 'auto';
        document.getElementById('player-container').style.maxWidth = '350px';
        
        initDeck();
        shuffleDeck();
        dealInitialCards();
        
        for (let i = 0; i < dealerHand.length; i++) {
            const card = dealerHand[i];
            const img = document.createElement('img');
            img.src = `assets/images/cards/webp/${card}.webp`;
            img.alt = card;
            img.id = card;
            dealerCardsElement.appendChild(img);
        }
        
        for (let i = 0; i < playerHand.length; i++) {
            const card = playerHand[i];
            const img = document.createElement('img');
            img.src = `assets/images/cards/webp/${card}.webp`;
            img.alt = card;
            img.id = card;
            playerCardsElement.appendChild(img);
        }
        
        updateScoreDisplay();
        checkForBlackjack(); 
    }

    function dealerPlay() {
        while (calculateHandScore(dealerHand) < 17) {
            drawCard(dealerHand, dealerCardsElement);
        }
        updateScoreDisplay();
        const dealerScore = calculateHandScore(dealerHand);
        const playerScore = calculateHandScore(playerHand);
        
        gameInProgress = false; 
        setButtonState(false); 
        
        if (splitHand.length > 0) {
            const splitScore = calculateHandScore(splitHand);
            let result = '';
            
          
            if (playerScore > 21) {
                result += 'First hand busts. ';
            } else if (dealerScore > 21 || playerScore > dealerScore) {
                result += 'First hand wins! ';
            } else if (playerScore === dealerScore) {
                result += 'First hand ties. ';
            } else {
                result += 'First hand loses. ';
            }
            
            if (splitScore > 21) {
                result += 'Split hand busts.';
            } else if (dealerScore > 21 || splitScore > dealerScore) {
                result += 'Split hand wins!';
            } else if (splitScore === dealerScore) {
                result += 'Split hand ties.';
            } else {
                result += 'Split hand loses.';
            }
            
            updateMessage(result);
        } else {
            if (dealerScore > 21 || playerScore > dealerScore) {
                updateMessage('Player wins!');
            } else if (playerScore === dealerScore) {
                updateMessage('It\'s a tie!');
            } else {
                updateMessage('Dealer wins!');
            }
        }
    }

    initDeck();
    shuffleDeck();
    dealInitialCards();
    resetGame();

    hitButtonPlayer.addEventListener('click', function () {
        if (!gameInProgress) return;
        if (activeHand === 'player') {
            drawCard(playerHand, playerCardsElement);
            const score = calculateHandScore(playerHand);
            updateScoreDisplay();
            if (score > 21) {
                if (splitHand.length > 0) {
                    updateMessage('First hand busts! Switching to split hand.');
                    playSplitHand();
                } else {
                    
                    updateMessage('Player busts! Dealer wins!');
                    gameInProgress = false;
                    setButtonState(false);
                }
            }
        }
    });

    hitButtonSplit.addEventListener('click', function () {
        if (!gameInProgress) return; 
        if (activeHand === 'split') {
            drawCard(splitHand, splitCardsElement);
            const score = calculateHandScore(splitHand);
            updateScoreDisplay();
            if (score > 21) {
                updateMessage('Split hand busts! Dealer\'s turn.');
                dealerPlay();
            }
        }
    });

    standButtonPlayer.addEventListener('click', function () {
        if (!gameInProgress) return; 
        if (activeHand === 'player' && splitHand.length > 0) {
            playSplitHand();
        } else {
            dealerPlay();
        }
    });

    standButtonSplit.addEventListener('click', function () {
        if (!gameInProgress) return; 
        dealerPlay();
    });

    splitButton.addEventListener('click', handleSplit);

    dealButton.addEventListener('click', function () {
        resetGame();
    });

    
    document.addEventListener('keypress', function (event) {
        const key = event.key.toLowerCase();
        if (key === 'h' && gameInProgress) {
            if (activeHand === 'player') {
                drawCard(playerHand, playerCardsElement);
                const score = calculateHandScore(playerHand);
                updateScoreDisplay();
                if (score > 21) {
                    if (splitHand.length > 0) {
                        updateMessage('First hand busts! Switching to split hand.');
                        playSplitHand();
                    } else {
                        updateMessage('Player busts! Dealer wins!');
                        gameInProgress = false;
                        setButtonState(false);
                    }
                }
            } else if (activeHand === 'split') {
                drawCard(splitHand, splitCardsElement);
                const score = calculateHandScore(splitHand);
                updateScoreDisplay();
                if (score > 21) {
                    updateMessage('Split hand busts! Dealer\'s turn.');
                    dealerPlay();
                }
            }
        } else if (key === 's' && gameInProgress) {
            if (activeHand === 'player' && splitHand.length > 0) {
                playSplitHand();
            } else {
                dealerPlay();
            }
        } else if (key === 'd') {
            resetGame(); 
        }
    });

});
