import { describe, it } from 'node:test';
import assert from 'node:assert';
import { aiMealResponseSchema } from './geminiService.js';

describe('AI Response Validation Tests', () => {
  it('validates a correct structured AI response', () => {
    const validData = {
      mealName: 'Grilled Chicken & Rice Bowl',
      overallConfidence: 'high',
      items: [
        {
          name: 'Grilled Chicken Breast',
          quantity: 160,
          unit: 'g',
          confidence: 'high',
          estimatedCalories: 260,
          estimatedProtein: 48,
          estimatedCarbs: 0,
          fat: 5,
        },
        {
          name: 'Cooked White Rice',
          quantity: 150,
          unit: 'g',
          confidence: 'medium',
          estimatedCalories: 195,
          estimatedProtein: 4,
          estimatedCarbs: 42,
          fat: 0.5,
        },
      ],
      overallNotes: 'Standard plate portion with lean protein and carbohydrates.',
    };

    const parsed = aiMealResponseSchema.parse(validData);
    assert.strictEqual(parsed.mealName, 'Grilled Chicken & Rice Bowl');
    assert.strictEqual(parsed.items.length, 2);
  });

  it('rejects malformed response missing meal name or items', () => {
    assert.throws(() => {
      aiMealResponseSchema.parse({
        mealName: '',
        items: [],
      });
    });

    assert.throws(() => {
      aiMealResponseSchema.parse({
        mealName: 'Salad',
        items: [{ name: '', quantity: -10 }],
      });
    });
  });
});

