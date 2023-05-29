import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import Config from './Config';
import { PassThrough } from 'stream';
import Model from './Model';
import { CODE_STATUS } from './Enum';

interface Params<T> {
  body: T;
  headers: Record<string, string>;
}
const SSE = async <T>(url: string, params: Params<T>, stream: PassThrough) => {
  const decoder = new TextDecoder();
  const { body, headers } = params;
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    agent: new HttpsProxyAgent('http://' + Config.server.proxy?.host + ':' + Config.server.proxy?.port),
  });
  if (res.status !== 200) {
    throw new Error('OpenAI API returned an error');
  } else {
    res.body?.on('data', (data) => {
      try {
        const message = decoder.decode(data).replace(/^data:\s?/, '');
        // 流结束
        if (message === '[DONE]\n\n') {
          stream.write(`${JSON.stringify(new Model(CODE_STATUS.SUCCESS, '', 'end'))}\n`);
          stream.end();
          return;
        }
        // 解析数据
        const parsed = JSON.parse(message);
        const resStr = new Model(CODE_STATUS.SUCCESS, parsed.choices[0].text, 'continue');
        // 写入流
        stream.write(`${JSON.stringify(resStr)}\n`);
      } catch (e) {
        // 出现错误, 结束流
        console.error(e);
        stream.write(`${JSON.stringify(new Model(CODE_STATUS.ERROR, '', 'error'))}\n`);
        stream.end();
        return;
      }
    });
  }
};

export default SSE;
