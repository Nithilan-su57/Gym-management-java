const API_URL = "http://127.0.0.1:8000";

// 1. Fetch Revenue & Member List on Load
async function updateDashboard() {
    // Fetch Revenue
    const revRes = await fetch(`${API_URL}/report/`);
    const revData = await revRes.json();
    document.getElementById('total-revenue').innerText = revData.total_revenue;

    // Fetch Member List
    const memRes = await fetch(`${API_URL}/members/`);
    const members = await memRes.json();
    
    const listElement = document.getElementById('memberList');
    listElement.innerHTML = ""; // Clear the list first

    members.forEach(member => {
        const li = document.createElement('li');
        li.className = "member-item";
        li.innerHTML = `<strong>${member.name}</strong> - ${member.plan_name} <br> <small>${member.email}</small>`;
        listElement.appendChild(li);
    });
}

// 2. Handle Form Submission
document.getElementById('memberForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const plan_name = document.getElementById('plan_name').value;

    const response = await fetch(`${API_URL}/register/?name=${name}&email=${email}&plan_name=${plan_name}`, {
        method: 'POST'
    });

    if (response.ok) {
        alert("Member Registered!");
        document.getElementById('memberForm').reset(); // Clear the form
        updateDashboard(); // Refresh everything
    } else {
        const errorData = await response.json();
        alert("Error: " + (errorData.detail || "Check console"));
    }
});

// Initialize
updateDashboard();