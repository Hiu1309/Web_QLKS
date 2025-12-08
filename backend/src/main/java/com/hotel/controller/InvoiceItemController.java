package com.hotel.controller;

import com.hotel.model.InvoiceItem;
import com.hotel.model.Item;
import com.hotel.service.InvoiceService;
import com.hotel.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/invoice-items")
@CrossOrigin(origins = "*")
public class InvoiceItemController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private ItemRepository itemRepository;

    public static class AddInvoiceItemRequest {
        public Integer invoiceId;
        public Integer itemId;
        public BigDecimal amount;
        public Integer postedByUserId;
    }

    @PostMapping
    public ResponseEntity<InvoiceItem> addInvoiceItem(@RequestBody AddInvoiceItemRequest request) {
        try {
            if (request == null || request.invoiceId == null || request.itemId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            Optional<Item> itemOpt = itemRepository.findById(request.itemId);
            if (!itemOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

                Item item = itemOpt.get();
                BigDecimal amount = request.amount != null
                    ? request.amount
                    : BigDecimal.valueOf(item.getPrice() != null ? item.getPrice() : 0d);
            Integer postedBy = request.postedByUserId != null ? request.postedByUserId : 1;

            InvoiceItem invoiceItem = invoiceService.addServiceToInvoice(
                    request.invoiceId,
                    item,
                    amount,
                    postedBy
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(invoiceItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<InvoiceItem>> getItemsByInvoice(@PathVariable Integer invoiceId) {
        List<InvoiceItem> items = invoiceService.getInvoiceItems(invoiceId);
        return ResponseEntity.ok(items);
    }
}
