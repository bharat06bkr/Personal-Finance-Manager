package com.finance.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    // Renamed DB columns to 'budget_month' and 'budget_year' to avoid SQL reserved keyword collisions (e.g. H2/MySQL MONTH/YEAR keywords)
    @Column(name = "budget_month", nullable = false)
    private Integer month;

    @Column(name = "budget_year", nullable = false)
    private Integer year;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    public Budget() {
    }

    public Budget(Long id, BigDecimal amount, Integer month, Integer year, User user, Category category) {
        this.id = id;
        this.amount = amount;
        this.month = month;
        this.year = year;
        this.user = user;
        this.category = category;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public static BudgetBuilder builder() {
        return new BudgetBuilder();
    }

    public static class BudgetBuilder {
        private Long id;
        private BigDecimal amount;
        private Integer month;
        private Integer year;
        private User user;
        private Category category;

        public BudgetBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public BudgetBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public BudgetBuilder month(Integer month) {
            this.month = month;
            return this;
        }

        public BudgetBuilder year(Integer year) {
            this.year = year;
            return this;
        }

        public BudgetBuilder user(User user) {
            this.user = user;
            return this;
        }

        public BudgetBuilder category(Category category) {
            this.category = category;
            return this;
        }

        public Budget build() {
            return new Budget(id, amount, month, year, user, category);
        }
    }
}
