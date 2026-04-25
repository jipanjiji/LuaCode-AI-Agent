/**
 * @file knowledge-router.ts
 * @description Smart Knowledge Routing — analyzes the user's message and
 * returns only the relevant knowledge modules instead of ALL 19 files.
 * 
 * This dramatically reduces token count per request:
 * - Before: ~15,000+ tokens (ALL knowledge, every request)
 * - After:  ~2,000-5,000 tokens (only relevant, per request)
 */

import type { KnowledgeMessage } from './ai-knowledge'

// ── Import ALL knowledge modules ──
import { LUAU_CORE_KNOWLEDGE } from './knowledge/luau-core'
import { CUSTOM_ENV_KNOWLEDGE } from './knowledge/custom-env'
import { REMOTE_UTILS_KNOWLEDGE } from './knowledge/remote-utils'
import { UI_RENDERER_KNOWLEDGE } from './knowledge/ui-renderer'
import { ROBLOX_SERVICES_KNOWLEDGE } from './knowledge/roblox-services'
import { DATA_TYPES_KNOWLEDGE } from './knowledge/data-types'
import { STRING_TABLE_MATH_KNOWLEDGE } from './knowledge/string-table-math'
import { ENGINE_KNOWLEDGE } from './knowledge/engine'
import { MOVEMENT_KNOWLEDGE } from './knowledge/movement'
import { VISUALS_KNOWLEDGE } from './knowledge/visuals'
import { SECURITY_KNOWLEDGE } from './knowledge/security'
import { NETWORKING_ADVANCED_KNOWLEDGE } from './knowledge/networking-advanced'
import { SAFETY_KNOWLEDGE } from './knowledge/safety'
import { AUTOFARM_KNOWLEDGE } from './knowledge/autofarm-architecture'
import { GAME_PATTERNS_KNOWLEDGE } from './knowledge/game-specific-patterns'
import { STRATEGIES_KNOWLEDGE } from './knowledge/strategies'
import { PATTERNS_KNOWLEDGE } from './knowledge/patterns'
import { LIBRARIES_KNOWLEDGE } from './knowledge/libraries'
import { FILESYSTEM_KNOWLEDGE } from './knowledge/filesystem-persistence'

// ── Knowledge Module Registry ──
// Each module has keywords that trigger its inclusion

interface KnowledgeModule {
  name: string
  keywords: string[]
  messages: KnowledgeMessage[]
  /** If true, always included regardless of keywords */
  core?: boolean
  /** Priority: lower = included first when there's a tie. Default = 10 */
  priority?: number
}

/**
 * Normalize a KnowledgeMessage or KnowledgeMessage[] into a flat array
 */
function normalize(input: KnowledgeMessage | KnowledgeMessage[]): KnowledgeMessage[] {
  return Array.isArray(input) ? input : [input]
}

