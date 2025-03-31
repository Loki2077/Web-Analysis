import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // 在客户端初始化分析跟踪
  useEffect(() => {
    // 排除对分析API的请求
    if (router.pathname.startsWith('/api/')) return;
    
    // 页面浏览事件
    const handleRouteChange = (url: string) => {
      if (typeof window !== 'undefined' && !url.includes('/api/')) {
        fetch('/api/collect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'pageview',
            url: url,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            language: navigator.language,
          }),
        }).catch(err => console.error('Analytics error:', err));
      }
    };

    // 初始页面加载时记录
    handleRouteChange(router.pathname);

    // 监听路由变化
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return <Component {...pageProps} />;
}