import { CODE_STATUS } from './Enum';

export default class Model<T> {
  constructor(code: CODE_STATUS, data?: T, message?: string) {
    this.code = code;
    this.data = data || null;
    this.message = message || '';
  }

  code: CODE_STATUS;
  data: T | null;
  message: string;
  public getRecord = (code?: CODE_STATUS, data?: T, message?: string) => {
    if (data) this.data = data;
    if (code) this.code = code;
    if (message) this.message = message;
    return {
      code: this.code,
      data: this.data,
      message: this.message,
    };
  };

  public getSuccessRecord = (data?: T, message?: string) => {
    if (data) this.data = data;
    if (message) this.message = message;
    this.code = CODE_STATUS.SUCCESS;
    return {
      code: this.code,
      data: this.data,
      message: this.message,
    };
  };

  public getErrorRecord = (data?: T, message?: string) => {
    if (data) this.data = data;
    if (message) this.message = message;
    this.code = CODE_STATUS.ERROR;
    return {
      code: this.code,
      data: this.data,
      message: this.message,
    };
  };

  public getOverTimeRecord = (data?: T) => {
    if (data) this.data = data;
    this.code = CODE_STATUS.OVERTIME;
    return {
      code: this.code,
      data: this.data,
      message: this.message,
    };
  };

  public setCode = (code: CODE_STATUS) => {
    this.code = code;
  };

  public setData = (data: T) => {
    this.data = data;
  };

  public setMessage = (message: string) => {
    this.message = message;
  };
}
