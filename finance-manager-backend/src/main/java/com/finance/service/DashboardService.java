package com.finance.service;

import com.finance.dto.*;
import com.finance.entity.Transaction;
import com.finance.entity.TransactionType;
import com.finance.entity.User;
import com.finance.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final AuthService authService;

    @Autowired
    public DashboardService(TransactionRepository transactionRepository,
                            TransactionService transactionService,
                            AuthService authService) {
        this.transactionRepository = transactionRepository;
        this.transactionService = transactionService;
        this.authService = authService;
    }

    public DashboardSummaryResponse getDashboardSummary() {
        User currentUser = authService.getAuthenticatedUser();

        BigDecimal totalIncome = transactionRepository.sumAmountByUserAndType(currentUser, TransactionType.INCOME);
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpense = transactionRepository.sumAmountByUserAndType(currentUser, TransactionType.EXPENSE);
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal balance = totalIncome.subtract(totalExpense);

        // Category Expenses
        List<Object[]> rawCategoryData = transactionRepository.findCategoryExpensesGroupedByUser(currentUser);
        List<CategoryExpenseDto> categoryExpenses = new ArrayList<>();
        BigDecimal finalTotalExpense = totalExpense;
        for (Object[] row : rawCategoryData) {
            String catName = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            double pct = (finalTotalExpense.compareTo(BigDecimal.ZERO) > 0) ?
                    amount.divide(finalTotalExpense, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0.0;

            categoryExpenses.add(CategoryExpenseDto.builder()
                    .categoryName(catName)
                    .amount(amount)
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .build());
        }

        // Monthly Trends (Last 6 Months)
        List<MonthlyTrendDto> monthlyTrends = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.from(now.minusMonths(i));
            LocalDate startDate = ym.atDay(1);
            LocalDate endDate = ym.atEndOfMonth();

            BigDecimal inc = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                    currentUser, TransactionType.INCOME, startDate, endDate);
            if (inc == null) inc = BigDecimal.ZERO;

            BigDecimal exp = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                    currentUser, TransactionType.EXPENSE, startDate, endDate);
            if (exp == null) exp = BigDecimal.ZERO;

            String monthName = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + ym.getYear();

            monthlyTrends.add(MonthlyTrendDto.builder()
                    .monthName(monthName)
                    .month(ym.getMonthValue())
                    .year(ym.getYear())
                    .income(inc)
                    .expense(exp)
                    .build());
        }

        // Recent 5 Transactions
        List<Transaction> recentList = transactionRepository.findTop5ByUserOrderByTransactionDateDescCreatedAtDesc(currentUser);
        List<TransactionResponse> recentTransactions = recentList.stream()
                .map(transactionService::mapToResponse)
                .collect(Collectors.toList());

        return DashboardSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .categoryExpenses(categoryExpenses)
                .monthlyTrends(monthlyTrends)
                .recentTransactions(recentTransactions)
                .build();
    }
}
