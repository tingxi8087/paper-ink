export interface DocumentationEntry {
 route: string;
 label: string;
 group: string;
 description: string;
 aliases: readonly string[];
}
export const documentationGroups = [
 { group: '开始', items: [['guide', '快速开始'], ['theme', '主题实验室']] },
 { group: '通用与布局', items: [['button', 'Button 按钮'], ['icons', 'Icons 图标'], ['arrangement', 'Stack / Inline / SimpleGrid'], ['layout', 'Layout 布局'], ['splitter', 'Splitter 分隔面板'], ['steps', 'Steps 步骤条'], ['tabs', 'Tabs 标签页'], ['typography', 'Typography 排版'], ['divider', 'Divider 分割线'], ['breadcrumb', 'Breadcrumb 面包屑'], ['dropdown', 'Dropdown 下拉菜单'], ['menu', 'Menu 导航菜单'], ['pagination', 'Pagination 分页']] },
 { group: '数据录入', items: [['form', 'Form 表单'], ['input', 'Input 输入框'], ['auto-complete', 'AutoComplete 自动完成'], ['color-picker', 'ColorPicker 颜色选择器'], ['upload', 'Upload 文件上传'], ['slider', 'Slider 滑动输入条'], ['checkbox', 'Checkbox 多选框'], ['radio', 'Radio 单选框'], ['switch', 'Switch 开关'], ['select', 'Select 选择器'], ['input-number', 'InputNumber 数字输入框'], ['date-picker', 'DatePicker 日期选择器'], ['time-picker', 'TimePicker 时间选择器'], ['segmented', 'Segmented 分段控制器'], ['rate', 'Rate 评分']] },
 { group: '展示与反馈', items: [['statistic', 'Statistic 统计数值'], ['image', 'Image 图片'], ['table', 'Table 表格'], ['tag', 'Tag 标签'], ['empty', 'Empty 空状态'], ['alert', 'Alert 警告提示'], ['spin', 'Spin 加载'], ['tooltip', 'Tooltip 文字提示'], ['message', 'Message 全局提示'], ['notification', 'Notification 通知提醒'], ['modal', 'Modal 对话框'], ['avatar', 'Avatar 头像'], ['badge', 'Badge 徽标'], ['card', 'Card 卡片'], ['collapse', 'Collapse 折叠面板'], ['descriptions', 'Descriptions 描述列表'], ['popover', 'Popover 气泡卡片'], ['popconfirm', 'Popconfirm 气泡确认'], ['drawer', 'Drawer 抽屉'], ['progress', 'Progress 进度条'], ['skeleton', 'Skeleton 骨架屏'], ['timeline', 'Timeline 时间轴'], ['result', 'Result 结果页']] },
 { group: 'Hooks', items: [['hooks', '通用 Hooks'], ['util', 'Util 工具类型']] },
 { group: '组合', items: [['showcase', '组件画廊'], ['app', 'App 应用入口'], ['examples', '实际场景']] },
] as const;

