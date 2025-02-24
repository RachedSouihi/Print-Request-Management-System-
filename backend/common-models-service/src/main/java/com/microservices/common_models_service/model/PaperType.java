package com.microservices.common_models_service.model;




import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "paper_types")
@Getter
@Setter
public class PaperType {
    @Id
    private String paperType;

    private float costPerPage;
}