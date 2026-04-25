import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file roblox-services.ts
 * @description Complete reference for commonly-used Roblox Services:
 * Players, Workspace, ReplicatedStorage, UserInputService, TweenService,
 * HttpService, Lighting, RunService, MarketplaceService, etc.
 */

export const ROBLOX_SERVICES_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide complete specs for all key Roblox Services and their usage patterns.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: ROBLOX SERVICES

§1 PLAYERS SERVICE
\`\`\`lua
local Players = game:GetService("Players")
local Player = Players.LocalPlayer

-- Get all players
for _, p in Players:GetPlayers() do print(p.Name) end

-- Player events
Players.PlayerAdded:Connect(function(player) end)
Players.PlayerRemoving:Connect(function(player) end)

-- Character access
local char = Player.Character or Player.CharacterAdded:Wait()
local humanoid = char:WaitForChild("Humanoid")
local root = char:WaitForChild("HumanoidRootPart")

-- Character events
Player.CharacterAdded:Connect(function(char)
    local hum = char:WaitForChild("Humanoid")
    local root = char:WaitForChild("HumanoidRootPart")
end)

-- Player properties
Player.UserId        -- unique numeric ID
Player.DisplayName   -- display name
Player.Name          -- username
Player.Team          -- current team
Player.TeamColor     -- BrickColor of team
\`\`\`

§2 WORKSPACE
\`\`\`lua
local ws = workspace -- or game:GetService("Workspace")

-- Camera
local camera = ws.CurrentCamera
camera.CFrame = CFrame.new(0, 100, 0)
camera.FieldOfView = 90

-- Gravity
ws.Gravity = 196.2 -- default, set to 0 for zero-G

-- Raycasting (Modern API)
local rayOrigin = root.Position
local rayDirection = root.CFrame.LookVector * 100

local params = RaycastParams.new()
params.FilterType = Enum.RaycastFilterType.Exclude
params.FilterDescendantsInstances = {Player.Character}

local result = ws:Raycast(rayOrigin, rayDirection, params)
if result then
    print("Hit:", result.Instance.Name)
    print("Position:", result.Position)
    print("Normal:", result.Normal)
    print("Material:", result.Material)
    print("Distance:", result.Distance)
end

-- FindPartOnRay (Legacy, avoid if possible)
local ray = Ray.new(origin, direction)
local hit, pos, normal = ws:FindPartOnRay(ray, Player.Character)

-- FindPartsInRegion3
local region = Region3.new(min, max)
local parts = ws:FindPartsInRegion3(region, nil, 100)
\`\`\`

§3 REPLICATED STORAGE & FIRST
\`\`\`lua
local RS = game:GetService("ReplicatedStorage")
local RF = game:GetService("ReplicatedFirst")

-- Common remote locations
local remotes = RS:WaitForChild("Remotes")  -- or "Events", "Network"
local buyRemote = remotes:WaitForChild("BuyItem")

-- Find all remotes recursively
for _, remote in RS:GetDescendants() do
    if remote:IsA("RemoteEvent") or remote:IsA("RemoteFunction") then
        print(remote:GetFullName())
    end
end
\`\`\`

§4 USER INPUT SERVICE
\`\`\`lua
local UIS = game:GetService("UserInputService")

-- Key press detection
UIS.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end -- ignore if typing in chat/textbox
    
    if input.KeyCode == Enum.KeyCode.F then
        print("F pressed!")
    end
    if input.UserInputType == Enum.UserInputType.MouseButton1 then
        print("Left click!")
    end
end)

UIS.InputEnded:Connect(function(input, gpe)
    if input.KeyCode == Enum.KeyCode.F then
        print("F released!")
    end
end)

-- Check if key is currently held
local isHolding = UIS:IsKeyDown(Enum.KeyCode.W)

-- Mouse position
local mousePos = UIS:GetMouseLocation() -- Vector2

-- Mobile/Console detection
local isMobile = UIS.TouchEnabled and not UIS.KeyboardEnabled
local isConsole = UIS.GamepadEnabled

-- JumpRequest (for infinite jump)
UIS.JumpRequest:Connect(function()
    humanoid:ChangeState(Enum.HumanoidStateType.Jumping)
end)
\`\`\`

§5 TWEEN SERVICE
\`\`\`lua
local TS = game:GetService("TweenService")

local info = TweenInfo.new(
    1,                          -- Duration
    Enum.EasingStyle.Quad,      -- Quad, Linear, Sine, Back, Bounce, Elastic, Exponential, Circular
    Enum.EasingDirection.Out,   -- In, Out, InOut
    0,                          -- RepeatCount (-1 = infinite)
    false,                      -- Reverses
    0                           -- DelayTime
)

-- Tween any property
local tween = TS:Create(part, info, { Position = Vector3.new(0, 50, 0) })
tween:Play()
tween.Completed:Wait() -- yield until done

-- UI Tweening
TS:Create(frame, TweenInfo.new(0.3), {
    BackgroundTransparency = 0,
    Size = UDim2.fromOffset(400, 300)
}):Play()

-- Cancel tween
tween:Cancel()
tween:Pause()
\`\`\`

§6 HTTP SERVICE
\`\`\`lua
local HTTP = game:GetService("HttpService")

-- JSON encode/decode
local jsonStr = HTTP:JSONEncode({name = "test", value = 42})
local tbl = HTTP:JSONDecode(jsonStr)

-- HTTP requests (executor environment)
-- Method 1: http.request / request (executor globals)
local response = request({
    Url = "https://api.example.com/data",
    Method = "GET",  -- or "POST"
    Headers = {
        ["Content-Type"] = "application/json",
        ["Authorization"] = "Bearer token123"
    },
    Body = HTTP:JSONEncode({key = "value"}) -- for POST
})
print(response.StatusCode)  -- 200
print(response.Body)        -- response text

-- Generate GUID
local id = HTTP:GenerateGUID(false) -- false = no curly braces
\`\`\`

§7 LIGHTING & ATMOSPHERE
\`\`\`lua
local Lighting = game:GetService("Lighting")

-- Time of day
Lighting.ClockTime = 14      -- 2 PM (0-24)
Lighting.TimeOfDay = "14:00:00"

-- Fullbright (remove all shadows/darkness)
local function fullbright()
    Lighting.Brightness = 2
    Lighting.ClockTime = 14
    Lighting.FogEnd = 100000
    Lighting.GlobalShadows = false
    Lighting.Ambient = Color3.fromRGB(178, 178, 178)
    
    for _, effect in Lighting:GetChildren() do
        if effect:IsA("Atmosphere") or effect:IsA("BloomEffect") or
           effect:IsA("BlurEffect") or effect:IsA("ColorCorrectionEffect") then
            effect:Destroy()
        end
    end
end
\`\`\`

§8 MARKETPLACE SERVICE
\`\`\`lua
local MPS = game:GetService("MarketplaceService")

-- Check gamepass ownership
local hasPass = MPS:UserOwnsGamePassAsync(Player.UserId, GAMEPASS_ID)

-- Prompt purchase
MPS:PromptGamePassPurchase(Player, GAMEPASS_ID)
MPS:PromptProductPurchase(Player, PRODUCT_ID)

-- Product/Gamepass info
local info = MPS:GetProductInfo(ASSET_ID)
print(info.Name, info.PriceInRobux)
\`\`\`` }]
  }
]
