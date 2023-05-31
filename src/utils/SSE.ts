import fetchnode from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { PassThrough } from 'stream';
import * as client from '@prisma/client';
import Config from './Config';
import Model from './Model';
import { CODE_STATUS, OpenAITools } from './Enum';
import Logger from './Logger';

const prisma = new client.PrismaClient();
interface Params<T> {
  body: T;
  headers: Record<string, any>;
}
const SSE = async <T>(
  url: string,
  params: Params<T>,
  stream: PassThrough,
  tool: OpenAITools,
  chatcode?: string,
): Promise<NodeJS.ReadableStream | null> => {
  let createStr = '';
  const decoder = new TextDecoder();
  const { body, headers } = params;
  const res = await fetchnode(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    agent: Config.server.proxy
      ? new HttpsProxyAgent(`http://${Config.server.proxy.host}:${Config.server.proxy.port}`)
      : undefined,
  });
  if (res.status !== 200) {
    Logger.debug(res.status);
    stream.end();
    return res.body;
  }
  res.body?.on('data', (chunk) => {
    try {
      const resStr = new Model(CODE_STATUS.SUCCESS);
      const decodeChunk = decoder.decode(chunk);
      // 流结束
      if (decodeChunk.includes('[DONE]')) {
        if (chatcode) stream.write(`${JSON.stringify(new Model(CODE_STATUS.SUCCESS, chatcode, 'code'))}\n`);
        stream.write(`${JSON.stringify(new Model(CODE_STATUS.SUCCESS, '[DONE]', 'end'))}\n`);
        stream.end();
        if (tool === OpenAITools.CHAT && chatcode) {
          prisma.chatHistory.create({
            data: {
              author: 'assistant',
              chatcode,
              text: createStr,
            },
          });
        }
        return;
      }
      const chunkList = decodeChunk.split('data:');
      for (let index = 0; index < chunkList.length; index++) {
        const item = chunkList[index];
        if (!item) {
          continue;
        }
        const message = item.trim();
        // 解析数据
        const parsed = JSON.parse(message);
        switch (tool) {
          case OpenAITools.COMPLETIONS:
            if (parsed.choices[0].text) {
              resStr.setData(parsed.choices[0].text);
              resStr.setMessage('continue');
              stream.write(`${JSON.stringify(resStr)}\n`);
            }
            break;
          case OpenAITools.CHAT:
            if (parsed.choices[0].delta.content) {
              resStr.setData(parsed.choices[0].delta.content);
              resStr.setMessage('continue');
              createStr += parsed.choices[0].delta.content;
              stream.write(`${JSON.stringify(resStr)}\n`);
            }
            break;
          default:
            break;
        }
      }
    } catch (e) {
      // 出现错误, 结束流
      Logger.error(e);
      stream.write(`${JSON.stringify(new Model(CODE_STATUS.ERROR, chunk, 'error'))}\n`);
    }
  });
  return res.body;
};
export default SSE;
