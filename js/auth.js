/* ==========================================================
   GenZ Smart — Auth Logic (Client-Side Secure Login)
   Works on static GitHub Pages
   ========================================================== */

// Email & password (encrypted reference for comparison)
const ADMIN_EMAIL_HASH = "dfb71b03a64a3d615dfc65b26a33d83a79d8a23c9c0164f0cb58c3adbcf1808e"; // hash of saffanakbar@gmail.com
const ADMIN_PASS_HASH  = "e5246e78e07c6117df6edb35fdfc6b90602e8b020142d2e7316b0a818b3e77a6"; // hash of saffan942

// Utility: SHA-256 hashing
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Handle Login Form
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const emailHash = await sha256(email);
    const passHash = await sha256(password);
    const errorBox = document.getElementById("loginError");

    if (emailHash === ADMIN_EMAIL_HASH && passHash === ADMIN_PASS_HASH) {
      // Successful login
      localStorage.setItem("genz_admin_token", "verified");
      window.location.href = "admin.html";
    } else {
      errorBox.textContent = "Invalid email or password.";
      errorBox.style.display = "block";
    }
  });
}

// Protect admin.html
if (document.body.dataset.page === "admin") {
  const token = localStorage.getItem("genz_admin_token");
  if (token !== "verified") {
    alert("Access denied. Please login first.");
    window.location.href = "login.html";
  }

  // Add logout logic
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("genz_admin_token");
      window.location.href = "login.html";
    });
  }
}
