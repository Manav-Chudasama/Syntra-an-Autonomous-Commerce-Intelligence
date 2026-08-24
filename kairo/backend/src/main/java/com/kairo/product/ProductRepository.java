package com.kairo.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findByCategory(Category category);
    List<Product> findByStatus(ProductStatus status);
    List<Product> findByStockLevelLessThanEqual(Integer threshold);
}