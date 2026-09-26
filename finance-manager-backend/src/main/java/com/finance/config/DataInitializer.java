package com.finance.config;

import com.finance.entity.Category;
import com.finance.entity.TransactionType;
import com.finance.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    public DataInitializer(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    @Override
    public void run(String... args) throws Exception {
        seedCategories();
    }

    private void seedCategories() {
        List<CategorySeed> defaultSeeds = List.of(
                new CategorySeed("Food", TransactionType.EXPENSE),
                new CategorySeed("Travel", TransactionType.EXPENSE),
                new CategorySeed("Shopping", TransactionType.EXPENSE),
                new CategorySeed("Entertainment", TransactionType.EXPENSE),
                new CategorySeed("Bills", TransactionType.EXPENSE),
                new CategorySeed("Education", TransactionType.EXPENSE),
                new CategorySeed("Salary", TransactionType.INCOME),
                new CategorySeed("Freelance", TransactionType.INCOME),
                new CategorySeed("Investment", TransactionType.INCOME),
                new CategorySeed("Other Expense", TransactionType.EXPENSE),
                new CategorySeed("Other Income", TransactionType.INCOME)
        );

        for (CategorySeed seed : defaultSeeds) {
            if (!categoryRepository.existsByNameAndUserIsNull(seed.name)) {
                Category category = Category.builder()
                        .name(seed.name)
                        .type(seed.type)
                        .user(null)
                        .build();
                categoryRepository.save(category);
            }
        }
    }

    private record CategorySeed(String name, TransactionType type) {}
}
