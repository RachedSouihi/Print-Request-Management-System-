package com.microservices.printrequest_service.dto;

import java.util.List;

public class MetricItem {
    private String value;
    private String change;
    private String changeType;
    private List<BreakdownItem> breakdown;




    public List<BreakdownItem> getBreakdown() {
        return breakdown;
    }

    public void setBreakdown(List<BreakdownItem> breakdown) {
        this.breakdown = breakdown;
    }

    public String getChangeType() {
        return changeType;
    }

    public void setChangeType(String changeType) {
        this.changeType = changeType;
    }

    public String getChange() {
        return change;
    }

    public void setChange(String change) {
        this.change = change;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}