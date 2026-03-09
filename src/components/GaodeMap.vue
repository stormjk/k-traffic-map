<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import { getTypeConfig, getAllTypes } from '../config/mapConfig'
import { gaodeConfig } from '../config/apiKeys'
import { wgs84ToGcj02 } from '../utils/coordTransform'

// 交通数据状态
const trafficData = ref([])
const loading = ref(false)
const error = ref(null)
const mapInstance = ref(null)
const markersRef = ref([])
const dataLoaded = ref(false)
const AMap = ref(null)

// 地图中心点（默认西安）
const defaultCenter = gaodeConfig.defaultCenter
const defaultZoom = gaodeConfig.defaultZoom

// 筛选类型 - 默认选择限行
const selectedType = ref('限行')

// 固定的交通违法类型列表
const FIXED_TYPES = [
  '超速',
  '逆行',
  '闯红灯',
  '不按导向行驶',
  '限行',
  '打电话',
  '不系安全带',
  '压线',
  '违法停车',
  '车不让人'
]

// 从本地文件加载交通数据
const fetchTrafficData = async () => {
  loading.value = true
  error.value = null
  
  try {
   console.log('开始加载本地交通数据...')
   const response = await fetch('/k-traffic-map/data/traffic-data.json')
    
   if (!response.ok) {
     throw new Error(`HTTP error! status: ${response.status}`)
    }
    
   const result = await response.json()
   console.log('加载到的本地数据:', result)
    
    // 根据实际数据结构解析数据
   let rawData = []
   if (result && result.data) {
      rawData = Array.isArray(result.data) ? result.data : []
    } else if (Array.isArray(result)) {
      rawData = result
    } else {
      rawData = []
    }
    
   console.log('解析前的数据数量:', rawData.length)
    
    // 处理 fphotoArea 字段（用、分隔的多个类型）
    trafficData.value = processFphotoArea(rawData)
    
   console.log('处理后的数据:', trafficData.value)
   dataLoaded.value = true
    
    // 数据加载完成后更新地图标记
   if (mapInstance.value && trafficData.value.length> 0) {
      updateMarkers()
    }
  } catch (err) {
   console.error('加载本地数据失败:', err)
    error.value = '加载数据失败，请检查数据文件是否存在'
    
    // 使用模拟数据进行测试
   loadMockData()
  } finally {
   loading.value = false
  }
}

// 从名称中模糊匹配固定类型（辅助函数）
const extractTypeFromName = (name) => {
  if (!name) return []
  const matchedTypes = []
  FIXED_TYPES.forEach(type => {
    if (name.includes(type)) {
      matchedTypes.push(type)
    }
  })
  return matchedTypes
}

