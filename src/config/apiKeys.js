/**
 * ⚠️ 重要提示：使用前必须配置 API Key！
 * 
 * 默认使用高德地图，需要申请 Key 才能正常工作。
 * 
 * 快速配置步骤（3 分钟）：
 * 
 * 1. 访问：https://console.amap.com/dev/key/app
 * 2. 注册/登录 → 实名认证
 * 3. 创建应用 → 添加 Key
 * 4. 白名单填写：localhost;127.0.0.1
 * 5. 复制生成的 Key
 * 6. 粘贴到下面的 gaodeConfig.key 中
 * 
 * 详细指南请查看：API_KEY_GUIDE.md
 */

// 高德地图配置
export const gaodeConfig = {
  // ⚠️ 重要：替换为你申请的高德地图 Key
  key: '4f1f8f08dc678c65ddcf069591f9d747',
  
  // 高德地图版本
  version: '2.0',
  
  // 需要加载的插件
  plugins: [
    'AMap.Scale',      // 比例尺
    'AMap.ToolBar',    // 工具栏
    'AMap.MapType',    // 图层切换
    'AMap.Geolocation', // 定位（可选）
  ],
  
  // 默认中心点 [经度，纬度] - 西安
  defaultCenter: [108.9398, 34.3416],
  
  // 默认缩放级别
  defaultZoom: 12,
  
  // 最小/最大缩放级别
  minZoom: 3,
  maxZoom: 20,
}

// 百度地图配置（如需使用百度地图，修改 currentMapType 为 'baidu'）
export const baiduConfig = {
  // ⚠️ 重要：替换为你申请的百度地图 AK
  ak: '你的百度地图 AK',
  
  // 百度地图版本
  version: '3.0',
  
  // 默认中心点 [经度，纬度] - 西安
  defaultCenter: [108.9398, 34.3416],
  
  // 默认缩放级别
  defaultZoom: 12,
}

// 当前使用的地图类型：'gaode' | 'baidu'
// 注意：这个配置在 App.vue 中通过界面选择器动态切换
export const currentMapType = 'gaode'

/**
 * 获取当前地图配置
 */
export function getCurrentMapConfig() {
  return currentMapType === 'gaode' ? gaodeConfig : baiduConfig
}

/**
 * 验证 API Key 是否配置
 */
export function isApiKeyConfigured() {
  if (currentMapType === 'gaode') {
    return gaodeConfig.key !== '你的高德地图 Key' && gaodeConfig.key.length > 0
  } else {
    return baiduConfig.ak !== '你的百度地图 AK' && baiduConfig.ak.length > 0
  }
}

export default {
  gaodeConfig,
  baiduConfig,
  currentMapType,
  getCurrentMapConfig,
  isApiKeyConfigured
}
