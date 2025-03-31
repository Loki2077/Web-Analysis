import Head from 'next/head';
import Link from 'next/link';

export default function Docs() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <Head>
        <title>文档 - Web Analysis</title>
        <meta name="description" content="Web Analysis使用文档" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-4xl mx-auto prose dark:prose-invert">
        <h1 className="text-3xl font-bold mb-8">Web Analysis 使用文档</h1>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-2">目录</h2>
          <ul className="list-disc pl-6">
            <li><a href="#installation" className="text-primary-600 hover:underline">安装与部署</a></li>
            <li><a href="#integration" className="text-primary-600 hover:underline">集成到您的网站</a></li>
            <li><a href="#dashboard" className="text-primary-600 hover:underline">使用分析仪表盘</a></li>
            <li><a href="#events" className="text-primary-600 hover:underline">跟踪自定义事件</a></li>
            <li><a href="#faq" className="text-primary-600 hover:underline">常见问题</a></li>
          </ul>
        </div>

        <section id="installation">
          <h2 className="text-2xl font-semibold mt-6 mb-4">安装与部署</h2>
          
          <h3 className="text-xl font-medium mt-4 mb-2">前提条件</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>GitHub账号</li>
            <li>Vercel账号（可以使用GitHub账号登录）</li>
          </ul>
          
          <h3 className="text-xl font-medium mt-4 mb-2">部署步骤</h3>
          <ol className="list-decimal pl-6 mb-4">
            <li className="mb-2">
              <strong>Fork本仓库</strong>
              <p>访问GitHub仓库并点击右上角的"Fork"按钮</p>
            </li>
            <li className="mb-2">
              <strong>部署到Vercel</strong>
              <p>登录Vercel，点击"New Project"，从GitHub导入您fork的仓库，然后点击"Deploy"</p>
            </li>
            <li className="mb-2">
              <strong>配置Vercel KV存储</strong>
              <p>在Vercel控制台中，选择您的项目，点击"Storage"选项卡，选择"Create"并选择"KV Database"，按照向导完成创建</p>
            </li>
            <li className="mb-2">
              <strong>设置环境变量</strong>
              <p>在Vercel项目设置中，添加环境变量：<code>NEXT_PUBLIC_SITE_URL</code>（您的网站URL）</p>
            </li>
            <li className="mb-2">
              <strong>重新部署项目</strong>
              <p>环境变量添加后，重新部署您的项目以应用更改</p>
            </li>
          </ol>
        </section>

        <section id="integration">
          <h2 className="text-2xl font-semibold mt-6 mb-4">集成到您的网站</h2>
          
          <p className="mb-4">将以下跟踪代码添加到您网站的<code>&lt;head&gt;</code>标签中：</p>
          
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto mb-4">
            <pre className="text-sm">
              <code>{`<script async src="https://your-analysis.vercel.app/tracker.js" data-website-id="YOUR-WEBSITE-ID"></script>`}</code>
            </pre>
          </div>
          
          <p className="mb-4">请将<code>your-analysis.vercel.app</code>替换为您的Vercel部署URL，将<code>YOUR-WEBSITE-ID</code>替换为您为网站选择的唯一标识符（可以是任何字符串）。</p>
        </section>

        <section id="dashboard">
          <h2 className="text-2xl font-semibold mt-6 mb-4">使用分析仪表盘</h2>
          
          <p className="mb-4">部署完成后，您可以访问您的Vercel应用URL查看分析仪表盘。仪表盘提供以下信息：</p>
          
          <ul className="list-disc pl-6 mb-4">
            <li>页面浏览量和独立访客数</li>
            <li>访问趋势（7天、14天、30天）</li>
            <li>平均停留时间</li>
            <li>跳出率</li>
          </ul>
          
          <p className="mb-4">您可以使用日期范围选择器查看不同时间段的数据。</p>
        </section>

        <section id="events">
          <h2 className="text-2xl font-semibold mt-6 mb-4">跟踪自定义事件</h2>
          
          <p className="mb-4">除了自动跟踪页面浏览外，您还可以跟踪自定义事件：</p>
          
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto mb-4">
            <pre className="text-sm">
              <code>{`// 跟踪按钮点击
webAnalytics.trackEvent('button_click', 'signup_button');

// 跟踪表单提交
webAnalytics.trackEvent('form_submit', 'contact_form');`}</code>
            </pre>
          </div>
          
          <p className="mb-4">第一个参数是事件类型，第二个参数是事件值。您可以根据需要自定义这些值。</p>
        </section>

        <section id="faq">
          <h2 className="text-2xl font-semibold mt-6 mb-4">常见问题</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2">数据不显示在仪表盘上</h3>
              <ul className="list-disc pl-6">
                <li>确认跟踪脚本已正确添加到您的网站</li>
                <li>检查浏览器控制台是否有错误</li>
                <li>验证Vercel KV存储是否正确配置</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">如何清除所有数据？</h3>
              <p>您可以通过Vercel KV控制台清除数据，或创建一个管理API端点来执行此操作。</p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">是否支持多个网站？</h3>
              <p>是的，您可以使用不同的<code>data-website-id</code>值来区分不同网站的数据。</p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">如何导出数据？</h3>
              <p>您可以创建一个额外的API端点来导出数据为CSV或JSON格式。</p>
            </div>
          </div>
        </section>

        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/" className="text-primary-600 hover:underline">
            返回仪表盘
          </Link>
        </div>
      </main>
    </div>
  );
}