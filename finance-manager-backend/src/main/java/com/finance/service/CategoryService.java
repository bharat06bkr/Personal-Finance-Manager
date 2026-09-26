package com.finance.service;

import com.finance.dto.CategoryRequest;
import com.finance.dto.CategoryResponse;
import com.finance.entity.Category;
import com.finance.entity.TransactionType;
import com.finance.entity.User;
import com.finance.exception.BadRequestException;
import com.finance.exception.ResourceNotFoundException;
import com.finance.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuthService authService;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository, AuthService authService) {
        this.categoryRepository = categoryRepository;
        this.authService = authService;
    }

    public List<CategoryResponse> getAllCategories(TransactionType type) {
        User currentUser = authService.getAuthenticatedUser();
        List<Category> categories = (type != null) ?
                categoryRepository.findAvailableForUserAndType(currentUser, type) :
                categoryRepository.findAllAvailableForUser(currentUser);

        return categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        User currentUser = authService.getAuthenticatedUser();
        if (categoryRepository.existsByNameAndUser(request.getName(), currentUser) ||
            categoryRepository.existsByNameAndUserIsNull(request.getName())) {
            throw new BadRequestException("Category with this name already exists!");
        }

        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .user(currentUser)
                .build();

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        User currentUser = authService.getAuthenticatedUser();
        Category category = categoryRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found or not editable (system categories cannot be edited)"));

        if (category.getUser() == null) {
            throw new BadRequestException("System default categories cannot be modified!");
        }

        category.setName(request.getName());
        category.setType(request.getType());
        Category updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    public void deleteCategory(Long id) {
        User currentUser = authService.getAuthenticatedUser();
        Category category = categoryRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found or cannot be deleted"));

        if (category.getUser() == null) {
            throw new BadRequestException("System default categories cannot be deleted!");
        }

        categoryRepository.delete(category);
    }

    public Category getCategoryEntity(Long id, User user) {
        return categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .isDefault(category.getUser() == null)
                .build();
    }
}
