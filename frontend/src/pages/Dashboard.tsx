// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import RevenueVsBaselineChart from '../components/RevenueVsBaselineChart'
import PriceDemandRevenueChart from '../components/PriceDemandRevenueChart'
import CustomerSegmentPie from '../components/CustomerSegmentPie'
import ProductPerformanceChart from '../components/ProductPerformanceChart'
import TimePricingChart from '../components/TimePricingChart'
import CustomerRetentionChart from '../components/CustomerRetentionChart'
import PriceSensitivityHeatmap from '../components/PriceSensitivityHeatmap'
import Button from '../components/Button'
import apiClient from '../api/apiClient'

//–– Types for local state ––
interface TrainingStatus {
  isTraining: boolean
  currentEpisode: number
  totalEpisodes: number
}
interface TrainingResults {
  finalReward: number
  avgLast10: number
  improvementOverBaseline: number
  rewardHistory: number[]
  baselineHistory: number[]
}
interface Product {
  name: string
  current_price: number
  stock: number
}
interface Segment {
  name: string
  percentage: number
}
interface PdDatum {
  price: number
  demand: number
  revenue: number
}
interface TimeData {
  timeOfDay: string[]
  priceMultipliers: number[]
}
interface HeatmapDatum {
  product: string
  pricePoints: number[]
  demand: number[]
}

