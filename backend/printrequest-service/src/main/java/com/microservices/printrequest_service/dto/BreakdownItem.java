package com.microservices.printrequest_service.dto;


public class BreakdownItem {
    private String label;
    private String value;
    private String percentage;


    public BreakdownItem(String label, String value, String percentage) {
        this.label = label;
        this.value = value;
        this.percentage = percentage;
    }


    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getPercentage() {
        return percentage;
    }

    public void setPercentage(String percentage) {
        this.percentage = percentage;
    }
}