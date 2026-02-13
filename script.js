
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

    // Auto-open Login if triggered via URL (e.g., redirect from apply)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'true') {
        openAuthModal();
    }
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

        // Form Submissions
        document.getElementById('loginFormGlobal').addEventListener('submit', handleLogin);
        document.getElementById('registerFormGlobal').addEventListener('submit', handleRegister);
    }
}

function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden'; // Lock html too
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto'; // Unlock html too
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

            // Check for redirect after login
            const redirectUrl = sessionStorage.getItem('redirect_after_login');
            if (redirectUrl) {
                sessionStorage.removeItem('redirect_after_login');
                window.location.href = redirectUrl;
            } else {
                location.reload(); // Reload to update UI state
            }
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
                const username = data.email.split('@')[0];
                authBtn.innerHTML = `<span style="margin-right:0.5rem;">👤 ${username}</span> <span style="font-weight:700;">Logout</span>`;
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
    const searchInput = document.getElementById('jobSearch');
    const locationFilter = document.getElementById('locationFilter');
    const typeFilter = document.getElementById('typeFilter');

    if (!container) return; // Not on the jobs page

    const isAdmin = !!localStorage.getItem('access_token');

    try {
        const response = await fetch('http://localhost:8000/api/jobs');
        if (response.ok) {
            const jobs = await response.json();

            if (jobs.length === 0) {
                container.innerHTML = '<p style="text-align: center; col-span:all;">No open positions at the moment.</p>';
                return;
            }

            // Populate filters if they exist
            if (locationFilter && typeFilter) {
                const locations = [...new Set(jobs.map(j => j.location))].sort();
                const types = [...new Set(jobs.map(j => j.type || j.employment_type))].sort();

                locations.forEach(loc => {
                    locationFilter.insertAdjacentHTML('beforeend', `<option value="${loc}">${loc}</option>`);
                });

                types.forEach(type => {
                    typeFilter.insertAdjacentHTML('beforeend', `<option value="${type}">${type}</option>`);
                });

                const updateJobFilters = () => {
                    const search = searchInput.value.toLowerCase();
                    const locVal = locationFilter.value;
                    const typeVal = typeFilter.value;

                    const filtered = jobs.filter(j => {
                        const matchesSearch = !search ||
                            j.title.toLowerCase().includes(search) ||
                            (j.description && j.description.toLowerCase().includes(search));
                        const matchesLoc = !locVal || j.location === locVal;
                        const matchesType = !typeVal || (j.type || j.employment_type) === typeVal;
                        return matchesSearch && matchesLoc && matchesType;
                    });
                    renderJobs(filtered, isAdmin);
                };

                searchInput.addEventListener('input', updateJobFilters);
                locationFilter.addEventListener('change', updateJobFilters);
                typeFilter.addEventListener('change', updateJobFilters);
            }

            // Initial Render
            renderJobs(jobs, isAdmin);
        } else {
            container.innerHTML = '<p>Failed to load jobs.</p>';
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
        container.innerHTML = '<p>Error loading jobs.</p>';
    }
}