// 处理 fphotoArea 字段，拆分、合并、去重
const processFphotoArea = (data) => {
  const processedMap = new Map()
  
  data.forEach((item, index) => {
    const fphotoArea = item.fphotoArea || ''
    
    // 提取坐标（使用正确的字段名）
    const rawLat = parseFloat(item.flatitude || item.latitude || item.lat)
    const rawLng = parseFloat(item.flongitude || item.longitude || item.lng)
    
    // 坐标转换：WGS-84 转 GCJ-02（高德地图使用）
    let lat = rawLat
    let lng = rawLng
    
    if (rawLat && rawLng) {
      // 判断是否需要转换（如果坐标在国内范围内）
      if (rawLat >= 0.8293 && rawLat <= 53.8219 && rawLng >= 72.004 && rawLng <= 137.8347) {
        const converted = wgs84ToGcj02(rawLng, rawLat)
        lat = converted.lat
        lng = converted.lng
        console.log(`坐标转换：WGS84[${rawLat.toFixed(6)}, ${rawLng.toFixed(6)}] -> GCJ02[${lat.toFixed(6)}, ${lng.toFixed(6)}]`)
      }
    }
    
    // 如果 fphotoArea 为空，尝试从名称中模糊匹配类型
    if (!fphotoArea.trim()) {
      const matchedTypes = matchTypesFromText(item.fname || item.name || '')
      
      if (matchedTypes.length > 0) {
        // 使用匹配到的类型创建数据项
        matchedTypes.forEach((type, typeIndex) => {
          const uniqueId = `${item.fid || item.id || index}_name_${typeIndex}`
          if (!processedMap.has(uniqueId)) {
            processedMap.set(uniqueId, {
              ...item,
              latitude: lat,
              longitude: lng,
              type: type,
              originalId: item.fid || item.id,
              splitIndex: typeIndex
            })
          }
        })
      } else {
        // 没有匹配到类型，标记为"其他"
        const uniqueId = item.fid || item.id || `temp_${index}`
        if (!processedMap.has(uniqueId)) {
          processedMap.set(uniqueId, {
            ...item,
            latitude: lat,
            longitude: lng,
            type: '其他'
          })
        }
      }
      return
    }
    
    // 从 fphotoArea 中模糊匹配固定类型
    const matchedTypes = matchTypesFromText(fphotoArea)
    
    if (matchedTypes.length > 0) {
      // 使用匹配到的类型创建数据项
      matchedTypes.forEach((type, typeIndex) => {
        const uniqueId = `${item.fid || item.id || index}_fphoto_${typeIndex}`
        if (!processedMap.has(uniqueId)) {
          processedMap.set(uniqueId, {
            ...item,
            latitude: lat,
            longitude: lng,
            type: type,
            originalId: item.fid || item.id,
            splitIndex: typeIndex
          })
        }
      })
    } else {
      // 没有匹配到固定类型，按原文本拆分
      const types = fphotoArea.split(/[,,]/).filter(t => t.trim())
      
      types.forEach((type, typeIndex) => {
        const cleanType = type.trim()
        if (!cleanType) return
        
        const uniqueId = `${item.fid || item.id || index}_raw_${typeIndex}`
        if (!processedMap.has(uniqueId)) {
          processedMap.set(uniqueId, {
            ...item,
            latitude: lat,
            longitude: lng,
            type: cleanType,
            originalId: item.fid || item.id,
            splitIndex: typeIndex
          })
        }
      })
    }
  })
  
  // 转换为数组并按坐标去重（相同坐标和类型的只保留一个）
  const deduplicatedMap = new Map()
  processedMap.forEach((item) => {
    const lat = item.latitude
    const lng = item.longitude
    const key = `${lat}_${lng}_${item.type}`
    
    if (!deduplicatedMap.has(key)) {
      deduplicatedMap.set(key, item)
    }
  })
  
  console.log(`原始数据：${data.length}条，处理后：${processedMap.size}条，去重后：${deduplicatedMap.size}条`)
  
  return Array.from(deduplicatedMap.values())
}

// 从文本中模糊匹配固定类型
const matchTypesFromText = (text) => {
  if (!text) return []
  
  const matchedTypes = []
  
  FIXED_TYPES.forEach(type => {
    if (text.includes(type)) {
      matchedTypes.push(type)
    }
  })
  
  return matchedTypes
}

// 加载模拟数据（用于测试）
const loadMockData = () => {
  console.log('加载模拟数据...')
  const mockData = [
    { id: 1, name: '长安路超速监控', fphotoArea: '超速、逆行', latitude: 34.3416, longitude: 108.9398, speed: '限速 80km/h' },
    { id: 2, name: '未央路限行路段', fphotoArea: '限行', latitude: 34.3516, longitude: 108.9498, description: '工作日 7:00-20:00' },
    { id: 3, name: '科技路测速点', fphotoArea: '超速、压线', latitude: 34.3316, longitude: 108.9298, speed: '限速 60km/h' },
    { id: 4, name: '高新大道监控', fphotoArea: '闯红灯、不按导向行驶', latitude: 34.3616, longitude: 108.9598, description: '违章拍摄' },
    { id: 5, name: '环城西路超速', fphotoArea: '违法停车、打电话', latitude: 34.3216, longitude: 108.9198, speed: '限速 70km/h' },
    { id: 6, name: '北二环卡口', fphotoArea: '不系安全带、车不让人', latitude: 34.3716, longitude: 108.9698, description: '检查站' },
  ]
  
  // 处理模拟数据的 fphotoArea
  trafficData.value = processFphotoArea(mockData)
  dataLoaded.value = true
  
  console.log('模拟数据加载完成，数据数量:', trafficData.value.length)
  
  if (mapInstance.value) {
    updateMarkers()
  }
}

