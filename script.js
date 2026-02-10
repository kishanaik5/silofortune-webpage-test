
document.addEventListener('DOMContentLoaded', () => {
    // Product Slider Logic
    const slider = document.getElementById('productsSlider');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');

    if (slider && prevBtn && nextBtn) {
        nextBtn.addEventListener('click', () => {
            slider.scrollBy({
                left: 340, // width of card + gap
                behavior: 'smooth'
            });
        });

        prevBtn.addEventListener('click', () => {
            slider.scrollBy({
                left: -340,
                behavior: 'smooth'
            });
        });
    }

    // Toggle Mobile Navigation
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }


    // Inject WhatsApp Button
    const whatsappBtn = document.createElement('a');
    whatsappBtn.href = "https://wa.me/919535339311?text=Hi, I would like to know more about Silo Fortune products.";
    whatsappBtn.target = "_blank";
    whatsappBtn.className = "whatsapp-float";
    whatsappBtn.innerHTML = '<img src="assets/whatsapp_logo.png" alt="WhatsApp Chat">';
    if (!document.querySelector('.whatsapp-float')) {
        document.body.appendChild(whatsappBtn);
    }

    // Inject Auth UI (Button & Modal)
    injectAuthUI();

    // Check Authentication
    checkAuth();
});

function injectAuthUI() {
    // 1. Inject Login Button into Navbar
    const navContainer = document.querySelector('.nav-container');
    if (navContainer && !document.getElementById('authTrigger')) {
        const btn = document.createElement('button');
        btn.id = 'authTrigger';
        btn.textContent = 'Login';
        // Insert before the toggle button (hamburger)
        const toggle = document.getElementById('navToggle');
        navContainer.insertBefore(btn, toggle);

        btn.addEventListener('click', openAuthModal);
    }

    // 2. Inject Modal HTML
    if (!document.getElementById('authModal')) {
        const modalHTML = `
        <div id="authModal" class="modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                
                <!-- Login Section -->
                <div id="loginSection">
                    <h2>Welcome Back</h2>
                    <form id="loginFormGlobal" class="contact-form" style="box-shadow: none; padding: 0;">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" id="loginEmail" class="form-input" autocomplete="username" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="loginPassword" class="form-input" autocomplete="current-password" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                    </form>
                    <p class="auth-toggle">Don't have an account? <a onclick="toggleAuth('register')">Register</a></p>
                </div>

                <!-- Register Section -->
                <div id="registerSection" style="display: none;">
                    <h2>Create Account</h2>
                    <form id="registerFormGlobal" class="contact-form" style="box-shadow: none; padding: 0;">
                        <!-- <div class="form-group">
                             <label class="form-label">Full Name</label>
                             <input type="text" id="regName" class="form-input" autocomplete="name">
                        </div> --> 
                        <!-- Keeping simple for now based on Schema -->
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" id="regEmail" class="form-input" autocomplete="username" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="regPassword" class="form-input" autocomplete="new-password" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
                    </form>
                    <p class="auth-toggle">Already have an account? <a onclick="toggleAuth('login')">Login</a></p>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Event Listeners
        document.querySelector('.close-modal').addEventListener('click', closeAuthModal);
        window.addEventListener('click', (e) => {
            if (e.target == document.getElementById('authModal')) closeAuthModal();
        });

        // Form Submissions
        document.getElementById('loginFormGlobal').addEventListener('submit', handleLogin);
        document.getElementById('registerFormGlobal').addEventListener('submit', handleRegister);
    }
}

function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function toggleAuth(view) {
    if (view === 'register') {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('registerSection').style.display = 'block';
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('registerSection').style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
        const response = await fetch('http://localhost:8000/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access_token); // Store for API calls
            alert('Login Successful');
            location.reload(); // Reload to update UI state
        } else {
            alert('Invalid credentials');
        }
    } catch (err) {
        alert('Server error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await fetch('http://localhost:8000/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            alert('Registration Successful! Logging you in...');
            location.reload();
        } else {
            const data = await response.json();
            alert('Error: ' + data.detail);
        }
    } catch (err) {
        alert('Server error');
    }
}

async function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.log("No token found");
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/auth/verify', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            // Hide Login Button
            const authBtn = document.getElementById('authTrigger');
            if (authBtn) {
                authBtn.textContent = 'Logout'; // Or User Name
                authBtn.removeEventListener('click', openAuthModal);
                authBtn.onclick = () => {
                    // Implement Logout
                    localStorage.removeItem('access_token');
                    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    location.reload();
                };
            }

            if (data.role === 'admin') {
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = 'block';
                });
            }
        } else {
            // Token invalid
            localStorage.removeItem('access_token');
        }
    } catch (error) {
        console.log("Not logged in");
    }
}

/* =====================================================
   CAREERS & JOB MANAGEMENT
   ===================================================== */

// Function to fetch and display jobs
async function fetchJobs() {
    const container = document.getElementById('jobs-container');
    if (!container) return; // Not on the jobs page

    const token = localStorage.getItem('access_token');
    let isAdmin = false;

    // Quick client-side check if token exists to see if we should try to show admin controls
    // A better way is to verify token role, but for UI rendering we can rely on verify call state from checkAuth 
    // or just checking if token is present (and handle 403 on action).
    // Let's assume if token exists we show them, and backend blocks if not admin.
    if (token) isAdmin = true; // Simplification for UI visibility

    try {
        const response = await fetch('http://localhost:8000/api/jobs');
        if (response.ok) {
            const jobs = await response.json();
            container.innerHTML = ''; // Clear loading text

            if (jobs.length === 0) {
                container.innerHTML = '<p style="text-align: center; col-span:all;">No open positions at the moment.</p>';
                return;
            }

            jobs.forEach(job => {
                // Short description truncation
                let shortDesc = "";
                if (job.description) {
                    shortDesc = job.description.length > 100 ? job.description.substring(0, 100) + "..." : job.description;
                }

                const card = document.createElement('div');
                card.className = 'job-card';
                card.style.position = 'relative'; // For admin controls positioning

                let adminControls = '';
                if (isAdmin) {
                    adminControls = `
                        <div style="position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem;">
                            <button onclick="editJob('${job.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.2rem;">✏️</button>
                            <button onclick="deleteJob('${job.id}')" style="background: none; border: none; cursor: pointer; font-size: 1.2rem;">🗑️</button>
                        </div>
                    `;
                }

                card.innerHTML = `
                    ${adminControls}
                    <div class="job-info">
                        <h3 class="job-title">${job.title}</h3>
                        <div class="job-meta">
                            <span>📍 ${job.location}</span>
                            <span>💼 ${job.type || job.employment_type}</span>
                            <span>💰 ${job.salary_range}</span>
                        </div>
                        ${shortDesc ? `<div class="job-description" style="margin-top: 1rem; color: #555; white-space: pre-wrap; font-size: 0.95rem; overflow: hidden; height: 3em;">${shortDesc}</div>` : ''}
                    </div>
                    <a href="job-details.html?job_id=${job.id}" class="btn btn-outline" style="align-self: flex-start; margin-top: 1rem;">Read More</a>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p>Failed to load jobs.</p>';
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
        container.innerHTML = '<p>Error loading jobs.</p>';
    }
}

