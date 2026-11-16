// Effort capability policy for agy models (issue #67).
//
// agy refuses the WHOLE invocation when `--effort` is passed to a model that
// does not accept one, and that refusal arrives before any output. Effort
// support is a MODEL property, but our catalog only knows it as advisory (the
// fallback list is a guess and agy builds differ). The refusal names the exact
// model, which is what makes learning it possible: we remember refusals in
// memory and ask the host to persist them so the picker row disappears.
//
// Moved out of src/host/adapter.ts unchanged; the adapter keeps its public
// effort methods as one-line delegates.

import { sameModelId }

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}
 from './mapper/model-id.js'
import { REASONING_EFFORTS, normalizeEfforts }

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}
 from '../common/reasoning.js'

/** Same-model comparison that ignores a provider prefix and case. */
export function sameModelId(a: string, b: string): boolean {
  const norm = (s: string): string => s.trim().toLowerCase().replace(/^.*\//, '')
  return norm(a) === norm(b) && norm(a) !== ''
}

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}


/**
 * agy refuses the WHOLE invocation when `--effort` is passed to a model that
 * does not accept one (issue #67, agy 1.4.6 / Windows):
 *
 *   invalid model selection (--model "gemini-3.8-flash" --effort "medium"):
 *   --effort is not supported for model "gemini-3.8-flash"
 *
 * @param text - stdout envelope error, stderr tail, or a mapped failure message.
 * @returns the refused model id, or null when this is not an effort refusal.
 */
export function parseEffortUnsupported(text: string): string | null {
  if (text === '' || !/--effort/i.test(text)) return null
  const named = text.match(/--effort(?:\s+"?[A-Za-z0-9._-]+"?)?\s+is not supported for model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  if (named !== null && named[1] !== undefined && named[1] !== '') return named[1]
  if (/invalid model selection/i.test(text) && /--effort[^\n:]*(?:is not supported|not supported|unsupported)/i.test(text)) {
    const model = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
    if (model !== null && model[1] !== undefined && model[1] !== '') return model[1]
  }

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}

  return null
}

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}


/**
 * Detect when agy refuses a model because the current active account/settings
 * do not have access to it:
 * `invalid model selection (--model "claude-opus-4-6-thinking" --effort ""): model claude-opus-4-6-thinking is not recognized as a known model or custom model in settings`
 *
 * @param text - stdout envelope error, stderr tail, or a mapped failure message.
 * @returns the unrecognized model id, or null when this is not a model-recognition refusal.
 */
export function parseModelNotRecognized(text: string): string | null {
  if (text === '' || !/not recognized as a known model/i.test(text)) return null
  const m = text.match(/invalid model selection.*?model\s+["']?([^\s"':]+)["']?\s+is not recognized as a known model/i)
    ?? text.match(/model\s+["']?([^\s"':]+)["']?\s+is not recognized as a known model/i)
  return m && m[1] ? m[1] : null
}

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}


/**
 * In-memory effort-refusal cache, seeded once from the host's persisted list
 * and grown by each learned refusal.
 */
export class EffortPolicy {
  private cache: Set<string> | null = null
  private seedKey = ''
  /** Models learned in THIS process: survive an external edit of the seed. */
  private readonly learned = new Set<string>()

  constructor(
    private readonly seed: () => readonly string[] | undefined,
    private readonly log?: (msg: string) => void,
    private readonly onLearned?: (model: string) => void,
  ) {}

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}


  /** Models currently known to reject `--effort` (persisted seed + learned). */
  unsupportedModels(): string[] {
    return [...this.models()]
  }

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}


  /** True when `--effort` must not be passed to this model. */
  isUnsupported(model: string): boolean {
    if (model === '') return false
    for (const known of this.models()) {
      if (sameModelId(known, model)) return true
    }

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}

    return false
  }

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}


  /** Learn a refusal: remember it, tell the host to persist + refresh the picker. */
  learn(model: string): void {
    if (model === '') return
    const set = this.models()
    if (this.isUnsupported(model)) return
    set.add(model)
    this.learned.add(model)
    this.log?.(
      'agy refused --effort for model "' + model + '" — it is now run without an effort flag'
        + ' (effort support is advisory in the catalog; see issue #67)',
    )
    try {
      this.onLearned?.(model)
    }

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}
 catch {
      // Persistence is best-effort: the in-process learning already unblocks it.
    }

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}

  }

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}


  private models(): Set<string> {
    const raw = this.seed() ?? []
    const seeded = (Array.isArray(raw) ? raw : []).filter((m) => typeof m === 'string' && m.trim() !== '')
    const key = seeded.join('\u0000')
    // Re-seed when the host's persisted list changed (e.g. an operator cleared
    // a false refusal) while keeping refusals learned in this process. Without
    // this, editing effort-unsupported.json needed a DSH restart (issue #115).
    if (this.cache === null || key !== this.seedKey) {
      this.seedKey = key
      this.cache = new Set([...seeded, ...this.learned])
    }

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}

    return this.cache
  }

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}

}

