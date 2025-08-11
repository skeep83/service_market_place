# ServiceHub API Documentation

## 🚀 Обзор API

ServiceHub использует **Supabase** как основную платформу для работы с данными, аутентификацией и real-time функциональностью. API построен на основе PostgreSQL с Row Level Security (RLS) и предоставляет RESTful интерфейс для всех операций.

### 🔗 Базовые URL
- **Production:** `https://your-project.supabase.co`
- **Development:** `https://your-dev-project.supabase.co`

### 🔐 Аутентификация
Все API запросы требуют JWT токен в заголовке:
```
Authorization: Bearer <jwt_token>
```

## 📊 Структура Ответов

### ✅ Успешный Ответ
```json
{
  "data": [...],
  "error": null,
  "count": 10,
  "status": 200,
  "statusText": "OK"
}
```

### ❌ Ошибка
```json
{
  "data": null,
  "error": {
    "message": "Описание ошибки",
    "details": "Дополнительная информация",
    "hint": "Подсказка для исправления",
    "code": "ERROR_CODE"
  },
  "status": 400,
  "statusText": "Bad Request"
}
```

## 🔐 Аутентификация

### 📝 Регистрация
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "data": {
    "full_name": "John Doe",
    "phone": "+373 XX XXX XXX",
    "role": "user",
    "account_type": "client"
  }
}
```

**Ответ:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "full_name": "John Doe",
      "phone": "+373 XX XXX XXX",
      "role": "user",
      "account_type": "client"
    },
    "created_at": "2025-01-15T10:00:00Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

### 🔑 Вход
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### 🚪 Выход
```http
POST /auth/v1/logout
Authorization: Bearer <jwt_token>
```

## 👥 Пользователи и Профили

### 👤 Получить Профиль Клиента
```http
GET /rest/v1/clients?id=eq.<user_id>
Authorization: Bearer <jwt_token>
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "phone": "+373 XX XXX XXX",
      "address": "Chisinau, Moldova",
      "rating": 4.8,
      "total_spent": 2500,
      "active_orders": 2,
      "completed_orders": 15,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### 🏢 Получить Профиль Бизнеса
```http
GET /rest/v1/businesses?id=eq.<user_id>
Authorization: Bearer <jwt_token>
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "uuid",
      "company_name": "Tech Solutions SRL",
      "idno": "1234567890123",
      "contact_person": "Jane Smith",
      "legal_address": "Chisinau, Stefan cel Mare 1",
      "phone": "+373 XX XXX XXX",
      "email": "contact@techsolutions.md",
      "rating": 4.9,
      "total_spent": 15000,
      "active_contracts": 3,
      "completed_contracts": 25,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### 🔧 Получить Профиль Специалиста
```http
GET /rest/v1/professionals?id=eq.<user_id>
Authorization: Bearer <jwt_token>
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "uuid",
      "full_name": "Mike Johnson",
      "phone": "+373 XX XXX XXX",
      "categories": ["plumbing", "electrical"],
      "service_radius_km": 25,
      "bio": "Experienced plumber with 8 years of experience...",
      "hourly_rate": 20000, // в копейках (200 лей)
      "rating": 4.9,
      "total_earned": 125000,
      "active_jobs": 3,
      "completed_jobs": 87,
      "kyc_status": "verified",
      "is_available": true,
      "response_time_minutes": 15,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### ✏️ Обновить Профиль
```http
PATCH /rest/v1/clients?id=eq.<user_id>
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "full_name": "John Updated Doe",
  "phone": "+373 XX XXX XXX",
  "address": "New Address"
}
```

## 🔧 Заказы (Jobs)

