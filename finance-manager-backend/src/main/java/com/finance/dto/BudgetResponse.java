package com.finance.dto;

import java.math.BigDecimal;

public class BudgetResponse {
    private Long id;
    private BigDecimal amount;
    private Integer month;
    private Integer year;
    private Long categoryId;
    private String categoryName;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double utilizationPercentage;

    public BudgetResponse() {
    }

    public BudgetResponse(Long id, BigDecimal amount, Integer month, Integer year, Long categoryId, String categoryName, BigDecimal spentAmount, BigDecimal remainingAmount, Double utilizationPercentage) {
        this.id = id;
        this.amount = amount;
        this.month = month;
        this.year = year;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.spentAmount = spentAmount;
        this.remainingAmount = remainingAmount;
        this.utilizationPercentage = utilizationPercentage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getSpentAmount() {
        return spentAmount;
    }

    public void setSpentAmount(BigDecimal spentAmount) {
        this.spentAmount = spentAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(BigDecimal remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public Double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(Double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }

    public static BudgetResponseBuilder builder() {
        return new BudgetResponseBuilder();
    }

    public static class BudgetResponseBuilder {
        private Long id;
        private BigDecimal amount;
        private Integer month;
        private Integer year;
        private Long categoryId;
        private String categoryName;
        private BigDecimal spentAmount;
        private BigDecimal remainingAmount;
        private Double utilizationPercentage;

        public BudgetResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public BudgetResponseBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public BudgetResponseBuilder month(Integer month) {
            this.month = month;
            return this;
        }

        public BudgetResponseBuilder year(Integer year) {
            this.year = year;
            return this;
        }

        public BudgetResponseBuilder categoryId(Long categoryId) {
            this.categoryId = categoryId;
            return this;
        }

        public BudgetResponseBuilder categoryName(String categoryName) {
            this.categoryName = categoryName;
            return this;
        }

        public BudgetResponseBuilder spentAmount(BigDecimal spentAmount) {
            this.spentAmount = spentAmount;
            return this;
        }

        public BudgetResponseBuilder remainingAmount(BigDecimal remainingAmount) {
            this.remainingAmount = remainingAmount;
            return this;
        }

        public BudgetResponseBuilder utilizationPercentage(Double utilizationPercentage) {
            this.utilizationPercentage = utilizationPercentage;
            return this;
        }

        public BudgetResponse build() {
            return new BudgetResponse(id, amount, month, year, categoryId, categoryName, spentAmount, remainingAmount, utilizationPercentage);
        }
    }
}
