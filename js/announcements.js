// Announcements Page Logic - Display Hints and Updates

let announcements = [];

// Load announcements
async function loadAnnouncements() {
    try {
        const announcementsSnapshot = await db.collection('announcements')
            .orderBy('timestamp', 'desc')
            .get();

        announcements = [];
        announcementsSnapshot.forEach((doc) => {
            announcements.push({ id: doc.id, ...doc.data() });
        });

        displayAnnouncements();
    } catch (error) {
        console.error('Error loading announcements:', error);
        displayNoAnnouncements();
    }
}

// Display announcements
function displayAnnouncements() {
    const announcementsList = document.getElementById('announcements-list');
    const noAnnouncementsDiv = document.getElementById('no-announcements');

    if (announcements.length === 0) {
        announcementsList.style.display = 'none';
        noAnnouncementsDiv.style.display = 'flex';
        return;
    }

    noAnnouncementsDiv.style.display = 'none';
    announcementsList.style.display = 'flex';
    announcementsList.innerHTML = '';

    announcements.forEach((announcement) => {
        const announcementCard = document.createElement('div');
        announcementCard.className = `announcement-card ${announcement.type}`;
        
        // Check if announcement is less than 1 hour old
        const isNew = isRecentAnnouncement(announcement.timestamp);
        
        const typeIcon = getTypeIcon(announcement.type);
        
        announcementCard.innerHTML = `
            ${isNew ? '<div class="new-badge">NEW</div>' : ''}
            <div class="announcement-header">
                <span class="announcement-type ${announcement.type}">
                    ${typeIcon} ${announcement.type}
                </span>
                <span class="announcement-time">${formatTimestamp(announcement.timestamp)}</span>
            </div>
            <h3 class="announcement-title">${announcement.title}</h3>
            <p class="announcement-message">${announcement.message}</p>
        `;
        
        announcementsList.appendChild(announcementCard);
    });
}

// Get icon for announcement type
function getTypeIcon(type) {
    const icons = {
        'hint': '💡',
        'update': '📰',
        'warning': '⚠️',
        'winner': '🎉'
    };
    return icons[type] || '📢';
}

// Check if announcement is recent (less than 1 hour old)
function isRecentAnnouncement(timestamp) {
    if (!timestamp) return false;
    
    const announcementTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMinutes = (now - announcementTime) / (1000 * 60);
    
    return diffMinutes < 60;
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
}

// Display no announcements message
function displayNoAnnouncements() {
    const announcementsList = document.getElementById('announcements-list');
    const noAnnouncementsDiv = document.getElementById('no-announcements');
    
    announcementsList.style.display = 'none';
    noAnnouncementsDiv.style.display = 'flex';
}

// Setup realtime updates
function setupRealtimeAnnouncements() {
    db.collection('announcements')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            announcements = [];
            snapshot.forEach((doc) => {
                announcements.push({ id: doc.id, ...doc.data() });
            });
            displayAnnouncements();
        }, (error) => {
            console.error('Error in realtime listener:', error);
        });
}

// Initialize announcements page
document.addEventListener('DOMContentLoaded', () => {
    loadAnnouncements();
    setupRealtimeAnnouncements();
});
