# 交通地图 - 交通违法监控点可视化

基于 Vue 3 + 高德地图的交通违法监控点地图展示系统。

## 🚀 功能特点

- ✅ 实时显示交通违法监控点
- ✅ 支持 10 种违法类型筛选
- ✅ 坐标精确显示（GCJ-02 转换）
- ✅ 数据智能处理与去重
- ✅ 全屏地图展示
- ✅ 图例清晰直观

## 📦 技术栈

- **前端框架**: Vue 3
- **地图服务**: 高德地图 JS API v2.0
- **构建工具**: Vite
- **部署平台**: GitHub Pages

## 🎯 使用方法

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 在线访问

https://stormjk.github.io/k-traffic-map/

## 📊 数据来源

API: https://traffic.xianjiaojing.com/api/v1/dmvAppointment/TrafficLbs/query

## 🔧 配置说明

### 高德地图 API Key

在 `src/config/apiKeys.js` 中配置你的高德地图 API Key。

### 违法类型配置

在 `src/config/mapConfig.js` 中配置各类型的颜色和图标。

## 📝 更新日志

- 坐标系统优化（WGS-84 → GCJ-02）
- 图例显示优化
- 数据处理性能提升

## 📄 License

MIT
