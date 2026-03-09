/**
 * 模拟交通数据（用于测试）
 * 当 API 不可用时使用这些数据进行测试
 */

export const mockTrafficData = [
  {
    id: '1',
    name: '长安路超速监控点',
    type: '超速',
    latitude: 34.3416,
    longitude: 108.9398,
    speed: '限速 80km/h',
    description: '主要路段监控',
    farea: '雁塔区'
  },
  {
    id: '2',
    name: '未央路限行路段',
    type: '限行',
    latitude: 34.3516,
    longitude: 108.9498,
    description: '工作日 7:00-20:00 限行',
    farea: '未央区'
  },
  {
    id: '3',
    name: '科技路测速设备',
    type: '测速',
    latitude: 34.3316,
    longitude: 108.9298,
    speed: '限速 60km/h',
    description: '固定测速点',
    farea: '高新区'
  },
  {
    id: '4',
    name: '高新大道监控',
    type: '监控',
    latitude: 34.3616,
    longitude: 108.9598,
    description: '违章拍摄',
    farea: '高新区'
  },
  {
    id: '5',
    name: '环城西路超速抓拍',
    type: '超速',
    latitude: 34.3216,
    longitude: 108.9198,
    speed: '限速 70km/h',
    description: '移动测速点',
    farea: '莲湖区'
  },
  {
    id: '6',
    name: '北二环卡口',
    type: '卡口',
    latitude: 34.3716,
    longitude: 108.9698,
    description: '检查站',
    farea: '未央区'
  },
  {
    id: '7',
    name: '南三环红灯抓拍',
    type: '红灯',
    latitude: 34.3116,
    longitude: 108.9098,
    description: '闯红灯自动抓拍',
    farea: '雁塔区'
  },
  {
    id: '8',
    name: '东郊违停监控',
    type: '违章',
    latitude: 34.3456,
    longitude: 108.9798,
    description: '违停自动抓拍',
    farea: '灞桥区'
  },
  {
    id: '9',
    name: '西咸新区测速',
    type: '测速',
    latitude: 34.2916,
    longitude: 108.8898,
    speed: '限速 100km/h',
    description: '高速公路测速',
    farea: '西咸新区'
  },
  {
    id: '10',
    name: '曲江新区监控',
    type: '监控',
    latitude: 34.2816,
    longitude: 108.9898,
    description: '综合监控',
    farea: '曲江新区'
  }
]

/**
 * 获取模拟数据
 * @returns {Array} 模拟交通数据
 */
export function getMockData() {
  return mockTrafficData
}

/**
 * 根据类型筛选模拟数据
 * @param {string} type - 类型
 * @returns {Array} 筛选后的数据
 */
export function filterMockDataByType(type) {
  if (!type || type === '全部') {
    return mockTrafficData
  }
  return mockTrafficData.filter(item => item.type === type)
}

/**
 * 根据区域筛选模拟数据
 * @param {string} area - 区域名称
 * @returns {Array} 筛选后的数据
 */
export function filterMockDataByArea(area) {
  if (!area || area === '全部') {
    return mockTrafficData
  }
  return mockTrafficData.filter(item => item.farea === area)
}

/**
 * 获取所有区域列表
 * @returns {Array<string>} 区域列表
 */
export function getAllAreas() {
  const areas = new Set(mockTrafficData.map(item => item.farea))
  return ['全部', ...Array.from(areas)]
}

/**
 * 获取统计数据
 * @returns {Object} 统计信息
 */
export function getMockStatistics() {
  const stats = {
    total: mockTrafficData.length,
    byType: {},
    byArea: {}
  }
  
  mockTrafficData.forEach(item => {
    // 按类型统计
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1
    
    // 按区域统计
    stats.byArea[item.farea] = (stats.byArea[item.farea] || 0) + 1
  })
  
  return stats
}

export default {
  mockTrafficData,
  getMockData,
  filterMockDataByType,
  filterMockDataByArea,
  getAllAreas,
  getMockStatistics
}
