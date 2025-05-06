package com.microservices.printrequest_service.dto;



public class MetricsDTO {
    private MetricItem pagesPrinted;
    private MetricItem totalCost;
    private MetricItem printRequests;
    private MetricItem activeUsers;


    public MetricsDTO() {
    }

    public MetricsDTO(MetricItem pagesPrinted, MetricItem totalCost, MetricItem printRequests, MetricItem activeUsers) {
        this.pagesPrinted = pagesPrinted;
        this.totalCost = totalCost;
        this.printRequests = printRequests;
        this.activeUsers = activeUsers;
    }

    public MetricItem getPagesPrinted() {
        return pagesPrinted;
    }

    public void setPagesPrinted(MetricItem pagesPrinted) {
        this.pagesPrinted = pagesPrinted;
    }

    public MetricItem getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(MetricItem activeUsers) {
        this.activeUsers = activeUsers;
    }

    public MetricItem getPrintRequests() {
        return printRequests;
    }

    public void setPrintRequests(MetricItem printRequests) {
        this.printRequests = printRequests;
    }

    public MetricItem getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(MetricItem totalCost) {
        this.totalCost = totalCost;
    }
}