function renderJobs(jobs, isAdmin) {
    const container = document.getElementById('jobs-container');
    if (!container) return;

    container.innerHTML = '';

    if (jobs.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">No positions found matching your criteria.</p>';
        return;
    }

    jobs.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.style.position = 'relative';

        let adminControls = '';
        if (isAdmin) {
            adminControls = `
                <div style="position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem; z-index: 10;">
                    <button onclick="editJob('${job.id}')" title="Edit" style="background: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 1rem;">✏️</button>
                    <button onclick="deleteJob('${job.id}')" title="Delete" style="background: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 1rem;">🗑️</button>
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
            </div>
            <a href="job-details.html?job_id=${job.id}" class="btn btn-outline" style="align-self: flex-start; margin-top: 1rem;">Read More</a>
        `;
        container.appendChild(card);
    });
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

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on apply page and have a job_id
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job_id');
    const jobInput = document.getElementById('jobIdInput');
    if (jobId && jobInput) {
        jobInput.value = jobId;
        jobInput.readOnly = true;
    }

    // Auth Check & Restore Data for apply page
    if (window.location.pathname.includes('apply.html')) {
        // Restore pending data if any
        const pendingDataStr = sessionStorage.getItem('pendingApplicationData');
        if (pendingDataStr) {
            const pendingData = JSON.parse(pendingDataStr);
            const form = document.getElementById('applicationForm');
            if (form) {
                Object.keys(pendingData).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) {
                        input.value = pendingData[key];
                    }
                });
                // Clear the pending data so it doesn't persist forever
                sessionStorage.removeItem('pendingApplicationData');
                alert('Welcome back! Your application details have been restored. Please re-upload your resume and click Submit.');
            }
        }
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

    const token = localStorage.getItem('access_token');
    if (!token) {
        // Save form data to restore after login
        const form = document.getElementById('applicationForm');
        const formData = new FormData(form);
        const dataToSave = {};
        formData.forEach((value, key) => {
            if (!(value instanceof File)) {
                dataToSave[key] = value;
            }
        });
        sessionStorage.setItem('pendingApplicationData', JSON.stringify(dataToSave));
        sessionStorage.setItem('redirect_after_login', window.location.href);

        alert('Please login to submit your application. Your details have been saved.');
        window.location.href = 'index.html?login=true';
        return;
    }

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

        const token = localStorage.getItem('access_token');
        const response = await fetch('http://localhost:8000/api/apply', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData // Fetch sets Content-Type to multipart/form-data automatically
        });

        if (response.ok) {
            alert('Application Submitted Successfully!');
            form.reset();
        } else {
            const data = await response.json();
            const errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
            alert('Submission failed: ' + (errorMsg || 'Unknown error'));
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
    'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', // Deep Green
    'linear-gradient(135deg, #FFB300 0%, #FFD54F 100%)', // Gold
    'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)', // Deep Blue
    'linear-gradient(135deg, #2E7D32 0%, #4facfe 100%)', // Green-Blue Mix
    'linear-gradient(135deg, #FFD54F 0%, #1B5E20 100%)'  // Gold-Green Mix
];

function getBlogColor(category) {
    if (!category) return BLOG_COLORS[0];
    const index = category.length % BLOG_COLORS.length;
    return BLOG_COLORS[index];
}

const DEV_CATEGORIES = ['Engineering', 'AI/ML', 'Data', 'Mobile', 'DevOps'];