async function deleteJob(jobId) {
    if (!confirm('Are you sure you want to delete this job?')) return;

    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Job deleted.');
            fetchJobs();
        } else {
            alert('Failed to delete. Ensure you are an Admin.');
        }
    } catch (err) {
        alert('Error deleting job');
    }
}

let currentEditingJobId = null;

async function editJob(jobId) {
    const token = localStorage.getItem('access_token');

    // Fetch job details first
    try {
        const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`);
        const job = await response.json();

        // Populate Modal
        document.getElementById('jobTitle').value = job.title;
        document.getElementById('jobLocation').value = job.location;
        document.getElementById('jobType').value = job.type || job.employment_type;
        document.getElementById('jobSalary').value = job.salary_range;
        document.getElementById('jobDescription').value = job.description || '';

        // Change Modal State to Edit
        currentEditingJobId = jobId;
        const modalTitle = document.querySelector('#addJobModal h2');
        if (modalTitle) modalTitle.textContent = "Edit Job";

        const formBtn = document.querySelector('#addJobForm button');
        if (formBtn) formBtn.textContent = "Update Job";

        openAddJobModal();

    } catch (err) {
        alert('Could not fetch job data for editing');
    }
}

// Check reset modal state on close
function closeAddJobModal() {
    document.getElementById('addJobModal').style.display = 'none';
    // Reset state
    currentEditingJobId = null;
    document.getElementById('addJobForm').reset();
    const modalTitle = document.querySelector('#addJobModal h2');
    if (modalTitle) modalTitle.textContent = "Post New Job";
    const formBtn = document.querySelector('#addJobForm button');
    if (formBtn) formBtn.textContent = "Post Job";
}

async function handlePostJob(e) {
    e.preventDefault();

    const title = document.getElementById('jobTitle').value;
    const location = document.getElementById('jobLocation').value;
    const employment_type = document.getElementById('jobType').value;
    const salary_range = document.getElementById('jobSalary').value;
    const description = document.getElementById('jobDescription').value;

    const token = localStorage.getItem('access_token');

    const payload = {
        title,
        location,
        type: employment_type,
        salary_range,
        description
    };

    try {
        let url = 'http://localhost:8000/api/jobs';
        let method = 'POST';

        if (currentEditingJobId) {
            url = `http://localhost:8000/api/jobs/${currentEditingJobId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert(currentEditingJobId ? 'Job Updated!' : 'Job Posted!');
            closeAddJobModal();
            fetchJobs(); // Refresh list
        } else {
            alert('Operation failed. Ensure you are an Admin.');
        }
    } catch (err) {
        alert('Error processing request');
    }
}
async function fetchJobDetails() {
    const container = document.getElementById('jobContent');
    if (!container) return; // Not on details page

    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job_id');

    if (!jobId) {
        document.getElementById('loading').textContent = 'No job specified.';
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`);
        if (response.ok) {
            const job = await response.json();

            // Populate data
            document.getElementById('detailTitle').textContent = job.title;
            document.getElementById('detailLocation').textContent = `📍 ${job.location}`;
            document.getElementById('detailType').textContent = `💼 ${job.type || job.employment_type}`; // Handle both naming conventions if present
            document.getElementById('detailSalary').textContent = `💰 ${job.salary_range}`;
            document.getElementById('detailDescription').textContent = job.description || "No description provided.";

            // Update apply button
            document.getElementById('applyButton').href = `apply.html?job_id=${job.id}`;

            // Show content
            document.getElementById('loading').style.display = 'none';
            container.style.display = 'block';
        } else {
            document.getElementById('loading').textContent = 'Job not found.';
        }
    } catch (error) {
        document.getElementById('loading').textContent = 'Error loading job details.';
    }
}

// Initialization hooks
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on apply page and have a job_id
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job_id');
    const jobInput = document.getElementById('jobIdInput');
    if (jobId && jobInput) {
        jobInput.value = jobId;
        jobInput.readOnly = true;
    }

    fetchJobs();
    fetchJobDetails(); // Will run only if on job-details page

    if (window.location.pathname.includes('blogs.html')) {
        injectAddBlogModal();
    }

    injectAddJobModal();
});

/* =====================================================
   ADMIN JOB CREATION
   ===================================================== */

function injectAddJobModal() {
    if (!document.getElementById('addJobModal')) {
        const modalHTML = `
        <div id="addJobModal" class="modal">
            <div class="modal-content">
                <span class="close-modal" onclick="closeAddJobModal()">&times;</span>
                <h2>Post New Job</h2>
                <form id="addJobForm" class="contact-form" style="box-shadow: none; padding: 0;">
                    <div class="form-group">
                        <label class="form-label">Job Title</label>
                        <input type="text" id="jobTitle" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input type="text" id="jobLocation" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Employment Type (e.g., Full-time)</label>
                        <input type="text" id="jobType" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Salary Range</label>
                        <input type="text" id="jobSalary" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Job Description & Responsibilities</label>
                        <textarea id="jobDescription" class="form-input" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Post Job</button>
                </form>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('addJobForm').addEventListener('submit', handlePostJob);

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target == document.getElementById('addJobModal')) closeAddJobModal();
        });
    }
}

