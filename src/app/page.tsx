import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary-700 mb-4">Web Analysis</h1>
          <p className="text-xl text-gray-600">轻量级网站流量分析工具</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">开始使用</h2>
            <p className="mb-4">只需在您的网站中添加以下跟踪代码，即可开始收集访问数据：</p>
            <div className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              <code className="text-sm">
                &lt;script src="https://your-domain.vercel.app/tracker.js" data-website-id="YOUR_WEBSITE_ID"&gt;&lt;/script&gt;
              </code>
            </div>
            <div className="mt-6">
              <Link href="/dashboard" className="btn-primary inline-block">
                查看仪表盘
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">主要功能</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>实时流量监控</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>访问来源分析</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>用户行为跟踪</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>设备和浏览器统计</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">✓</span>
                <span>无需服务器，基于Vercel部署</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="card mb-12">
          <h2 className="text-2xl font-semibold mb-4">如何工作</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary-100 text-primary-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">添加跟踪代码</h3>
              <p className="text-gray-600 text-sm">将我们提供的跟踪代码添加到您的网站中</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 text-primary-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">收集数据</h3>
              <p className="text-gray-600 text-sm">自动收集访问者的行为和统计数据</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 text-primary-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">分析结果</h3>
              <p className="text-gray-600 text-sm">在仪表盘中查看详细的分析报告</p>
            </div>
          </div>
        </div>

        <footer className="text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Web Analysis. 保护您的隐私，尊重访问者数据。</p>
        </footer>
      </div>
    </main>
  );
}