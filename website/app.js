
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

// Add a chat message safely
function addMessage(name, text, isUser = false) {
  const message = document.createElement("div");
  message.className =
    "nexora-message" + (isUser ? " nexora-user" : "");

  const heading = document.createElement("div");
  heading.className = "nexora-name";
  heading.textContent = name;

  const content = document.createElement("pre");
  content.className = "nexora-text";
  content.textContent = text;

  if (
    !isUser &&
    /(local script|script inside|server script|local players|game:GetService)/i.test(text)
  ) {
    content.classList.add("nexora-code");
  }

  message.append(heading, content);
  output.appendChild(message);
  output.scrollTop = output.scrollHeight;
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

// Send a chat message
async function generate() {
  const request = promptInput.value.trim();

  if (!request) {
    notice.textContent = "Type a Roblox scripting question first.";
    promptInput.focus();
    return;
  }

  generateButton.disabled = true;
  generateButton.textContent = "Thinking...";
  notice.textContent = "Nexora is preparing a response...";

  addMessage("You", request, true);
  promptInput.value = "";

  try {
    const result = makeScript(request);
    addMessage("⚡ Nexora Forge", result);

    notice.textContent =
      "Offline mode · Prepared Roblox scripting responses";
  } catch (error) {
    addMessage(
      "Nexora Forge",
      "Sorry, something went wrong. Please try again."
    );

    notice.textContent = "Could not prepare a response.";
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

generateButton.textContent = "Send message";
output.replaceChildren();

addMessage(
  "⚡ Nexora Forge",
  "Welcome to Nexora Forge!\n\nI can help with prepared Roblox scripting examples. Try asking for a sprint system, leaderstats, checkpoints, doors, or a simple GUI.\n\nI'm currently running in offline mode, so my answers are limited to built-in templates."
);

notice.textContent = "Offline mode · No AI API connected.";

openPage("home");
