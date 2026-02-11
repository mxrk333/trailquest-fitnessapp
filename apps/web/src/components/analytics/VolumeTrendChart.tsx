import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { useQuery } from '@tanstack/react-query'
import { getRecentWorkouts } from '@/services/firestore/workouts'
import { useAuth } from '@/providers/AuthProvider'
import { Workout } from '@repo/shared'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export function VolumeTrendChart() {
  const { user } = useAuth()

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workouts-for-volume', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return []
      return await getRecentWorkouts(user.uid, 30) // Last 30 workouts
    },
    enabled: !!user?.uid,
  })

  // Calculate total volume per workout (Weight × Reps summed across all exercises)
  const volumeData = workouts
    .map(w => {
      const totalVolume = w.exercises.reduce((acc, ex) => {
        const exerciseVolume = ex.sets
          .filter(s => s.completed)
          .reduce((sum, set) => sum + set.weight * set.reps, 0)
        return acc + exerciseVolume
      }, 0)

      return {
        date: w.timestamp,
        volume: totalVolume,
        name: w.name || 'Workout',
      }
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const chartData = {
    labels: volumeData.map(d =>
      d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Total Volume (kg)',
        data: volumeData.map(d => d.volume),
        borderColor: '#13ec5b',
        backgroundColor: 'rgba(19, 236, 91, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#13ec5b',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        bodyColor: '#13ec5b',
        borderColor: '#13ec5b',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.parsed.y.toFixed(0)} kg`,
          title: (context: any) => volumeData[context[0].dataIndex]?.name || 'Workout',
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
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
          callback: (value: any) => `${value} kg`,
        },
      },
    },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (volumeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <span className="material-icons text-5xl mb-2 opacity-20">trending_up</span>
        <p>No workout data yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Start logging workouts to see your volume trend
        </p>
      </div>
    )
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  )
}
