/*
  # Создание отдельных таблиц для разных типов пользователей

  1. Новые таблицы
    - `clients` - физические лица (обычные клиенты)
      - `id` (uuid, primary key, ссылка на auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `address` (text)
      - `rating` (numeric)
      - `total_spent` (integer) - потрачено денег в копейках
      - `active_orders` (integer) - количество активных заказов
      - `completed_orders` (integer) - завершенных заказов
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `businesses` - юридические лица
      - `id` (uuid, primary key, ссылка на auth.users)
      - `company_name` (text) - название компании
      - `idno` (text) - код предприятия
      - `contact_person` (text) - контактное лицо
      - `legal_address` (text) - юридический адрес
      - `phone` (text)
      - `email` (text)
      - `rating` (numeric)
      - `total_spent` (integer) - потрачено денег в копейках
      - `active_contracts` (integer) - активные контракты
      - `completed_contracts` (integer) - завершенные контракты
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `professionals` - специалисты (переименованная и расширенная таблица pros)
      - `id` (uuid, primary key, ссылка на auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `categories` (text[]) - категории услуг
      - `service_radius_km` (integer)
      - `bio` (text) - описание
      - `hourly_rate` (integer) - почасовая ставка в копейках
      - `rating` (numeric)
      - `total_earned` (integer) - заработано денег в копейках
      - `active_jobs` (integer) - активные работы
      - `completed_jobs` (integer) - завершенные работы
      - `kyc_status` (text) - статус верификации
      - `is_available` (boolean) - доступен для работы
      - `response_time_minutes` (integer) - среднее время ответа
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Безопасность
    - Включить RLS для всех таблиц
    - Политики для чтения/записи собственных данных
    - Публичное чтение для professionals (для поиска)

  3. Индексы
    - По email для быстрого поиска
    - По категориям для professionals
    - По рейтингу для сортировки
*/

-- Таблица для физических лиц (клиентов)
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  address text,
  rating numeric(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_spent integer DEFAULT 0 CHECK (total_spent >= 0),
  active_orders integer DEFAULT 0 CHECK (active_orders >= 0),
  completed_orders integer DEFAULT 0 CHECK (completed_orders >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Таблица для юридических лиц (бизнес)
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  idno text NOT NULL UNIQUE,
  contact_person text NOT NULL,
  legal_address text NOT NULL,
  phone text,
  email text,
  rating numeric(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_spent integer DEFAULT 0 CHECK (total_spent >= 0),
  active_contracts integer DEFAULT 0 CHECK (active_contracts >= 0),
  completed_contracts integer DEFAULT 0 CHECK (completed_contracts >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Таблица для специалистов (расширенная версия pros)
CREATE TABLE IF NOT EXISTS professionals (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  categories text[] DEFAULT '{}',
  service_radius_km integer DEFAULT 20 CHECK (service_radius_km > 0),
  bio text,
  hourly_rate integer DEFAULT 0 CHECK (hourly_rate >= 0),
  rating numeric(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  total_earned integer DEFAULT 0 CHECK (total_earned >= 0),
  active_jobs integer DEFAULT 0 CHECK (active_jobs >= 0),
  completed_jobs integer DEFAULT 0 CHECK (completed_jobs >= 0),
  kyc_status text DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  is_available boolean DEFAULT true,
  response_time_minutes integer DEFAULT 60 CHECK (response_time_minutes > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Включаем RLS для всех таблиц
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Политики для clients
CREATE POLICY "Clients can read own data"
  ON clients
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Clients can insert own data"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Clients can update own data"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Политики для businesses
CREATE POLICY "Businesses can read own data"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Businesses can insert own data"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Businesses can update own data"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Политики для professionals
CREATE POLICY "Anyone can read professional profiles"
  ON professionals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Professionals can insert own data"
  ON professionals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Professionals can update own data"
  ON professionals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_clients_rating ON clients(rating DESC);
CREATE INDEX IF NOT EXISTS idx_clients_total_spent ON clients(total_spent DESC);

CREATE INDEX IF NOT EXISTS idx_businesses_idno ON businesses(idno);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating DESC);

CREATE INDEX IF NOT EXISTS idx_professionals_categories ON professionals USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_professionals_rating ON professionals(rating DESC);
CREATE INDEX IF NOT EXISTS idx_professionals_available ON professionals(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_professionals_kyc_status ON professionals(kyc_status);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at 
    BEFORE UPDATE ON businesses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at 
    BEFORE UPDATE ON professionals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();