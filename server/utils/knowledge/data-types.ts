import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file data-types.ts
 * @description Roblox data types: Vector3, Vector2, CFrame, Color3,
 * UDim2, UDim, Ray, RaycastParams, Enum, TweenInfo, Instance.new().
 */

export const DATA_TYPES_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide complete specs for Roblox Data Types and Constructors.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: ROBLOX DATA TYPES

§1 VECTOR3
\`\`\`lua
-- Construction
local v = Vector3.new(10, 20, 30)
local v2 = Vector3.zero          -- (0, 0, 0)
local v3 = Vector3.one           -- (1, 1, 1)
local v4 = Vector3.xAxis         -- (1, 0, 0)
local v5 = Vector3.yAxis         -- (0, 1, 0)

-- Properties
v.X, v.Y, v.Z
v.Magnitude          -- length
v.Unit               -- normalized (length = 1)

-- Operations
v + v2               -- add
v - v2               -- subtract
v * 2                -- scalar multiply
v / 2                -- scalar divide
v:Dot(v2)            -- dot product
v:Cross(v2)          -- cross product
v:Lerp(v2, 0.5)      -- linear interpolation (0-1)
v:FuzzyEq(v2, 0.01)  -- approximate equality

-- Distance between two positions
local dist = (posA - posB).Magnitude

-- Direction from A to B
local dir = (posB - posA).Unit
\`\`\`

§2 CFRAME (Coordinate Frame = Position + Orientation)
\`\`\`lua
-- Construction
local cf = CFrame.new(10, 20, 30)              -- position only
local cf2 = CFrame.new(pos, lookAtPos)          -- position + look at point
local cf3 = CFrame.lookAt(pos, target)          -- modern look at
local cf4 = CFrame.lookAt(pos, target, upVec)   -- with custom up

-- Angles (radians)
local cf5 = CFrame.Angles(rx, ry, rz)           -- euler rotation
local cf6 = CFrame.fromEulerAnglesYXZ(ry, rx, rz) -- common rotation order

-- Properties
cf.Position          -- Vector3 position
cf.LookVector        -- forward direction (-Z)
cf.RightVector       -- right direction (+X)
cf.UpVector          -- up direction (+Y)
cf.X, cf.Y, cf.Z    -- position components

-- Operations
cf * cf2             -- compose (apply cf2 relative to cf)
cf * Vector3.new(0,0,-5)  -- point 5 studs in front
cf:Inverse()         -- inverse transform
cf:Lerp(cf2, 0.5)    -- smooth interpolation
cf + Vector3.new(0,5,0)   -- translate

-- Common patterns
-- Teleport in front of target
root.CFrame = target.CFrame * CFrame.new(0, 0, -5)

-- Teleport behind target
root.CFrame = target.CFrame * CFrame.new(0, 0, 5)

-- Teleport above target
root.CFrame = target.CFrame * CFrame.new(0, 10, 0)

-- Face a direction
root.CFrame = CFrame.lookAt(root.Position, targetPos)

-- Rotate character
root.CFrame = root.CFrame * CFrame.Angles(0, math.rad(90), 0)

-- GetComponents
local x,y,z, r00,r01,r02, r10,r11,r12, r20,r21,r22 = cf:GetComponents()
\`\`\`

§3 COLOR3
\`\`\`lua
local c = Color3.fromRGB(255, 0, 0)      -- red (0-255 integers)
local c2 = Color3.fromHSV(0, 1, 1)       -- red (H=0-1, S=0-1, V=0-1)
local c3 = Color3.new(1, 0, 0)           -- red (0-1 floats)

c.R, c.G, c.B                            -- 0-1 float components
c:Lerp(c2, 0.5)                          -- blend colors

-- HSV conversion
local h, s, v = Color3.toHSV(c)

-- Common colors
Color3.fromRGB(255, 0, 0)     -- Red
Color3.fromRGB(0, 255, 0)     -- Green
Color3.fromRGB(0, 0, 255)     -- Blue
Color3.fromRGB(255, 255, 255) -- White
Color3.fromRGB(0, 0, 0)       -- Black
Color3.fromRGB(255, 255, 0)   -- Yellow
Color3.fromRGB(128, 0, 255)   -- Purple
\`\`\`

§4 UDIM2 & UDIM (GUI Positioning/Sizing)
\`\`\`lua
-- UDim2 = 2D (X, Y), each has Scale + Offset
local size = UDim2.new(0, 400, 0, 300)       -- 400x300 pixels
local size2 = UDim2.fromOffset(400, 300)      -- same, shorter syntax
local size3 = UDim2.fromScale(0.5, 0.5)       -- 50% of parent
local size4 = UDim2.new(0.5, -200, 0.5, -150) -- centered (50% - half size)

-- Scale = fraction of parent (0-1)
-- Offset = absolute pixels

-- Center a GUI element
frame.AnchorPoint = Vector2.new(0.5, 0.5)
frame.Position = UDim2.fromScale(0.5, 0.5)

-- Full width, fixed height
frame.Size = UDim2.new(1, 0, 0, 50)

-- UDim (single axis)
local cornerRadius = UDim.new(0, 8) -- 8 pixel radius
\`\`\`

§5 RAYCAST (Modern)
\`\`\`lua
local params = RaycastParams.new()
params.FilterType = Enum.RaycastFilterType.Exclude
params.FilterDescendantsInstances = {Player.Character}
params.RespectCanCollide = true
params.IgnoreWater = true

local origin = root.Position
local direction = root.CFrame.LookVector * 100

local result = workspace:Raycast(origin, direction, params)
if result then
    result.Instance   -- part hit
    result.Position   -- Vector3 hit point
    result.Normal     -- Vector3 surface normal
    result.Material   -- Enum.Material
    result.Distance   -- number
end
\`\`\`

§6 ENUM (Common Enums)
\`\`\`lua
-- KeyCode
Enum.KeyCode.W, Enum.KeyCode.A, Enum.KeyCode.S, Enum.KeyCode.D
Enum.KeyCode.Space, Enum.KeyCode.LeftShift, Enum.KeyCode.LeftControl
Enum.KeyCode.E, Enum.KeyCode.F, Enum.KeyCode.Q, Enum.KeyCode.R

-- UserInputType
Enum.UserInputType.MouseButton1  -- left click
Enum.UserInputType.MouseButton2  -- right click
Enum.UserInputType.Touch

-- HumanoidStateType
Enum.HumanoidStateType.Jumping
Enum.HumanoidStateType.Freefall
Enum.HumanoidStateType.Running
Enum.HumanoidStateType.Physics
Enum.HumanoidStateType.Dead

-- EasingStyle (for tweens)
Enum.EasingStyle.Linear, Enum.EasingStyle.Quad, Enum.EasingStyle.Cubic
Enum.EasingStyle.Quart, Enum.EasingStyle.Sine, Enum.EasingStyle.Back
Enum.EasingStyle.Bounce, Enum.EasingStyle.Elastic, Enum.EasingStyle.Exponential

-- Material
Enum.Material.Plastic, Enum.Material.SmoothPlastic
Enum.Material.Neon, Enum.Material.Glass, Enum.Material.ForceField
\`\`\`

§7 INSTANCE CREATION
\`\`\`lua
-- Pattern: Create and configure, THEN parent (most efficient)
local part = Instance.new("Part")
part.Name = "MyPart"
part.Size = Vector3.new(4, 1, 4)
part.Position = Vector3.new(0, 10, 0)
part.Anchored = true
part.CanCollide = false
part.Color = Color3.fromRGB(255, 0, 0)
part.Material = Enum.Material.Neon
part.Transparency = 0.5
part.Parent = workspace -- set parent LAST for performance

-- JANGAN: Instance.new("Part", workspace) -- deprecated 2nd arg
-- BENAR:  set Parent last after all properties

-- Common instance types
Instance.new("Part")
Instance.new("Frame")
Instance.new("TextLabel")
Instance.new("TextButton")
Instance.new("TextBox")
Instance.new("ScreenGui")
Instance.new("BillboardGui")
Instance.new("Highlight")
Instance.new("UICorner")
Instance.new("UIStroke")
Instance.new("UIListLayout")
Instance.new("UIGridLayout")
Instance.new("UIPadding")
Instance.new("RemoteEvent")
Instance.new("BindableEvent")
Instance.new("Sound")
\`\`\`` }]
  }
]
