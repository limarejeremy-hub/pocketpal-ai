import {detectRoleplayMode, getAutonomyInstruction} from '../AutonomyController';

describe('AutonomyController', () => {
  it.each([
    'Prends le contrôle de la scène',
    'mode autonome',
    'Continue toute seule',
    "Fais avancer l'histoire",
  ])('detects autonomous intent: %s', input => {
    expect(detectRoleplayMode(input)).toBe('autonomous');
  });

  it('keeps ordinary conversation interactive', () => {
    expect(detectRoleplayMode('On va boire un café ?')).toBe('interactive');
  });

  it('protects user agency in autonomous instructions', () => {
    const instruction = getAutonomyInstruction('autonomous');
    expect(instruction).toContain('trois développements');
    expect(instruction).toContain('Ne décide jamais');
  });
});
