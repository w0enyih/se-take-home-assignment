
# 🛠️ Order & Bot Dispatcher CLI
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE) ![TypeScript](https://img.shields.io/badge/language-TypeScript-3178c6)

A modular CLI application built with [NestJS](https://nestjs.com/) for managing orders and bots, featuring an automated dispatcher that assigns orders to bots in real time.

---

## 📄 Requirements

See [REQUIREMENT.md](./REQUIREMENT.md) for full assignment requirements and specifications.

---

## 🚀 Features

- **Order Management:**  
  - Add normal and VIP orders  
  - View pending and completed orders  
- **Bot Management:**  
  - Add or remove bots  
  - View bot status (idle/busy)  
- **Automated Dispatcher:**  
  - Assigns pending orders to available bots automatically  
- **Interactive CLI:**  
  - User-friendly menu for all operations  
- **Singleton Services:**  
  - Shared state across modules (OrderService, BotService, DispatcherService)  
- **Logging:**  
  - File-based logging for dispatcher and bots  
  - Console output for CLI actions  
- **Testing:**  
  - Jest-based unit tests for core logic  

---

## 🗂️ Project Structure

```
config/
  └── configuration.ts
src/
  ├── bot/
  │     ├── bot.dto.ts
  │     ├── bot.module.ts
  │     └── bot.service.ts
  ├── cli/
  │     ├── cli.module.ts
  │     └── cli.service.ts
  ├── common/
  │     └── queue.ts
  ├── dispatcher/
  │     ...
  ├── order/
  │     ...
  └── main.ts
.env
```

---

## 🏁 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Clone the `.env.example` and rename to `.env` file in the project root (if not present). Example:

```
# .env
BOT_PROCESSING_TIME_MS=10000
DISPATCHER_SLEEP_MS=1000
```

Adjust the values as needed for your environment.

### 3. Run the CLI application

```bash
npm run start
```

You will see an interactive menu in your terminal.

---

## 🖥️ Usage (interactive CLI)
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

---

## 🧩 Module & Singleton Design

All core services (`OrderService`, `BotService`, `DispatcherService`) are provided as singletons via their respective modules.

**Best Practice:**  
- **Do NOT provide these services directly in multiple modules.**  
- Instead, import their modules to ensure a single shared instance.

**Example:**

```typescript
// cli.module.ts
@Module({
  imports: [OrderModule, BotModule, DispatcherModule],
  providers: [CliService],
})
export class CliModule {}
```

---

## 🧪 Testing

Run all unit tests:

```bash
npm run test
```

---

## 📋 Logging

- **Dispatcher and Bot logs:** Written to files via `FileLogger`
- **CLI actions and status:** Printed to the console
- **View logs in real time:**

```bash
tail -f logs/app.log
```

---

## 📊 Example Output

```
--- MAIN MENU ---
✔ What would you like to do? Display
========================================


🟡 PENDING ORDERS:
┌─────────┬─────┬──────────┬──────────────────────────┐
│ (index) │ id  │ type     │ createdAt                │
├─────────┼─────┼──────────┼──────────────────────────┤
│ 0       │ 105 │ 'NORMAL' │ 2025-08-12T13:13:41.963Z │
└─────────┴─────┴──────────┴──────────────────────────┘

🟢 COMPLETED ORDERS:
┌─────────┬─────┬──────────┬───────┬──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ (index) │ id  │ type     │ botId │ createdAt                │ processStartAt           │ processEndAt             │
├─────────┼─────┼──────────┼───────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ 0       │ 101 │ 'VIP'    │ 1     │ 2025-08-12T13:12:44.277Z │ 2025-08-12T13:12:49.974Z │ 2025-08-12T13:12:59.976Z │
│ 1       │ 100 │ 'NORMAL' │ 2     │ 2025-08-12T13:12:42.866Z │ 2025-08-12T13:12:52.552Z │ 2025-08-12T13:13:02.552Z │
│ 2       │ 102 │ 'NORMAL' │ 1     │ 2025-08-12T13:12:58.401Z │ 2025-08-12T13:13:00.012Z │ 2025-08-12T13:13:10.014Z │
│ 3       │ 103 │ 'VIP'    │ 2     │ 2025-08-12T13:13:00.045Z │ 2025-08-12T13:13:03.013Z │ 2025-08-12T13:13:13.013Z │
└─────────┴─────┴──────────┴───────┴──────────────────────────┴──────────────────────────┴──────────────────────────┘

BOTS:
┌─────────┬────┬────────┬─────────┬───────────┬──────────────────────────┐
│ (index) │ id │ status │ orderId │ orderType │ orderProcessStartAt      │
├─────────┼────┼────────┼─────────┼───────────┼──────────────────────────┤
│ 0       │ 1  │ 'BUSY' │ 104     │ 'VIP'     │ 2025-08-12T13:13:34.841Z │
└─────────┴────┴────────┴─────────┴───────────┴──────────────────────────┘

```

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Devtools](https://devtools.nestjs.com)

---

##