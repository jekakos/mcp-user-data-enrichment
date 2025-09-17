# MCP Ping Implementation Guide

## Правильная реализация ping для MCP Inspector

### ❌ Неправильно (Request-Response)
```javascript
// НЕПРАВИЛЬНО - ping как request
if (method === 'ping') {
  const response = {
    jsonrpc: '2.0',
    id: req.body.id,
    result: { pong: true }
  };
  res.json(response);
}
```

### ✅ Правильно (Notification)
```javascript
// ПРАВИЛЬНО - ping как notification
if (method === 'ping') {
  console.log('Handling ping notification');
  // Ping is a notification, no response needed
  res.status(200).end();
}
```

## Ключевые принципы

### 1. **Ping - это Notification**
- `id: null` в JSON-RPC запросе
- **НЕ возвращает ответ** (только HTTP 200)
- Используется для проверки связи

### 2. **Другие Notifications**
- `notifications/initialized` - тоже notification
- `notifications/cancelled` - тоже notification
- Все notifications имеют `id: null`

### 3. **Requests vs Notifications**

**Requests (имеют ответ):**
```javascript
{
  "jsonrpc": "2.0",
  "id": 1,                    // ← ID обязателен
  "method": "tools/list"
}
// ↓ Возвращает result или error
```

**Notifications (без ответа):**
```javascript
{
  "jsonrpc": "2.0",
  "id": null,                 // ← ID = null
  "method": "ping"
}
// ↓ Возвращает только HTTP 200
```

## Тестирование

### Правильный тест ping:
```javascript
const pingResponse = await fetch(`${BASE_URL}/mcp`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: null,        // ← null для notifications
    method: 'ping'
  })
});

console.log('Status:', pingResponse.status);  // 200
console.log('Text:', await pingResponse.text()); // пустая строка
```

## MCP Inspector ожидает:
1. **HTTP 200** статус
2. **Пустое тело ответа** (не JSON)
3. **Быстрый ответ** (для проверки связи)

## Реализация в нашем сервере:
```javascript
} else if (method === 'ping') {
  // Handle ping notification from MCP Inspector
  console.log('Handling ping notification');
  // Ping is a notification, no response needed
  res.status(200).end();
}
```

Это обеспечивает совместимость с MCP Inspector и другими MCP клиентами.
