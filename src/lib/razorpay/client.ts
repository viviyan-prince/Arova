import Razorpay from 'razorpay';

let razorpayInstance: Razorpay | null = null;

function initRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn(
      '[Arova] Razorpay credentials missing. ' +
      'Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local. ' +
      'Payment features will be unavailable.'
    );
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export function getRazorpayClient(): Razorpay | null {
  if (!razorpayInstance) {
    razorpayInstance = initRazorpay();
  }
  return razorpayInstance;
}

export const razorpay: Razorpay | null = initRazorpay();
