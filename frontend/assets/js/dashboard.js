// ==========================================
// DASHBOARD: MY TICKETS
// ==========================================

Api.requireAuth();

document.getElementById("user-name").textContent = Api.getName() || "Account";
if (Api.getRole() === "admin") {
  document.querySelector(".admin-only").style.display = "flex";
}

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

async function loadTickets() {
  const list = document.getElementById("ticket-list");
  try {
    const tickets = await Api.get("/tickets");

    if (!tickets.length) {
      list.innerHTML = `
        <li class="empty-state">
          <h3>No tickets yet</h3>
          <p>When you open a support ticket, it'll show up here.</p>
        </li>`;
      return;
    }

    list.innerHTML = tickets
      .slice()
      .reverse()
      .map(
        (t) => `
        <li>
          <a class="ticket-row" href="ticket.html?id=${t.id}">
            <div>
              <div class="title">${escapeHtml(t.title)}</div>
              <div class="desc">${escapeHtml(t.description)}</div>
            </div>
            <div class="meta">${timeAgo(t.created_at)}</div>
            ${priorityPill(t.priority)}
            ${statusPill(t.status)}
          </a>
        </li>`
      )
      .join("");
  } catch (err) {
    list.innerHTML = `<li class="empty-state"><h3>Couldn't load tickets</h3><p>${escapeHtml(err.message)}</p></li>`;
  }
}

// ---------- New ticket modal ----------

const backdrop = document.getElementById("modal-backdrop");

document.getElementById("new-ticket-btn").addEventListener("click", () => {
  document.getElementById("new-ticket-form").reset();
  document.getElementById("modal-error").textContent = "";
  backdrop.classList.add("show");
});

document.getElementById("modal-cancel").addEventListener("click", () => {
  backdrop.classList.remove("show");
});

backdrop.addEventListener("click", (e) => {
  if (e.target === backdrop) backdrop.classList.remove("show");
});

document.getElementById("new-ticket-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById("modal-error");
  const submitBtn = document.getElementById("modal-submit");
  errorBox.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating…";

  try {
    await Api.post("/tickets", {
      title: document.getElementById("t-title").value.trim(),
      description: document.getElementById("t-description").value.trim(),
      priority: document.getElementById("t-priority").value,
    });

    backdrop.classList.remove("show");
    showToast("Ticket created");
    loadTickets();
  } catch (err) {
    errorBox.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create ticket";
  }
});

loadTickets();
