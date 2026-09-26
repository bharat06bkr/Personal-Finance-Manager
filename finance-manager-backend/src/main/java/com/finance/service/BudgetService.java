package com.finance.service;

import com.finance.dto.BudgetRequest;
import com.finance.dto.BudgetResponse;
import com.finance.entity.Budget;
import com.finance.entity.Category;
import com.finance.entity.User;
import com.finance.exception.BadRequestException;
import com.finance.exception.ResourceNotFoundException;
import com.finance.repository.BudgetRepository;
import com.finance.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryService categoryService;
    private final TransactionRepository transactionRepository;
    private final AuthService authService;

    @Autowired
    public BudgetService(BudgetRepository budgetRepository,
                         CategoryService categoryService,
                         TransactionRepository transactionRepository,
                         AuthService authService) {
        this.budgetRepository = budgetRepository;
        this.categoryService = categoryService;
        this.transactionRepository = transactionRepository;
        this.authService = authService;
    }

    public List<BudgetResponse> getBudgets(Integer month, Integer year) {
        User currentUser = authService.getAuthenticatedUser();
        LocalDate now = LocalDate.now();
        int targetMonth = (month != null) ? month : now.getMonthValue();
        int targetYear = (year != null) ? year : now.getYear();

        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(currentUser, targetMonth, targetYear);
        return budgets.stream()
                .map(budget -> mapToResponse(budget, currentUser))
                .collect(Collectors.toList());
    }

    public BudgetResponse createBudget(BudgetRequest request) {
        User currentUser = authService.getAuthenticatedUser();
        Category category = categoryService.getCategoryEntity(request.getCategoryId(), currentUser);

        if (budgetRepository.existsByUserAndCategoryAndMonthAndYear(currentUser, category, request.getMonth(), request.getYear())) {
            throw new BadRequestException("Budget for category '" + category.getName() + "' already exists for " + request.getMonth() + "/" + request.getYear() + "!");
        }

        Budget budget = Budget.builder()
                .amount(request.getAmount())
                .month(request.getMonth())
                .year(request.getYear())
                .user(currentUser)
                .category(category)
                .build();

        Budget saved = budgetRepository.save(budget);
        return mapToResponse(saved, currentUser);
    }

    public BudgetResponse updateBudget(Long id, BudgetRequest request) {
        User currentUser = authService.getAuthenticatedUser();
        Budget budget = budgetRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with ID: " + id));

        Category category = categoryService.getCategoryEntity(request.getCategoryId(), currentUser);

        budget.setAmount(request.getAmount());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());
        budget.setCategory(category);

        Budget updated = budgetRepository.save(budget);
        return mapToResponse(updated, currentUser);
    }

    public void deleteBudget(Long id) {
        User currentUser = authService.getAuthenticatedUser();
        Budget budget = budgetRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with ID: " + id));

        budgetRepository.delete(budget);
    }

    private BudgetResponse mapToResponse(Budget budget, User user) {
        YearMonth ym = YearMonth.of(budget.getYear(), budget.getMonth());
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        BigDecimal spentAmount = transactionRepository.sumExpenseByUserAndCategoryAndDateBetween(
                user, budget.getCategory().getId(), startDate, endDate);
        if (spentAmount == null) spentAmount = BigDecimal.ZERO;

        BigDecimal remainingAmount = budget.getAmount().subtract(spentAmount);
        double utilization = (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) ?
                spentAmount.divide(budget.getAmount(), 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0.0;

        return BudgetResponse.builder()
                .id(budget.getId())
                .amount(budget.getAmount())
                .month(budget.getMonth())
                .year(budget.getYear())
                .categoryId(budget.getCategory().getId())
                .categoryName(budget.getCategory().getName())
                .spentAmount(spentAmount)
                .remainingAmount(remainingAmount)
                .utilizationPercentage(Math.round(utilization * 100.0) / 100.0)
                .build();
    }
}
