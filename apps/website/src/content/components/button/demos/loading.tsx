import { useState } from 'react';
import { Button } from 'paper-ink';
export default function Demo() {
  const [loading, setLoading] = useState(false);
  return <div className="example-row">
    <Button type="primary" loading={loading} onClick={() => {
      setLoading(true);
      setTimeout(() => setLoading(false), 1500);
    }}>点击提交</Button>
    <Button loading>加载中</Button>
    <Button disabled>Disabled</Button>
    <Button type="primary" disabled>Disabled</Button>
  </div>;
}
