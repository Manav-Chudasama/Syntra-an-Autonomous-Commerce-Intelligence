package com.kairo.config;

import com.kairo.product.Category;
import com.kairo.product.Product;
import com.kairo.product.ProductRepository;
import com.kairo.product.ProductStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    @Autowired
    public DataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if data already exists
        if (productRepository.count() == 0) {
            // Insert seed data as specified in the brief
            Product product1 = new Product(
                "PRD-001",
                "SKU-ELEC-001",
                "Wireless Earbuds Pro",
                Category.ELECTRONICS,
                new BigDecimal("79.99"),
                45,
                20,
                3,
                ProductStatus.ACTIVE
            );
            
            Product product2 = new Product(
                "PRD-002",
                "SKU-ELEC-002",
                "USB-C Hub 7-Port",
                Category.ELECTRONICS,
                new BigDecimal("34.99"),
                120,
                30,
                1,
                ProductStatus.ACTIVE
            );
            
            Product product3 = new Product(
                "PRD-003",
                "SKU-APP-001",
                "Organic Cotton T-Shirt",
                Category.APPAREL,
                new BigDecimal("24.99"),
                8,
                15,
                12,
                ProductStatus.PRICE_REVIEW_PENDING
            );
            
            Product product4 = new Product(
                "PRD-004",
                "SKU-APP-002",
                "Running Shorts — Navy",
                Category.APPAREL,
                new BigDecimal("39.99"),
                55,
                20,
                2,
                ProductStatus.ACTIVE
            );
            
            Product product5 = new Product(
                "PRD-005",
                "SKU-HOME-001",
                "Ceramic Pour-Over Set",
                Category.HOME,
                new BigDecimal("49.99"),
                22,
                10,
                4,
                ProductStatus.ACTIVE
            );
            
            Product product6 = new Product(
                "PRD-006",
                "SKU-HOME-002",
                "LED Desk Lamp — Dimmable",
                Category.HOME,
                new BigDecimal("59.99"),
                0,
                15,
                0,
                ProductStatus.OUT_OF_STOCK
            );
            
            Product product7 = new Product(
                "PRD-007",
                "SKU-ELEC-003",
                "Portable Charger 20K",
                Category.ELECTRONICS,
                new BigDecimal("44.99"),
                18,
                25,
                8,
                ProductStatus.ACTIVE
            );
            
            Product product8 = new Product(
                "PRD-008",
                "SKU-APP-003",
                "Hoodie — Heather Grey",
                Category.APPAREL,
                new BigDecimal("54.99"),
                11,
                12,
                15,
                ProductStatus.ACTIVE
            );
            
            productRepository.save(product1);
            productRepository.save(product2);
            productRepository.save(product3);
            productRepository.save(product4);
            productRepository.save(product5);
            productRepository.save(product6);
            productRepository.save(product7);
            productRepository.save(product8);
            
            System.out.println("Seed data initialized successfully!");
        }
    }
}