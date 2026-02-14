import { Chart } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
} from 'chart.js'
import { useQuery } from '@tanstack/react-query'
import { getRecentWorkouts } from '@/features/workouts/services/workouts'
import { getRecentHikes } from '@/features/hikes/services/hikes'
import { useAuth } from '@/features/auth/providers/AuthProvider'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController
)

interface VolumeTrendChartProps {
  userId?: string // Optional: defaults to logged-in user
}

export function VolumeTrendChart({ userId }: VolumeTrendChartProps = {}) {
  const { user } = useAuth()
  const targetUserId = userId || user?.uid

  const { data: workouts = [], isLoading: loadingWorkouts } = useQuery({
    queryKey: ['workouts-for-volume', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      return await getRecentWorkouts(targetUserId, 30) // Last 30 workouts
    },
    enabled: !!targetUserId,
  })

  const { data: hikes = [], isLoading: loadingHikes } = useQuery({
    queryKey: ['hikes-for-analytics', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return []
      return await getRecentHikes(targetUserId, 30) // Last 30 hikes
    },
    enabled: !!targetUserId,
  })

  // Combine and sort data
  const combinedData = [
    ...workouts.map(w => {
      const totalVolume = w.exercises.reduce((acc, ex) => {
        const exerciseVolume = ex.sets
          .filter(s => s.completed)
          .reduce((sum, set) => sum + set.weight * set.reps, 0)
        return acc + exerciseVolume
      }, 0)
      return {
        date: w.timestamp,
        value: totalVolume,
        type: 'workout' as const,
        name: w.name || 'Workout',
      }
    }),
    ...hikes.map(h => ({
      date: h.timestamp,
      value: h.elevationGain, // Use elevation as the metric for hikes
      type: 'hike' as const,
      name: `Hike: ${h.mountain || 'Trail'}`,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  // We need to merge data points on the same day or just list them sequentially?
  // Chart.js Category scale works best with unique labels.
  // Let's group by date string.
  const groupedData: Record<string, { workoutVolume: number; hikeElevation: number }> = {}

  combinedData.forEach(item => {
    const dateStr = item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (!groupedData[dateStr]) {
      groupedData[dateStr] = { workoutVolume: 0, hikeElevation: 0 }
    }
    if (item.type === 'workout') {
      groupedData[dateStr].workoutVolume += item.value
    } else {
      groupedData[dateStr].hikeElevation += item.value
    }
  })

  const labels = Object.keys(groupedData)
  const workoutData = labels.map(label => groupedData[label].workoutVolume)
  const hikeData = labels.map(label => groupedData[label].hikeElevation)

  const chartData = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'Gym Volume (kg)',
        data: workoutData,
        borderColor: '#13ec5b',
        backgroundColor: 'rgba(19, 236, 91, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#13ec5b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        yAxisID: 'y',
      },
      {
        type: 'bar' as const,
        label: 'Hike Elevation (m)',
        data: hikeData,
        backgroundColor: 'rgba(249, 115, 22, 0.6)', // Orange for hikes
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'y1',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#94a3b8',
          font: { size: 10 },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            if (context.dataset.label.includes('Gym')) return `Volume: ${context.parsed.y} kg`
            return `Elevation: ${context.parsed.y} m`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (value: any) => `${value}kg`,
        },
        title: {
          display: false,
          text: 'Volume (kg)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
        ticks: {
          color: '#f97316', // Orange matching hikes
          font: { size: 11 },
          callback: (value: any) => `${value}m`,
        },
        title: {
          display: false,
          text: 'Elevation (m)',
        },
      },
    },
  }

  if (loadingWorkouts || loadingHikes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (labels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <span className="material-icons text-5xl mb-2 opacity-20">trending_up</span>
        <p>No activity data yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Start logging workouts or hikes to see trending data
        </p>
      </div>
    )
  }

  return (
    <div className="h-64">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  )
}
