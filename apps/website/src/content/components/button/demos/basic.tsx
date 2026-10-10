import { Button } from 'paper-ink';
export default function Demo() {
  return <div className="example-row">
    <Button type="primary">Primary</Button>
    <Button>Default</Button>
    <Button type="dashed">Dashed</Button>
    <Button type="text">Text</Button>
    <Button type="link">Link</Button>
  </div>;
}
