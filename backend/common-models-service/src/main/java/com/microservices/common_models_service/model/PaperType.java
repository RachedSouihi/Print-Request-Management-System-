package com.microservices.common_models_service.model;


import jakarta.persistence.*;

@Entity
@Table(name = "paper_types")
public class PaperType {
    @Id
    @Column(name = "paper_type")
    private String paperType;

    @Column(name = "cost_per_page")
    private float costPerPage;



    public float getCostPerPage() {
        return costPerPage;
    }

    public void setCostPerPage(float costPerPage) {
        this.costPerPage = costPerPage;
    }

    public String getPaperType() {
        return paperType;
    }

    public void setPaperType(String paperType) {
        this.paperType = paperType;
    }
}