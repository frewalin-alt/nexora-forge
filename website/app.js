// ========================================
// NEXORA FORGE - ROBLOX ACCOUNT SYSTEM
// ========================================

const authPanel = document.getElementById("auth-panel");
const authNotice = document.getElementById("auth-notice");
const accountStatus = document.getElementById("account-status");
const logoutButton = document.getElementById("logout-button");

let currentUser = null;

function updateAccountUI(user) {
  currentUser = user;

  if (!user) {
    window.location.replace("login.html");
    return;
  }

  document.body.classList.add("authenticated");

  const generatorWorkspace =
    document.getElementById("generator-workspace");

  if (accountStatus) {
    accountStatus.textContent =
      "● " + (user.displayName || user.username);
  }

  if (authPanel) authPanel.hidden = true;
  if (logoutButton) logoutButton.hidden = false;
  if (generatorWorkspace) generatorWorkspace.hidden = false;
  startPluginAuthWatcher();

}

async function checkLogin() {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "same-origin"
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Kontoprüfung fehlgeschlagen.");
    }

    updateAccountUI(data.authenticated ? data.user : null);
  } catch (error) {
    console.error("Nexora Konto:", error);
    updateAccountUI(null);
    authNotice.textContent =
      "Der Server ist momentan nicht erreichbar.";
  }
}

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;

  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin"
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Logout fehlgeschlagen.");
    }

    updateAccountUI(null);
    authNotice.textContent = "You wurdest abgemeldet.";
  } catch (error) {
    authNotice.textContent = error.message;
  } finally {
    logoutButton.disabled = false;
  }
});

const authParams = new URLSearchParams(window.location.search);
if (authParams.has("auth_error")) {
  authNotice.textContent =
    "Die Roblox-Anmeldung ist fehlgeschlagen. Bitte versuche es erneut.";
  window.history.replaceState({}, document.title, window.location.pathname);
}



// Roblox-Studio-Verbindungsanfragen
let pluginAuthWatcherStarted = false;

function startPluginAuthWatcher() {
  if (pluginAuthWatcherStarted) return;
  pluginAuthWatcherStarted = true;

  const panel = document.getElementById("plugin-auth-panel");
  const list = document.getElementById("plugin-auth-requests");
  const empty = document.getElementById("plugin-auth-empty");

  if (!panel || !list || !empty) return;
  panel.hidden = false;

  async function refreshPluginAuthRequests() {
    try {
      const response = await fetch("/api/plugin/auth/pending", {
        credentials: "same-origin"
      });
      if (response.status === 401) return;
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Anfragen konnten nicht geladen werden.");

      list.replaceChildren();
      const requests = Array.isArray(data.requests) ? data.requests : [];
      empty.hidden = requests.length > 0;

      for (const request of requests) {
        const card = document.createElement("div");
        card.style.cssText = "padding:14px;margin:12px 0;border:1px solid #39334d;border-radius:10px;background:#11131b";

        const title = document.createElement("strong");
        title.textContent = request.deviceName || "Roblox Studio";

        const description = document.createElement("p");
        description.textContent = "Dieses Gerät möchte sich mit deinem Nexora-Konto verbinden.";
        description.style.color = "#b8bbca";

        const accept = document.createElement("button");
        accept.type = "button";
        accept.textContent = "Annehmen";
        accept.style.cssText = "padding:10px 18px;border:0;border-radius:8px;background:#895be6;color:white;font-weight:bold;cursor:pointer";

        accept.addEventListener("click", async () => {
          accept.disabled = true;
          accept.textContent = "Wird bestätigt...";

          try {
            const approval = await fetch("/api/plugin/auth/approve-web", {
              method: "POST",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: request.id,
                csrfToken: data.csrfToken
              })
            });
            const result = await approval.json();
            if (!approval.ok) throw new Error(result.error || "Bestätigung fehlgeschlagen.");

            card.textContent = "Verbindung angenommen. Roblox Studio verbindet sich jetzt.";
            setTimeout(refreshPluginAuthRequests, 1200);
          } catch (error) {
            accept.disabled = false;
            accept.textContent = "Erneut versuchen";
            description.textContent = error.message;
          }
        });

        card.append(title, description, accept);
        list.appendChild(card);
      }
    } catch (error) {
      console.warn("Plugin-Verbindungsanfragen:", error);
    }
  }

  refreshPluginAuthRequests();
  setInterval(refreshPluginAuthRequests, 3000);
}


