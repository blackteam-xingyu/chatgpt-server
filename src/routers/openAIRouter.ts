import Router from 'koa-router';
import Koa from 'koa';
import _ from 'lodash';
import { AxiosResponse } from 'axios';
import { PassThrough } from 'stream';
import * as client from '@prisma/client';
import moment from 'moment';
import Model from '../utils/Model';
import { CODE_STATUS, OpenAITools } from '../utils/Enum';
import Config from '../utils/Config';
import $axios from '../utils/Axios';
import Logger from '../utils/Logger';
import SSE from '../utils/SSE';

const prisma = new client.PrismaClient();
const router = new Router();

const headers: Record<string, string> = { Authorization: `Bearer ${Config.openai?.token}` as string };
if (Config.openai?.organization) {
  headers['OpenAI-Organization'] = Config.openai.organization;
}
const openAIGet = <R>(url: string, data?: any) => {
  return new Promise<R>((resolve, reject) => {
    $axios
      .get<any, AxiosResponse<R>>(url, {
        headers,
        data,
      })
      .then((res) => {
        if (res.status >= 200 && res.status < 300) {
          Logger.info(res);
          resolve(res.data);
        } else {
          Logger.error(res);
          reject(new Error('error'));
        }
      })
      .catch((error) => {
        Logger.error(error);
        reject(error);
      });
  });
};
const openAIPost = <R>(url: string, data?: any) => {
  return new Promise<R>((resolve, reject) => {
    $axios
      .post<any, AxiosResponse<R>>(url, data, { headers })
      .then((res) => {
        if (res.status >= 200 && res.status < 300) {
          Logger.info(res);
          resolve(res.data);
        } else {
          Logger.error(res);
          reject(new Error('error'));
        }
      })
      .catch((error) => {
        Logger.error(error);
        reject(error);
      });
  });
};
const openAISsePost = <T>(url: string, body: T, stream: PassThrough, tool: OpenAITools, chatcode?: string) => {
  return SSE<T>(
    url,
    {
      headers,
      body,
    },
    stream,
    tool,
    chatcode,
  );
};

