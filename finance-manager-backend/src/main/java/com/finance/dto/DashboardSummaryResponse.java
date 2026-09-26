package com.finance.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private List<CategoryExpenseDto> categoryExpenses;
    private List<MonthlyTrendDto> monthlyTrends;
    private List<TransactionResponse> recentTransactions;

    public DashboardSummaryResponse() {
    }

    public DashboardSummaryResponse(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal balance, List<CategoryExpenseDto> categoryExpenses, List<MonthlyTrendDto> monthlyTrends, List<TransactionResponse> recentTransactions) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.balance = balance;
        this.categoryExpenses = categoryExpenses;
        this.monthlyTrends = monthlyTrends;
        this.recentTransactions = recentTransactions;
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

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public List<CategoryExpenseDto> getCategoryExpenses() {
        return categoryExpenses;
    }

    public void setCategoryExpenses(List<CategoryExpenseDto> categoryExpenses) {
        this.categoryExpenses = categoryExpenses;
    }

    public List<MonthlyTrendDto> getMonthlyTrends() {
        return monthlyTrends;
    }

    public void setMonthlyTrends(List<MonthlyTrendDto> monthlyTrends) {
        this.monthlyTrends = monthlyTrends;
    }

    public List<TransactionResponse> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<TransactionResponse> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }

    public static DashboardSummaryResponseBuilder builder() {
        return new DashboardSummaryResponseBuilder();
    }

    public static class DashboardSummaryResponseBuilder {
        private BigDecimal totalIncome;
        private BigDecimal totalExpense;
        private BigDecimal balance;
        private List<CategoryExpenseDto> categoryExpenses;
        private List<MonthlyTrendDto> monthlyTrends;
        private List<TransactionResponse> recentTransactions;

        public DashboardSummaryResponseBuilder totalIncome(BigDecimal totalIncome) {
            this.totalIncome = totalIncome;
            return this;
        }

        public DashboardSummaryResponseBuilder totalExpense(BigDecimal totalExpense) {
            this.totalExpense = totalExpense;
            return this;
        }

        public DashboardSummaryResponseBuilder balance(BigDecimal balance) {
            this.balance = balance;
            return this;
        }

        public DashboardSummaryResponseBuilder categoryExpenses(List<CategoryExpenseDto> categoryExpenses) {
            this.categoryExpenses = categoryExpenses;
            return this;
        }

        public DashboardSummaryResponseBuilder monthlyTrends(List<MonthlyTrendDto> monthlyTrends) {
            this.monthlyTrends = monthlyTrends;
            return this;
        }

        public DashboardSummaryResponseBuilder recentTransactions(List<TransactionResponse> recentTransactions) {
            this.recentTransactions = recentTransactions;
            return this;
        }

        public DashboardSummaryResponse build() {
            return new DashboardSummaryResponse(totalIncome, totalExpense, balance, categoryExpenses, monthlyTrends, recentTransactions);
        }
    }
}
