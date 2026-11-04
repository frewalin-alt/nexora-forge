const notice = document.getElementById("login-notice");

async function checkExistingSession() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("auth_error") && notice) {
    notice.textContent =
      "Die Anmeldung hat nicht funktioniert. Bitte versuche es erneut.";
    window.history.replaceState({}, document.title, "login.html");
  }

  try {
    const response = await fetch("/api/auth/me", {
      credentials: "same-origin"
    });

    const data = await response.json();

    if (response.ok && data.authenticated) {
      window.location.replace("index.html");
    }
  } catch (error) {
    if (notice) {
      notice.textContent =
        "Der Server ist gerade nicht erreichbar. Bitte lade die Seite erneut.";
    }
    console.error("Nexora Login:", error);
  }
}

checkExistingSession();
