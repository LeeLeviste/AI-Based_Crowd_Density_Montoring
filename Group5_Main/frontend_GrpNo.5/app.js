// Main Application JavaScript
// This file handles UI interactions and connects to the backend API

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // determine page and perform auth check early
    const currentPage = document.body.getAttribute('data-page');
    const protectedPages = ['dashboard', 'analytics', 'upload-connect', 'live-camera'];
    if (protectedPages.includes(currentPage) && !AuthAPI.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // always create sidebar first, before any page logic
    // NOTE: Sidebars now hardcoded in HTML, JS generation disabled
    // renderSidebar(currentPage);
    // normalizeSidebar();

    // Initialize page-specific functionality with error handling
    try {
        switch(currentPage) {
            case 'login':
                initLoginPage();
                break;
            case 'signup':
                initSignupPage();
                break;
            case 'dashboard':
                initDashboardPage();
                break;
            case 'analytics':
                initAnalyticsPage();
                break;
            case 'upload-connect':
                initUploadPage();
                break;
            case 'live-camera':
                initLiveCameraPage();
                break;
        }
    } catch (error) {
        console.error('Page initialization error:', error);
    }

    // common handlers after page init
    initCommonHandlers();

    // Close video/image preview buttons
    document.querySelectorAll('[data-action="close-video"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('video-player-section')?.classList.add('hidden');
            resetDropzone();
        });
    });
    
    document.querySelectorAll('[data-action="close-image"]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('image-preview-section')?.classList.add('hidden');
            resetDropzone();
        });
    });
});

// Common event handlers
function initCommonHandlers() {
    // Sign out button
    document.querySelectorAll('[data-action="signout"]').forEach(btn => {
        btn.addEventListener('click', () => {
            AuthAPI.logout();
        });
    });
}