const details: Record<string, [string, string]> = {
  icons: ["随库安装的 Tabler Icons，浏览、搜索和复制图标", "图标 SVG Tabler icons 图标库 搜索图标"],
  "showcase": ["用真实组件体验水墨风格与常用交互", "演示 画廊 风格 展示 demo gallery showcase"],
  "guide": [
    "安装、按需引入与源码分发",
    "安装 npm CLI getting started"
  ],
  "theme": [
    "配置颜色、尺寸和组件主题",
    "主题变量 token 配色 theme laboratory"
  ],
  "arrangement": [
    "用 Stack、Inline 与 SimpleGrid 组织间距和布局",
    "Stack Inline SimpleGrid 网格 垂直 水平"
  ],
  "input": [
    "文本输入、搜索、密码与多行文本",
    "Password Search TextArea 密码 搜索 文本框"
  ],
  "modal": [
    "对话框与命令式弹窗",
    "弹窗 ref.open"
  ],
  "date-picker": [
    "选择日期、日期范围与日期时间",
    "RangePicker 日期范围 日历"
  ],
  "time-picker": [
    "选择小时、分钟与秒",
    "时分秒 时间"
  ],
  "upload": [
    "文件选择、拖拽与上传任务管理",
    "useUpload Dragger 附件 文件 图片墙"
  ],
  "hooks": [
    "即时状态读取与本地持久化",
    "useRefState useLocalstorageState localStorage 持久化"
  ],
  "table": [
    "展示表格与管理分页查询",
    "useTableHooks useBasePageTable useTableChecked 列表 查询 排序 筛选"
  ],
  "form": [
    "字段绑定、校验与动态表单",
    "Field useWatch useFormState useFieldState useForm 表单验证"
  ],
  "examples": [
    "组合组件构建实际页面",
    "案例 示例"
  ],
  "util": [
    "共享工具类型与类型推导",
    "工具 TypeScript 类型"
  ],
  "button": [
    "触发操作、链接与加载状态",
    "按钮 Link 链接"
  ],
  "layout": [
    "组合页头、侧栏、内容与页脚",
    "Header Sider Content Footer 布局"
  ],
  "splitter": [
    "可拖动调整尺寸的分隔面板",
    "Panel 分屏 拖动"
  ],
  "steps": [
    "展示任务进度与步骤导航",
    "步骤 流程"
  ],
  "tabs": [
    "在多个内容面板之间切换",
    "标签页"
  ],
  "typography": [
    "标题、正文与文本操作",
    "Title Text Paragraph 文本 排版"
  ],
  "divider": [
    "分隔内容与段落",
    "分割线 分隔线"
  ],
  "breadcrumb": [
    "展示当前页面的导航路径",
    "面包屑 路径"
  ],
  "dropdown": [
    "弹出操作菜单",
    "下拉 操作菜单"
  ],
  "menu": [
    "侧边与顶部导航菜单",
    "导航 子菜单 SubMenu"
  ],
  "pagination": [
    "切换页码、每页条数与快速跳页",
    "分页 页码"
  ],
  "auto-complete": [
    "输入时显示候选建议",
    "自动完成 联想 补全"
  ],
  "color-picker": [
    "选择颜色、透明度与常用色",
    "颜色 调色板 取色"
  ],
  "slider": [
    "拖动选择数值或区间",
    "滑块 滑动 范围"
  ],
  "checkbox": [
    "多选选项与选项组",
    "多选 Group"
  ],
  "radio": [
    "互斥选项与单选组",
    "单选 Group"
  ],
  "switch": [
    "切换开关状态",
    "开关 toggle"
  ],
  "select": [
    "单选、多选与候选项搜索",
    "选择器 下拉 多选"
  ],
  "input-number": [
    "输入数值与精确步进",
    "数字 数值 步进"
  ],
  "segmented": [
    "紧凑地切换选项",
    "分段控制 切换"
  ],
  "rate": [
    "星级评分与半星选择",
    "评分 星星"
  ],
  "statistic": [
    "展示重点数值与格式化统计",
    "统计 数字 格式化"
  ],
  "image": [
    "图片展示与放大预览",
    "图片 PreviewGroup 预览"
  ],
  "tag": [
    "分类标签与可选择标签",
    "标签 CheckableTag"
  ],
  "empty": [
    "内容为空时的占位展示",
    "空状态 无数据"
  ],
  "alert": [
    "内联展示提示与操作结果",
    "警告 成功 提示 错误"
  ],
  "spin": [
    "内容载入中的状态提示",
    "加载 loading"
  ],
  "tooltip": [
    "悬停或聚焦时展示文字提示",
    "提示 文字提示"
  ],
  "message": [
    "短暂的全局操作反馈",
    "全局提示 toast"
  ],
  "notification": [
    "展示可交互的通知提醒",
    "通知 提醒"
  ],
  "avatar": [
    "展示头像、文字与头像组",
    "头像 Group"
  ],
  "badge": [
    "展示计数、状态与角标",
    "徽标 角标"
  ],
  "card": [
    "组织相关内容与操作",
    "卡片"
  ],
  "collapse": [
    "展开或折叠内容区域",
    "折叠 手风琴"
  ],
  "descriptions": [
    "以键值对展示详情",
    "详情 描述列表"
  ],
  "popover": [
    "展示补充内容的浮层卡片",
    "气泡 浮层"
  ],
  "popconfirm": [
    "操作前的轻量确认",
    "气泡确认 删除确认"
  ],
  "drawer": [
    "从边缘展开的侧滑面板",
    "抽屉 侧滑"
  ],
  "progress": [
    "展示任务进度与完成比例",
    "进度 Circle 圆环"
  ],
  "skeleton": [
    "载入内容的结构占位",
    "骨架屏 占位"
  ],
  "timeline": [
    "按顺序展示事件与历史",
    "时间轴 历史"
  ],
  "result": [
    "展示成功、失败与权限结果页",
    "结果 403 404 500"
  ],
  "app": [
    "提供应用级消息与弹窗上下文",
    "useApp 应用 全局上下文"
  ]
};
export const documentation: DocumentationEntry[] = documentationGroups.flatMap(group => group.items.map(([route, label]) => ({
 route, label, group: group.group,
 description: details[route]?.[0] ?? `用于${label.includes(' ') ? label.split(' ').slice(1).join(' ') : label}的交互与展示`,
 aliases: details[route]?.[1].split(' ') ?? [],
})));
const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/[\s_./-]+/g, '');
/** Name matches precede aliases, followed by descriptions. Every query word must match. */
export function searchDocumentation(query: string, entries: readonly DocumentationEntry[] = documentation): DocumentationEntry[] {
 const words = query.trim().toLocaleLowerCase().split(/\s+/).map(normalize).filter(Boolean);
 if (!words.length) return [...entries];
 return entries.map((entry, index) => {
   const name = normalize(entry.label), route = normalize(entry.route);
   const aliases = entry.aliases.map(normalize), description = normalize(entry.description);
   let score = 0;
   for (const word of words) {
     if (name === word || route === word) score += 100;
     else if (name.startsWith(word) || route.startsWith(word)) score += 80;
     else if (name.includes(word)) score += 60;
     else if (aliases.some(alias => alias === word)) score += 45;
     else if (aliases.some(alias => alias.includes(word))) score += 35;
     else if (description.includes(word)) score += 15;
     else return { entry, score: -1, index };
   }
   return { entry, score, index };
 }).filter(result => result.score >= 0).sort((a, b) => b.score - a.score || a.index - b.index).map(result => result.entry);
}
