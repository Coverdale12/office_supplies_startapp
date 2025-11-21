-- Создание таблицы расходных материалов
CREATE TABLE IF NOT EXISTS supply_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    model TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER NOT NULL DEFAULT 5,
    unit TEXT NOT NULL,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы записей использования
CREATE TABLE IF NOT EXISTS usage_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supply_id INTEGER NOT NULL,
    quantity_used INTEGER NOT NULL,
    used_by TEXT NOT NULL,
    department TEXT NOT NULL,
    purpose TEXT,
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supply_id) REFERENCES supply_items (id)
);

-- Создание таблицы запросов на пополнение
CREATE TABLE IF NOT EXISTS supply_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supply_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    requested_by TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supply_id) REFERENCES supply_items (id)
);

-- Индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_supply_items_type ON supply_items(type);
CREATE INDEX IF NOT EXISTS idx_usage_records_supply_id ON usage_records(supply_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_used_at ON usage_records(used_at);
CREATE INDEX IF NOT EXISTS idx_supply_requests_status ON supply_requests(status);

-- Вставка тестовых данных
INSERT OR IGNORE INTO supply_items (name, type, model, quantity, min_quantity, unit, location) VALUES
('Картридж HP 85A', 'Картридж', 'HP LaserJet 85A', 10, 3, 'шт', 'Склад А'),
('Бумага А4', 'Бумага', 'SvetoCopy', 50, 10, 'пачка', 'Склад Б'),
('Тонер Canon 045', 'Тонер', 'Canon 045', 8, 2, 'шт', 'Склад А'),
('Картридж Epson 002', 'Картридж', 'Epson 002', 5, 2, 'шт', 'Склад В');