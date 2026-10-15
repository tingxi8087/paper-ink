import * as icons from 'paper-ink/icons';
import type { TablerIcon } from 'paper-ink/icons';
const keywords: Record<string, string> = {
  IconSearch:'搜索 查找 放大镜', IconPlus:'添加 新建 加号', IconMinus:'减少 减号', IconX:'关闭 取消', IconCheck:'确认 勾选 成功', IconChevronDown:'下拉 向下 箭头', IconChevronUp:'向上 箭头', IconChevronLeft:'上一页 向左 箭头', IconChevronRight:'下一页 向右 箭头', IconArrowLeft:'返回 左 箭头', IconArrowRight:'前进 右 箭头', IconArrowUp:'上 箭头', IconArrowDown:'下 箭头', IconHome:'首页 房屋', IconSettings:'设置 齿轮', IconUser:'用户 人员', IconUsers:'团队 多人', IconTrash:'删除 垃圾桶', IconEdit:'编辑 修改', IconPencil:'编辑 铅笔', IconCopy:'复制', IconDownload:'下载', IconUpload:'上传', IconFile:'文件', IconFolder:'文件夹', IconCalendar:'日历 日期', IconClock:'时钟 时间', IconBell:'通知 提醒 铃铛', IconMail:'邮件 信封', IconHeart:'爱心 收藏 喜欢', IconStar:'星星 评分 收藏', IconMenu2:'菜单 导航', IconDots:'更多 省略', IconEye:'显示 查看 眼睛', IconEyeOff:'隐藏 密码', IconLock:'锁 密码 安全', IconBrandGithub:'GitHub 仓库', IconInfoCircle:'信息 提示', IconAlertCircle:'警告 错误', IconCircleCheck:'成功 完成', IconPhoto:'图片 照片', IconFilter:'筛选 过滤', IconRefresh:'刷新 更新', IconLoader2:'加载 等待', IconLink:'链接', IconExternalLink:'外链 新窗口', IconLogout:'退出 登出', IconLogin:'登录', IconSun:'太阳 亮色', IconMoon:'月亮 暗色', IconLayoutGrid:'网格 布局', IconList:'列表', IconTable:'表格', IconCloud:'云', IconClipboard:'剪贴板', IconDeviceDesktop:'电脑 桌面', IconDeviceMobile:'手机 移动', IconShoppingCart:'购物车', IconColorPicker:'颜色 取色', IconPalette:'配色 调色板', IconPrinter:'打印', IconShare:'分享', IconMessage:'消息 聊天',
};
export const iconCatalog = Object.entries(icons)
  .filter(([name, component]) => /^Icon[A-Z0-9]/.test(name) && typeof component === 'object' && component !== null && '$$typeof' in component)
  .map(([name, component]) => ({name, component:component as TablerIcon, filled:name.endsWith('Filled'), keywords:keywords[name.replace(/Filled$/, '')]??''}))
  .sort((a,b) => a.name.localeCompare(b.name,'en'));
export function findIcons(query:string, variant:string) {
  const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return iconCatalog.filter(icon => (variant==='all'||icon.filled===(variant==='filled')) && words.every(word=>(icon.name+' '+icon.keywords).toLowerCase().includes(word)));
}
