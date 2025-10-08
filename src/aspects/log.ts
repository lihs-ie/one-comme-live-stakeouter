import { CommonError } from './error';

export interface Logger {
  info: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string, error: CommonError) => void;
}

export const Logger: Logger = {
  info: message => console.info(message),
  warning: message => console.warn(message),
  error: (message, error) =>
    console.error(`${message}. Context: ${error.context}. Type: ${error.type}.`),
};
