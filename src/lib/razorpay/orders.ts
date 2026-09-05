import { getRazorpayClient } from '@/lib/razorpay/client';
import { RazorpayError } from '@/lib/utils/errors';
import type { RazorpayOrder } from '@/lib/razorpay/types';

export async function createOrder(
  amountInPaise: number,
  receipt: string,
  notes?: Record<string, string>
): Promise<{ id: string; amount: number; currency: string; status: string }> {
  const client = getRazorpayClient();
  if (!client) {
    throw new RazorpayError('Razorpay client not initialized. Check API credentials.');
  }

  try {
    const order = (await client.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: notes ?? {},
    })) as RazorpayOrder;

    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Razorpay error';
    throw new RazorpayError(`Failed to create Razorpay order: ${message}`);
  }
}

export async function fetchOrder(orderId: string): Promise<RazorpayOrder> {
  const client = getRazorpayClient();
  if (!client) {
    throw new RazorpayError('Razorpay client not initialized. Check API credentials.');
  }

  try {
    const order = (await client.orders.fetch(orderId)) as RazorpayOrder;
    return order;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Razorpay error';
    throw new RazorpayError(`Failed to fetch Razorpay order ${orderId}: ${message}`);
  }
}