const KNOWLEDGE_MODULES: KnowledgeModule[] = [
  // ── CORE (always included, minimal) ──
  {
    name: 'safety',
    keywords: [],
    messages: normalize(SAFETY_KNOWLEDGE),
    core: true,
    priority: 1,
  },

  // ── DOMAIN-SPECIFIC (included by keyword match) ──
  {
    name: 'movement',
    keywords: [
      'fly', 'flight', 'terbang', 'speed', 'walkspeed', 'noclip', 'clip',
      'teleport', 'tp', 'jump', 'infinite jump', 'inf jump',
      'velocity', 'bodyvelocity', 'bodygyro', 'bodyposition', 'bodyforce',
      'anti void', 'anti fall', 'god mode', 'godmode',
      'movement', 'move', 'gerak', 'jalan', 'lari',
    ],
    messages: normalize(MOVEMENT_KNOWLEDGE),
    priority: 5,
  },
  {
    name: 'visuals',
    keywords: [
      'esp', 'highlight', 'chams', 'wallhack', 'xray',
      'drawing', 'draw', 'overlay', 'tracer', 'box esp', 'name tag',
      'fov', 'aimbot', 'aim',
      'camera', 'freecam', 'spectate', 'fov',
      'tween', 'tweenservice', 'animate', 'animation', 'animasi',
      'billboard', 'billboardgui',
      'visual', 'render',
    ],
    messages: normalize(VISUALS_KNOWLEDGE),
    priority: 5,
  },
  {
    name: 'security',
    keywords: [
      'anticheat', 'anti cheat', 'anti-cheat', 'ac bypass', 'bypass',
      'checkcaller', 'spoof', 'spoofing',
      'metatable', 'rawmetatable', 'getrawmetatable', 'setreadonly',
      'hook', 'hookmetamethod', 'hookfunction', '__namecall', '__index', '__newindex',
      'anti kick', 'anti-kick', 'antikick',
      'cloneref', 'newcclosure',
      'stealth', 'undetect', 'detection',
    ],
    messages: normalize(SECURITY_KNOWLEDGE),
    priority: 5,
  },
  {
    name: 'remote-utils',
    keywords: [
      'remote', 'remoteevent', 'remotefunction',
      'fireserver', 'invokeserver',
      'intercept', 'spy', 'remote spy', 'log remote',
      'replay', 'packet', 'network',
    ],
    messages: normalize(REMOTE_UTILS_KNOWLEDGE),
    priority: 5,
  },
  {
    name: 'networking',
    keywords: [
      'http', 'request', 'api', 'fetch', 'get', 'post',
      'webhook', 'discord', 'discord webhook',
      'onclientevent', 'server to client',
      'queue', 'rate limit', 'throttle',
      'json', 'jsonencode', 'jsondecode',
    ],
    messages: normalize(NETWORKING_ADVANCED_KNOWLEDGE),
    priority: 6,
  },
  {
    name: 'autofarm',
    keywords: [
      'auto farm', 'autofarm', 'auto-farm', 'farm',
      'auto attack', 'auto kill', 'kill aura',
      'auto collect', 'auto loot', 'loot',
      'anti afk', 'antiafk', 'anti-afk',
      'target', 'nearest', 'nearest enemy',
      'auto equip', 'equip best',
      'grind', 'grinding', 'bot',
    ],
    messages: normalize(AUTOFARM_KNOWLEDGE),
    priority: 5,
  },
  {
    name: 'game-patterns',
    keywords: [
      'simulator', 'sim', 'tycoon',
      'rpg', 'adventure', 'dungeon', 'quest',
      'fighting', 'combat', 'pvp', 'hitbox',
      'obby', 'checkpoint', 'platformer',
      'tower defense', 'td',
      'rebirth', 'prestige', 'pet', 'egg', 'hatch',
      'combo', 'skill',
    ],
    messages: normalize(GAME_PATTERNS_KNOWLEDGE),
    priority: 7,
  },
  {
    name: 'libraries',
    keywords: [
      'ui library', 'ui lib', 'gui library',
      'orion', 'rayfield', 'fluent', 'kavo', 'morten',
      'window', 'tab', 'toggle', 'slider', 'dropdown', 'keybind', 'textbox',
      'notification', 'notify',
      'createwindow', 'makewindow', 'newtab',
      'hub', 'script hub',
    ],
    messages: normalize(LIBRARIES_KNOWLEDGE),
    priority: 6,
  },
  {
    name: 'ui-renderer',
    keywords: [
      'custom ui', 'custom gui', 'screengui', 'coregui',
      'frame', 'textlabel', 'textbutton', 'textbox',
      'drag', 'draggable', 'makeDraggable',
      'dark theme', 'theme',
      'uicorner', 'uistroke', 'uilistlayout',
    ],
    messages: normalize(UI_RENDERER_KNOWLEDGE),
    priority: 7,
  },
  {
    name: 'engine',
    keywords: [
      'task.spawn', 'task.wait', 'task.delay', 'task.defer', 'task.cancel',
      'runservice', 'heartbeat', 'renderstepped', 'stepped',
      'getgc', 'filtergc', 'getconstants', 'setconstant', 'getinfo',
      'coroutine', 'yield', 'resume', 'wrap',
      'type annotation', 'typeof', 'type system',
      'scheduler', 'event loop',
    ],
    messages: normalize(ENGINE_KNOWLEDGE),
    priority: 6,
  },
  {
    name: 'custom-env',
    keywords: [
      'getgenv', 'getrenv', 'getsenv',
      'setthreadidentity', 'getthreadidentity', 'identity',
      'hookfunction', 'hookmetamethod',
      'iscclosure', 'islclosure', 'newcclosure',
      'getupvalue', 'setupvalue', 'getupvalues', 'upvalue',
      'loadstring', 'executor', 'environment',
    ],
    messages: normalize(CUSTOM_ENV_KNOWLEDGE),
    priority: 6,
  },
  {
    name: 'luau-core',
    keywords: [
      'metatable', 'metamethod', '__index', '__newindex', '__call',
      'closure', 'upvalue', 'proto', 'bytecode',
      'userdata', 'thread', 'luavalue',
      'lua type', 'luau type',
    ],
    messages: normalize(LUAU_CORE_KNOWLEDGE),
    priority: 8,
  },
  {
    name: 'roblox-services',
    keywords: [
      'service', 'getservice',
      'players', 'workspace', 'replicatedstorage',
      'userinputservice', 'uis', 'inputbegan',
      'tweenservice', 'tweeninfo',
      'httpservice', 'lighting', 'fullbright',
      'marketplace', 'gamepass', 'devproduct',
      'soundservice', 'sound',
      'raycast', 'raycasting',
    ],
    messages: normalize(ROBLOX_SERVICES_KNOWLEDGE),
    priority: 7,
  },
  {
    name: 'data-types',
    keywords: [
      'vector3', 'vector2', 'cframe',
      'color3', 'fromrgb', 'fromhsv',
      'udim2', 'udim', 'fromoffset', 'fromscale',
      'ray', 'raycastparams',
      'enum', 'keycode', 'easingstyle',
      'instance.new', 'instance new',
      'numberrange', 'numbersequence', 'colorsequence',
    ],
    messages: normalize(DATA_TYPES_KNOWLEDGE),
    priority: 7,
  },
  {
    name: 'string-table-math',
    keywords: [
      'string.find', 'string.match', 'string.gsub', 'string.format',
      'string.split', 'string.sub', 'pattern',
      'table.find', 'table.sort', 'table.clone', 'table.freeze',
      'table.insert', 'table.remove', 'table.concat', 'table.create',
      'math.clamp', 'math.noise', 'math.random', 'random.new',
      'lerp', 'interpolation',
      'ipairs', 'pairs', 'iterator',
      'string interpolation', 'backtick',
    ],
    messages: normalize(STRING_TABLE_MATH_KNOWLEDGE),
    priority: 8,
  },
  {
    name: 'patterns',
    keywords: [
      'oop', 'object oriented', 'class', 'inheritance', 'metatables',
      'maid', 'janitor', 'cleanup', 'connection tracker',
      'signal', 'event', 'bindable', 'custom event',
      'state machine', 'fsm',
      'module pattern', 'module',
      'debounce', 'cooldown',
      'retry', 'backoff',
      'deep copy', 'table util',
    ],
    messages: normalize(PATTERNS_KNOWLEDGE),
    priority: 7,
  },
  {
    name: 'strategies',
    keywords: [
      'remote spy', 'remote replay', 'replay',
      'webhook', 'logging',
      'config', 'settings', 'save settings', 'load settings',
      'multi module', 'architecture', 'structure',
      'forgery', 'packet',
    ],
    messages: normalize(STRATEGIES_KNOWLEDGE),
    priority: 8,
  },
  {
    name: 'filesystem',
    keywords: [
      'readfile', 'writefile', 'isfile', 'makefolder', 'isfolder',
      'listfiles', 'delfile', 'delfolder', 'appendfile',
      'clipboard', 'setclipboard',
      'decompile', 'getscriptbytecode',
      'save', 'load', 'persist', 'config file',
      'auto update', 'version check',
      'log file', 'logging',
    ],
    messages: normalize(FILESYSTEM_KNOWLEDGE),
    priority: 7,
  },
]

