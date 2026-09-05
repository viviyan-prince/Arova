import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { verifyPaymentSignature } from '@/lib/razorpay/payments';
import { logAuditEvent } from '@/lib/audit/logger';
import { AuditEventType } from '@/lib/audit/types';

// ---------------------------------------------------------------------------
// GET /api/razorpay/verify-payment?razorpay_payment_id=...&razorpay_order_id=...&razorpay_signature=...
//
// Razorpay redirects to this URL after a payment attempt.
// Verifies the signature, updates the transaction in Supabase, and
// redirects to /demo?payment=success or /demo?payment=failed.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const baseUrl = new URL(request.url).origin;

  const razorpayPaymentId = searchParams.get('razorpay_payment_id');
  const razorpayOrderId = searchParams.get('razorpay_order_id');
  const razorpaySignature = searchParams.get('razorpay_signature');

  // --- If any param is missing, redirect to failure ---
  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    return NextResponse.redirect(`${baseUrl}/demo?payment=failed&reason=missing_params`);
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('[VerifyPayment] RAZORPAY_KEY_SECRET not configured.');
    return NextResponse.redirect(`${baseUrl}/demo?payment=failed&reason=config_error`);
  }

  try {
    // --- Verify signature ---
    const isValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      secret,
    );

    const supabase = getServerSupabase();

    if (isValid) {
      // --- Update transaction as captured ---
      const { data: transaction, error: updateErr } = await supabase
        .from('transactions')
        .update({
          status: 'captured',
          razorpay_payment_id: razorpayPaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', razorpayOrderId)
        .select('id, merchant_id')
        .single();

      const latencyMs = Date.now() - start;

      if (transaction) {
        logAuditEvent({
          merchant_id: transaction.merchant_id,
          transaction_id: transaction.id,
          event_type: AuditEventType.PAYMENT_SUCCESS,
          event_data: {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
          },
          ai_involved: false,
          decision_reasoning: 'Payment signature verified and transaction marked as captured.',
          latency_ms: latencyMs,
        }).catch(() => {});
      }

      if (updateErr) {
        console.error('[VerifyPayment] Transaction update failed:', updateErr.message);
      }

      return NextResponse.redirect(`${baseUrl}/demo?payment=success`);
    } else {
      // --- Signature invalid ---
      const latencyMs = Date.now() - start;

      // Try to find the transaction for audit logging
      const { data: transaction } = await supabase
        .from('transactions')
        .select('id, merchant_id')
        .eq('razorpay_order_id', razorpayOrderId)
        .single();

      if (transaction) {
        logAuditEvent({
          merchant_id: transaction.merchant_id,
          transaction_id: transaction.id,
          event_type: AuditEventType.PAYMENT_FAILURE,
          event_data: {
            razorpay_order_id: razorpayOrderId,
            reason: 'invalid_signature',
          },
          ai_involved: false,
          decision_reasoning: 'Payment signature verification failed.',
          latency_ms: latencyMs,
        }).catch(() => {});
      }

      return NextResponse.redirect(`${baseUrl}/demo?payment=failed&reason=invalid_signature`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification error';
    console.error('[VerifyPayment] Error:', message);
    return NextResponse.redirect(`${baseUrl}/demo?payment=failed&reason=verification_error`);
  }
}
