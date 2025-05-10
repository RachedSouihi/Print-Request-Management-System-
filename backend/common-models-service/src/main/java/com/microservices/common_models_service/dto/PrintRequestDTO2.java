package com.microservices.common_models_service.dto;

import com.microservices.common_models_service.model.Field;
import com.microservices.common_models_service.model.PaperType;
import com.microservices.common_models_service.model.Subject;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class PrintRequestDTO2 {

    private String userId;
    private PaperType paperType;

    private String level;
    private Field section;          // type corrigé
    private Subject subject;        // type corrigé
    private String className;       // "class" est un mot réservé, donc ok
    private String examDate;

    private int copies;
    private String printMode;
    private String instructions;

    private MultipartFile file;

    // Constructeur complet (optionnel car Lombok fournit @AllArgsConstructor si tu veux l'ajouter)
    public PrintRequestDTO2(String userId, PaperType  paperType, String level, Field section, Subject subject,
                            String className, String examDate, int copies, String printMode,
                            String instructions, MultipartFile file) {
        this.userId = userId;
        this.paperType = paperType;
        this.level = level;
        this.section = section;
        this.subject = subject;
        this.className = className;
        this.examDate = examDate;
        this.copies = copies;
        this.printMode = printMode;
        this.instructions = instructions;
        this.file = file;
    }

    // Constructeur vide (géré aussi par Lombok si tu ajoutes @NoArgsConstructor)
    public PrintRequestDTO2() {}
}
