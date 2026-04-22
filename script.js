// DOM Elements
const settingsMenu = document.getElementById('settingsMenu');
const darkBtn = document.getElementById('dark-btn');
const postsContainer = document.getElementById('postsContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const storyGallery = document.getElementById('storyGallery');
const eventsContainer = document.getElementById('eventsContainer');
const writePostContainer = document.getElementById('writePostContainer');
const submitPostBtn = document.getElementById('submitPostBtn');
const postContent = document.getElementById('postContent');
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authName = document.getElementById('authName');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const modalTitle = document.getElementById('modalTitle');
const authSwitch = document.getElementById('authSwitch');
const authMessage = document.getElementById('authMessage');
const navProfileImg = document.getElementById('navProfileImg');
const settingsUserName = document.getElementById('settingsUserName');
const settingsProfileImg = document.getElementById('settingsProfileImg');
const postProfileImg = document.getElementById('postProfileImg');
const postUserName = document.getElementById('postUserName');
const logoutBtn = document.getElementById('logoutBtn');

let currentPage = 1;
let isLoading = false;
let isLoggedIn = false;
let currentUser = null;

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        darkBtn.classList.add('dark-btn-on');
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    darkBtn.classList.toggle('dark-btn-on');
    const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
}

function toggleSettingsMenu() {
    settingsMenu.classList.toggle('show');
}

// Close settings menu when clicking outside
document.addEventListener('click', function(e) {
    if (!settingsMenu.contains(e.target) && !e.target.closest('.nav-user-icon')) {
        settingsMenu.classList.remove('show');
    }
});

// Modal functions
function openModal() {
    authModal.style.display = 'flex';
}

function closeModal() {
    authModal.style.display = 'none';
}

// Authentication
async function checkLogin() {
    try {
        const response = await fetch('api/check_session.php');
        const data = await response.json();
        
        if (data.loggedIn) {
            isLoggedIn = true;
            currentUser = data.user;
            closeModal();
            writePostContainer.style.display = 'block';
            updateUserUI();
            loadPosts();
            loadStories();
            loadEvents();
        } else {
            isLoggedIn = false;
            writePostContainer.style.display = 'none';
            openModal();
        }
    } catch (error) {
        console.error('Check login error:', error);
    }
}

function updateUserUI() {
    if (currentUser) {
        settingsUserName.textContent = currentUser.name;
        postUserName.textContent = currentUser.name;
        
        const profilePic = currentUser.profile_pic || 'images/profile-pic.png';
        navProfileImg.src = profilePic;
        settingsProfileImg.src = profilePic;
        postProfileImg.src = profilePic;
    }
}

