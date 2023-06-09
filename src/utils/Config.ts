import YAML from 'yaml';
import fs from 'fs';

class Config {
  constructor() {
    this.server = {
      port: 3000,
      channel: [],
    };

    this.log = {};
    try {
      const buffer = fs.readFileSync(`${process.cwd()}/conf.d/config.yaml`, 'utf-8');
      const config = YAML.parse(buffer);
      this.server = { ...this.server, ...config.server };
      this.steamship = { ...this.steamship, ...config.steamship };
      this.openai = { ...this.openai, ...config.openai };
      this.log = { ...this.log, ...config.log };
    } catch (err) {
      console.error(err);
    }
  }

  public steamship?: SteamShipConfig;
  public openai?: OpenAIConfig;
  public server: ServerConfig;
  public log: LogConfig;
  public isNodeEnvDevelopment = () => process.env.NODE_ENV === 'development';
  public isNodeEnvProduction = () => process.env.NODE_ENV === 'production';
}

declare interface ServerConfig {
  port: number;
  proxy?: ProxyConfig;
  timeout?: number;
  channel: string[];
}

declare interface ProxyConfig {
  host: string;
  port?: number;
}
declare interface SteamShipConfig {
  token: string;
  workspace: string;
  plugin: string;
  url: SteamShipUrlConfig;
}
declare interface SteamShipUrlConfig {
  file: string;
  block: string;
  generate: string;
  status: string;
}
declare interface OpenAIConfig {
  token: string;
  organization?: string;
  url: OpenAIUrlConfig;
  models: Models;
  default?: Partial<OpenAIDefaultConfig>;
}

interface Models {
  chat: string[];
  completions: string[];
  edits: string[];
  audio: AudioModel;
  finetunes: string[];
  embeddings: string[];
  moderations: string[];
}

interface AudioModel {
  transcriptions: string[];
  translations: string[];
}
declare interface LogConfig {
  path?: string;
}

interface OpenAIUrlConfig {
  model: string;
  chat: string;
  completions: string;
  edits: string;
  image: string;
  audio: AudioUrl;
  finetunes: string;
  embeddings: string;
  moderations: string;
}

interface AudioUrl {
  transcriptions: string;
  translations: string;
}
interface OpenAIDefaultConfig {
  completions: Partial<CompletionsDefaultConfig>;
  chat: Partial<ChatDefaultConfig>;
  edits: Partial<EditsDefaultConfig>;
  image: Partial<ImageDefaultConfig>;
}
interface ChatDefaultConfig {
  memory: number;
  max_token: number;
}
interface CompletionsDefaultConfig {
  count: number;
  max_token: number;
}
interface EditsDefaultConfig {
  count: number;
}
interface ImageDefaultConfig {
  size: '256x256' | '512x512' | '1024x1024';
  count: number;
  response_format: 'url' | 'b64_json';
}
export default new Config();
