// Dashboard Logic - Team View and Clue Submission

let currentUser = null;
let currentTeam = null;
let currentTeamId = null;
let gameState = { started: false, paused: false, ended: false };

// Check authentication and load dashboard
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = user;
    await checkGameStateAndLoad();
});

// Check game state before loading
async function checkGameStateAndLoad() {
    try {
        const gameStateDoc = await db.collection('gameState').doc('current').get();
        if (gameStateDoc.exists) {
            gameState = gameStateDoc.data();
            
            // Allow viewing dashboard but show status if game not started
            if (gameState.ended) {
                alert('The game has ended. Check the leaderboard for final results!');
                window.location.href = 'leaderboard.html';
                return;
            }
        }

        await loadUserData();
        await loadTeamData();
        setupRealtimeListeners();
        displayGameStatusBanner();
    } catch (error) {
        console.error('Error checking game state:', error);
    }
}

// Display game status banner
function displayGameStatusBanner() {
    // Remove any existing banner
    const existingBanner = document.querySelector('.game-status-banner');
    if (existingBanner) existingBanner.remove();
    
    const banner = document.createElement('div');
    banner.className = 'game-status-banner';
    banner.style.cssText = 'padding: 15px; text-align: center; font-weight: bold; position: sticky; top: 60px; z-index: 1000;';
    
    if (!gameState.started) {
        banner.style.background = 'var(--warning)';
        banner.style.color = 'var(--darker-bg)';
        banner.textContent = '⏳ GAME NOT STARTED - Team created! Clue submission will be enabled when admin starts the game.';
        document.body.prepend(banner);
    } else if (gameState.paused) {
        banner.style.background = 'var(--warning)';
        banner.style.color = 'var(--darker-bg)';
        banner.textContent = '⏸️ GAME PAUSED - Clue submission temporarily disabled';
        document.body.prepend(banner);
    } else if (gameState.started && !gameState.paused) {
        banner.style.background = 'var(--success)';
        banner.style.color = 'var(--darker-bg)';
        banner.textContent = '▶️ GAME ACTIVE - Submit your clues now!';
        document.body.prepend(banner);
    }
}

// Load user data
async function loadUserData() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (!userDoc.exists) {
            await auth.signOut();
            window.location.href = 'login.html';
            return;
        }

        const userData = userDoc.data();
        currentTeamId = userData.teamId;
        
        // Update role badge
        const roleElement = document.getElementById('user-role');
        roleElement.textContent = userData.role === 'leader' ? '👑 Team Leader' : '👤 Team Member';
        roleElement.className = 'role-badge ' + userData.role;
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Load team data
async function loadTeamData() {
    try {
        const teamDoc = await db.collection('teams').doc(currentTeamId).get();
        if (!teamDoc.exists) {
            alert('Team not found. Please contact support.');
            return;
        }

        currentTeam = { id: teamDoc.id, ...teamDoc.data() };
        displayTeamInfo();
        displayMembers();
        displayClueInputs();
        displayClueStatus();
    } catch (error) {
        console.error('Error loading team data:', error);
    }
}

// Display team information
function displayTeamInfo() {
    document.getElementById('team-name').textContent = currentTeam.teamName;
    document.getElementById('clues-found').textContent = currentTeam.cluesFound || 0;
    
    // Calculate rank (will be updated by realtime listener)
    calculateRank();
}

// Calculate and display team rank
async function calculateRank() {
    try {
        const teamsSnapshot = await db.collection('teams')
            .orderBy('score', 'desc')
            .orderBy('cluesFound', 'desc')
            .get();
        
        let rank = 1;
        teamsSnapshot.forEach((doc) => {
            if (doc.id === currentTeamId) {
                document.getElementById('team-rank').textContent = rank;
            }
            rank++;
        });
    } catch (error) {
        console.error('Error calculating rank:', error);
        document.getElementById('team-rank').textContent = '-';
    }
}

// Display team members
function displayMembers() {
    const membersList = document.getElementById('members-list');
    membersList.innerHTML = '';

    if (currentTeam.members && currentTeam.members.length > 0) {
        currentTeam.members.forEach(member => {
            const memberCard = document.createElement('div');
            memberCard.className = 'member-card';
            
            const initial = member.name.charAt(0).toUpperCase();
            
            memberCard.innerHTML = `
                <div class="member-avatar">${initial}</div>
                <div class="member-info">
                    <h4>${member.name}</h4>
                    <p class="member-role ${member.role}">${member.role === 'leader' ? '👑 Leader' : '👥 Member'}</p>
                </div>
            `;
            
            membersList.appendChild(memberCard);
        });
    }
}

// Display clue inputs
function displayClueInputs() {
    const cluesGrid = document.getElementById('clues-grid');
    cluesGrid.innerHTML = '';
    
    const gameNotStarted = !gameState.started;
    const gameIsPaused = gameState.paused;

    for (let i = 1; i <= 6; i++) {
        const clueKey = `clue${i}`;
        const clueData = currentTeam.clues[clueKey];
        const isFound = clueData && clueData.found;
        const isDisabled = isFound || gameNotStarted || gameIsPaused;

        const clueBox = document.createElement('div');
        clueBox.className = 'clue-input-box' + (isFound ? ' submitted' : '');
        
        let placeholder = 'Enter clue word';
        if (isFound) placeholder = 'Already found!';
        else if (gameNotStarted) placeholder = 'Game not started';
        else if (gameIsPaused) placeholder = 'Game paused';
        
        clueBox.innerHTML = `
            <label class="clue-label">Clue ${i}</label>
            <input 
                type="text" 
                class="clue-input" 
                id="clue-${i}" 
                placeholder="${placeholder}"
                ${isDisabled ? 'disabled' : ''}
                value="${isFound ? clueData.userInput || '' : ''}"
            >
            <button 
                class="clue-submit-btn" 
                onclick="submitClue(${i})"
                ${isDisabled ? 'disabled' : ''}
            >
                ${isFound ? '✓ Found' : (gameNotStarted ? '⏳ Waiting' : (gameIsPaused ? '⏸️ Paused' : 'Submit'))}
            </button>
            <p class="clue-status ${isFound ? 'found' : ''}">
                ${isFound ? '✓ Found on ' + formatTimestamp(clueData.timestamp) : (gameNotStarted ? '⏳ Waiting for game to start' : 'Not found yet')}
            </p>
        `;
        
        cluesGrid.appendChild(clueBox);
    }
}

