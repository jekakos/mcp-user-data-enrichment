# MCP Server Architecture

## 🏗️ Архитектура после рефакторинга

```
┌─────────────────────────────────────────────────────────────────┐
│                    HTTP Client (MCP Inspector/Smithery)        │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP Requests
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                streamable-http-wrapper.js                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Express Server                                        │   │
│  │  - CORS Middleware                                     │   │
│  │  - JSON Parsing                                        │   │
│  │  - Route: /mcp → handleMCPRequest()                    │   │
│  │  - Route: /health → Health Check                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  handlers/mcp-handler.js                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Main Request Router                                   │   │
│  │  - Parse JSON-RPC requests                             │   │
│  │  - Route to specific handlers                          │   │
│  │  - Handle HTTP methods (GET, POST, DELETE)             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ handlers/   │ │ handlers/   │ │ handlers/   │
│ initialize.js│ │ tools.js    │ │ resources.js│
│             │ │             │ │             │
│ - initialize│ │ - tools/list│ │ - resources/│
│             │ │ - tools/call│ │   list      │
│             │ │             │ │ - resources/│
│             │ │             │ │   read      │
└─────────────┘ └─────────────┘ └─────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  handlers/notifications.js                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Notification Handlers                                 │   │
│  │  - notifications/initialized                           │   │
│  │  - ping                                               │   │
│  │  (No response needed - HTTP 200 only)                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    mcp-manager.js                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MCP Server Manager                                    │   │
│  │  - Spawn MCP process                                   │   │
│  │  - Send JSON-RPC requests                              │   │
│  │  - Handle responses                                    │   │
│  │  - Connection management                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │ stdio communication
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    mcp-server.js                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Core MCP Server                                       │   │
│  │  - Tools: enrich_user_data                             │   │
│  │  - Resources: users://list, users-bio://{userId}       │   │
│  │  - Dynamic paths support                               │   │
│  │  - JSON-RPC 2.0 protocol                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Поток данных:

1. **HTTP Request** → `streamable-http-wrapper.js`
2. **Route** → `handlers/mcp-handler.js`
3. **Method Detection** → Специализированный обработчик
4. **MCP Call** → `mcp-manager.js`
5. **Process Communication** → `mcp-server.js`
6. **Response** → Обратно через цепочку

## 📦 Модули:

### **Core Modules:**
- `streamable-http-wrapper.js` - HTTP сервер
- `mcp-manager.js` - Управление MCP процессом
- `mcp-server.js` - Основной MCP сервер

### **Handler Modules:**
- `handlers/mcp-handler.js` - Главный роутер
- `handlers/initialize.js` - Инициализация
- `handlers/tools.js` - Инструменты
- `handlers/resources.js` - Ресурсы
- `handlers/notifications.js` - Уведомления

## 🎯 Преимущества:

- **Separation of Concerns** - каждый модуль отвечает за свою область
- **Single Responsibility** - один модуль = одна функция
- **Easy Testing** - модули можно тестировать изолированно
- **Maintainability** - легко найти и исправить проблемы
- **Extensibility** - простое добавление новых функций