checkLogin();

// ========================================
// ENDE ROBLOX ACCOUNT SYSTEM
// ========================================


const pageTitle = document.getElementById("page-title");
const toolTitle = document.getElementById("tool-title");
const toolDescription = document.getElementById("tool-description");
const promptInput = document.getElementById("prompt");
const output = document.getElementById("output");
const notice = document.getElementById("notice");
const generateButton = document.getElementById("generate");

let currentPage = "home";

const pages = {
  home: {
    title: "Your Workspace",
    toolTitle: "Chat with Nexora",
    description: "Ask questions about Roblox scripts, Luau, and game systems."
  },
  script: {
    title: "Script AI",
    toolTitle: "Roblox Scripting Chat",
    description: "Get help with Roblox Luau scripts."
  },
  ui: {
    title: "UI Designer",
    toolTitle: "Roblox UI Assistant",
    description: "Explore Roblox menus, inventories, and HUDs."
  }
};

// Chat styling
function addChatStyles() {
  if (document.getElementById("nexora-chat-styles")) return;

  const style = document.createElement("style");
  style.id = "nexora-chat-styles";

  style.textContent = `
    #output {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 18px;
      min-height: 180px;
      max-height: 520px;
      overflow-y: auto;
      white-space: normal;
      box-sizing: border-box;
    }

    .nexora-message {
      max-width: 100%;
      min-width: 0;
      box-sizing: border-box;
      border: 1px solid #2b3040;
      border-radius: 12px;
      padding: 14px 16px;
      background: #151923;
    }

    .nexora-user {
      align-self: flex-end;
      max-width: 85%;
      background: #28203f;
      border-color: #59418a;
    }

    .nexora-name {
      color: #b99aff;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 9px;
    }

    .nexora-text {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      color: #e6eaf2;
      font-size: 14px;
      line-height: 1.65;
      margin: 0;
      font-family: inherit;
    }

    .nexora-code {
      font-family: monospace;
      font-size: 13px;
    }

    #prompt {
      min-height: 90px;
    }

    #generate:disabled {
      opacity: 0.6;
      cursor: wait;
    }
  `;

  document.head.appendChild(style);
}

// Add a chat message safely, with separate copy buttons for Luau blocks
function addMessage(name, text, isUser = false) {
  const message = document.createElement("div");
  message.className =
    "nexora-message" + (isUser ? " nexora-user" : "");

  const heading = document.createElement("div");
  heading.className = "nexora-name";
  heading.textContent = name;

  message.appendChild(heading);

  function addText(content) {
    if (!content) return;

    const paragraph = document.createElement("pre");
    paragraph.className = "nexora-text";
    paragraph.textContent = content;
    message.appendChild(paragraph);
  }

  function addCode(code) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = [
      "margin-top:12px",
      "border:1px solid #39334d",
      "border-radius:10px",
      "overflow:hidden",
      "background:#0d111a"
    ].join(";");

    const toolbar = document.createElement("div");
    toolbar.style.cssText = [
      "display:flex",
      "justify-content:flex-end",
      "padding:8px",
      "background:#191526",
      "border-bottom:1px solid #39334d"
    ].join(";");

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "📋 Code kopieren";
    copyButton.style.cssText = [
      "padding:7px 12px",
      "border:0",
      "border-radius:6px",
      "background:#7950c7",
      "color:white",
      "cursor:pointer",
      "font-weight:600"
    ].join(";");

    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code);
        copyButton.textContent = "✓ Kopiert!";
      } catch (error) {
        copyButton.textContent = "Kopieren nicht möglich";
      }

      setTimeout(() => {
        copyButton.textContent = "📋 Code kopieren";
      }, 1800);
    });

    const pre = document.createElement("pre");
    pre.className = "nexora-text nexora-code";
    pre.style.cssText = [
      "padding:14px",
      "margin:0",
      "overflow-x:auto",
      "white-space:pre",
      "color:#e6eaf2"
    ].join(";");
    pre.textContent = code;

    toolbar.appendChild(copyButton);
    wrapper.append(toolbar, pre);
    message.appendChild(wrapper);
  }

  if (isUser) {
    addText(text);
  } else {
    const codePattern = /```(?:lua|luau)?[ \t]*\r?\n([\s\S]*?)```/gi;
    let lastIndex = 0;
    let match;

    while ((match = codePattern.exec(text)) !== null) {
      addText(text.slice(lastIndex, match.index));
      addCode(match[1].replace(/\s+$/, ""));
      lastIndex = codePattern.lastIndex;
    }

    addText(text.slice(lastIndex));
  }

  output.appendChild(message);
  output.scrollTop = output.scrollHeight;
}

