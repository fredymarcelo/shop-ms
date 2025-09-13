package com.peluware.freddy.sales.repositories;

import com.peluware.freddy.sales.models.Sale;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SaleRepository extends MongoRepository<Sale, String> {
}
