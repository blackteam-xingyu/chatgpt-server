// eslint-disable-next-line no-promise-executor-return
const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));
export default sleep;
