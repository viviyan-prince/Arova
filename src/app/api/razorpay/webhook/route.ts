import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit/logger';
import { AuditEventType } from '@/lib/audit/types';
import type { RazorpayWebhookEvent } from '@/lib/razorpay/types';

// ---------------------------------------------------------------------------
// POST /api/razorpay/webhook
//
// Razorpay sends webhook events here. We verify the signature using
// x-razorpay-signature header and RAZORPAY_WEBHOOK_SECRET, then update
// the corresponding transaction in Supabase.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const start = Date.now();

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET not configured.');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 },
      );
    }

    // --- Read raw body for signature verification ---
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      console.warn('[Webhook] Missing x-razorpay-signature header.');
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 401 },
      );
    }

    // --- Verify webhook signature ---
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex'),
    );

    if (!isValid) {
      console.warn('[Webhook] Invalid signature received.');

      // Log security event (best-effort, we may not know the merchant)
      logAuditEvent({
        merchant_id: '00000000-0000-0000-0000-000000000000',
        event_type: 'SECURITY_WEBHOOK_INVALID_SIGNATURE',
        event_data: { raw_body_length: rawBody.length },
        ai_involved: false,
        decision_reasoning: 'Webhook signature verification failed. Possible tampering or misconfiguration.',
        latency_ms: Date.now() - start,
      }).catch(() => {});

      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 },
      );
    }

    // --- Parse event ---
    const event: RazorpayWebhookEvent = JSON.parse(rawBody);
    const eventType = event.event;
    const supabase = getServerSupabase();

    // --- Map event type to transaction status ---
    let newStatus: string | null = null;
    let auditEventType: string = eventType;

    switch (eventType) {
      case 'payment.authorized':
        newStatus = 'authorized';
        auditEventType = AuditEventType.PAYMENT_ATTEMPT;
        break;
      case 'payment.captured':
        newStatus = 'captured';
        auditEventType = AuditEventType.PAYMENT_SUCCESS;
        break;
      case 'payment.failed':
        newStatus = 'failed';
        auditEventType = AuditEventType.PAYMENT_FAILURE;
        break;
      case 'order.paid':
        newStatus = 'captured';
        auditEventType = AuditEventType.PAYMENT_SUCCESS;
        break;
      default:
        // Unknown event type -- log but do nothing
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }

    // --- Resolve the order id from payload ---
    const razorpayOrderId =
      event.payload.order?.entity?.id ??
      event.payload.payment?.entity?.order_id ??
      null;

    if (newStatus && razorpayOrderId) {
      const updatePayload: Record<string, any> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Attach payment_id if available
      const paymentId = event.payload.payment?.entity?.id;
      if (paymentId) {
        updatePayload.razorpay_payment_id = paymentId;
      }

      // Attach failure reason if payment failed
      if (newStatus === 'failed' && event.payload.payment?.entity) {
        updatePayload.failure_reason =
          event.payload.payment.entity.error_description ??
          event.payload.payment.entity.error_code ??
          'Unknown payment failure';
      }

      const { data: transaction, error: updateErr } = await supabase
        .from('transactions')
        .update(updatePayload)
        .eq('razorpay_order_id', razorpayOrderId)
        .select('id, merchant_id')
        .single();

      const latencyMs = Date.now() - start;

      if (updateErr) {
        console.error(
          `[Webhook] Transaction update failed for order ${razorpayOrderId}:`,
          updateErr.message,
        );
      }

      if (transaction) {
        logAuditEvent({
          merchant_id: transaction.merchant_id,
          transaction_id: transaction.id,
          event_type: auditEventType,
          event_data: {
            webhook_event: eventType,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: paymentId ?? null,
            new_status: newStatus,
          },
          ai_involved: false,
          decision_reasoning: `Webhook ${eventType} processed. Transaction status updated to ${newStatus}.`,
          latency_ms: latencyMs,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing error';
    console.error('[Webhook] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
