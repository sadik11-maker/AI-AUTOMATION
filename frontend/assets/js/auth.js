// ==========================================
// AUTH: LOGIN + REGISTER
// ==========================================

if (Api.isLoggedIn()) {
  // Already signed in - skip straight to the dashboard.
  window.location.href = "dashboard.html";
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("error-box");
    const btn = document.getElementById("submit-btn");
    errorBox.textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    btn.disabled = true;
    btn.textContent = "Signing in…";

    try {
      // The backend's /login endpoint uses OAuth2PasswordRequestForm,
      // which expects form-encoded "username" + "password" fields.
      const data = await Api.post(
        "/login",
        { username: email, password },
        { isForm: true }
      );

      Api.setSession({ access_token: data.access_token, role: data.role });
      window.location.href = data.role === "admin" ? "admin.html" : "dashboard.html";
    } catch (err) {
      errorBox.textContent = err.message;
      btn.disabled = false;
      btn.textContent = "Sign in";
    }
  });
}

const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("error-box");
    const btn = document.getElementById("submit-btn");
    errorBox.textContent = "";

    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    btn.disabled = true;
    btn.textContent = "Creating account…";

    try {
      await Api.post("/register", { full_name, email, password });

      // Auto-login right after registering for a smooth first-run experience.
      const data = await Api.post(
        "/login",
        { username: email, password },
        { isForm: true }
      );
      Api.setSession({ access_token: data.access_token, role: data.role });
      window.location.href = "dashboard.html";
    } catch (err) {
      errorBox.textContent = err.message;
      btn.disabled = false;
      btn.textContent = "Create account";
    }
  });
}
