import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file movement.ts
 * @description Complete Technical Specification for Roblox Character Movement
 * manipulation including Flight, Speed, Noclip, Teleportation, Infinite Jump,
 * and BodyMover physics objects.
 */

export const MOVEMENT_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide the complete technical specification for Advanced Movement Systems in Roblox.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: MOVEMENT & PHYSICS MANIPULATION

═══════════════════════════════════════════
§1  FLIGHT SYSTEM (Camera-Aligned, Smooth)
═══════════════════════════════════════════

\`\`\`lua
-- METHOD 1: CFrame-based Flight (Recommended, most compatible)
local RunService = game:GetService("RunService")
local UIS = game:GetService("UserInputService")
local Players = game:GetService("Players")
local Player = Players.LocalPlayer
local Camera = workspace.CurrentCamera

local FlyConfig = {
    Speed = 80,
    Smoothness = 0.15,  -- Lower = smoother (0.05-0.3)
}

local velocity = Vector3.zero
local flyConnection = nil
local isFlying = false

local function getInputDirection(): Vector3
    local dir = Vector3.zero
    if UIS:IsKeyDown(Enum.KeyCode.W) then dir += Camera.CFrame.LookVector end
    if UIS:IsKeyDown(Enum.KeyCode.S) then dir -= Camera.CFrame.LookVector end
    if UIS:IsKeyDown(Enum.KeyCode.D) then dir += Camera.CFrame.RightVector end
    if UIS:IsKeyDown(Enum.KeyCode.A) then dir -= Camera.CFrame.RightVector end
    if UIS:IsKeyDown(Enum.KeyCode.Space) then dir += Vector3.yAxis end
    if UIS:IsKeyDown(Enum.KeyCode.LeftShift) then dir -= Vector3.yAxis end
    if dir.Magnitude > 0 then
        return dir.Unit
    end
    return Vector3.zero
end

local function startFly()
    if isFlying then return end
    isFlying = true
    
    local char = Player.Character
    local root = char and char:FindFirstChild("HumanoidRootPart")
    local humanoid = char and char:FindFirstChildOfClass("Humanoid")
    if not root or not humanoid then return end
    
    -- Disable default physics
    local bodyVel = Instance.new("BodyVelocity")
    bodyVel.MaxForce = Vector3.new(math.huge, math.huge, math.huge)
    bodyVel.Velocity = Vector3.zero
    bodyVel.Parent = root
    
    local bodyGyro = Instance.new("BodyGyro")
    bodyGyro.MaxTorque = Vector3.new(math.huge, math.huge, math.huge)
    bodyGyro.D = 200
    bodyGyro.P = 10000
    bodyGyro.Parent = root
    
    flyConnection = RunService.Heartbeat:Connect(function(dt)
        if not root or not root.Parent then
            stopFly()
            return
        end
        local moveDir = getInputDirection()
        local targetVel = moveDir * FlyConfig.Speed
        velocity = velocity:Lerp(targetVel, FlyConfig.Smoothness)
        bodyVel.Velocity = velocity
        bodyGyro.CFrame = Camera.CFrame
    end)
end

local function stopFly()
    isFlying = false
    if flyConnection then
        flyConnection:Disconnect()
        flyConnection = nil
    end
    local char = Player.Character
    local root = char and char:FindFirstChild("HumanoidRootPart")
    if root then
        local bv = root:FindFirstChildOfClass("BodyVelocity")
        local bg = root:FindFirstChildOfClass("BodyGyro")
        if bv then bv:Destroy() end
        if bg then bg:Destroy() end
    end
    velocity = Vector3.zero
end

-- METHOD 2: Pure CFrame Flight (no BodyMovers, simpler)
local function simpleFly(speed)
    local root = Player.Character and Player.Character:FindFirstChild("HumanoidRootPart")
    if not root then return end
    
    flyConnection = RunService.Heartbeat:Connect(function(dt)
        local moveDir = getInputDirection()
        root.Velocity = Vector3.zero  -- kill gravity
        if moveDir.Magnitude > 0 then
            root.CFrame = root.CFrame + moveDir * speed * dt
        end
    end)
end
\`\`\`

═══════════════════════════════════════════
§2  SPEED MODIFICATION
═══════════════════════════════════════════

\`\`\`lua
-- METHOD 1: Direct WalkSpeed (easily detected)
local humanoid = Player.Character:FindFirstChildOfClass("Humanoid")
humanoid.WalkSpeed = 100

-- METHOD 2: CFrame Teleport Speed (bypasses most AC)
-- Moves character forward each frame, stacks with WalkSpeed
local speedBoost = 2 -- multiplier
RunService.Heartbeat:Connect(function(dt)
    local root = Player.Character and Player.Character:FindFirstChild("HumanoidRootPart")
    local humanoid = Player.Character and Player.Character:FindFirstChildOfClass("Humanoid")
    if root and humanoid and humanoid.MoveDirection.Magnitude > 0 then
        root.CFrame = root.CFrame + humanoid.MoveDirection * speedBoost
    end
end)

-- METHOD 3: Metatable Spoofing (stealthy, returns fake WalkSpeed to AC)
-- See security.ts for full __index/__newindex spoofing pattern
\`\`\`

═══════════════════════════════════════════
§3  NOCLIP
═══════════════════════════════════════════

\`\`\`lua
-- METHOD 1: CanCollide Loop (simple, reliable)
local noclipConnection
local function toggleNoclip(state)
    if noclipConnection then
        noclipConnection:Disconnect()
        noclipConnection = nil
    end
    if not state then return end
    
    noclipConnection = RunService.Stepped:Connect(function()
        local char = Player.Character
        if not char then return end
        for _, part in char:GetDescendants() do
            if part:IsA("BasePart") then
                part.CanCollide = false
            end
        end
    end)
end

-- METHOD 2: Humanoid StateType (alternative)
RunService.Stepped:Connect(function()
    local humanoid = Player.Character and Player.Character:FindFirstChildOfClass("Humanoid")
    if humanoid then
        humanoid:ChangeState(Enum.HumanoidStateType.StrafingNoPhysics)
    end
end)
\`\`\`

═══════════════════════════════════════════
§4  TELEPORTATION
═══════════════════════════════════════════

\`\`\`lua
-- Instant Teleport
local function teleportTo(position: Vector3)
    local root = Player.Character and Player.Character:FindFirstChild("HumanoidRootPart")
    if root then
        root.CFrame = CFrame.new(position)
    end
end

-- Teleport to player
local function teleportToPlayer(playerName: string)
    local target = game.Players:FindFirstChild(playerName)
    if target and target.Character then
        local targetRoot = target.Character:FindFirstChild("HumanoidRootPart")
        if targetRoot then
            teleportTo(targetRoot.Position + Vector3.new(0, 3, 0))
        end
    end
end

-- Smooth/Lerp Teleport (less detectable)
local function smoothTeleport(target: Vector3, duration: number)
    local root = Player.Character:FindFirstChild("HumanoidRootPart")
    if not root then return end
    
    local startCF = root.CFrame
    local endCF = CFrame.new(target)
    local elapsed = 0
    
    local conn
    conn = RunService.Heartbeat:Connect(function(dt)
        elapsed += dt
        local alpha = math.clamp(elapsed / duration, 0, 1)
        root.CFrame = startCF:Lerp(endCF, alpha)
        if alpha >= 1 then
            conn:Disconnect()
        end
    end)
end

-- Waypoint Teleport (teleport through multiple points)
local function waypointTeleport(waypoints: {Vector3}, delayBetween: number)
    for _, point in waypoints do
        teleportTo(point)
        task.wait(delayBetween or 0.5)
    end
end

-- CFrame Offset Teleport (for farming, move to offset from target)
local function teleportBehind(targetPart: BasePart, offset: number)
    local cf = targetPart.CFrame
    local behindPos = cf * CFrame.new(0, 0, offset) -- positive Z = behind
    Player.Character.HumanoidRootPart.CFrame = behindPos
end
\`\`\`

═══════════════════════════════════════════
§5  INFINITE JUMP
═══════════════════════════════════════════

\`\`\`lua
-- Infinite Jump via JumpRequest
local infJumpConnection
local function toggleInfJump(state)
    if infJumpConnection then
        infJumpConnection:Disconnect()
        infJumpConnection = nil
    end
    if not state then return end
    
    local UIS = game:GetService("UserInputService")
    infJumpConnection = UIS.JumpRequest:Connect(function()
        local humanoid = Player.Character and Player.Character:FindFirstChildOfClass("Humanoid")
        if humanoid then
            humanoid:ChangeState(Enum.HumanoidStateType.Jumping)
        end
    end)
end
\`\`\`

═══════════════════════════════════════════
§6  BODY MOVER OBJECTS
═══════════════════════════════════════════

\`\`\`lua
-- BodyVelocity: Apply constant velocity
local bv = Instance.new("BodyVelocity")
bv.MaxForce = Vector3.new(math.huge, math.huge, math.huge)
bv.Velocity = Vector3.new(0, 50, 0) -- upward at 50 studs/s
bv.P = 1250                          -- power (responsiveness)
bv.Parent = root

-- BodyGyro: Maintain orientation
local bg = Instance.new("BodyGyro")
bg.MaxTorque = Vector3.new(math.huge, math.huge, math.huge)
bg.D = 200      -- dampening
bg.P = 10000    -- power  
bg.CFrame = CFrame.lookAt(root.Position, target.Position)
bg.Parent = root

-- BodyPosition: Move to target position
local bp = Instance.new("BodyPosition")
bp.MaxForce = Vector3.new(math.huge, math.huge, math.huge)
bp.D = 1250     -- dampening (higher = less oscillation)
bp.P = 10000    -- power (higher = faster approach)
bp.Position = Vector3.new(0, 100, 0) -- target position
bp.Parent = root

-- BodyForce: Apply constant force (affected by mass)
local bf = Instance.new("BodyForce")
-- Anti-gravity force:
bf.Force = Vector3.new(0, workspace.Gravity * root.AssemblyMass, 0)
bf.Parent = root

-- LinearVelocity (Modern replacement for BodyVelocity)
local att = Instance.new("Attachment")
att.Parent = root
local lv = Instance.new("LinearVelocity")
lv.MaxForce = math.huge
lv.VelocityConstraintMode = Enum.VelocityConstraintMode.Vector
lv.VectorVelocity = Vector3.new(0, 50, 0)
lv.Attachment0 = att
lv.Parent = root
\`\`\`

═══════════════════════════════════════════
§7  ANTI-VOID / ANTI-FALL
═══════════════════════════════════════════

\`\`\`lua
-- Prevent falling into void
local safePosition = Vector3.new(0, 100, 0) -- spawn point

RunService.Heartbeat:Connect(function()
    local root = Player.Character and Player.Character:FindFirstChild("HumanoidRootPart")
    if root and root.Position.Y < workspace.FallenPartsDestroyHeight + 50 then
        root.CFrame = CFrame.new(safePosition)
        root.Velocity = Vector3.zero
    end
end)

-- God Mode (prevent death)
local function godMode()
    local char = Player.Character
    local humanoid = char and char:FindFirstChildOfClass("Humanoid")
    if humanoid then
        humanoid.MaxHealth = math.huge
        humanoid.Health = math.huge
    end
end
\`\`\`` }]
  }
]
