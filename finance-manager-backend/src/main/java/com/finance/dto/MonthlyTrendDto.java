package com.finance.dto;

import java.math.BigDecimal;

public class MonthlyTrendDto {
    private String monthName;
    private Integer month;
    private Integer year;
    private BigDecimal income;
    private BigDecimal expense;

    public MonthlyTrendDto() {
    }

    public MonthlyTrendDto(String monthName, Integer month, Integer year, BigDecimal income, BigDecimal expense) {
        this.monthName = monthName;
        this.month = month;
        this.year = year;
        this.income = income;
        this.expense = expense;
    }

    public String getMonthName() {
        return monthName;
    }

    public void setMonthName(String monthName) {
        this.monthName = monthName;
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

    public BigDecimal getIncome() {
        return income;
    }

    public void setIncome(BigDecimal income) {
        this.income = income;
    }

    public BigDecimal getExpense() {
        return expense;
    }

    public void setExpense(BigDecimal expense) {
        this.expense = expense;
    }

    public static MonthlyTrendDtoBuilder builder() {
        return new MonthlyTrendDtoBuilder();
    }

    public static class MonthlyTrendDtoBuilder {
        private String monthName;
        private Integer month;
        private Integer year;
        private BigDecimal income;
        private BigDecimal expense;

        public MonthlyTrendDtoBuilder monthName(String monthName) {
            this.monthName = monthName;
            return this;
        }

        public MonthlyTrendDtoBuilder month(Integer month) {
            this.month = month;
            return this;
        }

        public MonthlyTrendDtoBuilder year(Integer year) {
            this.year = year;
            return this;
        }

        public MonthlyTrendDtoBuilder income(BigDecimal income) {
            this.income = income;
            return this;
        }

        public MonthlyTrendDtoBuilder expense(BigDecimal expense) {
            this.expense = expense;
            return this;
        }

        public MonthlyTrendDto build() {
            return new MonthlyTrendDto(monthName, month, year, income, expense);
        }
    }
}
