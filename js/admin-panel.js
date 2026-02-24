// Admin Panel Logic - Complete Game Management

let currentAdmin = null;
let allTeams = [];

// Check admin authentication
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Verify admin status
    const adminDoc = await db.collection('admins').doc(user.uid).get();
    if (!adminDoc.exists) {
        await auth.signOut();
        window.location.href = 'admin-login.html';
        return;
    }

    currentAdmin = user;
    initializeAdminPanel();
});

// Initialize admin panel
async function initializeAdminPanel() {
    setupTabs();
    await loadGameState();
    await loadTeamsData();
    loadTeamsForClueSetup();
    loadTeamsForWinner();
    loadAnnouncementsHistory();
    setupRealtimeListeners();
    setupGameControlListeners();
    setupAIFeatures();
}

// Setup tabs functionality
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// Load teams data for overview
async function loadTeamsData() {
    try {
        const teamsSnapshot = await db.collection('teams').get();
        allTeams = [];
        
        teamsSnapshot.forEach((doc) => {
            allTeams.push({ id: doc.id, ...doc.data() });
        });

        updateStatsOverview();
        displayTeamsTable();
    } catch (error) {
        console.error('Error loading teams:', error);
    }
}

// Update stats overview
function updateStatsOverview() {
    document.getElementById('total-teams').textContent = allTeams.length;
    
    let totalParticipants = 0;
    let activeTeams = 0;
    
    allTeams.forEach(team => {
        if (team.members) {
            totalParticipants += team.members.length;
        }
        if (team.status === 'active') {
            activeTeams++;
        }
    });
    
    document.getElementById('total-participants').textContent = totalParticipants;
    document.getElementById('active-teams').textContent = activeTeams;
}

