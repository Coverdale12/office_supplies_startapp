package handlers

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"net/http"
	"office_supplies/models"
	"strconv"
)

type Handler struct {
	DB *sql.DB
}

func NewHandler(db *sql.DB) *Handler {
	return &Handler{DB: db}
}

// Supply Handlers

// GetSupplies возвращает все расходные материалы
func (h *Handler) GetSupplies(c *gin.Context) {
	rows, err := h.DB.Query(`
        SELECT id, name, type, model, quantity, min_quantity, unit, location, created_at, updated_at 
        FROM supply_items 
        ORDER BY name
    `)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var supplies []models.SupplyItem
	for rows.Next() {
		var supply models.SupplyItem
		err := rows.Scan(
			&supply.ID, &supply.Name, &supply.Type, &supply.Model,
			&supply.Quantity, &supply.MinQuantity, &supply.Unit,
			&supply.Location, &supply.CreatedAt, &supply.UpdatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		supplies = append(supplies, supply)
	}

	c.JSON(http.StatusOK, supplies)
}

// GetSupply возвращает конкретный расходный материал
func (h *Handler) GetSupply(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var supply models.SupplyItem
	err = h.DB.QueryRow(`
        SELECT id, name, type, model, quantity, min_quantity, unit, location, created_at, updated_at 
        FROM supply_items WHERE id = ?
    `, id).Scan(
		&supply.ID, &supply.Name, &supply.Type, &supply.Model,
		&supply.Quantity, &supply.MinQuantity, &supply.Unit,
		&supply.Location, &supply.CreatedAt, &supply.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Supply not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, supply)
}

// CreateSupply создает новый расходный материал
func (h *Handler) CreateSupply(c *gin.Context) {
	var supply models.SupplyItem
	if err := c.ShouldBindJSON(&supply); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.DB.Exec(`
        INSERT INTO supply_items (name, type, model, quantity, min_quantity, unit, location) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, supply.Name, supply.Type, supply.Model, supply.Quantity, supply.MinQuantity, supply.Unit, supply.Location)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := result.LastInsertId()
	supply.ID = int(id)

	c.JSON(http.StatusCreated, supply)
}

// UpdateSupply обновляет расходный материал
func (h *Handler) UpdateSupply(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var supply models.SupplyItem
	if err := c.ShouldBindJSON(&supply); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err = h.DB.Exec(`
        UPDATE supply_items 
        SET name = ?, type = ?, model = ?, quantity = ?, min_quantity = ?, unit = ?, location = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `, supply.Name, supply.Type, supply.Model, supply.Quantity, supply.MinQuantity, supply.Unit, supply.Location, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	supply.ID = id
	c.JSON(http.StatusOK, supply)
}

// DeleteSupply удаляет расходный материал
func (h *Handler) DeleteSupply(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	_, err = h.DB.Exec("DELETE FROM supply_items WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Supply deleted successfully"})
}

// Usage Handlers

// RecordUsage записывает использование материала
func (h *Handler) RecordUsage(c *gin.Context) {
	var usage models.UsageRecord
	if err := c.ShouldBindJSON(&usage); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверяем, достаточно ли материала
	var currentQuantity int
	err := h.DB.QueryRow("SELECT quantity FROM supply_items WHERE id = ?", usage.SupplyID).Scan(&currentQuantity)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Supply not found"})
		return
	}

	if currentQuantity < usage.QuantityUsed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient quantity"})
		return
	}

	// Начинаем транзакцию
	tx, err := h.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Записываем использование
	result, err := tx.Exec(`
        INSERT INTO usage_records (supply_id, quantity_used, used_by, department, purpose) 
        VALUES (?, ?, ?, ?, ?)
    `, usage.SupplyID, usage.QuantityUsed, usage.UsedBy, usage.Department, usage.Purpose)

	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Обновляем количество
	_, err = tx.Exec("UPDATE supply_items SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
		usage.QuantityUsed, usage.SupplyID)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	tx.Commit()

	usageID, _ := result.LastInsertId()
	usage.ID = int(usageID)

	c.JSON(http.StatusCreated, usage)
}

// GetUsageHistory возвращает историю использования
func (h *Handler) GetUsageHistory(c *gin.Context) {
	supplyID := c.Query("supply_id")
	department := c.Query("department")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := `
        SELECT ur.id, ur.supply_id, ur.quantity_used, ur.used_by, ur.department, ur.purpose, ur.used_at,
               si.name as supply_name
        FROM usage_records ur
        JOIN supply_items si ON ur.supply_id = si.id
        WHERE 1=1
    `
	args := []interface{}{}

	if supplyID != "" {
		query += " AND ur.supply_id = ?"
		args = append(args, supplyID)
	}
	if department != "" {
		query += " AND ur.department = ?"
		args = append(args, department)
	}
	if startDate != "" {
		query += " AND ur.used_at >= ?"
		args = append(args, startDate)
	}
	if endDate != "" {
		query += " AND ur.used_at <= ?"
		args = append(args, endDate)
	}

	query += " ORDER BY ur.used_at DESC"

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var usageRecords []struct {
		models.UsageRecord
		SupplyName string `json:"supply_name"`
	}

	for rows.Next() {
		var record struct {
			models.UsageRecord
			SupplyName string `json:"supply_name"`
		}
		err := rows.Scan(
			&record.ID, &record.SupplyID, &record.QuantityUsed, &record.UsedBy,
			&record.Department, &record.Purpose, &record.UsedAt, &record.SupplyName,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		usageRecords = append(usageRecords, record)
	}

	c.JSON(http.StatusOK, usageRecords)
}

// Request Handlers

// CreateRequest создает запрос на пополнение
func (h *Handler) CreateRequest(c *gin.Context) {
	var request models.SupplyRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.DB.Exec(`
        INSERT INTO supply_requests (supply_id, quantity, requested_by, department, status) 
        VALUES (?, ?, ?, ?, ?)
    `, request.SupplyID, request.Quantity, request.RequestedBy, request.Department, "pending")

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := result.LastInsertId()
	request.ID = int(id)
	request.Status = "pending"

	c.JSON(http.StatusCreated, request)
}

// GetRequests возвращает все запросы
func (h *Handler) GetRequests(c *gin.Context) {
	status := c.Query("status")

	query := `
        SELECT sr.id, sr.supply_id, sr.quantity, sr.requested_by, sr.department, sr.status, sr.created_at, sr.updated_at,
               si.name as supply_name
        FROM supply_requests sr
        JOIN supply_items si ON sr.supply_id = si.id
    `
	args := []interface{}{}

	if status != "" {
		query += " WHERE sr.status = ?"
		args = append(args, status)
	}

	query += " ORDER BY sr.created_at DESC"

	rows, err := h.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var requests []struct {
		models.SupplyRequest
		SupplyName string `json:"supply_name"`
	}

	for rows.Next() {
		var request struct {
			models.SupplyRequest
			SupplyName string `json:"supply_name"`
		}
		err := rows.Scan(
			&request.ID, &request.SupplyID, &request.Quantity, &request.RequestedBy,
			&request.Department, &request.Status, &request.CreatedAt, &request.UpdatedAt,
			&request.SupplyName,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		requests = append(requests, request)
	}

	c.JSON(http.StatusOK, requests)
}

// UpdateRequestStatus обновляет статус запроса
func (h *Handler) UpdateRequestStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Если статус "completed", добавляем количество к запасам
	if input.Status == "completed" {
		tx, err := h.DB.Begin()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Получаем информацию о запросе
		var supplyID, quantity int
		err = tx.QueryRow("SELECT supply_id, quantity FROM supply_requests WHERE id = ?", id).Scan(&supplyID, &quantity)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Обновляем количество запасов
		_, err = tx.Exec("UPDATE supply_items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", quantity, supplyID)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Обновляем статус запроса
		_, err = tx.Exec("UPDATE supply_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", input.Status, id)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		tx.Commit()
	} else {
		// Просто обновляем статус
		_, err = h.DB.Exec("UPDATE supply_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", input.Status, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Request status updated successfully"})
}

// GetLowStock возвращает материалы с низким запасом
func (h *Handler) GetLowStock(c *gin.Context) {
	rows, err := h.DB.Query(`
        SELECT id, name, type, model, quantity, min_quantity, unit, location 
        FROM supply_items 
        WHERE quantity <= min_quantity 
        ORDER BY quantity ASC
    `)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var lowStock []models.SupplyItem
	for rows.Next() {
		var supply models.SupplyItem
		err := rows.Scan(
			&supply.ID, &supply.Name, &supply.Type, &supply.Model,
			&supply.Quantity, &supply.MinQuantity, &supply.Unit, &supply.Location,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		lowStock = append(lowStock, supply)
	}

	c.JSON(http.StatusOK, lowStock)
}

// GetStatistics возвращает статистику
func (h *Handler) GetStatistics(c *gin.Context) {
	var stats struct {
		TotalSupplies   int `json:"total_supplies"`
		TotalItems      int `json:"total_items"`
		LowStockCount   int `json:"low_stock_count"`
		PendingRequests int `json:"pending_requests"`
		MonthlyUsage    []struct {
			Month  string `json:"month"`
			Amount int    `json:"amount"`
		} `json:"monthly_usage"`
	}

	// Общее количество типов материалов
	h.DB.QueryRow("SELECT COUNT(*) FROM supply_items").Scan(&stats.TotalSupplies)

	// Общее количество единиц материалов
	h.DB.QueryRow("SELECT SUM(quantity) FROM supply_items").Scan(&stats.TotalItems)

	// Количество материалов с низким запасом
	h.DB.QueryRow("SELECT COUNT(*) FROM supply_items WHERE quantity <= min_quantity").Scan(&stats.LowStockCount)

	// Количество ожидающих запросов
	h.DB.QueryRow("SELECT COUNT(*) FROM supply_requests WHERE status = 'pending'").Scan(&stats.PendingRequests)

	// Месячная статистика использования
	rows, err := h.DB.Query(`
        SELECT strftime('%Y-%m', used_at) as month, SUM(quantity_used) as total_used
        FROM usage_records 
        WHERE used_at >= date('now', '-6 months')
        GROUP BY strftime('%Y-%m', used_at)
        ORDER BY month
    `)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var month string
			var amount int
			rows.Scan(&month, &amount)
			stats.MonthlyUsage = append(stats.MonthlyUsage, struct {
				Month  string `json:"month"`
				Amount int    `json:"amount"`
			}{Month: month, Amount: amount})
		}
	}

	c.JSON(http.StatusOK, stats)
}
