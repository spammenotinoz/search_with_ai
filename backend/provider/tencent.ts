import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import { ClientConfig } from 'tencentcloud-sdk-nodejs/tencentcloud/common/interface';
import { Client } from 'tencentcloud-sdk-nodejs/tencentcloud/services/hunyuan/v20230901/hunyuan_client';
import { BaseChat } from './base/base';
import { IChatInputMessage, IStreamHandler } from '../interface';
import { DefaultSystem } from '../utils/constant';

export class TencentChat implements BaseChat {
  private client: Client;
  public platform = 'tencent';

  constructor() {
    const key = process.env.TENCENT_KEY;
    const secret = process.env.TENCENT_SECRET;
    const config: ClientConfig = {
      credential: {
        secretId: key,
        secretKey: secret
      },
      region: '',
      profile: {
        httpProfile: {
          endpoint: 'hunyuan.tencentcloudapi.com'
        }
      }
    };
    this.client = new tencentcloud.hunyuan.v20230901.Client(config);
  }

  async chatStream(
    messages: IChatInputMessage[],
    onMessage: IStreamHandler,
    model: string,
    system = DefaultSystem
  ): Promise<void> {
    const Messages = this.transformMessage(messages);
    console.log(model);
    if (system) {
      Messages.unshift({
        Role: 'system',
        Content: system
      });
    }
    const params = {
      Messages
    };
    return new Promise((resolve, reject) => {
      // Use any available method that seems appropriate for chat functionality
      (this.client as any).ChatStd(params).then(
        (result: any) => {
          const text = result.Choices?.[0].Delta?.Content || '';
          const stop = result.Choices?.[0].FinishReason === 'stop';
          onMessage?.(text, stop);
          if (stop) resolve();
        },
        (err: any) => {
          reject(err);
        }
      );
    });
  }

  private transformMessage(messages: IChatInputMessage[]) {
    return messages.map(msg => ({
      Role: msg.role,
      Content: msg.content
    }));
  }
}

export const tencent = new TencentChat();