// Build full aside (including logo, nav placeholder, sign out) and then render nav links
function renderSidebar(currentPage) {
    console.log('[DEBUG] renderSidebar called for page:', currentPage);
    const container = document.getElementById('sidebar-container');
    console.log('[DEBUG] sidebar container found:', !!container);
    if (!container) {
        console.error('[ERROR] sidebar-container not found in DOM');
        return;
    }
    // Set container attributes and build internal structure
    container.className = 'sidebar w-64 flex-col px-6 py-6 text-sm';
    container.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/90">
              <svg aria-hidden="true" class="h-6 w-6 text-white" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                <path d="M17 20v-1a4 4 0 0 0-4-4h-1"></path>
                <path d="M7 20v-1a4 4 0 0 1 4-4h1"></path>
                <circle cx="9" cy="8" r="3"></circle>
                <circle cx="16" cy="7" r="3"></circle>
              </svg>
            </div>
            <div>
              <p class="text-base font-semibold text-white">EventVision</p>
              <p class="text-xs text-slate-400">Crowd analytics</p>
            </div>
          </div>
          <nav id="sidebar-nav" class="mt-10 space-y-2"></nav>
          <div class="mt-auto pt-8 text-xs text-slate-400">
            <button class="flex items-center gap-2 text-slate-300" data-action="signout" type="button">
              <span>Sign Out</span>
            </button>
          </div>
    `;

    // now populate links and mark active
    const nav = document.querySelector('#sidebar-nav');
    console.log('[DEBUG] sidebar nav found:', !!nav);
    if (!nav) {
        console.error('[ERROR] sidebar-nav not found after innerHTML');
        return;
    }
    const links = [
        {name: 'Dashboard', page: 'dashboard', href: 'dashboard.html'},
        {name: 'Live Camera', page: 'live-camera', href: 'live_camera.html'},
        {name: 'Upload', page: 'upload-connect', href: 'upload-connect.html'},
        {name: 'Settings', page: 'settings', href: 'settings.html'}
    ];
    nav.innerHTML = links.map(l => {
        const active = (l.page === currentPage) ? ' active' : '';
        return `<a class="sidebar-link flex items-center gap-3 rounded-xl px-3 py-2${active}" data-nav="${l.page}" href="${l.href}"><span>${l.name}</span></a>`;
    }).join('');
    console.log('[DEBUG] renderSidebar completed successfully');
}

// ensure live link still exists for backward compatibility (will be covered by renderSidebar)
function ensureLiveLink() {
    const nav = document.querySelector('.sidebar nav');
    if (!nav) return;
    if (nav.querySelector('[data-nav="live"]')) return;

    const a = document.createElement('a');
    a.className = 'sidebar-link flex items-center gap-3 rounded-xl px-3 py-2';
    a.setAttribute('data-nav', 'live');
    a.href = 'live_camera.html';
    a.innerHTML = '<span>Live Camera</span>';

    const dash = nav.querySelector('[data-nav="dashboard"]');
    if (dash && dash.parentNode === nav) {
        nav.insertBefore(a, dash.nextSibling);
    } else {
        nav.appendChild(a);
    }
}

function normalizeSidebar() {
    const nav = document.querySelector('.sidebar nav');
    if (!nav) return;
    // ensure live link
    ensureLiveLink();
    // ensure upload text is correct
    const uploadLink = nav.querySelector('[data-nav="upload"] span');
    if (uploadLink) uploadLink.textContent = 'Upload';
}


// Login Page
function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const submitBtn = loginForm.querySelector('[data-action="login"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';
            
            const result = await AuthAPI.login(email, password);
            
            if (result && result.ok) {
                window.location.href = 'dashboard.html';
            } else {
                alert(result?.data?.error || 'Login failed. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign in';
            }
        });
    }
}

// Signup Page
function initSignupPage() {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            if (password.length < 8) {
                alert('Password must be at least 8 characters');
                return;
            }
            
            const submitBtn = signupForm.querySelector('[data-action="signup"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';
            
            const result = await AuthAPI.register(email, password, name);
            
            if (result && result.ok) {
                window.location.href = 'dashboard.html';
            } else {
                alert(result?.data?.error || 'Registration failed. Please try again.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        });
    }
}

// Dashboard Page
function initDashboardPage() {
    loadDashboardMetrics();
    loadDensityChart();
    loadRecentAlerts();
    
    // Refresh every 30 seconds
    setInterval(() => {
        loadDashboardMetrics();
        loadDensityChart();
        loadRecentAlerts();
    }, 30000);
}

async function loadDashboardMetrics() {
    const result = await DashboardAPI.getMetrics(24);
    
    if (result && result.ok) {
        const data = result.data;
        
        // Update metrics
        updateMetric('metric-total-attendance', data.total_attendance.toLocaleString());
        updateMetricDelta('metric-total-attendance-delta', data.attendance_delta);
        
        updateMetric('metric-avg-density', `${data.avg_density}%`);
        updateMetricDelta('metric-avg-density-delta', data.density_delta);
        
        updateMetric('metric-active-alerts', data.active_alerts);
        updateMetric('metric-active-cameras', data.active_cameras);
        
        const statusEl = document.getElementById('metric-active-cameras-status');
        if (statusEl) {
            statusEl.textContent = data.cameras_status;
        }
    }
}

function updateMetric(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function updateMetricDelta(id, delta) {
    const el = document.getElementById(id);
    if (el) {
        const sign = delta >= 0 ? '+' : '';
        el.textContent = `${sign}${delta.toFixed(1)}%`;
    }
}

async function loadDensityChart() {
    const result = await DashboardAPI.getMetrics(24);
    
    if (result && result.ok) {
        const data = result.data;
        
        // Use actual metrics from API
        // Scale total attendance to 0-100 (max 20000)
        const attendancePercent = Math.min(100, (data.total_attendance / 20000) * 100);
        
        // Avg density is already a percentage
        const avgDensity = Math.min(100, data.avg_density);
        
        // Active alerts - scale to 0-100 (max 50 alerts)
        const alertsPercent = Math.min(100, (data.active_alerts / 50) * 100);
        
        // Extract active cameras count from string like "24/24"
        const cameraMatch = data.active_cameras.match(/(\d+)\/(\d+)/);
        let camerasPercent = 0;
        if (cameraMatch) {
            camerasPercent = (parseInt(cameraMatch[1]) / parseInt(cameraMatch[2])) * 100;
        }
        
        // Update chart bars
        const updates = [
            { densityId: 'zone-a-density', barId: 'zone-a-bar', value: data.total_attendance, percent: attendancePercent },
            { densityId: 'zone-b-density', barId: 'zone-b-bar', value: `${avgDensity}%`, percent: avgDensity },
            { densityId: 'zone-c-density', barId: 'zone-c-bar', value: data.active_alerts, percent: alertsPercent },
            { densityId: 'zone-d-density', barId: 'zone-d-bar', value: data.active_cameras, percent: camerasPercent }
        ];
        
        updates.forEach(update => {
            const densityEl = document.getElementById(update.densityId);
            const barEl = document.getElementById(update.barId);
            
            if (densityEl) densityEl.textContent = update.value;
            if (barEl) barEl.style.width = `${update.percent}%`;
        });
        
        const updatedEl = document.getElementById('chart-updated');
        if (updatedEl) {
            updatedEl.textContent = 'Live';
        }
    }
}

async function loadRecentAlerts() {
    const result = await DashboardAPI.getAlerts(4);
    
    if (result && result.ok) {
        const alerts = result.data.alerts;
        const container = document.getElementById('recent-alerts-list');
        
        if (container && alerts.length > 0) {
            container.innerHTML = alerts.map(alert => `
                <div class="rounded-xl bg-slate-900/60 p-4" data-alert-id="alert-${alert.id}">
                    <p class="text-sm text-white" data-alert-title>${alert.message}</p>
                    <p class="text-xs text-${getSeverityColor(alert.severity)}" data-alert-level>${alert.severity.toUpperCase()}</p>
                    <p class="text-xs text-slate-400" data-alert-time>${formatTimeAgo(alert.timestamp)}</p>
                </div>
            `).join('');
        }
    }
}

function getSeverityColor(severity) {
    const colors = {
        'critical': 'rose-400',
        'warning': 'amber-400',
        'info': 'blue-300',
        'success': 'emerald-300'
    };
    return colors[severity] || 'slate-400';
}

function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

async function loadCameras() {
    const result = await DashboardAPI.getCameras();
    
    if (result && result.ok) {
        const cameras = result.data.cameras;
        // Update camera cards (simplified - you may want to enhance this)
        console.log('Cameras loaded:', cameras);
    }
}

// Analytics Page
function initAnalyticsPage() {
    loadAnalyticsData();
    
    // Export CSV button
    document.querySelectorAll('[data-action="export-csv"]').forEach(btn => {
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = 'Exporting...';
            await AnalyticsAPI.exportCSV(24);
            btn.disabled = false;
            btn.textContent = 'Export CSV';
        });
    });
}

async function loadAnalyticsData() {
    // Load zone stats
    const statsResult = await AnalyticsAPI.getZoneStats(24);
    
    if (statsResult && statsResult.ok) {
        const zones = statsResult.data.zones;
        const tbody = document.getElementById('zone-stats-body');
        
        if (tbody) {
            tbody.innerHTML = zones.map(zone => `
                <tr>
                    <td class="text-white">${zone.zone_name}</td>
                    <td>${zone.avg_density}%</td>
                    <td>${zone.peak_time}</td>
                    <td>${zone.alerts_triggered}</td>
                    <td><span class="status-pill status-${zone.status.toLowerCase()}">${zone.status}</span></td>
                </tr>
            `).join('');
        }
    }
    
    // Load density trends (for charts - you may want to integrate a charting library)
    const trendsResult = await AnalyticsAPI.getDensityTrends(24);
    if (trendsResult && trendsResult.ok) {
        console.log('Density trends:', trendsResult.data.trends);
        // You can integrate Chart.js or another library here
    }
}

// Upload Page
function initUploadPage() {
    const dropzone = document.getElementById('upload-dropzone');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Browse files button
    document.querySelectorAll('[data-action="browse-files"]').forEach(btn => {
        btn.addEventListener('click', () => {
            fileInput.click();
        });
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // Drag and drop
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });
        
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('drag-over');
        });
        
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            
            if (e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }
}

async function handleFileUpload(file) {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    if (!isVideo && !isImage) {
        alert('Please upload an image or video file');
        return;
    }
    
    // Hide previous previews
    document.getElementById('video-player-section')?.classList.add('hidden');
    document.getElementById('image-preview-section')?.classList.add('hidden');
    
    // Show loading state
    const dropzone = document.getElementById('upload-dropzone');
    if (dropzone) {
        dropzone.innerHTML = `
            <div class="flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p class="text-white">Processing ${isVideo ? 'video' : 'image'}... Please wait.</p>
                <p class="text-xs text-slate-400 mt-2">${isVideo ? 'Video processing may take several minutes. Please do not close this page.' : 'This may take a few moments'}</p>
                <p class="text-xs text-slate-500 mt-1" id="processing-status">Uploading file...</p>
            </div>
        `;
    }
    
    try {
        let result;
        const statusEl = document.getElementById('processing-status');
        
        if (isImage) {
            if (statusEl) statusEl.textContent = 'Processing image with AI...';
            result = await UploadAPI.uploadImage(file);
        } else {
            if (statusEl) statusEl.textContent = 'Uploading video...';
            // For videos, use a longer timeout and show progress
            if (statusEl) statusEl.textContent = 'Processing video with YOLOv8 AI... This may take several minutes.';
            result = await UploadAPI.uploadVideo(file, null, null, 600000); // 10 minute timeout
        }
        
        if (result && result.ok) {
            // Hide dropzone
            if (dropzone) {
                dropzone.style.display = 'none';
            }
            
            if (isVideo) {
                displayProcessedVideo(result.data);
            } else {
                displayProcessedImage(result.data);
            }
            
            // Reload dashboard if on dashboard page
            if (document.body.getAttribute('data-page') === 'dashboard') {
                loadDashboardMetrics();
            }
        } else {
            const errorMsg = result?.data?.error || result?.error || 'Failed to process file';
            console.error('Upload error:', result);
            alert(`Error: ${errorMsg}\n\nCheck the browser console (F12) for more details.`);
            resetDropzone();
        }
    } catch (error) {
        alert('Error uploading file: ' + error.message);
        resetDropzone();
    }
}

function displayProcessedVideo(data) {
    const videoSection = document.getElementById('video-player-section');
    const videoElement = document.getElementById('processed-video');
    const personCountEl = document.getElementById('video-person-count');
    const densityEl = document.getElementById('video-density');
    const statusEl = document.getElementById('video-status');
    
    if (!videoSection || !videoElement) return;
    
    // Get processed video URL
    let videoUrl = null;
    if (data.result?.processed_video_url) {
        // Ensure URL starts with /api/files/
        const url = data.result.processed_video_url.startsWith('/api/files/')
            ? data.result.processed_video_url
            : `/api/files/${data.result.processed_video_url}`;
        videoUrl = `http://localhost:5000${url}`;
    }
    
    // Update stats
    const personCount = data.result?.average_person_count || 0;
    const density = data.result?.average_density || 0;
    
    personCountEl.textContent = Math.round(personCount);
    densityEl.textContent = `${density.toFixed(1)}%`;
    
    // Show video section first
    videoSection.classList.remove('hidden');
    videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    if (videoUrl) {
        console.log('Loading video from:', videoUrl);
        statusEl.textContent = 'Loading video...';
        statusEl.className = 'mt-2 text-sm font-semibold text-amber-300';
        
        const token = localStorage.getItem('auth_token');
        
        // Fetch video with authentication
        fetch(videoUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            console.log('Video fetch response status:', response.status);
            if (!response.ok) {
                throw new Error(`Failed to load video: ${response.status} ${response.statusText}`);
            }
            return response.blob();
        })
        .then(blob => {
            console.log('Video blob received, size:', blob.size, 'bytes');
            if (blob.size === 0) {
                throw new Error('Video file is empty');
            }
            
            // Check if blob is actually a video
            if (!blob.type.startsWith('video/') && blob.type !== 'application/octet-stream') {
                console.warn('Unexpected blob type:', blob.type);
            }
            
            const blobUrl = URL.createObjectURL(blob);
            console.log('Created blob URL:', blobUrl);
            
            // Clear any previous error
            videoElement.innerHTML = '';
            
            // Set video source
            videoElement.src = blobUrl;
            videoElement.type = 'video/mp4';
            
            // Add event listeners for debugging
            videoElement.onloadedmetadata = () => {
                console.log('Video metadata loaded');
                console.log('Video duration:', videoElement.duration);
                console.log('Video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
                statusEl.textContent = 'Ready to play';
                statusEl.className = 'mt-2 text-sm font-semibold text-emerald-300';
            };
            
            videoElement.oncanplay = () => {
                console.log('Video can play');
            };
            
            videoElement.onloadeddata = () => {
                console.log('Video data loaded');
            };
            
            videoElement.onerror = (e) => {
                console.error('Video element error:', e);
                console.error('Video error code:', videoElement.error?.code);
                console.error('Video error message:', videoElement.error?.message);
                const errorMsg = videoElement.error?.message || 'Unknown video error';
                statusEl.textContent = `Error: ${errorMsg}`;
                statusEl.className = 'mt-2 text-sm font-semibold text-rose-300';
            };
            
            // Try to load the video
            videoElement.load();
            
            // Force play attempt after a short delay
            setTimeout(() => {
                if (videoElement.readyState >= 2) {
                    console.log('Video is ready, attempting to play');
                    videoElement.play().catch(err => {
                        console.log('Auto-play prevented:', err);
                    });
                }
            }, 500);
        })
        .catch(error => {
            console.error('Error loading video:', error);
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'mt-2 text-sm font-semibold text-rose-300';
            
            // Show error message in video element
            videoElement.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-white p-8">
                    <p class="text-lg mb-2">Error loading video</p>
                    <p class="text-sm text-slate-400">${error.message}</p>
                    <p class="text-xs text-slate-500 mt-4">Check browser console for details</p>
                </div>
            `;
        });
    } else {
        console.warn('No processed video URL provided');
        statusEl.textContent = 'Processing complete - Video file may not be available';
        statusEl.className = 'mt-2 text-sm font-semibold text-amber-300';
        
        // Show message in video element
        videoElement.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-white p-8">
                <p class="text-lg mb-2">Video processed successfully</p>
                <p class="text-sm text-slate-400">Processed video file is being generated</p>
                <p class="text-xs text-slate-500 mt-4">Check the backend logs for processing status</p>
            </div>
        `;
    }
}

function displayProcessedImage(data) {
    const imageSection = document.getElementById('image-preview-section');
    const imageElement = document.getElementById('processed-image');
    const personCountEl = document.getElementById('image-person-count');
    const densityEl = document.getElementById('image-density');
    
    if (!imageSection || !imageElement) return;
    
    // Get processed image URL
    const imageUrl = data.result?.processed_image_url 
        ? `http://localhost:5000${data.result.processed_image_url}`
        : null;
    
    if (imageUrl) {
        imageElement.src = imageUrl;
        
        // Update stats
        const personCount = data.result?.person_count || 0;
        const density = data.result?.density_percentage || 0;
        
        personCountEl.textContent = personCount;
        densityEl.textContent = `${density.toFixed(1)}%`;
        
        // Show image section
        imageSection.classList.remove('hidden');
        
        // Scroll to image
        imageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function resetDropzone() {
    const dropzone = document.getElementById('upload-dropzone');
    if (dropzone) {
        dropzone.style.display = 'block';
        dropzone.innerHTML = `
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/70">
                <svg aria-hidden="true" class="h-6 w-6 text-slate-300" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M4 16.5a4.5 4.5 0 0 1 .9-8.9 5 5 0 0 1 9.8-1.5h.2a4 4 0 0 1 0 8H13"></path>
                    <path d="M12 12v9"></path>
                    <path d="m16 16-4-4-4 4"></path>
                </svg>
            </div>
            <p class="mt-4 text-sm text-white">Drag & Drop files here</p>
            <p class="mt-1 text-xs text-slate-400">Support for MP4, AVI, JPG, PNG (Max 500MB)</p>
            <button class="action-btn mt-4" data-action="browse-files" type="button">Browse Files</button>
        `;
        // Re-initialize browse button
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
            document.querySelectorAll('[data-action="browse-files"]').forEach(btn => {
                btn.addEventListener('click', () => fileInput.click());
            });
        }
    }
}
