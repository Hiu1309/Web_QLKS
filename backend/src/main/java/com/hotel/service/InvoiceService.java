package com.hotel.service;

import com.hotel.model.*;
import com.hotel.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {
    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceItemRepository invoiceItemRepository;

    @Autowired
    private StayRepository stayRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Tạo hóa đơn từ một Stay (được gọi khi trả phòng)
     */
    public Invoice createInvoiceFromStay(Integer stayId, User createdByUser) {
        Optional<Stay> stayOpt = stayRepository.findById(stayId);
        if (!stayOpt.isPresent()) {
            throw new RuntimeException("Stay not found with id: " + stayId);
        }

        Stay stay = stayOpt.get();
        User user = null;
        if (createdByUser != null) {
            if (createdByUser.getUserId() != null) {
                user = userRepository.findById(createdByUser.getUserId()).orElse(createdByUser);
            } else {
                user = createdByUser;
            }
        }
        if (user == null && stay.getReservation() != null && stay.getReservation().getCreatedByUser() != null) {
            User reservationCreator = stay.getReservation().getCreatedByUser();
            if (reservationCreator.getUserId() != null) {
                user = userRepository.findById(reservationCreator.getUserId()).orElse(reservationCreator);
            } else {
                user = reservationCreator;
            }
        }
        if (user == null) {
            user = userRepository.findById(1).orElse(null);
        }

        // Tạo Invoice mới
        Invoice invoice = new Invoice();
        invoice.setStay(stay);
        invoice.setGuest(stay.getGuest());
        invoice.setCurrency("VND");
        invoice.setBalance(stay.getTotalCost() != null ? stay.getTotalCost() : BigDecimal.ZERO);
        invoice.setCreatedByUser(user);
        invoice.setStatus("Chưa thanh toán");

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return savedInvoice;
    }

    /**
     * Lấy tất cả hóa đơn
     */
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    /**
     * Lấy hóa đơn theo ID
     */
    public Optional<Invoice> getInvoiceById(Integer invoiceId) {
        return invoiceRepository.findById(invoiceId);
    }

    /**
     * Lấy hóa đơn theo Guest ID
     */
    public List<Invoice> getInvoicesByGuestId(Integer guestId) {
        return invoiceRepository.findByGuest_GuestId(guestId);
    }

    /**
     * Lấy hóa đơn theo Stay ID
     */
    public Optional<Invoice> getInvoiceByStayId(Integer stayId) {
        return invoiceRepository.findByStay_StayId(stayId);
    }

    /**
     * Cập nhật hóa đơn
     */
    public Invoice updateInvoice(Integer invoiceId, Invoice invoiceDetails) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (!invoiceOpt.isPresent()) {
            throw new RuntimeException("Invoice not found with id: " + invoiceId);
        }

        Invoice invoice = invoiceOpt.get();
        if (invoiceDetails.getBalance() != null) {
            invoice.setBalance(invoiceDetails.getBalance());
        }
        if (invoiceDetails.getCurrency() != null) {
            invoice.setCurrency(invoiceDetails.getCurrency());
        }
        if (invoiceDetails.getStatus() != null) {
            invoice.setStatus(invoiceDetails.getStatus());
        }
        if (invoiceDetails.getPaymentMethod() != null && !invoiceDetails.getPaymentMethod().isEmpty()) {
            invoice.setPaymentMethod(invoiceDetails.getPaymentMethod());
        }

        return invoiceRepository.save(invoice);
    }

    /**
     * Xóa hóa đơn
     */
    public void deleteInvoice(Integer invoiceId) {
        invoiceRepository.deleteById(invoiceId);
    }

    /**
     * Thêm dịch vụ vào hóa đơn
     */
    public InvoiceItem addServiceToInvoice(Integer invoiceId, Item item, BigDecimal amount, Integer postedByUserId) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (!invoiceOpt.isPresent()) {
            throw new RuntimeException("Invoice not found with id: " + invoiceId);
        }

        Invoice invoice = invoiceOpt.get();
        Optional<User> userOpt = userRepository.findById(postedByUserId);
        User user = userOpt.orElse(null);

        InvoiceItem invoiceItem = new InvoiceItem();
        invoiceItem.setInvoice(invoice);
        invoiceItem.setItem(item);
        invoiceItem.setAmount(amount);
        invoiceItem.setPostedByUser(user);

        // Cập nhật balance của hóa đơn (không thêm, chỉ lưu dịch vụ)
        // Balance sẽ được set lại khi thanh toán
        // BigDecimal newBalance = invoice.getBalance() != null 
        //     ? invoice.getBalance().add(amount) 
        //     : amount;
        // invoice.setBalance(newBalance);
        // invoiceRepository.save(invoice);

        return invoiceItemRepository.save(invoiceItem);
    }

    /**
     * Lấy các mục của hóa đơn
     */
    public List<InvoiceItem> getInvoiceItems(Integer invoiceId) {
        return invoiceItemRepository.findItemsByInvoiceId(invoiceId);
    }
}
