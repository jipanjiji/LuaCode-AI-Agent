import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file game-specific-patterns.ts
 * @description Common Roblox game genre patterns: simulators, tycoons,
 * RPGs, fighting games, obby, tower defense.
 */

export const GAME_PATTERNS_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide complete specs for Game-Specific Exploit Patterns.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: GAME-SPECIFIC PATTERNS

§1 SIMULATOR GAMES (Pet Sim, Bee Swarm, etc.)
\`\`\`lua
-- Common structure: Rebirth/Prestige system
local function autoRebirth()
    local rebirthRemote = ReplicatedStorage:FindFirstChild("Rebirth")
        or ReplicatedStorage:FindFirstChild("Prestige")
    
    if rebirthRemote then
        pcall(rebirthRemote.FireServer, rebirthRemote)
    end
end

-- Pet/Egg system
local function autoHatchEgg(eggName)
    local hatchRemote = ReplicatedStorage:FindFirstChild("HatchEgg")
        or ReplicatedStorage:FindFirstChild("OpenEgg")
    
    if hatchRemote then
        pcall(hatchRemote.FireServer, hatchRemote, eggName)
    end
end

-- Auto-collect currency/items on ground
local function collectAllDrops()
    local _, root = getCharacter()
    if not root then return end
    
    local drops = workspace:FindFirstChild("Drops") or workspace:FindFirstChild("Coins")
    if not drops then return end
    
    for _, drop in drops:GetChildren() do
        local part = drop:IsA("BasePart") and drop or drop:FindFirstChildWhichIsA("BasePart")
        if part then
            firetouchinterest(root, part, 0) -- begin touch
            firetouchinterest(root, part, 1) -- end touch
        end
    end
end

-- Multiplier stacking (fire upgrade remote multiple times)
local function stackMultiplier(remote, times)
    for i = 1, times do
        pcall(remote.FireServer, remote)
        task.wait(0.1)
    end
end
\`\`\`

§2 TYCOON GAMES
\`\`\`lua
-- Auto-collect droppers
local function collectTycoonDrops(tycoonModel)
    local collector = tycoonModel:FindFirstChild("Collector")
        or tycoonModel:FindFirstChild("Conveyor")
    
    if not collector then return end
    
    -- Teleport all dropped items to collector
    local items = tycoonModel:FindFirstChild("Items") or tycoonModel:FindFirstChild("Drops")
    if items then
        for _, item in items:GetChildren() do
            if item:IsA("BasePart") then
                item.CFrame = collector.CFrame
            end
        end
    end
end

-- Auto-buy upgrades
local function autoBuyUpgrades(tycoonModel)
    for _, button in tycoonModel:GetDescendants() do
        if button:IsA("BasePart") and button.Name:find("Button") then
            local cd = button:FindFirstChildOfClass("ClickDetector")
            if cd then
                pcall(fireclickdetector, cd)
            end
        end
    end
end
\`\`\`

§3 RPG / ADVENTURE GAMES
\`\`\`lua
-- Auto-equip best gear
local function equipBest(category)
    local inventory = Player:FindFirstChild("Inventory")
    if not inventory then return end
    
    local best, bestStat = nil, 0
    for _, item in inventory:GetChildren() do
        local stat = item:FindFirstChild("Power") or item:FindFirstChild("Damage")
        if stat and stat.Value > bestStat then
            best = item
            bestStat = stat.Value
        end
    end
    
    if best then
        local equipRemote = ReplicatedStorage:FindFirstChild("EquipItem")
        if equipRemote then
            pcall(equipRemote.FireServer, equipRemote, best.Name)
        end
    end
end

-- Dungeon auto-clear pattern
local function autoDungeon()
    -- 1. Find all enemies in dungeon
    -- 2. Kill nearest first (priority: lowest HP)
    -- 3. Collect loot after room clear
    -- 4. Proceed to next room/door
    -- 5. Handle boss mechanics
end

-- Quest auto-complete
local function autoQuest()
    local questRemote = ReplicatedStorage:FindFirstChild("AcceptQuest")
        or ReplicatedStorage:FindFirstChild("ClaimQuest")
    
    -- Accept all available quests
    local questBoard = workspace:FindFirstChild("QuestBoard")
    if questBoard and questRemote then
        for _, quest in questBoard:GetChildren() do
            pcall(questRemote.FireServer, questRemote, quest.Name)
        end
    end
end
\`\`\`

§4 FIGHTING / COMBAT GAMES
\`\`\`lua
-- Hitbox expansion (visual/collision only, most AC detect this)
local function expandHitbox(size)
    local char = Player.Character
    if not char then return end
    
    for _, part in char:GetDescendants() do
        if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" then
            part.Size = part.Size * size
            part.Transparency = 0.9
            part.CanCollide = false
        end
    end
end

-- Auto-combo (fire attack sequence)
local function autoCombo(attackRemote, comboSequence, delay)
    for _, move in comboSequence do
        pcall(attackRemote.FireServer, attackRemote, move)
        task.wait(delay or 0.2)
    end
end

-- Kill aura (damage all nearby)
local function killAura(range, attackRemote)
    local _, root = getCharacter()
    if not root then return end
    
    local mobFolder = workspace:FindFirstChild("Mobs")
    if not mobFolder then return end
    
    for _, mob in mobFolder:GetChildren() do
        local mobRoot = mob:FindFirstChild("HumanoidRootPart")
        local hum = mob:FindFirstChildOfClass("Humanoid")
        if mobRoot and hum and hum.Health > 0 then
            if (root.Position - mobRoot.Position).Magnitude <= range then
                pcall(attackRemote.FireServer, attackRemote, mob)
            end
        end
    end
end
\`\`\`

§5 OBBY / PLATFORMER
\`\`\`lua
-- Skip to checkpoint
local function skipToCheckpoint(checkpointNumber)
    local checkpoints = workspace:FindFirstChild("Checkpoints")
    if not checkpoints then return end
    
    local cp = checkpoints:FindFirstChild(tostring(checkpointNumber))
        or checkpoints:FindFirstChild("Checkpoint" .. checkpointNumber)
    
    if cp then
        local _, root = getCharacter()
        if root then
            root.CFrame = cp.CFrame + Vector3.new(0, 5, 0)
        end
    end
end

-- Skip to finish
local function skipToEnd()
    local finish = workspace:FindFirstChild("Finish")
        or workspace:FindFirstChild("End")
        or workspace:FindFirstChild("Win")
    
    if finish then
        local part = finish:IsA("BasePart") and finish or finish:FindFirstChildWhichIsA("BasePart")
        if part then
            Player.Character.HumanoidRootPart.CFrame = part.CFrame + Vector3.new(0, 5, 0)
        end
    end
end
\`\`\`

§6 TOWER DEFENSE
\`\`\`lua
-- Auto-place tower
local function placeTower(towerName, position)
    local placeRemote = ReplicatedStorage:FindFirstChild("PlaceTower")
        or ReplicatedStorage:FindFirstChild("Place")
    
    if placeRemote then
        pcall(placeRemote.FireServer, placeRemote, towerName, CFrame.new(position))
    end
end

-- Auto-upgrade towers
local function upgradeTower(tower)
    local upgradeRemote = ReplicatedStorage:FindFirstChild("UpgradeTower")
        or ReplicatedStorage:FindFirstChild("Upgrade")
    
    if upgradeRemote then
        pcall(upgradeRemote.FireServer, upgradeRemote, tower)
    end
end
\`\`\`` }]
  }
]