### 📋 Создать Заказ
```http
POST /rest/v1/jobs
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "category": "plumbing",
  "brief": "Fix leaking kitchen tap",
  "price_est_min": 20000, // 200 лей в копейках
  "price_est_max": 50000, // 500 лей в копейках
  "geo": "POINT(28.8575 47.0105)", // Координаты Кишинева
  "scheduled_at": "2025-01-16T10:00:00Z"
}
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "category": "plumbing",
      "brief": "Fix leaking kitchen tap",
      "price_est_min": 20000,
      "price_est_max": 50000,
      "status": "new",
      "pro_id": null,
      "scheduled_at": "2025-01-16T10:00:00Z",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### 📖 Получить Заказы Пользователя
```http
GET /rest/v1/jobs?user_id=eq.<user_id>&order=created_at.desc
Authorization: Bearer <jwt_token>
```

### 🔍 Получить Доступные Заказы (для специалистов)
```http
GET /rest/v1/jobs?status=eq.new&pro_id=is.null&category=eq.plumbing
Authorization: Bearer <jwt_token>
```

### ✅ Принять Заказ
```http
PATCH /rest/v1/jobs?id=eq.<job_id>
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "pro_id": "<professional_id>",
  "status": "accepted"
}
```

### 📊 Обновить Статус Заказа
```http
PATCH /rest/v1/jobs?id=eq.<job_id>
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "in_progress" // new, offered, accepted, in_progress, done, disputed, cancelled
}
```

## 🎯 Тендеры (Tenders)

### 📝 Создать Тендер
```http
POST /rest/v1/tenders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "category": "painting",
  "brief": "Paint house facade 120 sqm",
  "budget_hint": 500000, // 5000 лей в копейках
  "window_from": "2025-01-20T08:00:00Z",
  "window_to": "2025-01-25T18:00:00Z",
  "geo": "POINT(28.8575 47.0105)"
}
```

### 📋 Получить Доступные Тендеры
```http
GET /rest/v1/tenders?status=eq.open&order=created_at.desc
Authorization: Bearer <jwt_token>
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "category": "painting",
      "brief": "Paint house facade 120 sqm",
      "budget_hint": 500000,
      "window_from": "2025-01-20T08:00:00Z",
      "window_to": "2025-01-25T18:00:00Z",
      "status": "open",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

## 💰 Заявки на Тендеры (Bids)

### 📤 Подать Заявку
```http
POST /rest/v1/bids
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "tender_id": "uuid",
  "price": 450000, // 4500 лей в копейках
  "eta_slot": "this_week",
  "warranty_days": 365,
  "note": "I have 8 years of experience in house painting..."
}
```

