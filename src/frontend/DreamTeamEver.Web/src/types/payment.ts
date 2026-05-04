/** Rename or extend these to match your backend contract. */

export type CreateCheckoutPayload = {
  amountCents: number
  currency: string
  description?: string
}

/** Typical pattern: backend returns a URL to redirect the user (e.g. Stripe Checkout). */
export type CreateCheckoutResult = {
  url: string
}
