# ServiceHub - Техническая Документация

## 🏗️ Архитектура Приложения

### 📁 Структура Проекта
```
service_market_place/
├── src/
│   ├── components/          # React компоненты
│   │   ├── AuthModal.tsx    # Модальное окно авторизации
│   │   ├── Dashboard.tsx    # Главная панель управления
│   │   ├── UserDashboard.tsx # Панель клиента
│   │   ├── ProDashboard.tsx # Панель специалиста
│   │   ├── AdminDashboard.tsx # Панель администратора
│   │   ├── Header.tsx       # Шапка сайта
│   │   ├── ChatModal.tsx    # Система чатов
│   │   ├── BidModal.tsx     # Модальное окно для ставок
│   │   ├── PhotoModal.tsx   # Просмотр фотографий
│   │   └── ...
│   ├── hooks/               # React хуки
│   │   ├── useAuth.ts       # Хук авторизации
│   │   └── useTranslation.ts # Хук переводов
│   ├── lib/                 # Утилиты и библиотеки
│   │   ├── supabase.ts      # Конфигурация Supabase
│   │   ├── database.ts      # Операции с БД
│   │   └── gravatar.tsx     # Генерация аватаров
│   ├── i18n/                # Интернационализация
│   │   └── translations.ts  # Переводы
│   ├── types/               # TypeScript типы
│   │   └── database.ts      # Типы БД
│   └── styles/              # Стили
│       └── index.css        # Главный CSS файл
├── supabase/
│   └── migrations/          # Миграции БД
└── public/                  # Статические файлы
```

## 🗄️ База Данных

### 📊 Схема Базы Данных

#### Пользователи и Профили
```sql
-- Базовая таблица пользователей (Supabase Auth)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Клиенты (физические лица)
CREATE TABLE clients (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  rating NUMERIC(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_spent INTEGER DEFAULT 0 CHECK (total_spent >= 0),
  active_orders INTEGER DEFAULT 0 CHECK (active_orders >= 0),
  completed_orders INTEGER DEFAULT 0 CHECK (completed_orders >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Бизнес-клиенты (юридические лица)
CREATE TABLE businesses (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  idno TEXT UNIQUE NOT NULL, -- код предприятия
  contact_person TEXT NOT NULL,
  legal_address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  rating NUMERIC(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_spent INTEGER DEFAULT 0 CHECK (total_spent >= 0),
  active_contracts INTEGER DEFAULT 0 CHECK (active_contracts >= 0),
  completed_contracts INTEGER DEFAULT 0 CHECK (completed_contracts >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Специалисты
CREATE TABLE professionals (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  categories TEXT[] DEFAULT '{}',
  service_radius_km INTEGER DEFAULT 20 CHECK (service_radius_km > 0),
  bio TEXT,
  hourly_rate INTEGER DEFAULT 0 CHECK (hourly_rate >= 0), -- в копейках
  rating NUMERIC(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_earned INTEGER DEFAULT 0 CHECK (total_earned >= 0),
  active_jobs INTEGER DEFAULT 0 CHECK (active_jobs >= 0),
  completed_jobs INTEGER DEFAULT 0 CHECK (completed_jobs >= 0),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  is_available BOOLEAN DEFAULT TRUE,
  response_time_minutes INTEGER DEFAULT 60 CHECK (response_time_minutes > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Заказы и Тендеры
```sql
-- Прямые заказы
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  geo GEOGRAPHY(POINT, 4326), -- PostGIS для геолокации
  brief TEXT,
  price_est_min INTEGER CHECK (price_est_min > 0),
  price_est_max INTEGER CHECK (price_est_max >= price_est_min),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'offered', 'accepted', 'in_progress', 'done', 'disputed', 'cancelled')),
  pro_id UUID REFERENCES auth.users(id),
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Тендеры/Аукционы
CREATE TABLE tenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  geo GEOGRAPHY(POINT, 4326),
  brief TEXT,
  window_from TIMESTAMPTZ,
  window_to TIMESTAMPTZ,
  budget_hint INTEGER CHECK (budget_hint > 0),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'bafo', 'awarded', 'cancelled', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Заявки на тендеры
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  pro_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price INTEGER NOT NULL CHECK (price > 0),
  eta_slot TEXT,
  warranty_days INTEGER DEFAULT 0 CHECK (warranty_days >= 0),
  note TEXT,
  is_final BOOLEAN DEFAULT FALSE,
  score NUMERIC(3,2) CHECK (score >= 0 AND score <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tender_id, pro_id)
);
```

#### Коммуникации
```sql
-- Чаты
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  tender_id UUID REFERENCES tenders(id),
  client_id UUID NOT NULL REFERENCES auth.users(id),
  professional_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Сообщения в чатах
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Финансы
```sql
-- Кошельки специалистов
CREATE TABLE wallets (
  pro_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_cents INTEGER DEFAULT 0 CHECK (balance_cents >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Транзакции и списания
CREATE TABLE charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL, -- тип операции
  subject_id UUID, -- ID связанного объекта
  pro_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 🔒 Row Level Security (RLS)

#### Политики Безопасности
```sql
-- Клиенты могут читать только свои данные
CREATE POLICY "Clients can read own data"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Специалисты могут читать свои данные
CREATE POLICY "Professionals can read own data"
  ON professionals FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Любой может читать профили специалистов (для поиска)
