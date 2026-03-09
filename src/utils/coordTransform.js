/**
 * 坐标系转换工具
 * 
 * 中国常用坐标系：
 * - WGS-84: GPS 原始坐标（国际标准）
 * - GCJ-02: 火星坐标（高德、腾讯、国家测绘局使用）
 * - BD-09: 百度坐标（百度地图使用）
 * - CGCS2000: 国家大地坐标系（等同于 WGS-84）
 */

const PI = Math.PI
const a = 6378245.0 // 长半轴
const ee = 0.00669342162296594323 // 偏心率平方

/**
 * 判断是否在国内
 * @param {number} lon 经度
 * @param {number} lat 纬度
 * @returns {boolean} 是否在国内
 */
function outOfChina(lon, lat) {
  return (lon < 72.004 || lon > 137.8347) || ((lat < 0.8293 || lat > 53.8219))
}

/**
 * WGS-84 转 GCJ-02（火星坐标系）
 * @param {number} lng WGS-84 经度
 * @param {number} lat WGS-84 纬度
 * @returns {Object} {lng: GCJ-02 经度，lat: GCJ-02 纬度}
 */
export function wgs84ToGcj02(lng, lat) {
  if (outOfChina(lng, lat)) {
    return { lng, lat }
  }
  
  let dLat = transformLat(lng - 105.0, lat - 35.0)
  let dLng = transformLng(lng - 105.0, lat - 35.0)
  const radLat = lat / 180.0 * PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI)
  dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI)
  
  const gcjLat = lat + dLat
  const gcjLng = lng + dLng
  
  return { lng: gcjLng, lat: gcjLat }
}

/**
 * GCJ-02 转 WGS-84
 * @param {number} lng GCJ-02 经度
 * @param {number} lat GCJ-02 纬度
 * @returns {Object} {lng: WGS-84 经度，lat: WGS-84 纬度}
 */
export function gcj02ToWgs84(lng, lat) {
  if (outOfChina(lng, lat)) {
    return { lng, lat }
  }
  
  const dLat = transformLat(lng - 105.0, lat - 35.0)
  const dLng = transformLng(lng - 105.0, lat - 35.0)
  const radLat = lat / 180.0 * PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  const sqrtMagic = Math.sqrt(magic)
  
  const mgLat = lat + dLat
  const mgLng = lng + dLng
  
  const wgsLat = lat * 2 - mgLat
  const wgsLng = lng * 2 - mgLng
  
  return { lng: wgsLng, lat: wgsLat }
}

/**
 * 纬度变换辅助函数
 */
function transformLat(x, y) {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0
  ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0
  return ret
}

/**
 * 经度变换辅助函数
 */
function transformLng(x, y) {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0
  ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0
  return ret
}

/**
 * 批量转换 WGS-84 到 GCJ-02
 * @param {Array} points 坐标点数组 [{lng, lat}]
 * @returns {Array} 转换后的坐标点数组
 */
export function batchWgs84ToGcj02(points) {
  return points.map(point => wgs84ToGcj02(point.lng, point.lat))
}

export default {
  wgs84ToGcj02,
  gcj02ToWgs84,
  batchWgs84ToGcj02,
  outOfChina
}
