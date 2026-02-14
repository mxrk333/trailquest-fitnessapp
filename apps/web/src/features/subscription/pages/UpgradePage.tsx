import { useState } from 'react'
import { useAuth } from '@/features/auth/providers/AuthProvider'
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout'
import { PLANS } from '../constants'
import { useSubscriptionActions } from '@/hooks/useSubscriptionActions'

export function UpgradePage() {
  const { profile } = useAuth()
  const currentTier = profile?.subscriptionTier || 'free'
  const { upgrade, downgrade, processing } = useSubscriptionActions()

  const [showCheckout, setShowCheckout] = useState(false)

  // Fake card state (UI only)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-white mb-2">Choose Your Plan</h1>
          <p className="text-slate-400">Unlock the full TrailQuest experience</p>
        </div>

        {/* Pricing Cards */}
        {!showCheckout ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PLANS.map(plan => {
              const isCurrentPlan = currentTier === plan.tier
              const isUpgrade = plan.tier === 'pro' && currentTier === 'free'

              return (
                <div
                  key={plan.name}
                  className={`relative bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border rounded-2xl p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                    plan.popular ? 'border-primary/40 shadow-primary/20' : 'border-white/10'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-green-400 text-background-dark text-xs font-bold rounded-full uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">{plan.price}</span>
                      <span className="text-slate-500 text-sm">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                        <span className="material-icons text-primary text-base">check_circle</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <div className="w-full py-3 rounded-xl text-center text-sm font-bold bg-white/5 text-slate-400 border border-white/10">
                      {currentTier === 'pro' ? (
                        <button
                          onClick={downgrade}
                          disabled={processing}
                          className="w-full text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          {processing ? 'Processing...' : 'Cancel Pro'}
                        </button>
                      ) : (
                        'Current Plan'
                      )}
                    </div>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => setShowCheckout(true)}
                      className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-green-400 text-background-dark shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300"
                    >
                      {plan.cta}
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : (
          /* Mock Checkout Form */
          <div className="max-w-md mx-auto bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border border-primary/20 rounded-2xl p-8 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setShowCheckout(false)}
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <span className="material-icons text-slate-400 text-sm">arrow_back</span>
              </button>
              <h2 className="text-xl font-bold text-white">Upgrade to Pro</h2>
            </div>

            {/* Price Summary */}
            <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">TrailQuest Pro</span>
                <span className="text-white font-bold">$9.99/mo</span>
              </div>
            </div>

            {/* Fake Card Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                    Expiry
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={e => setCvc(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Demo notice */}
            <p className="text-xs text-slate-600 text-center mb-4">
              🔒 Demo mode — no real charges will be made
            </p>

            <button
              onClick={upgrade}
              disabled={processing}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-primary to-green-400 text-background-dark shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-icons text-base">lock</span>
                  Pay $9.99
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
