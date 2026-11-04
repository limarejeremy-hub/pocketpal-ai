import {buildRoleplayContextPrompt} from '../RoleplayPromptBuilder';

describe('RoleplayPromptBuilder', () => {
  it('builds a compact French continuity prompt and prioritizes memories', () => {
    const prompt = buildRoleplayContextPrompt({
      character: {
        id: 'c1',
        name: 'Chloé',
        age: 32,
        profession: "architecte d'intérieur",
        personality: ['directe', 'spontanée'],
        language: 'français de France naturel et contemporain',
      },
      scene: {
        location: 'Rouen',
        activeCharacters: ['Chloé'],
        unresolvedEvents: [],
      },
      memories: [
        {id: 'm1', kind: 'event', text: 'Ils se sont rencontrés à Rouen.', importance: 10, createdAt: 1},
      ],
      mode: 'autonomous',
    });

    expect(prompt).toContain('Chloé, 32 ans');
    expect(prompt).toContain('Rouen');
    expect(prompt).toContain('Ils se sont rencontrés à Rouen.');
    expect(prompt).toContain('MODE AUTONOME ACTIF');
  });
});
