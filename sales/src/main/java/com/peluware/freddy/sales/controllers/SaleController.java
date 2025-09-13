package com.peluware.freddy.sales.controllers;

import com.peluware.freddy.sales.dto.SaleDto;
import com.peluware.freddy.sales.models.Sale;
import com.peluware.freddy.sales.services.SaleService;
import com.peluware.springframework.crud.core.web.controllers.CrudController;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sales")
@CrossOrigin(origins = "*")
@Getter
@RequiredArgsConstructor
public class SaleController implements CrudController<Sale, SaleDto, String> {
    private final SaleService service;
}
