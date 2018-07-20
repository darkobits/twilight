// @ts-ignore
import LogFactory from '@darkobits/log';

const logLevel = process.env.NODE_ENV === 'test' ? 'silent' : process.env.LOG_LEVEL;

export default LogFactory('twilight', logLevel);
