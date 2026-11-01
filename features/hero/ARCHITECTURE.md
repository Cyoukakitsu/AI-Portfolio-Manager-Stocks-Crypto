# Hero — 架构说明

## 职责

公开落地页（无需登录）：品牌定位展示、核心功能介绍、导航栏（含登录/注册入口）、页脚。纯静态展示，无数据请求。

## 对外接口

### UI 组件

| 组件 | 说明 |
|---|---|
| `<NavBar>` | 顶部导航（Logo、菜单、登录/注册按钮） |
| `<HeroSection>` | 首屏主视觉区域（标题、副标题、CTA 按钮） |
| `<FeaturesSection>` | 产品功能卡片列表 |
| `<FooterSection>` | 页脚（版权、链接） |

## 依赖关系

```
hero
├── 外部：motion/react（动画）、next-intl（i18n）
└── 内部：features/dashboard — LocaleSwitcher、ModeToggle（NavBar 复用）
```

## 注意事项

- 视觉依据是根目录 `DESIGN.md`（深色优先、黑白单色、无渐变、无阴影、无模糊）；旧的"方向 B+C / Gemini 风格"已被取代，不再使用
- `<HeroSection>` 里的 TradingView 迷你图依赖用户主题（存在 localStorage），服务端渲染时不能直接写入 `color-theme`，否则 hydration 不匹配；现在用 `useSyncExternalStore` 区分服务端与客户端，客户端挂载后才放入图表
- 落地页不再使用入场动画：`whileInView` 的内容在整页截图和禁用 JS 时会一直是透明的
- 本模块对 SEO 有直接影响，组件应使用语义化 HTML 标签
