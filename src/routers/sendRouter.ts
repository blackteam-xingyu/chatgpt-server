import Router from 'koa-router';
import Koa from 'koa';
import $axios from '../utils/Axios';
import Config from '../utils/Config';
import moment from 'moment';
import sleep from '../utils/Sleep';
import Model from '../utils/Model';
import { CODE_STATUS } from '../utils/Enum';
import { AxiosResponse } from 'axios';
import Logger from '../utils/Logger';

const sendRouter = (router: Router) => {
  router.post('/send', async (ctx: Koa.Context) => {
    try {
      const startTime = moment();
      const { text, inputFileId } = ctx.request.body;
      let fileId = '';
      if (inputFileId) {
        fileId = inputFileId;
      } else {
        const {
          data: { data },
        } = await $axios.post<any, AxiosResponse<FileRecord>>(Config.server.url.file, {
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
      await $axios.post('https://api.steamship.com/api/v1/block/create', {
        fileId,
        text,
        tags: [{ kind: 'role', name: 'user', client: { config: {} } }],
        uploadType: 'none',
      });
      const {
        data: { status },
      } = await $axios.post<any, AxiosResponse<StatusRecord>>(
        'https://api.steamship.com/api/v1/plugin/instance/generate',
        {
          appendOutputToFile: false,
          inputFileId: fileId,
          pluginInstance: Config.steamship.plugin,
        },
      );
      const taskId = status.taskId;
      Logger.info(taskId);
      let pastTime = moment();
      const timeout = Config.server.timeout ? Config.server.timeout * 1000 : 2 * 60 * 1000;
      while (pastTime.diff(startTime) < timeout) {
        const {
          data: { status, data },
        } = await $axios.post<any, AxiosResponse<StatusRecord>>('https://api.steamship.com/api/v1/task/status', {
          taskId,
        });
        Logger.info(status);
        if (status.state === 'succeeded') {
          ctx.body = new Model(CODE_STATUS.SUCCESS, { text: data?.blocks[0].text, fileId }, '响应成功').getRecord();
          await $axios.post('https://api.steamship.com/api/v1/block/create', {
            fileId,
            text: data?.blocks[0].text,
            tags: [{ kind: 'role', name: 'system', client: { config: {} } }],
            uploadType: 'none',
          });
          return;
        } else if (status.state === 'failed') {
          ctx.body = new Model(CODE_STATUS.ERROR, null, '响应失败').getRecord();
          return;
        }
        await sleep(2000);
        pastTime = moment();
      }
      ctx.body = new Model(CODE_STATUS.OVERTIME, null, '响应超时').getRecord();
      return;
    } catch (error) {
      Logger.error(error);
      ctx.body = new Model(CODE_STATUS.ERROR, null, '响应失败').getRecord();
    }
  });
};
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

interface Block {
  text: string;
  tags: Tag[];
}

interface Tag {
  name: string;
  kind: string;
}
export default sendRouter;