// Nexora project overview
const PROJECT_STORAGE_KEY = "nexora-projects";

function getProjects() {
  try {
    return JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}


async function syncProjectsWithServer() {
  const localProjects = getProjects();

  try {
    const response = await fetch("/api/projects", {
      credentials: "same-origin"
    });

    if (!response.ok) {
      console.warn("Could not load projects:", response.status);
      return;
    }

    const data = await response.json();
    const serverProjects = Array.isArray(data.projects) ? data.projects : [];
    const merged = new Map();

    for (const project of serverProjects) {
      merged.set(project.id, project);
    }

    for (const localProject of localProjects) {
      const serverProject = merged.get(localProject.id);

      const localTime = Date.parse(
        localProject.updatedAt || localProject.createdAt || 0
      ) || 0;

      const serverTime = serverProject
        ? Date.parse(serverProject.updatedAt || serverProject.createdAt || 0) || 0
        : 0;

      if (!serverProject || localTime > serverTime) {
        const upload = await fetch("/api/projects", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(localProject)
        });

        if (!upload.ok) {
          console.warn("Projekt konnte nicht hochgeladen werden:", localProject.id);
          continue;
        }

        merged.set(localProject.id, localProject);
      }
    }

    localStorage.setItem(
      PROJECT_STORAGE_KEY,
      JSON.stringify([...merged.values()])
    );

    renderProjects();

  } catch (error) {
    console.warn("Projektsynchronisierung nicht möglich:", error);
  }
}
async function saveProjectToServer(project) {
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Projekt konnte nicht synchronisiert werden.");
    }
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}


let currentProjectId = null;

function saveProjectList(projects) {
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
}

async function updateProjectOnServer(project) {
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project)
    });
    if (!response.ok) {
      console.warn("Could not sync project changes:", response.status);
    }
  } catch (error) {
    console.warn("Could not sync project changes:", error);
  }
}

function ensureProjectPanel() {
  renderProjects();
}

function renderProjects() {
  const recentList = document.getElementById("recent-project-list");
  const archivedList = document.getElementById("archived-project-list");
  if (!recentList || !archivedList) return;

  recentList.replaceChildren();
  archivedList.replaceChildren();

  const projects = getProjects();
  const recent = projects.filter(project => !project.archived);
  const archived = projects.filter(project => project.archived);

  const recentCount = document.getElementById("recent-project-count");
  const archivedCount = document.getElementById("archived-project-count");
  if (recentCount) recentCount.textContent = recent.length;
  if (archivedCount) archivedCount.textContent = archived.length;

  function makeProjectButton(project, isArchived) {
    const item = document.createElement("div");
    item.className = "sidebar-project-item";

    const open = document.createElement("button");
    open.type = "button";
    open.className = "sidebar-project-open";
    open.textContent = (isArchived ? "📦 " : "🎮 ") +
      (project.title || "Untitled Project");
    open.title = project.title || "Projekt öffnen";
    open.addEventListener("click", () => {
      location.href = "project.html?id=" + encodeURIComponent(project.id);
    });

    const actions = document.createElement("div");
    actions.className = "sidebar-project-actions";

    const archive = document.createElement("button");
    archive.type = "button";
    archive.textContent = isArchived ? "Restore" : "Archive";
    archive.title = archive.textContent;

    archive.addEventListener("click", async () => {
      archive.disabled = true;
      const updated = {
        ...project,
        archived: !isArchived,
        updatedAt: new Date().toISOString()
      };

      const all = getProjects().map(p =>
        p.id === project.id ? updated : p
      );

      saveProjectList(all);
      renderProjects();

      const saved = await saveProjectToServer(updated);
      if (!saved) {
        console.warn("Archive status saved locally, but server sync failed.");
      }
    });

    actions.appendChild(archive);
    item.append(open, actions);
    return item;
  }

  if (!recent.length) {
    const empty = document.createElement("p");
    empty.className = "sidebar-empty";
    empty.textContent = "No active projects yet";
    recentList.appendChild(empty);
  } else {
    recent.forEach(project =>
      recentList.appendChild(makeProjectButton(project, false))
    );
  }

  if (!archived.length) {
    const empty = document.createElement("p");
    empty.className = "sidebar-empty";
    empty.textContent = "No archived projects";
    archivedList.appendChild(empty);
  } else {
    archived.forEach(project =>
      archivedList.appendChild(makeProjectButton(project, true))
    );
  }
}

