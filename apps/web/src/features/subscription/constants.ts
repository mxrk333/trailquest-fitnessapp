export const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    tier: 'free' as const,
    features: [
      '1 trainer connection',
      'Workout logging',
      'Hike tracking',
      'Nutrition logging',
      'Basic analytics',
    ],
    cta: 'Current Plan',
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    tier: 'pro' as const,
    features: [
      'Unlimited trainer connections',
      'Everything in Free',
      'Priority support',
      'Advanced analytics',
      'Daily habit tracking',
      'Personal bests trophy room',
    ],
    cta: 'Upgrade Now',
    popular: true,
  },
]
