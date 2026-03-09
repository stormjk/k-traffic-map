/**
 * 地图配置
 */
export const mapConfig = {
  // 默认中心点（西安）
  defaultCenter: [34.3416, 108.9398],
  
  // 默认缩放级别
  defaultZoom: 12,
  
  // 最小缩放级别
  minZoom: 3,
  
  // 最大缩放级别
  maxZoom: 19,
  
  // 地图图层配置
  tileLayers: {
    openstreetmap: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      name: '开放街道地图'
    },
    
    // 可选：其他地图源（需要时启用）
    // cartodb: {
    //   url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    //   name: 'CartoDB 浅色'
    // },
    
    // cartoDark: {
    //   url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    //   name: 'CartoDB 深色'
    // }
  }
}

/**
 * 交通标记类型配置
 */
export const trafficTypeConfig = {
  '超速': { 
    color: '#ff4444', 
    icon: '📸',
    description: '超速监控点'
  },
  '逆行': { 
    color: '#ff5722', 
    icon: '⬅️',
    description: '逆行抓拍点'
  },
  '闯红灯': { 
    color: '#e91e63', 
    icon: '🔴',
    description: '闯红灯抓拍'
  },
  '不按导向行驶': { 
    color: '#9c27b0', 
    icon: '↗️',
    description: '不按导向行驶抓拍'
  },
  '限行': { 
    color: '#ff9800', 
    icon: '🚫',
    description: '限行区域'
  },
  '打电话': { 
    color: '#3f51b5', 
    icon: '📱',
    description: '开车打电话抓拍'
  },
  '不系安全带': { 
    color: '#00bcd4', 
    icon: '🎗️',
    description: '不系安全带抓拍'
  },
  '压线': { 
    color: '#795548', 
    icon: '➖',
    description: '压线抓拍'
  },
  '违法停车': { 
    color: '#607d8b', 
    icon: '🅿️',
    description: '违停抓拍'
  },
  '车不让人': { 
    color: '#009688', 
    icon: '🚶',
    description: '不礼让行人抓拍'
  },
  '监控': { 
    color: '#2196f3', 
    icon: '👁️',
    description: '交通监控'
  },
  '测速': { 
    color: '#f44336', 
    icon: '⚡',
    description: '测速设备'
  },
  '违章': { 
    color: '#9c27b0', 
    icon: '⚠️',
    description: '违章拍摄'
  },
  '卡口': { 
    color: '#00bcd4', 
    icon: '🚔',
    description: '检查卡口'
  },
  '红灯': { 
    color: '#e91e63', 
    icon: '🔴',
    description: '红灯抓拍'
  },
  '其他': { 
    color: '#4caf50', 
    icon: '📍',
    description: '其他类型'
  }
}

/**
 * 获取类型配置
 * @param {string} type - 类型名称
 * @returns {Object} 类型配置
 */
export function getTypeConfig(type) {
  return trafficTypeConfig[type] || trafficTypeConfig['其他']
}

/**
 * 获取所有类型列表
 * @returns {Array<string>} 类型列表
 */
export function getAllTypes() {
  return Object.keys(trafficTypeConfig)
}

/**
 * 图例配置
 */
export const legendConfig = {
  position: 'bottomright',
  title: '📍 图例',
  collapsed: false
}

/**
 * 筛选器配置
 */
export const filterConfig = {
  position: 'topright',
  defaultType: '全部',
  showRefreshButton: true
}

/**
 * 统计面板配置
 */
export const statisticsConfig = {
  position: 'topleft',
  showTotal: true,
  showByType: true
}

export default {
  mapConfig,
  trafficTypeConfig,
  getTypeConfig,
  getAllTypes,
  legendConfig,
  filterConfig,
  statisticsConfig
}
