package com.microservices.common_models_service.model;


import jakarta.persistence.*;
import java.util.Date; // Or java.time.LocalDateTime for modern usage
import java.util.Objects; // Recommended for equals and hashCode

@Entity
@Table(name = "stock")
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Example: Using UUID for primary key
    @Column(name = "id", unique = true, nullable = false)
    private String id;

    @Column(name = "item_type", nullable = false) // e.g., "Paper", "Ink Cartridge"
    private String itemType;

    @Column(name = "item_name", nullable = false) // e.g., "A4 80gsm White", "HP 65 Ink"
    private String itemName;

    @Column(name = "unit", nullable = false) // e.g., "reams", "cartridges"
    private String unit;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "threshold", nullable = false) // Minimum quantity before reordering is needed
    private int threshold;

    @Column(name = "last_updated", nullable = true) // Timestamp of last update
    @Temporal(TemporalType.TIMESTAMP) // Specifies the database column type for the Date field
    private Date lastUpdated; // Consider using java.time.LocalDateTime

    // No-args constructor
    public Stock() {
    }

    // All-args constructor
    public Stock(String id, String itemType, String itemName, String unit, int quantity, int threshold, Date lastUpdated) {
        this.id = id;
        this.itemType = itemType;
        this.itemName = itemName;
        this.unit = unit;
        this.quantity = quantity;
        this.threshold = threshold;
        this.lastUpdated = lastUpdated;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getItemType() {
        return itemType;
    }

    public String getItemName() {
        return itemName;
    }

    public String getUnit() {
        return unit;
    }

    public int getQuantity() {
        return quantity;
    }

    public int getThreshold() {
        return threshold;
    }

    public Date getLastUpdated() {
        return lastUpdated;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void setThreshold(int threshold) {
        this.threshold = threshold;
    }

    public void setLastUpdated(Date lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    // Optional: Override equals and hashCode based on the primary key
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Stock stock = (Stock) o;
        return Objects.equals(id, stock.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // Optional: Override toString()
    @Override
    public String toString() {
        return "Stock{" +
                "id='" + id + '\'' +
                ", itemType='" + itemType + '\'' +
                ", itemName='" + itemName + '\'' +
                ", unit='" + unit + '\'' +
                ", quantity=" + quantity +
                ", threshold=" + threshold +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}