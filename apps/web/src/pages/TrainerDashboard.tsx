import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { getTrainerClients } from '@/services/firestore/trainers'
import { User } from '@repo/shared'
import { ClientRow } from '@/components/trainer/ClientRow'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export function TrainerDashboard() {
  const { user } = useAuth()
  const [clients, setClients] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadClients() {
      if (!user) return
      try {
        const clientList = await getTrainerClients(user.uid)
        setClients(clientList)
      } catch (error) {
        console.error('Failed to load clients:', error)
      } finally {
        setLoading(false)
      }
    }
    loadClients()
  }, [user])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trainer Dashboard</h1>
          <p className="text-gray-400">Manage and monitor your clients' progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-dark border border-primary/10 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase">Total Clients</span>
              <span className="material-icons text-primary">group</span>
            </div>
            <div className="text-3xl font-bold text-white">{clients.length}</div>
          </div>

          <div className="bg-surface-dark border border-primary/10 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase">Active Today</span>
              <span className="material-icons text-green-400">trending_up</span>
            </div>
            <div className="text-3xl font-bold text-white">{clients.length}</div>
          </div>

          <div className="bg-surface-dark border border-primary/10 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 uppercase">Needs Attention</span>
              <span className="material-icons text-orange-400">warning</span>
            </div>
            <div className="text-3xl font-bold text-white">0</div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-surface-dark border border-primary/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold text-white">Your Clients</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20 border-b border-white/5">
                <tr className="text-xs uppercase text-gray-400">
                  <th className="text-left px-6 py-4">Client</th>
                  <th className="text-left px-6 py-4">Role</th>
                  <th className="text-left px-6 py-4">Last Active</th>
                  <th className="text-left px-6 py-4">Muscle Load</th>
                  <th className="text-center px-6 py-4">Status</th>
                  <th className="text-right px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-400">Loading clients...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && clients.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <span className="material-icons text-5xl opacity-20">group</span>
                        <p>No clients yet</p>
                        <p className="text-sm text-gray-500">
                          Ask your clients to grant you access in their Profile Settings
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  clients.length > 0 &&
                  clients.map(client => <ClientRow key={client.uid} client={client} />)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
