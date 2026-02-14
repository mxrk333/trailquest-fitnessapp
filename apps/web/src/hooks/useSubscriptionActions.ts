import { useState } from 'react'
import { useAuth } from '@/features/auth/providers/AuthProvider'
import { upgradeToPro, downgradeToFree } from '@/features/subscription/services/subscription'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export function useSubscriptionActions() {
  const { user, refreshProfile, updateProfileLocally } = useAuth()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)

  const upgrade = async () => {
    if (!user) return
    setProcessing(true)

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    try {
      await upgradeToPro(user.uid)
      // Optimistically update local state so UI reflects change immediately
      updateProfileLocally({ subscriptionTier: 'pro' })
      // Trigger background refresh to ensure consistency
      refreshProfile()

      toast.success('🎉 Welcome to TrailQuest Pro!')
      navigate('/')
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const downgrade = async () => {
    if (!user) return
    setProcessing(true)
    try {
      await downgradeToFree(user.uid)
      updateProfileLocally({ subscriptionTier: 'free' })
      refreshProfile()

      toast.success('Downgraded to Free plan.')
    } catch (error) {
      console.error('Downgrade error:', error)
      toast.error('Something went wrong.')
    } finally {
      setProcessing(false)
    }
  }

  return {
    upgrade,
    downgrade,
    processing,
  }
}
