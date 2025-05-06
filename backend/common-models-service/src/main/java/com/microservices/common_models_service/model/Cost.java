package com.microservices.common_models_service.model;


import jakarta.persistence.*;
import java.util.Objects; // Recommended for equals and hashCode

@Entity
@Table(name = "costs")
public class Cost {

    @Id
    // Assuming a separate generated ID for flexibility
    @GeneratedValue(strategy = GenerationType.UUID) // Using UUID for potentially easier distribution
    @Column(name = "id", unique = true, nullable = false)
    private String id;

    // One-to-one relationship with PrintRequests
    // mappedBy should be on the *owning* side of the relationship in PrintRequests
    // Here, Costs is the non-owning side, referencing PrintRequests
    // The foreign key will likely be in the Costs table referencing the PrintRequest
    @OneToOne(fetch = FetchType.LAZY) // Use LAZY loading if the PrintRequest details aren't always needed with Costs
    @JoinColumn(name = "request_id", referencedColumnName = "request_id", unique = true, nullable = false) // Foreign key column
    private PrintRequest printRequest; // Assuming you have a PrintRequest entity

    @Column(name = "paper_cost", nullable = false)
    private float paperCost;

    @Column(name = "ink_cost", nullable = false)
    private float inkCost;

    @Column(name = "total_cost", nullable = false)
    private float totalCost;

    // No-args constructor
    public Cost() {
    }

    // All-args constructor (excluding PrintRequest to avoid circular dependency in simple constructor)
    // You'd typically set the PrintRequest relationship separately or via a builder pattern
    public Cost(String id, float paperCost, float inkCost, float totalCost) {
        this.id = id;
        this.paperCost = paperCost;
        this.inkCost = inkCost;
        this.totalCost = totalCost;
    }

    // Constructor including PrintRequest
    public Cost(String id, PrintRequest printRequest, float paperCost, float inkCost, float totalCost) {
        this.id = id;
        this.printRequest = printRequest;
        this.paperCost = paperCost;
        this.inkCost = inkCost;
        this.totalCost = totalCost;
    }


    // Getters
    public String getId() {
        return id;
    }

    public PrintRequest getPrintRequest() {
        return printRequest;
    }

    public float getPaperCost() {
        return paperCost;
    }

    public float getInkCost() {
        return inkCost;
    }

    public float getTotalCost() {
        return totalCost;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setPrintRequest(PrintRequest printRequest) {
        this.printRequest = printRequest;
    }

    public void setPaperCost(float paperCost) {
        this.paperCost = paperCost;
    }

    public void setInkCost(float inkCost) {
        this.inkCost = inkCost;
    }

    public void setTotalCost(float totalCost) {
        this.totalCost = totalCost;
    }

    // Optional: Override equals and hashCode based on the primary key
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Cost costs = (Cost) o;
        return Objects.equals(id, costs.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // Optional: Override toString()
    @Override
    public String toString() {
        return "Costs{" +
                "id='" + id + '\'' +
                ", request_id=" + (printRequest != null ? printRequest.getRequestId() : "null") +
                ", paperCost=" + paperCost +
                ", inkCost=" + inkCost +
                ", totalCost=" + totalCost +
                '}';
    }
}