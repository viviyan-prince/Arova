import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { fetchPayment } from '@/lib/razorpay/payments';
import { logAuditEvent } from '@/lib/audit/logger';
import { AuditEventType } from '@/lib/audit/types';
import { ArovaError, NotFoundError, ValidationError } from '@/lib/utils/errors';
import type { Transaction } from '@/types/transaction';
import type { AgentStatusResponse } from '@/types/agent-protocol';

// ---------------------------------------------------------------------------
// GET /api/agent/status?order_id=<transaction-uuid>
//
// Returns the current status of an order and its Razorpay payment.
// If a razorpay_payment_id is present on the transaction, the handler
// fetches live payment status from Razorpay.
//
// AI is NEVER involved in status lookups.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId || orderId.trim().length === 0) {
      throw new ValidationError('Missing required query parameter: order_id');
    }

    const supabase = getServerSupabase();

    // --- Fetch transaction ---
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', orderId)
      .single();

    if (txnError || !transaction) {
      throw new NotFoundError(`Order "${orderId}" not found.`);
    }

    const txn = transaction as Transaction;

    // --- Optionally fetch live payment status from Razorpay ---
    let paymentStatus = 'pending';

    if (txn.razorpay_payment_id) {
      try {
        const payment = await fetchPayment(txn.razorpay_payment_id);
        paymentStatus = payment.status;
      } catch (paymentError) {
        // If Razorpay fetch fails, fall back to the stored status
        console.warn(
          '[Status] Failed to fetch Razorpay payment status:',
          paymentError instanceof Error ? paymentError.message : String(paymentError),
        );
        paymentStatus = txn.status;
      }
    } else {
      // No payment ID yet -- derive status from transaction record
      paymentStatus = txn.status === 'initiated' ? 'awaiting_payment' : txn.status;
    }

    const response: AgentStatusResponse = {
      order_id: txn.id,
      order_status: txn.status,
      payment_status: paymentStatus,
      items: txn.items,
    };

    const latency_ms = Date.now() - start;

    // --- Audit log (fire-and-forget) ---
    logAuditEvent({
      merchant_id: txn.merchant_id,
      session_id: txn.session_id ?? undefined,
      transaction_id: txn.id,
      event_type: AuditEventType.PAYMENT_ATTEMPT,
      event_data: {
        order_id: txn.id,
        order_status: txn.status,
        payment_status: paymentStatus,
        has_payment_id: !!txn.razorpay_payment_id,
      },
      ai_involved: false,
      decision_reasoning: 'Deterministic status lookup from transaction record and Razorpay API.',
      latency_ms,
    }).catch(() => {});

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const latency_ms = Date.now() - start;

    if (error instanceof ArovaError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Status] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
