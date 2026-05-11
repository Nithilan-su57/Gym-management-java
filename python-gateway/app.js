
// Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

// State
let allMembers = [];
let allPlans = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupScrollEffects();
    setupNavigation();
});

async function initializeApp() {
    showLoading();
    try {
        await Promise.all([
            loadPlans(),
            loadMembers(),
            loadDashboardStats()
        ]);
        hideLoading();
        addActivity('Dashboard loaded successfully');
    } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to load data. Please check if the backend is running.', 'error');
        hideLoading();
    }
}

async function loadGymData() {
    // Call the Python Gateway route
    const response = await fetch('/get-members'); 
    const data = await response.json();
    console.log("Member Data:", data);
    // Logic to display data on your MajaGym site...
}

// API Calls
async function loadPlans() {
    try {
        const response = await fetch(`${API_BASE_URL}/plans/all`);
        if (!response.ok) throw new Error('Failed to fetch plans');
        allPlans = await response.json();
        renderPlans(allPlans);
        populatePlanSelect();
        document.getElementById('totalPlans').textContent = allPlans.length;
    } catch (error) {
        console.error('Error loading plans:', error);
        showToast('Failed to load plans', 'error');
    }
}

async function loadMembers() {
    try {
        const response = await fetch(`${API_BASE_URL}/members/all`);
        if (!response.ok) throw new Error('Failed to fetch members');
        allMembers = await response.json();
        renderMembers(allMembers);
        document.getElementById('totalMembers').textContent = allMembers.length;
    } catch (error) {
        console.error('Error loading members:', error);
        showToast('Failed to load members', 'error');
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/manager/report`);
        if (!response.ok) throw new Error('Failed to fetch report');
        const report = await response.text();
        
        // Parse the report string to extract revenue
        // Expected format: "Total Revenue: ₹XXXX.XX | Total Members: XX"
        const revenueMatch = report.match(/Total Revenue:\s*₹([\d,]+\.?\d*)/);
        const revenue = revenueMatch ? revenueMatch[1] : '0';
        
        document.getElementById('totalRevenue').textContent = `₹${revenue}`;
        document.getElementById('dashRevenue').textContent = revenue;
        document.getElementById('dashMembers').textContent = allMembers.length;
        document.getElementById('dashActivePlans').textContent = allPlans.length;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Render Functions
function renderPlans(plans) {
    const container = document.getElementById('plansContainer');
    if (!plans || plans.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--light);">No plans available. Create your first plan!</p>';
        return;
    }
    
    container.innerHTML = plans.map((plan, index) => {
        const hasDiscount = plan.discountPercentage > 0;
        const discountedPrice = plan.basePrice * (1 - plan.discountPercentage / 100);
        const isPopular = index === 1; // Middle plan is popular
        
        return `
            <div class="plan-card ${isPopular ? 'plan-popular' : ''}">
                ${isPopular ? '<div class="plan-badge">Popular</div>' : ''}
                <h3 class="plan-name">${plan.planName}</h3>
                <div class="plan-pricing">
                    <span class="plan-price">₹${discountedPrice.toFixed(2)}</span>
                    ${hasDiscount ? `
                        <span class="plan-original">₹${plan.basePrice.toFixed(2)}</span>
                        <span class="plan-discount">${plan.discountPercentage}% OFF</span>
                    ` : ''}
                </div>
                <ul class="plan-features">
                    ${plan.features ? plan.features.split(',').map(f => `<li>${f.trim()}</li>`).join('') : '<li>Standard gym access</li>'}
                </ul>
                <div class="plan-actions">
                    <button class="btn-primary btn-small" onclick="selectPlanForRegistration('${plan.planName}')">
                        Choose Plan
                    </button>
                    <button class="btn-secondary btn-small" onclick="editPlanDiscount(${plan.id}, ${plan.discountPercentage})">
                        Edit Discount
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderMembers(members) {
    const container = document.getElementById('membersGrid');
    if (!members || members.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--light); grid-column: 1/-1;">No members registered yet.</p>';
        return;
    }
    
    container.innerHTML = members.map(member => {
        const isActive = member.checkAccess || (member.expiryDate && new Date(member.expiryDate) > new Date());
        const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        return `
            <div class="member-card" onclick="showMemberDetails(${member.id})">
                <div class="member-header">
                    <div class="member-avatar">${initials}</div>
                    <span class="member-status ${isActive ? 'active' : 'expired'}">
                        ${isActive ? 'Active' : 'Expired'}
                    </span>
                </div>
                <div class="member-info">
                    <h3>${member.name}</h3>
                    <p>${member.email}</p>
                    <p>${member.phoneNumber || 'No phone'}</p>
                </div>
                <div class="member-plan">
                    <div class="member-plan-name">${member.membershipPlan}</div>
                    <div class="member-dates">
                        Joined: ${formatDate(member.joinDate)}<br>
                        Expires: ${formatDate(member.expiryDate)}
                    </div>
                </div>
                <div class="member-actions">
                    <button class="btn-secondary btn-small" onclick="event.stopPropagation(); renewMember(${member.id})">
                        Renew
                    </button>
                    <button class="btn-secondary btn-small" onclick="event.stopPropagation(); checkMemberAccess(${member.id})">
                        Check Access
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Member Functions
async function registerMember(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const memberData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phoneNumber: formData.get('phoneNumber'),
        membershipPlan: formData.get('membershipPlan')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/members/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memberData)
        });
        
        if (!response.ok) throw new Error('Registration failed');
        
        const newMember = await response.json();
        showToast(`Welcome ${newMember.name}! Registration successful.`, 'success');
        closeModal('join');
        event.target.reset();
        await loadMembers();
        await loadDashboardStats();
        addActivity(`New member registered: ${newMember.name}`);
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please try again.', 'error');
    }
}

async function renewMember(memberId) {
    const months = prompt('Enter number of months to renew:', '1');
    if (!months || isNaN(months) || months <= 0) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/members/${memberId}/renew?months=${months}`, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Renewal failed');
        
        const updated = await response.json();
        showToast(`Membership renewed successfully until ${formatDate(updated.expiryDate)}`, 'success');
        await loadMembers();
        addActivity(`Membership renewed for ${months} month(s)`);
    } catch (error) {
        console.error('Renewal error:', error);
        showToast('Renewal failed. Please try again.', 'error');
    }
}

async function checkMemberAccess(memberId) {
    try {
        const response = await fetch(`${API_BASE_URL}/members/${memberId}/access`);
        if (!response.ok) throw new Error('Access check failed');
        
        const result = await response.text();
        const isGranted = result.includes('Granted');
        showToast(result, isGranted ? 'success' : 'error');
    } catch (error) {
        console.error('Access check error:', error);
        showToast('Failed to check access', 'error');
    }
}

function showMemberDetails(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;
    
    const isActive = member.checkAccess || (member.expiryDate && new Date(member.expiryDate) > new Date());
    
    const detailsHTML = `
        <div style="padding: 2rem;">
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="width: 100px; height: 100px; margin: 0 auto 1rem; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white; font-family: var(--font-display);">
                    ${member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <h2 style="color: var(--white); margin-bottom: 0.5rem;">${member.name}</h2>
                <span class="member-status ${isActive ? 'active' : 'expired'}">
                    ${isActive ? 'Active Member' : 'Membership Expired'}
                </span>
            </div>
            
            <div style="background: rgba(0,0,0,0.2); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--primary);">Email:</strong><br>
                    <span style="color: var(--light);">${member.email}</span>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--primary);">Phone:</strong><br>
                    <span style="color: var(--light);">${member.phoneNumber || 'Not provided'}</span>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--primary);">Plan:</strong><br>
                    <span style="color: var(--light);">${member.membershipPlan}</span>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong style="color: var(--primary);">Join Date:</strong><br>
                    <span style="color: var(--light);">${formatDate(member.joinDate)}</span>
                </div>
                <div>
                    <strong style="color: var(--primary);">Expiry Date:</strong><br>
                    <span style="color: var(--light);">${formatDate(member.expiryDate)}</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button class="btn-primary" style="flex: 1;" onclick="closeModal('member'); renewMember(${member.id})">
                    Renew Membership
                </button>
                <button class="btn-secondary" style="flex: 1;" onclick="closeModal('member')">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('memberDetails').innerHTML = detailsHTML;
    showModal('member');
}

// Plan Functions
async function createPlan(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const planData = {
        planName: formData.get('planName'),
        basePrice: parseFloat(formData.get('basePrice')),
        discountPercentage: parseFloat(formData.get('discountPercentage')) || 0,
        features: formData.get('features')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/plans/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(planData)
        });
        
        if (!response.ok) throw new Error('Plan creation failed');
        
        const newPlan = await response.json();
        showToast(`Plan "${newPlan.planName}" created successfully!`, 'success');
        closeModal('createPlan');
        event.target.reset();
        await loadPlans();
        addActivity(`New plan created: ${newPlan.planName}`);
    } catch (error) {
        console.error('Plan creation error:', error);
        showToast('Failed to create plan. Please try again.', 'error');
    }
}

async function editPlanDiscount(planId, currentDiscount) {
    const newDiscount = prompt(`Enter new discount percentage (current: ${currentDiscount}%):`, currentDiscount);
    if (newDiscount === null || newDiscount === '' || isNaN(newDiscount)) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/plans/${planId}/set-discount?discount=${newDiscount}`, {
            method: 'PUT'
        });
        
        if (!response.ok) throw new Error('Update failed');
        
        showToast('Discount updated successfully!', 'success');
        await loadPlans();
        addActivity(`Plan discount updated to ${newDiscount}%`);
    } catch (error) {
        console.error('Update error:', error);
        showToast('Failed to update discount', 'error');
    }
}

