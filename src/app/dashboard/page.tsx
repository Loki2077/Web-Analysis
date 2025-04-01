// 需要先安装 @tremor/react 依赖
// 运行: npm install @tremor/react 或 yarn add @tremor/react
import { Card, LineChart, Title } from '@tremor/react'
import { getDailyStats } from './lib/analytics'

export default async function Dashboard() {
  const stats = await getDailyStats()

  return (
    <div className="p-6">
      <Title className="mb-6 text-2xl font-bold">网站流量分析</Title>
      
      <Card className="mb-6">
        <h3 className="text-lg font-semibold mb-4">访问趋势</h3>
        <LineChart
          data={stats}
          index="date"
          categories={['总访问量', '独立访客']}
          colors={['blue', 'green']}
          curveType="natural"
        />
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">流量来源</h3>
          {/* 来源分布图表 */}
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-4">设备分布</h3>
          {/* 设备类型图表 */}
        </Card>
      </div>
    </div>
  )
}