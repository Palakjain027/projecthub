type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const colors = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  reset: '\x1b[0m',
};

function formatLog(log: LogMessage): string {
  const { level, message, timestamp, context } = log;
  const color = colors[level];
  const levelStr = `[${level.toUpperCase()}]`.padEnd(7);
  
  let output = `${color}${levelStr}${colors.reset} ${timestamp} - ${message}`;
  
  if (context && Object.keys(context).length > 0) {
    output += `\n${JSON.stringify(context, null, 2)}`;
  }
  
  return output;
}

function createLog(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const log: LogMessage = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  const formatted = formatLog(log);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      createLog('debug', message, context);
    }
  },
  
  info: (message: string, context?: Record<string, unknown>) => {
    createLog('info', message, context);
  },
  
  warn: (message: string, context?: Record<string, unknown>) => {
    createLog('warn', message, context);
  },
  
  error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        errorName: error.name,
        errorMessage: error.message,
        stack: error.stack,
      }),
    };
    createLog('error', message, errorContext);
  },
};
