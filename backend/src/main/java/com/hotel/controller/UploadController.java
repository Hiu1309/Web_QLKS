package com.hotel.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "*")
public class UploadController {

    private final String UPLOAD_BASE_FOLDER = "src/main/resources/static/uploads";
    private final String ROOMS_FOLDER = UPLOAD_BASE_FOLDER + "/rooms";
    private final String SERVICES_FOLDER = UPLOAD_BASE_FOLDER + "/services";

    @GetMapping("/images")
    public List<String> getImages(@RequestParam(defaultValue = "rooms") String folder) {
        String uploadFolder = folder.equals("services") ? SERVICES_FOLDER : ROOMS_FOLDER;
        File dir = new File(uploadFolder);
        if (!dir.exists() || !dir.isDirectory()) {
            return List.of();
        }

        return Arrays.stream(dir.listFiles())
                .filter(File::isFile)
                .map(File::getName)
                .collect(Collectors.toList());
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "rooms") String folder) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        try {
            // Xác định thư mục upload
            String uploadFolder = folder.equals("services") ? SERVICES_FOLDER : ROOMS_FOLDER;
            File dir = new File(uploadFolder);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Lấy tên file gốc
            String fileName = file.getOriginalFilename();
            Path filePath = Paths.get(uploadFolder, fileName);

            // Lưu file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Trả về đường dẫn tương đối
            String relativePath = "uploads/" + folder + "/" + fileName;
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "File uploaded successfully");
            response.put("fileName", fileName);
            response.put("filePath", relativePath);
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }
}