// Submit a clue
window.submitClue = async function(clueNumber) {
    // Check if game has started
    if (!gameState.started) {
        showMessage('⏳ Game has not started yet. Please wait for the admin to start the game.', 'error');
        return;
    }
    
    // Check if game is paused
    if (gameState.paused) {
        showMessage('Game is paused. Clue submission is temporarily disabled.', 'error');
        return;
    }

    if (gameState.ended) {
        showMessage('Game has ended. No more submissions allowed.', 'error');
        return;
    }

    const clueInput = document.getElementById(`clue-${clueNumber}`);
    const userInput = clueInput.value.trim().toLowerCase();

    if (!userInput) {
        showMessage('Please enter a word before submitting', 'error');
        return;
    }

    try {
        const clueKey = `clue${clueNumber}`;
        
        // Get the team's assigned clues from admin
        const teamDoc = await db.collection('teams').doc(currentTeamId).get();
        const teamData = teamDoc.data();
        
        // Check if admin has set clues for this team
        if (!teamData.assignedClues || !teamData.assignedClues[clueKey]) {
            showMessage('Admin has not set clues for your team yet. Please wait.', 'error');
            return;
        }

        const correctWord = teamData.assignedClues[clueKey].toLowerCase();
        
        if (userInput === correctWord) {
            // Correct clue!
            const timestamp = firebase.firestore.FieldValue.serverTimestamp();
            const updateData = {};
            updateData[`clues.${clueKey}`] = {
                word: correctWord,
                userInput: userInput,
                found: true,
                timestamp: timestamp,
                foundBy: currentUser.uid
            };

            // Calculate score based on time and order
            const cluesFound = teamData.cluesFound || 0;
            const baseScore = 100;
            const orderBonus = (7 - clueNumber) * 10; // Earlier clues worth more
            const speedBonus = Math.max(0, 50 - cluesFound * 5); // Less time = more points
            const totalScore = baseScore + orderBonus + speedBonus;

            await db.collection('teams').doc(currentTeamId).update({
                ...updateData,
                cluesFound: firebase.firestore.FieldValue.increment(1),
                score: firebase.firestore.FieldValue.increment(totalScore),
                submissions: firebase.firestore.FieldValue.arrayUnion({
                    clueNumber: clueNumber,
                    word: userInput,
                    correct: true,
                    timestamp: new Date(),
                    submittedBy: currentUser.uid,
                    submittedByName: currentUser.displayName
                })
            });

            showMessage(`🎉 Correct! You found Clue ${clueNumber}! +${totalScore} points`, 'success');
            
            // Reload team data
            await loadTeamData();
        } else {
            // Wrong clue
            await db.collection('teams').doc(currentTeamId).update({
                submissions: firebase.firestore.FieldValue.arrayUnion({
                    clueNumber: clueNumber,
                    word: userInput,
                    correct: false,
                    timestamp: new Date(),
                    submittedBy: currentUser.uid,
                    submittedByName: currentUser.displayName
                })
            });

            showMessage('❌ Incorrect word. Keep searching!', 'error');
        }
    } catch (error) {
        console.error('Error submitting clue:', error);
        showMessage('Error submitting clue. Please try again.', 'error');
    }
}

// Display clue status
function displayClueStatus() {
    const statusDisplay = document.getElementById('clue-status-display');
    statusDisplay.innerHTML = '';

    for (let i = 1; i <= 6; i++) {
        const clueKey = `clue${i}`;
        const clueData = currentTeam.clues[clueKey];
        const isFound = clueData && clueData.found;

        const statusItem = document.createElement('div');
        statusItem.className = 'status-item' + (isFound ? ' found' : '');
        statusItem.innerHTML = `
            <div class="status-icon">${isFound ? '✅' : '🔍'}</div>
            <div class="status-text">Clue ${i}</div>
            ${isFound ? `<div class="status-time">${formatTimestamp(clueData.timestamp)}</div>` : ''}
        `;
        
        statusDisplay.appendChild(statusItem);
    }
}

// Setup realtime listeners
function setupRealtimeListeners() {
    // Listen to team updates
    db.collection('teams').doc(currentTeamId).onSnapshot((doc) => {
        if (doc.exists) {
            currentTeam = { id: doc.id, ...doc.data() };
            displayTeamInfo();
            displayClueInputs();
            displayClueStatus();
        }
    });

    // Listen to game state changes
    db.collection('gameState').doc('current').onSnapshot((doc) => {
        if (doc.exists) {
            gameState = doc.data();
            displayGameStatusBanner();
            displayClueInputs(); // Refresh clue inputs based on game state
            
            if (gameState.ended) {
                alert('The game has ended! Redirecting to leaderboard...');
                window.location.href = 'leaderboard.html';
            }
        }
    });
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleString();
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.getElementById('submit-message');
    messageDiv.textContent = text;
    messageDiv.className = 'submit-message ' + type;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error logging out:', error);
    }
});
