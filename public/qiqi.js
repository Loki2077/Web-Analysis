// == Tracker 追踪器 ==
// 这是一个将被注入到被监控网站中的脚本。
// 它的主要任务是收集用户的浏览器和设备信息，
// 并将这些数据通过 GoEasy 发送到分析系统。
(function () {
    // --- Configuration ---
    const DEV_MODE = false; // DEV_MODE: 开发模式标记, 设为 true 开启开发模式，输出详细日志，设为 false 关闭开发模式。

    const IP_FETCH_URL = "https://api.ipify.org?format=json"; // URL to fetch IP address
    const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"; // URL for reverse geocoding
    const TRACKED_EVENTS = ["click", "input", "submit", "view", "heartbeat"]; // 需要追踪的事件类型
    const HEARTBEAT_INTERVAL = 90 * 1000; // 心跳间隔时间 (30秒)

    // 数据收集 endpoint URL
    const COLLECT_ENDPOINT = getCollectUrl(); // 假设你的数据收集 API endpoint 是 /api/collect
    function getCollectUrl() {
        try {
            let scriptUrl = null;

            // 优先使用 document.currentScript 获取当前脚本 URL (现代浏览器)
            if (document.currentScript) {
                scriptUrl = document.currentScript.src;
                if (DEV_MODE)
                    console.log(
                        "[tracker] 通过 document.currentScript 获取脚本 URL:",
                        scriptUrl
                    );
            } else {
                // 回退到遍历 script 标签的方式 (兼容旧版浏览器)
                if (DEV_MODE)
                    console.warn(
                        "[tracker] document.currentScript 不支持，回退到遍历 script 标签。"
                    );
                const scripts = document.getElementsByTagName("script");
                for (let i = 0; i < scripts.length; i++) {
                    // 查找包含当前脚本文件名的标签
                    // 这里的匹配逻辑可能需要根据实际文件名进行调整
                    if (scripts[i].src && scripts[i].src.includes("/tracker.js")) {
                        // 假设脚本文件名为 tracker.js
                        scriptUrl = scripts[i].src;
                        if (DEV_MODE)
                            console.log(
                                "[tracker] 通过遍历 script 标签获取脚本 URL:",
                                scriptUrl
                            );
                        break;
                    }
                }
            }
            // 提取域名
            if (scriptUrl) {
                const url = new URL(scriptUrl);
                // 构建前缀：协议 + 主机 (域名:端口)
                const prefix = `${url.protocol}//${url.host}`;
                scriptUrl = `${prefix}/api/collect`;
                if (DEV_MODE)
                    console.log("[tracker] 数据收集 endpoint 构建完成:", scriptUrl);
                return scriptUrl;
            } else {
                scriptUrl = `https://webanalysis.arol.top/`;
                if (DEV_MODE)
                    console.warn(
                        "[tracker] 无法获取脚本 URL，使用默认相对路径:",
                        scriptUrl
                    );
                return scriptUrl;
            }
        } catch (error) {
            if (DEV_MODE)
                console.error("[tracker] 获取数据收集 endpoint 时发生错误:", error);
        }
    }

    // 收集数据初始化
    const data = {
        browser: getBrowser(),
        os: getOS(),
        timezone: getTimezone(),
        language: getLanguage(),
        domain: window.location.hostname, // 获取域名
        ip: null, // 初始化为 null，等待异步获取
        location: null, // 初始化为 null，等待异步获取地理位置
        fingerprint: null, // 初始化为 null，在异步获取 IP 后生成
    };

    /**
     * 获取当前操作系统信息。
     * 通过检查 navigator.userAgent 字符串来判断用户正在使用的操作系统。
     *
     * @returns {string} 操作系统名称 (例如 "Windows", "MacOS", "Linux", "Android", "iOS", "Unknown")
     */
    function getOS() {
        const userAgent = navigator.userAgent; // userAgent: 包含浏览器和操作系统信息的字符串。
        let os = "Unknown"; // os: 存储操作系统信息，默认为 "Unknown"。
        // 检查操作系统类型。
        // 在 userAgent 中搜索 "Win"，确定是否为 Windows 系统。
        if (userAgent.indexOf("Win") != -1) {
            os = "Windows";
        } // 如果包含 "Win"，则操作系统为 Windows。
        // 在 userAgent 中搜索 "Mac"，确定是否为 MacOS 系统。
        if (userAgent.indexOf("Mac") != -1) {
            os = "MacOS";
        } // 如果包含 "Mac"，则操作系统为 MacOS。
        // 在 userAgent 中搜索 "Linux"，确定是否为 Linux 系统。
        if (userAgent.indexOf("Linux") != -1) {
            os = "Linux";
        } // 如果包含 "Linux"，则操作系统为 Linux。
        // 在 userAgent 中搜索 "Android"，确定是否为 Android 系统。
        if (userAgent.indexOf("Android") != -1) {
            os = "Android";
        } // 如果包含 "Android"，则操作系统为 Android。
        // 判断是否为 iOS 系统。
        // "like Mac" 用于识别 iOS 设备，并且 navigator.maxTouchPoints > 1 是一个额外的 iOS 检查。
        if (userAgent.indexOf("like Mac") != -1 && navigator.maxTouchPoints > 1) {
            os = "iOS";
        } // 更可靠的 iOS 检测。
        return os;
    }

    // 获取当前的浏览器类型
    function getBrowser() {
        const userAgent = navigator.userAgent;
        let browser = "Unknown";
        let version = "Unknown";
        const ua = userAgent.toLowerCase();

        if (ua.includes("firefox/")) {
            browser = "Firefox";
            version = ua.split("firefox/")[1].split(" ")[0];
        } else if (ua.includes("edg/")) {
            browser = "Edge";
            version = ua.split("edg/")[1].split(" ")[0];
        } else if (ua.includes("opr/") || ua.includes("opera")) {
            browser = "Opera";
            version = ua.includes("opr/")
                ? ua.split("opr/")[1].split(" ")[0]
                : ua.split("version/")[1]?.split(" ")[0];
        } else if (ua.includes("chrome/") && !ua.includes("chromium")) {
            // Exclude Chromium-based Edge/Opera
            browser = "Chrome";
            version = ua.split("chrome/")[1].split(" ")[0];
        } else if (
            ua.includes("safari/") &&
            !ua.includes("chrome") &&
            !ua.includes("android")
        ) {
            // Exclude Chrome/Android
            browser = "Safari";
            version = ua.split("version/")[1]?.split(" ")[0];
            if (!version && ua.includes("applewebkit")) {
                // Fallback for iOS Safari
                // const match = ua.match(/version\/([\d\.]+).*safari/);
                if (match) version = match[1];
            }
        }
        return { name: browser, version: version || "Unknown" };
    }

    /**
     * 获取当前用户的时区信息。
     * 使用 Intl.DateTimeFormat().resolvedOptions().timeZone 来获取用户设备设置的时区。
     *
     * @returns {string} 用户时区 (例如 "America/New_York", "Asia/Shanghai", "Unknown")
     */
    function getTimezone() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (e) {
            return "Unknown"; // 当获取时区失败时，返回 "Unknown"。
        }
    }

    // 获取当前用户的语言偏好。
    function getLanguage() {
        // navigator.language 或 navigator.userLanguage 包含用户首选语言的信息。
        return navigator.language || navigator.userLanguage || "Unknown";
    }

    /**
     * 获取当前用户的地理位置信息，并通过反向地理编码获取地名。
     * （需要用户授权，浏览器的api）
     *
     * @returns {Promise<Object>} 包含地理位置信息的对象，如果成功则包含地名和经纬度，如果失败则包含错误信息
     */
    function getGeolocation() {
        return new Promise((resolve) => {
            // Never reject, just resolve with error info
            if (!navigator.geolocation) {
                resolve({ error: "当前浏览器不支持地理定位功能。" });
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    // 先保存原始的经纬度信息
                    const locationInfo = {
                        latitude: latitude,
                        longitude: longitude,
                    };

                    // 尝试获取地名信息
                    try {
                        const placeName = await getPlaceNameFromCoordinates(
                            latitude,
                            longitude
                        );
                        if (placeName) {
                            // 如果成功获取地名，添加到结果中
                            locationInfo.placeName = placeName;
                            locationInfo.displayName = `${placeName} (${latitude.toFixed(
                                6
                            )}, ${longitude.toFixed(6)})`;
                        }
                    } catch (error) {
                        if (DEV_MODE) console.error("[tracker] 获取地名失败:", error);
                        // 即使获取地名失败，仍然返回经纬度信息
                    }
                    resolve(locationInfo);
                },
                (error) => {
                    resolve({ error: `地理定位错误 (${error.code}): ${error.message}` });
                },
                {
                    // Options: enable high accuracy, set timeout, max age
                    enableHighAccuracy: false,
                    timeout: 5000, // 5 seconds
                    maximumAge: 0, // Do not use cached location
                }
            );
        });
    }

    /**
     * 使用Nominatim API将经纬度转换为地名
     *
     * @param {number} latitude - 纬度
     * @param {number} longitude - 经度
     * @returns {Promise<string|null>} 地名，如果获取失败则返回null
     */
    async function getPlaceNameFromCoordinates(latitude, longitude) {
        try {
            // 构建Nominatim API请求URL
            const url = `${NOMINATIM_URL}?lat=${latitude}&lon=${longitude}&format=json&zoom=14&addressdetails=1`;

            // 添加自定义User-Agent以遵循Nominatim使用政策
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "InsightTracker/1.0",
                },
            });

            if (!response.ok) {
                throw new Error(`Nominatim API请求失败: ${response.status}`);
            }

            const data = await response.json();

            // 从响应中提取有用的地址信息
            if (data && data.display_name) {
                // 可以根据需要从完整地址中提取更具体的部分
                // 例如：城市、街道等
                const addressParts = [];

                // 按优先级添加地址组件
                if (data.address) {
                    const address = data.address;
                    // 街道/道路名称
                    if (address.road || address.street) {
                        addressParts.push(address.road || address.street);
                    }

                    // 社区/街区
                    if (address.suburb || address.neighbourhood || address.quarter) {
                        addressParts.push(
                            address.suburb || address.neighbourhood || address.quarter
                        );
                    }

                    // 城市/镇
                    if (address.city || address.town || address.village) {
                        addressParts.push(address.city || address.town || address.village);
                    }

                    // 区/县
                    if (address.district || address.county) {
                        addressParts.push(address.district || address.county);
                    }

                    // 省/州
                    if (address.state || address.province) {
                        addressParts.push(address.state || address.province);
                    }

                    // 国家
                    if (address.country) {
                        addressParts.push(address.country);
                    }
                }

                // 如果能够提取出地址组件，则返回组合后的地址
                if (addressParts.length > 0) {
                    return addressParts.join(", ");
                }

                // 如果无法提取出具体组件，则返回完整的display_name
                return data.display_name;
            }

            return null;
        } catch (error) {
            if (DEV_MODE) console.error("[tracker] 反向地理编码错误:", error);
            return null;
        }
    }

    /**
     * Cookie相关配置
     */
    const COOKIE_CONFIG = {
        name: "tracker_id", // cookie名称
        expirationDays: 365, // cookie过期时间（天）
        path: "/", // cookie路径
        sameSite: "Lax", // cookie SameSite属性
        domain: "", // 留空表示当前域名，可以设置为顶级域名以在子域名间共享
    };

    /**
     * 设置cookie
     *
     * @param {string} name - cookie名称
     * @param {string} value - cookie值
     * @param {number} expirationDays - 过期天数
     * @param {string} path - cookie路径
     * @param {string} sameSite - SameSite属性
     * @param {string} domain - cookie域名
     */
    function setCookie(name, value, expirationDays, path, sameSite, domain) {
        const date = new Date();
        date.setTime(date.getTime() + expirationDays * 24 * 60 * 60 * 1000);
        const expires = "expires=" + date.toUTCString();
        let cookieString = `${name}=${value}; ${expires}; path=${path}; SameSite=${sameSite}`;

        // 只有当指定了domain时才添加domain属性
        if (domain) {
            cookieString += `; domain=${domain}`;
        }

        // 如果是HTTPS连接，添加Secure标志
        if (window.location.protocol === "https:") {
            cookieString += "; Secure";
        }

        document.cookie = cookieString;
        if (DEV_MODE) console.log(`[tracker] Cookie已设置: ${name}=${value}`);
    }

    /**
     * 获取cookie值
     *
     * @param {string} name - cookie名称
     * @returns {string|null} cookie值，如果不存在则返回null
     */
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(";");
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }

    /**
     * 生成一个随机的8为UUID v4 + ip
     *
     * @returns {string} UUID字符串
     */
    function generateUUIDWithIP(ip) {
        // 如果当前ip存在，
        if (ip) {
            // 生成一个随机的八位十六进制数
            const randomEightChars = Math.random()
                .toString(16)
                .substring(2, 10)
                .padEnd(8, "0");
            // 将随机八位数与 IP 地址拼接
            return randomEightChars + "-" + ip.replace(/\./g, "-"); // 将 IP 地址中的点替换为横杠，避免格式问题
        }
        // 如果ip不存在，则使用原有的方式生成 UUID v4
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    }

    /**
     * 创建或获取设备指纹
     * 使用cookie存储设备指纹，确保跨会话一致性
     *
     * @returns {string} 设备指纹
     */
    function createSimpleFingerprint() {
        // 尝试从cookie中获取现有指纹
        let fingerprint = getCookie(COOKIE_CONFIG.name);

        // 如果cookie中没有指纹，则创建一个新的
        if (!fingerprint) {
            // 生成一个新的UUID作为指纹
            fingerprint = generateUUIDWithIP(data.ip);

            // 将指纹保存到cookie中
            setCookie(
                COOKIE_CONFIG.name,
                fingerprint,
                COOKIE_CONFIG.expirationDays,
                COOKIE_CONFIG.path,
                COOKIE_CONFIG.sameSite,
                COOKIE_CONFIG.domain
            );
            if (DEV_MODE) console.log(`[tracker] 创建了新的设备指纹: ${fingerprint}`);
        } else {
            if (DEV_MODE) console.log(`[tracker] 使用现有的设备指纹: ${fingerprint}`);
        }
        return fingerprint;
    }

    /**
     * 获取用户的公共 IP 地址。
     * 使用第三方 API (ipify) 来获取。
     * @returns {Promise<string|null>} A promise that resolves with the IP address string or null if fetching fails.
     */
    async function getIPAddress() {
        try {
            const response = await fetch(IP_FETCH_URL);
            if (!response.ok) {
                throw new Error(`IP fetch failed with status: ${response.status}`);
            }
            const ipData = await response.json();
            return ipData.ip || null;
        } catch (error) {
            if (DEV_MODE) console.error("[tracker] 获取ip失败:", error);
            return null; // Return null on failure
        }
    }

    /**
     * 跟踪用户事件（点击、输入、表单提交、浏览等）
     *
     * @param {Event} event - 浏览器事件对象
     */
    function trackUserEvent(event, options = {}) {
        try {
            // 确保 event 对象有 type 属性
            const eventType = event.type;
            // 只处理我们关心的事件类型
            if (!eventType || !TRACKED_EVENTS.includes(event.type)) return;

            // 基本事件信息
            const eventData = {
                type: event.type,
                timestamp: new Date().toISOString(),
                domain: data.domain,
                fingerprint: data.fingerprint, // 使用 data 对象中的指纹
                typeData: {}, // 稍后填充

                // ip: data.ip, // 使用 data 对象中的 IP
                // url: window.location.href,
                // referrer: document.referrer || null, // 添加 referrer 字段
            };

            // 根据事件类型添加特定信息
            switch (event.type) {
                case "click":
                    // 获取点击的元素信息
                    const clickedElement = event.target;
                    eventData.typeData.elementType = clickedElement.tagName
                        ? clickedElement.tagName.toLowerCase()
                        : null;

                    // 获取点击坐标（相对于页面）
                    eventData.typeData.pageX = event.pageX;
                    eventData.typeData.pageY = event.pageY;

                    // 获取点击的具体内容
                    // 尝试获取元素的文本内容
                    const elementText = clickedElement.textContent?.trim();
                    if (elementText) {
                        eventData.typeData.clickedContent = elementText;
                    }

                    // 获取元素的alt或title属性（通常用于图片或其他元素的描述）
                    if (clickedElement.alt) {
                        eventData.typeData.clickedAlt = clickedElement.alt;
                    } else if (clickedElement.title) {
                        eventData.typeData.clickedTitle = clickedElement.title;
                    }

                    // 如果点击的是链接，记录链接目标
                    if (
                        clickedElement.tagName.toLowerCase() === "a" &&
                        clickedElement.href
                    ) {
                        eventData.typeData.linkTarget = clickedElement.href;
                    }

                    // 如果点击的是图片，记录图片信息
                    if (
                        clickedElement.tagName.toLowerCase() === "img" &&
                        clickedElement.src
                    ) {
                        eventData.typeData.imageSrc = clickedElement.src;
                    }
                    break;
                case "input":
                    // 获取输入事件的详细数据
                    const targetElement = event.target;
                    eventData.typeData.elementType = targetElement.tagName
                        ? targetElement.tagName.toLowerCase()
                        : null; // 元素类型 (input, textarea, etc.)
                    eventData.typeData.elementId = targetElement.id || null; // 元素ID
                    eventData.typeData.elementName = targetElement.name || null; // 元素name属性
                    eventData.typeData.elementClass = targetElement.className || null; // 元素类名
                    eventData.typeData.inputValue = targetElement.value || null; // 获取输入的值
                    break; // 添加 break
                case "submit":
                    // 获取表单提交信息
                    const form = event.target;
                    eventData.typeData.elementType = "form";
                    eventData.typeData.formId = form.id || null;
                    eventData.typeData.formAction = form.action || null;
                    eventData.typeData.formMethod = form.method || "get";

                    // 记录表单中字段数量，不记录具体内容
                    const formElements = form.elements;
                    eventData.typeData.formFieldCount = formElements.length;

                    // 获取表单详细数据
                    const formData = new FormData(form);
                    const formDataDetails = {};
                    for (const [name, value] of formData.entries()) {
                        // 过滤掉敏感信息，例如密码字段
                        // if (typeof name === 'string' && name.toLowerCase().includes('password')) {
                        //     formDataDetails[name] = '[FILTERED]'; // 或者其他脱敏处理
                        // } else {
                        //     formDataDetails[name] = value;
                        // }
                        // 不过滤敏感信息
                        formDataDetails[name] = value;
                    }
                    eventData.typeData.formData = formDataDetails; // 添加表单详细数据到事件数据中
                    break;
                case "view":
                    // 身份数据
                    (eventData.ip = data.ip), // 使用 data 对象中的 IP
                    (eventData.url = window.location.href),
                    (eventData.referrer = document.referrer || null), // 添加 referrer 字段
                    (eventData.browser = data.browser),
                    (eventData.os = data.os),
                    (eventData.timezone = data.timezone),
                    (eventData.language = data.language),
                    (eventData.location = data.location || null), // 地理位置
                    // 获取页面查看事件的详细数据
                    (eventData.typeData.pageTitle = document.title || null);
                    eventData.typeData.pageUrl = window.location.href || null;
                    eventData.typeData.viewportSize = `${window.innerWidth}x${window.innerHeight}`;
                    eventData.typeData.screenResolution = `${screen.width}x${screen.height}`;
                    // 如果需要，可以在这里添加性能指标的收集
                    break;
                case "heartbeat":
                    // 心跳事件不需要额外数据，基本信息足够
                    break;
                case "heartbeat_offonline":
                    // 心跳事件不需要额外数据，基本信息足够
                    break;
            }

            // 发送事件数据
            sendEventData(eventData, options); // 将 options 传递给 sendEventData
        } catch (error) {
            if (DEV_MODE)
                console.error(`[tracker] 跟踪${event.type}事件时出错:`, error);
        }
    }

    /**
     * 数据发送函数
     * 优先使用 navigator.sendBeacon 发送数据，特别是在页面卸载前。
     *
     * @param {object} data - 要发送的事件数据对象
     */
    function sendEventData(data, options = {}) {
        if (DEV_MODE) console.warn(" 打印发送地址", COLLECT_ENDPOINT);

        const payload = JSON.stringify(data);
        const blob = new Blob([payload], { type: "application/json" });

        if (DEV_MODE) console.log("[tracker] 正在尝试发送事件数据:", data);

        // 检查是否支持 sendBeacon 并且当前不在 beforeunload 事件中（或者就是为了 beforeunload 调用）
        // 注意：sendBeacon 在 beforeunload 中使用最可靠
        // 在其他场景下，fetch 通常是更好的选择，因为它提供了更多控制和响应处理
        // 这里简化处理：如果在 beforeunload 事件中被调用，则优先使用 sendBeacon
        // const isBeforeUnload = (event && event.type === 'beforeunload'); // 判断是否在 beforeunload 事件中

        // 根据 options.isBeforeUnload 判断是否在 beforeunload 中发送
        const isBeforeUnload = options.isBeforeUnload;

        if (navigator.sendBeacon && isBeforeUnload) {
            if (DEV_MODE)
                console.log("[tracker] 使用 navigator.sendBeacon for beforeunload.");
            const success = navigator.sendBeacon(COLLECT_ENDPOINT, blob);
            if (!success && DEV_MODE) {
                console.error("[tracker] navigator.sendBeacon 失败.");
            }
        } else if (navigator.sendBeacon && !isBeforeUnload) {
            // 在非 beforeunload 场景下，虽然可以使用 sendBeacon，但 fetch 更灵活
            // 这里为了演示 sendBeacon，在非 beforeunload 也尝试使用
            // 实际应用中，非 beforeunload 建议使用 fetch
            if (DEV_MODE)
                console.log(
                    "[tracker] Using navigator.sendBeacon in non-beforeunload context."
                );
            const success = navigator.sendBeacon(COLLECT_ENDPOINT, blob);
            if (!success && DEV_MODE) {
                console.error(
                    "[tracker] navigator.sendBeacon failed, falling back to fetch."
                );
                // 如果 sendBeacon 失败，回退到 fetch (异步，在卸载前可能失败)
                fetch(COLLECT_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: payload,
                }).catch((error) => {
                    if (DEV_MODE) console.error("[tracker] Fetch 失败:", error);
                });
            }
        } else {
            if (DEV_MODE)
                console.log("[tracker] navigator.sendBeacon 不支持, 使用 fetch.");
            // 回退到 fetch (异步，在卸载前可能失败)
            fetch(COLLECT_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: payload,
            }).catch((error) => {
                if (DEV_MODE) console.error("[tracker] Fetch 失败:", error);
            });
        }
    }

    // == 初始化和事件监听 ==

    // 异步获取 IP 地址和地理位置，并更新 data 对象和生成指纹
    async function initializeTracker() {
        // 获取 IP 地址
        const ip = await getIPAddress();
        if (ip) {
            data.ip = ip;
            if (DEV_MODE) console.log("[tracker] IP地址已获取:", data.ip);
        }

        // 获取地理位置
        const location = await getGeolocation();
        if (location && !location.error) {
            data.location = location;
            if (DEV_MODE) console.log("[tracker] 地理位置已获取:", data.location);
        } else if (location && location.error && DEV_MODE) {
            data.location = null; // 确保失败时设置为 null
            console.warn("[tracker] 获取地理位置失败:", location.error);
        } else {
            data.location = null; // 如果 getGeolocation 返回 null或undefined
        }

        // 在获取到 IP 和地理位置后生成或获取指纹
        data.fingerprint = createSimpleFingerprint();
        if (DEV_MODE) console.log("[tracker] 初始化完成，当前数据:", data);

        // 触发一次 'view' 事件，表示页面加载完成
        trackUserEvent({ type: "view" });

        // 设置心跳事件定时器
        setInterval(() => {
            trackUserEvent({ type: "heartbeat" });
        }, HEARTBEAT_INTERVAL); // 使用配置的心跳间隔
    }

    // 添加事件监听器
    document.addEventListener("click", trackUserEvent);
    // 添加 input 事件监听器，使用 'input' 事件进行跟踪
    document.addEventListener("input", trackUserEvent);
    // 添加 submit 事件监听器，使用 'submit' 事件进行跟踪
    document.addEventListener("submit", trackUserEvent);

    // 页面加载完成后初始化 Tracker
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeTracker);
    } else {
        initializeTracker();
    }

    // 在页面卸载前发送未发送的数据 (如果需要)
    window.addEventListener("beforeunload", (event) => {
        // TODO: 发送任何待处理的事件数据
        // 发送离线心跳消息\
        trackUserEvent(
            { type: "heartbeat" },
            { isOffline: true, isBeforeUnload: true }
        );
        // 如果有其他未发送的数据队列，也在这里尝试发送
        // 注意：在 beforeunload 事件中发送异步请求可能会失败，考虑使用 navigator.sendBeacon API
    });
})();
