import Router from 'koa-router';
import Koa from 'koa';
import Model from '../utils/Model';
import { CODE_STATUS } from '../utils/Enum';
import Config from '../utils/Config';
import $axios from '../utils/Axios';
import Logger from '../utils/Logger';
import SSE from '../utils/SSE';
import _ from 'lodash';
import { AxiosResponse } from 'axios';
import { PassThrough } from 'stream';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const router = new Router();

const headers: Record<string, string> = { Authorization: ('Bearer ' + Config.openai?.token) as string };
if (Config.openai?.organization) {
  headers['OpenAI-Organization'] = Config.openai.organization;
}
const openAIGet = <R>(url: string, data?: any) => {
  return new Promise<R>(async (resolve, reject) => {
    try {
      const res = await $axios.get<any, AxiosResponse<R>>(url, {
        headers,
        data,
      });
      if (res.status >= 200 && res.status < 300) {
        Logger.info(res);
        resolve(res.data);
      } else {
        Logger.error(res);
        reject(new Error('error'));
      }
    } catch (error) {
      Logger.error(error);
      reject(error);
    }
  });
};
const openAIPost = <R>(url: string, data?: any) => {
  return new Promise<R>(async (resolve, reject) => {
    try {
      const res = await $axios.post<any, AxiosResponse<R>>(url, data, { headers });
      if (res.status >= 200 && res.status < 300) {
        Logger.info(res);
        resolve(res.data);
      } else {
        Logger.error(res);
        reject(new Error('error'));
      }
    } catch (error) {
      Logger.error(error);
      reject(error);
    }
  });
};
const openAISsePost = <T>(url: string, body: T, stream: PassThrough) =>
  SSE<T>(
    url,
    {
      headers,
      body,
    },
    stream,
  );
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
    ctx.body = new Model(CODE_STATUS.NO_API, null, '接口未开放');
  }
});
//completions
router.post('/completions', async (ctx: Koa.Context) => {
  if (Config.openai) {
    try {
      const { model, prompt, max_tokens, temperature, n }: CompletionsParams = ctx.request.body;
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
      if (max_tokens) param.max_tokens = max_tokens;
      else param.max_tokens = 2048;
      if (temperature) {
        param.temperature = _.clamp(temperature, 0, 2);
      }
      if (n) {
        param.n = n;
      } else {
        param.n = 1;
      }
      if (max_tokens) param.max_tokens = max_tokens;
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
    ctx.body = new Model(CODE_STATUS.NO_API, null, '接口未开放');
  }
});
router.post('/completions/sse', async (ctx: Koa.Context) => {
  if (Config.openai) {
    try {
      const { model, prompt, max_tokens, temperature, n }: CompletionsParams = ctx.request.body;
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
      if (max_tokens) param.max_tokens = max_tokens;
      else param.max_tokens = 2048;
      if (temperature) {
        param.temperature = _.clamp(temperature, 0, 2);
      }
      if (n) {
        param.n = n;
      } else {
        param.n = 1;
      }
      if (max_tokens) param.max_tokens = max_tokens;
      const stream = new PassThrough();
      ctx.body = stream;
      openAISsePost(Config.openai.url.completions, param, stream);
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败');
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NO_API, null, '接口未开放');
  }
});
//chat
router.post('/chat', async (ctx: Koa.Context) => {
  if (Config.openai) {
    try {
      const { id, model, messages, max_tokens, temperature }: ChatPramas = ctx.request.body;
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
      param.messages = messages;
      if (max_tokens) param.max_tokens = max_tokens;
      else param.max_tokens = 2048;
      if (temperature) {
        param.temperature = _.clamp(temperature, 0, 2);
      }
      if (max_tokens) param.max_tokens = max_tokens;
      if (id) {
        
      }
      Logger.debug(param);
      const res = await openAIPost<ChatRecord>(Config.openai.url.chat, param);
      ctx.body = new Model(CODE_STATUS.SUCCESS, res.choices[0].message, '响应成功');
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败');
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NO_API, null, '接口未开放');
  }
});
router.post('/chat/sse', async (ctx: Koa.Context) => {
  if (Config.openai) {
    try {
      const { model, messages, max_tokens, temperature }: ChatPramas = ctx.request.body;
      const param: Record<string, any> = { stream: true };
      if (model) {
        if (!Config.openai.models.chat.includes(model)) {
          throw new Error('该模型不包含在推荐的completions内，为了避免错误使用模型，本次响应取消');
        } else {
          param.model = model;
        }
      } else {
        throw new Error('model为必选参数');
      }
      if (!messages) {
        throw new Error('messages为必选参数');
      }
      param.messages = messages;
      if (max_tokens) param.max_tokens = max_tokens;
      else param.max_tokens = 2048;
      if (temperature) {
        param.temperature = _.clamp(temperature, 0, 2);
      }
      if (max_tokens) param.max_tokens = max_tokens;
      const stream = new PassThrough();
      ctx.body = stream;
      openAISsePost(Config.openai.url.chat, param, stream);
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败');
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NO_API, null, '接口未开放');
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
  id?: string;
  model: string;
  messages: Message[];
  max_tokens?: number;
  temperature?: number;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name: string; //对话作者
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
export default router;