// Auth form submission
authSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    const isLogin = authName.style.display === 'none';
    
    if (isLogin) {
        // Switch to register
        modalTitle.textContent = 'Register to SocialBook';
        authName.style.display = 'block';
        authSwitch.textContent = 'Back to Login';
        authSubmitBtn.textContent = 'Register';
        authMessage.textContent = '';
    } else {
        // Switch to login
        modalTitle.textContent = 'Login to SocialBook';
        authName.style.display = 'none';
        authSwitch.textContent = 'Create an account';
        authSubmitBtn.textContent = 'Login';
        authMessage.textContent = '';
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const isLogin = authName.style.display === 'none';
    
    if (!email || !password) {
        authMessage.textContent = 'Please fill in all fields';
        authMessage.style.color = 'red';
        return;
    }
    
    if (!isLogin) {
        const name = authName.value.trim();
        if (!name) {
            authMessage.textContent = 'Please enter your name';
            authMessage.style.color = 'red';
            return;
        }
        
        // Register
        try {
            const response = await fetch('api/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            
            if (data.success) {
                authMessage.textContent = data.message;
                authMessage.style.color = 'green';
                setTimeout(() => {
                    // Switch to login
                    modalTitle.textContent = 'Login to SocialBook';
                    authName.style.display = 'none';
                    authSwitch.textContent = 'Create an account';
                    authSubmitBtn.textContent = 'Login';
                    authEmail.value = email;
                    authPassword.value = '';
                    authMessage.textContent = '';
                }, 2000);
            } else {
                authMessage.textContent = data.message;
                authMessage.style.color = 'red';
            }
        } catch (error) {
            authMessage.textContent = 'Registration failed. Please try again.';
            authMessage.style.color = 'red';
        }
    } else {
        // Login
        try {
            const response = await fetch('api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (data.success) {
                isLoggedIn = true;
                currentUser = data.user;
                closeModal();
                writePostContainer.style.display = 'block';
                updateUserUI();
                loadPosts();
                loadStories();
                loadEvents();
            } else {
                authMessage.textContent = data.message;
                authMessage.style.color = 'red';
            }
        } catch (error) {
            authMessage.textContent = 'Login failed. Please try again.';
            authMessage.style.color = 'red';
        }
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await fetch('api/logout.php');
        isLoggedIn = false;
        currentUser = null;
        location.reload();
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Load Posts
async function loadPosts(reset = false) {
    if (reset) {
        currentPage = 1;
        postsContainer.innerHTML = '';
    }
    
    if (isLoading) return;
    isLoading = true;
    
    try {
        const response = await fetch(`api/get_posts.php?page=${currentPage}`);
        const posts = await response.json();
        
        if (posts.length === 0 && currentPage === 1) {
            postsContainer.innerHTML = '<div class="post-container"><p style="text-align:center;">No posts yet. Be the first to share something!</p></div>';
            loadMoreBtn.style.display = 'none';
        } else {
            posts.forEach(post => appendPost(post));
            loadMoreBtn.style.display = posts.length === 5 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Load posts error:', error);
    }
    
    isLoading = false;
}

function appendPost(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-container';
    postDiv.dataset.postId = post.id;
    
    const likeClass = post.liked_by_user ? 'liked' : '';
    const likeIcon = post.liked_by_user ? 'like-blue.png' : 'like.png';
    
    postDiv.innerHTML = `
        <div class="post-row">
            <div class="user-profile">
                <img src="images/${post.user_avatar}" alt="${escapeHtml(post.name)}">
                <div>
                    <p>${escapeHtml(post.name)}</p>
                    <span>${formatDate(post.created_at)}</span>
                </div>
            </div>
            <i class="fas fa-ellipsis-h"></i>
        </div>
        <p class="post-text">${formatPostContent(escapeHtml(post.content))}</p>
        ${post.image ? `<img src="${post.image}" class="post-img" alt="Post image">` : ''}
        <div class="post-row">
            <div class="activity-icons">
                <div class="like-btn ${likeClass}" data-post-id="${post.id}">
                    <img src="images/${likeIcon}" alt="Like">
                    <span class="like-count">${post.like_count}</span>
                </div>
                <div class="comment-toggle" data-post-id="${post.id}">
                    <img src="images/comments.png" alt="Comment">
                    <span class="comment-count">${post.comment_count}</span>
                </div>
                <div class="share-btn">
                    <img src="images/share.png" alt="Share">
                    <span>Share</span>
                </div>
            </div>
        </div>
        <div class="comments-section" style="display:none;"></div>
    `;
    
    postsContainer.appendChild(postDiv);
    
    // Attach event listeners
    const likeBtn = postDiv.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => likePost(post.id, likeBtn));
    
    const commentToggle = postDiv.querySelector('.comment-toggle');
    const commentsSection = postDiv.querySelector('.comments-section');
    commentToggle.addEventListener('click', () => toggleComments(post.id, commentsSection));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    
    return date.toLocaleDateString();
}

function formatPostContent(content) {
    // Simple hashtag and mention detection
    content = content.replace(/#(\w+)/g, '<a href="#">#$1</a>');
    content = content.replace(/@(\w+)/g, '<a href="#">@$1</a>');
    return content;
}

// Like Post
async function likePost(postId, btnElement) {
    if (!isLoggedIn) {
        alert('Please login to like posts');
        openModal();
        return;
    }
    
    try {
        const response = await fetch('api/like_post.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId })
        });
        const data = await response.json();
        
        if (data.success) {
            const img = btnElement.querySelector('img');
            const countSpan = btnElement.querySelector('.like-count');
            
            img.src = `images/${data.liked ? 'like-blue.png' : 'like.png'}`;
            countSpan.textContent = data.count;
            
            if (data.liked) {
                btnElement.classList.add('liked');
            } else {
                btnElement.classList.remove('liked');
            }
        }
    } catch (error) {
        console.error('Like error:', error);
    }
}

// Comments
async function toggleComments(postId, sectionDiv) {
    if (sectionDiv.style.display === 'none') {
        sectionDiv.style.display = 'block';
        
        if (sectionDiv.innerHTML === '') {
            try {
                const response = await fetch(`api/get_comments.php?post_id=${postId}`);
                const comments = await response.json();
                
                if (comments.length === 0) {
                    sectionDiv.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">No comments yet. Be the first to comment!</p>';
                } else {
                    let html = '<div class="comments-list">';
                    comments.forEach(comment => {
                        html += `
                            <div class="comment-item">
                                <img src="images/${comment.user_avatar}" alt="${escapeHtml(comment.name)}">
                                <div class="comment-content">
                                    <div class="comment-name">${escapeHtml(comment.name)}</div>
                                    <div class="comment-text">${escapeHtml(comment.comment)}</div>
                                    <small>${formatDate(comment.created_at)}</small>
                                </div>
                            </div>
                        `;
                    });
                    html += `</div>`;
                    html += `
                        <div class="add-comment">
                            <textarea placeholder="Write a comment..." rows="2"></textarea>
                            <button class="submit-comment" data-post-id="${postId}">Post</button>
                        </div>
                    `;
                    sectionDiv.innerHTML = html;
                    
                    const submitBtn = sectionDiv.querySelector('.submit-comment');
                    submitBtn.addEventListener('click', () => addComment(postId, sectionDiv));
                }
            } catch (error) {
                console.error('Load comments error:', error);
            }
        }
    } else {
        sectionDiv.style.display = 'none';
    }
}

async function addComment(postId, sectionDiv) {
    if (!isLoggedIn) {
        alert('Please login to comment');
        openModal();
        return;
    }
    
    const textarea = sectionDiv.querySelector('textarea');
    const comment = textarea.value.trim();
    
    if (!comment) return;
    
    try {
        const response = await fetch('api/add_comment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, comment })
        });
        const data = await response.json();
        
        if (data.success) {
            textarea.value = '';
            toggleComments(postId, sectionDiv);
            
            // Update comment count
            const postDiv = document.querySelector(`.post-container[data-post-id="${postId}"]`);
            const commentCountSpan = postDiv.querySelector('.comment-count');
            commentCountSpan.textContent = parseInt(commentCountSpan.textContent) + 1;
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Add comment error:', error);
    }
}

// Create Post
if (submitPostBtn) {
    submitPostBtn.addEventListener('click', async () => {
        if (!isLoggedIn) {
            alert('Please login to create posts');
            openModal();
            return;
        }
        
        const content = postContent.value.trim();
        if (!content) {
            alert('Please write something before posting');
            return;
        }
        
        try {
            const response = await fetch('api/create_post.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            const data = await response.json();
            
            if (data.success) {
                postContent.value = '';
                loadPosts(true);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Create post error:', error);
            alert('Failed to create post. Please try again.');
        }
    });
}

// Load Stories
async function loadStories() {
    try {
        const response = await fetch('api/get_stories.php');
        const stories = await response.json();
        
        storyGallery.innerHTML = '';
        
        if (isLoggedIn) {
            const addStory = document.createElement('div');
            addStory.className = 'story';
            addStory.style.backgroundImage = 'linear-gradient(transparent, rgba(0,0,0,0.5)), url(images/status-1.png)';
            addStory.innerHTML = '<img src="images/upload.png" alt="Add Story"><p>Post Story</p>';
            storyGallery.appendChild(addStory);
        }
        
        stories.forEach(story => {
            const storyDiv = document.createElement('div');
            storyDiv.className = 'story';
            storyDiv.style.backgroundImage = `linear-gradient(transparent, rgba(0,0,0,0.5)), url(images/status-2.png)`;
            storyDiv.innerHTML = `<img src="images/${story.user_avatar}" alt="${escapeHtml(story.name)}"><p>${escapeHtml(story.name)}</p>`;
            storyGallery.appendChild(storyDiv);
        });
    } catch (error) {
        console.error('Load stories error:', error);
    }
}

// Load Events
async function loadEvents() {
    try {
        const response = await fetch('api/get_events.php');
        const events = await response.json();
        
        eventsContainer.innerHTML = '';
        events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event';
            eventDiv.innerHTML = `
                <div class="left-event">
                    <h3>${new Date(event.event_date).getDate()}</h3>
                    <span>${new Date(event.event_date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div class="right-event">
                    <h4>${escapeHtml(event.title)}</h4>
                    <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}</p>
                    <a href="#">More Info</a>
                </div>
            `;
            eventsContainer.appendChild(eventDiv);
        });
    } catch (error) {
        console.error('Load events error:', error);
    }
}

// Load More
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadPosts();
    });
}

// Helper Functions
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Initialize
initTheme();
checkLogin();

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === authModal) {
        closeModal();
    }
}