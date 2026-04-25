import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file libraries.ts
 * @description Comprehensive Technical Specifications for External UI Libraries
 * including Morten UI, Rayfield, Orion, Fluent UI, and Kavo.
 * Full API reference with real code examples.
 */

export const LIBRARIES_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide the complete technical specification for all External UI Libraries used in Roblox scripts.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: UI LIBRARIES (COMPLETE API)

═══════════════════════════════════════════
§1  MORTEN UI (Primary / Recommended)
═══════════════════════════════════════════
Endpoint: loadstring(game:HttpGet("URL"))()\n
WAJIB load via loadstring, returns UI object.

\`\`\`lua
-- ═══ INITIALIZATION ═══
local UI = loadstring(game:HttpGet("https://script.vinzhub.com/newlib"))()

-- ═══ WINDOW CREATION ═══
local Window = UI:New({
    Title = "My Hub",         -- Window title
    Footer = "v1.0",          -- Footer text
    Logo = "rbxassetid://ID"  -- Optional logo asset ID
})

-- ═══ TABS ═══
local MainTab = Window:NewTab("Main")
local SettingsTab = Window:NewTab("Settings")

-- ═══ SECTIONS (Optional grouping inside tabs) ═══
local FarmSection = MainTab:NewSection("Auto Farm", false) -- false = not collapsed

-- ═══ COMPONENTS (Can be added to Tab OR Section) ═══

-- BUTTON
MainTab:Button({
    Name = "Click Me",
    desc = "Description text",     -- lowercase 'desc'
    Callback = function()
        print("Button clicked!")
    end
})

-- TOGGLE (returns handle for programmatic control)
local MyToggle = FarmSection:Toggle({
    Name = "Auto Farm",
    desc = "Enable auto farming",
    Default = false,
    Callback = function(state)     -- state = boolean
        print("Toggle:", state)
    end
})
-- Programmatic control:
MyToggle:Set(true)   -- set toggle state
MyToggle:Show()      -- show component
MyToggle:Hide()      -- hide component

-- SLIDER
FarmSection:Slider({
    Name = "Walk Speed",
    desc = "Adjust character speed",
    Min = 16,
    Max = 500,
    Default = 16,
    Callback = function(value)     -- value = number
        game.Players.LocalPlayer.Character.Humanoid.WalkSpeed = value
    end
})

-- DROPDOWN (Single Select)
FarmSection:Dropdown({
    Name = "Select Weapon",
    desc = "Choose weapon to equip",
    List = {"Sword", "Bow", "Magic", "Gun"},
    Default = "Sword",
    Callback = function(selected)   -- selected = string
        print("Selected:", selected)
    end
})

-- DROPDOWN (Multi Select)
FarmSection:Dropdown({
    Name = "Target Mobs",
    Multi = true,                   -- Enable multi-select
    Search = true,                  -- Enable search bar
    None = true,                    -- Allow selecting none
    List = {"Slime", "Goblin", "Orc", "Boss"},
    Default = {"Slime"},            -- table for multi
    Callback = function(selected)   -- selected = table of strings
        print("Targets:", table.concat(selected, ", "))
    end
})

-- KEYBIND
FarmSection:Keybind({
    Name = "Toggle Key",
    desc = "Press to toggle feature",
    Default = Enum.KeyCode.X,
    Callback = function()
        print("Key pressed!")
    end,
    OnChange = function(newKey)     -- fired when keybind changed
        print("New key:", newKey.Name)
    end
})

-- TEXTBOX
FarmSection:Textbox({
    Name = "Webhook URL",
    desc = "Enter Discord webhook",
    Placeholder = "https://discord.com/api/...",
    Callback = function(text, enterPressed)
        if enterPressed then
            print("Submitted:", text)
        end
    end
})

-- LABEL
FarmSection:Label({
    Text = "Status: Idle",
    desc = "Current status info"
})

-- PARAGRAPH
MainTab:Paragraph({
    Title = "Information",
    Content = "Multi-line content text here."
})
-- Update paragraph dynamically:
local InfoParagraph = MainTab:Paragraph({ Title = "Info", Content = "Loading..." })
InfoParagraph:Set(nil, "Updated content!")        -- Set(newTitle, newContent)
InfoParagraph:Set("New Title", "New content!")

-- ═══ NOTIFICATIONS ═══
UI:Notify({
    Title = "Success",
    Content = "Operation completed!",
    Time = 5      -- duration in seconds
})

-- ═══ CONFIG MANAGER (Settings Persistence) ═══
local ConfigSection = SettingsTab:NewSection("Configuration")
UI:ConfigManager(ConfigSection)

-- ═══ SETTINGS MANAGER ═══
local Manager = UI.SettingManager()
Manager:AddToTab(SettingsTab)
\`\`\`

═══════════════════════════════════════════
§2  RAYFIELD LIBRARY
═══════════════════════════════════════════
Endpoint: loadstring(game:HttpGet("https://sirius.menu/rayfield"))()

\`\`\`lua
local Rayfield = loadstring(game:HttpGet("https://sirius.menu/rayfield"))()

local Window = Rayfield:CreateWindow({
    Name = "My Hub",
    Icon = 0,                      -- Lucide icon ID or 0
    LoadingTitle = "Loading...",
    LoadingSubtitle = "by Me",
    Theme = "Default",             -- "Default", "AmberGlow", "Amethyst", "Bloom", "DarkBlue", "Green", "Light", "Ocean", "Sunset"
    DisableRayfieldPrompts = false,
    DisableBuildWarnings = false,
    ConfigurationSaving = {
        Enabled = true,
        FolderName = "MyHub",
        FileName = "Config"
    },
    KeySystem = false
})

local Tab = Window:CreateTab("Main", 4483362458) -- name, icon

Tab:CreateSection("Features")

Tab:CreateButton({
    Name = "Click Me",
    Callback = function() print("Clicked!") end
})

Tab:CreateToggle({
    Name = "Auto Farm",
    CurrentValue = false,
    Flag = "AutoFarm",             -- unique flag for config saving
    Callback = function(Value) end
})

Tab:CreateSlider({
    Name = "Speed",
    Range = {16, 500},
    Increment = 1,
    Suffix = "Speed",
    CurrentValue = 16,
    Flag = "SpeedSlider",
    Callback = function(Value) end
})

Tab:CreateDropdown({
    Name = "Select Mode",
    Options = {"Mode A", "Mode B", "Mode C"},
    CurrentOption = {"Mode A"},
    MultipleOptions = false,
    Flag = "ModeDropdown",
    Callback = function(Options) end
})

Tab:CreateInput({
    Name = "Target Player",
    CurrentValue = "",
    PlaceholderText = "Username...",
    RemoveTextAfterFocusLost = false,
    Flag = "TargetInput",
    Callback = function(Text) end
})

Tab:CreateKeybind({
    Name = "Toggle Key",
    CurrentKeybind = "E",
    HoldToInteract = false,
    Flag = "ToggleKeybind",
    Callback = function(Keybind) end
})

Tab:CreateColorPicker({
    Name = "ESP Color",
    Color = Color3.fromRGB(255, 0, 0),
    Flag = "ESPColor",
    Callback = function(Value) end
})

-- Notifications
Rayfield:Notify({
    Title = "Alert",
    Content = "Something happened!",
    Duration = 5,
    Image = 4483362458
})

-- Destroy
Rayfield:Destroy()
\`\`\`

═══════════════════════════════════════════
§3  ORION LIBRARY
═══════════════════════════════════════════
Endpoint: loadstring(game:HttpGet("https://raw.githubusercontent.com/shlexware/Orion/main/source"))()

\`\`\`lua
local OrionLib = loadstring(game:HttpGet("https://raw.githubusercontent.com/shlexware/Orion/main/source"))()

local Window = OrionLib:MakeWindow({
    Name = "My Hub",
    HidePremium = false,
    SaveConfig = true,
    ConfigFolder = "MyConfig",
    IntroEnabled = true,
    IntroText = "Welcome!"
})

local Tab = Window:MakeTab({
    Name = "Main",
    Icon = "rbxassetid://...",
    PremiumOnly = false
})

local Section = Tab:AddSection({ Name = "Features" })

Tab:AddButton({
    Name = "Click",
    Callback = function() print("Clicked") end
})

Tab:AddToggle({
    Name = "Toggle",
    Default = false,
    Flag = "MyToggle",
    Save = true,
    Callback = function(Value) end
})

Tab:AddSlider({
    Name = "Speed",
    Min = 0,
    Max = 500,
    Default = 16,
    Color = Color3.fromRGB(255,255,255),
    Increment = 1,
    Flag = "SpeedSlider",
    Save = true,
    Callback = function(Value) end
})

Tab:AddDropdown({
    Name = "Mode",
    Default = "Mode A",
    Options = {"Mode A", "Mode B"},
    Flag = "ModeDD",
    Save = true,
    Callback = function(Value) end
})

-- PENTING: Refresh dropdown yang benar
-- Dropdown:Refresh(newOptionsTable, clearOldSelection)
local dd = Tab:AddDropdown({...})
dd:Refresh({"New A", "New B", "New C"}, true)
-- JANGAN: dd:Set() untuk refresh options

Tab:AddTextbox({
    Name = "Input",
    Default = "",
    TextDisappear = true,
    Flag = "TextInput",
    Callback = function(Value) end
})

OrionLib:MakeNotification({
    Name = "Alert",
    Content = "Message here",
    Image = "rbxassetid://...",
    Time = 5
})

OrionLib:Init()  -- WAJIB dipanggil di akhir untuk load config
\`\`\`

═══════════════════════════════════════════
§4  FLUENT UI LIBRARY (Modern Choice)
═══════════════════════════════════════════
Endpoint: loadstring(game:HttpGet("https://github.com/dawid-scripts/Fluent/releases/latest/download/main.lua"))()

\`\`\`lua
local Fluent = loadstring(game:HttpGet("https://github.com/dawid-scripts/Fluent/releases/latest/download/main.lua"))()
local SaveManager = loadstring(game:HttpGet("https://raw.githubusercontent.com/dawid-scripts/Fluent/master/Addons/SaveManager.lua"))()
local InterfaceManager = loadstring(game:HttpGet("https://raw.githubusercontent.com/dawid-scripts/Fluent/master/Addons/InterfaceManager.lua"))()

local Window = Fluent:CreateWindow({
    Title = "My Hub",
    SubTitle = "by Me",
    TabWidth = 160,
    Size = UDim2.fromOffset(580, 460),
    Acrylic = true,          -- Blur background
    Theme = "Dark",          -- "Dark", "Light", "Amethyst", "Aqua", "Rose"
    MinimizeKey = Enum.KeyCode.LeftControl
})

local Tabs = {
    Main = Window:AddTab({ Title = "Main", Icon = "home" }),
    Settings = Window:AddTab({ Title = "Settings", Icon = "settings" })
}

Tabs.Main:AddParagraph({ Title = "Welcome", Content = "Script loaded!" })

Tabs.Main:AddButton({
    Title = "Click Me",
    Description = "Does something",
    Callback = function() end
})

local Toggle = Tabs.Main:AddToggle("MyToggle", {
    Title = "Auto Farm",
    Description = "Enable farming",
    Default = false
})
Toggle:OnChanged(function()
    print("Toggle:", Toggle.Value)
end)

local Slider = Tabs.Main:AddSlider("MySlider", {
    Title = "Speed",
    Description = "Walk speed",
    Default = 16,
    Min = 0,
    Max = 500,
    Rounding = 1
})
Slider:OnChanged(function(Value)
    print("Speed:", Value)
end)

local Dropdown = Tabs.Main:AddDropdown("MyDropdown", {
    Title = "Mode",
    Values = {"A", "B", "C"},
    Multi = false,
    Default = 1
})

local Input = Tabs.Main:AddInput("MyInput", {
    Title = "Name",
    Default = "",
    Placeholder = "Type here...",
    Numeric = false
})

local Keybind = Tabs.Main:AddKeybind("MyKeybind", {
    Title = "Toggle Key",
    Mode = "Toggle",       -- "Toggle", "Hold", "Always"
    Default = "E"
})

-- Save/Config Manager
SaveManager:SetLibrary(Fluent)
InterfaceManager:SetLibrary(Fluent)
SaveManager:SetFolder("MyHubConfig")
InterfaceManager:SetFolder("MyHubConfig")
InterfaceManager:BuildInterfaceSection(Tabs.Settings)
SaveManager:BuildConfigSection(Tabs.Settings)

Window:SelectTab(1)
Fluent:Notify({ Title = "Loaded", Content = "Script ready!", Duration = 3 })
\`\`\`

═══════════════════════════════════════════
§5  UNIVERSAL PATTERNS
═══════════════════════════════════════════

\`\`\`lua
-- Pattern: Dynamic dropdown refresh (works with most libraries)
local playerList = {}
local function refreshPlayers()
    playerList = {}
    for _, p in game.Players:GetPlayers() do
        if p ~= game.Players.LocalPlayer then
            table.insert(playerList, p.Name)
        end
    end
end

-- Pattern: Keybind toggle
local enabled = false
game:GetService("UserInputService").InputBegan:Connect(function(input, gpe)
    if gpe then return end
    if input.KeyCode == Enum.KeyCode.F then
        enabled = not enabled
        -- Update toggle UI if available
    end
end)

-- Pattern: Safe UI destruction on re-execute
if getgenv().MyUI then
    getgenv().MyUI:Destroy()
end
-- Create new UI...
getgenv().MyUI = Window
\`\`\`` }]
  }
]
