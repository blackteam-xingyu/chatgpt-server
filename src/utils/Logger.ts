import path from 'path';
import log4js from 'log4js';
import Config from './Config';
const baseFilePath = path.resolve(Config.log.path || 'logs');
const baseAppenderConfig: log4js.Appender = {
  type: 'dateFile',
  pattern: 'yyyy-MM-dd.log',
  alwaysIncludePattern: true,
  encoding: 'utf-8',
  numBackups: 3,
};

const getCategoryAppenders = (rawAppenders: Array<string>): Array<string> => {
  if (Config.isNodeEnvDevelopment()) {
    return [...rawAppenders, 'console'];
  }
  return rawAppenders;
};

log4js.configure({
  appenders: {
    console: { type: 'console' },
    tracerFile: {
      ...baseAppenderConfig,
      filename: `${baseFilePath}/tracer/log`,
    },
    defaultFile: {
      ...baseAppenderConfig,
      filename: `${baseFilePath}/default/log`,
    },
    errorFile: {
      ...baseAppenderConfig,
      filename: `${baseFilePath}/error/log`,
    },
  },
  categories: {
    tracer: { appenders: getCategoryAppenders(['tracerFile']), level: 'mark' },
    default: { appenders: getCategoryAppenders(['defaultFile']), level: 'info' },
    error: { appenders: getCategoryAppenders(['errorFile']), level: 'error' },
  },
});

const tracerLogger = log4js.getLogger('tracer');
const defaultLogger = log4js.getLogger('default');
const errorLogger = log4js.getLogger('error');

// 因为部分中间件在使用日志方法时，会访问提供该方法的类的其他实例方法（比如 instance.isLevelEnabled），
// 故以下静态方法都需要 bind 对应的 logger 实例。
export default class Logger {
  static mark = tracerLogger.mark.bind(tracerLogger);
  static trace = tracerLogger.trace.bind(tracerLogger);
  static debug = tracerLogger.debug.bind(tracerLogger);
  static log = tracerLogger.info.bind(defaultLogger);
  static info = defaultLogger.info.bind(defaultLogger);
  static warn = defaultLogger.warn.bind(defaultLogger);
  static error = errorLogger.error.bind(errorLogger);
  static fatal = errorLogger.fatal.bind(errorLogger);
}
