jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import {classifyRoleplayMemory} from '../RoleplayMemoryStore';

describe('RoleplayMemoryStore', () => {
  it('keeps explicit personal facts with high importance', () => {
    const memory = classifyRoleplayMemory("J'habite à Rouen depuis trois ans.");
    expect(memory?.kind).toBe('person');
    expect(memory?.importance).toBeGreaterThanOrEqual(8);
  });

  it('keeps preferences', () => {
    const memory = classifyRoleplayMemory(
      'Je préfère les endroits calmes aux boîtes de nuit.',
    );
    expect(memory?.kind).toBe('preference');
  });

  it('does not persist autonomy commands as story memory', () => {
    expect(classifyRoleplayMemory('Prends le contrôle de la scène')).toBeNull();
    expect(classifyRoleplayMemory('mode autonome maintenant')).toBeNull();
  });

  it('ignores tiny conversational filler', () => {
    expect(classifyRoleplayMemory('Oui.')).toBeNull();
  });
});
