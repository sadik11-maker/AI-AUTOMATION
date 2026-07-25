/* ==========================================
   AI CUSTOMER SUPPORT - EMBEDDABLE WIDGET
   ==========================================
   Drop this on ANY website with:

   <script
     src="https://your-api-domain.com/static/widget.js"
     data-api="https://your-api-domain.com"
     data-business="Your Company Name"
   ></script>

   It renders a self-contained chat bubble (using Shadow DOM so it can
   never clash with the host site's CSS), talks to the public,
   no-login /ai/widget-chat endpoint for AI answers, and falls back to
   /widget/create-ticket to hand a conversation off to a human agent.
========================================== */

(function () {
  const scriptTag = document.currentScript;
  const API_BASE = (scriptTag && scriptTag.getAttribute("data-api")) || "";
  const BUSINESS_NAME = (scriptTag && scriptTag.getAttribute("data-business")) || "our company";

  if (!API_BASE) {
    console.error(
      "[AI Support Widget] Missing data-api attribute on the widget's <script> tag. " +
      "Example: <script src=\".../widget.js\" data-api=\"https://your-api.com\"></script>"
    );
    return;
  }

  // ---------- Host + Shadow root ----------

  const host = document.createElement("div");
  host.id = "acs-widget-host";
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: "open" });

  const STYLE = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif; }

    .bubble {
      position: fixed;
      bottom: 22px;
      right: 22px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #0f766e;
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(15,118,110,0.35);
      font-size: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      transition: transform 0.15s ease;
    }
    .bubble:hover { transform: scale(1.06); }

    .panel {
      position: fixed;
      bottom: 92px;
      right: 22px;
      width: 360px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100vh - 140px);
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 10px 40px rgba(20,23,31,0.25);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      border: 1px solid #e4e6eb;
    }
    .panel.open { display: flex; }

    .head {
      background: #14171f;
      color: #fff;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .head .title { font-size: 14px; font-weight: 700; }
    .head .sub { font-size: 12px; color: #9aa2b0; margin-top: 2px; }
    .head button {
      background: rgba(255,255,255,0.1);
      border: none;
      color: #fff;
      width: 26px; height: 26px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }

    .body {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f6f7f9;
    }

    .msg {
      max-width: 82%;
      padding: 9px 12px;
      border-radius: 12px;
      font-size: 13.5px;
      line-height: 1.4;
      white-space: pre-wrap;
    }
    .msg.bot {
      background: #fff;
      border: 1px solid #e4e6eb;
      align-self: flex-start;
      border-bottom-left-radius: 3px;
    }
    .msg.user {
      background: #0f766e;
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 3px;
    }
    .msg.typing { color: #8a919e; font-style: italic; }

    .quick-actions {
      display: flex;
      gap: 8px;
      padding: 0 14px 10px;
      flex-wrap: wrap;
    }
    .quick-actions button {
      background: #e3f3f1;
      color: #0b5a54;
      border: none;
      padding: 6px 10px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .composer {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #e4e6eb;
      background: #fff;
    }
    .composer textarea {
      flex: 1;
      resize: none;
      border: 1px solid #e4e6eb;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 13.5px;
      max-height: 70px;
      font-family: inherit;
    }
    .composer textarea:focus { outline: 2px solid #0f766e; }
    .composer button {
      background: #0f766e;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0 16px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    .composer button:disabled { opacity: 0.5; cursor: not-allowed; }

    .ticket-form {
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: #fff;
      border-top: 1px solid #e4e6eb;
    }
    .ticket-form input, .ticket-form textarea {
      border: 1px solid #e4e6eb;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 13px;
      font-family: inherit;
    }
    .ticket-form textarea { resize: vertical; min-height: 50px; }
    .ticket-form .row { display: flex; gap: 8px; }
    .ticket-form .row > * { flex: 1; }
    .ticket-form button {
      background: #0f766e;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 9px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .ticket-error { color: #b3261e; font-size: 12px; min-height: 14px; }
    .ticket-success { padding: 14px; font-size: 13.5px; text-align: center; color: #0b5a54; }
  `;

  root.innerHTML = `
    <style>${STYLE}</style>
    <button class="bubble" id="acs-bubble" aria-label="Open support chat">💬</button>
    <div class="panel" id="acs-panel">
      <div class="head">
        <div>
          <div class="title">${escapeHtml(BUSINESS_NAME)} Support</div>
          <div class="sub">AI assistant · usually replies instantly</div>
        </div>
        <button id="acs-close" aria-label="Close">✕</button>
      </div>
      <div class="body" id="acs-body"></div>
      <div class="quick-actions" id="acs-quick">
        <button data-action="human">Talk to a human</button>
      </div>
      <div class="composer" id="acs-composer">
        <textarea id="acs-input" rows="1" placeholder="Type your message…"></textarea>
        <button id="acs-send">Send</button>
      </div>
    </div>
  `;

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  // ---------- State ----------

  const history = []; // {role, content}
  let awaitingReply = false;

  const bodyEl = root.getElementById("acs-body");
  const inputEl = root.getElementById("acs-input");
  const sendBtn = root.getElementById("acs-send");
  const panelEl = root.getElementById("acs-panel");

  function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = `msg ${role === "user" ? "user" : "bot"}`;
    div.textContent = text;
    bodyEl.appendChild(div);
    bodyEl.scrollTop = bodyEl.scrollHeight;
    return div;
  }

  function addTyping() {
    const div = document.createElement("div");
    div.className = "msg bot typing";
    div.textContent = "Typing…";
    bodyEl.appendChild(div);
    bodyEl.scrollTop = bodyEl.scrollHeight;
    return div;
  }

  // Greet on first open only.
  let greeted = false;
  function openPanel() {
    panelEl.classList.add("open");
    if (!greeted) {
      addMessage("bot", `Hi! I'm the AI assistant for ${BUSINESS_NAME}. Ask me anything, or tap "Talk to a human" any time to open a support ticket.`);
      greeted = true;
    }
    inputEl.focus();
  }

  root.getElementById("acs-bubble").addEventListener("click", () => {
    if (panelEl.classList.contains("open")) {
      panelEl.classList.remove("open");
    } else {
      openPanel();
    }
  });

  root.getElementById("acs-close").addEventListener("click", () => {
    panelEl.classList.remove("open");
  });

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || awaitingReply) return;

    inputEl.value = "";
    addMessage("user", text);
    history.push({ role: "user", content: text });

    awaitingReply = true;
    sendBtn.disabled = true;
    const typingEl = addTyping();

    try {
      const res = await fetch(`${API_BASE}/ai/widget-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.slice(0, -1), // history BEFORE this message
          business_name: BUSINESS_NAME,
        }),
      });

      const data = await res.json();
      typingEl.remove();

      if (!res.ok) {
        addMessage("bot", "Sorry, I ran into a problem answering that. Please try again, or talk to a human.");
        return;
      }

      addMessage("bot", data.reply);
      history.push({ role: "assistant", content: data.reply });
    } catch (err) {
      typingEl.remove();
      addMessage("bot", "I couldn't reach the support server. Please check your connection and try again.");
    } finally {
      awaitingReply = false;
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // ---------- Hand-off to human (ticket creation) ----------

  root.getElementById("acs-quick").addEventListener("click", (e) => {
    if (e.target.dataset.action === "human") {
      showTicketForm();
    }
  });

  function showTicketForm() {
    const composer = root.getElementById("acs-composer");
    const quick = root.getElementById("acs-quick");
    composer.style.display = "none";
    quick.style.display = "none";

    const lastUserMsg = [...history].reverse().find((m) => m.role === "user");

    const form = document.createElement("div");
    form.className = "ticket-form";
    form.innerHTML = `
      <input type="text" id="acs-t-name" placeholder="Your name" />
      <input type="email" id="acs-t-email" placeholder="Your email" />
      <input type="text" id="acs-t-title" placeholder="Subject" value="${escapeHtml(lastUserMsg ? lastUserMsg.content.slice(0, 80) : "")}" />
      <textarea id="acs-t-desc" placeholder="Describe your issue">${escapeHtml(history.map(m => `${m.role === "user" ? "Me" : "AI"}: ${m.content}`).join("\n"))}</textarea>
      <div class="ticket-error" id="acs-t-error"></div>
      <button id="acs-t-submit">Create support ticket</button>
    `;
    bodyEl.parentElement.insertBefore(form, root.getElementById("acs-composer"));
    bodyEl.style.display = "none";

    form.querySelector("#acs-t-submit").addEventListener("click", async () => {
      const errorEl = form.querySelector("#acs-t-error");
      const btn = form.querySelector("#acs-t-submit");
      errorEl.textContent = "";

      const name = form.querySelector("#acs-t-name").value.trim();
      const email = form.querySelector("#acs-t-email").value.trim();
      const title = form.querySelector("#acs-t-title").value.trim();
      const description = form.querySelector("#acs-t-desc").value.trim();

      if (!name || !email || !title || description.length < 10) {
        errorEl.textContent = "Please fill in every field (description needs at least 10 characters).";
        return;
      }

      btn.disabled = true;
      btn.textContent = "Submitting…";

      try {
        const res = await fetch(`${API_BASE}/widget/create-ticket`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, title, description, priority: "Medium" }),
        });
        const data = await res.json();

        if (!res.ok) {
          errorEl.textContent = data.detail || "Something went wrong. Please try again.";
          btn.disabled = false;
          btn.textContent = "Create support ticket";
          return;
        }

        form.remove();
        bodyEl.style.display = "flex";
        bodyEl.innerHTML = `
          <div class="ticket-success">
            ✅ <strong>Ticket #${data.ticket_id} created</strong><br/>
            We've emailed a record of your conversation to our support team and will follow up at ${escapeHtml(email)} shortly.
          </div>
        `;
      } catch (err) {
        errorEl.textContent = "Could not reach the support server. Please try again.";
        btn.disabled = false;
        btn.textContent = "Create support ticket";
      }
    });
  }
})();