function openAddJobModal() {
    document.getElementById('addJobModal').style.display = 'block';
}



/* =====================================================
   APPLICATION SUBMISSION
   ===================================================== */

async function submitApplication(e) {
    e.preventDefault();

    const form = document.getElementById('applicationForm');
    const formData = new FormData(form);

    // File Validation
    const fileInput = form.querySelector('input[type="file"]');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file only.');
            return;
        }
    }

    try {
        // Backend expects 'resume' field, name, email etc. 
        // We'll append them manually to be safe or rely on FormData names matching Schema.
        // /api/apply takes: full_name, email, phone, linkedin_url, job_id, resume

        const response = await fetch('http://localhost:8000/api/apply', {
            method: 'POST',
            body: formData // Fetch sets Content-Type to multipart/form-data automatically
        });

        if (response.ok) {
            alert('Application Submitted Successfully!');
            form.reset();
        } else {
            const data = await response.json();
            alert('Submission failed: ' + (data.detail || 'Unknown error'));
        }
    } catch (err) {
        alert('Server error during application.');
    }
}

/* =====================================================
   BLOG MANAGEMENT
   ===================================================== */

// Colors for placeholder images based on category (pseudo-random)
const BLOG_COLORS = [
    'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)', // Green
    'linear-gradient(135deg, #fce38a 0%, #f38181 100%)', // Orange/Pink
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Teal
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'  // Pink/Yellow
];