function extractProjectScripts(result) {
  const pattern = /```(?:lua|luau)?[ \t]*\r?\n([\s\S]*?)```/gi;
  const scripts = [];
  const blocks = [...result.matchAll(pattern)];

  if (blocks.length === 0) {
    const code = result.trim();
    const looksLikeLua =
      /\bprint\s*\(/.test(code) ||
      /\blocal\s+\w+/.test(code) ||
      /\bfunction\s+\w+/.test(code) ||
      /\bgame:GetService\s*\(/.test(code);

    if (!looksLikeLua) return scripts;
    blocks.push({ index: 0, 1: code });
  }

  for (const match of blocks) {
    const code = match[1].trim();
    if (!code) continue;

    const precedingText = result.slice(0, match.index);

    // Installationsanleitungen niemals als Scripts speichern.
    const lastInstallation = precedingText.search(
      /INSTALLATION IN ROBLOX STUDIO/ig
    );
    const lastScriptHeading = Math.max(
      precedingText.lastIndexOf("```"),
      precedingText.lastIndexOf("Skript")
    );

    if (
      lastInstallation >= 0 &&
      lastInstallation > lastScriptHeading
    ) continue;

    const lines = precedingText.trim().split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    const pathLine = [...lines].reverse().find(line =>
      /^(Pfad|Path|Ort|Location)\s*:/i.test(line)
    );

    const typeLine = [...lines].reverse().find(line =>
      /^(Typ|Type|ClassName)\s*:/i.test(line)
    );

    const rawType = typeLine
      ? typeLine.replace(/^(Typ|Type|ClassName)\s*:/i, "").trim()
      : "";

    const codePath = code.match(
      /^\s*--\s*((?:ServerScriptService|StarterPlayerScripts|StarterGui|ReplicatedStorage)[^\r\n]*)/im
    );

    const rawPath = pathLine
      ? pathLine.replace(/^(Pfad|Path|Ort|Location)\s*:/i, "").trim()
      : codePath ? codePath[1].trim() : "";

    let type;
    let targetPath;

    const commentPath = code.match(
      /^\s*--\s*[A-Za-z_][A-Za-z0-9_]*\s*\((ServerScriptService|StarterPlayerScripts|StarterGui|ReplicatedStorage)\)/im
    );

    const detectedPath = rawPath || (commentPath ? commentPath[1] : "");

    const looksLikeLocalScript =
      /\bPlayers\.LocalPlayer\b/.test(code) ||
      /\bLocalPlayer\b/.test(code) ||
      /\bPlayerGui\b/.test(code) ||
      /\.OnClientEvent\b/.test(code) ||
      /UserInputService/.test(code);

    if (/StarterPlayerScripts/i.test(detectedPath)) {
      type = "LocalScript";
      targetPath = "StarterPlayerScripts";
    } else if (/StarterGui/i.test(detectedPath)) {
      type = "LocalScript";
      targetPath = "StarterGui";
    } else if (/ReplicatedStorage/i.test(detectedPath)) {
      type = "ModuleScript";
      targetPath = "ReplicatedStorage";
    } else if (/ServerScriptService/i.test(detectedPath)) {
      type = "Script";
      targetPath = "ServerScriptService";
    } else if (looksLikeLocalScript) {
      type = "LocalScript";
      targetPath = "StarterPlayerScripts";
    } else if (["Script", "LocalScript", "ModuleScript"].includes(rawType)) {
      type = rawType;
      targetPath = type === "LocalScript"
        ? "StarterPlayerScripts"
        : type === "ModuleScript"
          ? "ReplicatedStorage"
          : "ServerScriptService";
    } else {
      type = "Script";
      targetPath = "ServerScriptService";
    }

    const heading = [...lines].reverse().find(line =>
      /^#{1,4}\s*(?:(?:\d+[.)]?\s*)?(?:ServerScript|LocalScript|ModuleScript|Script)\s*[:\-]?\s*)?[A-Za-z_][\w -]*$/i.test(line)
    );

    // Den tatsächlichen Scriptnamen aus dem ersten Code-Kommentar bevorzugen.
    const codeName = code.match(
      /^\s*--\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?:\([^)]*\))?/
    );

    let title = codeName
      ? codeName[1]
      : heading
        ? heading.replace(/^#{1,4}\s*/, "").trim()
        : "";

    if (title) {
      title = title
        .replace(/^\d+[.)]?\s*/, "")
        .replace(/^(ServerScript|LocalScript|ModuleScript|Script)\s*[:\-]?\s*/i, "")
        .trim();
    }

    if (!title || /INSTALLATION|SCHRITT|ROBLOX STUDIO/i.test(title)) {
      title = type === "LocalScript"
        ? "LocalScript"
        : type === "ModuleScript"
          ? "ModuleScript"
          : "ServerScript";
      title += scripts.length + 1;
    }

    scripts.push({
      id: Date.now() + "-" + scripts.length,
      title,
      type,
      path: targetPath,
      code
    });
  }

  return scripts;
}