function selectPlanForRegistration(planName) {
    showModal('join');
    setTimeout(() => {
        document.querySelector('[name="membershipPlan"]').value = planName;
    }, 100);
}

function populatePlanSelect() {
    const select = document.getElementById('planSelect');
    select.innerHTML = '<option value="">Choose a plan...</option>' +
        allPlans.map(plan => `<option value="${plan.planName}">${plan.planName} - ₹${(plan.basePrice * (1 - plan.discountPercentage / 100)).toFixed(2)}</option>`).join('');
}

// Dashboard Functions
async function generateReport() {
    try {
        const response = await fetch(`${API_BASE_URL}/manager/report`);
        if (!response.ok) throw new Error('Report generation failed');
        
        const report = await response.text();
        alert(report);
        addActivity('Revenue report generated');
    } catch (error) {
        console.error('Report error:', error);
        showToast('Failed to generate report', 'error');
    }
}

async function cleanupExpired() {
    if (!confirm('This will remove all expired members from the database. Continue?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/manager/cleanup`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Cleanup failed');
        
        const result = await response.text();
        showToast(result, 'success');
        await loadMembers();
        await loadDashboardStats();
        addActivity('Expired members cleaned up');
    } catch (error) {
        console.error('Cleanup error:', error);
        showToast('Cleanup failed', 'error');
    }
}