// 初始化地图
const initMap = async () => {
  if (mapInstance.value) return
  
  try {
    console.log('开始加载高德地图...')
    // 加载高德地图
    AMap.value = await AMapLoader.load({
      key: gaodeConfig.key,
      version: gaodeConfig.version,
      plugins: gaodeConfig.plugins,
    })
    
    console.log('高德地图加载成功，创建地图实例...')
    // 创建地图实例
    mapInstance.value = new AMap.value.Map('map', {
      zoom: defaultZoom,
      center: defaultCenter,
      viewMode: '2D',
    })
    
    // 添加比例尺
    mapInstance.value.addControl(new AMap.value.Scale())
    
    // 添加工具栏
    mapInstance.value.addControl(new AMap.value.ToolBar())
    
    // 添加图层切换
    mapInstance.value.addControl(new AMap.value.MapType({
      defaultType: 0,
      showRoad: true
    }))
    
    console.log('地图初始化完成')
    
    // 如果有数据，更新标记
    if (trafficData.value.length > 0) {
      updateMarkers()
    }
  } catch (err) {
    console.error('地图加载失败:', err)
    error.value = '地图加载失败，请检查网络或 API Key'
  }
}

// 创建自定义标记
const createMarker = (item) => {
  const config = getTypeConfig(item.type)
  // 使用已经转换过的坐标（GCJ-02）
  const lat = parseFloat(item.latitude || item.flatitude || item.lat)
  const lng = parseFloat(item.longitude || item.flongitude || item.lng)
  
  console.log(`创建标记：${item.fname || item.name || '未知'}, 类型：${item.type}, 坐标：[${lat.toFixed(6)}, ${lng.toFixed(6)}]`)
  
  if (!lat || !lng) {
    console.error('坐标无效:', item)
    return null
  }
  
  // 高德地图使用 GCJ-02 坐标系，直接使用转换后的坐标
  const lnglat = [lng, lat]
  
  // 创建自定义标记内容
  const markerContent = `
    <div style="
      background-color: ${config.color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      transition: transform 0.2s;
    " onmouseover="this.style.transform='scale(1.2)'" 
      onmouseout="this.style.transform='scale(1)'">
      ${config.icon}
    </div>
  `
  
  // 创建信息窗口内容
  let infoWindowContent = `
    <div style="min-width: 220px; padding: 5px;">
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px; border-bottom: 2px solid ${config.color}; padding-bottom: 8px;">
        ${item.fname || item.name || '未知地点'}
      </h3>
      <div style="margin-bottom: 8px;">
        <strong style="color: #666;">类型:</strong> 
        <span style="color: ${config.color}; margin-left: 8px;">
          ${config.icon} ${item.type || '其他'}
        </span>
      </div>
  `
  
  if (item.speed) {
    infoWindowContent += `<div style="margin-bottom: 8px;"><strong style="color: #666;">速度:</strong> <span style="margin-left: 8px;">${item.speed}</span></div>`
  }
  
  if (item.description) {
    infoWindowContent += `<div style="margin-bottom: 8px;"><strong style="color: #666;">说明:</strong> <span style="margin-left: 8px;">${item.description}</span></div>`
  }
  
  if (item.farea) {
    infoWindowContent += `<div style="margin-bottom: 8px;"><strong style="color: #666;">区域:</strong> <span style="margin-left: 8px;">${item.farea}</span></div>`
  }
  
  infoWindowContent += `
      <div style="font-size: 12px; color: #999; margin-top: 10px; padding-top: 8px; border-top: 1px solid #eee;">
        📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}
      </div>
    </div>
  `
  
  // 创建标记
  const marker = new AMap.value.Marker({
    position: lnglat,
    content: markerContent,
    offset: new AMap.value.Pixel(-18, -18),
  })
  
  // 创建信息窗体
  const infoWindow = new AMap.value.InfoWindow({
    content: infoWindowContent,
    offset: new AMap.value.Pixel(0, -10),
  })
  
  // 点击事件
  marker.on('click', () => {
    infoWindow.open(mapInstance.value, marker.getPosition())
  })
  
  return marker
}

