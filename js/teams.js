// Teams List Page Logic

let allTeams = [];
let filteredTeams = [];

// Load teams on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTeams();
    setupSearch();
});

// Load all teams
async function loadTeams() {
    try {
        const teamsSnapshot = await db.collection('teams')
            .orderBy('createdAt', 'desc')
            .get();

        allTeams = teamsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        filteredTeams = [...allTeams];
        displayTeams();
        updateTeamCount();
    } catch (error) {
        console.error('Error loading teams:', error);
        document.getElementById('teams-grid').innerHTML = `
            <div class="no-teams">
                <h3>⚠️ Error Loading Teams</h3>
                <p>Please refresh the page to try again.</p>
            </div>
        `;
    }
}

// Display teams in grid
function displayTeams() {
    const teamsGrid = document.getElementById('teams-grid');
    const noTeamsDiv = document.getElementById('no-teams');
    
    if (filteredTeams.length === 0) {
        teamsGrid.style.display = 'none';
        noTeamsDiv.style.display = 'block';
        return;
    }

    teamsGrid.style.display = 'grid';
    noTeamsDiv.style.display = 'none';
    
    teamsGrid.innerHTML = filteredTeams.map(team => `
        <div class="team-card">
            <h3 class="team-name">${escapeHtml(team.teamName)}</h3>
            <div class="team-info">
                <strong class="team-leader">👑 Leader:</strong> ${escapeHtml(team.leaderName)}
            </div>
            <div class="team-info">
                📧 ${escapeHtml(team.leaderEmail)}
            </div>
            <div class="team-info">
                📅 Created: ${formatDate(team.createdAt)}
            </div>
            
            <div class="team-stats">
                <div class="stat">
                    <div class="stat-value">${team.members ? team.members.length : 1}</div>
                    <div class="stat-label">Members</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${team.cluesFound || 0}</div>
                    <div class="stat-label">Clues Found</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${team.score || 0}</div>
                    <div class="stat-label">Score</div>
                </div>
            </div>
            
            <button class="join-btn" onclick="joinTeam('${escapeHtml(team.teamName)}')">
                Join This Team
            </button>
        </div>
    `).join('');
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredTeams = [...allTeams];
        } else {
            filteredTeams = allTeams.filter(team => 
                team.teamName.toLowerCase().includes(searchTerm) ||
                team.leaderName.toLowerCase().includes(searchTerm) ||
                team.leaderEmail.toLowerCase().includes(searchTerm)
            );
        }
        
        displayTeams();
        updateTeamCount();
    });
}

// Update team count display
function updateTeamCount() {
    const countElement = document.getElementById('team-count');
    if (allTeams.length === 0) {
        countElement.textContent = 'No teams yet';
    } else if (filteredTeams.length === allTeams.length) {
        countElement.textContent = `${allTeams.length} team${allTeams.length !== 1 ? 's' : ''} registered`;
    } else {
        countElement.textContent = `${filteredTeams.length} of ${allTeams.length} teams`;
    }
}

// Join team function
window.joinTeam = function(teamName) {
    // Redirect to signup page with team name
    window.location.href = `signup-enhanced.html?role=member&team=${encodeURIComponent(teamName)}`;
};

// Format date
function formatDate(timestamp) {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Real-time updates
db.collection('teams').onSnapshot(() => {
    loadTeams();
});
