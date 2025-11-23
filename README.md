Dự án Web Quản Lý Khách Sạn gồm 2 phần:
Backend: Spring Boot (Java)
Frontend: ReactJS (Vite)
Database: MySQL

Yêu cầu
Backend: Java 17+
MySQL: sử dụng xampp
Frontend: Node.js 18+

Cách chạy 
- Đầu tiên tạo CSDL
1. Mở xampp chạy mysql tạo db sau: hotel_db 
2. Chạy lệnh sql với nội dung ở trong file hotel_db.sql (file này ở nằm trong thư mục Web_QLKS) 

- Sau đó chạy Backend lấy API (Thao tác vscode)
1. gõ vào bash "cd /backend"
2. xong gõ "./mvnw spring-boot:run"
3. test chạy thành công chưa bằng cách truy cập địa chỉ lấy api room: http://localhost:8080/api/rooms
4. Nếu thành công sẽ hiện ra danh sách các phòng

- Chạy web Frontend (Thao tác vscode)
1. Tạo 1 bash khác để sử dụng rồi "cd /frontend"
2. gõ "npm install" 
3. cài xong gõ lệnh sau để cài tiếp vite: "npm install vite --save-dev"
4. chạy react: "npm run dev" (sau bước này sẽ tự mở trình duyệt web hoặc truy cập qua http://localhost:3000/

*Lưu ý: chỉ mới có mục "phòng" trong web là dữ liệu được lấy từ API còn các mục khác hiện chỉ có giao diện react với dữ liệu tĩnh tự tạo
