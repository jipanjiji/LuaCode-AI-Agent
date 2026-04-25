import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file visuals.ts
 * @description Complete visual rendering: ESP (Highlight + Drawing API),
 * Drawing API reference, BillboardGui, camera manipulation, TweenService.
 */

export const VISUALS_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide complete specs for Visual Rendering, ESP, Drawing API, and Camera manipulation.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: VISUALS & RENDERING

§1 ESP SYSTEM (Highlight-Based, Recommended)
\`\`\`lua
-- Modern ESP using Roblox Highlight Instance
local Players = game:GetService("Players")
local Player = Players.LocalPlayer

local espEnabled = false
local espHighlights = {}

local function addESP(targetPlayer)
    if targetPlayer == Player then return end
    
    local function createHighlight(character)
        -- Remove old highlight
        if espHighlights[targetPlayer] then
            espHighlights[targetPlayer]:Destroy()
        end
        
        local highlight = Instance.new("Highlight")
        highlight.Name = "ESP_" .. targetPlayer.Name
        highlight.FillColor = Color3.fromRGB(255, 0, 0) -- red fill
        highlight.OutlineColor = Color3.fromRGB(255, 255, 255) -- white outline
        highlight.FillTransparency = 0.5
        highlight.OutlineTransparency = 0
        highlight.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop -- X-ray!
        highlight.Adornee = character
        highlight.Parent = game.CoreGui -- or workspace.CurrentCamera
        
        espHighlights[targetPlayer] = highlight
    end
    
    -- Apply to current character
    if targetPlayer.Character then
        createHighlight(targetPlayer.Character)
    end
    
    -- Re-apply on respawn
    targetPlayer.CharacterAdded:Connect(function(char)
        if espEnabled then
            task.wait(0.5) -- wait for character to load
            createHighlight(char)
        end
    end)
end

local function enableESP()
    espEnabled = true
    for _, p in Players:GetPlayers() do addESP(p) end
    Players.PlayerAdded:Connect(function(p) if espEnabled then addESP(p) end end)
end

local function disableESP()
    espEnabled = false
    for player, highlight in espHighlights do
        highlight:Destroy()
    end
    table.clear(espHighlights)
end
\`\`\`

§2 DRAWING API (2D Overlay)
\`\`\`lua
-- Drawing API creates 2D overlays rendered on top of the game
-- Available types: Line, Circle, Square, Text, Triangle, Quad, Image

-- TEXT (Name tag / info display)
local nameTag = Drawing.new("Text")
nameTag.Text = "Player123 [100 HP]"
nameTag.Size = 14
nameTag.Color = Color3.fromRGB(255, 255, 255)
nameTag.Center = true
nameTag.Outline = true -- adds black outline for readability
nameTag.OutlineColor = Color3.fromRGB(0, 0, 0)
nameTag.Position = Vector2.new(500, 300)
nameTag.Visible = true

-- LINE (Tracer)
local tracer = Drawing.new("Line")
tracer.From = Vector2.new(screenWidth / 2, screenHeight) -- bottom center
tracer.To = Vector2.new(targetScreenX, targetScreenY)
tracer.Color = Color3.fromRGB(255, 0, 0)
tracer.Thickness = 1
tracer.Transparency = 1
tracer.Visible = true

-- CIRCLE (FOV circle for aimbot)
local fovCircle = Drawing.new("Circle")
fovCircle.Position = Vector2.new(screenWidth / 2, screenHeight / 2)
fovCircle.Radius = 150
fovCircle.Color = Color3.fromRGB(255, 255, 255)
fovCircle.Thickness = 1
fovCircle.Filled = false
fovCircle.Visible = true

-- SQUARE (Bounding box)
local box = Drawing.new("Square")
box.Position = Vector2.new(100, 100)
box.Size = Vector2.new(50, 80)
box.Color = Color3.fromRGB(0, 255, 0)
box.Thickness = 1
box.Filled = false
box.Visible = true

-- IMAGE
local img = Drawing.new("Image")
img.Data = game:HttpGet("https://example.com/image.png") -- raw image data
img.Size = Vector2.new(100, 100)
img.Position = Vector2.new(200, 200)
img.Visible = true

-- CLEANUP: Always :Remove() drawings when done
nameTag:Remove()
tracer:Remove()
fovCircle:Remove()

-- WorldToViewportPoint: Convert 3D → 2D screen coordinates
local camera = workspace.CurrentCamera

local function worldToScreen(position3D)
    local screenPos, onScreen = camera:WorldToViewportPoint(position3D)
    return Vector2.new(screenPos.X, screenPos.Y), onScreen, screenPos.Z
end

-- Pattern: Full ESP with Drawing API
local function createDrawingESP(targetPlayer)
    local esp = {
        nameTag = Drawing.new("Text"),
        box = Drawing.new("Square"),
        tracer = Drawing.new("Line"),
        healthBar = Drawing.new("Square"),
    }
    
    -- Configure all drawings...
    esp.nameTag.Size = 13
    esp.nameTag.Center = true
    esp.nameTag.Outline = true
    esp.box.Thickness = 1
    esp.box.Filled = false
    esp.tracer.Thickness = 1
    
    -- Update loop
    local conn = RunService.RenderStepped:Connect(function()
        local char = targetPlayer.Character
        local root = char and char:FindFirstChild("HumanoidRootPart")
        local humanoid = char and char:FindFirstChildOfClass("Humanoid")
        
        if not root or not humanoid or humanoid.Health <= 0 then
            for _, drawing in esp do drawing.Visible = false end
            return
        end
        
        local headPos = (root.CFrame * CFrame.new(0, 3, 0)).Position
        local feetPos = (root.CFrame * CFrame.new(0, -3, 0)).Position
        
        local screenHead, onScreenH = worldToScreen(headPos)
        local screenFeet, onScreenF = worldToScreen(feetPos)
        
        if not onScreenH then
            for _, drawing in esp do drawing.Visible = false end
            return
        end
        
        local boxHeight = math.abs(screenFeet.Y - screenHead.Y)
        local boxWidth = boxHeight * 0.6
        
        -- Update positions
        esp.nameTag.Position = screenHead - Vector2.new(0, 15)
        esp.nameTag.Text = string.format("%s [%d HP]", 
            targetPlayer.Name, humanoid.Health)
        
        esp.box.Position = screenHead - Vector2.new(boxWidth / 2, 0)
        esp.box.Size = Vector2.new(boxWidth, boxHeight)
        
        esp.tracer.From = Vector2.new(camera.ViewportSize.X / 2, camera.ViewportSize.Y)
        esp.tracer.To = screenFeet
        
        for _, drawing in esp do drawing.Visible = true end
    end)
    
    return { drawings = esp, connection = conn }
end
\`\`\`

§3 BILLBOARDGUI ESP (In-world UI)
\`\`\`lua
local function createBillboardESP(character, displayName)
    local head = character:WaitForChild("Head", 5)
    if not head then return end
    
    local billboard = Instance.new("BillboardGui")
    billboard.Name = "ESP_Billboard"
    billboard.Adornee = head
    billboard.Size = UDim2.new(0, 200, 0, 50)
    billboard.StudsOffset = Vector3.new(0, 3, 0)
    billboard.AlwaysOnTop = true
    billboard.MaxDistance = 500
    billboard.Parent = game.CoreGui
    
    local label = Instance.new("TextLabel")
    label.Size = UDim2.new(1, 0, 1, 0)
    label.BackgroundTransparency = 1
    label.Text = displayName
    label.TextColor3 = Color3.fromRGB(255, 255, 255)
    label.TextStrokeTransparency = 0
    label.TextStrokeColor3 = Color3.fromRGB(0, 0, 0)
    label.Font = Enum.Font.GothamBold
    label.TextSize = 14
    label.Parent = billboard
    
    return billboard
end
\`\`\`

§4 CAMERA MANIPULATION
\`\`\`lua
local camera = workspace.CurrentCamera

-- FOV Change
camera.FieldOfView = 100 -- default is 70

-- Spectate another player
local function spectate(targetPlayer)
    local char = targetPlayer.Character
    if char then
        camera.CameraSubject = char:FindFirstChildOfClass("Humanoid")
    end
end

-- Free Camera
local function freeCamera()
    camera.CameraType = Enum.CameraType.Scriptable
    -- Now control camera with CFrame directly
    camera.CFrame = CFrame.new(0, 100, 0) * CFrame.Angles(-math.pi/2, 0, 0)
end

-- Reset camera
local function resetCamera()
    camera.CameraType = Enum.CameraType.Custom
    camera.CameraSubject = Player.Character:FindFirstChildOfClass("Humanoid")
    camera.FieldOfView = 70
end
\`\`\`

§5 TWEENSERVICE ANIMATIONS
\`\`\`lua
local TweenService = game:GetService("TweenService")

-- Basic Tween
local tweenInfo = TweenInfo.new(
    0.3,                              -- Duration (seconds)
    Enum.EasingStyle.Quart,           -- Style
    Enum.EasingDirection.Out,         -- Direction
    0,                                -- RepeatCount (0 = no repeat, -1 = infinite)
    false,                            -- Reverses
    0                                 -- DelayTime
)

local tween = TweenService:Create(frame, tweenInfo, {
    Position = UDim2.new(0.5, 0, 0.5, 0),
    BackgroundTransparency = 0,
})
tween:Play()

-- Wait for completion
tween.Completed:Wait()

-- Smooth color transition
TweenService:Create(highlight, TweenInfo.new(0.5), {
    FillColor = Color3.fromRGB(0, 255, 0)
}):Play()

-- Chained tweens
local function animateIn(gui)
    gui.BackgroundTransparency = 1
    gui.Visible = true
    TweenService:Create(gui, TweenInfo.new(0.3, Enum.EasingStyle.Back), {
        BackgroundTransparency = 0,
        Size = UDim2.new(0, 400, 0, 300)
    }):Play()
end
\`\`\`` }]
  }
]
