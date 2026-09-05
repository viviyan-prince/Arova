import { randomUUID } from 'crypto';
import { z } from 'zod';
import { callGemini } from '@/lib/ai/gemini';
import { AIServiceError } from '@/lib/utils/errors';
import {
  CompiledRuleSchema,
  type CompiledRule,
  type ConditionOperator,
} from '@/types/transaction';

// ---------------------------------------------------------------------------
// Zod schema for the Gemini output (rule without id — we generate that)
// ---------------------------------------------------------------------------

const GeminiRuleOutputSchema = z.object({
  type: z.enum(['acceptance', 'pricing', 'shipping', 'negotiation', 'return']),
  condition: z.object({
    field: z.string().min(1),
    operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte', 'in', 'between']),
    value: z.any(),
  }),
  action: z.object({
    type: z.enum(['accept', 'reject', 'apply_discount', 'modify']),
    parameters: z.record(z.string(), z.any()),
  }),
  priority: z.number().int().nonnegative(),
});

// ---------------------------------------------------------------------------
// Few-shot examples (8 total covering all rule types)
// ---------------------------------------------------------------------------

const FEW_SHOT_EXAMPLES = `
Example 1:
Rule: "Only accept orders above 200 rupees"
Type hint: acceptance
Output: { "type": "acceptance", "condition": { "field": "order.total", "operator": "gte", "value": 200 }, "action": { "type": "accept", "parameters": {} }, "priority": 1 }

Example 2:
Rule: "10% discount when ordering 5 or more items"
Type hint: pricing
Output: { "type": "pricing", "condition": { "field": "order.item_count", "operator": "gte", "value": 5 }, "action": { "type": "apply_discount", "parameters": { "percent": 10 } }, "priority": 2 }

Example 3:
Rule: "Free shipping for orders above 999 rupees"
Type hint: shipping
Output: { "type": "shipping", "condition": { "field": "order.total", "operator": "gte", "value": 999 }, "action": { "type": "modify", "parameters": { "shipping_cost": 0 } }, "priority": 1 }

Example 4:
Rule: "Allow negotiation up to 15% below listed price"
Type hint: negotiation
Output: { "type": "negotiation", "condition": { "field": "negotiation.discount_percent", "operator": "lte", "value": 15 }, "action": { "type": "accept", "parameters": { "max_discount_percent": 15 } }, "priority": 1 }

Example 5:
Rule: "Reject orders with more than 50 items"
Type hint: acceptance
Output: { "type": "acceptance", "condition": { "field": "order.item_count", "operator": "gt", "value": 50 }, "action": { "type": "reject", "parameters": { "reason": "Order quantity exceeds maximum limit" } }, "priority": 3 }

Example 6:
Rule: "Accept returns within 7 days of delivery"
Type hint: return
Output: { "type": "return", "condition": { "field": "return.days_since_delivery", "operator": "lte", "value": 7 }, "action": { "type": "accept", "parameters": {} }, "priority": 1 }

Example 7:
Rule: "25% discount on orders between 5000 and 10000 rupees"
Type hint: pricing
Output: { "type": "pricing", "condition": { "field": "order.total", "operator": "between", "value": [5000, 10000] }, "action": { "type": "apply_discount", "parameters": { "percent": 25 } }, "priority": 2 }

Example 8:
Rule: "Flat 100 rupees shipping for electronics category"
Type hint: shipping
Output: { "type": "shipping", "condition": { "field": "order.category", "operator": "eq", "value": "electronics" }, "action": { "type": "modify", "parameters": { "shipping_cost": 100 } }, "priority": 2 }
`.trim();

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a commerce rule compiler. Given a natural-language business rule and a type hint, produce a structured JSON rule with these keys:
- "type": one of acceptance, pricing, shipping, negotiation, return
- "condition": { "field": dotted path, "operator": gt|lt|eq|gte|lte|in|between, "value": any }
- "action": { "type": accept|reject|apply_discount|modify, "parameters": {} }
- "priority": integer (1 = highest)