### 📋 Получить Заявки на Тендер
```http
GET /rest/v1/bids?tender_id=eq.<tender_id>&order=price.asc
Authorization: Bearer <jwt_token>
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "uuid",
      "tender_id": "uuid",
      "pro_id": "uuid",
      "price": 450000,
      "eta_slot": "this_week",
      "warranty_days": 365,
      "note": "I have 8 years of experience...",
      "is_final": false,
      "score": null,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### 🏆 Выбрать Победителя Тендера
```http
PATCH /rest/v1/tenders?id=eq.<tender_id>
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "awarded"
}
```

## 💬 Чаты и Сообщения

### 📋 Получить Чаты Пользователя
```http
GET /rest/v1/chats?or=(client_id.eq.<user_id>,professional_id.eq.<user_id>)&status=eq.active&order=last_message_at.desc
Authorization: Bearer <jwt_token>
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "tender_id": null,
      "client_id": "uuid",
      "professional_id": "uuid",
      "status": "active",
      "last_message_at": "2025-01-15T14:30:00Z",
      "created_at": "2025-01-14T10:00:00Z",
      "updated_at": "2025-01-15T14:30:00Z"
    }
  ]
}
```

### 💬 Получить Сообщения Чата
```http
GET /rest/v1/chat_messages?chat_id=eq.<chat_id>&order=created_at.asc
Authorization: Bearer <jwt_token>
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "uuid",
      "chat_id": "uuid",
      "sender_id": "uuid",
      "message_type": "text",
      "content": "Hello! I'm ready to fix your tap tomorrow morning.",
      "file_url": null,
      "file_name": null,
      "is_read": true,
      "created_at": "2025-01-14T10:05:00Z"
    }
  ]
}
```

### 📤 Отправить Сообщение
```http
POST /rest/v1/chat_messages
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "chat_id": "uuid",
  "message_type": "text",
  "content": "Great! I'll be home from 9 AM to 12 PM."
}
```

### ✅ Отметить Сообщения как Прочитанные
```http
PATCH /rest/v1/chat_messages?chat_id=eq.<chat_id>&sender_id=neq.<current_user_id>&is_read=eq.false
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "is_read": true
}
```

## 💰 Кошелек и Финансы

### 💳 Получить Баланс Кошелька
```http
GET /rest/v1/wallets?pro_id=eq.<professional_id>
Authorization: Bearer <jwt_token>
```

**Ответ:**
```json
{
  "data": [
    {
      "pro_id": "uuid",
      "balance_cents": 245000, // 2450 лей в копейках
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### 📊 Получить Историю Транзакций
```http
GET /rest/v1/charges?pro_id=eq.<professional_id>&order=created_at.desc
Authorization: Bearer <jwt_token>
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "uuid",
      "subject": "job_payment",
      "subject_id": "uuid",
      "pro_id": "uuid",
      "amount_cents": 35000, // 350 лей
      "meta": {
        "job_title": "Fix kitchen tap",
        "client_name": "John Doe"
      },
      "created_at": "2025-01-10T15:00:00Z"
    }
  ]
}
```

## 🔔 Уведомления

### 📋 Получить Уведомления
```http
GET /rest/v1/notifications?user_id=eq.<user_id>&order=created_at.desc
Authorization: Bearer <jwt_token>
```

**Ответ:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "job_accepted",
      "title": "Job Accepted!",
      "message": "Professional Mike Johnson accepted your plumbing job",
      "read": false,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### ✅ Отметить Уведомление как Прочитанное
```http
PATCH /rest/v1/notifications?id=eq.<notification_id>
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "read": true
}
```

## 🔍 Поиск и Фильтрация

### 🔧 Поиск Специалистов
```http
GET /rest/v1/professionals?is_available=eq.true&kyc_status=eq.verified&categories=cs.{plumbing}&order=rating.desc
Authorization: Bearer <jwt_token>
```

### 📊 Поиск с Геолокацией
```http
POST /rest/v1/rpc/find_nearby_professionals
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "user_lat": 47.0105,
  "user_lng": 28.8575,
  "radius_km": 10,
  "category": "plumbing"
}
```

## 📊 Аналитика и Статистика

### 📈 Статистика Пользователя
```http
GET /rest/v1/rpc/get_user_stats
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "user_id": "uuid"
}
```

**Ответ:**
```json
{
  "data": {
    "total_jobs": 15,
    "completed_jobs": 13,
    "active_jobs": 2,
    "total_spent": 2500,
    "average_rating": 4.8,
    "favorite_categories": ["plumbing", "electrical"]
  }
}
```

### 📊 Статистика Специалиста
```http
GET /rest/v1/rpc/get_professional_stats
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "pro_id": "uuid"
}
```

**Ответ:**
```json
{
  "data": {
    "total_jobs": 87,
    "completed_jobs": 84,
    "active_jobs": 3,
    "total_earned": 125000,
    "average_rating": 4.9,
    "response_time_avg": 15,
    "completion_rate": 96.5
  }
}
```

## 🚀 Real-time Подписки

### 💬 Подписка на Новые Сообщения
```javascript
const subscription = supabase
  .channel('chat_messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `chat_id=eq.${chatId}`
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

### 🔔 Подписка на Уведомления
```javascript
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('New notification:', payload.new);
  })
  .subscribe();
```

### 🔧 Подписка на Обновления Заказов
```javascript
const subscription = supabase
  .channel('job_updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'jobs',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Job updated:', payload.new);
  })
  .subscribe();
```

## 🔒 Безопасность и Ограничения

### 🛡️ Row Level Security Политики

#### Клиенты
```sql
-- Клиенты могут читать только свои данные
CREATE POLICY "Clients can read own data"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Клиенты могут обновлять только свои данные
CREATE POLICY "Clients can update own data"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
```

#### Заказы
```sql
-- Пользователи могут создавать заказы
CREATE POLICY "Users can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Пользователи и специалисты могут читать связанные заказы
CREATE POLICY "Users can read own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = pro_id);
```

### ⚡ Rate Limiting
- **Аутентификация:** 5 попыток в минуту
- **API запросы:** 100 запросов в минуту на пользователя
- **Сообщения:** 30 сообщений в минуту
- **Загрузка файлов:** 10 файлов в минуту

### 🔐 Валидация Данных
```typescript
// Пример валидации на клиенте
interface JobValidation {
  category: string; // required, enum
  brief: string; // required, min 10 chars
  price_est_min: number; // required, > 0
  price_est_max: number; // required, >= price_est_min
}

