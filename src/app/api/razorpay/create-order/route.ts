import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createOrder } from '@/lib/razorpay/orders';
import { ArovaError, ValidationError } from '@/lib/utils/errors';

// ---------------------------------------------------------------------------
// POST /api/razorpay/create-order
//
// Accepts { amount_paise, receipt, notes } in the body.
// Calls the Razorpay SDK to create an order and returns the order object.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

const CreateOrderSchema = z.object({
  amount_paise: z.number().int().positive(),
  receipt: z.string().min(1).max(256),
  notes: z.record(z.string(), z.string()).optional().default({}),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      );
      throw new ValidationError(`Validation failed: ${errors.join('; ')}`);
    }

    const order = await createOrder(
      parsed.data.amount_paise,
      parsed.data.receipt,
      parsed.data.notes,
    );

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof ArovaError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CreateOrder] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
