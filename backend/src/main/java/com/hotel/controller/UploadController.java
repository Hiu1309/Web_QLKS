package com.hotel.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "*")
public class UploadController {

    // Folder nằm trong root project (hoặc src/main/resources/static/uploads/rooms)
    private final String UPLOAD_FOLDER = "src/main/resources/static/uploads/rooms";

    @GetMapping("/images")
    public List<String> getImages() {
        File folder = new File(UPLOAD_FOLDER);
        if (!folder.exists() || !folder.isDirectory()) {
            return List.of();
        }

        return Arrays.stream(folder.listFiles())
                .filter(File::isFile)
                .map(File::getName) // chỉ lấy tên file
                .collect(Collectors.toList());
    }
}
