package com.finance.dto;

import com.finance.entity.TransactionType;

public class CategoryResponse {
    private Long id;
    private String name;
    private TransactionType type;
    private Boolean isDefault;

    public CategoryResponse() {
    }

    public CategoryResponse(Long id, String name, TransactionType type, Boolean isDefault) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.isDefault = isDefault;
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

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public static CategoryResponseBuilder builder() {
        return new CategoryResponseBuilder();
    }

    public static class CategoryResponseBuilder {
        private Long id;
        private String name;
        private TransactionType type;
        private Boolean isDefault;

        public CategoryResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public CategoryResponseBuilder name(String name) {
            this.name = name;
            return this;
        }

        public CategoryResponseBuilder type(TransactionType type) {
            this.type = type;
            return this;
        }

        public CategoryResponseBuilder isDefault(Boolean isDefault) {
            this.isDefault = isDefault;
            return this;
        }

        public CategoryResponse build() {
            return new CategoryResponse(id, name, type, isDefault);
        }
    }
}
