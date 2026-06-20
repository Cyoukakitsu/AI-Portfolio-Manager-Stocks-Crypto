# Dashboard — 架构说明

## 职责

全局应用骨架：侧边栏导航、面包屑、Header 控件、国际化语言切换、深色/浅色主题切换、全局设置弹窗、用户头像。不处理任何业务数据。

## 对外接口

### UI 组件

| 组件 | 说明 |
|---|---|
| `<AppSidebar>` | 主导航侧边栏，包含各功能模块入口 |
| `<DashboardBreadcrumb>` | 当前页面路径面包屑 |
| `<HeaderControls>` | Header 右侧控件组（搜索、主题、语言、用户） |
| `<LocaleSwitcher>` | 国际化语言切换器（英/日） |
| `<ModeToggle>` | 深色 / 浅色 / 系统主题切换 |
| `<SettingsModal>` | 全局设置弹窗（API Key 等配置项） |
| `<UserAvatar>` | 用户头像（显示邮箱首字母） |
| `<WidgetCard>` | 通用内容卡片容器 |
| `<SearchForm>` | 侧边栏内搜索表单 |

## 依赖关系

```
dashboard
├── 外部：next-intl（i18n）、next-themes（主题）
└── 内部：
    ├── features/auth — signOut（UserAvatar）、changePassword（SettingsModal）、getAuthSession（HeaderControls）
    └── features/assets — deleteAllAssets（SettingsModal 清空数据功能）
```

## 注意事项

- 本模块是所有已登录页面的布局容器，修改时注意对所有子功能页面的影响
- `<SettingsModal>` 中存储的 API Key 仅保存在客户端 localStorage，不上传服务器