CREATE POLICY "Anyone can read professional profiles"
  ON professionals FOR SELECT
  TO authenticated
  USING (true);

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

## 🔧 API и Сервисы

### 📡 Database Services

#### Client Service
```typescript
export const clientService = {
  async getClient(userId: string): Promise<Client | null>,
  async createClient(clientData: Omit<Client, 'created_at' | 'updated_at'>): Promise<boolean>,
  async updateClient(userId: string, updates: Partial<Client>): Promise<boolean>
};
```

#### Professional Service
```typescript
export const professionalService = {
  async getProfessional(userId: string): Promise<Professional | null>,
  async createProfessional(professionalData: Omit<Professional, 'created_at' | 'updated_at'>): Promise<boolean>,
  async updateProfessional(userId: string, updates: Partial<Professional>): Promise<boolean>,
  async getAvailableProfessionals(category?: string): Promise<Professional[]>
};
```

#### Job Service
```typescript
export const jobService = {
  async createJob(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<string | null>,
  async getJobsByUser(userId: string): Promise<Job[]>,
  async getJobsByPro(proId: string): Promise<Job[]>,
  async getAvailableJobs(category?: string): Promise<Job[]>,
  async acceptJob(jobId: string, proId: string): Promise<boolean>
};
```

#### Chat Service
```typescript
export const chatService = {
  async getChatsByUser(userId: string): Promise<Chat[]>,
  async getMessagesByChat(chatId: string): Promise<ChatMessage[]>,
  async sendMessage(messageData: Omit<ChatMessage, 'id' | 'created_at'>): Promise<string | null>,
  async markMessagesAsRead(chatId: string, userId: string): Promise<boolean>
};
```

## 🎨 Компоненты и UI

### 🧩 Основные Компоненты

#### AuthModal
```typescript
interface AuthModalProps {
  onClose: () => void;
  onLogin: () => void;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ data: any; error: any }>;
}
```

**Функции:**
- Регистрация и вход пользователей
- Поддержка 3 типов аккаунтов (клиент/бизнес/специалист)
- Валидация форм
- Обработка ошибок

#### Dashboard
```typescript
interface DashboardProps {
  user: Profile;
}
```

**Функции:**
- Роутинг между типами дашбордов
- Определение роли пользователя
- Передача данных в соответствующий компонент

#### UserDashboard
**Функции:**
- Создание заявок на работы
- Создание тендеров
- Просмотр активных заказов
- Чат с исполнителями
- Управление профилем

#### ProDashboard
**Функции:**
- Просмотр доступных работ
- Участие в тендерах
- Управление активными заказами
- Кошелек и финансы
- Профессиональный профиль

