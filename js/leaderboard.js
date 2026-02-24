// Leaderboard Logic - Real-time Team Rankings

let teamsData = [];

// Load and display leaderboard
async function loadLeaderboard() {
    try {
        // Query teams ordered by score and clues found
        const teamsSnapshot = await db.collection('teams')
            .orderBy('score', 'desc')
            .orderBy('cluesFound', 'desc')
            .orderBy('createdAt', 'asc')
            .get();

        teamsData = [];
        teamsSnapshot.forEach((doc) => {
            teamsData.push({ id: doc.id, ...doc.data() });
        });

        displayPodium();
        displayLeaderboard();
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        displayEmptyState();
    }
}

// Display top 3 teams on podium
function displayPodium() {
    const podium = document.getElementById('podium');
    podium.innerHTML = '';

    if (teamsData.length === 0) {
        podium.innerHTML = '<p style="color: var(--text-secondary); text-align: center; width: 100%;">No teams yet</p>';
        return;
    }

    // Get top 3 teams
    const top3 = teamsData.slice(0, 3);
    const positions = ['second', 'first', 'third']; // Display order for visual effect
    const indices = [1, 0, 2]; // Actual rank indices

    // Reorder for visual display (2nd, 1st, 3rd)
    const displayOrder = [];
    indices.forEach(idx => {
        if (top3[idx]) {
            displayOrder.push(top3[idx]);
        }
    });

    displayOrder.forEach((team, idx) => {
        const position = positions[idx];
        const actualRank = indices[idx] + 1;
        
        const podiumItem = document.createElement('div');
        podiumItem.className = `podium-item ${position}`;
        
        const trophy = actualRank === 1 ? '🥇' : actualRank === 2 ? '🥈' : '🥉';
        
        podiumItem.innerHTML = `
            <div class="podium-stand">
                <div class="podium-rank">${actualRank}</div>
                <div class="podium-trophy">${trophy}</div>
                <div class="podium-team">${team.teamName}</div>
                <div class="podium-clues">${team.cluesFound || 0}/6 Clues</div>
                <div class="podium-score">Score: ${team.score || 0}</div>
            </div>
        `;
        
        podium.appendChild(podiumItem);
    });
}

// Display full leaderboard table
function displayLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = '';

    if (teamsData.length === 0) {
        displayEmptyState();
        return;
    }

    teamsData.forEach((team, index) => {
        const rank = index + 1;
        const lastSubmitTime = getLastSubmitTime(team);
        
        const teamRow = document.createElement('div');
        teamRow.className = 'team-row';
        
        teamRow.innerHTML = `
            <span class="col-rank">#${rank}</span>
            <span class="col-team">${team.teamName}</span>
            <span class="col-clues">${team.cluesFound || 0}/6</span>
            <span class="col-time">${lastSubmitTime}</span>
            <span class="col-score">${team.score || 0}</span>
        `;
        
        leaderboardBody.appendChild(teamRow);
    });
}

// Get last submission time for a team
function getLastSubmitTime(team) {
    if (!team.submissions || team.submissions.length === 0) {
        return 'No submissions';
    }

    // Find most recent correct submission
    const correctSubmissions = team.submissions.filter(s => s.correct);
    if (correctSubmissions.length === 0) {
        return 'No correct clues yet';
    }

    const lastSubmission = correctSubmissions[correctSubmissions.length - 1];
    const timestamp = lastSubmission.timestamp;
    
    if (timestamp) {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return formatTimestamp(date);
    }
    
    return 'Recently';
}

// Format timestamp
function formatTimestamp(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

// Display empty state
function displayEmptyState() {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = `
        <div class="empty-leaderboard">
            <div class="empty-icon">🏆</div>
            <p>No teams registered yet</p>
        </div>
    `;
}

// Setup realtime updates
function setupRealtimeLeaderboard() {
    db.collection('teams')
        .orderBy('score', 'desc')
        .orderBy('cluesFound', 'desc')
        .onSnapshot((snapshot) => {
            teamsData = [];
            snapshot.forEach((doc) => {
                teamsData.push({ id: doc.id, ...doc.data() });
            });
            displayPodium();
            displayLeaderboard();
        }, (error) => {
            console.error('Error in realtime listener:', error);
        });
}

// Initialize leaderboard
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    setupRealtimeLeaderboard();
    
    // Refresh every 30 seconds as backup
    setInterval(() => {
        loadLeaderboard();
    }, 30000);
});
