package com.finance.service;

import com.finance.dto.TransactionRequest;
import com.finance.dto.TransactionResponse;
import com.finance.entity.*;
import com.finance.exception.ResourceNotFoundException;
import com.finance.repository.TransactionRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryService categoryService;
    private final AccountService accountService;
    private final AuthService authService;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository,
                              CategoryService categoryService,
                              AccountService accountService,
                              AuthService authService) {
        this.transactionRepository = transactionRepository;
        this.categoryService = categoryService;
        this.accountService = accountService;
        this.authService = authService;
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        User currentUser = authService.getAuthenticatedUser();
        Category category = categoryService.getCategoryEntity(request.getCategoryId(), currentUser);
        Account account = accountService.getAccountEntity(request.getAccountId(), currentUser);

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .type(request.getType())
                .description(request.getDescription())
                .transactionDate(request.getTransactionDate())
                .user(currentUser)
                .category(category)
                .account(account)
                .build();

        // Adjust account balance
        if (request.getType() == TransactionType.INCOME) {
            account.setBalance(account.getBalance().add(request.getAmount()));
        } else {
            account.setBalance(account.getBalance().subtract(request.getAmount()));
        }
        accountService.saveAccountEntity(account);

        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    public Page<TransactionResponse> getFilteredTransactions(
            TransactionType type,
            Long categoryId,
            Long accountId,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        User currentUser = authService.getAuthenticatedUser();

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Transaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user"), currentUser));

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (accountId != null) {
                predicates.add(cb.equal(root.get("account").get("id"), accountId));
            }
            if (startDate != null && endDate != null) {
                predicates.add(cb.between(root.get("transactionDate"), startDate, endDate));
            } else if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), startDate));
            } else if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("transactionDate"), endDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Transaction> transactionPage = transactionRepository.findAll(spec, pageable);
        return transactionPage.map(this::mapToResponse);
    }

    public TransactionResponse getTransactionById(Long id) {
        User currentUser = authService.getAuthenticatedUser();
        Transaction transaction = transactionRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));
        return mapToResponse(transaction);
    }

    @Transactional
    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        User currentUser = authService.getAuthenticatedUser();
        Transaction transaction = transactionRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        // Revert previous account balance impact
        Account previousAccount = transaction.getAccount();
        if (transaction.getType() == TransactionType.INCOME) {
            previousAccount.setBalance(previousAccount.getBalance().subtract(transaction.getAmount()));
        } else {
            previousAccount.setBalance(previousAccount.getBalance().add(transaction.getAmount()));
        }

        Category category = categoryService.getCategoryEntity(request.getCategoryId(), currentUser);
        Account newAccount = accountService.getAccountEntity(request.getAccountId(), currentUser);

        if (previousAccount.getId().equals(newAccount.getId())) {
            newAccount = previousAccount;
        } else {
            accountService.saveAccountEntity(previousAccount);
        }

        // Apply new account balance impact
        if (request.getType() == TransactionType.INCOME) {
            newAccount.setBalance(newAccount.getBalance().add(request.getAmount()));
        } else {
            newAccount.setBalance(newAccount.getBalance().subtract(request.getAmount()));
        }
        accountService.saveAccountEntity(newAccount);

        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setDescription(request.getDescription());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setCategory(category);
        transaction.setAccount(newAccount);

        Transaction updated = transactionRepository.save(transaction);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        User currentUser = authService.getAuthenticatedUser();
        Transaction transaction = transactionRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        // Revert balance impact on account
        Account account = transaction.getAccount();
        if (transaction.getType() == TransactionType.INCOME) {
            account.setBalance(account.getBalance().subtract(transaction.getAmount()));
        } else {
            account.setBalance(account.getBalance().add(transaction.getAmount()));
        }
        accountService.saveAccountEntity(account);

        transactionRepository.delete(transaction);
    }

    public TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .description(transaction.getDescription())
                .transactionDate(transaction.getTransactionDate())
                .categoryId(transaction.getCategory().getId())
                .categoryName(transaction.getCategory().getName())
                .accountId(transaction.getAccount().getId())
                .accountName(transaction.getAccount().getName())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
