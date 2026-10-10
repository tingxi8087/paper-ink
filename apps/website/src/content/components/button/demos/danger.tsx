import { Button } from 'paper-ink';
export default function Demo() {
  return <div className="example-row">
    <Button type="primary" danger>删除项目</Button>
    <Button danger>Danger</Button>
    <Button type="text" danger>Text</Button>
    <Button type="link" danger>Link</Button>
  </div>;
}
