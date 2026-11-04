import type {RoleplayMode} from './types';

const AUTONOMY_PATTERNS = [
  /\bprends?\s+le\s+contr[oô]le\b/i,
  /\bmode\s+autonome\b/i,
  /\bcontinue\s+(?:toute\s+seule|tout\s+seul)\b/i,
  /\bfais\s+avancer\s+(?:l['’]histoire|la\s+sc[eè]ne)\b/i,
  /\bcontinue\s+sans\s+(?:moi|m['’]attendre)\b/i,
];

export function detectRoleplayMode(input: string): RoleplayMode {
  return AUTONOMY_PATTERNS.some(pattern => pattern.test(input))
    ? 'autonomous'
    : 'interactive';
}

export function getAutonomyInstruction(mode: RoleplayMode): string {
  if (mode !== 'autonomous') {
    return '';
  }

  return [
    'MODE AUTONOME ACTIF.',
    'Tu diriges maintenant la scène et tu la fais réellement progresser.',
    'Fais avancer au moins trois développements significatifs avant de laisser une ouverture naturelle à l’utilisateur.',
    'Ne demande pas la permission, ne propose pas de menu et ne termine pas chaque développement par une question.',
    'Tu peux gérer les personnages secondaires fictifs adultes, les événements, le décor, les lieux et le passage du temps.',
    'Ne décide jamais des paroles, pensées, émotions ou décisions personnelles importantes de l’utilisateur.',
  ].join('\n');
}
