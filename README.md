# 🚦 交通信息地图系统

一个基于 Vue 3 + Leaflet 的交通监控点地图可视化系统，用于显示超速、限行、测速等交通设施位置信息。

## ✨ 功能特性

- 🗺️ **多地图源支持** - 高德地图、百度地图、OpenStreetMap 自由切换
- 📍 **实时数据显示** - 从 API 获取交通数据并在地图上标注
- 🎯 **多种类型标记** - 支持超速、限行、监控、测速等多种类型
- 📊 **数据统计面板** - 实时统计各类型交通设施数量
- 🔍 **筛选功能** - 可按类型筛选显示的交通设施
- 🎨 **自定义图标** - 不同类型的标记使用不同的颜色和图标
- 📱 **响应式设计** - 支持桌面端和移动端
- 💾 **数据缓存** - 5 分钟缓存机制，减少 API 请求

## 🛠️ 技术栈

- **前端框架**: Vue 3 (Composition API)
- **地图库**: 
  - 高德地图 JS API v2.0（推荐国内使用）
  - 百度地图 JS API v3.0（可选）
  - Leaflet + OpenStreetMap（开源免费）
- **构建工具**: Vite
- **HTTP 请求**: Fetch API
- **CSS**: CSS3 + Scoped Styles

## 📦 安装

```bash
npm install
```

## 🚀 运行

### 开发模式

```bash
npm run dev
```

启动后访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
k-traffic-map/
├── src/
│   ├── components/
│   │   ├── TrafficMap.vue      # Leaflet 地图组件（开源）
│   │   ├── GaodeMap.vue        # 高德地图组件（推荐）
│   │   ├── BaiduMap.vue        # 百度地图组件（可选）
│   │   └── MapSelector.vue     # 地图切换器
│   ├── services/
│   │   └── trafficService.js   # 交通数据服务
│   ├── config/
│   │   ├── mapConfig.js        # 地图配置
│   │   └── apiKeys.js          # API Key 配置
│   ├── data/
│   │   └── mockData.js         # 模拟数据
│   ├── assets/                 # 静态资源
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── index.html
├── package.json
└── vite.config.js
```

## 🔧 配置说明

### ⚠️ 重要：需要配置 API Key

**默认使用高德地图，必须先申请 API Key！**

#### 快速配置（3 分钟）

1. **访问**: https://console.amap.com/dev/key/app
2. **注册登录** → **实名认证**
3. **创建应用** → **添加 Key**
4. **白名单**: `localhost;127.0.0.1`
5. **复制 Key**
6. **粘贴到**: `src/config/apiKeys.js` 中的 `gaodeConfig.key`

详细步骤请查看：[API Key 申请指南](./API_KEY_GUIDE.md)

### 地图源选择

项目支持三种地图源，可在运行时通过界面顶部的选择器切换：

1. **高德地图** (推荐) - 国内数据准确，需 Key
2. **百度地图** (可选) - 国内覆盖全面，需 Key  
3. **开源地图** (无需 Key) - 免费但国内数据一般

### 修改地图中心点

在 `src/config/apiKeys.js` 中可以修改：

```javascript
export const gaodeConfig = {
  defaultCenter: [108.9398, 34.3416], // [经度，纬度]
  defaultZoom: 12,
  // ...
}
```

### 数据源配置

当前使用的数据源：
```
https://traffic.xianjiaojing.com/api/v1/dmvAppointment/TrafficLbs/query
```

如需更换数据源，请修改对应地图组件中的 API 地址。

## 📖 使用文档

- **[🚀 快速开始](./QUICK_START.md)** - 5 分钟上手指南
- **[📝 API Key 申请](./API_KEY_GUIDE.md)** - 详细的 Key 申请步骤
- **[📖 使用手册](./USAGE.md)** - 完整功能使用说明

## 📊 数据格式

系统支持的数据格式：

```javascript
{
  id: '唯一标识',
  name: '地点名称',
  type: '类型（超速/限行/监控/测速等）',
  latitude: 纬度,
  longitude: 经度,
  speed: '限速信息',
  description: '描述信息',
  farea: '所属区域'
}
```

## 🎨 类型说明

- 📸 **超速** - 超速监控点（红色）
- 🚫 **限行** - 限行区域（橙色）
- 👁️ **监控** - 交通监控（蓝色）
- ⚡ **测速** - 测速设备（深红）
- ⚠️ **违章** - 违章拍摄（紫色）
- 🚔 **卡口** - 检查卡口（青色）
- 🔴 **红灯** - 红灯抓拍（粉红）
- 📍 **其他** - 其他类型（绿色）

## 🔌 API 接口

### trafficService.js

提供以下方法：

```javascript
// 获取交通数据
fetchTrafficData(options)

// 清除缓存
clearCache()

// 获取缓存数据
getCachedData()

// 检查是否有缓存
hasCache()
```

## 🌐 部署

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### 传统服务器

```bash
npm run build
# 将 dist 目录上传到 Web 服务器
```

## 📝 注意事项

1. **CORS 问题**: 如果 API 存在跨域限制，可能需要配置代理或使用后端中转
2. **API 可用性**: 确保数据源 API 可正常访问
3. **坐标系**: 使用 WGS84 坐标系（GPS 标准）
4. **性能优化**: 大量数据时建议启用聚类插件

## 🚧 后续优化建议

- [ ] 添加地图图层切换功能
- [ ] 实现标记聚类（使用 leaflet.markercluster）
- [ ] 添加搜索功能
- [ ] 添加路线规划功能
- [ ] 导出功能（CSV/Excel）
- [ ] 用户标注功能
- [ ] 实时交通状况叠加
- [ ] 离线地图支持

## 📄 License

MIT

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至项目维护者

---

**注意**: 本项目仅供学习交流使用，交通数据请以官方发布为准。
