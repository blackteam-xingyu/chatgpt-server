import YAML from 'yaml';
import fs from 'fs';
declare interface ServerConfig {
  port: number;
  proxy?: ProxyConfig;
  timeout?: number;
  url: UrlConfig;
}
declare interface UrlConfig {
  file: string;
  block: string;
  generate: string;
  status: string;
}
declare interface ProxyConfig {
  host: string;
  port?: number;
}
declare interface SteamShipConfig {
  token: string;
  workspace: string;
  plugin: string;
}
declare interface LogConfig {
  path: string;
}
class Config {
  constructor() {
    this.server = {
      port: 3000,
      url: {
        file: '',
        block: '',
        generate: '',
        status: '',
      },
    };
    this.steamship = {
      token: '',
      workspace: '',
      plugin: '',
    };
    this.log = {
      path: '~/.config/steamship/logs',
    };
    try {
      const buffer = fs.readFileSync(process.cwd() + '/conf.d/config.yaml', 'utf-8');
      let config = YAML.parse(buffer);
      this.server = { ...this.server, ...config['server'] };
      this.steamship = { ...this.steamship, ...config['steamship'] };
      this.log = { ...this.log, ...config['log'] };
    } catch (err) {
      console.error(err);
    }
  }
  public steamship: SteamShipConfig;
  public server: ServerConfig;
  public log: LogConfig;
  public isNodeEnvDevelopment = () => process.env.NODE_ENV === 'development';
  public isNodeEnvProduction = () => process.env.NODE_ENV === 'production';
}

export default new Config();
