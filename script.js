// DOM Elements
const settingsMenu = document.querySelector(".settings-menu");
const darkBtn = document.getElementById("dark-btn");
const postsContainer = document.getElementById("postsContainer");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const storyGallery = document.getElementById("storyGallery");
const eventsContainer = document.getElementById("eventsContainer");
const writePostContainer = document.getElementById("writePostContainer");
const submitPostBtn = document.getElementById("submitPostBtn");
const postContent = document.getElementById("postContent");
const authModal = document.getElementById("authModal");
const authForm = document.getElementById("authForm");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const modalTitle = document.getElementById("modalTitle");
const authSwitch = document.getElementById("authSwitch");
const authMessage = document.getElementById("authMessage");
const navProfileImg = document.getElementById("navProfileImg");
const settingsUserName = document.getElementById("settingsUserName");
const settingsProfileImg = document.querySelector("#settingsProfile img");
const postProfileImg = document.getElementById("postProfileImg");
const postUserName = document.getElementById("postUserName");

let currentPage = 1;
let isLoading = false;
let isLoggedIn = false;

// Theme handling
function settingsMenuToggle() {
    settingsMenu.classList.toggle("settings-menu-height");
}

darkBtn.onclick = function() {
    darkBtn.classList.toggle("dark-btn-on");
    document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
};

if (localStorage.getItem("theme") === "dark") {
    darkBtn.classList.add("dark-btn-on");
    document.body.classList.add("dark-theme");
} else {
    darkBtn.classList.remove("dark-btn-on");
    document.body.classList.remove("dark-theme");
}

// Check login status
async function checkLogin() {
    try {
        const res = await fetch('api/check_session.php');
        const data = await res.json();
        if (data.loggedIn) {
            isLoggedIn = true;
            document.getElementById("authModal").style.display = "none";
            writePostContainer.style.display = "block";
            // Update UI with user info
            settingsUserName.innerText = data.user.name;
            postUserName.innerText = data.user.name;
            // You can update profile pics from server if available
        } else {
            isLoggedIn = false;
            writePostContainer.style.display = "none";
            authModal.style.display = "flex";
        }
    } catch (err) {
        console.error(err);
    }
}

// Create a simple session check endpoint (add to api/check_session.php)
// We'll add that file below.

// Load posts
async function loadPosts(reset = false) {
    if (reset) {
        currentPage = 1;
        postsContainer.innerHTML = '';
    }
    if (isLoading) return;
    isLoading = true;
    try {
        const res = await fetch(`api/get_posts.php?page=${currentPage}`);
        const posts = await res.json();
        if (posts.length === 0 && currentPage === 1) {
            postsContainer.innerHTML = '<p>No posts yet. Be the first to share!</p>';
            loadMoreBtn.style.display = 'none';
        } else {
            posts.forEach(post => appendPost(post));
            if (posts.length < 5) loadMoreBtn.style.display = 'none';
            else loadMoreBtn.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
    }
    isLoading = false;
}

function appendPost(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-container';
    postDiv.dataset.postId = post.id;
    const likeImg = post.liked_by_user ? 'like-blue.png' : 'like.png';
    postDiv.innerHTML = `
        <div class="post-row">
            <div class="user-profile">
                <img src="images/${post.user_avatar}" alt="">
                <div>
                    <p>${escapeHtml(post.name)}</p>
                    <span>${new Date(post.created_at).toLocaleString()}</span>
                </div>
            </div>
            <a href="#"><img src="images/more.png"></a>
        </div>
        <p class="post-text">${escapeHtml(post.content)}</p>
        ${post.image ? `<img src="${post.image}" class="post-img">` : ''}
        <div class="post-row">
            <div class="activity-icons">
                <div class="like-btn" data-post-id="${post.id}">
                    <img src="images/${likeImg}">
                    <span class="like-count">${post.like_count}</span>
                </div>
                <div class="comment-toggle" data-post-id="${post.id}">
                    <img src="images/comments.png">
                    <span class="comment-count">${post.comment_count}</span>
                </div>
                <div><img src="images/share.png"> Share</div>
            </div>
        </div>
        <div class="comments-section" style="display:none; margin-top:15px;"></div>
    `;
    postsContainer.appendChild(postDiv);

    // Attach like button event
    const likeBtn = postDiv.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => likePost(post.id, likeBtn));

    // Attach comment toggle
    const commentToggle = postDiv.querySelector('.comment-toggle');
    const commentsSection = postDiv.querySelector('.comments-section');
    commentToggle.addEventListener('click', () => toggleComments(post.id, commentsSection));
}

async function likePost(postId, btnElement) {
    if (!isLoggedIn) { alert('Please login to like'); return; }
    try {
        const res = await fetch('api/like_post.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId })
        });
        const data = await res.json();
        if (data.success) {
            const img = btnElement.querySelector('img');
            const countSpan = btnElement.querySelector('.like-count');
            img.src = `images/${data.liked ? 'like-blue.png' : 'like.png'}`;
            countSpan.innerText = data.count;
        }
    } catch (err) { console.error(err); }
}

