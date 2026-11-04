import {
  roleplayHistoryBudgetForContext,
  trimRoleplayHistory,
} from '../RoleplayHistory';

describe('RoleplayHistory', () => {
  it('keeps the newest messages inside the budget', () => {
    const messages = [
      {role: 'user', content: 'A'.repeat(100)},
      {role: 'assistant', content: 'B'.repeat(100)},
      {role: 'user', content: 'C'.repeat(100)},
    ];

    const trimmed = trimRoleplayHistory(messages, 180);

    expect(trimmed).toEqual([{role: 'user', content: 'C'.repeat(100)}]);
  });

  it('returns a conservative budget for small mobile contexts', () => {
    expect(roleplayHistoryBudgetForContext(4096)).toBe(6144);
    expect(roleplayHistoryBudgetForContext(8192)).toBe(12288);
  });

  it('caps history growth on very large model contexts', () => {
    expect(roleplayHistoryBudgetForContext(65536)).toBe(18000);
  });
});
