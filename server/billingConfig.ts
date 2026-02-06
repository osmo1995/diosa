export type CreditPackConfig = {
  priceId: string;
  label: string;
  credits: number;
  amountUsd: number;
};

export type SubscriptionTierConfig = {
  priceId: string;
  label: string;
  creditsIncluded: number;
  amountUsdMonthly: number;
};

export function getBillingConfig() {
  const pack25 = process.env.STRIPE_PRICE_PACK_25?.trim();
  const pack55 = process.env.STRIPE_PRICE_PACK_55?.trim();

  const starter = process.env.STRIPE_PRICE_STARTER?.trim();
  const pro = process.env.STRIPE_PRICE_PRO?.trim();
  const studio = process.env.STRIPE_PRICE_STUDIO?.trim();

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

    tiers: [
      starter
        ? ({
            priceId: starter,
            label: 'Starter',
            creditsIncluded: 60,
            amountUsdMonthly: 9,
          } satisfies SubscriptionTierConfig)
        : null,
      pro
        ? ({
            priceId: pro,
            label: 'Pro',
            creditsIncluded: 150,
            amountUsdMonthly: 19,
          } satisfies SubscriptionTierConfig)
        : null,
      studio
        ? ({
            priceId: studio,
            label: 'Studio',
            creditsIncluded: 350,
            amountUsdMonthly: 39,
          } satisfies SubscriptionTierConfig)
        : null,
    ].filter(Boolean) as SubscriptionTierConfig[],
  };
}