async function fetchBlogs() {
    const container = document.getElementById('blogs-container');
    if (!container) return;

    const token = localStorage.getItem('access_token');
    let isAdmin = !!token;

    try {
        // Exclude developer categories from main blog
        const params = new URLSearchParams();
        DEV_CATEGORIES.forEach(cat => params.append('exclude_category', cat));

        const response = await fetch(`http://localhost:8000/api/blogs?${params.toString()}`);
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

                const date = new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const bgGradient = getBlogColor(blog.category);
                const emoji = blog.emoji || '📰';

                card.onclick = () => { window.location.href = `blog-details.html?blog_id=${blog.id}`; };
                card.style.cursor = 'pointer';

                // Image or Emoji
                let imageContent = `<div class="blog-card-image" style="background: ${bgGradient};"><span>${emoji}</span></div>`;
                if (blog.image_url) {
                    imageContent = `<div class="blog-card-image" style="background-image: url('${blog.image_url}'); background-size: cover; background-position: center;"></div>`;
                }

                card.innerHTML = `
                    ${adminControls}
                    ${imageContent}
                    <div class="blog-card-content">
                        <div class="blog-card-meta">
                            <span>${date}</span>
                            <span>${blog.category || 'General'}</span>
                        </div>
                        <h3 class="blog-card-title">${blog.title}</h3>
                        <p class="blog-card-excerpt">${blog.excerpt || ''}</p>
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

/* =====================================================
   DEVELOPER BLOG MANAGEMENT (Dynamic)
   ===================================================== */

async function fetchDeveloperBlogs() {
    const container = document.getElementById('dev-blog-grid');
    if (!container) return;

    const token = localStorage.getItem('access_token');
    let isAdmin = !!token;

    try {
        // Fetch only developer categories
        const params = new URLSearchParams();
        const categories = ['Engineering', 'AI/ML', 'Data', 'Mobile', 'DevOps'];
        categories.forEach(cat => params.append('category', cat));

        console.log('Fetching developer blogs with params:', params.toString()); // Debugging

        const response = await fetch(`http://localhost:8000/api/blogs?${params.toString()}`);

        if (response.ok) {
            let blogs = await response.json();
            container.innerHTML = '';

            if (!blogs || blogs.length === 0) {
                container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No developer insights yet.</p>';
                return;
            }

            blogs.forEach(blog => {
                const card = document.createElement('article');
                card.className = 'blog-card';
                card.style.position = 'relative';

                let adminControls = '';
                if (isAdmin) {
                    adminControls = `
                        <div style="position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem; z-index: 10;">
                            <button onclick="editDeveloperBlog('${blog.id}')" title="Edit" style="background: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 1rem;">✏️</button>
                            <button onclick="deleteDeveloperBlog('${blog.id}')" title="Delete" style="background: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-size: 1rem;">🗑️</button>
                        </div>
                    `;
                }

                // Date Formatting
                const date = new Date(blog.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });

                // Gradient based on category
                let gradient = 'var(--gradient-primary)';
                if (blog.category === 'Data') gradient = 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-light) 100%)';
                if (blog.category === 'Mobile') gradient = 'var(--gradient-accent)';

                // Image or Emoji
                let imageContent = `<div class="blog-card-image" style="background: ${gradient};">${blog.image_emoji || '📝'}</div>`;
                if (blog.image_url) {
                    imageContent = `<div class="blog-card-image" style="background-image: url('${blog.image_url}'); background-size: cover; background-position: center;"></div>`;
                }

                card.innerHTML = `
                    ${adminControls}
                    ${imageContent}
                    <div class="blog-card-content">
                        <div class="blog-card-meta">
                            <span>${date}</span>
                            <span>${blog.category}</span>
                        </div>
                        <h3 class="blog-card-title">${blog.title}</h3>
                        <p class="blog-card-excerpt">${blog.excerpt}</p>
                        <div class="blog-card-author">
                            <div class="author-avatar" style="background: var(--color-primary-light); color: white;">
                                ${blog.author ? blog.author.charAt(0) : 'S'}
                            </div>
                            <span class="author-name">${blog.author || 'Silo Team'}</span>
                        </div>
                    </div>
                `;

                // Make card clickable
                card.onclick = () => window.location.href = `blog-details.html?blog_id=${blog.id}`;

                container.appendChild(card);
            });

        } else {
            console.error('Failed to fetch developer blogs: Status', response.status);
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Failed to load insights (Status: ${response.status})</p>`;
            return;
        }

    } catch (error) {
        console.error('Error fetching developer blogs:', error);
        container.innerHTML = '<p>Failed to load content.</p>';
    }
}

// ... rest of the file ...

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
            if (window.location.href.includes('developers.html')) {
                fetchDeveloperBlogs();
            } else {
                fetchBlogs();
            }
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
    const type = urlParams.get('type');
    const token = localStorage.getItem('access_token');

    // Handle Developer Type Context
    if (type === 'developer') {
        const categorySelect = document.getElementById('blogCategory');
        if (categorySelect) {
            categorySelect.innerHTML = `
                <option value="Engineering">Engineering</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Data">Data</option>
                <option value="Mobile">Mobile</option>
                <option value="DevOps">DevOps</option>
            `;
        }

        // Update Cancel Link
        const cancelBtn = document.querySelector('button.btn-outline');
        if (cancelBtn) {
            cancelBtn.onclick = () => window.location.href = 'developers.html';
        }

        // Update Nav Link as well
        const navCancel = document.querySelector('.nav-link');
        if (navCancel && navCancel.textContent === 'Cancel') {
            navCancel.href = 'developers.html';
        }
    }

    if (blogId) {
        // Edit Mode
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = 'Edit Blog Post';

        try {
            const response = await fetch(`http://localhost:8000/api/blogs/${blogId}`);
            const blog = await response.json();
            document.getElementById('blogTitle').value = blog.title;
            // Ensure category exists in dropdown, else add it
            const categorySelect = document.getElementById('blogCategory');
            if (categorySelect && ![...categorySelect.options].some(o => o.value === blog.category)) {
                const opt = document.createElement('option');
                opt.value = blog.category;
                opt.textContent = blog.category;
                categorySelect.appendChild(opt);
            }
            document.getElementById('blogCategory').value = blog.category;

            document.getElementById('blogEmoji').value = blog.image_emoji || blog.emoji;
            document.getElementById('blogExcerpt').value = blog.excerpt;
            document.getElementById('blogContent').value = blog.content;
            document.getElementById('blogExistingImageUrl').value = blog.image_url || '';
            document.getElementById('blogId').value = blogId;
        } catch (err) {
            console.error(err);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const imageFile = document.getElementById('blogImageFile').files[0];
        let image_url = null;

        if (imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);
            try {
                const uploadRes = await fetch('http://localhost:8000/api/upload', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    image_url = data.url;
                } else {
                    alert('Image upload failed');
                    return;
                }
            } catch (err) {
                console.error(err);
                alert('Image upload error');
                return;
            }
        }

        if (!image_url && blogId) {
            image_url = document.getElementById('blogExistingImageUrl').value || null;
        }

        const payload = {
            title: document.getElementById('blogTitle').value,
            category: document.getElementById('blogCategory').value,
            image_emoji: document.getElementById('blogEmoji').value,
            excerpt: document.getElementById('blogExcerpt').value,
            content: document.getElementById('blogContent').value,
            image_url: image_url,
            author: type === 'developer' ? "Engineering Team" : "Silo Fortune Team"
        };

        let url = 'http://localhost:8000/api/blogs';
        let method = 'POST';

        if (blogId) {
            url = `http://localhost:8000/api/blogs/${blogId}`;
            method = 'PUT';
        }

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Blog saved!');
                window.location.href = type === 'developer' ? 'developers.html' : 'blogs.html';
            } else {
                alert('Error saving blog');
            }
        } catch (err) {
            alert('Server error');
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

async function fetchOutlets() {
    const previewContainer = document.getElementById('outlets-preview-container');
    const fullContainer = document.getElementById('outlets-full-grid');
    const regionFilter = document.getElementById('regionFilter');

    if (!previewContainer && !fullContainer) return;

    try {
        const response = await fetch('http://localhost:8000/api/outlets');
        if (response.ok) {
            const outlets = await response.json();
            const isAdmin = !!localStorage.getItem('access_token');


            // 2. Populate Filters (Region & Search)
            if (regionFilter) {
                const regionResponse = await fetch('http://localhost:8000/api/outlets/regions');
                if (regionResponse.ok) {
                    const regions = await regionResponse.json();
                    regionFilter.innerHTML = '<option value="">All Regions</option>';
                    regions.forEach(region => {
                        regionFilter.insertAdjacentHTML('beforeend', `<option value="${region}">${region}</option>`);
                    });

                    // Populate Summary Badges (Full Page only)
                    const summaryContainer = document.getElementById('regions-summary');
                    if (summaryContainer) {
                        const header = summaryContainer.querySelector('p');
                        summaryContainer.innerHTML = '';
                        if (header) summaryContainer.appendChild(header);
                        regions.forEach(region => {
                            const badge = `<span class="blog-card-badge" style="background: var(--color-gray-100); color: var(--color-primary); border: 1px solid var(--color-gray-200); cursor: pointer;" onclick="applyRegionFilter('${region}')">${region}</span>`;
                            summaryContainer.insertAdjacentHTML('beforeend', badge);
                        });
                    }
                }

                // Unified filter listener
                const updateFilters = () => {
                    const selectedRegion = regionFilter.value.toLowerCase();
                    const searchText = (document.getElementById('outletSearch')?.value || '').toLowerCase();

                    const filtered = outlets.filter(o => {
                        const matchRegion = !selectedRegion || o.region.toLowerCase() === selectedRegion;
                        const matchSearch = !searchText ||
                            o.name.toLowerCase().includes(searchText) ||
                            o.region.toLowerCase().includes(searchText) ||
                            o.pincode.includes(searchText);
                        return matchRegion && matchSearch;
                    });

                    if (previewContainer) {
                        previewContainer.innerHTML = '';
                        filtered.forEach(outlet => {
                            const row = `
                                <tr>
                                    <td data-label="Store Name">
                                        <div style="display: flex; align-items: center; gap: 1rem;">
                                            <div style="background: var(--color-primary-light); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">🏢</div>
                                            <strong>${outlet.name}</strong>
                                        </div>
                                    </td>
                                    <td data-label="Region">
                                        <span style="background: var(--color-gray-50); padding: 4px 10px; border-radius: 15px; color: var(--color-primary); font-weight: 600;">
                                            ${outlet.region}
                                        </span>
                                    </td>
                                    <td data-label="Pincode" style="color: var(--color-gray-600); font-family: monospace;">${outlet.pincode}</td>
                                    <td data-label="Contact Number">
                                        <a href="tel:${outlet.contact}" style="color: var(--color-secondary); text-decoration: none; font-weight: 700;">📞 ${outlet.contact}</a>
                                    </td>
                                </tr>
                            `;
                            previewContainer.insertAdjacentHTML('beforeend', row);
                        });
                    }

                    if (fullContainer) {
                        renderOutletGrid(filtered);
                    }

                    // Show "Add Outlet" button for admins in table-header
                    const tableHeaders = document.querySelectorAll('.table-header');
                    tableHeaders.forEach(header => {
                        const existingBtn = header.querySelector('.add-outlet-btn');
                        if (isAdmin) {
                            if (!existingBtn) {
                                const addBtn = `<button class="add-outlet-btn btn btn-primary" onclick="window.location.href='outlet-form.html'" style="padding: 0.5rem 1rem; font-size: 0.9rem; margin-left: 1rem;">+ Add Outlet</button>`;
                                const title = header.querySelector('.table-title') || header.querySelector('h2') || header.querySelector('h3');
                                if (title) {
                                    title.style.display = 'flex';
                                    title.style.alignItems = 'center';
                                    title.insertAdjacentHTML('beforeend', addBtn);
                                }
                            }
                        } else {
                            if (existingBtn) existingBtn.remove();
                        }
                    });
                };

                regionFilter.addEventListener('change', updateFilters);
                document.getElementById('outletSearch')?.addEventListener('input', updateFilters);

                // Initial call to apply filters and render
                updateFilters();
            }

            // 3. Initial Render for Grid (if present) - only if no regionFilter is present to avoid double render
            if (fullContainer && !regionFilter) {
                renderOutletGrid(outlets);
            }
        }
    } catch (error) {
        console.error('Error fetching outlets:', error);
    }
}


function renderOutletGrid(outlets) {
    const fullContainer = document.getElementById('outlets-full-grid');
    if (!fullContainer) return;

    fullContainer.innerHTML = '';
    const isAdmin = !!localStorage.getItem('access_token');

    // Check if the container is a table body or a grid div
    const isTableBody = fullContainer.tagName.toLowerCase() === 'tbody';

    outlets.forEach(outlet => {
        if (isTableBody) {
            // Render as Table Row (for outlets.html and marketing preview)
            const row = `
                <tr style="transition: background 0.3s ease;">
                    <td data-label="Store Name">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="background: var(--color-primary-light); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;">🏢</div>
                            <strong>${outlet.name}</strong>
                        </div>
                    </td>
                    <td data-label="Region">
                        <span style="background: var(--color-gray-50); padding: 4px 10px; border-radius: 15px; color: var(--color-primary); font-weight: 600;">
                            ${outlet.region}
                        </span>
                    </td>
                    <td data-label="Pincode" style="color: var(--color-gray-600); font-family: monospace; font-weight: 600;">${outlet.pincode}</td>
                    <td data-label="Contact Number" style="position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <a href="tel:${outlet.contact}" style="color: var(--color-secondary); text-decoration: none; font-weight: 700; font-size: 1.05rem;">📞 ${outlet.contact}</a>
                            ${isAdmin ? `
                            <div class="admin-inline-controls" style="display: flex; gap: 8px; margin-left: 1rem;">
                                <button onclick="window.location.href='outlet-form.html?outlet_id=${outlet.id}'" title="Edit" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; filter: grayscale(1); transition: filter 0.2s;" onmouseover="this.style.filter='none'" onmouseout="this.style.filter='grayscale(1)'">✏️</button>
                                <button onclick="deleteOutlet('${outlet.id}')" title="Delete" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; filter: grayscale(1); transition: filter 0.2s;" onmouseover="this.style.filter='none'" onmouseout="this.style.filter='grayscale(1)'">🗑️</button>
                            </div>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
            fullContainer.insertAdjacentHTML('beforeend', row);
        }
    });
}

async function deleteOutlet(id) {
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert('Unauthorized. Please login.');
        return;
    }
    if (!confirm('Delete this outlet?')) return;
    try {
        const response = await fetch(`http://localhost:8000/api/outlets/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert('Outlet deleted');
            fetchOutlets();
        }
    } catch (e) { console.error(e); }
}

// Add fetchBlogs to initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchBlogs();
    fetchDeveloperBlogs(); // Added missing call
    fetchOutlets();
    fetchBlogDetails(); // For blog-details.html
    initBlogForm(); // For blog-form.html

    // Contact Form Logic
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const subject = document.getElementById('contactSubject').value;
            const message = document.getElementById('contactMessage').value;

            try {
                const response = await fetch('http://localhost:8000/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message })
                });

                if (response.ok) {
                    alert('Thank you for your message, ' + name + '! We have received it and will get back to you soon.');
                    contactForm.reset();
                } else {
                    const errorData = await response.json();
                    const errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
                    alert('Failed to send message: ' + (errorMsg || 'Unknown error'));
                }
            } catch (err) {
                console.error('Contact form error:', err);
                alert('Network error. Please try again later.');
            }
        });
    }

});
