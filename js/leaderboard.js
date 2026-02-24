// Leaderboard Logic - Real-time Team Rankings

let teamsData = [];

// Setup realtime updates (primary method)
function setupRealtimeLeaderboard() {
    db.collection('teams')
        .onSnapshot((snapshot) => {
            teamsData = [];
            snapshot.forEach((doc) => {
                teamsData.push({ id: doc.id, ...doc.data() });
            });
            
            // Sort on client side to avoid index requirements
            teamsData.sort((a, b) => {
                // Primary: Sort by score (descending)
                if ((b.score || 0) !== (a.score || 0)) {
                    return (b.score || 0) - (a.score || 0);
                }
                // Secondary: Sort by clues found (descending)
                if ((b.cluesFound || 0) !== (a.cluesFound || 0)) {
                    return (b.cluesFound || 0) - (a.cluesFound || 0);
                }
                // Tertiary: Sort by creation time (ascending)
                const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                return aTime - bTime;
            });
            
            displayPodium();
            displayLeaderboard();
        }, (error) => {
            console.error('Error in realtime listener:', error);
            displayEmptyState();
        });
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
        const lastClueTime = getLastClueFoundTime(team);
        
        const teamRow = document.createElement('div');
        teamRow.className = 'team-row';
        
        teamRow.innerHTML = `
            <span class="col-rank">#${rank}</span>
            <span class="col-team">${team.teamName}</span>
            <span class="col-clues">${team.cluesFound || 0}/6</span>
            <span class="col-time">${lastClueTime}</span>
            <span class="col-score">${team.score || 0}</span>
        `;
        
        leaderboardBody.appendChild(teamRow);
    });
}

// Get last clue found time from clues object
function getLastClueFoundTime(team) {
    if (!team.clues || team.cluesFound === 0) {
        return 'No clues yet';
    }

    // Find the most recent timestamp from all found clues
    let latestTimestamp = null;
    let latestClueNumber = null;
    
    for (let i = 1; i <= 6; i++) {
        const clueKey = `clue${i}`;
        const clue = team.clues[clueKey];
        
        if (clue && clue.found && clue.timestamp) {
            const timestamp = clue.timestamp.toDate ? clue.timestamp.toDate() : new Date(clue.timestamp);
            
            if (!latestTimestamp || timestamp > latestTimestamp) {
                latestTimestamp = timestamp;
                latestClueNumber = i;
            }
        }
    }
    
    if (!latestTimestamp) {
        return 'No clues yet';
    }
    
    return `Clue ${latestClueNumber} - ${formatTimestamp(latestTimestamp)}`;
}

// Get last submission time for a team (legacy - keeping for backwards compatibility)
function getLastSubmitTime(team) {
    return getLastClueFoundTime(team);
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

// Initialize leaderboard with real-time updates
document.addEventListener('DOMContentLoaded', () => {
    setupRealtimeLeaderboard();
});
