import { promises as fs, existsSync, mkdirSync } from 'fs';
import * as path from 'path';

export class FileLogger {
    private readonly logFilePath: string;
    private readonly defaultContext?: string;

    constructor(defaultContext?: string, logFileName: string = 'app.log') {
        const logDir = path.join(process.cwd(), 'logs');
        if (!existsSync(logDir)) {
            mkdirSync(logDir);
        }

        this.logFilePath = path.join(logDir, logFileName);
        this.defaultContext = defaultContext;
    }

    private async appendToFile(message: string): Promise<void> {
        await fs.appendFile(this.logFilePath, message + '\n', 'utf8');
    }

    private timestamp(): string {
        return new Date().toISOString();
    }

    private buildMessage(
        level: string,
        message: string,
        context?: string,
    ): string {
        const ctx = context || this.defaultContext;
        return `[${this.timestamp()}] [${level}] ${ctx ? `[${ctx}] ` : ''}${message}`;
    }

    async log(message: string, context?: string): Promise<void> {
        await this.appendToFile(this.buildMessage('LOG', message, context));
    }

    async error(
        message: string,
        context?: string,
        stack?: string,
    ): Promise<void> {
        let msg = this.buildMessage('ERROR', message, context);
        if (stack) msg += `\n${stack}`;
        await this.appendToFile(msg);
    }

    async warn(message: string, context?: string): Promise<void> {
        await this.appendToFile(this.buildMessage('WARN', message, context));
    }

    async debug(message: string, context?: string): Promise<void> {
        await this.appendToFile(this.buildMessage('DEBUG', message, context));
    }
}