router.get('/models', async (ctx: Koa.Context) => {
  if (Config.openai) {
    try {
      const res = await openAIGet<OpenAIModels>(Config.openai.url.model);
      const models = res.data.map((item) => {
        return item.id;
      });
      Logger.debug(JSON.stringify(res.data));
      ctx.body = new Model(CODE_STATUS.SUCCESS, { models, suggest: Config.openai.models }, '响应成功');
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败');
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NOAPI, null, '接口未开放');
  }
});
// completions
router.post('/completions', async (ctx: Koa.Context) => {
  if (Config.openai) {
    try {
      const { model, prompt, max_tokens: maxTokens, temperature, n }: CompletionsParams = ctx.request.body;
      const param: Record<string, string | number | boolean> = { stream: false };
      if (model) {
        if (!Config.openai.models.completions.includes(model)) {
          throw new Error('该模型不包含在推荐的completions内，为了避免错误使用模型，本次响应取消');
        } else {
          param.model = model;
        }
      } else {
        throw new Error('model为必选参数');
      }
      if (!prompt) {
        throw new Error('prompt为必选参数');
      }
      param.prompt = prompt;
      param.max_tokens = maxTokens || Config.openai.default?.completions?.max_token || 2048;
      param.temperature = _.clamp(temperature || 1, 0, 2);
      param.n = n || Config.openai.default?.completions?.count || 1;
      const res = await openAIPost<CompletionsRecord>(Config.openai.url.completions, param);
      ctx.body = new Model(
        CODE_STATUS.SUCCESS,
        res.choices.map((item) => item.text),
        '响应成功',
      );
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败');
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NOAPI, null, '接口未开放');
  }
});
router.post('/completions/stream', async (ctx: Koa.Context) => {
  if (Config.openai) {
    try {
      const { model, prompt, max_tokens: maxTokens, temperature }: CompletionsParams = ctx.request.body;
      const param: Record<string, string | number | boolean> = { stream: true };
      if (model) {
        if (!Config.openai.models.completions.includes(model)) {
          throw new Error('该模型不包含在推荐的completions内，为了避免错误使用模型，本次响应取消');
        } else {
          param.model = model;
        }
      } else {
        throw new Error('model为必选参数');
      }
      if (!prompt) {
        throw new Error('prompt为必选参数');
      }
      param.prompt = prompt;
      param.max_tokens = maxTokens || Config.openai.default?.completions?.max_token || 2048;
      param.temperature = _.clamp(temperature || 1, 0, 2);
      param.n = 1;
      const stream = new PassThrough();
      ctx.body = stream;
      openAISsePost(Config.openai.url.completions, param, stream, OpenAITools.COMPLETIONS);
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败');
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NOAPI, null, '接口未开放');
  }
});
router.post('/completions/sse', async (ctx: Koa.Context) => {
  ctx.set({
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream', // 表示返回数据是个 stream
  });
  if (Config.openai) {
    try {
      const { model, prompt, max_tokens: maxTokens, temperature, n }: CompletionsParams = ctx.request.body;
      const param: Record<string, string | number | boolean> = { stream: true };
      if (model) {
        if (!Config.openai.models.completions.includes(model)) {
          throw new Error('该模型不包含在推荐的completions内，为了避免错误使用模型，本次响应取消');
        } else {
          param.model = model;
        }
      } else {
        throw new Error('model为必选参数');
      }
      if (!prompt) {
        throw new Error('prompt为必选参数');
      }
      param.prompt = prompt;
      param.max_tokens = maxTokens || Config.openai.default?.completions?.max_token || 2048;
      param.temperature = _.clamp(temperature || 1, 0, 2);
      param.n = n || Config.openai.default?.completions?.count || 1;
      if (maxTokens) param.max_tokens = maxTokens;
      const stream = new PassThrough();
      ctx.body = stream;
      openAISsePost(Config.openai.url.completions, param, stream, OpenAITools.COMPLETIONS);
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败');
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NOAPI, null, '接口未开放');
  }
});
// chat
router.post('/chat', async (ctx: Koa.Context) => {
  if (Config.openai) {
    try {
      const {
        chatcode,
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        initMessage,
      }: ChatPramas = ctx.request.body;
      const param: Record<string, any> = { stream: false };
      if (model) {
        if (!Config.openai.models.chat.includes(model)) {
          throw new Error('该模型不包含在推荐的chat内，为了避免错误使用模型，本次响应取消');
        } else {
          param.model = model;
        }
      } else {
        throw new Error('model为必选参数');
      }
      if (!messages) {
        throw new Error('messages为必选参数');
      }
      let code: string = btoa(`${moment().format('YYYY-MM-DD HH:mm:ss')}`);
      param.messages = [];
      if (initMessage) {
        param.messages.push(initMessage);
      }
      if (chatcode) {
        code = chatcode;
        const chat = await prisma.chatHistory.findMany({
          where: {
            chatcode,
          },
          orderBy: {
            insertAt: 'asc',
          },
          take: -(Config.openai.default?.chat?.memory || 10),
          select: {
            author: true,
            text: true,
          },
        });
        chat.forEach((item) => {
          param.messages.push({ role: item.author, content: item.text });
        });
      }
      messages.forEach((item) => {
        param.messages.push({ role: item.role, content: item.content });
      });
      param.max_tokens = maxTokens || Config.openai.default?.chat?.max_token || 2048;
      param.temperature = _.clamp(temperature || 1, 0, 2);
      if (maxTokens) param.max_tokens = maxTokens;
      Logger.debug(param);
      const res = await openAIPost<ChatRecord>(Config.openai.url.chat, param);
      ctx.body = new Model(CODE_STATUS.SUCCESS, { chatcode: code, ...res.choices[0].message }, '响应成功');
      messages.push(res.choices[0].message);
      Promise.all(
        messages.map(async (item) => {
          await prisma.chatHistory.create({
            data: {
              text: item.content,
              chatcode: code,
              author: item.role,
            },
          });
        }),
      );
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败');
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NOAPI, null, '接口未开放');
  }
});
router.post('/chat/stream', async (ctx: Koa.Context) => {
  if (Config.openai) {
    try {
      const {
        chatcode,
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        initMessage,
      }: ChatPramas = ctx.request.body;
      const param: Record<string, any> = { stream: true };
      if (model) {
        if (!Config.openai.models.chat.includes(model)) {
          throw new Error('该模型不包含在推荐的chat内，为了避免错误使用模型，本次响应取消');
        } else {
          param.model = model;
        }
      } else {
        throw new Error('model为必选参数');
      }
      if (!messages) {
        throw new Error('messages为必选参数');
      }
      let code: string = btoa(`${moment().format('YYYY-MM-DD HH:mm:ss')}`);
      param.messages = [];
      if (initMessage) {
        param.messages.push(initMessage);
      }
      if (chatcode) {
        code = chatcode;
        const chat = await prisma.chatHistory.findMany({
          where: {
            chatcode,
          },
          orderBy: {
            insertAt: 'asc',
          },
          take: -(Config.openai.default?.chat?.memory || 10),
          select: {
            author: true,
            text: true,
          },
        });
        chat.forEach((item) => {
          param.messages.push({ role: item.author, content: item.text });
        });
      }
      messages.forEach((item) => {
        param.messages.push({ role: item.role, content: item.content });
      });
      param.max_tokens = maxTokens || Config.openai.default?.chat?.max_token || 2048;
      param.temperature = _.clamp(temperature || 1, 0, 2);
      Logger.debug(param);
      const stream = new PassThrough();
      ctx.body = stream;
      await Promise.all(
        messages.map(async (item) => {
          await prisma.chatHistory.create({
            data: {
              text: item.content,
              chatcode: code,
              author: item.role,
            },
          });
        }),
      );
      openAISsePost(Config.openai.url.chat, param, stream, OpenAITools.CHAT, code);
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败');
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NOAPI, null, '接口未开放');
  }
});
router.post('/chat/sse', async (ctx: Koa.Context) => {
  ctx.set({
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream', // 表示返回数据是个 stream
  });
  if (Config.openai) {
    try {
      const {
        chatcode,
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        initMessage,
      }: ChatPramas = ctx.request.body;
      const param: Record<string, any> = { stream: true };
      if (model) {
        if (!Config.openai.models.chat.includes(model)) {
          throw new Error('该模型不包含在推荐的chat内，为了避免错误使用模型，本次响应取消');
        } else {
          param.model = model;
        }
      } else {
        throw new Error('model为必选参数');
      }
      if (!messages) {
        throw new Error('messages为必选参数');
      }
      let code: string = btoa(`${moment().format('YYYY-MM-DD HH:mm:ss')}`);
      param.messages = [];
      if (initMessage) {
        param.messages.push(initMessage);
      }
      if (chatcode) {
        code = chatcode;
        const chat = await prisma.chatHistory.findMany({
          where: {
            chatcode,
          },
          orderBy: {
            insertAt: 'asc',
          },
          take: -(Config.openai.default?.chat?.memory || 10),
          select: {
            author: true,
            text: true,
          },
        });
        chat.forEach((item) => {
          param.messages.push({ role: item.author, content: item.text });
        });
      }
      messages.forEach((item) => {
        param.messages.push({ role: item.role, content: item.content });
      });
      if (maxTokens) param.max_tokens = maxTokens;
      else param.max_tokens = Config.openai.default?.chat?.max_token || 2048;
      if (temperature) {
        param.temperature = _.clamp(temperature, 0, 2);
      }
      if (maxTokens) param.max_tokens = maxTokens;
      Logger.debug(param);
      const stream = new PassThrough();
      ctx.body = stream;
      await Promise.all(
        messages.map(async (item) => {
          await prisma.chatHistory.create({
            data: {
              text: item.content,
              chatcode: code,
              author: item.role,
            },
          });
        }),
      );
      openAISsePost(Config.openai.url.chat, param, stream, OpenAITools.CHAT, code);
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败');
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NOAPI, null, '接口未开放');
  }
});
// edits
router.post('/edits', async (ctx: Koa.Context) => {
  if (Config.openai) {
    try {
      const { model, input, instruction, temperature, n }: EditsParams = ctx.request.body;
      const param: Record<string, string | number | boolean> = { input, instruction };
      if (model) {
        if (!Config.openai.models.edits.includes(model)) {
          throw new Error('该模型不包含在推荐的edits内，为了避免错误使用模型，本次响应取消');
        } else {
          param.model = model;
        }
      } else {
        throw new Error('model为必选参数');
      }
      param.temperature = _.clamp(temperature || 1, 0, 2);
      param.n = n || Config.openai.default?.edits?.count || 1;
      const res = await openAIPost<EditsRecord>(Config.openai.url.edits, param);
      ctx.body = new Model(
        CODE_STATUS.SUCCESS,
        res.choices.map((item) => item.text),
        '响应成功',
      );
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败');
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NOAPI, null, '接口未开放');
  }
});
// image
router.post('/image', async (ctx: Koa.Context) => {
  if (Config.openai) {
    try {
      const { prompt, n, size, response_format: responseFormat }: ImageParams = ctx.request.body;
      const param: Record<string, string | number | boolean> = {};
      if (!prompt) {
        throw new Error('prompt为必选参数');
      }
      if (prompt.length > 1000) {
        throw new Error('prompt的长度不可超过1000');
      }
      param.prompt = prompt;
      param.size = size || Config.openai.default?.image?.size || '1024x1024';
      param.response_format = responseFormat || Config.openai.default?.image?.response_format || 'url';
      param.n = n || Config.openai.default?.image?.count || 1;
      Logger.debug(param);
      const res = await openAIPost<ImageRecord>(Config.openai.url.image, param);
      ctx.body = new Model(
        CODE_STATUS.SUCCESS,
        res.data.map((item) => item.url || item.b64_json),
        '响应成功',
      );
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败');
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NOAPI, null, '接口未开放');
  }
});
interface OpenAIModels {
  object: string;
  data: Datum[];
}

