import Router from 'koa-router';
import Koa from 'koa';
import moment from 'moment';
import { AxiosResponse } from 'axios';
import $axios from '../utils/Axios';
import Config from '../utils/Config';
import sleep from '../utils/Sleep';
import Model from '../utils/Model';
import { CODE_STATUS } from '../utils/Enum';
import Logger from '../utils/Logger';

const router = new Router();
const steamshipPost = <R>(url: string, data?: any) => {
  return new Promise<R>((resolve, reject) => {
    $axios
      .post<any, AxiosResponse<R>>(url, data, {
        headers: {
          authorization: `Bearer ${Config.steamship?.token}` as string,
          'x-workspace-id': Config.steamship?.workspace as string,
        },
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

router.post('/send', async (ctx: Koa.Context) => {
  if (Config.steamship) {
    try {
      const startTime = moment();
      const { text, inputFileId } = ctx.request.body;
      let fileId = '';
      if (inputFileId) {
        fileId = inputFileId;
      } else {
        const { data } = await steamshipPost<FileRecord>(Config.steamship.url.file, {
          type: 'blocks',
          blocks: [
            {
              text: "Hi, I'm GPT-4. What do you want to chat about?",
              tags: [{ kind: 'role', name: 'system', client: { config: {} } }],
              client: { config: {} },
            },
          ],
        });
        fileId = data.file.id;
        Logger.info(fileId);
      }
      await steamshipPost(Config.steamship.url.file, {
        fileId,
        text,
        tags: [{ kind: 'role', name: 'user', client: { config: {} } }],
        uploadType: 'none',
      });
      const { status } = await steamshipPost<StatusRecord>(Config.steamship.url.generate, {
        appendOutputToFile: false,
        inputFileId: fileId,
        pluginInstance: Config.steamship.plugin,
      });
      const { taskId } = status;
      Logger.info(taskId);
      let pastTime = moment();
      const timeout = Config.server.timeout ? Config.server.timeout * 1000 : 2 * 60 * 1000;
      while (pastTime.diff(startTime) < timeout) {
        // eslint-disable-next-line no-redeclare, no-await-in-loop
        const { status, data } = await steamshipPost<StatusRecord>(Config.steamship.url.status, {
          taskId,
        });
        Logger.info(status);
        if (status.state === 'succeeded') {
          ctx.body = new Model(CODE_STATUS.SUCCESS, { text: data?.blocks[0].text, fileId }, '响应成功').getRecord();
          // eslint-disable-next-line no-await-in-loop
          await steamshipPost(Config.steamship.url.block, {
            fileId,
            text: data?.blocks[0].text,
            tags: [{ kind: 'role', name: 'system', client: { config: {} } }],
            uploadType: 'none',
          });
          return;
        }
        if (status.state === 'failed') {
          ctx.body = new Model(CODE_STATUS.ERROR, null, '响应失败').getRecord();
          return;
        }
        // eslint-disable-next-line no-await-in-loop
        await sleep(2000);
        pastTime = moment();
      }
      ctx.body = new Model(CODE_STATUS.OVERTIME, null, '响应超时').getRecord();
      return;
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, error, '响应失败').getRecord();
    }
  } else {
    ctx.body = new Model(CODE_STATUS.NOAPI, null, '接口未开放').getRecord();
  }
});
interface FileRecord {
  data: FileData;
}

interface FileData {
  file: File;
}

interface File {
  mimeType: string;
  createdAt: string;
  handle: string;
  tags: any[];
  updatedAt: string;
  workspaceId: string;
  tenantId: string;
  id: string;
  blocks: Block[];
  userId: string;
}

interface Block {
  tags: Tag[];
  mimeType: string;
  index: number;
  id: string;
  fileId: string;
  text: string;
}

interface Tag {
  id: string;
  blockId: string;
  kind: string;
  name: string;
  fileId: string;
}
interface StatusRecord {
  status: Status;
  data?: DataRecord;
}

interface Status {
  userId: string;
  taskCreatedOn: string;
  taskType: string;
  assignedWorker?: string;
  version: string;
  taskId: string;
  startedAt?: string;
  taskLastModifiedOn: string;
  name: string;
  workspaceId: string;
  input: string;
  state: string;
}
interface DataRecord {
  blocks: Block[];
}

export default router;
