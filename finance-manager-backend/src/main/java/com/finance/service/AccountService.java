package com.finance.service;

import com.finance.dto.AccountRequest;
import com.finance.dto.AccountResponse;
import com.finance.entity.Account;
import com.finance.entity.User;
import com.finance.exception.BadRequestException;
import com.finance.exception.ResourceNotFoundException;
import com.finance.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final AuthService authService;

    @Autowired
    public AccountService(AccountRepository accountRepository, AuthService authService) {
        this.accountRepository = accountRepository;
        this.authService = authService;
    }

    public List<AccountResponse> getAllAccounts() {
        User currentUser = authService.getAuthenticatedUser();
        return accountRepository.findByUser(currentUser).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AccountResponse createAccount(AccountRequest request) {
        User currentUser = authService.getAuthenticatedUser();
        if (accountRepository.existsByNameAndUser(request.getName(), currentUser)) {
            throw new BadRequestException("Account with this name already exists!");
        }

        Account account = Account.builder()
                .name(request.getName())
                .accountType(request.getAccountType())
                .balance(request.getBalance())
                .user(currentUser)
                .build();

        Account saved = accountRepository.save(account);
        return mapToResponse(saved);
    }

    public AccountResponse updateAccount(Long id, AccountRequest request) {
        User currentUser = authService.getAuthenticatedUser();
        Account account = accountRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));

        account.setName(request.getName());
        account.setAccountType(request.getAccountType());
        account.setBalance(request.getBalance());

        Account updated = accountRepository.save(account);
        return mapToResponse(updated);
    }

    public void deleteAccount(Long id) {
        User currentUser = authService.getAuthenticatedUser();
        Account account = accountRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));

        accountRepository.delete(account);
    }

    public Account getAccountEntity(Long id, User user) {
        return accountRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));
    }

    public void saveAccountEntity(Account account) {
        accountRepository.save(account);
    }

    private AccountResponse mapToResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .name(account.getName())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .build();
    }
}
