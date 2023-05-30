import axios from 'axios';
import tunnel from 'tunnel';
import Config from './Config';

const getAxiosConfig = () => {
  const config: Record<string, any> = {
    timeout: 2 * 60 * 1000,
  };
  if (Config.server.timeout) {
    config.timeout = (Config.server.timeout + 30) * 1000;
  }
  console.log(`响应总时长为——${config.timeout / 1000}s`);
  config.proxy = false;
  if (Config.server.proxy && Config.server.proxy.host) {
    const agent = tunnel.httpsOverHttp({
      proxy: {
        host: Config.server.proxy.host,
        port: Config.server.proxy.port || 80,
      },
    });

    config.httpsAgent = agent;
    console.log(`已使用代理——host:${Config.server.proxy.host}, port:${Config.server.proxy.port || 80}`);
  }
  return config;
};
const Axios = axios.create(getAxiosConfig());
export default Axios;
