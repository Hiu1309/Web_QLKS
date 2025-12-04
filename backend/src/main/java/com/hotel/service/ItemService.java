package com.hotel.service;

import com.hotel.model.Item;
import com.hotel.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public Optional<Item> getItemById(Integer itemId) {
        return itemRepository.findById(itemId);
    }

    public List<Item> getItemsByStatus(String status) {
        return itemRepository.findByStatus(status);
    }

    public Item createItem(Item item) {
        return itemRepository.save(item);
    }

    public Item updateItem(Integer itemId, Item itemDetails) {
        Optional<Item> item = itemRepository.findById(itemId);
        if (item.isPresent()) {
            Item existingItem = item.get();
            if (itemDetails.getItemName() != null) {
                existingItem.setItemName(itemDetails.getItemName());
            }
            if (itemDetails.getPrice() != null) {
                existingItem.setPrice(itemDetails.getPrice());
            }
            if (itemDetails.getStatus() != null) {
                existingItem.setStatus(itemDetails.getStatus());
            }
            if (itemDetails.getImage() != null) {
                existingItem.setImage(itemDetails.getImage());
            }
            return itemRepository.save(existingItem);
        }
        return null;
    }

    public boolean deleteItem(Integer itemId) {
        if (itemRepository.existsById(itemId)) {
            itemRepository.deleteById(itemId);
            return true;
        }
        return false;
    }
}
