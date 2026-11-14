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
    820,
    330,
    650
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
    Size = UDim2.new(1, 0, 0, 64),
    BackgroundColor3 = COLORS.Panel,
    BorderSizePixel = 0,
}, main)

create("TextLabel", {
    Position = UDim2.fromOffset(16, 10),
    Size = UDim2.new(1, -32, 0, 30),
    BackgroundTransparency = 1,
    Text = "NEXORA FORGE",
    TextColor3 = COLORS.Purple,
    TextSize = 19,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
}, header)

create("TextLabel", {
    Position = UDim2.fromOffset(17, 42),
    Size = UDim2.new(1, -34, 0, 20),
    BackgroundTransparency = 1,
    Text = "ROBLOX STUDIO CONNECTION",
    TextColor3 = COLORS.Muted,
    TextSize = 10,
    Font = Enum.Font.GothamMedium,
    TextXAlignment = Enum.TextXAlignment.Left,
}, header)

local connectionStatus = create("TextLabel", {
    Position = UDim2.fromOffset(16, 82),
    Size = UDim2.new(1, -150, 0, 36),
    BackgroundTransparency = 1,
    Text = "● Not connected",
    TextColor3 = COLORS.Muted,
    TextSize = 12,
    Font = Enum.Font.GothamMedium,
}, main)

local websiteLabel = create("TextLabel", {
    Position = UDim2.fromOffset(16, 140),
    Size = UDim2.new(1, -32, 0, 22),
    BackgroundTransparency = 1,
    Text = "Einmaliger Website-Kopplungscode",
    TextColor3 = COLORS.Text,
    TextSize = 12,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
    Visible = false,
}, main)

local websiteInput = create("TextBox", {
    Position = UDim2.fromOffset(16, 164),
    Size = UDim2.new(1, -32, 0, 36),
    BackgroundColor3 = COLORS.Input,
    TextColor3 = COLORS.Text,
    PlaceholderText = "8-stelligen Code hier eingeben",
    Text = "",
    TextSize = 12,
    Font = Enum.Font.Code,
    ClearTextOnFocus = false,
    Visible = false,
}, main)

local connectButton = create("TextButton", {
    Position = UDim2.new(1, -126, 0, 82),
    Size = UDim2.fromOffset(110, 36),
    BackgroundColor3 = COLORS.Green,
    TextColor3 = COLORS.Background,
    Text = "Connect",
    TextSize = 13,
    Font = Enum.Font.GothamBold,
}, main)

local projectTitle = create("TextLabel", {
    Position = UDim2.fromOffset(16, 416),
    Size = UDim2.new(1, -32, 0, 25),
    BackgroundTransparency = 1,
    Text = "PROJECT DELIVERY",
    TextColor3 = COLORS.Text,
    TextSize = 13,
    Font = Enum.Font.GothamBold,
    TextXAlignment = Enum.TextXAlignment.Left,
    Visible = false,
}, main)

local projectInfo = create("TextLabel", {
    Position = UDim2.fromOffset(16, 446),
    Size = UDim2.new(1, -32, 0, 70),
    BackgroundColor3 = COLORS.Panel,
    TextColor3 = COLORS.Muted,
    Text = "No project received yet.\nCreate a project on the Nexora website.",
    TextSize = 12,
    Font = Enum.Font.Gotham,
    TextWrapped = true,
    Visible = false,
}, main)


local refreshProjectsButton = create("TextButton", {
    Name = "RefreshProjectsButton",
    Size = UDim2.new(0, 150, 0, 32),
    Position = UDim2.fromOffset(16, 526),
    Text = "Projekte laden",
    BackgroundColor3 = COLORS.Purple,
    TextColor3 = COLORS.Text,
    Font = Enum.Font.GothamBold,
    TextSize = 13,
    Visible = false,
}, main)

local autoInstallButton = create("TextButton", {
    Name = "AutoInstallButton",
    Size = UDim2.new(1, -192, 0, 32),
    Position = UDim2.fromOffset(176, 526),
    Text = "Auto-Install: AUS",
    BackgroundColor3 = COLORS.Panel,
    TextColor3 = COLORS.Text,
    Font = Enum.Font.GothamBold,
    TextSize = 12,
    Visible = false,
}, main)

