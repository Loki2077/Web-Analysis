import Head from 'next/head';
import Link from 'next/link';

export default function Privacy() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <Head>
        <title>隐私政策 - Web Analysis</title>
        <meta name="description" content="Web Analysis隐私政策" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-4xl mx-auto prose dark:prose-invert">
        <h1 className="text-3xl font-bold mb-8">隐私政策</h1>
        
        <p className="mb-4">
          Web Analysis是一个注重隐私的网站分析工具。我们理解数据隐私的重要性，
          并致力于以透明的方式收集和处理数据。本隐私政策概述了我们如何收集、使用和保护您的数据。
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">我们收集的数据</h2>
        <p>我们收集以下匿名数据：</p>
        <ul className="list-disc pl-6 mb-4">
          <li>页面浏览量和访问时间</li>
          <li>引荐来源（从哪个网站访问）</li>
          <li>浏览器类型和版本</li>
          <li>设备类型和屏幕尺寸</li>
          <li>访问者的大致地理位置（基于IP地址，但不存储完整IP）</li>
          <li>用户在网站上的行为（如点击和页面停留时间）</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">我们不收集的数据</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>个人身份信息（如姓名、电子邮件地址）</li>
          <li>密码或账户信息</li>
          <li>支付详情</li>
          <li>完整的IP地址</li>
          <li>用户输入的表单数据</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">数据使用方式</h2>
        <p>收集的数据仅用于：</p>
        <ul className="list-disc pl-6 mb-4">
          <li>提供网站访问统计和分析</li>
          <li>改进网站用户体验</li>
          <li>监控网站性能</li>
          <li>识别和解决技术问题</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">数据存储</h2>
        <p className="mb-4">
          所有数据都存储在Vercel KV数据库中，采用安全措施保护。数据保留期限为90天，之后将自动删除。
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">第三方访问</h2>
        <p className="mb-4">
          我们不会将收集的数据出售、出租或与任何第三方共享。数据仅供网站所有者访问。
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">用户选择</h2>
        <p className="mb-4">
          网站访问者可以通过以下方式选择不被跟踪：
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>启用浏览器的"请勿跟踪"设置</li>
          <li>使用广告拦截器或隐私保护扩展</li>
          <li>禁用JavaScript</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">政策更新</h2>
        <p className="mb-4">
          我们可能会不时更新此隐私政策。任何更改都将在此页面上发布。
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">联系我们</h2>
        <p className="mb-4">
          如果您对我们的隐私政策有任何疑问，请通过GitHub仓库联系我们。
        </p>

        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/" className="text-primary-600 hover:underline">
            返回仪表盘
          </Link>
        </div>
      </main>
    </div>
  );
}