import type { GeminiMessage } from '../ai-knowledge'

/**
 * @file movement.ts
 * @description Advanced Technical Specification for Roblox Character Movement,
 * Physics manipulation, and Camera-aligned flight dynamics.
 */

export const MOVEMENT_KNOWLEDGE: GeminiMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Expose the technical specification and expert implementation for Advanced Movement Systems.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: MOVEMENT & PHYSICS
Spesifikasi untuk manipulasi pergerakan karakter tingkat lanjut:

EXPERT IMPLEMENTATION: SMOOTH CAMERA-ALIGNED FLIGHT
Standard: High-performance, anti-cheat resistant, smooth lerping.

\`\`\`lua
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")

local Player = Players.LocalPlayer
local Camera = workspace.CurrentCamera

local FlyConfig = {
    Speed = 50,
    Smoothness = 0.15,
    VerticalSpeed = 40
}

local Velocity = Vector3.new(0, 0, 0)
local FlightLoop

local function GetDirection()
    local dir = Vector3.new(0, 0, 0)
    if UserInputService:IsKeyDown(Enum.KeyCode.W) then dir += Camera.CFrame.LookVector end
    if UserInputService:IsKeyDown(Enum.KeyCode.S) then dir -= Camera.CFrame.LookVector end
    if UserInputService:IsKeyDown(Enum.KeyCode.D) then dir += Camera.CFrame.RightVector end
    if UserInputService:IsKeyDown(Enum.KeyCode.A) then dir -= Camera.CFrame.RightVector end
    if UserInputService:IsKeyDown(Enum.KeyCode.Space) then dir += Vector3.new(0, 1, 0) end
    if UserInputService:IsKeyDown(Enum.KeyCode.LeftControl) then dir -= Vector3.new(0, 1, 0) end
    return dir.Unit
end

local function ToggleFly(state)
    if FlightLoop then FlightLoop:Disconnect() end
    if not state then return end
    
    local Character = Player.Character
    local Root = Character and Character:FindFirstChild("HumanoidRootPart")
    if not Root then return end
    
    FlightLoop = RunService.Heartbeat:Connect(function(dt)
        local moveDir = GetDirection()
        -- Handle NaN Unit for zero-vector
        local targetVel = moveDir ~= moveDir and Vector3.new(0,0,0) or moveDir * FlyConfig.Speed
        
        Velocity = Velocity:Lerp(targetVel, FlyConfig.Smoothness)
        Root.Velocity = Vector3.new(0, 0, 0) -- Kill gravity/inertia
        Root.CFrame = Root.CFrame + (Velocity * dt)
    end)
end
\`\`\`
` }]
  }
]