function getBlogColor(category) {
    if (!category) return BLOG_COLORS[0];
    const index = category.length % BLOG_COLORS.length;
    return BLOG_COLORS[index];
}

async function fetchBlogs() {
    const container = document.getElementById('blogs-container');
    if (!container) return;

    const token = localStorage.getItem('access_token');
    let isAdmin = false;
    if (token) isAdmin = true;

    try {
        const response = await fetch('http://localhost:8000/api/blogs');
        if (response.ok) {
            const blogs = await response.json();
            container.innerHTML = '';

            if (blogs.length === 0) {
                container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No blogs posted yet.</p>';
                return;
            }

            blogs.forEach(blog => {
                const card = document.createElement('div');
                card.className = 'blog-card';
                card.style.position = 'relative';

                let adminControls = '';
                if (isAdmin) {
                    adminControls = `
                        <div class="admin-controls" style="position: absolute; top: 10px; right: 10px; z-index: 10; display: flex; gap: 5px;">
                            <button onclick="event.stopPropagation(); window.location.href='blog-form.html?blog_id=${blog.id}'" style="background: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">✏️</button>
                            <button onclick="event.stopPropagation(); deleteBlog('${blog.id}')" style="background: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">🗑️</button>
                        </div>
                    `;
                }

                // Format date
                const date = new Date(blog.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });

                const bgGradient = getBlogColor(blog.category);
                const emoji = blog.emoji || '📰';

                // Make card clickable
                card.onclick = () => {
                    window.location.href = `blog-details.html?blog_id=${blog.id}`;
                };
                card.style.cursor = 'pointer';

                card.innerHTML = `
                    ${adminControls}
                    <div class="blog-image-square" style="background: ${bgGradient};">
                        <span style="font-size: 3rem;">${emoji}</span>
                    </div>
                    <div class="blog-content">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span class="blog-category">${blog.category || 'General'}</span>
                            <span class="blog-date" style="font-size: 0.8rem; color: #888;">${date}</span>
                        </div>
                        <h3 class="blog-title" style="font-size: 1.1rem; margin-bottom: 0.5rem; line-height: 1.4;">${blog.title}</h3>
                        <p class="blog-excerpt" style="font-size: 0.9rem; color: #666; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${blog.excerpt || ''}</p>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error fetching blogs:', error);
        container.innerHTML = '<p>Error loading blogs.</p>';
    }
}

async function deleteBlog(blogId) {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    const token = localStorage.getItem('access_token');
    try {
        const response = await fetch(`http://localhost:8000/api/blogs/${blogId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Blog deleted.');
            fetchBlogs();
        } else {
            alert('Failed to delete. Ensure you are an Admin.');
        }
    } catch (err) {
        alert('Error deleting blog');
    }
}

// Logic for blog-form.html
async function initBlogForm() {
    const form = document.getElementById('blogForm');
    if (!form) return;

    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('blog_id');
    const pageTitle = document.getElementById('pageTitle');

    if (blogId) {
        // Edit Mode
        pageTitle.textContent = "Edit Blog Post";
        document.getElementById('blogId').value = blogId;

        try {
            const response = await fetch(`http://localhost:8000/api/blogs/${blogId}`);
            if (response.ok) {
                const blog = await response.json();
                document.getElementById('blogTitle').value = blog.title;
                document.getElementById('blogCategory').value = blog.category;
                document.getElementById('blogEmoji').value = blog.emoji;
                document.getElementById('blogExcerpt').value = blog.excerpt;
                document.getElementById('blogContent').value = blog.content;
            }
        } catch (e) {
            console.error(e);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('blogId').value;

        // Gather data
        const payload = {
            title: document.getElementById('blogTitle').value,
            category: document.getElementById('blogCategory').value,
            emoji: document.getElementById('blogEmoji').value,
            excerpt: document.getElementById('blogExcerpt').value,
            content: document.getElementById('blogContent').value,
            is_active: true
        };

        const token = localStorage.getItem('access_token');
        if (!token) {
            alert("You must be logged in as admin");
            return;
        }

        try {
            let url = 'http://localhost:8000/api/blogs';
            let method = 'POST';

            if (id) {
                url = `http://localhost:8000/api/blogs/${id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Blog Saved Successfully!');
                window.location.href = 'blogs.html';
            } else {
                alert('Error saving blog.');
            }
        } catch (err) {
            alert('Network error.');
        }
    });
}

// Logic for blog-details.html
async function fetchBlogDetails() {
    const container = document.getElementById('blogContent');
    if (!container) return; // Not on details page

    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('blog_id');

    if (!blogId) {
        document.getElementById('loading').textContent = 'No blog specified.';
        return;
    }

    try {
        const response = await fetch(`http://localhost:8000/api/blogs/${blogId}`);
        if (response.ok) {
            const blog = await response.json();

            // Populate
            document.getElementById('detailTitle').textContent = blog.title;
            document.getElementById('detailCategory').textContent = blog.category;

            // Image/Emoji
            const color = getBlogColor(blog.category);
            document.getElementById('detailImageContainer').innerHTML = `
                <div class="blog-placeholder" style="background: ${color}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 5rem;">
                    ${blog.emoji || '📰'}
                </div>
            `;

            const date = new Date(blog.created_at).toLocaleDateString();
            document.getElementById('detailDate').textContent = `📅 ${date}`;
            document.getElementById('detailReadTime').textContent = `⏱️ ${blog.read_time || '5 min read'}`;

            document.getElementById('detailContent').textContent = blog.content;

            // Show
            document.getElementById('loading').style.display = 'none';
            container.style.display = 'block';
        } else {
            document.getElementById('loading').textContent = 'Blog not found.';
        }
    } catch (error) {
        document.getElementById('loading').textContent = 'Error loading blog.';
    }
}

// Add fetchBlogs to initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchBlogs();
    fetchBlogDetails(); // For blog-details.html
    initBlogForm(); // For blog-form.html
});