const Dashboard: React.FC = () => {
  //–– state hooks ––
  const [products, setProducts] = useState<Product[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [pdRaw, setPdRaw] = useState<HeatmapDatum[]>([])
  const [pdData, setPdData] = useState<PdDatum[]>([])
  const [timeData, setTimeData] = useState<TimeData>({
    timeOfDay: [],
    priceMultipliers: []
  })
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>({
    isTraining: false,
    currentEpisode: 0,
    totalEpisodes: 0
  })
  const [trainingResults, setTrainingResults] = useState<TrainingResults>({
    finalReward: 0,
    avgLast10: 0,
    improvementOverBaseline: 0,
    rewardHistory: [],
    baselineHistory: []
  })
  const [episodesToRun, setEpisodesToRun] = useState<number>(100)

  //–– load everything on mount ––
  useEffect(() => {
    async function loadAll() {
      try {
        const [
          prods,
          segsRaw,
          priceDemandRaw,
          timeRaw,
          statusRaw,
          resultsRaw
        ] = await Promise.all([
          apiClient.getProducts(),
          apiClient.getCustomerSegments(),
          apiClient.getPriceDemandData(),
          apiClient.getTimePricingData(),
          apiClient.getTrainingStatus(),
          apiClient.getTrainingResults()
        ])

        // products
        setProducts(prods)

        // segments → percentage
        setSegments(
          segsRaw.map((s: any) => ({
            name: s.name,
            percentage: (typeof s.size === 'number' ? s.size : 0) * 100
          }))
        )

        // price–demand–revenue raw
        setPdRaw(priceDemandRaw)

        // flatten first product into pdData
        if (priceDemandRaw.length > 0) {
          const first = priceDemandRaw[0]
          setPdData(
            first.pricePoints.map((p: number, i: number) => ({
              price: p,
              demand: first.demand[i],
              revenue: first.revenue[i]
            }))
          )
        }

        // time‐pricing
        setTimeData({
          timeOfDay: timeRaw.timeOfDay,
          priceMultipliers: timeRaw.priceMultipliers
        })

        // training status & results
        setTrainingStatus(statusRaw)
        setTrainingResults({
          finalReward: Number(resultsRaw.finalReward) || 0,
          avgLast10: Number(resultsRaw.avgLast10) || 0,
          improvementOverBaseline:
            Number(resultsRaw.improvementOverBaseline) || 0,
          rewardHistory: Array.isArray(resultsRaw.rewardHistory)
            ? resultsRaw.rewardHistory.map((v: any) => Number(v) || 0)
            : [],
          baselineHistory: Array.isArray(resultsRaw.baselineHistory)
            ? resultsRaw.baselineHistory.map((v: any) => Number(v) || 0)
            : []
        })
      } catch (e) {
        console.error('Error loading dashboard data:', e)
      }
    }
    loadAll()
  }, [])

  //–– poll training status every 2s when training ––
  useEffect(() => {
    if (!trainingStatus.isTraining) return
    const iv = setInterval(async () => {
      const statusRaw = await apiClient.getTrainingStatus()
      setTrainingStatus(statusRaw)
      if (statusRaw.isTraining) {
        const resultsRaw = await apiClient.getTrainingResults()
        setTrainingResults((r) => ({
          ...r,
          finalReward: Number(resultsRaw.finalReward) || 0,
          avgLast10: Number(resultsRaw.avgLast10) || 0,
          improvementOverBaseline:
            Number(resultsRaw.improvementOverBaseline) || 0,
          rewardHistory: Array.isArray(resultsRaw.rewardHistory)
            ? resultsRaw.rewardHistory.map((v: any) => Number(v) || 0)
            : [],
          baselineHistory: Array.isArray(resultsRaw.baselineHistory)
            ? resultsRaw.baselineHistory.map((v: any) => Number(v) || 0)
            : []
        }))
      }
    }, 2000)
    return () => clearInterval(iv)
  }, [trainingStatus.isTraining])

  //–– start training handler ––
  const handleStart = async () => {
    await apiClient.startTraining({
      episodes: episodesToRun,
      useBaseline: true,
      baselineStrategy: 'combined'
    })
    const statusRaw = await apiClient.getTrainingStatus()
    setTrainingStatus(statusRaw)
  }

  const {
    finalReward,
    avgLast10,
    improvementOverBaseline,
    rewardHistory,
    baselineHistory
  } = trainingResults

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Smart Dynamic Pricing Dashboard" />

      <div className="container mx-auto p-4 space-y-6">
        {/* AI Training Control */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">AI Training</h2>
              {trainingStatus.isTraining ? (
                <p className="text-sm text-gray-600">
                  Episode {trainingStatus.currentEpisode} /{' '}
                  {trainingStatus.totalEpisodes}
                </p>
              ) : (
                <p className="text-sm text-gray-600">Not training</p>
              )}
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              {!trainingStatus.isTraining && (
                <>
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    value={episodesToRun}
                    onChange={(e) => setEpisodesToRun(+e.target.value)}
                    className="border px-2 py-1 rounded"
                  />
                  <Button onClick={handleStart} variant="primary">
                    Start
                  </Button>
                </>
              )}
            </div>
          </div>

          {trainingStatus.isTraining && (
            <div className="w-full h-2 bg-gray-200 rounded mt-3 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{
                  width: `${
                    (trainingStatus.currentEpisode /
                      trainingStatus.totalEpisodes) *
                    100
                  }%`
                }}
              />
            </div>
          )}

          {trainingStatus.isTraining && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <StatCard
                title="Final Reward"
                value={finalReward.toFixed(2)}
                trend={finalReward >= 0 ? 'up' : 'down'}
                trendValue={Math.abs(finalReward).toFixed(2)}
              />
              <StatCard
                title="Avg Last 10"
                value={avgLast10.toFixed(2)}
                trend={avgLast10 >= 0 ? 'up' : 'down'}
                trendValue={Math.abs(avgLast10).toFixed(2)}
              />
              <StatCard
                title="Improvement %"
                value={`${improvementOverBaseline.toFixed(2)}%`}
                trend={improvementOverBaseline >= 0 ? 'up' : 'down'}
                trendValue={`${Math.abs(
                  improvementOverBaseline
                ).toFixed(2)}%`}
              />
            </div>
          )}
        </Card>

        {/* Charts */}
        <Card>
          <h3 className="text-lg font-semibold mb-2">
            Revenue vs Baseline (Cumulative)
          </h3>
          <RevenueVsBaselineChart
            agentRewards={rewardHistory}
            baselineRewards={baselineHistory}
          />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-2">
              Price–Demand–Revenue
            </h3>
            <PriceDemandRevenueChart data={pdData} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-2">
              Customer Segments
            </h3>
            <CustomerSegmentPie data={segments} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-2">
              Projected Revenue
            </h3>
            <ProductPerformanceChart products={products} />
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-2">
              Time-Based Pricing
            </h3>
            <TimePricingChart data={timeData} />
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-2">
              Customer Retention
            </h3>
            <CustomerRetentionChart
              data={{
                months: ['Jan','Feb','Mar','Apr','May','Jun'],
                retention: [95,92,88,90,93,95]
              }}
            />
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-2">
              Price Sensitivity Heatmap
            </h3>
            <PriceSensitivityHeatmap data={pdRaw} />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
