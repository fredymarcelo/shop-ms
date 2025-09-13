package com.peluware.freddy.sales;


import com.peluware.springframework.crud.core.exceptions.NotFoundEntityException;
import com.peluware.springframework.web.problemdetails.DefaultProblemDetailsExceptionHandler;
import com.peluware.springframework.web.problemdetails.schemas.FieldMessage;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.sql.SQLIntegrityConstraintViolationException;

import static org.springframework.http.HttpStatus.*;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler extends DefaultProblemDetailsExceptionHandler {

    private static final String[] PATH_PREFFIX_TO_REMOVE = {
            "create.dto.",
            "update.dto.",
            "create.dto.",
            "update.dto.",
    };

    @ExceptionHandler(SQLIntegrityConstraintViolationException.class)
    public ResponseEntity<Object> handleSQLIntegrityConstraintViolationException(SQLIntegrityConstraintViolationException ex, WebRequest request) {
        var defaultDetail = "SQL Integrity Constraint Violation Exception.";
        log.warn("Se recibió una excepción de SQLIntegrityConstraintViolationException, se recomienda revisar la integridad de los datos, la excepción es: {}", ex.getMessage());
        return createDefaultResponseEntity(ex, new HttpHeaders(), INTERNAL_SERVER_ERROR, defaultDetail, null, null, request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolationException(DataIntegrityViolationException ex, WebRequest request) {
        var message = ex.getMessage();
        final String detail;
        if (message.contains("delete from")) {
            detail = "No se puede eliminar el registro porque está siendo utilizado por otra entidad.";
        } else if (message.contains("update") && message.contains("set")) {
            detail = "No se puede actualizar el registro porque está siendo utilizado por otra entidad.";
        } else {
            detail = "No se puede completar la operación debido a una violación de integridad de datos.";
        }
        return createDefaultResponseEntity(ex, new HttpHeaders(), BAD_REQUEST, detail, null, null, request);
    }

    @Override
    public ResponseEntity<Object> handleConstraintViolationException(ConstraintViolationException ex, WebRequest request) {
        var defaultDetail = "One or more fields are invalid.";
        var body = createProblemDetail(ex, BAD_REQUEST, defaultDetail, null, null, request);

        addValidationErrors(body, ex.getConstraintViolations(), violation -> {
            violation.getPropertyPath();
            var path = violation.getPropertyPath().toString();
            for (var preffix : PATH_PREFFIX_TO_REMOVE) {
                path = path.replace(preffix, "");
            }
            return new FieldMessage(path, violation.getMessage());
        });

        return createResponseEntity(ex, new HttpHeaders(), BAD_REQUEST, request, body);
    }

    @ExceptionHandler(NotFoundEntityException.class)
    public ResponseEntity<Object> handleNotFoundEntityException(NotFoundEntityException ex, WebRequest request) {
        return createDefaultResponseEntity(
                ex,
                new HttpHeaders(),
                NOT_FOUND,
                ex.getMessage(),
                null,
                null,
                request
        );
    }
}