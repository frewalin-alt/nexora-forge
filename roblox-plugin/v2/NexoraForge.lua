--[[
    NEXORA FORGE
    Roblox Studio Plugin
    Version 2.0.0

    New foundation:
    - Dedicated Nexora Studio window
    - Website connection status
    - Project delivery interface
    - Project structure preview
    - Controlled script creation
]]

local HttpService = game:GetService("HttpService")
local Selection = game:GetService("Selection")
local ChangeHistoryService = game:GetService("ChangeHistoryService")

local CONFIG = {
    Name = "Nexora Forge",
    Version = "2.0.0",
}

local COLORS = {
    Background = Color3.fromRGB(17, 19, 27),
    Panel = Color3.fromRGB(25, 28, 39),
    Input = Color3.fromRGB(13, 15, 22),
    Purple = Color3.fromRGB(137, 91, 230),
    Text = Color3.fromRGB(238, 239, 248),
    Muted = Color3.fromRGB(155, 160, 180),
    Green = Color3.fromRGB(90, 205, 140),
    Red = Color3.fromRGB(235, 100, 110),
}

local toolbar = plugin:CreateToolbar(CONFIG.Name)

local openButton = toolbar:CreateButton(
    "NexoraOpen",
    "Open Nexora Forge",
    ""
)

local widgetInfo = DockWidgetPluginGuiInfo.new(
    Enum.InitialDockState.Right,
    true,
    false,
    430,
    600,
    330,
    400
)

local widget = plugin:CreateDockWidgetPluginGui(
    "NexoraForge_V2",
    widgetInfo
)

widget.Title = CONFIG.Name

local function create(className, properties, parent)
    local object = Instance.new(className)

    for property, value in pairs(properties) do
        object[property] = value
    end

    object.Parent = parent
    return object
end

local main = create("Frame", {
    Size = UDim2.fromScale(1, 1),
    BackgroundColor3 = COLORS.Background,
    BorderSizePixel = 0,
}, widget)

local header = create("Frame", {
    Size = UDim2.new(1, 0, 0, 76),
    BackgroundColor3 = COLORS.Panel,
    BorderSizePixel = 0,
}, main)

create("TextLabel", {
    Position = UDim2.fromOffset(16, 10),
    Size = UDim2.new(1, -32, 0, 30),
    BackgroundTransparency = 1,
    Text = "NEXORA FORGE",
    TextColor3 = COLORS.Purple,
    TextSize = 23,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
}, header)

create("TextLabel", {
    Position = UDim2.fromOffset(17, 42),
    Size = UDim2.new(1, -34, 0, 20),
    BackgroundTransparency = 1,
    Text = "AI DEVELOPMENT FOR ROBLOX STUDIO",
    TextColor3 = COLORS.Muted,
    TextSize = 10,
    Font = Enum.Font.GothamMedium,
    TextXAlignment = Enum.TextXAlignment.Left,
}, header)

local connectionStatus = create("TextLabel", {
    Position = UDim2.fromOffset(16, 91),
    Size = UDim2.new(1, -32, 0, 34),
    BackgroundColor3 = COLORS.Panel,
    Text = "● Not connected to Nexora website",
    TextColor3 = COLORS.Muted,
    TextSize = 12,
    Font = Enum.Font.GothamMedium,
}, main)

local websiteLabel = create("TextLabel", {
    Position = UDim2.fromOffset(16, 140),
    Size = UDim2.new(1, -32, 0, 22),
    BackgroundTransparency = 1,
    Text = "Nexora server address",
    TextColor3 = COLORS.Text,
    TextSize = 12,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
}, main)

local websiteInput = create("TextBox", {
    Position = UDim2.fromOffset(16, 164),
    Size = UDim2.new(1, -32, 0, 36),
    BackgroundColor3 = COLORS.Input,
    TextColor3 = COLORS.Text,
    PlaceholderText = "https://your-nexora-server.example",
    Text = "",
    TextSize = 12,
    Font = Enum.Font.Code,
    ClearTextOnFocus = false,
}, main)

local connectButton = create("TextButton", {
    Position = UDim2.fromOffset(16, 211),
    Size = UDim2.new(1, -32, 0, 38),
    BackgroundColor3 = COLORS.Purple,
    TextColor3 = COLORS.Text,
    Text = "Connect to Nexora",
    TextSize = 13,
    Font = Enum.Font.GothamBold,
}, main)