local installButton = create("TextButton", {
    Name = "InstallProjectButton",
    Size = UDim2.new(1, -32, 0, 34),
    Position = UDim2.fromOffset(16, 564),
    Text = "Install Project",
    BackgroundColor3 = COLORS.Green,
    TextColor3 = COLORS.Background,
    Font = Enum.Font.GothamBold,
    TextSize = 13,
    Visible = false,
}, main)

local preview = create("TextBox", {
    Position = UDim2.fromOffset(16, 606),
    Size = UDim2.new(1, -32, 1, -681),
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
    Visible = false,
}, main)

local projectList = create("ScrollingFrame", {
    Name = "ProjectSelectionList",
    Position = UDim2.fromOffset(16, 606),
    Size = UDim2.new(1, -32, 1, -681),
    BackgroundColor3 = COLORS.Input,
    BorderSizePixel = 0,
    ScrollBarThickness = 6,
    CanvasSize = UDim2.new(0, 0, 0, 0),
    Visible = false,
}, main)

local projectListLayout = create("UIListLayout", {
    Padding = UDim.new(0, 6),
    SortOrder = Enum.SortOrder.LayoutOrder,
}, projectList)

projectListLayout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
    projectList.CanvasSize = UDim2.new(
        0, 0, 0, projectListLayout.AbsoluteContentSize.Y + 8
    )
end)

local footer = create("TextLabel", {
    Position = UDim2.new(0, 16, 1, -48),
    Size = UDim2.new(1, -32, 0, 42),
    BackgroundTransparency = 1,
    Text = "Nexora Forge v" .. CONFIG.Version ..
        "\nWaiting for secure website connection.",
    TextColor3 = COLORS.Muted,
    TextSize = 10,
    Font = Enum.Font.Gotham,
    TextWrapped = true,
    TextXAlignment = Enum.TextXAlignment.Left,
    Visible = false,
}, main)

local function setStatus(message, color)
    connectionStatus.Text = "● " .. message
    connectionStatus.TextColor3 = color or COLORS.Muted
    footer.Visible = true
end

local function normalizeProject(project)
    if type(project) ~= "table" then
        return nil, "Invalid project."
    end

    local projectName = project.title or project.name
    if type(projectName) ~= "string" or #projectName == 0 then
        return nil, "Project name is missing."
    end

    if type(project.scripts) ~= "table" or #project.scripts > 50 then
        return nil, "Project scripts are missing or exceed the limit."
    end

    local projectId = tostring(project.id or "")
    if projectId == "" then
        return nil, "Project ID is missing."
    end

    local normalized = {
        id = projectId,
        name = projectName,
        updatedAt = tostring(project.updatedAt or ""),
        scripts = {},
    }

    for _, item in ipairs(project.scripts) do
        if type(item) ~= "table" then
            return nil, "A script has invalid data."
        end

        local scriptType = item.type or item.className
        local scriptCode = item.code or item.source
        local scriptName = item.title or item.name
        local scriptPath = item.path or ""

        local allowed = {
            Script = true,
            LocalScript = true,
            ModuleScript = true,
        }

        if type(scriptName) ~= "string"
            or type(scriptType) ~= "string"
            or not allowed[scriptType]
            or type(scriptPath) ~= "string"
            or type(scriptCode) ~= "string"
            or #scriptCode > 100000 then
            return nil, "A script has invalid data or an unsupported type."
        end

        table.insert(normalized.scripts, {
            name = scriptName,
            className = scriptType,
            path = scriptPath,
            source = scriptCode,
        })
    end

    return normalized
end

local function validateProject(project)
    local normalized, reason = normalizeProject(project)
    return normalized ~= nil, reason
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

local selectedProject = nil
local autoInstallEnabled = false
local autoInstallProjectId = nil

