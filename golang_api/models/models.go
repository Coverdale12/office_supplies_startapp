package models

import (
    "time"
)

// SupplyItem представляет расходный материал
type SupplyItem struct {
    ID          int       `json:"id"`
    Name        string    `json:"name" binding:"required"`
    Type        string    `json:"type" binding:"required"`
    Model       string    `json:"model" binding:"required"`
    Quantity    int       `json:"quantity" binding:"required"`
    MinQuantity int       `json:"min_quantity" binding:"required"`
    Unit        string    `json:"unit" binding:"required"`
    Location    string    `json:"location"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

// UsageRecord представляет запись о использовании материала
type UsageRecord struct {
    ID          int       `json:"id"`
    SupplyID    int       `json:"supply_id" binding:"required"`
    QuantityUsed int      `json:"quantity_used" binding:"required"`
    UsedBy      string    `json:"used_by" binding:"required"`
    Department  string    `json:"department" binding:"required"`
    Purpose     string    `json:"purpose"`
    UsedAt      time.Time `json:"used_at"`
}

// SupplyRequest представляет запрос на пополнение запасов
type SupplyRequest struct {
    ID          int       `json:"id"`
    SupplyID    int       `json:"supply_id" binding:"required"`
    Quantity    int       `json:"quantity" binding:"required"`
    RequestedBy string    `json:"requested_by" binding:"required"`
    Department  string    `json:"department" binding:"required"`
    Status      string    `json:"status"` // pending, approved, rejected, completed
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}