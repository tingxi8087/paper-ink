import { useState } from 'react';
import { Button, Input, Stack } from 'paper-ink';
import 'paper-ink/style.css';

export default function Demo() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');

  return (
    <Stack gap="medium" style={{ width: '100%', maxWidth: 360 }}>
      <Input
        aria-label="示例输入框"
        placeholder="输入一些文字"
        value={text}
        onChange={event => setText(event.target.value)}
      />
      <Button type="primary" onClick={() => setResult(text.trim() || '你好，Paper Ink')}>
        确认
      </Button>
      {result && <p role="status">{result}</p>}
    </Stack>
  );
}
