import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/providers/AuthProvider'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { UserProfile } from '@/providers/AuthProvider'
import { toast } from 'react-hot-toast'
import { logOut } from '@/services/firestore/auth/auth.service'
import { useNavigate } from 'react-router-dom'

interface UserStats {
  total: number
  hikers: number
  trainers: number
  pendingTrainers: number
}

type Tab = 'overview' | 'trainers' | 'users'

export function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    hikers: 0,
    trainers: 0,
    pendingTrainers: 0,
  })
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const fetchData = async () => {
    try {
      setLoading(true)
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)

      let total = 0
      let hikers = 0
      let trainers = 0
      let pending = 0
      const allUsers: UserProfile[] = []

      snapshot.docs.forEach(doc => {
        const userData = doc.data() as UserProfile
        allUsers.push(userData)
        total++
        if (userData.role === 'hiker') hikers++
        if (userData.role === 'trainer') {
          trainers++
          if (userData.isApproved === false) {
            pending++
          }
        }
      })

      setStats({
        total,
        hikers,
        trainers,
        pendingTrainers: pending,
      })
      setUsers(allUsers)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApproveTrainer = async (trainerUid: string, name: string) => {
    try {
      await updateDoc(doc(db, 'users', trainerUid), {
        isApproved: true,
      })
      toast.success(`Approved trainer ${name}`)
      fetchData()
    } catch (error) {
      console.error('Error approving trainer:', error)
      toast.error('Failed to approve trainer')
    }
  }

  const handleLogout = async () => {
    await logOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const pendingTrainersList = users.filter(u => u.role === 'trainer' && u.isApproved === false)
  const approvedTrainersList = users.filter(u => u.role === 'trainer' && u.isApproved !== false)
  const hikersList = users.filter(
    u => u.role === 'hiker' || (u.role !== 'trainer' && u.role !== 'admin')
  )

  const TabButton = ({ id, label, icon }: { id: Tab; label: string; icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
        activeTab === id
          ? 'bg-primary text-background-dark font-bold'
          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span className="material-icons text-sm">{icon}</span>
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-background-dark text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage users and moderation</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <span className="material-icons text-sm">logout</span>
            Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm uppercase font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm uppercase font-semibold mb-2">Hikers</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.hikers}</p>
          </div>
          <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm uppercase font-semibold mb-2">
              Approved Trainers
            </h3>
            <p className="text-3xl font-bold text-green-400">{approvedTrainersList.length}</p>
          </div>
          <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
            <h3 className="text-gray-400 text-sm uppercase font-semibold mb-2">Pending Trainers</h3>
            <p className="text-3xl font-bold text-yellow-400">{stats.pendingTrainers}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-4">
          <TabButton id="overview" label="Overview" icon="dashboard" />
          <TabButton id="trainers" label="Approved Trainers" icon="fitness_center" />
          <TabButton id="users" label="Hikers & Users" icon="group" />
        </div>

        {/* Content */}
        <div className="bg-surface-dark border border-white/5 rounded-xl overflow-hidden min-h-[400px]">
          {activeTab === 'overview' && (
            <div>
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-icons text-yellow-500">pending_actions</span>
                  Pending Approvals
                </h2>
                <button onClick={fetchData} className="text-sm text-primary hover:text-primary/80">
                  Refresh
                </button>
              </div>

              {pendingTrainersList.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <span className="material-icons text-4xl mb-2 opacity-50">check_circle</span>
                  <p>No pending approvals. All caught up!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/20 text-gray-400 text-xs uppercase">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pendingTrainersList.map(trainer => (
                        <tr key={trainer.uid} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-medium">
                            {trainer.displayName || 'Unnamed'}
                          </td>
                          <td className="px-6 py-4 text-gray-400">{trainer.email}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 text-xs font-bold">
                              PENDING
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() =>
                                handleApproveTrainer(trainer.uid, trainer.displayName || 'Trainer')
                              }
                              className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-primary/20"
                            >
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trainers' && (
            <div>
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-icons text-green-500">verified</span>
                  Approved Trainers ({approvedTrainersList.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Clients</th>
                      <th className="px-6 py-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {approvedTrainersList.map(trainer => (
                      <tr key={trainer.uid} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium">
                          {trainer.displayName || 'Unnamed'}
                        </td>
                        <td className="px-6 py-4 text-gray-400">{trainer.email}</td>
                        <td className="px-6 py-4 text-gray-500">-</td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {(trainer.createdAt as any)?.toDate
                            ? (trainer.createdAt as any).toDate().toLocaleDateString()
                            : 'Unknown'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-icons text-blue-500">groups</span>
                  Hikers & Users ({hikersList.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {hikersList.map(user => (
                      <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium">{user.displayName || 'Unnamed'}</td>
                        <td className="px-6 py-4 text-gray-400">{user.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                              user.role === 'hiker'
                                ? 'bg-blue-500/20 text-blue-500'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {user.role || 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {(user.createdAt as any)?.toDate
                            ? (user.createdAt as any).toDate().toLocaleDateString()
                            : 'Unknown'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