function validateJob(job: Partial<JobValidation>): string[] {
  const errors: string[] = [];
  
  if (!job.category) errors.push('Category is required');
  if (!job.brief || job.brief.length < 10) errors.push('Brief must be at least 10 characters');
  if (!job.price_est_min || job.price_est_min <= 0) errors.push('Minimum price must be greater than 0');
  if (!job.price_est_max || job.price_est_max < job.price_est_min) errors.push('Maximum price must be greater than minimum');
  
  return errors;
}
```

## 📁 Загрузка Файлов

### 📤 Загрузка Изображений
```http
POST /storage/v1/object/job-photos/<file_name>
Authorization: Bearer <jwt_token>
Content-Type: image/jpeg

[binary data]
```

### 📋 Получить URL Файла
```http
GET /storage/v1/object/public/job-photos/<file_name>
```

### 🗑️ Удалить Файл
```http
DELETE /storage/v1/object/job-photos/<file_name>
Authorization: Bearer <jwt_token>
```

## 🔧 Edge Functions

### 📧 Отправка Email Уведомлений
```http
POST /functions/v1/send-notification
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "type": "job_accepted",
  "user_id": "uuid",
  "data": {
    "job_title": "Fix kitchen tap",
    "professional_name": "Mike Johnson"
  }
}
```

### 💳 Обработка Платежей
```http
POST /functions/v1/process-payment
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "job_id": "uuid",
  "amount_cents": 35000,
  "payment_method": "card",
  "card_token": "stripe_token"
}
```

## 🐛 Коды Ошибок

### 🔐 Аутентификация (401)
- `INVALID_CREDENTIALS` - Неверные учетные данные
- `TOKEN_EXPIRED` - Токен истек
- `INSUFFICIENT_PRIVILEGES` - Недостаточно прав

### 📊 Валидация (400)
- `VALIDATION_ERROR` - Ошибка валидации данных
- `MISSING_REQUIRED_FIELD` - Отсутствует обязательное поле
- `INVALID_FORMAT` - Неверный формат данных

### 🔍 Ресурсы (404)
- `RESOURCE_NOT_FOUND` - Ресурс не найден
- `USER_NOT_FOUND` - Пользователь не найден
- `JOB_NOT_FOUND` - Заказ не найден

### ⚡ Ограничения (429)
- `RATE_LIMIT_EXCEEDED` - Превышен лимит запросов
- `TOO_MANY_ATTEMPTS` - Слишком много попыток

### 🔧 Сервер (500)
- `INTERNAL_SERVER_ERROR` - Внутренняя ошибка сервера
- `DATABASE_ERROR` - Ошибка базы данных
- `SERVICE_UNAVAILABLE` - Сервис недоступен

## 📚 Примеры Использования

### 🔧 Создание Заказа (Полный Цикл)
```javascript
// 1. Создать заказ
const { data: job } = await supabase
  .from('jobs')
  .insert({
    category: 'plumbing',
    brief: 'Fix leaking kitchen tap',
    price_est_min: 20000,
    price_est_max: 50000
  })
  .select()
  .single();

// 2. Подписаться на обновления
const subscription = supabase
  .channel('job_updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'jobs',
    filter: `id=eq.${job.id}`
  }, (payload) => {
    if (payload.new.status === 'accepted') {
      console.log('Job accepted by professional!');
    }
  })
  .subscribe();

// 3. Получить уведомления
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .eq('read', false);
```

### 💬 Система Чатов
```javascript
// 1. Создать чат после принятия заказа
const { data: chat } = await supabase
  .from('chats')
  .insert({
    job_id: jobId,
    client_id: clientId,
    professional_id: professionalId
  })
  .select()
  .single();

// 2. Отправить сообщение
const { data: message } = await supabase
  .from('chat_messages')
  .insert({
    chat_id: chat.id,
    message_type: 'text',
    content: 'Hello! When can you start the work?'
  })
  .select()
  .single();

// 3. Подписаться на новые сообщения
const subscription = supabase
  .channel(`chat_${chat.id}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `chat_id=eq.${chat.id}`
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

---

## 📞 Поддержка API

### 🛠️ Техническая Поддержка
- **Email:** api-support@servicehub.md
- **Документация:** https://docs.servicehub.md
- **Status Page:** https://status.servicehub.md

### 📊 Мониторинг
- **Uptime:** 99.9% SLA
- **Response Time:** < 200ms average
- **Rate Limits:** Указаны для каждого endpoint

---

*API Документация обновлена: Январь 2025*
*Версия API: v1.0.0*
*Supabase Version: Latest*