async function saveProjectResponse(request, result) {
  const scripts = extractProjectScripts(result);
  if (!scripts.length) {
    notice.textContent = "Keine Luau-Codeblöcke zum Speichern gefunden.";
    return { id: null, synced: false, reason: "Keine Scripts erkannt." };
  }

  const projects = getProjects();
  let project = projects.find(p => p.id === currentProjectId);

  if (!project) {
    project = {
      id: Date.now().toString(),
      title: request.slice(0, 70),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scripts: [],
      history: []
    };
    projects.unshift(project);
    currentProjectId = project.id;
  }

  project.scripts = project.scripts || [];
  project.history = project.history || [];
  project.scripts.push(...scripts);
  project.history.push({
    prompt: request,
    result,
    createdAt: new Date().toISOString()
  });
  project.updatedAt = new Date().toISOString();

  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects.slice(0, 20)));
  renderProjects();

  const synced = await saveProjectToServer(project);
  return {
    id: project.id,
    synced,
    scriptCount: scripts.length
  };
}

// Navigation
function openPage(page) {
  const config = pages[page];
  if (!config) return;

  currentPage = page;

  pageTitle.textContent = config.title;
  toolTitle.textContent = config.toolTitle;
  toolDescription.textContent = config.description;

  document.querySelectorAll("[data-page]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.classList.contains("nav") &&
      button.dataset.page === page
    );
  });

  promptInput.placeholder =
    page === "script"
      ? "Ask about a Roblox Luau script..."
      : page === "ui"
        ? "Describe a Roblox GUI or inventory..."
        : "Ask Nexora about Roblox scripting...";

  promptInput.focus();
}

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    openPage(button.dataset.page);
  });
});



