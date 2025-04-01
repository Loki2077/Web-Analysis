const FP = require('@fingerprintjs/fingerprintjs')
const LZString = require('lz-string')

class Tracker {
  constructor() {
    this.endpoint = '/api/collect'
    this.queue = []
    this.isSending = false
  }

  async init() {
    this.fp = await FP.load()
    this.fingerprint = await this.fp.get()
    
    // 初始化性能监控
    this.performance = window.performance?.timing
    
    // 自动跟踪核心指标
    this.trackVisit()
    this.trackPageView()
    this.trackEngagement()
  }

  trackVisit() {
    const data = {
      type: 'visit',
      websiteId: window.trackingId,
      timestamp: Date.now(),
      resolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      fingerprint: this.fingerprint.visitorId
    }
    this.queue.push(data)
  }

  trackPageView() {
    const data = {
      type: 'pageview',
      path: location.pathname,
      referrer: document.referrer,
      title: document.title
    }
    this.queue.push(data)
    this.flush()
  }

  trackEvent(name, payload) {
    this.queue.push({
      type: 'event',
      name,
      payload
    })
    this.flush()
  }

  async flush() {
    if (this.isSending || !this.queue.length) return
    
    this.isSending = true
    const batch = this.queue.splice(0, 10)
    
    try {
      // 数据压缩
      const compressed = LZString.compressToEncodedURIComponent(
        JSON.stringify({
          websiteId: window.trackingId,
          batch,
          fingerprint: this.fingerprint.visitorId
        })
      )

      await fetch(this.endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({data: compressed})
      })
    } catch (e) {
      console.error('Tracking error:', e)
      this.queue.unshift(...batch)
    } finally {
      this.isSending = false
      if (this.queue.length) {
        setTimeout(() => this.flush(), 1000)
      }
    }
  }
}

// 初始化跟踪器
window.tracker = new Tracker()
document.addEventListener('DOMContentLoaded', () => tracker.init())