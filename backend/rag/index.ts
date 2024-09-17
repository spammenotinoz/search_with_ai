import { ESearchEngine, IChatInputMessage, IStreamHandler, Provider, SearchFunc, TMode } from '../interface';
import { searchWithBing, searchWithGoogle, searchWithSogou, searchWithSearXNG, searchWithChatGLM } from '../service';
import { DeepQueryPrompt, MoreQuestionsPrompt, RagQueryPrompt, TranslatePrompt } from './prompt';
import platform from '../provider';
import { Models } from '../utils/constant';
import { ESearXNGCategory } from '../search/searxng';
import util from 'util';

interface RagOptions {
  engine?: ESearchEngine
  stream?: boolean
  model?: string
  // use local llm?
  locally?: boolean
  provider?: Provider
}

// const CACHE_NAME = 'search_with_ai';

export class Rag {
  private search: SearchFunc;
  private chat: (...args: any[]) => Promise<any>;
  private model: string;
  // enable stream?
  private stream: boolean;
  // search engine
  private engine: ESearchEngine;

  constructor(params?: RagOptions) {
    const { engine = ESearchEngine.SEARXNG, stream = true, model, locally, provider } = params || {};
    if (!model) throw new Error('model is required');
    if (locally && provider) {
      this.chat = platform[provider].chatStream.bind(platform[provider]);
    } else {
      const chat = processModel(model);
      if (!chat) throw new Error('model is not supported');
      this.chat = chat;
    }
    this.model = model;
    this.stream = stream;
    console.info('[query with]:', engine, model);
    console.info('[query with local llm]:', locally);
    this.engine = engine;
    switch (engine) {
      case ESearchEngine.GOOGLE:
        this.search = searchWithGoogle;
        break;
      case ESearchEngine.BING:
        this.search = searchWithBing;
        break;
      case ESearchEngine.SOGOU:
        this.search = searchWithSogou;
        break;
      case ESearchEngine.SEARXNG:
        this.search = searchWithSearXNG;
        break;
      case ESearchEngine.CHATGLM:
        this.search = searchWithChatGLM;
        break;
      default:
        this.search = searchWithSearXNG;
    }
  }

  public async query(query: string, categories = [ESearXNGCategory.GENERAL], mode: TMode = 'simple', language = 'all', onMessage?: (...args: any[]) => void) {
    let searchQuery = query;
    // rewrite query for [SCIENCE]
    if (categories.includes(ESearXNGCategory.SCIENCE) && this.engine === ESearchEngine.SEARXNG) {
      const rewrite = await this.translate(query);
      if (rewrite) searchQuery = rewrite;
    }

    // Parameters supported by searxng: categories.
    const contexts = await this.search(searchQuery, categories, language);
    console.log(`[search [${categories}] results]`, contexts.length);
    console.log('[search mode]', mode);
    const REFERENCE_COUNT = process.env.REFERENCE_COUNT || 8;
    const limitContexts = contexts.slice(0, +REFERENCE_COUNT);
    if (!this.stream) {
      const relatedPromise = this.getRelatedQuestions(query, limitContexts);
      const answerPromise = this.getAiAnswer(query, contexts);
      const [related, answer] = await Promise.all([relatedPromise, answerPromise]);
      return {
        related,
        answer,
        contexts: limitContexts
      };
    }
    // searxng images search
    if (this.engine === ESearchEngine.SEARXNG) {
      const res = await this.search(query, [ESearXNGCategory.IMAGES], language);
      const engines = process.env.SEARXNG_IMAGES_ENGINES ? process.env.SEARXNG_IMAGES_ENGINES.split(',') : [];

      const images = res.filter(item => {
        if (!item.thumbnail) return false;
        if (engines.length > 0)
          return engines.some(engine => item.engine?.includes(engine));
        return item.engine?.includes('bing') || item.engine?.includes('google');
      });

      for (const image of images) {
        onMessage?.(JSON.stringify({ image }));
      }
    }

    for (const context of limitContexts) {
      onMessage?.(JSON.stringify({ context }));
    }
    await this.getAiAnswer(query, limitContexts, mode, (msg) => {
      onMessage?.(JSON.stringify({ answer: msg }));
    });
    await this.getRelatedQuestions(query, limitContexts, (msg) => {
      onMessage?.(JSON.stringify({ related: msg }));
    });
    onMessage?.(null, true);
  }

  // Gets related questions based on the query and context.
  private async getRelatedQuestions(query: string, contexts: any[], onMessage?: IStreamHandler) {
    try {
      const { messages } = this.paramsFormatter(query, undefined, contexts, 'related');
      const { model, stream } = this;
      if (!stream) {
        const res = await this.chat(messages, this.model);
        return res.split('\n');
      }
      await this.chat(messages, onMessage, model);
    } catch (err) {
      console.error('[LLM Error]:', err);
      return [];
    }
  }

  private async getAiAnswer(query: string, contexts: any[], mode: TMode = 'simple', onMessage?: IStreamHandler) {
    const { model, stream } = this;
    try {
      const { messages } = this.paramsFormatter(query, mode, contexts, 'answer');
      if (!stream) {
        const res = await this.chat(messages, this.model);
        return res;
      }
      await this.chat(messages, (msg: string, done: boolean) => {
        onMessage?.(msg, done);
      }, model);
    } catch (err: any) {
      console.error('[LLM Error]:', err);
      const msg = `[Oops~ Some errors seem to have occurred]: ${err?.message || 'Please check the console'}`;
      if (!stream) return msg;
      else onMessage?.(msg, true);
    }
  }

  // translate
  private async translate(text: string, targetLang = 'English'): Promise<string> {
    try {
      const content = util.format(TranslatePrompt, targetLang, text);
      const messages: IChatInputMessage[] = [
        {
          role: 'user',
          content
        }
      ];
      // console.log(content);
      let translated = '';
      if (!this.stream) {
        const res = await this.chat(messages, this.model);
        translated = res;
      } else {
        await this.chat(messages, (msg: string) => {
          if (msg) translated += msg;
        }, this.model);
      }
      return translated;
    } catch (err) {
      console.log('[RAG Translate error]', err);
      return text;
    }
  }

  private paramsFormatter(query: string, mode: TMode = 'simple', contexts: any[], type: 'answer' | 'related') {
    const context = contexts.map((item, index) => `[[citation:${index + 1}]] ${item.snippet}`).join('\n\n');
    let prompt = type === 'answer' ? RagQueryPrompt : MoreQuestionsPrompt;

    // deep answer
    if (mode === 'deep' && type === 'answer') {
      prompt = DeepQueryPrompt;
    }

    const system = util.format(prompt, context);
    const messages: IChatInputMessage[] = [
      {
        role: 'user',
        content: `${system} ${query}`
      }
    ];
    return {
      messages
    };
  }
}

function processModel(model: string) {
  const targetModel = Models.find(item => {
    return item.models.includes(model);
  });
  if (targetModel?.platform) {
    const target = platform[targetModel.platform];
    return target.chatStream.bind(target);
  }
}