// Nexora Dashboard: Schnellaktionen füllen den Prompt.
document.querySelectorAll(".nexora-suggestion").forEach((button) => {
  button.addEventListener("click", () => {
    promptInput.value = button.dataset.prompt || "";
    promptInput.focus();
    promptInput.dispatchEvent(new Event("input", { bubbles: true }));
    promptInput.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

// Suggestions wechseln dezent, ohne die Bedienung zu stören.
const suggestionTrack = document.getElementById("nexora-suggestion-track");
if (suggestionTrack) {
  const suggestions = [...suggestionTrack.children];
  let suggestionIndex = 0;

  setInterval(() => {
    if (suggestions.length < 2 || document.hidden) return;

    const item = suggestions[suggestionIndex % suggestions.length];
    item.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: .45, transform: "translateY(-3px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      { duration: 650, easing: "ease-in-out" }
    );

    suggestionIndex++;
  }, 3500);
}

// Offline Roblox script templates
function makeScript(request) {
  const q = request.toLowerCase();

  // UI / Inventory
  if (
    currentPage === "ui" ||
    q.includes("gui") ||
    q.includes("inventory") ||
    q.includes("menu")
  ) {
    return `ROBLOX UI - SIMPLE WINDOW

Create a LocalScript inside:
StarterPlayer > StarterPlayerScripts

local Players = game:GetService("Players")
local player = Players.LocalPlayer

local gui = Instance.new("ScreenGui")
gui.Name = "NexoraUI"
gui.ResetOnSpawn = false
gui.Parent = player:WaitForChild("PlayerGui")

local frame = Instance.new("Frame")
frame.Size = UDim2.fromOffset(320, 200)
frame.Position = UDim2.fromScale(0.5, 0.5)
frame.AnchorPoint = Vector2.new(0.5, 0.5)
frame.BackgroundColor3 = Color3.fromRGB(35, 35, 50)
frame.Parent = gui

local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, 0, 0, 45)
title.BackgroundTransparency = 1
title.Text = "My Roblox Menu"
title.TextColor3 = Color3.new(1, 1, 1)
title.TextScaled = true
title.Parent = frame

local button = Instance.new("TextButton")
button.Size = UDim2.new(0.8, 0, 0, 45)
button.Position = UDim2.new(0.1, 0, 0.55, 0)
button.Text = "Close"
button.Parent = frame

button.Activated:Connect(function()
    gui.Enabled = false
end)

This script creates a simple window with a close button.`;
  }

  // Sprint
  if (
    q.includes("sprint") ||
    q.includes("run") ||
    q.includes("shift")
  ) {
    return `SPRINT SYSTEM

Create a LocalScript inside:
StarterPlayer > StarterPlayerScripts

local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")

local player = Players.LocalPlayer
local normalSpeed = 16
local sprintSpeed = 26

local function setSpeed(speed)
    local character = player.Character
    local humanoid = character and character:FindFirstChildOfClass("Humanoid")

    if humanoid then
        humanoid.WalkSpeed = speed
    end
end

player.CharacterAdded:Connect(function()
    task.wait(0.2)
    setSpeed(normalSpeed)
end)

UserInputService.InputBegan:Connect(function(input, processed)
    if processed then return end

    if input.KeyCode == Enum.KeyCode.LeftShift then
        setSpeed(sprintSpeed)
    end
end)

UserInputService.InputEnded:Connect(function(input)
    if input.KeyCode == Enum.KeyCode.LeftShift then
        setSpeed(normalSpeed)
    end
end)

HOW TO USE:
Hold Shift to run faster.`;
  }

  // Leaderstats
  if (
    q.includes("leaderboard") ||
    q.includes("leaderstats") ||
    q.includes("points") ||
    q.includes("stats") ||
    q.includes("coins")
  ) {
    return `LEADERSTATS - POINTS SYSTEM

Create a Script inside:
ServerScriptService

local Players = game:GetService("Players")

Players.PlayerAdded:Connect(function(player)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local points = Instance.new("IntValue")
    points.Name = "Points"
    points.Value = 0
    points.Parent = leaderstats
end)

Each player receives a Points value on the Roblox leaderboard.

NOTE:
This is a basic points example. Saving points between sessions
requires a separate DataStore system.`;
  }

  // Checkpoints
  if (
    q.includes("checkpoint") ||
    q.includes("respawn")
  ) {
    return `BASIC CHECKPOINT SYSTEM

1. Create a Part named Checkpoint inside Workspace.
2. Create a Script inside ServerScriptService.
3. Add this code:

local Players = game:GetService("Players")
local checkpoint = workspace:WaitForChild("Checkpoint")

checkpoint.Touched:Connect(function(hit)
    local character = hit.Parent
    local player = Players:GetPlayerFromCharacter(character)

    if not player then return end

    local saved = player:FindFirstChild("CheckpointPosition")

    if not saved then
        saved = Instance.new("ObjectValue")
        saved.Name = "CheckpointPosition"
        saved.Parent = player
    end

    saved.Value = checkpoint
end)

NOTE:
This records the checkpoint part. A complete respawn system
must also move the character to the saved checkpoint on respawn.`;
  }

  // Doors
  if (
    q.includes("door") ||
    q.includes("gate")
  ) {
    return `AUTOMATIC DOOR SYSTEM

1. Create a Part named Door inside Workspace.
2. Insert a Script inside the Door.
3. Add this code:

local door = script.Parent
local open = false

door.Touched:Connect(function(hit)
    local character = hit.Parent
    local humanoid = character:FindFirstChildOfClass("Humanoid")

    if not humanoid or open then return end

    open = true
    door.Transparency = 0.7
    door.CanCollide = false

    task.wait(3)

    door.Transparency = 0
    door.CanCollide = true
    open = false
end)

The door temporarily opens when touched by a character.`;
  }

  // Fallback
  return `Welcome to Nexora Forge!

I'm currently running in offline mode, so I can answer with a
limited collection of prepared Roblox scripting examples.

Try asking me for:
- A sprint system using Shift
- A leaderboard with points
- A checkpoint system
- A door that opens when touched
- A simple inventory GUI

Your request:
"${request}"

More custom answers will be available when Nexora has a
working AI connection or additional script templates.`;
}



// NEXORA PROJECT NAME DIALOG
function openProjectNameDialog(initialPrompt = "") {
  if (document.getElementById("nexora-project-dialog")) return;

  const overlay = document.createElement("div");
  overlay.id = "nexora-project-dialog";
  overlay.style.cssText = [
    "position:fixed", "inset:0", "z-index:9999",
    "display:grid", "place-items:center",
    "padding:20px", "background:rgba(0,0,0,.76)",
    "backdrop-filter:blur(8px)"
  ].join(";");

  const panel = document.createElement("form");
  panel.style.cssText = [
    "width:min(100%,460px)", "padding:28px",
    "background:#191a20", "color:#f5f5f7",
    "border:1px solid #393b45", "border-radius:18px",
    "box-shadow:0 24px 90px rgba(0,0,0,.55)"
  ].join(";");

  const heading = document.createElement("h2");
  heading.textContent = "Create your project";
  heading.style.cssText = "margin:0 0 8px;font-size:24px";

  const description = document.createElement("p");
  description.textContent = "Gib deinem Roblox-Projekt einen Namen, um deinen Workspace zu erstellen.";
  description.style.cssText = "color:#a5a6ae;line-height:1.5;margin:0 0 22px";

  const label = document.createElement("label");
  label.textContent = "Project name";
  label.style.cssText = "display:block;margin-bottom:8px;font-size:13px;font-weight:700";

  const input = document.createElement("input");
  input.type = "text";
  input.name = "projectName";
  input.placeholder = "z. B. My Roblox Adventure";
  input.maxLength = 70;
  input.required = true;
  input.autocomplete = "off";
  input.style.cssText = [
    "box-sizing:border-box", "width:100%", "padding:14px",
    "border:1px solid #454752", "border-radius:10px",
    "background:#101116", "color:white", "fontSize:15px",
    "outline:none"
  ].join(";");

  const error = document.createElement("p");
  error.setAttribute("role", "alert");
  error.style.cssText = "min-height:18px;color:#ff8585;font-size:12px";

  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;justify-content:flex-end;gap:10px;margin-top:18px";

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.textContent = "Cancel";
  cancel.style.cssText = "padding:11px 16px;border:1px solid #454752;border-radius:9px;background:#25262d;color:#ddd;cursor:pointer";

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Create project →";
  submit.style.cssText = "padding:11px 17px;border:0;border-radius:9px;background:#d8ff35;color:#151515;font-weight:800;cursor:pointer";

  actions.append(cancel, submit);
  label.appendChild(input);
  panel.append(heading, description, label, input, error, actions);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  function close() {
    overlay.remove();
  }

  cancel.addEventListener("click", close);
  overlay.addEventListener("click", event => {
    if (event.target === overlay) close();
  });

  panel.addEventListener("submit", event => {
    event.preventDefault();
    const name = input.value.trim();

    if (!name) {
      error.textContent = "Bitte gib einen Projektnamen ein.";
      input.focus();
      return;
    }

    const now = new Date().toISOString();
    const items = getProjects();
    const newProject = {
      id: Date.now().toString(),
      title: name,
      createdAt: now,
      updatedAt: now,
      scripts: [],
      history: [],
      archived: false
    };

    items.unshift(newProject);
    saveProjectList(items.slice(0, 20));
    currentProjectId = newProject.id;

    if (typeof saveProjectToServer === "function") {
      saveProjectToServer(newProject);
    }

    if (typeof renderProjects === "function") {
      renderProjects();
    }

    if (initialPrompt.trim()) {
      sessionStorage.setItem("nexora-pending-project-prompt", initialPrompt.trim());
    } else {
      sessionStorage.removeItem("nexora-pending-project-prompt");
    }

    location.href = "project.html?id=" + encodeURIComponent(newProject.id);
  });

  panel.addEventListener("keydown", event => {
    if (event.key === "Escape") close();
  });

  input.focus();
}

document.querySelector(".new-project-button")?.addEventListener("click", event => {
  event.preventDefault();
  openProjectNameDialog();
});


let chatHistory = [];

async function generate() {
  const request = promptInput.value.trim();

  if (!request) {
    notice.textContent = "Type a Roblox scripting question first.";
    promptInput.focus();
    return;
  }

  generateButton.disabled = true;
  generateButton.textContent = "Thinking...";
  notice.textContent = "Nexora AI is thinking...";

  addMessage("You", request, true);
  const requestHistory = [
    ...chatHistory.slice(-10),
    { role: "user", content: request }
  ];
  chatHistory.push({ role: "user", content: request });
  promptInput.value = "";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: request,
        history: requestHistory
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI request failed.");
    }

    if (!data.result) {
      throw new Error("Nexora returned an empty response.");
    }

    addMessage("⚡ Nexora Forge", data.result);
    chatHistory.push({ role: "assistant", content: data.result });
    chatHistory = chatHistory.slice(-12);

    // Jedes KI-Script wird einem Projekt zugeordnet,
    // auch wenn der Chat ohne zuvor geöffnetes Projekt gestartet wurde.
    const projectSave = await saveProjectResponse(request, data.result);

    if (projectSave.synced) {
      notice.textContent =
        `Nexora AI · ${projectSave.scriptCount} Script(s) an Roblox Studio übertragen.`;
    } else if (projectSave.id) {
      notice.textContent =
        "Scripts lokal gespeichert, aber Serversynchronisierung fehlgeschlagen. Bitte erneut anmelden und versuchen.";
    } else {
      notice.textContent =
        "KI-Antwort erhalten, aber keine Luau-Scripts zum Übertragen erkannt.";
    }

  } catch (error) {
    console.error("Nexora AI error:", error);

    addMessage(
      "⚡ Nexora Forge",
      "Something went wrong: " + error.message
    );

    notice.textContent = "AI connection error.";
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = "Send message";
    promptInput.focus();
  }
}


// Allow clicking Send or pressing Ctrl+Enter
generateButton.addEventListener("click", generate);

promptInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    generate();
  }
});

// Start the chat
addChatStyles();
ensureProjectPanel();

generateButton.textContent = "Send message";
output.replaceChildren();

addMessage(
  "⚡ Nexora Forge",
  "Welcome to Nexora Forge!\n\nI'm your AI assistant for Roblox Studio and Luau. Ask me to create scripts, explain game systems, or design Roblox interfaces."
);

notice.textContent = "Nexora AI · Ready";

openPage("home");


syncProjectsWithServer();
