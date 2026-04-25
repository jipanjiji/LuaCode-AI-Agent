import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file security.ts
 * @description Deep anti-detection patterns: checkcaller, metatable spoofing,
 * __namecall hooks, rawmetatable, cloneref, anti-kick, AC bypass.
 */

export const SECURITY_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide complete specs for Security Bypass and Anti-Cheat Mitigation.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: SECURITY & ANTI-DETECTION

§1 CHECKCALLER (Mandatory in ALL hooks)
\`\`\`lua
-- checkcaller() returns true jika caller adalah EXECUTOR thread
-- WAJIB di setiap hook untuk mencegah:
-- 1. Self-looping (hook trigger hook trigger hook...)
-- 2. Anti-cheat detection (AC memanggil method untuk test)

-- Pattern: __namecall hook dengan checkcaller
local oldNamecall
oldNamecall = hookmetamethod(game, "__namecall", newcclosure(function(self, ...)
    local method = getnamecallmethod()
    
    -- SELALU check caller pertama
    if not checkcaller() then
        -- Ini dipanggil oleh game script (bukan executor)
        
        if method == "FireServer" and self.Name == "PurchaseItem" then
            -- Block atau modify game's own FireServer call
            warn("[Intercepted]", self.Name, ...)
            return -- block the call
        end
        
        if method == "Kick" then
            -- Block kick attempts
            return
        end
    end
    
    return oldNamecall(self, ...)
end))
\`\`\`

§2 PROPERTY SPOOFING (__index / __newindex)
\`\`\`lua
-- Spoof WalkSpeed/JumpPower agar AC baca nilai asli
-- tapi karakter jalan dengan kecepatan custom
local mt = getrawmetatable(game)
local oldIndex = mt.__index
local oldNewindex = mt.__newindex

local spoofedProps = {
    -- [property] = {fake_value, real_value_applied}
    WalkSpeed = {16, 100},     -- AC reads 16, actual is 100
    JumpPower = {50, 150},
}

setreadonly(mt, false)

mt.__index = newcclosure(function(self, key)
    if not checkcaller() and self:IsA("Humanoid") then
        local spoof = spoofedProps[key]
        if spoof then
            return spoof[1] -- return fake value to game scripts/AC
        end
    end
    return oldIndex(self, key)
end)

mt.__newindex = newcclosure(function(self, key, value)
    if not checkcaller() and self:IsA("Humanoid") then
        if spoofedProps[key] then
            -- Block game from resetting our modified values
            return
        end
    end
    return oldNewindex(self, key, value)
end)

setreadonly(mt, true)

-- Apply real values (executor call, bypasses our hook)
local humanoid = Player.Character:FindFirstChildOfClass("Humanoid")
humanoid.WalkSpeed = spoofedProps.WalkSpeed[2] -- sets 100
\`\`\`

§3 COMPLETE __NAMECALL HOOK TEMPLATE
\`\`\`lua
local oldNamecall
oldNamecall = hookmetamethod(game, "__namecall", newcclosure(function(self, ...)
    local method = getnamecallmethod()
    local args = {...}
    
    if checkcaller() then
        return oldNamecall(self, ...)
    end
    
    -- Block remote calls
    if (method == "FireServer" or method == "InvokeServer") then
        local remoteName = self.Name
        local remotePath = self:GetFullName()
        
        -- Block anti-cheat remotes
        if string.find(remoteName, "AC") or 
           string.find(remoteName, "Heartbeat") or
           string.find(remoteName, "Anticheat") then
            return -- drop the packet
        end
        
        -- Log all remote traffic
        print(string.format("[%s] %s(%s)", method, remotePath,
            table.concat(table.create(#args, ""), ", ")))
    end
    
    -- Block kicks
    if method == "Kick" then
        warn("[BLOCKED] Kick attempt!")
        return
    end
    
    -- Block Destroy on important objects
    if method == "Destroy" and self:IsA("LocalScript") then
        return -- prevent AC from destroying scripts
    end
    
    return oldNamecall(self, ...)
end))
\`\`\`

§4 RAWMETATABLE OPERATIONS
\`\`\`lua
-- Full rawmetatable workflow
local mt = getrawmetatable(game)

-- 1. Check if read-only
print("Read-only:", isreadonly(mt))

-- 2. Disable read-only
setreadonly(mt, false)

-- 3. Store original metamethods
local original = {
    __index = mt.__index,
    __newindex = mt.__newindex,
    __namecall = mt.__namecall,
    __tostring = mt.__tostring,
}

-- 4. Apply hooks (always wrap in newcclosure!)
mt.__index = newcclosure(function(self, key)
    -- custom logic
    return original.__index(self, key)
end)

-- 5. Re-enable read-only (stealth)
setreadonly(mt, true)

-- Restore originals (cleanup)
local function restoreMetatable()
    setreadonly(mt, false)
    mt.__index = original.__index
    mt.__newindex = original.__newindex
    mt.__namecall = original.__namecall
    setreadonly(mt, true)
end
\`\`\`

§5 CLONEREF (Safe Instance Referencing)
\`\`\`lua
-- cloneref creates a unique reference to an Instance
-- AC scripts check if an Instance ref is used by non-game code
-- cloneref makes our reference indistinguishable from a new one

-- JANGAN:
local CoreGui = game:GetService("CoreGui") -- detectable reference

-- BENAR:
local CoreGui = cloneref(game:GetService("CoreGui"))

-- Pattern: Safe service access
local function getService(name)
    return cloneref(game:GetService(name))
end

local Players = getService("Players")
local RS = getService("ReplicatedStorage")
\`\`\`

§6 ANTI-KICK / ANTI-TELEPORT
\`\`\`lua
-- Anti-Kick via hookmetamethod
local oldNamecall
oldNamecall = hookmetamethod(game, "__namecall", newcclosure(function(self, ...)
    if not checkcaller() then
        local method = getnamecallmethod()
        if method == "Kick" then return end
        if method == "TeleportToPlaceInstance" or method == "Teleport" then
            return -- block forced teleports
        end
    end
    return oldNamecall(self, ...)
end))

-- Anti-Kick via hookfunction
local Player = game.Players.LocalPlayer
local oldKick = hookfunction(Player.Kick, newcclosure(function(self, ...)
    if self == Player then
        warn("[BLOCKED] Kick attempt:", ...)
        return
    end
    return oldKick(self, ...)
end))
\`\`\`

§7 ENVIRONMENT SPOOFING
\`\`\`lua
-- Hide executor globals from game detection scripts
-- Some AC checks for executor functions in _G/shared

-- Pattern: Clean environment for game scripts
local renv = getrenv()
-- Make sure executor functions aren't visible in game env

-- Pattern: Spoof script identity
local function spoofScript()
    -- When AC checks which script is running
    local oldGetScript = hookfunction(
        getrenv().script, 
        newcclosure(function() return nil end)
    )
end

-- Pattern: Hide from getconnections() detection
-- Some AC iterates connections on events to find hooks
-- hookfunction output (C closures) are harder to detect
\`\`\`` }]
  }
]
