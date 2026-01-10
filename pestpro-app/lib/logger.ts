/**
 * Structured logging utility
 * Provides consistent logging across the application with different log levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogContext {
  [key: string]: any;
}

class Logger {
  private level: LogLevel;

  constructor() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() || "INFO";
    this.level = LogLevel[envLevel as keyof typeof LogLevel] || LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatLog(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logObject = {
      timestamp,
      level,
      message,
      ...(context || {})
    };

    if (process.env.NODE_ENV === "production") {
      // JSON format for production (better for log aggregation)
      return JSON.stringify(logObject);
    } else {
      // Human-readable format for development
      const contextStr = context ? ` ${JSON.stringify(context)}` : "";
      return `[${timestamp}] ${level}: ${message}${contextStr}`;
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatLog("DEBUG", message, context));
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatLog("INFO", message, context));
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatLog("WARN", message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = {
        ...(context || {}),
        ...(error instanceof Error
          ? {
              error: error.message,
              stack: error.stack,
              name: error.name
            }
          : { error: String(error) })
      };
      console.error(this.formatLog("ERROR", message, errorContext));
    }
  }

  /**
   * Log API request
   */
  logRequest(req: Request, context?: LogContext) {
    this.info("API Request", {
      method: req.method,
      url: req.url,
      userAgent: req.headers.get("user-agent"),
      ...context
    });
  }

  /**
   * Log API response
   */
  logResponse(req: Request, status: number, duration: number, context?: LogContext) {
    this.info("API Response", {
      method: req.method,
      url: req.url,
      status,
      duration: `${duration}ms`,
      ...context
    });
  }

  /**
   * Log event tracking
   */
  logEvent(eventName: string, eventId: string, context?: LogContext) {
    this.info("Event Tracked", {
      event: eventName,
      eventId,
      ...context
    });
  }

  /**
   * Log conversion
   */
  logConversion(status: string, conversionId: string, context?: LogContext) {
    this.info("Conversion Recorded", {
      status,
      conversionId,
      ...context
    });
  }

  /**
   * Log destination forwarding
   */
  logForwarding(destination: string, success: boolean, context?: LogContext) {
    if (success) {
      this.info("Event Forwarded", {
        destination,
        ...context
      });
    } else {
      this.error("Event Forwarding Failed", undefined, {
        destination,
        ...context
      });
    }
  }
}

export const logger = new Logger();

/**
 * Create request context for logging
 */
export function createRequestContext(req: Request): LogContext {
  return {
    method: req.method,
    url: req.url,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown",
    userAgent: req.headers.get("user-agent")
  };
}

/**
 * Middleware to log requests and responses
 */
export async function withLogging<T>(
  req: Request,
  handler: () => Promise<Response>
): Promise<Response> {
  const startTime = Date.now();
  const context = createRequestContext(req);

  logger.logRequest(req, context);

  try {
    const response = await handler();
    const duration = Date.now() - startTime;

    logger.logResponse(req, response.status, duration, {
      ...context,
      success: response.ok
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error("Request handler failed", error, {
      ...context,
      duration: `${duration}ms`
    });

    throw error;
  }
}
