import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file filesystem-persistence.ts
 * @description Executor filesystem APIs: readfile, writefile, makefolder,
 * JSON config, clipboard, decompile, auto-update.
 */

export const FILESYSTEM_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide complete specs for Executor Filesystem and Data Persistence.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: FILESYSTEM & PERSISTENCE

§1 FILE OPERATIONS
\`\`\`lua
-- Write file
writefile("MyHub/config.json", '{"speed": 50}')

-- Read file
local content = readfile("MyHub/config.json")

-- Check file exists
if isfile("MyHub/config.json") then
    local data = readfile("MyHub/config.json")
end

-- Delete file
delfile("MyHub/old_config.json")

-- Append to file
appendfile("MyHub/log.txt", os.date() .. " - Action performed\\n")

-- Folder operations
makefolder("MyHub")
makefolder("MyHub/configs")

if isfolder("MyHub") then
    print("Folder exists!")
end

delfolder("MyHub/old_folder")

-- List files in folder
local files = listfiles("MyHub")
for _, filepath in files do
    print(filepath) -- "MyHub/config.json", etc.
end
\`\`\`

§2 JSON CONFIG SAVE/LOAD PATTERN
\`\`\`lua
local HttpService = game:GetService("HttpService")

local CONFIG_DIR = "MyHub"
local CONFIG_FILE = CONFIG_DIR .. "/settings.json"

-- Default config
local defaultConfig = {
    autoFarm = false,
    walkSpeed = 16,
    espEnabled = false,
    targetMob = "All",
    webhookUrl = "",
    keybinds = {
        toggleFarm = "F",
        toggleESP = "G",
    },
    ui = {
        theme = "dark",
        scale = 1.0,
    }
}

-- Ensure directory exists
if not isfolder(CONFIG_DIR) then
    makefolder(CONFIG_DIR)
end

-- Load config (merge with defaults for new keys)
local function loadConfig()
    if not isfile(CONFIG_FILE) then
        return table.clone(defaultConfig)
    end
    
    local ok, saved = pcall(function()
        return HttpService:JSONDecode(readfile(CONFIG_FILE))
    end)
    
    if not ok then
        warn("[Config] Corrupted config, using defaults")
        return table.clone(defaultConfig)
    end
    
    -- Merge: keep saved values, add missing defaults
    local config = table.clone(defaultConfig)
    for key, value in saved do
        if defaultConfig[key] ~= nil then
            config[key] = value
        end
    end
    return config
end

-- Save config
local function saveConfig(config)
    local ok, err = pcall(function()
        writefile(CONFIG_FILE, HttpService:JSONEncode(config))
    end)
    if not ok then warn("[Config] Save failed:", err) end
end

-- Auto-save on change
local config = loadConfig()
local function updateConfig(key, value)
    config[key] = value
    saveConfig(config)
end
\`\`\`

§3 CLIPBOARD OPERATIONS
\`\`\`lua
-- Copy text to clipboard
setclipboard("Hello World!")

-- Copy script output
local output = HttpService:JSONEncode(remoteLog)
setclipboard(output)

-- Copy remote path for replay
setclipboard(remote:GetFullName())
\`\`\`

§4 SCRIPT AUTO-UPDATE
\`\`\`lua
local VERSION = "1.0.5"
local VERSION_URL = "https://raw.githubusercontent.com/user/repo/main/version.txt"
local SCRIPT_URL = "https://raw.githubusercontent.com/user/repo/main/script.lua"
local LOCAL_VERSION = "MyHub/version.txt"

local function checkForUpdate()
    local ok, latestVersion = pcall(function()
        return game:HttpGet(VERSION_URL):gsub("%s+", "")
    end)
    
    if not ok then
        warn("[Update] Failed to check for updates")
        return false
    end
    
    if latestVersion ~= VERSION then
        print(string.format("[Update] New version available: %s (current: %s)", 
            latestVersion, VERSION))
        return true, latestVersion
    end
    
    return false
end

local function autoUpdate()
    local hasUpdate, newVer = checkForUpdate()
    if hasUpdate then
        local ok, script = pcall(game.HttpGet, game, SCRIPT_URL)
        if ok then
            writefile(LOCAL_VERSION, newVer)
            loadstring(script)()
            return true -- stop executing old version
        end
    end
    return false
end
\`\`\`

§5 DECOMPILE & SCRIPT ANALYSIS
\`\`\`lua
-- Decompile a script (get source code)
local script = game.Players.LocalPlayer.PlayerScripts:FindFirstChild("SomeScript")
if script then
    local source = decompile(script)
    print(source)
    setclipboard(source) -- copy to clipboard
end

-- Get script bytecode (raw)
local bytecode = getscriptbytecode(script)

-- Save decompiled scripts
local function dumpAllScripts()
    if not isfolder("ScriptDump") then
        makefolder("ScriptDump")
    end
    
    for _, script in game:GetDescendants() do
        if script:IsA("LocalScript") or script:IsA("ModuleScript") then
            local ok, source = pcall(decompile, script)
            if ok and source then
                local safeName = script.Name:gsub("[^%w]", "_")
                writefile("ScriptDump/" .. safeName .. ".lua", source)
            end
        end
    end
    print("Script dump complete!")
end
\`\`\`

§6 LOG FILE MANAGEMENT
\`\`\`lua
local LOG_DIR = "MyHub/logs"
local LOG_FILE = LOG_DIR .. "/" .. os.date("%Y-%m-%d") .. ".log"

if not isfolder(LOG_DIR) then makefolder(LOG_DIR) end

local function log(level, message)
    local entry = string.format("[%s] [%s] %s\\n", 
        os.date("%H:%M:%S"), level, message)
    
    appendfile(LOG_FILE, entry)
    
    if level == "ERROR" then
        warn(entry)
    end
end

log("INFO", "Script started")
log("DEBUG", "Config loaded: " .. HttpService:JSONEncode(config))
log("ERROR", "Remote not found: BuyItem")
\`\`\`` }]
  }
]
