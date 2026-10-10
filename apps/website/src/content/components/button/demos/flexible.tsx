import { Button } from 'paper-ink';
export default function Demo() {
  return <div style={{ display: 'grid', gap: 16, width: '100%' }}>
    <div className="example-row">
      <Button icon={<span aria-hidden="true">↓</span>}>下载文件</Button>
      <Button icon={<span aria-hidden="true">→</span>} iconPosition="end">下一步</Button>
      <Button href="#/guide">阅读使用指南</Button>
    </div>
    <Button type="primary" block>Block · 占满容器</Button>
  </div>;
}