Return ONLY valid JSON. No markdown, no code fences, no explanation.`;

// ---------------------------------------------------------------------------
// Rule evaluation engine (for test generation)
// ---------------------------------------------------------------------------

function evaluateCondition(
  operator: ConditionOperator,
  fieldValue: any,
  conditionValue: any
): boolean {
  switch (operator) {
    case 'gt':
      return fieldValue > conditionValue;
    case 'lt':
      return fieldValue < conditionValue;
    case 'eq':
      return fieldValue === conditionValue;
    case 'gte':
      return fieldValue >= conditionValue;
    case 'lte':
      return fieldValue <= conditionValue;
    case 'in':
      return Array.isArray(conditionValue) && conditionValue.includes(fieldValue);
    case 'between':
      return (
        Array.isArray(conditionValue) &&
        conditionValue.length === 2 &&
        fieldValue >= conditionValue[0] &&
        fieldValue <= conditionValue[1]
      );
    default:
      return false;
  }
}

function resolveField(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function evaluateRule(
  rule: { condition: { field: string; operator: ConditionOperator; value: any } },
  context: Record<string, any>
): boolean {
  const fieldValue = resolveField(context, rule.condition.field);
  if (fieldValue === undefined) return false;
  return evaluateCondition(rule.condition.operator, fieldValue, rule.condition.value);
}

// ---------------------------------------------------------------------------
// Generate 3 automatic test cases for a compiled rule
// ---------------------------------------------------------------------------

function generateTestCases(
  rule: CompiledRule
): Array<{ input: any; expected: boolean; actual: boolean }> {
  const { field, operator, value } = rule.condition;
  const tests: Array<{ input: any; expected: boolean }> = [];

  // Helper: build a context object from a dotted field path and a value
  function makeContext(fieldPath: string, val: any): Record<string, any> {
    const parts = fieldPath.split('.');
    const root: Record<string, any> = {};
    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = val;
    return root;
  }

  if (typeof value === 'number') {
    switch (operator) {
      case 'gt':
        tests.push({ input: makeContext(field, value + 100), expected: true });
        tests.push({ input: makeContext(field, value), expected: false });
        tests.push({ input: makeContext(field, value - 100), expected: false });
        break;
      case 'gte':
        tests.push({ input: makeContext(field, value), expected: true });
        tests.push({ input: makeContext(field, value + 100), expected: true });
        tests.push({ input: makeContext(field, value - 1), expected: false });
        break;
      case 'lt':
        tests.push({ input: makeContext(field, value - 100), expected: true });
        tests.push({ input: makeContext(field, value), expected: false });
        tests.push({ input: makeContext(field, value + 100), expected: false });
        break;
      case 'lte':
        tests.push({ input: makeContext(field, value), expected: true });
        tests.push({ input: makeContext(field, value - 1), expected: true });
        tests.push({ input: makeContext(field, value + 1), expected: false });
        break;
      case 'eq':
        tests.push({ input: makeContext(field, value), expected: true });
        tests.push({ input: makeContext(field, value + 1), expected: false });
        tests.push({ input: makeContext(field, value - 1), expected: false });
        break;
      default:
        tests.push({ input: makeContext(field, value), expected: true });
        tests.push({ input: makeContext(field, 0), expected: false });
        tests.push({ input: makeContext(field, -1), expected: false });
    }
  } else if (Array.isArray(value) && operator === 'between' && value.length === 2) {
    const [low, high] = value;
    tests.push({ input: makeContext(field, (low + high) / 2), expected: true });
    tests.push({ input: makeContext(field, low - 1), expected: false });
    tests.push({ input: makeContext(field, high + 1), expected: false });
  } else if (Array.isArray(value) && operator === 'in') {
    tests.push({ input: makeContext(field, value[0]), expected: true });
    tests.push({ input: makeContext(field, '__nonexistent__'), expected: false });
    tests.push({
      input: makeContext(field, value.length > 1 ? value[1] : value[0]),
      expected: true,
    });
  } else if (typeof value === 'string') {
    tests.push({ input: makeContext(field, value), expected: operator === 'eq' });
    tests.push({ input: makeContext(field, value + '_nope'), expected: false });
    tests.push({ input: makeContext(field, ''), expected: false });
  } else {
    // Fallback: just test with the value itself
    tests.push({ input: makeContext(field, value), expected: true });
    tests.push({ input: makeContext(field, null), expected: false });
    tests.push({ input: makeContext(field, undefined), expected: false });
  }

  return tests.map((t) => ({
    input: t.input,
    expected: t.expected,
    actual: evaluateRule(rule, t.input),
  }));
}

// ---------------------------------------------------------------------------
// Parse Gemini response
// ---------------------------------------------------------------------------

function parseGeminiResponse(raw: string): z.infer<typeof GeminiRuleOutputSchema> {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleaned);
  return GeminiRuleOutputSchema.parse(parsed);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function compileRule(
  ruleText: string,
  ruleType: string
): Promise<{
  compiled_rule: CompiledRule;
  test_results: Array<{ input: any; expected: boolean; actual: boolean }>;
}> {
  const startMs = Date.now();

  const userPrompt = `${FEW_SHOT_EXAMPLES}

Now compile this rule:
Rule: "${ruleText}"
Type hint: ${ruleType}
Output:`;

  // --- First attempt ---
  let lastError: string | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const promptToSend =
        attempt === 1
          ? userPrompt
          : `${userPrompt}\n\nIMPORTANT: Your previous response was invalid. Error: ${lastError}. Return ONLY valid JSON.`;

      const raw = await callGemini(promptToSend, SYSTEM_PROMPT);
      const ruleOutput = parseGeminiResponse(raw);

      // Attach a generated UUID
      const compiledRule: CompiledRule = {
        id: randomUUID(),
        ...ruleOutput,
      };

      // Validate against the full CompiledRule schema
      CompiledRuleSchema.parse(compiledRule);

      // Generate and run test cases
      const testResults = generateTestCases(compiledRule);

      const latencyMs = Date.now() - startMs;
      console.log(
        `[RuleCompiler] Compiled "${ruleText}" in ${latencyMs}ms (attempt ${attempt})`
      );

      return {
        compiled_rule: compiledRule,
        test_results: testResults,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.warn(
        `[RuleCompiler] Attempt ${attempt} failed for "${ruleText}": ${lastError}`
      );

      if (attempt === 2) {
        throw new AIServiceError(
          `Rule compilation failed after 2 attempts for "${ruleText}": ${lastError}`
        );
      }
    }
  }

  // Unreachable, satisfies TypeScript
  throw new AIServiceError('Rule compilation failed unexpectedly.');
}
