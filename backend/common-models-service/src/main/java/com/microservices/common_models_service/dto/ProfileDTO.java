package com.microservices.common_models_service.dto;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.microservices.common_models_service.model.Field;
import com.microservices.common_models_service.model.FieldDTO;
import com.microservices.common_models_service.model.Subject;

@JsonInclude(JsonInclude.Include.NON_NULL) // Add this
public class ProfileDTO {
    private String firstname;
    private String lastname;
    private String role;
    private String phone;
    private String educationLevel;
    private FieldDTO field;

    private SubjectDTO subject;

    private String group;

    private String idCard;


    // Constructors
    public ProfileDTO() {}

    public ProfileDTO(String firstname, String lastname) {
        this.firstname = firstname;
        this.lastname = lastname;
    }

    public ProfileDTO(String firstname, String lastname, String role, String phone, String educationLevel, String field) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.role = role;
        this.phone = phone;
        this.educationLevel = educationLevel;
        this.field = new FieldDTO();
    }

    public ProfileDTO(String firstname, String lastname, String role, String phone, String educationLevel, Field field, String group) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.role = role;
        this.phone = phone;
        this.educationLevel = educationLevel;
        this.field = field!=null ? new FieldDTO(field.getFieldId(), field.getName()):null;

        this.group=group;
    }



    public ProfileDTO(String idCard, String firstname, String lastname, String role, String phone, String educationLevel, Field field, Subject subject) {
        this.idCard = idCard;
        this.firstname = firstname;
        this.lastname = lastname;
        this.role = role;
        this.phone = phone;
        this.educationLevel = educationLevel;
        this.field = field != null ? new FieldDTO(field.getFieldId(), field.getName()) : null;

        this.subject = subject != null ? new SubjectDTO(subject.getSubjectId(), subject.getName()) : null;
    }

    // Getters and Setters
    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getIdCard() {
        return idCard;
    }

    public void setIdCard(String idCard) {
        this.idCard = idCard;
    }

    public String getGroup() {
        return group;
    }

    public void setGroup(String group) {
        this.group = group;
    }

    public SubjectDTO getSubject() {
        return subject;
    }

    public void setSubject(SubjectDTO subject) {
        this.subject = subject;
    }

    public FieldDTO getField() {
        return field;
    }

    public void setField(FieldDTO field) {
        this.field = field;
    }

    public String getEducationLevel() {
        return educationLevel;
    }

    public void setEducationLevel(String educationLevel) {
        this.educationLevel = educationLevel;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
