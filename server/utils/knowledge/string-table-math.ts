import type { KnowledgeMessage } from '../ai-knowledge'

/**
 * @file string-table-math.ts
 * @description Luau standard library: string, table, math, buffer,
 * string interpolation, iterators, and varargs.
 */

export const STRING_TABLE_MATH_KNOWLEDGE: KnowledgeMessage[] = [
  {
    role: 'user',
    parts: [{ text: 'Provide complete specs for Luau String, Table, and Math libraries.' }]
  },
  {
    role: 'model',
    parts: [{ text: `REFERENSI TEKNIS: LUAU STANDARD LIBRARIES

§1 STRING LIBRARY
\`\`\`lua
-- string.find(s, pattern, init, plain)
local start, finish = string.find("Hello World", "World") --> 7, 11
local start = string.find("abc", "xyz") --> nil

-- string.match(s, pattern) - returns captures
local num = string.match("Level 42", "%d+") --> "42"
local a, b = string.match("2024-04-25", "(%d+)-(%d+)-(%d+)") --> "2024", "04", "25"

-- string.gmatch(s, pattern) - iterator for ALL matches
for word in string.gmatch("hello world foo", "%w+") do
    print(word) --> "hello", "world", "foo"
end

-- string.gsub(s, pattern, repl, n) - replace
local result = string.gsub("hello world", "world", "lua") --> "hello lua"
local result, count = string.gsub("aaa", "a", "b") --> "bbb", 3

-- string.format (printf-style)
string.format("Name: %s, HP: %d/%d (%.1f%%)", "Player", 75, 100, 75.0)
-- "Name: Player, HP: 75/100 (75.0%)"
-- %s = string, %d = integer, %f = float, %x = hex, %% = literal %

-- string.sub(s, i, j) - substring
string.sub("Hello", 1, 3) --> "Hel"
string.sub("Hello", -3)   --> "llo"

-- string.split(s, separator) - LUAU ONLY (not in standard Lua)
local parts = string.split("a,b,c", ",") --> {"a", "b", "c"}

-- string.rep(s, n) - repeat
string.rep("ab", 3) --> "ababab"

-- string.reverse, string.upper, string.lower
string.upper("hello") --> "HELLO"
string.lower("HELLO") --> "hello"
string.reverse("abc") --> "cba"

-- string.byte / string.char
string.byte("A")      --> 65
string.char(65)        --> "A"

-- string.len
string.len("hello")    --> 5
#"hello"               --> 5 (operator shortcut)

-- LUAU STRING INTERPOLATION (backtick syntax)
local name = "Player"
local hp = 100
local msg = \`{name} has {hp} HP\`  --> "Player has 100 HP"
local calc = \`Result: {2 + 3}\`    --> "Result: 5"

-- PATTERN CLASSES (Luau uses Lua patterns, NOT regex)
-- %d = digit, %a = letter, %w = alphanumeric, %s = whitespace
-- %l = lowercase, %u = uppercase, %p = punctuation
-- . = any char, * = 0+, + = 1+, - = 0+ (lazy), ? = 0 or 1
-- [abc] = set, [^abc] = not in set, %b() = balanced match
-- ^ = start anchor, $ = end anchor

-- Extract number from string
string.match("Speed: 150", "(%d+)") --> "150"
tonumber(string.match("Speed: 150", "(%d+)")) --> 150
\`\`\`

§2 TABLE LIBRARY
\`\`\`lua
-- table.insert / table.remove
local t = {1, 2, 3}
table.insert(t, 4)          --> {1, 2, 3, 4}
table.insert(t, 2, 99)      --> {1, 99, 2, 3, 4}
table.remove(t, 2)           --> removes index 2, shifts down

-- table.find (LUAU ONLY)
local idx = table.find(t, 3) --> index of value 3, or nil

-- table.sort
table.sort(t)                         -- ascending
table.sort(t, function(a, b) return a > b end) -- descending

-- table.concat
table.concat({"a", "b", "c"}, ", ") --> "a, b, c"

-- table.create (LUAU ONLY) - preallocate
local arr = table.create(100, 0)     -- 100 elements, all 0

-- table.clone (LUAU ONLY) - shallow copy
local copy = table.clone(original)

-- table.freeze (LUAU ONLY) - make immutable
local config = table.freeze({speed = 50, range = 100})
-- config.speed = 60  --> ERROR: attempt to modify frozen table

-- table.isfrozen (LUAU ONLY)
table.isfrozen(config) --> true

-- table.move(src, from, to, dest_start, dest_table?)
table.move(src, 1, #src, #dest + 1, dest) -- append src to dest

-- table.clear - removes all elements
table.clear(t) -- t is now empty, but same reference

-- table.pack / table.unpack
local packed = table.pack(1, 2, 3)    --> {1, 2, 3, n = 3}
local a, b, c = table.unpack({1, 2, 3}) -- a=1, b=2, c=3
local a, b = table.unpack({1, 2, 3}, 1, 2) -- partial unpack

-- select (for varargs)
local function foo(...)
    print(select("#", ...))   -- number of args
    print(select(2, ...))     -- all args from index 2 onward
end

-- Iteration
-- pairs() for dictionary/mixed tables (unordered)
-- ipairs() for array portion only (ordered, stops at nil)
-- generalized for loop (LUAU, fastest):
for key, value in someTable do -- equivalent to pairs()
    print(key, value)
end
for i, v in {10, 20, 30} do -- equivalent to ipairs()
    print(i, v)
end
\`\`\`

§3 MATH LIBRARY
\`\`\`lua
-- math.clamp (LUAU ONLY)
math.clamp(value, min, max) -- clamps value between min and max

-- Common math functions
math.floor(3.7)    --> 3
math.ceil(3.2)     --> 4
math.round(3.5)    --> 4 (LUAU ONLY)
math.abs(-5)       --> 5
math.sqrt(16)      --> 4
math.max(1, 5, 3)  --> 5
math.min(1, 5, 3)  --> 1

-- Trigonometry (radians)
math.sin(x), math.cos(x), math.tan(x)
math.asin(x), math.acos(x), math.atan2(y, x)

-- Conversion
math.rad(180)      --> pi (degrees to radians)
math.deg(math.pi)  --> 180 (radians to degrees)

-- Constants
math.pi            --> 3.14159...
math.huge          --> infinity
-math.huge         --> negative infinity

-- Random
math.random()        --> 0-1 float
math.random(1, 100)  --> 1-100 integer
math.randomseed(tick()) -- seed (do once)

-- Better random (LUAU)
local rng = Random.new()
rng:NextNumber()             --> 0-1 float
rng:NextNumber(5, 10)        --> 5-10 float
rng:NextInteger(1, 100)      --> 1-100 integer

-- Perlin noise
math.noise(x)                --> -0.5 to 0.5
math.noise(x, y)             --> 2D noise
math.noise(x, y, z)          --> 3D noise

-- Manual Lerp
local function lerp(a, b, t)
    return a + (b - a) * t
end

-- Exponential smoothing (framerate independent)
local function expSmooth(current, target, speed, dt)
    return current + (target - current) * (1 - math.exp(-speed * dt))
end

-- Map value from one range to another
local function map(value, inMin, inMax, outMin, outMax)
    return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin)
end
\`\`\`` }]
  }
]