local function applyProject(project)
    local normalized, reason = normalizeProject(project)

    if not normalized then
        selectedProject = nil
        installButton.Visible = false
        setStatus(reason, COLORS.Red)
        return false
    end

    selectedProject = normalized
    installButton.Visible = #normalized.scripts > 0
    projectInfo.Visible = true
    preview.Visible = true
    footer.Visible = true
    preview.Text = "Project: " .. normalized.name .. "\n\n"

    for _, item in ipairs(normalized.scripts) do
        preview.Text ..= item.name .. "\n"
            .. item.className .. "\n"
            .. item.path .. "\n\n"
    end

    projectInfo.Text = normalized.name
        .. "\n" .. tostring(#normalized.scripts)
        .. " scripts received.\nReady for installation."

    setStatus("Project received", COLORS.Green)
    return true
end


local function installProject()
    if not selectedProject then
        setStatus("Load a project first.", COLORS.Red)
        return false
    end

    local serverScripts = game:GetService("ServerScriptService")
    local replicatedStorage = game:GetService("ReplicatedStorage")
    local starterScripts = game:GetService("StarterPlayer"):WaitForChild("StarterPlayerScripts")

    local installed = 0
    local skipped = 0

    local function resolveTarget(item)
        local className = item.className
        local rawPath = tostring(item.path or "")
        local cleanPath = rawPath:gsub("\\", "/"):gsub("^%s+", ""):gsub("%s+$", "")
        cleanPath = cleanPath:gsub("^game%.", "")
        cleanPath = cleanPath:gsub('^game:GetService%(["\']', "")
        cleanPath = cleanPath:gsub('["\']%)$', "")

        local parts = {}
        for segment in string.gmatch(cleanPath, "[^/]+") do
            if segment ~= "" and segment ~= "." then
                table.insert(parts, segment)
            end
        end

        local root
        local first = parts[1]

        if className == "Script" then
            if first and first ~= "ServerScriptService" then
                error("Script-Ziel muss ServerScriptService sein: " .. cleanPath)
            end
            root = serverScripts
            if first == "ServerScriptService" then
                table.remove(parts, 1)
            end
        elseif className == "LocalScript" then
            if first == "StarterPlayer" then
                table.remove(parts, 1)
                if parts[1] ~= "StarterPlayerScripts" then
                    error("LocalScripts müssen in StarterPlayerScripts liegen: " .. cleanPath)
                end
                table.remove(parts, 1)
            elseif first == "StarterPlayerScripts" then
                table.remove(parts, 1)
            elseif first then
                error("LocalScript-Ziel wird nicht unterstützt: " .. cleanPath)
            end
            root = starterScripts
        elseif className == "ModuleScript" then
            if first and first ~= "ReplicatedStorage" then
                error("ModuleScript-Ziel muss ReplicatedStorage sein: " .. cleanPath)
            end
            root = replicatedStorage
            if first == "ReplicatedStorage" then
                table.remove(parts, 1)
            end
        else
            error("Ungültiger Script-Typ: " .. tostring(className))
        end

        local current = root
        for _, folderName in ipairs(parts) do
            local child = current:FindFirstChild(folderName)
            if child then
                if not child:IsA("Folder") then
                    error("Zielpfad enthält keinen Ordner: " .. folderName)
                end
            else
                child = Instance.new("Folder")
                child.Name = folderName
                child:SetAttribute("NexoraManaged", true)
                child:SetAttribute("NexoraProjectId", selectedProject.id)
                child.Parent = current
            end
            current = child
        end

        return current
    end

    local historyId = ChangeHistoryService:TryBeginRecording(
        "NexoraForgeInstall",
        "Install Nexora project"
    )

    local ok, err = pcall(function()
        for index, item in ipairs(selectedProject.scripts) do
            local target = resolveTarget(item)

            local safeName = tostring(item.name or ""):gsub("[^%w_%- ]", ""):sub(1, 80)
            if safeName == "" then
                safeName = "NexoraScript" .. index
            end

            local existing = target:FindFirstChild(safeName)
            if existing and (
                existing:GetAttribute("NexoraManaged") ~= true
                or existing:GetAttribute("NexoraProjectId") ~= selectedProject.id
                or not existing:IsA(item.className)
            ) then
                skipped += 1
            else
                local scriptObject = existing
                if not scriptObject then
                    scriptObject = Instance.new(item.className)
                    scriptObject.Name = safeName
                    scriptObject:SetAttribute("NexoraManaged", true)
                    scriptObject:SetAttribute("NexoraProjectId", selectedProject.id)
                    scriptObject.Parent = target
                end

                scriptObject.Source = item.source
                installed += 1
            end
        end
    end)

    if historyId then
        if ok then
            ChangeHistoryService:FinishRecording(
                historyId,
                Enum.FinishRecordingOperation.Commit
            )
        else
            ChangeHistoryService:FinishRecording(
                historyId,
                Enum.FinishRecordingOperation.Cancel
            )
        end
    end

    if not ok then
        setStatus("Installation failed", COLORS.Red)
        footer.Text = tostring(err)
        return false
    end

    setStatus("Project installed", COLORS.Green)
    footer.Text = tostring(installed) .. " script(s) installed; "
        .. tostring(skipped) .. " existing script(s) skipped."
    return true
end

installButton.MouseButton1Click:Connect(installProject)

autoInstallButton.MouseButton1Click:Connect(function()
    if not selectedProject or selectedProject.id == "" then
        setStatus("Please select a project first.", COLORS.Red)
        return
    end

    if autoInstallEnabled and autoInstallProjectId == selectedProject.id then
        autoInstallEnabled = false
        autoInstallProjectId = nil
        autoInstallButton.Text = "Auto-Install: AUS"
        autoInstallButton.BackgroundColor3 = COLORS.Panel
        footer.Text = "Automatic installation disabled."
    else
        autoInstallEnabled = true
        autoInstallProjectId = selectedProject.id
        autoInstallButton.Text = "Auto-Install: AN"
        autoInstallButton.BackgroundColor3 = COLORS.Green
        footer.Text = "Auto-install enabled for: " .. selectedProject.name
    end
end)


-- NEXORA_BROWSER_AUTH_V1
local SERVER_URL = "https://stan-tue-wiring-specification.trycloudflare.com"
local TOKEN_SETTING = "NexoraForge_DeviceToken"


local requestJson

-- Automatic project synchronization.
local autoSyncRunning = false
local knownProjects = {}
local autoInstallAttempts = {}
local MAX_AUTO_INSTALL_ATTEMPTS = 3

local function startAutoSync(token)
    if autoSyncRunning then
        return
    end

    autoSyncRunning = true

    task.spawn(function()
        local firstSync = true

        while true do
            local callOk, success, status, data = pcall(function()
                return requestJson(
                    SERVER_URL .. "/api/plugin/projects",
                    "GET",
                    nil,
                    token
                )
            end)

            if callOk and success and type(data) == "table"
                and type(data.projects) == "table" then

                if firstSync then
                    -- Record existing projects without installing anything.
                    -- Installation must always be started manually by the user.
                    for _, project in ipairs(data.projects) do
                        if type(project) == "table" and project.id then
                            knownProjects[tostring(project.id)] =
                                tostring(project.updatedAt or "")
                        end
                    end

                    firstSync = false
                    footer.Text = "Automatic synchronization is active."
                else
                    for _, project in ipairs(data.projects) do
                        if type(project) == "table" and project.id then
                            local id = tostring(project.id)
                            local updatedAt = tostring(project.updatedAt or "")

                            if knownProjects[id] ~= updatedAt then
                                if type(project.scripts) == "table"
                                    and #project.scripts > 0 then

                                    if autoInstallEnabled
                                        and autoInstallProjectId == id
                                        and selectedProject
                                        and selectedProject.id == id then

                                        autoInstallAttempts[id] = autoInstallAttempts[id] or 0

                                        if applyProject(project) then
                                            local installedOk = installProject()

                                            if installedOk then
                                                knownProjects[id] = updatedAt
                                                autoInstallAttempts[id] = 0
                                                footer.Text = "Automatically installed updated project: "
                                                    .. selectedProject.name
                                            else
                                                autoInstallAttempts[id] += 1
                                                footer.Text = "Auto-install attempt "
                                                    .. autoInstallAttempts[id] .. "/"
                                                    .. MAX_AUTO_INSTALL_ATTEMPTS .. " failed."

                                                if autoInstallAttempts[id] >= MAX_AUTO_INSTALL_ATTEMPTS then
                                                    knownProjects[id] = updatedAt
                                                    autoInstallEnabled = false
                                                    autoInstallProjectId = nil
                                                    autoInstallButton.Text = "Auto-Install: AUS"
                                                    autoInstallButton.BackgroundColor3 = COLORS.Panel
                                                    footer.Text = "Auto-install stopped after 3 failed attempts. Review the project and install manually."
                                                end
                                            end
                                        else
                                            knownProjects[id] = updatedAt
                                            autoInstallEnabled = false
                                            autoInstallProjectId = nil
                                            autoInstallButton.Text = "Auto-Install: AUS"
                                            autoInstallButton.BackgroundColor3 = COLORS.Panel
                                            footer.Text = "Project validation failed. Auto-install stopped."
                                        end
                                    else
                                        knownProjects[id] = updatedAt
                                        footer.Text = "Website project updated. Refresh projects to review it."
                                    end
                                else
                                    knownProjects[id] = updatedAt
                                end
                            end
                        end
                    end
                end
            elseif callOk and status == 401 then
                setStatus("Connection expired", COLORS.Red)
                footer.Text = "Reconnect Nexora Forge on the website."
                autoSyncRunning = false
                return
            else
                footer.Text = "Automatic sync: waiting for server..."
            end

            task.wait(10)
        end
    end)
end




local function loadProjects()
    local token = plugin:GetSetting(TOKEN_SETTING)

    if type(token) ~= "string" or token == "" then
        setStatus("Bitte zuerst Nexora verbinden", COLORS.Muted)
        footer.Text = "Es wurde kein Verbindungstoken gefunden."
        return
    end

    setStatus("Projekte werden geladen...", COLORS.Muted)

    task.spawn(function()
        local callOk, success, status, data = pcall(function()
            return requestJson(
                SERVER_URL .. "/api/plugin/projects",
                "GET",
                nil,
                token
            )
        end)

        if not callOk or not success or type(data) ~= "table"
            or type(data.projects) ~= "table" then
            setStatus("Projekte konnten nicht geladen werden", COLORS.Red)

            local detail = ""
            if type(data) == "table" and type(data.error) == "string" then
                detail = data.error
            elseif not callOk then
                detail = tostring(success)
            end

            footer.Text = "HTTP " .. tostring(status)
                .. (detail ~= "" and ": " .. detail or "")
            return
        end

        selectedProject = nil
        autoInstallEnabled = false
        autoInstallProjectId = nil
        autoInstallButton.Visible = false
        autoInstallButton.Text = "Auto-Install: AUS"
        autoInstallButton.BackgroundColor3 = COLORS.Panel
        installButton.Visible = false
        projectList.Visible = false
        preview.Visible = true

        if #data.projects == 0 then
            preview.Text = "Noch keine Nexora-Projekte vorhanden."
            projectInfo.Text = "Create a project on the Nexora website."
            projectInfo.Visible = true
            setStatus("No projects found", COLORS.Muted)
            footer.Text = "No projects are available for this account."
            return
        end

        for _, child in ipairs(projectList:GetChildren()) do
            if child ~= projectListLayout then
                child:Destroy()
            end
        end

        for index, project in ipairs(data.projects) do
            local projectData = project
            local projectName = tostring(
                projectData.title or projectData.name or "Unbenanntes Projekt"
            )

            local projectButton = create("TextButton", {
                Name = "Project_" .. tostring(index),
                Size = UDim2.new(1, -12, 0, 42),
                BackgroundColor3 = COLORS.Panel,
                TextColor3 = COLORS.Text,
                Text = projectName,
                TextSize = 12,
                Font = Enum.Font.GothamMedium,
                TextWrapped = true,
                LayoutOrder = index,
            }, projectList)

            projectButton.MouseButton1Click:Connect(function()
                if applyProject(projectData) then
                    autoInstallEnabled = false
                    autoInstallProjectId = selectedProject.id
                    autoInstallButton.Visible = true
                    autoInstallButton.Text = "Auto-Install: AUS"
                    autoInstallButton.BackgroundColor3 = COLORS.Panel
                    projectList.Visible = false
                    preview.Visible = true
                    footer.Text = "Project selected. Auto-install is off."
                end
            end)
        end

        projectInfo.Visible = true
        projectInfo.Text = tostring(#data.projects)
            .. " Projekte gefunden. Wähle eines aus."
        preview.Visible = false
        projectList.Visible = true
        footer.Text = "Choose a project. Nothing is installed automatically."
    end)
end

requestJson = function(url, method, body, token)
    local headers = { ["Content-Type"] = "application/json" }

    if token then
        headers.Authorization = "Bearer " .. token
    end

    local options = {
        Url = url,
        Method = method,
        Headers = headers,
    }

    if body then
        options.Body = HttpService:JSONEncode(body)
    end

    local response = HttpService:RequestAsync(options)
    local data = {}

    local decodeOk, decoded = pcall(function()
        return HttpService:JSONDecode(response.Body)
    end)

    if decodeOk and type(decoded) == "table" then
        data = decoded
    elseif not response.Success then
        -- Fehlerantworten können HTML statt JSON enthalten.
        -- Nur den Antworttext anzeigen, niemals Response-Header oder Cookies.
        local detail = tostring(response.Body or "")
        detail = string.sub(detail, 1, 500)
        data.error = detail ~= "" and detail
            or "Leere HTTP-Fehlerantwort."
    end

    return response.Success, response.StatusCode, data
end


-- NEXORA GAME ANALYSIS
local function getInstancePath(instance)
    local parts = {}
    local current = instance

    while current and current ~= game do
        table.insert(parts, 1, current.Name)
        current = current.Parent
    end

    return table.concat(parts, "/")
end

local function collectGameContext()
    local roots = {
        game:GetService("Workspace"),
        game:GetService("ReplicatedStorage"),
        game:GetService("ServerScriptService"),
        game:GetService("StarterPlayer"),
    }

    local context = {
        placeName = game.Name,
        roots = {},
        scripts = {},
        totalInstances = 0,
        truncated = false,
    }

    local sourceBudget = 12000
    local instanceLimit = 180

    for _, root in ipairs(roots) do
        local rootInfo = {
            name = root.Name,
            className = root.ClassName,
            children = {},
        }

        for _, item in ipairs(root:GetDescendants()) do
            if context.totalInstances >= instanceLimit then
                context.truncated = true
                break
            end

            context.totalInstances += 1

            if #rootInfo.children < 180 then
                table.insert(rootInfo.children, {
                    name = item.Name,
                    className = item.ClassName,
                    path = getInstancePath(item),
                })
            end

            if item:IsA("Script") or item:IsA("LocalScript")
                or item:IsA("ModuleScript") then

                local scriptInfo = {
                    name = item.Name,
                    className = item.ClassName,
                    path = getInstancePath(item),
                }

                if sourceBudget > 0 then
                    local readOk, source = pcall(function()
                        return item.Source
                    end)

                    if readOk and type(source) == "string" then
                        local allowedLength = math.min(#source, sourceBudget, 3000)
                        scriptInfo.source = string.sub(source, 1, allowedLength)
                        sourceBudget -= allowedLength
                        if allowedLength < #source then
                            scriptInfo.sourceTruncated = true
                        end
                    else
                        scriptInfo.source = "Source could not be read by the plugin."
                    end
                else
                    scriptInfo.source = "Source omitted: context size limit reached."
                    context.truncated = true
                end

                table.insert(context.scripts, scriptInfo)
            end
        end

        table.insert(context.roots, rootInfo)
    end

    return context
end

-- Automatische Warteschlange für Website-Chat-Aufträge.
local jobPollingRunning = false

local function startJobPolling(token)
    if jobPollingRunning then
        return
    end

    jobPollingRunning = true

    task.spawn(function()
        while jobPollingRunning do
            local callOk, success, status, data = pcall(function()
                return requestJson(
                    SERVER_URL .. "/api/plugin/jobs/next",
                    "GET",
                    nil,
                    token
                )
            end)

            if not callOk then
                footer.Text = "Scan queue temporarily unavailable."
            elseif status == 401 then
                jobPollingRunning = false
                setStatus("Connection expired", COLORS.Red)
                footer.Text = "Reconnect Nexora Forge on the website."
                return
            elseif success and type(data) == "table"
                and type(data.job) == "table"
                and type(data.job.id) == "string" then

                local jobId = data.job.id
                setStatus("Scanning game for website request...", COLORS.Muted)
                footer.Text = "A Nexora chat request is being processed."

                local scanOk, context = pcall(collectGameContext)

                local body
                if scanOk and type(context) == "table" then
                    body = { gameContext = context }
                else
                    body = { error = tostring(context or "Game scan failed.") }
                end

                local sendOk, sent, sendStatus, sendData = pcall(function()
                    return requestJson(
                        SERVER_URL .. "/api/plugin/jobs/" .. jobId .. "/complete",
                        "POST",
                        body,
                        token
                    )
                end)

                if sendOk and sent then
                    if scanOk then
                        setStatus("Game context sent", COLORS.Green)
                        footer.Text = "Game scan sent to the Nexora website chat."
                    else
                        setStatus("Game scan failed", COLORS.Red)
                        footer.Text = tostring(context)
                    end
                else
                    local detail = "HTTP " .. tostring(sendStatus)
                    if type(sendData) == "table" and type(sendData.error) == "string" then
                        detail = sendData.error
                    elseif not sendOk then
                        detail = tostring(sent)
                    end
                    setStatus("Could not send game scan", COLORS.Red)
                    footer.Text = detail
                end
            end

            task.wait(5)
        end
    end)
end

local connecting = false
local heartbeatRunning = false

local function startHeartbeat(token)
    if heartbeatRunning then
        return
    end

    heartbeatRunning = true

    task.spawn(function()
        while heartbeatRunning do
            local callOk, success, status, data = pcall(function()
                return requestJson(
                    SERVER_URL .. "/api/plugin/heartbeat",
                    "POST",
                    {},
                    token
                )
            end)

            if callOk and status == 401 then
                heartbeatRunning = false
                plugin:SetSetting(TOKEN_SETTING, "")
                setStatus("Authorization expired", COLORS.Red)
                connectButton.Text = "Connect"
                connectButton.Active = true
                footer.Text = "Please reconnect Nexora Forge."
                return
            end

            if callOk and success and type(data) == "table" then
                if data.connected == true then
                    setStatus("Connected", COLORS.Green)
                    connectButton.Text = "Connected"
                    connectButton.Active = false
                    footer.Text = "Roblox Studio is connected."
                else
                    setStatus("Connection inactive", COLORS.Muted)
                    connectButton.Text = "Reconnect"
                    connectButton.Active = true

                    if data.reason == "prompt_inactive" then
                        footer.Text = "Inactive after 30 minutes. Click Reconnect to continue."
                    else
                        footer.Text = "Connection unavailable. Click Reconnect."
                    end
                end
            end

            task.wait(15)
        end
    end)
end

local function testSavedConnection(activate)
    local token = plugin:GetSetting(TOKEN_SETTING)

    if type(token) ~= "string" or token == "" then
        setStatus("Not connected", COLORS.Muted)
        connectButton.Text = "Connect"
        connectButton.Active = true
        return false
    end

    local callOk, success, status = pcall(function()
        return requestJson(SERVER_URL .. "/api/plugin/ping", "GET", nil, token)
    end)

    if callOk and success and status == 200 then
        local heartbeatOk, heartbeatSuccess, heartbeatStatus, data = pcall(function()
            return requestJson(
                SERVER_URL .. "/api/plugin/heartbeat",
                "POST",
                { activate = activate == true },
                token
            )
        end)

        if heartbeatOk and heartbeatSuccess and heartbeatStatus == 200
            and type(data) == "table" and data.connected == true then
            setStatus("Connected", COLORS.Green)
            connectButton.Text = "Connected"
            connectButton.Active = false
            footer.Text = "Roblox Studio is connected."
            startHeartbeat(token)
            startAutoSync(token)
            startJobPolling(token)
            projectTitle.Visible = true
            refreshProjectsButton.Visible = true
            return true
        end

        if heartbeatOk and heartbeatStatus == 401 then
            plugin:SetSetting(TOKEN_SETTING, "")
            setStatus("Authorization expired", COLORS.Red)
            return false
        end

        setStatus("Connection inactive", COLORS.Muted)
        connectButton.Text = "Reconnect"
        connectButton.Active = true
        return false
    end

    if callOk and status == 401 then
        plugin:SetSetting(TOKEN_SETTING, "")
        setStatus("Authorization expired", COLORS.Red)
        return false
    end

    setStatus("Connection inactive", COLORS.Muted)
    connectButton.Text = "Reconnect"
    connectButton.Active = true
    return false
end

local function authorizePlugin()
    setStatus("Starting authorization...", COLORS.Muted)
    connectButton.Text = "Creating request..."

    local callOk, success, status, data = pcall(function()
        return requestJson(
            SERVER_URL .. "/api/plugin/auth/start",
            "POST",
            { deviceName = "Roblox Studio" }
        )
    end)

    if not callOk or not success or type(data) ~= "table"
        or type(data.requestToken) ~= "string" then
        setStatus("Could not start authorization", COLORS.Red)
        footer.Text = "Server response: " .. tostring(
            type(data) == "table" and data.error or status or success
        )
        return false
    end

    -- Die Website zeigt die offene Anfrage automatisch an.
    websiteLabel.Visible = false
    websiteInput.Visible = false
    websiteInput.Text = ""

    setStatus("Waiting for website approval...", COLORS.Muted)
    connectButton.Text = "Waiting for approval..."
    footer.Text = "Öffne Nexora Forge auf der Website und klicke bei der Roblox-Studio-Anfrage auf Annehmen."

    local deadline = os.clock() + 300

    while os.clock() < deadline do
        task.wait(2)

        local pollOk, pollSuccess, pollStatus, pollData = pcall(function()
            return requestJson(
                SERVER_URL .. "/api/plugin/auth/poll?requestToken="
                    .. HttpService:UrlEncode(data.requestToken),
                "GET"
            )
        end)

        if pollOk and pollSuccess and type(pollData) == "table"
            and type(pollData.token) == "string" then

            local saveOk, saveError = pcall(function()
                plugin:SetSetting(TOKEN_SETTING, pollData.token)
            end)

            if not saveOk then
                setStatus("Could not save device token", COLORS.Red)
                footer.Text = tostring(saveError)
                return false
            end

            setStatus("Connected", COLORS.Green)
            connectButton.Text = "Connected"
            connectButton.Active = false
                        projectTitle.Visible = true
            refreshProjectsButton.Visible = true
            footer.Text = "Connected. Automatic reconnect is enabled."
            testSavedConnection(true)
            return true
        end

        if pollOk and pollStatus == 404 then
            setStatus("Authorization expired", COLORS.Red)
            footer.Text = "The authorization request expired. Please try again."
            return false
        end
    end

    setStatus("Authorization timed out", COLORS.Red)
    footer.Text = "The approval took too long. Please try again."
    return false
end

local function connectAutomatically()
    if connecting then return end

    connecting = true
    connectButton.Active = false
    connectButton.Text = "Connecting..."

    task.spawn(function()
        local token = plugin:GetSetting(TOKEN_SETTING)

        -- Vorhandenes Token zuerst automatisch wiederverwenden.
        if type(token) == "string" and token ~= "" then
            setStatus("Reconnecting...", COLORS.Muted)

            while true do
                if testSavedConnection(true) then
                    connecting = false
                    return
                end

                token = plugin:GetSetting(TOKEN_SETTING)

                if type(token) ~= "string" or token == "" then
                    break
                end

                -- Bei vorübergehenden Netzwerkfehlern erneut versuchen.
                task.wait(5)
            end
        end

        -- Beim ersten Start oder nach abgelaufener Freigabe automatisch anmelden.
        local authorized = authorizePlugin()
        connecting = false

        if not authorized then
            connectButton.Text = "Connect"
            connectButton.Active = true
        end
    end)
end

connectButton.MouseButton1Click:Connect(connectAutomatically)

refreshProjectsButton.MouseButton1Click:Connect(loadProjects)

-- Automatisch verbinden, sobald das Plugin geladen wird.
-- Nur beim ersten Mal ist eine Freigabe im Browser erforderlich.
-- Verbindung startet erst nach Klick auf Connect.

openButton.Click:Connect(function()
    widget.Enabled = not widget.Enabled
end)

widget:GetPropertyChangedSignal("Enabled"):Connect(function()
    openButton:SetActive(widget.Enabled)
end)

print(CONFIG.Name .. " v" .. CONFIG.Version .. " loaded.")