async function refreshAllData() {
    showToast('Refreshing data...', 'success');
    await initializeApp();
}

// Filter Functions
function filterMembers() {
    const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    const filtered = allMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm) ||
                            member.email.toLowerCase().includes(searchTerm);
        
        if (statusFilter === 'all') return matchesSearch;
        
        const isActive = member.checkAccess || (member.expiryDate && new Date(member.expiryDate) > new Date());
        const matchesStatus = statusFilter === 'active' ? isActive : !isActive;
        
        return matchesSearch && matchesStatus;
    });
    
    renderMembers(filtered);
}

// Modal Functions
function showModal(modalName) {
    const modal = document.getElementById(`${modalName}Modal`);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalName) {
    const modal = document.getElementById(`${modalName}Modal`);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on background click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading() {
    // Implement loading state if needed
}

function hideLoading() {
    // Implement loading state removal if needed
}

function addActivity(text) {
    const activityLog = document.getElementById('activityLog');
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <span class="activity-time">${timeString}</span>
        <span class="activity-text">${text}</span>
    `;
    
    activityLog.insertBefore(activityItem, activityLog.firstChild);
    
    // Keep only last 10 activities
    while (activityLog.children.length > 10) {
        activityLog.removeChild(activityLog.lastChild);
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Update active link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

function setupScrollEffects() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('memberSearch')?.focus();
    }
});