export function parseThinkingLevelUnsupported(text: string): { level: string; model?: string } | null {
  if (text === '' || (!/THINKING_LEVEL_/i.test(text) && !/thinking level/i.test(text))) return null
  const named = text.match(/THINKING_LEVEL_([A-Z_]+)/)
  const namedLevel = named !== null && named[1] !== undefined ? named[1].trim().toLowerCase() : ''
  const plain = text.match(/thinking level\s+"?([a-z]+)"?\s+(?:is\s+)?(?:not supported|unsupported)/i)
  const plainLevel = plain !== null && plain[1] !== undefined ? plain[1].trim().toLowerCase() : ''
  const noEffort = text.match(/(?:has no|does not support|doesn't support)\s+"?([a-z]+)"?\s+effort/i)
  const noEffortLevel = noEffort !== null && noEffort[1] !== undefined ? noEffort[1].trim().toLowerCase() : ''
  const level = namedLevel !== '' ? namedLevel : plainLevel !== '' ? plainLevel : noEffortLevel
  if (level === '' || !(REASONING_EFFORTS as readonly string[]).includes(level)) return null
  const modelMatch = text.match(/--model\s+"?([A-Za-z0-9._:\/-]+)"?/i)
  const model = modelMatch !== null && modelMatch[1] !== undefined ? modelMatch[1].trim() : ''
  return model === '' ? { level } : { level, model }
}

const refusedEffortLevels = new Map<string, Set<string>>()

function effortLevelModelKey(model: string): string {
  return typeof model === 'string' ? model.trim().toLowerCase().replace(/^.*\//, '') : ''
}

export function isEffortLevelRefused(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  if (key === '') return false
  const set = refusedEffortLevels.get(key)
  return set !== undefined && set.has(typeof level === 'string' ? level.trim().toLowerCase() : '')
}

export function rememberRefusedEffortLevel(model: string, level: string): boolean {
  const key = effortLevelModelKey(model)
  const id = typeof level === 'string' ? level.trim().toLowerCase() : ''
  if (key === '' || id === '' || !(REASONING_EFFORTS as readonly string[]).includes(id)) return false
  const set = refusedEffortLevels.get(key) ?? new Set<string>()
  const isNew = !set.has(id)
  set.add(id)
  refusedEffortLevels.set(key, set)
  return isNew
}

export function refusedEffortLevelsFor(model: string): string[] {
  const set = refusedEffortLevels.get(effortLevelModelKey(model))
  return set === undefined ? [] : (REASONING_EFFORTS as readonly string[]).filter((e) => set.has(e))
}

export function effectiveEffortLevel(
  model: string,
  efforts: string[] | null,
  preferred: string | undefined,
  defaultEffort: string,
): string | undefined {
  const usable = normalizeEfforts(efforts ?? []).filter((e) => !isEffortLevelRefused(model, e))
  if (usable.length === 0) return undefined
  const wanted = typeof preferred === 'string' ? preferred.trim().toLowerCase() : ''
  if (wanted !== '' && usable.includes(wanted)) return wanted
  const fallback = typeof defaultEffort === 'string' ? defaultEffort.trim().toLowerCase() : ''
  if (fallback !== '' && usable.includes(fallback)) return fallback
  return usable[usable.length - 1]
}