interface Datum {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: Permission[];
  root: string;
  parent?: any;
}

interface Permission {
  id: string;
  object: string;
  created: number;
  allow_create_engine: boolean;
  allow_sampling: boolean;
  allow_logprobs: boolean;
  allow_search_indices: boolean;
  allow_view: boolean;
  allow_fine_tuning: boolean;
  organization: string;
  group?: any;
  is_blocking: boolean;
}

interface CompletionsParams {
  model: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  n?: number;
}

interface CompletionsRecord {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: CompletionsChoice[];
  usage: Usage;
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface CompletionsChoice {
  text: string;
  index: number;
  logprobs?: any;
  finish_reason: string;
}

interface ChatPramas {
  chatcode?: string;
  model: string;
  messages: Message[];
  initMessage?: Message;
  max_tokens?: number;
  temperature?: number;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
interface ChatRecord {
  id: string;
  object: string;
  created: number;
  choices: ChatChoice[];
  usage: Usage;
}

interface ChatChoice {
  index: number;
  message: Message;
  finish_reason: string;
}
interface EditsParams {
  model: string;
  input: string;
  instruction: string;
  temperature?: number;
  n?: number;
}
interface EditsRecord {
  object: string;
  created: number;
  choices: CompletionsChoice[];
  usage: Usage;
}
interface ImageParams {
  prompt: string;
  response_format?: 'url' | 'b64_json';
  size?: '256x256' | '512x512' | '1024x1024';
  n?: number;
}
interface ImageRecord {
  created: string;
  data: Array<{ url?: string; b64_json?: string }>;
}

export default router;
