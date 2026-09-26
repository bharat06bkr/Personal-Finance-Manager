package com.finance.dto;

import com.finance.entity.AccountType;

import java.math.BigDecimal;

public class AccountResponse {
    private Long id;
    private String name;
    private AccountType accountType;
    private BigDecimal balance;

    public AccountResponse() {
    }

    public AccountResponse(Long id, String name, AccountType accountType, BigDecimal balance) {
        this.id = id;
        this.name = name;
        this.accountType = accountType;
        this.balance = balance;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public static AccountResponseBuilder builder() {
        return new AccountResponseBuilder();
    }

    public static class AccountResponseBuilder {
        private Long id;
        private String name;
        private AccountType accountType;
        private BigDecimal balance;

        public AccountResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public AccountResponseBuilder name(String name) {
            this.name = name;
            return this;
        }

        public AccountResponseBuilder accountType(AccountType accountType) {
            this.accountType = accountType;
            return this;
        }

        public AccountResponseBuilder balance(BigDecimal balance) {
            this.balance = balance;
            return this;
        }

        public AccountResponse build() {
            return new AccountResponse(id, name, accountType, balance);
        }
    }
}
