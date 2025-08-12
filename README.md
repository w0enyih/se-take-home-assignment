<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

# 🛠️ Order & Bot Dispatcher CLI

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
src/
  ├── bot/
  │     ├── bot.dto.ts
  │     ├── bot.module.ts
  │     └── bot.service.ts
  ├── cli/
  │     ├── cli.module.ts
  │     └── cli.service.ts
  ├── common/
  │     └── fileLogger.ts
  ├── dispatcher/
  │     ├── dispatcher.module.ts
  │     └── dispatcher.service.ts
  ├── order/
  │     ├── order.module.ts
  │     └── order.service.ts
  └── main.ts
```

---

## 🏁 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the CLI application

```bash
npm run start
```

You will see an interactive menu in your terminal.

---

## 🖥️ Usage

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
? What would you like to do? (Use arrow keys)
❯ New Normal Order
  New VIP Order
  + Bot
  - Bot
  Display
  Exit

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