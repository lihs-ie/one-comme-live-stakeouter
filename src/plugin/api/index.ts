import { ChannelHandlers } from './channel';
import { Executor } from './common';

export const APIExecutor: Executor = Executor(...ChannelHandlers);
