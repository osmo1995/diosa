export type CreditPackConfig = {
  priceId: string;
  label: string;
  credits: number;
  amountUsd: number;
};

export function getBillingConfig() {
  const pack25 = process.env.STRIPE_PRICE_PACK_25?.trim();
  const pack55 = process.env.STRIPE_PRICE_PACK_55?.trim();

  return {
    packs: [
      pack25
        ? ({
            priceId: pack25,
            label: 'Buy 25 generations',
            credits: 25,
            amountUsd: 5,
          } satisfies CreditPackConfig)
        : null,
      pack55
        ? ({
            priceId: pack55,
            label: 'Buy 55 generations',
            credits: 55,
            amountUsd: 10,
          } satisfies CreditPackConfig)
        : null,
    ].filter(Boolean) as CreditPackConfig[],
  };
}
