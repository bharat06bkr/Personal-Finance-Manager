package com.finance.service;

import com.finance.dto.CategoryExpenseDto;
import com.finance.dto.ReportSummaryResponse;
import com.finance.dto.TransactionResponse;
import com.finance.entity.Transaction;
import com.finance.entity.TransactionType;
import com.finance.entity.User;
import com.finance.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final AuthService authService;

    @Autowired
    public ReportService(TransactionRepository transactionRepository,
                         TransactionService transactionService,
                         AuthService authService) {
        this.transactionRepository = transactionRepository;
        this.transactionService = transactionService;
        this.authService = authService;
    }

    public ReportSummaryResponse getReport(String period, LocalDate customStartDate, LocalDate customEndDate) {
        User currentUser = authService.getAuthenticatedUser();
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate = now;

        String reportPeriod = (period != null) ? period.toUpperCase() : "MONTHLY";

        if (customStartDate != null && customEndDate != null) {
            startDate = customStartDate;
            endDate = customEndDate;
            reportPeriod = "CUSTOM (" + startDate + " to " + endDate + ")";
        } else {
            switch (reportPeriod) {
                case "DAILY":
                    startDate = now;
                    break;
                case "WEEKLY":
                    startDate = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                    endDate = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
                    break;
                case "YEARLY":
                    startDate = now.with(TemporalAdjusters.firstDayOfYear());
                    endDate = now.with(TemporalAdjusters.lastDayOfYear());
                    break;
                case "MONTHLY":
                default:
                    startDate = now.with(TemporalAdjusters.firstDayOfMonth());
                    endDate = now.with(TemporalAdjusters.lastDayOfMonth());
                    reportPeriod = "MONTHLY";
                    break;
            }
        }

        BigDecimal totalIncome = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                currentUser, TransactionType.INCOME, startDate, endDate);
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpense = transactionRepository.sumAmountByUserAndTypeAndDateBetween(
                currentUser, TransactionType.EXPENSE, startDate, endDate);
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal netSavings = totalIncome.subtract(totalExpense);

        // Category breakdown
        List<Object[]> rawCategoryData = transactionRepository.findCategoryExpensesGroupedByUserAndDateBetween(
                currentUser, startDate, endDate);
        List<CategoryExpenseDto> categoryBreakdown = new ArrayList<>();
        BigDecimal finalTotalExpense = totalExpense;
        for (Object[] row : rawCategoryData) {
            String catName = (String) row[0];
            BigDecimal amount = (BigDecimal) row[1];
            double pct = (finalTotalExpense.compareTo(BigDecimal.ZERO) > 0) ?
                    amount.divide(finalTotalExpense, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0.0;

            categoryBreakdown.add(CategoryExpenseDto.builder()
                    .categoryName(catName)
                    .amount(amount)
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .build());
        }

        // Transactions list in range
        List<Transaction> transactions = transactionRepository.findByUserAndTransactionDateBetween(currentUser, startDate, endDate);
        List<TransactionResponse> txResponses = transactions.stream()
                .map(transactionService::mapToResponse)
                .collect(Collectors.toList());

        return ReportSummaryResponse.builder()
                .period(reportPeriod)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netSavings(netSavings)
                .categoryBreakdown(categoryBreakdown)
                .transactions(txResponses)
                .build();
    }
}
