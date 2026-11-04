export interface RoleplayChatMessage {
  role: string;
  content?: unknown;
}

function contentCharacters(content: unknown): number {
  if (typeof content === 'string') {
    return content.length;
  }
  if (Array.isArray(content)) {
    return content.reduce((total, item) => total + contentCharacters(item), 0);
  }
  if (content && typeof content === 'object') {
    try {
      return JSON.stringify(content).length;
    } catch {
      return 0;
    }
  }
  return 0;
}

/**
 * Keeps the newest raw chat context inside a conservative character budget.
 * Long-term continuity comes from the persistent memory layer, so old raw
 * turns can safely leave the prompt instead of eventually overflowing n_ctx.
 */
export function trimRoleplayHistory<T extends RoleplayChatMessage>(
  messages: T[],
  characterBudget: number,
): T[] {
  if (!Number.isFinite(characterBudget) || characterBudget <= 0) {
    return messages;
  }

  const kept: T[] = [];
  let used = 0;

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    const cost = contentCharacters(message.content) + 32;

    if (kept.length > 0 && used + cost > characterBudget) {
      break;
    }

    kept.push(message);
    used += cost;

    if (used >= characterBudget) {
      break;
    }
  }

  return kept.reverse();
}

export function roleplayHistoryBudgetForContext(
  contextTokens: number | undefined,
): number {
  const safeTokens =
    typeof contextTokens === 'number' &&
    Number.isFinite(contextTokens) &&
    contextTokens > 0
      ? contextTokens
      : 4096;

  // Rough mobile-friendly conversion: reserve ample room for the system prompt,
  // persistent memories and the model's next answer.
  return Math.max(5000, Math.min(18000, Math.floor(safeTokens * 1.5)));
}
