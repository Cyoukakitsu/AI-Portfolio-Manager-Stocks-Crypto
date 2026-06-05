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

- 当前处于重设计阶段（方向 B+C，参考 Gemini UI 风格），实现前需确认最终设计方案
- 本模块对 SEO 有直接影响，组件应使用语义化 HTML 标签
