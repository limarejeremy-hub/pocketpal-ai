import AsyncStorage from '@react-native-async-storage/async-storage';

import type {RoleplayMemory} from './types';

const KEY_PREFIX = 'golove.roleplay.memory.v1';
const MAX_STORED_MEMORIES = 80;

export interface RoleplayMemorySnapshot {
  memories: RoleplayMemory[];
  rollingSummary?: string;
  updatedAt: number;
}

function storageKey(sessionId: string, palId: string): string {
  return `${KEY_PREFIX}:${sessionId}:${palId}`;
}

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fr-FR');
}

export function classifyRoleplayMemory(
  text: string,
): Omit<RoleplayMemory, 'id' | 'createdAt'> | null {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (clean.length < 12) {
    return null;
  }

  if (
    /^(prends? le contr[oô]le|mode autonome|continue (?:toute seule|tout seul)|fais avancer)/i.test(
      clean,
    )
  ) {
    return null;
  }

  let kind: RoleplayMemory['kind'] = 'event';
  let importance = 5;

  if (/\b(j['’]?aime|je pr[eé]f[eè]re|je d[eé]teste|mon pr[eé]f[eé]r[eé])\b/i.test(clean)) {
    kind = 'preference';
    importance = 8;
  } else if (/\b(je m['’]appelle|mon nom est|j['’]habite|je vis|je travaille|mon m[eé]tier)\b/i.test(clean)) {
    kind = 'person';
    importance = 9;
  } else if (/\b(promets?|promis|on s['’]est promis|rendez-vous|on se retrouve)\b/i.test(clean)) {
    kind = 'promise';
    importance = 9;
  } else if (/\b(ensemble|relation|couple|mari[eé]s?|rencontr[eé]s?|premier rendez-vous)\b/i.test(clean)) {
    kind = 'relationship';
    importance = 8;
  } else if (/\b(rouen|paris|maison|appartement|h[oô]tel|restaurant|bar|bureau|atelier)\b/i.test(clean)) {
    kind = 'place';
    importance = 6;
  } else if (/\b(hier|demain|aujourd['’]hui|semaine prochaine|mois prochain|\d{1,2}[\/-]\d{1,2})\b/i.test(clean)) {
    kind = 'timeline';
    importance = 7;
  }

  return {
    kind,
    text: clean.slice(0, 500),
    importance,
  };
}

export async function loadRoleplayMemory(
  sessionId: string,
  palId: string,
): Promise<RoleplayMemorySnapshot> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(sessionId, palId));
    if (!raw) {
      return {memories: [], updatedAt: 0};
    }
    const parsed = JSON.parse(raw) as Partial<RoleplayMemorySnapshot>;
    return {
      memories: Array.isArray(parsed.memories) ? parsed.memories : [],
      rollingSummary:
        typeof parsed.rollingSummary === 'string'
          ? parsed.rollingSummary
          : undefined,
      updatedAt:
        typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
    };
  } catch (error) {
    console.warn('[roleplay-memory] failed to load memory', error);
    return {memories: [], updatedAt: 0};
  }
}

export async function rememberRoleplayText(
  sessionId: string,
  palId: string,
  text: string,
): Promise<void> {
  const candidate = classifyRoleplayMemory(text);
  if (!candidate) {
    return;
  }

  try {
    const snapshot = await loadRoleplayMemory(sessionId, palId);
    const candidateKey = normalize(candidate.text);
    const withoutDuplicate = snapshot.memories.filter(
      memory => normalize(memory.text) !== candidateKey,
    );

    const memory: RoleplayMemory = {
      ...candidate,
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now(),
    };

    const memories = [...withoutDuplicate, memory]
      .sort((a, b) => b.importance - a.importance || b.createdAt - a.createdAt)
      .slice(0, MAX_STORED_MEMORIES);

    await AsyncStorage.setItem(
      storageKey(sessionId, palId),
      JSON.stringify({
        ...snapshot,
        memories,
        updatedAt: Date.now(),
      } satisfies RoleplayMemorySnapshot),
    );
  } catch (error) {
    console.warn('[roleplay-memory] failed to persist memory', error);
  }
}

export async function clearRoleplayMemory(
  sessionId: string,
  palId: string,
): Promise<void> {
  await AsyncStorage.removeItem(storageKey(sessionId, palId));
}