async function toggleComments(postId, sectionDiv) {
    if (sectionDiv.style.display === 'none') {
        sectionDiv.style.display = 'block';
        if (sectionDiv.innerHTML === '') {
            try {
                const res = await fetch(`api/get_comments.php?post_id=${postId}`);
                const comments = await res.json();
                if (comments.length === 0) {
                    sectionDiv.innerHTML = '<p>No comments yet.</p>';
                } else {
                    let html = '<div class="comments-list">';
                    comments.forEach(c => {
                        html += `
                            <div class="user-profile" style="margin:10px 0;">
                                <img src="images/${c.user_avatar}" style="width:30px; height:30px;">
                                <div>
                                    <p style="font-size:13px;">${escapeHtml(c.name)}</p>
                                    <small>${escapeHtml(c.comment)}</small>
                                </div>
                            </div>
                        `;
                    });
                    html += `</div><div class="add-comment"><textarea placeholder="Write a comment..." rows="2" style="width:100%; margin-top:10px;"></textarea><button class="submit-comment" data-post-id="${postId}">Post</button></div>`;
                    sectionDiv.innerHTML = html;
                    sectionDiv.querySelector('.submit-comment').addEventListener('click', () => addComment(postId, sectionDiv));
                }
            } catch (err) { console.error(err); }
        }
    } else {
        sectionDiv.style.display = 'none';
    }
}

async function addComment(postId, sectionDiv) {
    if (!isLoggedIn) { alert('Please login to comment'); return; }
    const textarea = sectionDiv.querySelector('textarea');
    const comment = textarea.value.trim();
    if (!comment) return;
    try {
        const res = await fetch('api/add_comment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, comment })
        });
        const data = await res.json();
        if (data.success) {
            textarea.value = '';
            toggleComments(postId, sectionDiv);
            // Update comment count on post
            const commentCountSpan = document.querySelector(`.post-container[data-post-id="${postId}"] .comment-count`);
            if (commentCountSpan) {
                let count = parseInt(commentCountSpan.innerText);
                commentCountSpan.innerText = count + 1;
            }
        } else alert(data.message);
    } catch (err) { console.error(err); }
}

// Load stories
async function loadStories() {
    try {
        const res = await fetch('api/get_stories.php');
        const stories = await res.json();
        storyGallery.innerHTML = '';
        stories.forEach(story => {
            const storyDiv = document.createElement('div');
            storyDiv.className = 'story';
            storyDiv.style.backgroundImage = `linear-gradient(transparent, rgba(0,0,0,0.5)), url(images/${story.image})`;
            storyDiv.innerHTML = `<img src="images/${story.user_avatar || 'profile-pic.png'}"><p>${escapeHtml(story.name)}</p>`;
            storyGallery.appendChild(storyDiv);
        });
        // Add default "Post Story" if logged in
        if (isLoggedIn) {
            const addStory = document.createElement('div');
            addStory.className = 'story story1';
            addStory.innerHTML = '<img src="images/upload.png"><p>Post Story</p>';
            storyGallery.prepend(addStory);
        }
    } catch (err) { console.error(err); }
}

// Load events
async function loadEvents() {
    try {
        const res = await fetch('api/get_events.php');
        const events = await res.json();
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
                    <p><img src="images/location.png">${escapeHtml(event.location)}</p>
                    <a href="#">More Info</a>
                </div>
            `;
            eventsContainer.appendChild(eventDiv);
        });
    } catch (err) { console.error(err); }
}

// Create new post
if (submitPostBtn) {
    submitPostBtn.addEventListener('click', async () => {
        if (!isLoggedIn) { alert('Please login first'); return; }
        const content = postContent.value.trim();
        if (!content) return alert('Write something');
        try {
            const res = await fetch('api/create_post.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            const data = await res.json();
            if (data.success) {
                postContent.value = '';
                currentPage = 1;
                loadPosts(true);
            } else alert(data.message);
        } catch (err) { console.error(err); }
    });
}

// Load more
loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    loadPosts();
});

// Authentication modal logic
let isLoginMode = true;
authSwitch.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        modalTitle.innerText = 'Login';
        authName.style.display = 'none';
        authSwitch.innerText = 'Create an account';
        authForm.querySelector('button').innerText = 'Login';
    } else {
        modalTitle.innerText = 'Register';
        authName.style.display = 'block';
        authSwitch.innerText = 'Back to Login';
        authForm.querySelector('button').innerText = 'Register';
    }
    authMessage.innerText = '';
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authEmail.value.trim();
    const password = authPassword.value;
    if (!email || !password) return;
    if (!isLoginMode) {
        const name = authName.value.trim();
        if (!name) return;
        const res = await fetch('api/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (data.success) {
            authMessage.style.color = 'green';
            authMessage.innerText = data.message;
            setTimeout(() => {
                authSwitch.click(); // switch to login
            }, 1500);
        } else {
            authMessage.style.color = 'red';
            authMessage.innerText = data.message;
        }
    } else {
        const res = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            isLoggedIn = true;
            authModal.style.display = 'none';
            writePostContainer.style.display = 'block';
            settingsUserName.innerText = data.user.name;
            postUserName.innerText = data.user.name;
            loadPosts(true);
            loadStories();
        } else {
            authMessage.innerText = data.message;
        }
    }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await fetch('api/logout.php');
    location.reload();
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Initial load
checkLogin().then(() => {
    if (isLoggedIn) {
        loadPosts();
        loadStories();
        loadEvents();
    } else {
        // Show login modal
        authModal.style.display = 'flex';
    }
});