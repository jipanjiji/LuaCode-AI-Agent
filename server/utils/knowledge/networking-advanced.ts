import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file networking-advanced.ts
 * @description Advanced networking: HTTP requests, webhook sending,
 * remote argument analysis, packet handling, external API communication.
 */

export const NETWORKING_ADVANCED_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide complete specs for Advanced Networking and HTTP Communication.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: ADVANCED NETWORKING

§1 HTTP REQUESTS (Executor Environment)
\`\`\`lua
local HttpService = game:GetService("HttpService")

-- GET Request
local response = request({
    Url = "https://api.example.com/data",
    Method = "GET",
    Headers = {
        ["Content-Type"] = "application/json",
        ["User-Agent"] = "RobloxScript/1.0"
    }
})

if response.StatusCode == 200 then
    local data = HttpService:JSONDecode(response.Body)
    print(data)
end

-- POST Request
local postResponse = request({
    Url = "https://api.example.com/submit",
    Method = "POST",
    Headers = {
        ["Content-Type"] = "application/json"
    },
    Body = HttpService:JSONEncode({
        username = Player.Name,
        action = "login",
        timestamp = os.time()
    })
})

-- Alternative: syn.request (Synapse), http.request
local req = (syn and syn.request) or (http and http.request) or request
\`\`\`

§2 DISCORD WEBHOOK
\`\`\`lua
local function sendWebhook(webhookUrl, options)
    local data = {
        content = options.content,
        username = options.username or "Lua Agent",
        avatar_url = options.avatar,
        embeds = options.embeds
    }
    
    pcall(function()
        request({
            Url = webhookUrl,
            Method = "POST",
            Headers = {["Content-Type"] = "application/json"},
            Body = HttpService:JSONEncode(data)
        })
    end)
end

-- Send simple message
sendWebhook(WEBHOOK_URL, {
    content = "Script loaded on " .. game.PlaceId
})

-- Send rich embed
sendWebhook(WEBHOOK_URL, {
    embeds = {{
        title = "🎯 Rare Item Found!",
        description = "Found **Legendary Sword** in server " .. game.JobId,
        color = 65280, -- green (decimal)
        fields = {
            { name = "Player", value = Player.Name, inline = true },
            { name = "Server", value = game.JobId:sub(1, 8), inline = true },
            { name = "Time", value = os.date("%H:%M:%S"), inline = true },
        },
        footer = { text = "Auto-Farm Bot • " .. os.date("%Y-%m-%d") },
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ")
    }}
})

-- Webhook color values (decimal):
-- Red = 16711680, Green = 65280, Blue = 255
-- Yellow = 16776960, Purple = 8388736, Orange = 16753920
-- White = 16777215, Cyan = 65535, Pink = 16761035
\`\`\`

§3 REMOTE ARGUMENT ANALYSIS
\`\`\`lua
-- Analyze and print remote arguments in readable format
local function formatArg(arg, depth)
    depth = depth or 0
    local indent = string.rep("  ", depth)
    local t = typeof(arg)
    
    if t == "Instance" then
        return string.format("Instance(%s: %s)", arg.ClassName, arg:GetFullName())
    elseif t == "table" then
        local parts = {}
        for k, v in arg do
            table.insert(parts, string.format("%s[%s] = %s", 
                indent .. "  ", tostring(k), formatArg(v, depth + 1)))
        end
        return "{\n" .. table.concat(parts, ",\n") .. "\n" .. indent .. "}"
    elseif t == "string" then
        return string.format('"%s"', arg)
    elseif t == "Vector3" or t == "CFrame" or t == "Color3" then
        return string.format("%s(%s)", t, tostring(arg))
    else
        return tostring(arg)
    end
end

local function logRemoteCall(remote, method, args)
    local argStr = {}
    for i, arg in args do
        table.insert(argStr, string.format("  [%d] %s = %s", 
            i, typeof(arg), formatArg(arg)))
    end
    print(string.format("\n══ %s ══\nRemote: %s\nMethod: %s\nArgs:\n%s\n",
        os.date("%H:%M:%S"), remote:GetFullName(), method, 
        table.concat(argStr, "\n")))
end
\`\`\`

§4 ONCLIENDEVENT HANDLING (Server → Client)
\`\`\`lua
-- Listen to server-to-client events
local remote = ReplicatedStorage:WaitForChild("GameEvent")

remote.OnClientEvent:Connect(function(...)
    local args = {...}
    print("[S2C]", remote.Name, unpack(args))
    
    -- React to server events
    if args[1] == "Reward" then
        print("Got reward:", args[2])
    end
end)

-- Pattern: Intercept all S2C events
for _, remote in ReplicatedStorage:GetDescendants() do
    if remote:IsA("RemoteEvent") then
        remote.OnClientEvent:Connect(function(...)
            print("[S2C]", remote.Name, ...)
        end)
    end
end
\`\`\`

§5 REMOTE QUEUEING
\`\`\`lua
-- Queue remote calls to avoid rate limiting
local RemoteQueue = {}
RemoteQueue.__index = RemoteQueue

function RemoteQueue.new(rateLimit)
    return setmetatable({
        _queue = {},
        _rateLimit = rateLimit or 0.1,
        _running = false,
    }, RemoteQueue)
end

function RemoteQueue:Add(remote, method, args)
    table.insert(self._queue, { remote = remote, method = method, args = args })
    if not self._running then self:_process() end
end

function RemoteQueue:_process()
    self._running = true
    task.spawn(function()
        while #self._queue > 0 do
            local entry = table.remove(self._queue, 1)
            pcall(function()
                if entry.method == "FireServer" then
                    entry.remote:FireServer(unpack(entry.args))
                elseif entry.method == "InvokeServer" then
                    entry.remote:InvokeServer(unpack(entry.args))
                end
            end)
            task.wait(self._rateLimit)
        end
        self._running = false
    end)
end

-- Usage
local queue = RemoteQueue.new(0.1) -- max 10 calls/sec
queue:Add(buyRemote, "FireServer", {"Sword", 1})
queue:Add(buyRemote, "FireServer", {"Shield", 1})
\`\`\`` }]
  }
]