// 更新地图标记
const updateMarkers = () => {
  if (!mapInstance.value) {
    console.warn('地图实例未初始化，跳过更新标记')
    return
  }
  
  console.log('开始更新地图标记...')
  
  // 清除现有标记
  if (markersRef.value.length > 0) {
    markersRef.value.forEach(marker => {
      mapInstance.value.remove(marker)
    })
    markersRef.value = []
  }
  
  // 筛选数据
  const filteredData = selectedType.value === '全部' 
    ? trafficData.value 
    : trafficData.value.filter(item => item.type === selectedType.value)
  
  console.log(`筛选后的数据数量：${filteredData.length}`)
  
  // 添加新标记
  let addedCount = 0
  filteredData.forEach((item) => {
    const lat = item.latitude || item.lat
    const lng = item.longitude || item.lng
    
    if (lat && lng) {
      const marker = createMarker({ ...item, latitude: lat, longitude: lng })
      if (marker) {
        markersRef.value.push(marker)
        marker.setMap(mapInstance.value)
        addedCount++
        console.log(`添加标记：${item.fname || item.name || '未知'}, 坐标：[${lat}, ${lng}]`)
      }
    } else {
      console.warn(`跳过无效坐标的数据：`, item)
    }
  })
  
  console.log(`成功添加 ${addedCount} 个标记`)
  
  // 如果有数据，调整地图视图以显示所有标记
  if (filteredData.length > 0 && addedCount > 0) {
    try {
      const validPoints = filteredData.filter(item => 
        (item.latitude || item.lat) && (item.longitude || item.lng)
      )
      
      if (validPoints.length > 0) {
        // 获取第一个点的坐标作为中心点
      const firstPoint = validPoints[0]
      const centerLngLat = new AMap.value.LngLat(
            firstPoint.longitude || firstPoint.lng,
            firstPoint.latitude || firstPoint.lat
          )
          
      console.log('已设置地图中心点和缩放级别')
      }
    } catch(err) {
     console.error('调整视图失败:', err)
    }
  }
}

// 按类型筛选
const handleTypeChange = () => {
  console.log('筛选类型变更:', selectedType.value)
  updateMarkers()
}

// 获取所有类型（只显示固定类型列表中存在的）
const allTypes = computed(() => {
  const dataTypes = new Set(trafficData.value.map(item => item.type || '其他'))
  
  // 只返回固定类型列表中存在的类型
  const result = ['全部']
  
  FIXED_TYPES.forEach(type => {
    if (dataTypes.has(type)) {
      result.push(type)
    }
  })
  
  return result
})

// 获取图例类型（只显示固定类型）
const legendTypes = computed(() => {
  const dataTypes = new Set(trafficData.value.map(item => item.type))
  
  // 只显示固定类型中存在且在实际数据中出现的
  return FIXED_TYPES
    .filter(type => dataTypes.has(type))
    .map(type => ({ key: type, label: type }))
})

// 生命周期钩子
onMounted(async () => {
  console.log('组件已挂载，开始加载...')
  
  // 先获取数据
  await fetchTrafficData()
  
  // 如果数据为空，强制加载模拟数据
  if (trafficData.value.length === 0) {
    console.log('API 数据为空，强制加载模拟数据')
    loadMockData()
  }
  
  // 然后初始化地图
  initMap()
})

// 组件卸载时清理
onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.destroy()
  }
})
</script>

<template>
  <div class="traffic-map-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在加载地图和数据...</p>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchTrafficData" class="retry-btn">重新加载</button>
    </div>
    
    <!-- 筛选器 -->
    <div class="filter-panel">
      <label>筛选类型：</label>
      <select v-model="selectedType" @change="handleTypeChange" class="filter-select">
        <option v-for="type in allTypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>
      <button @click="fetchTrafficData" class="refresh-btn" :disabled="loading">
        🔄 刷新数据
      </button>
    </div>
    
    <!-- 地图容器 -->
    <div id="map" class="map"></div>
    
    <!-- 图例 -->
    <div class="legend-panel">
      <h4>📍 图例</h4>
      <div class="legend-items">
        <div v-for="item in legendTypes" :key="item.key" class="legend-item">
          <span 
            :style="{ 
              backgroundColor: getTypeConfig(item.key).color,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              marginRight: '8px',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }" 
            class="legend-icon"
          >
            {{ getTypeConfig(item.key).icon }}
          </span>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.traffic-map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
}

.map {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 1001;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #5568d3;
}

.filter-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  margin: 0;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #45a049;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.legend-panel {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 150px;
  margin: 0;
}

.legend-panel h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #333;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.legend-icon {
  flex-shrink: 0;
}

/* 高德地图控件样式调整 */
:deep(.amap-scale) {
  margin-bottom: 10px !important;
}

:deep(.amap-toolbar) {
  margin-right: 10px !important;
}

@media (max-width: 768px) {
  .statistics-panel {
    top: auto;
    bottom: 10px;
    left: 10px;
    right: 10px;
    max-width: none;
  }
  
  .filter-panel {
    top: auto;
    bottom: 10px;
    right: 10px;
    left: 10px;
  }
  
  .legend-panel {
    display: none;
  }
}
</style>
