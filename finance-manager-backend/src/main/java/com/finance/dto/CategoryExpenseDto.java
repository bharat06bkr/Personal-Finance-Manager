package com.finance.dto;

import java.math.BigDecimal;

public class CategoryExpenseDto {
    private String categoryName;
    private BigDecimal amount;
    private Double percentage;

    public CategoryExpenseDto() {
    }

    public CategoryExpenseDto(String categoryName, BigDecimal amount, Double percentage) {
        this.categoryName = categoryName;
        this.amount = amount;
        this.percentage = percentage;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public static CategoryExpenseDtoBuilder builder() {
        return new CategoryExpenseDtoBuilder();
    }

    public static class CategoryExpenseDtoBuilder {
        private String categoryName;
        private BigDecimal amount;
        private Double percentage;

        public CategoryExpenseDtoBuilder categoryName(String categoryName) {
            this.categoryName = categoryName;
            return this;
        }

        public CategoryExpenseDtoBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public CategoryExpenseDtoBuilder percentage(Double percentage) {
            this.percentage = percentage;
            return this;
        }

        public CategoryExpenseDto build() {
            return new CategoryExpenseDto(categoryName, amount, percentage);
        }
    }
}
