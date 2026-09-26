package com.finance.dto;

import java.math.BigDecimal;
import java.util.List;

public class ReportSummaryResponse {
    private String period;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netSavings;
    private List<CategoryExpenseDto> categoryBreakdown;
    private List<TransactionResponse> transactions;

    public ReportSummaryResponse() {
    }

    public ReportSummaryResponse(String period, BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal netSavings, List<CategoryExpenseDto> categoryBreakdown, List<TransactionResponse> transactions) {
        this.period = period;
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.netSavings = netSavings;
        this.categoryBreakdown = categoryBreakdown;
        this.transactions = transactions;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }

    public BigDecimal getNetSavings() {
        return netSavings;
    }

    public void setNetSavings(BigDecimal netSavings) {
        this.netSavings = netSavings;
    }

    public List<CategoryExpenseDto> getCategoryBreakdown() {
        return categoryBreakdown;
    }

    public void setCategoryBreakdown(List<CategoryExpenseDto> categoryBreakdown) {
        this.categoryBreakdown = categoryBreakdown;
    }

    public List<TransactionResponse> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<TransactionResponse> transactions) {
        this.transactions = transactions;
    }

    public static ReportSummaryResponseBuilder builder() {
        return new ReportSummaryResponseBuilder();
    }

    public static class ReportSummaryResponseBuilder {
        private String period;
        private BigDecimal totalIncome;
        private BigDecimal totalExpense;
        private BigDecimal netSavings;
        private List<CategoryExpenseDto> categoryBreakdown;
        private List<TransactionResponse> transactions;

        public ReportSummaryResponseBuilder period(String period) {
            this.period = period;
            return this;
        }

        public ReportSummaryResponseBuilder totalIncome(BigDecimal totalIncome) {
            this.totalIncome = totalIncome;
            return this;
        }

        public ReportSummaryResponseBuilder totalExpense(BigDecimal totalExpense) {
            this.totalExpense = totalExpense;
            return this;
        }

        public ReportSummaryResponseBuilder netSavings(BigDecimal netSavings) {
            this.netSavings = netSavings;
            return this;
        }

        public ReportSummaryResponseBuilder categoryBreakdown(List<CategoryExpenseDto> categoryBreakdown) {
            this.categoryBreakdown = categoryBreakdown;
            return this;
        }

        public ReportSummaryResponseBuilder transactions(List<TransactionResponse> transactions) {
            this.transactions = transactions;
            return this;
        }

        public ReportSummaryResponse build() {
            return new ReportSummaryResponse(period, totalIncome, totalExpense, netSavings, categoryBreakdown, transactions);
        }
    }
}
