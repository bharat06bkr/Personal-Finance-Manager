package com.finance.repository;

import com.finance.entity.Transaction;
import com.finance.entity.TransactionType;
import com.finance.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUser(Long id, User user);

    Page<Transaction> findByUser(User user, Pageable pageable);

    List<Transaction> findByUserOrderByTransactionDateDesc(User user);

    List<Transaction> findTop5ByUserOrderByTransactionDateDescCreatedAtDesc(User user);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type")
    BigDecimal sumAmountByUserAndType(@Param("user") User user, @Param("type") TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByUserAndTypeAndDateBetween(@Param("user") User user, 
                                                    @Param("type") TransactionType type, 
                                                    @Param("startDate") LocalDate startDate, 
                                                    @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.category.id = :categoryId AND t.type = com.finance.entity.TransactionType.EXPENSE AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumExpenseByUserAndCategoryAndDateBetween(@Param("user") User user,
                                                         @Param("categoryId") Long categoryId,
                                                         @Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate);

    @Query("SELECT t.category.name, SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = com.finance.entity.TransactionType.EXPENSE GROUP BY t.category.name ORDER BY SUM(t.amount) DESC")
    List<Object[]> findCategoryExpensesGroupedByUser(@Param("user") User user);

    @Query("SELECT t.category.name, SUM(t.amount) FROM Transaction t WHERE t.user = :user AND t.type = com.finance.entity.TransactionType.EXPENSE AND t.transactionDate BETWEEN :startDate AND :endDate GROUP BY t.category.name ORDER BY SUM(t.amount) DESC")
    List<Object[]> findCategoryExpensesGroupedByUserAndDateBetween(@Param("user") User user,
                                                                   @Param("startDate") LocalDate startDate,
                                                                   @Param("endDate") LocalDate endDate);

    List<Transaction> findByUserAndTransactionDateBetween(User user, LocalDate startDate, LocalDate endDate);
}
