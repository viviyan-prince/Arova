import type { CompiledRule, ConditionOperator } from '@/types/transaction';

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface RuleEvalResult {
  matches: boolean;
  action?: {
    type: string;
    parameters: Record<string, any>;
  };
}

export interface RulesEvalResult {
  matchedRule?: CompiledRule;
  action?: {
    type: string;
    parameters: Record<string, any>;
  };
  evaluated: number;
}

// ---------------------------------------------------------------------------
// Single-rule evaluator
// ---------------------------------------------------------------------------

/**
 * Evaluate a single compiled rule against a context object.
 *
 * Uses pure switch-case comparison -- never eval() or Function().
 * Returns whether the rule matches and, if so, its action.
 */
export function evaluateRule(
  rule: CompiledRule,
  context: Record<string, any>,
): RuleEvalResult {
  const { field, operator, value } = rule.condition;

  const contextValue = context[field];

  // If the context field is missing or undefined the rule cannot match.
  if (contextValue === undefined || contextValue === null) {
    return { matches: false };
  }

  const matches = compareValue(operator, contextValue, value);

  if (matches) {
    return { matches: true, action: { ...rule.action } };
  }

  return { matches: false };
}

// ---------------------------------------------------------------------------
// Multi-rule evaluator
// ---------------------------------------------------------------------------

/**
 * Evaluate an array of compiled rules (sorted by ascending priority) and
 * return the first match together with the total number of rules evaluated.
 */
export function evaluateRules(
  rules: CompiledRule[],
  context: Record<string, any>,
): RulesEvalResult {
  if (!rules || rules.length === 0) {
    return { evaluated: 0 };
  }

  // Sort by priority ascending (lower number = higher priority).
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);

  let evaluated = 0;

  for (const rule of sorted) {
    evaluated++;
    const result = evaluateRule(rule, context);
    if (result.matches) {
      return {
        matchedRule: rule,
        action: result.action,
        evaluated,
      };
    }
  }

  return { evaluated };
}

// ---------------------------------------------------------------------------
// Internal: pure comparison helper
// ---------------------------------------------------------------------------

function compareValue(
  operator: ConditionOperator,
  contextValue: any,
  ruleValue: any,
): boolean {
  switch (operator) {
    case 'gt':
      return typeof contextValue === 'number' && typeof ruleValue === 'number'
        ? contextValue > ruleValue
        : false;

    case 'lt':
      return typeof contextValue === 'number' && typeof ruleValue === 'number'
        ? contextValue < ruleValue
        : false;

    case 'eq':
      return contextValue === ruleValue;

    case 'gte':
      return typeof contextValue === 'number' && typeof ruleValue === 'number'
        ? contextValue >= ruleValue
        : false;

    case 'lte':
      return typeof contextValue === 'number' && typeof ruleValue === 'number'
        ? contextValue <= ruleValue
        : false;

    case 'in':
      return Array.isArray(ruleValue) ? ruleValue.includes(contextValue) : false;

    case 'between':
      return (
        Array.isArray(ruleValue) &&
        ruleValue.length >= 2 &&
        typeof contextValue === 'number' &&
        typeof ruleValue[0] === 'number' &&
        typeof ruleValue[1] === 'number' &&
        contextValue >= ruleValue[0] &&
        contextValue <= ruleValue[1]
      );

    default:
      // Unknown operator -- never match.
      return false;
  }
}