#### ChatModal
**Функции:**
- Список всех чатов пользователя
- Отправка и получение сообщений
- Отметка сообщений как прочитанных
- Поддержка файлов и изображений

### 🎨 Дизайн-Система

#### CSS Классы и Эффекты
```css
/* Glassmorphism эффекты */
.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* Acrylic эффекты */
.acrylic {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
}

/* Органичные формы */
.blob-shape {
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  animation: blob-morph 8s ease-in-out infinite;
}

/* Современные кнопки */
.btn-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}
```

#### Адаптивная Типографика
```css
/* Fluid типографика */
.text-fluid-xl {
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.1;
  font-weight: 800;
}

.text-fluid-lg {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  line-height: 1.2;
  font-weight: 700;
}

/* Улучшенное отображение кириллицы */
*[lang="ru"], *:lang(ru) {
  font-family: 'Roboto', 'Open Sans', 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

## 🌍 Интернационализация

### 🗣️ Система Переводов

#### Структура Переводов
```typescript
interface Translation {
  hero: {
    title: string;
    subtitle: string;
    findServices: string;
    becomePro: string;
  };
  auth: {
    signin: string;
    createAccount: string;
    client: string;
    professional: string;
  };
  dashboard: {
    welcomeBack: string;
    manageRequests: string;
  };
  // ... остальные разделы
}
```

#### Хук useTranslation
```typescript
export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'ro';
  });

  const switchLanguage = useCallback((lang: Language) => {
    setGlobalLanguage(lang);
  }, []);

  const t = translations[language];

  return { t, language, switchLanguage };
}
```

## 🔐 Аутентификация и Авторизация

### 🔑 Система Аутентификации

#### Auth Service
```typescript
export const authService = {
  async signUp(email: string, password: string, userData?: any) {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    });
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getSession() {
    return await supabase.auth.getSession();
  }
};
```

#### Хук useAuth
```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получение текущей сессии
    authService.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        createMockProfile(session.user);
      }
    });

    // Подписка на изменения аутентификации
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await createMockProfile(session.user);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading, signUp, signIn, signOut };
}
```

## 📱 Адаптивность и Мобильная Версия

### 📲 Responsive Design

#### Breakpoints
```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Мобильные устройства (альбомная) */
md: 768px   /* Планшеты */
lg: 1024px  /* Ноутбуки */
xl: 1280px  /* Десктопы */
2xl: 1536px /* Большие экраны */
```

#### Адаптивные Компоненты
```typescript
// Пример адаптивной сетки
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="bg-white rounded-xl p-6">
      {/* Контент */}
    </div>
  ))}
</div>

// Адаптивная типографика
<h1 className="text-3xl md:text-5xl lg:text-6xl font-bold">
  Заголовок