// Display teams in table
function displayTeamsTable() {
    const tbody = document.getElementById('teams-tbody');
    tbody.innerHTML = '';

    if (allTeams.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No teams registered yet</td></tr>';
        return;
    }

    allTeams.forEach(team => {
        const row = document.createElement('tr');
        
        const memberCount = team.members ? team.members.length : 0;
        const cluesFound = team.cluesFound || 0;
        const statusClass = team.status === 'active' ? 'active' : 'inactive';
        
        row.innerHTML = `
            <td>${team.teamName}</td>
            <td>${team.leaderName}</td>
            <td>${memberCount}</td>
            <td>${cluesFound}/6</td>
            <td><span class="status-badge ${statusClass}">${team.status || 'active'}</span></td>
            <td>
                <button class="action-btn view" onclick="viewTeamDetails('${team.id}')">View</button>
                <button class="action-btn delete" onclick="deleteTeam('${team.id}')">Delete</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// View team details (can be expanded)
window.viewTeamDetails = async function(teamId) {
    const team = allTeams.find(t => t.id === teamId);
    if (team) {
        alert(`Team: ${team.teamName}\nLeader: ${team.leaderName}\nMembers: ${team.members ? team.members.length : 0}\nClues Found: ${team.cluesFound || 0}/6\nScore: ${team.score || 0}`);
    }
}

// Delete team
window.deleteTeam = async function(teamId) {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
        return;
    }

    try {
        await db.collection('teams').doc(teamId).delete();
        alert('Team deleted successfully');
        await loadTeamsData();
    } catch (error) {
        console.error('Error deleting team:', error);
        alert('Error deleting team: ' + error.message);
    }
}

// Load teams for clue setup dropdown
async function loadTeamsForClueSetup() {
    const selectTeam = document.getElementById('select-team-for-clues');
    selectTeam.innerHTML = '<option value="">-- Select a Team --</option>';

    allTeams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.teamName;
        selectTeam.appendChild(option);
    });

    selectTeam.addEventListener('change', async (e) => {
        const teamId = e.target.value;
        if (teamId) {
            await loadTeamClues(teamId);
        } else {
            document.getElementById('clues-form-container').style.display = 'none';
        }
    });
}

// Load team's current clues
async function loadTeamClues(teamId) {
    try {
        const teamDoc = await db.collection('teams').doc(teamId).get();
        const team = teamDoc.data();
        
        document.getElementById('selected-team-name').textContent = team.teamName;
        document.getElementById('clues-form-container').style.display = 'block';

        // Load existing assigned clues if any
        if (team.assignedClues) {
            for (let i = 1; i <= 6; i++) {
                const clueInput = document.querySelector(`.clue-input[data-clue="${i}"]`);
                if (clueInput && team.assignedClues[`clue${i}`]) {
                    clueInput.value = team.assignedClues[`clue${i}`];
                }
            }
        } else {
            // Clear all inputs
            document.querySelectorAll('.clue-input').forEach(input => input.value = '');
        }

        // Setup form submission
        document.getElementById('clues-form').onsubmit = async (e) => {
            e.preventDefault();
            await saveTeamClues(teamId);
        };
    } catch (error) {
        console.error('Error loading team clues:', error);
    }
}

// Save clues for a team
async function saveTeamClues(teamId) {
    try {
        const clues = {};
        for (let i = 1; i <= 6; i++) {
            const clueInput = document.querySelector(`.clue-input[data-clue="${i}"]`);
            const word = clueInput.value.trim();
            
            if (!word) {
                showCluesMessage('Please fill in all 6 clues', 'error');
                return;
            }
            
            clues[`clue${i}`] = word;
        }

        await db.collection('teams').doc(teamId).update({
            assignedClues: clues,
            cluesSetAt: firebase.firestore.FieldValue.serverTimestamp(),
            cluesSetBy: currentAdmin.uid
        });

        showCluesMessage('Clues saved successfully!', 'success');
    } catch (error) {
        console.error('Error saving clues:', error);
        showCluesMessage('Error saving clues: ' + error.message, 'error');
    }
}

// Generate random clues for all teams
document.getElementById('generate-random-clues').addEventListener('click', async () => {
    if (!confirm('Generate random unique clues for all teams? This will overwrite existing clues.')) {
        return;
    }

    try {
        const wordList = [
            'evidence', 'forensic', 'detective', 'suspect', 'witness', 'alibi',
            'motive', 'criminal', 'investigation', 'clue', 'mystery', 'case',
            'crime', 'scene', 'proof', 'victim', 'fingerprint', 'testimony',
            'verdict', 'justice', 'police', 'interrogate', 'surveillance', 'weapon',
            'autopsy', 'bloodstain', 'DNA', 'footprint', 'handwriting', 'ransom'
        ];

        for (const team of allTeams) {
            // Shuffle and pick 6 unique words for each team
            const shuffled = [...wordList].sort(() => Math.random() - 0.5);
            const selectedWords = shuffled.slice(0, 6);
            
            const clues = {};
            for (let i = 1; i <= 6; i++) {
                clues[`clue${i}`] = selectedWords[i - 1];
            }

            await db.collection('teams').doc(team.id).update({
                assignedClues: clues,
                cluesSetAt: firebase.firestore.FieldValue.serverTimestamp(),
                cluesSetBy: currentAdmin.uid
            });
        }

        alert('Random clues generated for all teams!');
    } catch (error) {
        console.error('Error generating random clues:', error);
        alert('Error generating clues: ' + error.message);
    }
});

// Post announcement
document.getElementById('announcement-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const type = document.getElementById('announcement-type').value;
    const title = document.getElementById('announcement-title').value.trim();
    const message = document.getElementById('announcement-message').value.trim();

    if (!title || !message) {
        showAnnouncementMessage('Please fill in all fields', 'error');
        return;
    }

    try {
        await db.collection('announcements').add({
            type: type,
            title: title,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            postedBy: currentAdmin.uid,
            postedByEmail: currentAdmin.email
        });

        showAnnouncementMessage('Announcement posted successfully!', 'success');
        
        // Clear form
        document.getElementById('announcement-title').value = '';
        document.getElementById('announcement-message').value = '';
        
        // Reload announcements
        loadAnnouncementsHistory();
    } catch (error) {
        console.error('Error posting announcement:', error);
        showAnnouncementMessage('Error posting announcement: ' + error.message, 'error');
    }
});

// Load announcements history
async function loadAnnouncementsHistory() {
    try {
        const announcementsSnapshot = await db.collection('announcements')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        const listDiv = document.getElementById('admin-announcements-list');
        listDiv.innerHTML = '';

        if (announcementsSnapshot.empty) {
            listDiv.innerHTML = '<p style="color: var(--text-secondary);">No announcements yet</p>';
            return;
        }

        announcementsSnapshot.forEach((doc) => {
            const announcement = doc.data();
            const card = document.createElement('div');
            card.className = 'announcement-card ' + announcement.type;
            card.style.padding = '15px';
            card.style.marginBottom = '10px';
            
            card.innerHTML = `
                <strong>${announcement.title}</strong>
                <p style="margin: 10px 0; color: var(--text-secondary);">${announcement.message}</p>
                <small style="color: var(--text-secondary);">Type: ${announcement.type} | ${formatTimestamp(announcement.timestamp)}</small>
                <button class="action-btn delete" style="float: right; margin-top: -30px;" onclick="deleteAnnouncement('${doc.id}')">Delete</button>
            `;
            
            listDiv.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading announcements:', error);
    }
}

// Delete announcement
window.deleteAnnouncement = async function(announcementId) {
    if (!confirm('Delete this announcement?')) return;

    try {
        await db.collection('announcements').doc(announcementId).delete();
        loadAnnouncementsHistory();
    } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Error deleting announcement');
    }
}

// Load teams for winner selection
async function loadTeamsForWinner() {
    const winnerSelect = document.getElementById('winner-team-select');
    winnerSelect.innerHTML = '<option value="">-- Select Winner --</option>';

    // Sort teams by score
    const sortedTeams = [...allTeams].sort((a, b) => (b.score || 0) - (a.score || 0));

    sortedTeams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = `${team.teamName} (Score: ${team.score || 0}, Clues: ${team.cluesFound || 0}/6)`;
        winnerSelect.appendChild(option);
    });

    // Display current standings
    displayFinalStandings(sortedTeams);
}

// Display final standings
function displayFinalStandings(teams) {
    const standingsList = document.getElementById('final-standings-list');
    standingsList.innerHTML = '';

    if (teams.length === 0) {
        standingsList.innerHTML = '<p style="color: var(--text-secondary);">No teams yet</p>';
        return;
    }

    teams.slice(0, 10).forEach((team, index) => {
        const standingItem = document.createElement('div');
        standingItem.className = 'standing-item';
        
        standingItem.innerHTML = `
            <div class="standing-rank">#${index + 1}</div>
            <div class="standing-info">
                <div class="standing-team">${team.teamName}</div>
                <div class="standing-details">Clues: ${team.cluesFound || 0}/6 | Members: ${team.members ? team.members.length : 0}</div>
            </div>
            <div class="standing-score">${team.score || 0}</div>
        `;
        
        standingsList.appendChild(standingItem);
    });
}

// Declare winner
document.getElementById('declare-winner-btn').addEventListener('click', async () => {
    const winnerTeamId = document.getElementById('winner-team-select').value;
    
    if (!winnerTeamId) {
        showWinnerMessage('Please select a team', 'error');
        return;
    }

    const team = allTeams.find(t => t.id === winnerTeamId);
    if (!team) return;

    if (!confirm(`Declare "${team.teamName}" as the winner?`)) return;

    try {
        // Post winner announcement
        await db.collection('announcements').add({
            type: 'winner',
            title: '🏆 Winner Declared! 🏆',
            message: `Congratulations to Team ${team.teamName} for winning CyberCase: The Curious Hunt! They found ${team.cluesFound} clues with a total score of ${team.score}!`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            postedBy: currentAdmin.uid
        });

        // Mark team as winner
        await db.collection('teams').doc(winnerTeamId).update({
            winner: true,
            declaredWinnerAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showWinnerMessage('Winner declared successfully!', 'success');
        loadAnnouncementsHistory();
    } catch (error) {
        console.error('Error declaring winner:', error);
        showWinnerMessage('Error: ' + error.message, 'error');
    }
});

// Reset game
document.getElementById('reset-game-btn').addEventListener('click', async () => {
    if (!confirm('⚠️ WARNING: This will delete all team progress, submissions, and clues. Continue?')) return;
    if (!confirm('Are you ABSOLUTELY sure? This cannot be undone!')) return;

    try {
        // Reset all teams
        const batch = db.batch();
        allTeams.forEach(team => {
            const teamRef = db.collection('teams').doc(team.id);
            batch.update(teamRef, {
                cluesFound: 0,
                score: 0,
                submissions: [],
                clues: {
                    clue1: { word: '', found: false, timestamp: null },
                    clue2: { word: '', found: false, timestamp: null },
                    clue3: { word: '', found: false, timestamp: null },
                    clue4: { word: '', found: false, timestamp: null },
                    clue5: { word: '', found: false, timestamp: null },
                    clue6: { word: '', found: false, timestamp: null }
                },
                winner: false
            });
        });

        await batch.commit();
        alert('Game reset successfully!');
        await loadTeamsData();
    } catch (error) {
        console.error('Error resetting game:', error);
        alert('Error resetting game: ' + error.message);
    }
});

// Setup realtime listeners
function setupRealtimeListeners() {
    db.collection('teams').onSnapshot(() => {
        loadTeamsData();
        loadTeamsForClueSetup();
        loadTeamsForWinner();
        updateLiveStats();
    });

    // Listen to game state changes
    db.collection('gameState').doc('current').onSnapshot((doc) => {
        if (doc.exists) {
            updateGameStateUI(doc.data());
        }
    });
}

// ============= GAME CONTROL FEATURES =============

// Load game state
async function loadGameState() {
    try {
        const gameStateDoc = await db.collection('gameState').doc('current').get();
        
        if (!gameStateDoc.exists) {
            // Initialize game state
            await db.collection('gameState').doc('current').set({
                started: false,
                paused: false,
                ended: false,
                startedAt: null,
                endedAt: null,
                startedBy: null
            });
            updateGameStateUI({ started: false, paused: false, ended: false });
        } else {
            updateGameStateUI(gameStateDoc.data());
        }
    } catch (error) {
        console.error('Error loading game state:', error);
    }
}

// Update game state UI
function updateGameStateUI(gameState) {
    const statusIndicator = document.getElementById('game-status-indicator');
    const statusText = document.getElementById('game-status-text');
    const startBtn = document.getElementById('start-game-btn');
    const pauseBtn = document.getElementById('pause-game-btn');
    const endBtn = document.getElementById('end-game-btn');

    if (gameState.ended) {
        statusIndicator.className = 'status-indicator ended';
        statusText.textContent = '⏹️ Game Ended';
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'none';
        endBtn.style.display = 'none';
    } else if (gameState.paused) {
        statusIndicator.className = 'status-indicator paused';
        statusText.textContent = '⏸️ Game Paused';
        startBtn.style.display = 'inline-block';
        startBtn.textContent = '▶️ RESUME GAME';
        pauseBtn.style.display = 'none';
        endBtn.style.display = 'inline-block';
    } else if (gameState.started) {
        statusIndicator.className = 'status-indicator started';
        statusText.textContent = '🎮 Game Running';
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-block';
        endBtn.style.display = 'inline-block';
    } else {
        statusIndicator.className = 'status-indicator';
        statusText.textContent = '⏸️ Game Not Started';
        startBtn.style.display = 'inline-block';
        startBtn.textContent = '▶️ START GAME';
        pauseBtn.style.display = 'none';
        endBtn.style.display = 'none';
    }
}

// Setup game control listeners
function setupGameControlListeners() {
    document.getElementById('start-game-btn').addEventListener('click', startOrResumeGame);
    document.getElementById('pause-game-btn').addEventListener('click', pauseGame);
    document.getElementById('end-game-btn').addEventListener('click', endGame);
}

// Start or resume game
async function startOrResumeGame() {
    if (!confirm('Start/Resume the game? Players will be able to join and submit clues.')) return;

    try {
        const gameStateDoc = await db.collection('gameState').doc('current').get();
        const currentState = gameStateDoc.data();

        await db.collection('gameState').doc('current').update({
            started: true,
            paused: false,
            startedAt: currentState.startedAt || firebase.firestore.FieldValue.serverTimestamp(),
            startedBy: currentState.startedBy || currentAdmin.uid
        });

        // Post announcement
        await db.collection('announcements').add({
            type: 'update',
            title: currentState.started ? '🎮 Game Resumed!' : '🚀 Game Started!',
            message: currentState.started 
                ? 'The hunt continues! Keep searching for clues!'
                : 'CyberCase: The Curious Hunt has officially begun! Find the 6 hidden clues and race to the top of the leaderboard. Good luck, detectives! 🔍',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            postedBy: currentAdmin.uid
        });

        showGameControlMessage('Game started successfully!', 'success');
    } catch (error) {
        console.error('Error starting game:', error);
        showGameControlMessage('Error: ' + error.message, 'error');
    }
}

// Pause game
async function pauseGame() {
    if (!confirm('Pause the game? Teams will not be able to submit clues.')) return;

    try {
        await db.collection('gameState').doc('current').update({
            paused: true
        });

        await db.collection('announcements').add({
            type: 'warning',
            title: '⏸️ Game Paused',
            message: 'The game has been temporarily paused. Please stand by for further instructions.',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            postedBy: currentAdmin.uid
        });

        showGameControlMessage('Game paused successfully!', 'success');
    } catch (error) {
        console.error('Error pausing game:', error);
        showGameControlMessage('Error: ' + error.message, 'error');
    }
}

// End game
async function endGame() {
    if (!confirm('⚠️ END THE GAME? This will stop all activity and calculate final results.')) return;
    if (!confirm('Are you ABSOLUTELY sure? This cannot be undone!')) return;

    try {
        await db.collection('gameState').doc('current').update({
            ended: true,
            endedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('announcements').add({
            type: 'update',
            title: '🏁 Game Ended!',
            message: 'CyberCase: The Curious Hunt has concluded! Thank you all for participating. Check the leaderboard for final results.',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            postedBy: currentAdmin.uid
        });

        showGameControlMessage('Game ended successfully!', 'success');
    } catch (error) {
        console.error('Error ending game:', error);
        showGameControlMessage('Error: ' + error.message, 'error');
    }
}

// Update live stats
async function updateLiveStats() {
    let totalSubmissions = 0;
    let teamsCompleted = 0;

    allTeams.forEach(team => {
        if (team.submissions) {
            totalSubmissions += team.submissions.length;
        }
        if (team.cluesFound === 6) {
            teamsCompleted++;
        }
    });

    document.getElementById('live-teams').textContent = allTeams.length;
    document.getElementById('live-submissions').textContent = totalSubmissions;
    document.getElementById('live-completed').textContent = teamsCompleted;
}

function showGameControlMessage(text, type) {
    const messageDiv = document.getElementById('game-control-message');
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 5000);
}

// ============= AI ASSISTANT FEATURES =============

function setupAIFeatures() {
    document.getElementById('ai-chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendAIMessage();
        }
    });
}

// Send message to AI
async function sendAIMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    
    if (!message) return;

    const chatMessages = document.getElementById('ai-chat-messages');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message user';
    userMsg.innerHTML = `<strong>You:</strong> ${message}`;
    chatMessages.appendChild(userMsg);
    
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Show loading
    document.getElementById('ai-loading').style.display = 'block';

    try {
        const response = await callGeminiAI(`You are an AI assistant helping manage a treasure hunt game called "CyberCase: The Curious Hunt". Context: ${allTeams.length} teams are playing, finding 6 clues hidden in physical locations. User question: ${message}`);
        
        // Add AI response
        const aiMsg = document.createElement('div');
        aiMsg.className = 'ai-message assistant';
        aiMsg.innerHTML = `<strong>🤖 AI Assistant:</strong> ${response || 'Sorry, I could not generate a response.'}`;
        chatMessages.appendChild(aiMsg);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('AI Error:', error);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'ai-message assistant';
        errorMsg.innerHTML = `<strong>🤖 AI Assistant:</strong> Sorry, I encountered an error. Please try again.`;
        chatMessages.appendChild(errorMsg);
    } finally {
        document.getElementById('ai-loading').style.display = 'none';
    }
}

// Generate AI clues
window.generateAIClues = async function() {
    if (!confirm('Generate unique clues for all teams using AI?')) return;

    document.getElementById('ai-loading').style.display = 'block';

    try {
        const prompt = `Generate ${allTeams.length} sets of 6 unique crime/detective-themed words each for a treasure hunt game. Each set should be different. Format: Set 1: word1, word2, word3, word4, word5, word6 (newline) Set 2: ...`;
        
        const response = await callGeminiAI(prompt);
        
        if (response) {
            alert('AI generated clues! Check the AI tab for results.\n\n' + response);
            
            // Could auto-parse and assign clues here
            const chatMessages = document.getElementById('ai-chat-messages');
            const aiMsg = document.createElement('div');
            aiMsg.className = 'ai-message assistant';
            aiMsg.innerHTML = `<strong>🎯 Generated Clues:</strong><br>${response}`;
            chatMessages.appendChild(aiMsg);
        }
    } catch (error) {
        console.error('Error generating clues:', error);
        alert('Error generating clues with AI');
    } finally {
        document.getElementById('ai-loading').style.display = 'none';
    }
}

// Generate hint
window.generateHint = async function() {
    document.getElementById('ai-loading').style.display = 'block';

    try {
        const prompt = 'Generate a cryptic hint for a crime scene treasure hunt game. The hint should be mysterious and help players find hidden clue words without being too obvious. Keep it under 100 words.';
        
        const response = await callGeminiAI(prompt);
        
        if (response) {
            document.getElementById('announcement-title').value = 'New Hint Released!';
            document.getElementById('announcement-message').value = response;
            document.getElementById('announcement-type').value = 'hint';
            
            // Switch to announcements tab
            document.querySelector('[data-tab="announcements"]').click();
            
            alert('AI generated hint! Check the Announcements tab to post it.');
        }
    } catch (error) {
        console.error('Error generating hint:', error);
        alert('Error generating hint with AI');
    } finally {
        document.getElementById('ai-loading').style.display = 'none';
    }
}

// Generate announcement
window.generateAnnouncement = async function() {
    const type = prompt('Announcement type? (update/warning/hint/winner)') || 'update';
    
    document.getElementById('ai-loading').style.display = 'block';

    try {
        const prompt = `Generate a ${type} announcement for a college techfest treasure hunt game. Make it engaging and appropriate for the occasion. Keep it under 150 words.`;
        
        const response = await callGeminiAI(prompt);
        
        if (response) {
            document.getElementById('announcement-title').value = `${type.charAt(0).toUpperCase() + type.slice(1)} Announcement`;
            document.getElementById('announcement-message').value = response;
            document.getElementById('announcement-type').value = type;
            
            document.querySelector('[data-tab="announcements"]').click();
            alert('AI generated announcement! Check the Announcements tab.');
        }
    } catch (error) {
        console.error('Error generating announcement:', error);
        alert('Error generating announcement with AI');
    } finally {
        document.getElementById('ai-loading').style.display = 'none';
    }
}

// Analyze team performance
window.analyzeTeamPerformance = async function() {
    document.getElementById('ai-loading').style.display = 'block';

    try {
        const teamData = allTeams.map(t => `${t.teamName}: ${t.cluesFound}/6 clues, Score: ${t.score || 0}`).join('; ');
        const prompt = `Analyze this treasure hunt game performance data and provide insights: ${teamData}. Give brief analysis of trends, top performers, and suggestions.`;
        
        const response = await callGeminiAI(prompt);
        
        if (response) {
            const chatMessages = document.getElementById('ai-chat-messages');
            const aiMsg = document.createElement('div');
            aiMsg.className = 'ai-message assistant';
            aiMsg.innerHTML = `<strong>📊 Performance Analysis:</strong><br>${response}`;
            chatMessages.appendChild(aiMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            document.querySelector('[data-tab="ai"]').click();
        }
    } catch (error) {
        console.error('Error analyzing performance:', error);
        alert('Error analyzing performance with AI');
    } finally {
        document.getElementById('ai-loading').style.display = 'none';
    }
}

// Helper functions for messages
function showCluesMessage(text, type) {
    const messageDiv = document.getElementById('clues-message');
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 5000);
}

function showAnnouncementMessage(text, type) {
    const messageDiv = document.getElementById('announcement-message-status');
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 5000);
}

function showWinnerMessage(text, type) {
    const messageDiv = document.getElementById('winner-message');
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 5000);
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
}

// Logout
document.getElementById('admin-logout-btn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error logging out:', error);
    }
});
