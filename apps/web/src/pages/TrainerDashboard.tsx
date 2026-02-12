import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { getTrainerClients } from '@/services/firestore/trainers'
import { User, UserSchema } from '@repo/shared'
import { ClientRow } from '@/components/trainer/ClientRow'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteField,
  arrayUnion,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'react-hot-toast'

export function TrainerDashboard() {
  const { user } = useAuth()
  const [clients, setClients] = useState<User[]>([])
  const [requests, setRequests] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Fetch Clients
      const clientList = await getTrainerClients(user.uid)
      setClients(clientList)

      // Fetch Requests
      const requestsQuery = query(
        collection(db, 'users'),
        where('pendingTrainerId', '==', user.uid)
      )
      const snapshot = await getDocs(requestsQuery)
      const requestsList: User[] = []
      snapshot.forEach(doc => {
        // Safe parsing with schema if possible, or simple cast
        requestsList.push({ uid: doc.id, ...doc.data() } as User)
      })
      setRequests(requestsList)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleApprove = async (trainee: User) => {
    if (!user) return
    const toastId = toast.loading('Approving request...')
    try {
      await updateDoc(doc(db, 'users', trainee.uid), {
        trainerId: user.uid,
        pendingTrainerId: deleteField(),
        allowedTrainers: arrayUnion(user.email || ''),
      })
      toast.success('Request approved!', { id: toastId })
      fetchData() // Refresh list
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Failed to approve request', { id: toastId })
    }
  }

  const handleReject = async (trainee: User) => {
    if (!window.confirm(`Reject request from ${trainee.displayName || 'this user'}?`)) return

    const toastId = toast.loading('Rejecting request...')
    try {
      await updateDoc(doc(db, 'users', trainee.uid), {
        pendingTrainerId: deleteField(),
      })
      toast.success('Request rejected', { id: toastId })
      fetchData() // Refresh list
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject request', { id: toastId })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Trainer Dashboard</h1>
          <p className="text-gray-400">Manage and monitor your clients' progress</p>
        </div>

        {/* Pending Requests Section */}
        {requests.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-900/10 to-transparent border border-yellow-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-icons text-yellow-500">notifications_active</span>
              Pending Requests
            </h2>
            <div className="grid gap-4">
              {requests.map(req => (
                <div
                  key={req.uid}
                  className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <span className="material-icons text-yellow-500">person</span>
                    </div>
                    <div>
                      <p className="font-bold text-white">{req.displayName || 'Unnamed User'}</p>
                      <p className="text-sm text-gray-400">{req.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(req)}
                      className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleApprove(req)}
                      className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 font-medium transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border border-primary/20 backdrop-blur-xl p-6 rounded-2xl shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Total Clients
              </span>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-icons text-primary">group</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-white">{clients.length}</div>
          </div>

          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border border-green-500/20 backdrop-blur-xl p-6 rounded-2xl shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Active Today
              </span>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <span className="material-icons text-green-400">trending_up</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-white">{clients.length}</div>
          </div>

          <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border border-orange-500/20 backdrop-blur-xl p-6 rounded-2xl shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                Needs Attention
              </span>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <span className="material-icons text-orange-400">warning</span>
              </div>
            </div>
            <div className="text-4xl font-bold text-white">0</div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-gradient-to-br from-surface-dark via-surface-dark to-surface-dark/50 border border-primary/20 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Your Clients</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/30 border-b border-white/10">
                <tr className="text-xs uppercase text-gray-400 tracking-wider">
                  <th className="text-left px-6 py-4 font-semibold">Client</th>
                  <th className="text-left px-6 py-4 font-semibold">Role</th>
                  <th className="text-left px-6 py-4 font-semibold">Last Active</th>
                  <th className="text-left px-6 py-4 font-semibold">Muscle Load</th>
                  <th className="text-center px-6 py-4 font-semibold">Status</th>
                  <th className="text-right px-6 py-4 font-semibold">Actions</th>
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
