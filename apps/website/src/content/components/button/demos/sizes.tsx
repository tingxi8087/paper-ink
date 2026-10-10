import { Button } from 'paper-ink';
export default function Demo() {
  return <div className="example-row">
    <Button type="primary" size="large">Large</Button>
    <Button type="primary">Middle</Button>
    <Button type="primary" size="small">Small</Button>
    <Button shape="round">Round</Button>
    <Button shape="circle" aria-label="添加">+</Button>
  </div>;
}
