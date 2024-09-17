import OpenAI from 'openai';
import { IChatInputMessage, IStreamHandler } from '../../interface';
import { BaseChat } from './base';

export class BaseOpenAIChat implements BaseChat {
  private openai: OpenAI | null;
  public platform: string;
  private readonly defaultModel: string = 'gpt-4o-mini';

  constructor(platform: string, apiKey?: string, baseURL?: string) {
    this.platform = platform;
    if (apiKey) {
      this.openai = new OpenAI({
        baseURL,
        apiKey,
      });
    }
  }

  public async chat(
    messages: IChatInputMessage[],
    model: string = this.defaultModel,
    system?: string
  ) {
    if (!this.openai) {
      throw new Error(`${this.platform} key is not set`);
    }
    if (system) {
      messages = [
        {
          role: 'system',
          content: system,
        },
        ...messages,
      ];
    }
    const res = await this.openai.chat.completions.create({
      messages,
      model: this.defaultModel
    });
    return res.choices[0]?.message.content;
  }

  public async chatStream(
    messages: IChatInputMessage[],
    onMessage: IStreamHandler,
    model: string = this.defaultModel,
    system?: string
  ) {
    if (!this.openai) {
      throw new Error(`${this.platform} key is not set`);
    }
    if (system) {
      messages = [
        {
          role: 'system',
          content: system,
        },
        ...messages,
      ];
    }
    const stream = await this.openai.chat.completions.create({
      messages,
      model: this.defaultModel,
      stream: true
    });
    for await (const chunk of stream) {
      onMessage?.(chunk.choices[0].delta.content || null, false);
    }
    onMessage?.(null, true);
  }

  async listModels() {
    if (!this.openai) throw new Error(`${this.platform} Key is Required.`);
    const models = await this.openai.models.list();
    return models.data.map((model) => model.id);
  }
}