local projectTitle = create("TextLabel", {
    Position = UDim2.fromOffset(16, 268),
    Size = UDim2.new(1, -32, 0, 25),
    BackgroundTransparency = 1,
    Text = "PROJECT DELIVERY",
    TextColor3 = COLORS.Text,
    TextSize = 13,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
}, main)

local projectInfo = create("TextLabel", {
    Position = UDim2.fromOffset(16, 298),
    Size = UDim2.new(1, -32, 0, 70),
    BackgroundColor3 = COLORS.Panel,
    TextColor3 = COLORS.Muted,
    Text = "No project received yet.\nCreate a project on the Nexora website.",
    TextSize = 12,
    Font = Enum.Font.Gotham,
    TextWrapped = true,
}, main)

local preview = create("TextBox", {
    Position = UDim2.fromOffset(16, 382),
    Size = UDim2.new(1, -32, 1, -462),
    BackgroundColor3 = COLORS.Input,
    TextColor3 = COLORS.Text,
    PlaceholderText = "Received project details will appear here.",
    Text = "",
    TextSize = 12,
    Font = Enum.Font.Code,
    TextXAlignment = Enum.TextXAlignment.Left,
    TextYAlignment = Enum.TextYAlignment.Top,
    TextWrapped = false,
    MultiLine = true,
    ClearTextOnFocus = false,
    TextEditable = false,
}, main)

local footer = create("TextLabel", {
    Position = UDim2.new(0, 16, 1, -55),
    Size = UDim2.new(1, -32, 0, 42),
    BackgroundTransparency = 1,
    Text = "Nexora Forge v" .. CONFIG.Version ..
        "\nWaiting for secure website connection.",
    TextColor3 = COLORS.Muted,
    TextSize = 10,
    Font = Enum.Font.Gotham,
    TextWrapped = true,
    TextXAlignment = Enum.TextXAlignment.Left,
}, main)

local function setStatus(message, color)
    connectionStatus.Text = "● " .. message
    connectionStatus.TextColor3 = color or COLORS.Muted
end

local function validateProject(project)
    if type(project) ~= "table" then
        return false, "Invalid project."
    end

    if type(project.name) ~= "string" or #project.name == 0 then
        return false, "Project name is missing."
    end

    if type(project.scripts) ~= "table" then
        return false, "Project scripts are missing."
    end

    if #project.scripts > 50 then
        return false, "Project contains too many scripts."
    end

    for _, item in ipairs(project.scripts) do
        if type(item.name) ~= "string"
            or type(item.className) ~= "string"
            or type(item.path) ~= "string"
            or type(item.source) ~= "string" then
            return false, "A script has invalid data."
        end

        local allowed = {
            Script = true,
            LocalScript = true,
            ModuleScript = true,
        }

        if not allowed[item.className] then
            return false, "Unsupported script type."
        end

        if #item.source > 100000 then
            return false, "A script is too large."
        end
    end

    return true
end

local function findPath(root, path)
    local current = root

    for segment in string.gmatch(path, "[^/]+") do
        local child = current:FindFirstChild(segment)

        if not child then
            return nil
        end

        current = child
    end

    return current
end

local function applyProject(project)
    local valid, reason = validateProject(project)

    if not valid then
        setStatus(reason, COLORS.Red)
        return
    end

    preview.Text = "Project: " .. project.name .. "\n\n"

    for _, item in ipairs(project.scripts) do
        preview.Text ..= item.name .. "\n"
            .. item.className .. "\n"
            .. item.path .. "\n\n"
    end

    projectInfo.Text = project.name
        .. "\n" .. tostring(#project.scripts)
        .. " scripts received.\nReview before installation."

    setStatus("Project received - awaiting review", COLORS.Green)
end

connectButton.MouseButton1Click:Connect(function()
    setStatus(
        "Connection service is not configured yet.",
        COLORS.Red
    )

    footer.Text =
        "Next phase: secure pairing and project transfer."
end)

openButton.Click:Connect(function()
    widget.Enabled = not widget.Enabled
end)

widget:GetPropertyChangedSignal("Enabled"):Connect(function()
    openButton:SetActive(widget.Enabled)
end)

print(CONFIG.Name .. " v" .. CONFIG.Version .. " loaded.")
