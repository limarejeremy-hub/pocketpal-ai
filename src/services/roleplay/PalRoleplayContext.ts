import type {Pal} from '../../types/pal';
import {detectRoleplayMode} from './AutonomyController';
import type {RoleplayContext} from './types';

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,;|]/)
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseAdultAge(...sources: unknown[]): number | undefined {
  for (const source of sources) {
    if (typeof source === 'number' && Number.isFinite(source) && source >= 18) {
      return Math.floor(source);
    }
    if (typeof source !== 'string') {
      continue;
    }
    const match = source.match(/\b(1[89]|[2-9]\d)\s*(?:ans|years?\s*old)\b/i);
    if (match) {
      return Number(match[1]);
    }
  }
  return undefined;
}

export function isRoleplayPal(pal?: Pal | null): pal is Pal {
  if (!pal) {
    return false;
  }
  const p = pal.parameters ?? {};
  return Boolean(
    p.aiRole ||
      p.world ||
      p.situation ||
      /roleplay|jeu de r[oô]le|immersive fictional/i.test(pal.systemPrompt),
  );
}

export function buildPalRoleplayContext(
  pal: Pal,
  userInput: string,
): RoleplayContext {
  const p = pal.parameters ?? {};
  const role = firstString(p.aiRole, pal.name) ?? pal.name;
  const age = parseAdultAge(p.age, p.aiRole, pal.description, pal.systemPrompt);

  return {
    character: {
      id: pal.id,
      name: firstString(p.characterName, pal.name, p.aiRole) ?? role,
      age,
      profession: firstString(p.profession),
      personality: toStringList(p.personality),
      speakingStyle: firstString(p.speakingStyle, p.toneStyle),
      history: firstString(p.history, p.backstory),
      language:
        firstString(p.language) ?? 'français de France naturel et contemporain',
    },
    scene: {
      location: firstString(p.location),
      time: firstString(p.time, p.currentTime),
      situation: firstString(p.situation),
      activeCharacters: [
        firstString(p.characterName, pal.name, p.aiRole) ?? role,
        ...toStringList(p.secondaryCharacters),
      ],
      relationshipState: firstString(p.relationshipState, p.relationship),
      unresolvedEvents: toStringList(p.unresolvedEvents),
    },
    memories: [],
    mode: detectRoleplayMode(userInput),
  };
}
