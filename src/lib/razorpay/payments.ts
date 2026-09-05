import crypto from 'crypto';
import { getRazorpayClient } from '@/lib/razorpay/client';
import { RazorpayError } from '@/lib/utils/errors';
import type { RazorpayPayment, RazorpayPaymentLink } from '@/lib/razorpay/types';

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

export async function fetchPayment(paymentId: string): Promise<RazorpayPayment> {
  const client = getRazorpayClient();
  if (!client) {
    throw new RazorpayError('Razorpay client not initialized. Check API credentials.');
  }

  try {
    const payment = (await client.payments.fetch(paymentId)) as unknown as RazorpayPayment;
    return payment;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Razorpay error';
    throw new RazorpayError(`Failed to fetch payment ${paymentId}: ${message}`);
  }
}

export async function createPaymentLink(params: {
  amount: number;
  currency: string;
  description: string;
  referenceId: string;
  callbackUrl: string;
}): Promise<{ short_url: string; id: string }> {
  const client = getRazorpayClient();
  if (!client) {
    throw new RazorpayError('Razorpay client not initialized. Check API credentials.');
  }

  try {
    const link = (await (client as any).paymentLink.create({
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      reference_id: params.referenceId,
      callback_url: params.callbackUrl,
      callback_method: 'get',
    })) as RazorpayPaymentLink;

    return {
      short_url: link.short_url,
      id: link.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Razorpay error';
    throw new RazorpayError(`Failed to create payment link: ${message}`);
  }
}