/**
 * Routes user message to relevant knowledge modules.
 * 
 * @param userMessage - The user's chat message
 * @param maxModules  - Max number of non-core modules to include (default: 5)
 * @returns Filtered KnowledgeMessage[] containing only relevant knowledge
 */
export function routeKnowledge(userMessage: string, maxModules: number = 5): KnowledgeMessage[] {
  const msgLower = userMessage.toLowerCase()
  const result: KnowledgeMessage[] = []
  const matched: { module: KnowledgeModule; score: number }[] = []

  for (const mod of KNOWLEDGE_MODULES) {
    // Always include core modules
    if (mod.core) {
      result.push(...mod.messages)
      continue
    }

    // Count keyword matches (score)
    let score = 0
    for (const keyword of mod.keywords) {
      if (msgLower.includes(keyword.toLowerCase())) {
        // Longer keyword matches = higher score (more specific)
        score += keyword.length
      }
    }

    if (score > 0) {
      matched.push({ module: mod, score })
    }
  }

  // Sort by score (highest first), then by priority (lowest first)
  matched.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return (a.module.priority || 10) - (b.module.priority || 10)
  })

  // Take top N modules
  const selected = matched.slice(0, maxModules)

  for (const { module } of selected) {
    result.push(...module.messages)
  }

  // If no specific modules matched, include some sensible defaults
  if (selected.length === 0) {
    // Generic Luau request — include patterns + roblox-services + engine
    const defaults = KNOWLEDGE_MODULES.filter(m => 
      ['patterns', 'roblox-services', 'engine'].includes(m.name)
    )
    for (const mod of defaults) {
      result.push(...mod.messages)
    }
  }

  return result
}

/**
 * Returns ALL knowledge (original behavior for large-context models)
 */
export function getAllKnowledge(): KnowledgeMessage[] {
  const all: KnowledgeMessage[] = []
  for (const mod of KNOWLEDGE_MODULES) {
    all.push(...mod.messages)
  }
  return all
}

/**
 * Returns the names of matched modules (for debugging/logging)
 */
export function getMatchedModuleNames(userMessage: string, maxModules: number = 5): string[] {
  const msgLower = userMessage.toLowerCase()
  const matched: { name: string; score: number; priority: number }[] = []

  for (const mod of KNOWLEDGE_MODULES) {
    if (mod.core) continue
    let score = 0
    for (const keyword of mod.keywords) {
      if (msgLower.includes(keyword.toLowerCase())) {
        score += keyword.length
      }
    }
    if (score > 0) {
      matched.push({ name: mod.name, score, priority: mod.priority || 10 })
    }
  }

  matched.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.priority - b.priority
  })

  return ['safety (core)', ...matched.slice(0, maxModules).map(m => `${m.name} (score: ${m.score})`)]
}