</h1>
```

### 🔔 Push-уведомления (Планируется)
```typescript
// Будущая реализация
interface NotificationService {
  requestPermission(): Promise<boolean>;
  sendNotification(title: string, body: string, data?: any): void;
  subscribeToTopic(topic: string): Promise<void>;
}
```

## 🚀 Производительность и Оптимизация

### ⚡ Оптимизации

#### Lazy Loading
```typescript
// Ленивая загрузка компонентов
const UserDashboard = lazy(() => import('./components/UserDashboard'));
const ProDashboard = lazy(() => import('./components/ProDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// Использование с Suspense
<Suspense fallback={<LoadingSpinner />}>
  <UserDashboard user={user} />
</Suspense>
```

#### Мемоизация
```typescript
// Мемоизация дорогих вычислений
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Мемоизация колбэков
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

#### Оптимизация Изображений
```typescript
// Компонент для оптимизированных изображений
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  loading = 'lazy' 
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className="object-cover rounded-lg"
      onError={(e) => {
        e.currentTarget.src = '/placeholder-image.jpg';
      }}
    />
  );
}
```

## 🧪 Тестирование

### 🔬 Стратегия Тестирования

#### Unit Tests
```typescript
// Пример теста для утилитарной функции
import { formatCurrency } from '../utils/currency';

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1000)).toBe('1,000 лей');
    expect(formatCurrency(0)).toBe('0 лей');
    expect(formatCurrency(1500.50)).toBe('1,500.50 лей');
  });
});
```

#### Integration Tests
```typescript
// Пример теста для компонента
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthModal } from '../components/AuthModal';

describe('AuthModal', () => {
  it('should switch between login and signup', () => {
    render(<AuthModal onClose={() => {}} onLogin={() => {}} />);
    
    const signupButton = screen.getByText('Создать аккаунт');
    fireEvent.click(signupButton);
    
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
  });
});
```

#### E2E Tests (Планируется)
```typescript
// Cypress тесты
describe('User Journey', () => {
  it('should allow user to create a job request', () => {
    cy.visit('/');
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="email-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('password');
    cy.get('[data-testid="submit-button"]').click();
    
    cy.get('[data-testid="create-job-button"]').click();
    cy.get('[data-testid="job-title"]').type('Починить кран');
    cy.get('[data-testid="job-description"]').type('Протекает кран на кухне');
    cy.get('[data-testid="submit-job"]').click();
    
    cy.contains('Заявка создана успешно').should('be.visible');
  });
});
```

## 🔧 Инструменты Разработки

### 🛠️ Development Tools

#### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

#### ESLint Configuration
```javascript
// eslint.config.js
export default [
  {
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended'
    ],
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'prefer-const': 'error',
    },
  }
];
```

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
```

## 📊 Мониторинг и Аналитика

### 📈 Метрики и KPI

#### Бизнес-Метрики
```typescript
interface BusinessMetrics {
  // Финансовые показатели
  gmv: number; // Gross Merchandise Value
  revenue: number; // Доход платформы
  takeRate: number; // Процент комиссии
  
  // Пользовательские метрики
  activeUsers: number;
  newRegistrations: number;
  userRetention: number;
  
  // Операционные метрики
  jobsCompleted: number;
  averageJobValue: number;
  disputeRate: number;
  
  // Качество сервиса
  averageRating: number;
  responseTime: number;
  completionRate: number;
}
```

#### Техническая Аналитика
```typescript
// Отслеживание производительности
interface PerformanceMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  cumulativeLayoutShift: number;
  errorRate: number;
  apiResponseTime: number;
}

// Пример сбора метрик
function trackPerformance() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;
        analytics.track('page_load_time', {
          duration: navEntry.loadEventEnd - navEntry.loadEventStart,
          page: window.location.pathname
        });
      }
    }
  });
  
  observer.observe({ entryTypes: ['navigation'] });
}
```

## 🚀 Развертывание

### 🏗️ CI/CD Pipeline

#### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
    
    - name: Deploy to Vercel
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

#### Environment Variables
```bash
# Production Environment
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_ENV=production
VITE_SENTRY_DSN=your-sentry-dsn

# Development Environment
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
VITE_APP_ENV=development
```

### 🔍 Мониторинг Production

#### Error Tracking
```typescript
// Sentry интеграция
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});

// Обертка для отслеживания ошибок
export const withErrorBoundary = Sentry.withErrorBoundary;
```

#### Health Checks
```typescript
// API для проверки состояния системы
export async function healthCheck(): Promise<HealthStatus> {
  try {
    const dbStatus = await checkDatabaseConnection();
    const authStatus = await checkAuthService();
    const storageStatus = await checkStorageService();
    
    return {
      status: 'healthy',
      services: {
        database: dbStatus,
        auth: authStatus,
        storage: storageStatus
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

---

## 📞 Поддержка и Разработка

### 🛠️ Команда Разработки
- **Tech Lead:** Архитектура и техническое руководство
- **Frontend Developer:** React/TypeScript разработка
- **Backend Developer:** Supabase/PostgreSQL
- **UI/UX Designer:** Дизайн интерфейсов
- **QA Engineer:** Тестирование и качество

### 📧 Контакты
- **Техническая поддержка:** tech@servicehub.md
- **Баг-репорты:** GitHub Issues
- **Предложения:** feature-requests@servicehub.md

---

*Техническая документация обновлена: Январь 2025*
*Версия API: 1.0.0*