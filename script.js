// ========== ORIGINAL FUNCTIONS (UNCHANGED) ==========
var settingsmenu = document.querySelector(".settings-menu");
var darkBtn = document.getElementById("dark-btn");

function settingsMenuToggle(){
    settingsmenu.classList.toggle("settings-menu-height");
}

darkBtn.onclick = function(){
    darkBtn.classList.toggle("dark-btn-on");
    document.body.classList.toggle("dark-theme");
    if(localStorage.getItem("theme") == "light"){
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light"); 
    }
}

if(localStorage.getItem("theme") == "light"){
    darkBtn.classList.remove("dark-btn-on");
    document.body.classList.remove("dark-theme");
} else if(localStorage.getItem("theme")== "dark"){
    darkBtn.classList.add("dark-btn-on");
    document.body.classList.add("dark-theme");
} else {
    localStorage.setItem("theme", "light");
}

// ========== NEW BACKEND DYNAMICS ==========
let currentPage = 1;
let isLoading = false;
const postsContainer = document.querySelector(".main-content");
const loadMoreBtn = document.querySelector(".load-more-btn");
const writePostTextarea = document.querySelector(".write-post-container textarea");
const submitPostArea = document.querySelector(".add-post-links");

// Remove static posts from HTML (they will be replaced by dynamic ones)
function clearStaticPosts() {
    const allPostContainers = document.querySelectorAll(".post-container");
    allPostContainers.forEach(container => {
        if (!container.closest(".write-post-container")) {
            container.remove();
        }
    });
}

// Load posts from API
async function loadPosts(reset = false) {
    if (reset) {
        currentPage = 1;
        clearStaticPosts();
        const existingDynamic = document.querySelectorAll(".dynamic-post");
        existingDynamic.forEach(el => el.remove());
    }
    if (isLoading) return;
    isLoading = true;

    try {
        const res = await fetch(`api/get_posts.php?page=${currentPage}`);
        const posts = await res.json();
        
        if (posts.length === 0 && currentPage === 1) {
            const noPostsMsg = document.createElement("p");
            noPostsMsg.textContent = "No posts yet. Write something!";
            noPostsMsg.style.textAlign = "center";
            noPostsMsg.style.margin = "20px";
            postsContainer.insertBefore(noPostsMsg, loadMoreBtn);
            loadMoreBtn.style.display = "none";
        } else {
            posts.forEach(post => appendPost(post));
            if (posts.length < 5) loadMoreBtn.style.display = "none";
            else loadMoreBtn.style.display = "block";
        }
    } catch (err) {
        console.error("Failed to load posts:", err);
    }
    isLoading = false;
}

// Create a post element (matching original structure)
function appendPost(post) {
    const postDiv = document.createElement("div");
    postDiv.className = "post-container dynamic-post";
    postDiv.setAttribute("data-post-id", post.id);
    
    const likeImg = post.liked_by_user ? "like-blue.png" : "like.png";
    const profilePic = post.user_avatar || "profile-pic.png";
    
    postDiv.innerHTML = `
        <div class="post-row">
            <div class="user-profile">
                <img src="images/${profilePic}">
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
            <div class="post-user-icons">
                <img src="images/profile-pic.png"><a href="#"><img src="images/arrow.png"></a>
            </div>
        </div>
        <div class="comments-section" style="display:none; margin-top:15px;"></div>
    `;
    
    // Insert before Load More button
    postsContainer.insertBefore(postDiv, loadMoreBtn);
    
    // Attach like event
    const likeBtn = postDiv.querySelector(".like-btn");
    likeBtn.addEventListener("click", () => likePost(post.id, likeBtn));
    
    // Attach comment toggle
    const commentToggle = postDiv.querySelector(".comment-toggle");
    const commentsSection = postDiv.querySelector(".comments-section");
    commentToggle.addEventListener("click", () => toggleComments(post.id, commentsSection));
}

// Like / Unlike
async function likePost(postId, btnElement) {
    try {
        const res = await fetch("api/like_post.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_id: postId })
        });
        const data = await res.json();
        if (data.success) {
            const img = btnElement.querySelector("img");
            const countSpan = btnElement.querySelector(".like-count");
            img.src = `images/${data.liked ? "like-blue.png" : "like.png"}`;
            countSpan.innerText = data.count;
        }
    } catch (err) {
        console.error(err);
    }
}

// Show / Load comments
async function toggleComments(postId, sectionDiv) {
    if (sectionDiv.style.display === "none") {
        sectionDiv.style.display = "block";
        if (sectionDiv.innerHTML === "") {
            try {
                const res = await fetch(`api/get_comments.php?post_id=${postId}`);
                const comments = await res.json();
                if (comments.length === 0) {
                    sectionDiv.innerHTML = "<p>No comments yet.</p>";
                } else {
                    let html = `<div class="comments-list">`;
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
                    const submitBtn = sectionDiv.querySelector(".submit-comment");
                    submitBtn.addEventListener("click", () => addComment(postId, sectionDiv));
                }
            } catch (err) { console.error(err); }
        }
    } else {
        sectionDiv.style.display = "none";
    }
}

// Add a comment
async function addComment(postId, sectionDiv) {
    const textarea = sectionDiv.querySelector("textarea");
    const comment = textarea.value.trim();
    if (!comment) return;
    try {
        const res = await fetch("api/add_comment.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_id: postId, comment })
        });
        const data = await res.json();
        if (data.success) {
            textarea.value = "";
            // Refresh comments section
            sectionDiv.innerHTML = "";
            sectionDiv.style.display = "none";
            toggleComments(postId, sectionDiv);
            // Increase comment count on the post
            const commentCountSpan = document.querySelector(`.post-container[data-post-id="${postId}"] .comment-count`);
            if (commentCountSpan) {
                let count = parseInt(commentCountSpan.innerText);
                commentCountSpan.innerText = count + 1;
            }
        } else {
            alert(data.message);
        }
    } catch (err) { console.error(err); }
}

// Create a new post
function setupPostCreation() {
    if (!submitPostArea) return;
    const postButton = document.createElement("button");
    postButton.textContent = "Post";
    postButton.className = "load-more-btn";
    postButton.style.background = "#1876f2";
    postButton.style.color = "white";
    postButton.style.border = "none";
    postButton.style.marginLeft = "10px";
    submitPostArea.appendChild(postButton);
    
    postButton.addEventListener("click", async () => {
        const content = writePostTextarea.value.trim();
        if (!content) return alert("Please write something");
        try {
            const res = await fetch("api/create_post.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content })
            });
            const data = await res.json();
            if (data.success) {
                writePostTextarea.value = "";
                loadPosts(true); // reload all posts
            } else {
                alert(data.message);
            }
        } catch (err) { console.error(err); }
    });
}

// Helper: escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === "&") return "&amp;";
        if (m === "<") return "&lt;";
        if (m === ">") return "&gt;";
        return m;
    });
}

// Load More button event
loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    loadPosts();
});

// Initialise
clearStaticPosts();
loadPosts();
setupPostCreation();