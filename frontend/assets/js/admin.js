// ==========================================
// ADMIN DASHBOARD
// ==========================================

Api.requireAdmin();

document.getElementById("user-name").textContent = Api.getName() || "Admin";

document.getElementById("logout-btn").addEventListener("click", () => {
  Api.clearSession();
  window.location.href = "index.html";
});

function priorityPill(priority) {
  const cls = { Low: "pill-low", Medium: "pill-medium", High: "pill-high" }[priority] || "pill-medium";
  return `<span class="pill ${cls}">${escapeHtml(priority)}</span>`;
}

function statusPill(status) {
  const map = {
    Open: "pill-open",
    "In Progress": "pill-progress",
    Pending: "pill-pending",
    Resolved: "pill-resolved",
    Closed: "pill-closed",
  };
  return `<span class="pill ${map[status] || "pill-open"}">${escapeHtml(status)}</span>`;
}

async function loadDashboard() {
  try {
    const { data } = await Api.get("/admin/dashboard");
    const cards = document.querySelectorAll("#stat-grid .stat-card");
    const values = [
      data.total_users,
      data.total_tickets,
      data.open_tickets,
      data.closed_tickets,
      data.high_priority,
    ];
    cards.forEach((card, i) => {
      card.querySelector(".num").textContent = values[i];
    });
  } catch (err) {
    showToast(err.message, true);
  }
}

async function loadAllTickets() {
  const body = document.getElementById("admin-ticket-body");
  try {
    const tickets = await Api.get("/admin/tickets");

    if (!tickets.length) {
      body.innerHTML = `<tr><td colspan="5">No tickets have been created yet.</td></tr>`;
      return;
    }

    body.innerHTML = tickets
      .slice()
      .reverse()
      .map(
        (t) => `
        <tr>
          <td>${escapeHtml(t.title)}</td>
          <td>${priorityPill(t.priority)}</td>
          <td>${statusPill(t.status)}</td>
          <td>${timeAgo(t.created_at)}</td>
          <td><a href="ticket.html?id=${t.id}">Open →</a></td>
        </tr>`
      )
      .join("");
  } catch (err) {
    body.innerHTML = `<tr><td colspan="5">${escapeHtml(err.message)}</td></tr>`;
  }
}

loadDashboard();
loadAllTickets();
