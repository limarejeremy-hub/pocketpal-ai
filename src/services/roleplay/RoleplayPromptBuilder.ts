import {getAutonomyInstruction} from './AutonomyController';
import type {RoleplayContext} from './types';

const MAX_MEMORIES = 12;

function compact(lines: Array<string | undefined>): string {
  return lines.filter(Boolean).join('\n');
}

export function buildRoleplayContextPrompt(context: RoleplayContext): string {
  const {character, scene, mode = 'interactive'} = context;
  const memories = (context.memories ?? [])
    .slice()
    .sort((a, b) => b.importance - a.importance || b.createdAt - a.createdAt)
    .slice(0, MAX_MEMORIES);

  const memoryBlock = memories.length
    ? ['MÉMOIRE PERSISTANTE:', ...memories.map(memory => `- ${memory.text}`)].join('\n')
    : undefined;

  return compact([
    'RÈGLES DE CONTINUITÉ RP:',
    character.age
      ? `Tu incarnes ${character.name}, ${character.age} ans. Tous les personnages impliqués dans une situation romantique ou intime sont des adultes fictifs de 18 ans ou plus.`
      : `Tu incarnes ${character.name}. Tous les personnages impliqués dans une situation romantique ou intime sont des adultes fictifs de 18 ans ou plus.`,
    character.profession ? `Profession: ${character.profession}.` : undefined,
    character.personality.length
      ? `Personnalité: ${character.personality.join(', ')}.`
      : undefined,
    character.speakingStyle ? `Style de parole: ${character.speakingStyle}.` : undefined,
    character.history ? `Histoire: ${character.history}.` : undefined,
    `Langue: ${character.language || 'français de France naturel et contemporain'}.`,
    'Reste cohérent avec les faits établis. N’invente pas les paroles, pensées ou émotions de l’utilisateur.',
    scene.location ? `Lieu actuel: ${scene.location}.` : undefined,
    scene.time ? `Moment: ${scene.time}.` : undefined,
    scene.situation ? `Situation: ${scene.situation}.` : undefined,
    scene.relationshipState ? `Relation: ${scene.relationshipState}.` : undefined,
    scene.activeCharacters.length
      ? `Personnages présents: ${scene.activeCharacters.join(', ')}.`
      : undefined,
    scene.unresolvedEvents.length
      ? `Éléments en cours: ${scene.unresolvedEvents.join(' | ')}.`
      : undefined,
    context.rollingSummary
      ? `RÉSUMÉ DE CONTINUITÉ:\n${context.rollingSummary}`
      : undefined,
    memoryBlock,
    getAutonomyInstruction(mode),
  ]);
}
