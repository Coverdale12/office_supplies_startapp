package main

import (
	"database/sql"
	"log"
	"office_supplies/handlers"
	"office_supplies/middleware"
	"os"

	"github.com/gin-gonic/gin"
	_ "modernc.org/sqlite" // Pure-Go SQLite драйвер
)

func initDB() *sql.DB {
	// Создаем директорию если не существует
	os.MkdirAll("database", 0755)

	// Используем modernc.org/sqlite (имя драйвера "sqlite")
	db, err := sql.Open("sqlite", "./database/office_supplies.db")
	if err != nil {
		log.Fatal("Error opening database:", err)
	}

	// Проверяем соединение
	if err := db.Ping(); err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	// Инициализируем базу данных
	initSQL := `
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

        CREATE INDEX IF NOT EXISTS idx_supply_items_type ON supply_items(type);
        CREATE INDEX IF NOT EXISTS idx_usage_records_supply_id ON usage_records(supply_id);
        CREATE INDEX IF NOT EXISTS idx_usage_records_used_at ON usage_records(used_at);
        CREATE INDEX IF NOT EXISTS idx_supply_requests_status ON supply_requests(status);

        INSERT OR IGNORE INTO supply_items (name, type, model, quantity, min_quantity, unit, location) VALUES
        ('Картридж HP 85A', 'Картридж', 'HP LaserJet 85A', 10, 3, 'шт', 'Склад А'),
        ('Бумага А4', 'Бумага', 'SvetoCopy', 50, 10, 'пачка', 'Склад Б'),
        ('Тонер Canon 045', 'Тонер', 'Canon 045', 8, 2, 'шт', 'Склад А'),
        ('Картридж Epson 002', 'Картридж', 'Epson 002', 5, 2, 'шт', 'Склад В');
    `

	_, err = db.Exec(initSQL)
	if err != nil {
		log.Printf("Warning: Could not execute init SQL: %v", err)
	}

	log.Println("Database initialized successfully")
	return db
}

func main() {
	// Инициализация базы данных
	db := initDB()
	defer db.Close()

	// Инициализация обработчиков
	handler := handlers.NewHandler(db)

	// Создание роутера
	router := gin.Default()

	// Middleware
	router.Use(middleware.Logger())
	router.Use(middleware.CORSMiddleware())

	// Routes для расходных материалов
	supplies := router.Group("/supplies")
	{
		supplies.GET("", handler.GetSupplies)
		supplies.GET("/:id", handler.GetSupply)
		supplies.POST("", handler.CreateSupply)
		supplies.PUT("/:id", handler.UpdateSupply)
		supplies.DELETE("/:id", handler.DeleteSupply)
		supplies.GET("/low-stock", handler.GetLowStock)
	}

	// Routes для использования
	usage := router.Group("/usage")
	{
		usage.POST("", handler.RecordUsage)
		usage.GET("/history", handler.GetUsageHistory)
	}

	// Routes для запросов
	requests := router.Group("/requests")
	{
		requests.GET("", handler.GetRequests)
		requests.POST("", handler.CreateRequest)
		requests.PUT("/:id/status", handler.UpdateRequestStatus)
	}

	// Routes для статистики
	router.GET("/statistics", handler.GetStatistics)

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":   "OK",
			"database": "connected",
		})
	})

	// Запуск сервера
	log.Println("Server starting on :5600")
	if err := router.Run(":5600"); err != nil {
		log.Fatal(err)
	}
}
