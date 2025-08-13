# 🛠️ Order & Bot Dispatcher CLI
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE) ![TypeScript](https://img.shields.io/badge/language-TypeScript-3178c6)

A modular CLI application built with [NestJS](https://nestjs.com/) for managing restaurant orders and cooking bots, featuring an automated dispatcher that assigns orders to bots in real time.

## Requirements

See [REQUIREMENT.md](./REQUIREMENT.md) for full assignment requirements and specifications.

## Features
- Add/view normal and VIP orders  
- Add/remove bots and check their status  
- Automatic order dispatching to idle bots  
- Interactive CLI menu  
- Shared singleton services  
- File logging and console output  
- Jest unit tests included

## Project Structure

```
src/
  main.ts
  bot/
    bot.dto.ts
    bot.module.ts
    bot.service.ts
    bot.service.spec.ts
  cli/
    ...
  common/
    ...
  dispatcher/
    ...
  order/
    ...
```


## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and adjust as needed:

   ```
   BOT_PROCESSING_TIME_MS=10000
   ```

3. **Run the CLI application**

   ```bash
   npm run start
   ```


## CLI Usage

```
--- MAIN MENU ---
? What would you like to do? (Use arrow keys)
❯ Display
  New Normal Order
  New VIP Order
  + Bot
  - Bot
  Exit
```

- **Display:** View current pending/completed orders and bots (with status)
- **New Normal Order:** Add a normal order to the queue
- **New VIP Order:** Add a VIP order (higher priority)
- **+ Bot:** Add a new bot (idle, ready to process orders)
- **- Bot:** Remove the newest bot (requeues its order if busy)
- **Exit:** Quit the application

Orders are automatically dispatched to idle bots by the dispatcher service.


## Module & Singleton Design

All core services (`OrderService`, `BotService`, `DispatcherService`) are provided as singletons via their respective modules.
**Import modules, not services directly.**

**Example:**
```typescript
// cli.module.ts
@Module({
  imports: [OrderModule, BotModule, DispatcherModule],
  providers: [CliService],
})
export class CliModule {}
```

## Testing

Run all unit tests:

```bash
npm run test
```

Test files are located alongside their respective services, e.g.:
- `src/bot/bot.service.spec.ts`
- `src/order/order.service.spec.ts`
- `src/dispatcher/dispatcher.service.spec.ts`

## Logging

- **Dispatcher and Bot logs:** Written to files via `FileLogger` (`src/common/fileLogger.ts`)
- **CLI actions and status:** Printed to the console
- **View logs in real time:**

  ```bash
  tail -f logs/app.log
  ```

## Example Output

```
--- MAIN MENU ---
✔ What would you like to do? Display
========================================

🟡 PENDING ORDERS:
┌─────────┬─────┬──────────┬──────────────────────────┐
│ (index) │ id  │ type     │ createdAt                │
├─────────┼─────┼──────────┼──────────────────────────┤
│ 0       │ 102 │ 'NORMAL' │ 2025-08-12T13:13:41.963Z │
└─────────┴─────┴──────────┴──────────────────────────┘

🟢 COMPLETED ORDERS:
┌─────────┬─────┬──────────┬───────┬──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ (index) │ id  │ type     │ botId │ createdAt                │ processStartAt           │ processEndAt             │
├─────────┼─────┼──────────┼───────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ 0       │ 101 │ 'VIP'    │ 1     │ 2025-08-12T13:12:44.277Z │ 2025-08-12T13:12:49.974Z │ 2025-08-12T13:12:59.976Z │
│ 1       │ 100 │ 'NORMAL' │ 2     │ 2025-08-12T13:12:42.866Z │ 2025-08-12T13:12:52.552Z │ 2025-08-12T13:13:02.552Z │
└─────────┴─────┴──────────┴───────┴──────────────────────────┴──────────────────────────┴──────────────────────────┘

BOTS:
┌─────────┬────┬────────┬─────────┬───────────┬──────────────────────────┐
│ (index) │ id │ status │ orderId │ orderType │ orderProcessStartAt      │
├─────────┼────┼────────┼─────────┼───────────┼──────────────────────────┤
│ 0       │ 1  │ 'BUSY' │ 103     │ 'VIP'     │ 2025-08-12T13:13:34.841Z │
└─────────┴────┴────────┴─────────┴───────────┴──────────────────────────┘
```

## Resources
- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Devtools](https://devtools.nestjs.com)
