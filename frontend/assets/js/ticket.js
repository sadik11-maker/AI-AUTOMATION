// ==========================================
// TICKET DETAIL
// ==========================================

Api.requireAuth();

document.getElementById("user-name").textContent = Api.getName() || "Account";
const isAdmin = Api.getRole() === "admin";
if (isAdmin) {
  document.querySelector(".admin-only").style.display = "flex";
}

document.getElementById("logout-btn").addEventListener("click", () => {
  Api.clearSession();
  window.location.href = "index.html";
});

const params = new URLSearchParams(window.location.search);
const ticketId = params.get("id");
const card = document.getElementById("ticket-card");

if (!ticketId) {
  card.innerHTML = `<div class="empty-state"><h3>No ticket specified</h3></div>`;
  throw new Error("missing ticket id");
}

// Admins can open any ticket via /admin/tickets/{id}; regular users are
// restricted to their own via /tickets/{id}.
const base = isAdmin ? `/admin/tickets/${ticketId}` : `/tickets/${ticketId}`;

const STATUS_OPTIONS = ["Open", "In Progress", "Pending", "Resolved", "Closed"];

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

let currentTicket = null;

async function loadTicket() {
  try {
    const [ticket, comments] = await Promise.all([
      Api.get(base),
      Api.get(`${base}/comments`),
    ]);

    currentTicket = ticket;
    render(ticket, comments);
  } catch (err) {
    card.innerHTML = `<div class="empty-state"><h3>Couldn't load ticket</h3><p>${escapeHtml(err.message)}</p></div>`;
  }
}

function render(ticket, comments) {
  card.innerHTML = `
    <div class="ticket-detail-head">
      <div>
        <h2>${escapeHtml(ticket.title)}</h2>
        <div class="desc">${escapeHtml(ticket.description)}</div>
        <div class="pills">${priorityPill(ticket.priority)} ${statusPill(ticket.status)}</div>
      </div>
      <div class="ticket-actions">
        ${isAdmin ? "" : (ticket.status !== "Closed"
            ? `<button class="btn btn-ghost" id="close-btn">Close ticket</button>`
            : "")}
        ${isAdmin ? "" : `<button class="btn btn-danger" id="delete-btn">Delete</button>`}
      </div>
    </div>

    ${isAdmin ? `
    <div class="admin-controls">
      <label style="margin:0;">Status</label>
      <select id="status-select">
        ${STATUS_OPTIONS.map(s => `<option value="${s}" ${s === ticket.status ? "selected" : ""}>${s}</option>`).join("")}
      </select>
      <button class="btn btn-primary" id="ai-suggest-btn">✨ AI: Suggest a reply</button>
    </div>
    <div id="ai-suggest-box"></div>
    ` : ""}

    <div class="comment-list" id="comment-list">
      ${comments.length ? comments.map(c => renderComment(c, ticket)).join("") : `<div class="empty-state" style="padding:24px 0;">No replies yet.</div>`}
    </div>

    <form class="comment-form" id="comment-form">
      <label for="comment-message">${isAdmin ? "Reply to customer" : "Add a comment"}</label>
      <textarea id="comment-message" required minlength="2" placeholder="Type your message…"></textarea>
      <div class="field-error" id="comment-error"></div>
      <button type="submit" class="btn btn-primary" style="margin-top:10px;">Send</button>
    </form>
  `;

  attachHandlers(ticket);
}

function renderComment(c, ticket) {
  const isFromOwner = c.user_id === ticket.user_id;
  const who = isFromOwner ? "Customer" : "Support Agent";
  return `
    <div class="comment">
      <div class="who">${who} · ${timeAgo(c.created_at)}</div>
      <div class="msg">${escapeHtml(c.message)}</div>
    </div>
  `;
}

function attachHandlers(ticket) {
  const closeBtn = document.getElementById("close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", async () => {
      try {
        await Api.patch(`/tickets/${ticket.id}/close`, {});
        showToast("Ticket closed");
        loadTicket();
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  const deleteBtn = document.getElementById("delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Delete this ticket permanently?")) return;
      try {
        await Api.del(`/tickets/${ticket.id}`);
        showToast("Ticket deleted");
        window.location.href = "dashboard.html";
      } catch (err) {
        showToast(err.message, true);
      }
    });
  }

  const statusSelect = document.getElementById("status-select");
  if (statusSelect) {
    statusSelect.addEventListener("change", async () => {
      try {
        await Api.patch(`/admin/tickets/${ticket.id}/status`, { status: statusSelect.value });
        showToast("Status updated");
        loadTicket();
      } catch (err) {
        showToast(err.message, true);
        statusSelect.value = ticket.status;
      }
    });
  }

  const aiBtn = document.getElementById("ai-suggest-btn");
  if (aiBtn) {
    aiBtn.addEventListener("click", async () => {
      const box = document.getElementById("ai-suggest-box");
      aiBtn.disabled = true;
      aiBtn.textContent = "Thinking…";
      box.innerHTML = "";
      try {
        const result = await Api.post("/ai/suggest-response", { message: ticket.description });
        box.innerHTML = `
          <div class="ai-box">
            <div class="lbl">✨ AI suggestion · ${escapeHtml(result.category)}</div>
            <p id="ai-suggested-text">${escapeHtml(result.suggested_response)}</p>
            <button class="btn btn-ghost" id="use-suggestion-btn">Use this reply</button>
          </div>
        `;
        document.getElementById("use-suggestion-btn").addEventListener("click", () => {
          document.getElementById("comment-message").value = result.suggested_response;
          document.getElementById("comment-message").focus();
        });
      } catch (err) {
        box.innerHTML = `<div class="ai-box"><p style="color:var(--red)">${escapeHtml(err.message)}</p></div>`;
      } finally {
        aiBtn.disabled = false;
        aiBtn.textContent = "✨ AI: Suggest a reply";
      }
    });
  }

  document.getElementById("comment-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("comment-error");
    const textarea = document.getElementById("comment-message");
    errorBox.textContent = "";

    try {
      await Api.post(`${base}/comments`, { message: textarea.value.trim() });
      showToast("Reply sent");
      loadTicket();
    } catch (err) {
      errorBox.textContent = err.message;
    }
  });
}

loadTicket();
