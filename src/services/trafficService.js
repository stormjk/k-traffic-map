/**
 * 交通数据服务
 * 提供交通数据的获取、解析和缓存功能
 */

const API_BASE_URL = 'https://traffic.xianjiaojing.com/api/v1/dmvAppointment/TrafficLbs/query'

// 数据缓存
const cache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 分钟缓存
}

/**
 * 检查缓存是否有效
 */
function isCacheValid() {
  return cache.data && (Date.now() - cache.timestamp < cache.ttl)
}

/**
 * 从 API 获取交通数据
 * @param {Object} options - 查询选项
 * @param {boolean} options.forceRefresh - 是否强制刷新
 * @param {string} options.farea - 区域过滤
 * @param {string} options.fphotoArea - 拍照区域过滤
 * @returns {Promise<Array>} 交通数据数组
 */
export async function fetchTrafficData(options = {}) {
  const { forceRefresh = false, farea = '', fphotoArea = '' } = options
  
  // 检查缓存
  if (!forceRefresh && isCacheValid()) {
    console.log('使用缓存数据')
    return cache.data
  }
  
  try {
    const url = new URL(API_BASE_URL)
    url.searchParams.append('farea', farea)
    url.searchParams.append('fphotoArea', fphotoArea)
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('API 返回结果:', result)
    
    // 解析数据
    let parsedData = []
    
    if (result && result.data) {
      parsedData = Array.isArray(result.data) ? result.data : [result.data]
    } else if (Array.isArray(result)) {
      parsedData = result
    } else if (result && typeof result === 'object') {
      parsedData = [result]
    }
    
    // 标准化数据格式
    const normalizedData = parsedData.map(item => normalizeDataItem(item))
    
    // 更新缓存
    cache.data = normalizedData
    cache.timestamp = Date.now()
    
    return normalizedData
  } catch (error) {
    console.error('获取交通数据失败:', error)
    throw error
  }
}

/**
 * 标准化数据项格式
 * @param {Object} item - 原始数据项
 * @returns {Object} 标准化后的数据项
 */
function normalizeDataItem(item) {
  // 提取类型信息
  let type = extractType(item)
  
  // 提取坐标
  const lat = extractLatitude(item)
  const lng = extractLongitude(item)
  
  // 提取名称
  const name = extractName(item)
  
  return {
    id: item.id || item._id || generateId(),
    name: name,
    type: type,
    latitude: lat,
    longitude: lng,
    speed: item.speed || item.limitSpeed || null,
    description: item.description || item.remark || item.note || null,
    farea: item.farea || item.area || null,
    fphotoArea: item.fphotoArea || item.photoArea || null,
    originalData: item // 保留原始数据
  }
}

/**
 * 从数据项中提取类型
 * @param {Object} item - 数据项
 * @returns {string} 类型
 */
function extractType(item) {
  // 尝试从不同字段提取类型
  if (item.type) return item.type
  if (item.category) return item.category
  if (item.kind) return item.kind
  
  // 根据名称判断
  const name = item.name || item.title || ''
  if (name.includes('超速')) return '超速'
  if (name.includes('限行')) return '限行'
  if (name.includes('监控')) return '监控'
  if (name.includes('测速')) return '测速'
  if (name.includes('违章')) return '违章'
  
  // 根据描述判断
  const desc = item.description || item.remark || ''
  if (desc.includes('超速')) return '超速'
  if (desc.includes('限行')) return '限行'
  if (desc.includes('测速')) return '测速'
  
  return '其他'
}

/**
 * 从数据项中提取纬度
 * @param {Object} item - 数据项
 * @returns {number|null} 纬度
 */
function extractLatitude(item) {
  return item.latitude || item.lat || item.Lat || item.LAT || 
         item.y || item.Y || null
}

/**
 * 从数据项中提取经度
 * @param {Object} item - 数据项
 * @returns {number|null} 经度
 */
function extractLongitude(item) {
  return item.longitude || item.lng || item.Lng || item.LON || 
         item.Lon || item.x || item.X || null
}

/**
 * 从数据项中提取名称
 * @param {Object} item - 数据项
 * @returns {string} 名称
 */
function extractName(item) {
  return item.name || item.title || item.location || 
         item.address || item.pointName || '未知地点'
}

/**
 * 生成唯一 ID
 * @returns {string} 唯一 ID
 */
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * 清除缓存
 */
export function clearCache() {
  cache.data = null
  cache.timestamp = 0
}

/**
 * 获取缓存数据
 * @returns {Array|null} 缓存的数据
 */
export function getCachedData() {
  return cache.data
}

/**
 * 检查是否有缓存
 * @returns {boolean} 是否有缓存
 */
export function hasCache() {
  return cache.data !== null
}

export default {
  fetchTrafficData,
  clearCache,
  getCachedData,
  hasCache
}
