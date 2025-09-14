export interface Logger {
  info: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string) => void;
}

export const Logger: Logger = {
  info: message => console.info(`[INFO]${message}`),
  warning: message => console.warn(`[WARNING]${message}`),
  error: message => console.error(`[ERROR]${message}`),
};
