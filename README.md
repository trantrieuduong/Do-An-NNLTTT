# 🌐 Mạng Xã Hội Okayji

> **Okayji** là một nền tảng mạng xã hội hiện đại, nơi người dùng có thể kết nối, chia sẻ bài viết, trò chuyện trực tiếp và tương tác cùng cộng đồng. Hệ thống tích hợp kiểm duyệt nội dung tự động bằng AI nhằm đảm bảo môi trường lành mạnh và an toàn.

---

## 👨‍💻 Thông tin thành viên

| Họ tên | MSSV |
|---|---|
| [Trần Triều Dương](https://github.com/trantrieuduong) | 23110200 |
| [Võ Lê Khánh Duy](https://github.com/VoLeKhanhDuy-2005) | 23110196 |

---

## 📋 Mục lục

- [Giới thiệu hệ thống](#-giới-thiệu-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Các chức năng chính](#-các-chức-năng-chính)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Hướng dẫn cài đặt và chạy](#-hướng-dẫn-cài-đặt-và-chạy)
- [Back-end API](#-back-end-api)
- [Front-end Web](#-front-end-web)
- [Nguyên tắc SOLID đã áp dụng](#-nguyên-tắc-solid-đã-áp-dụng)
- [Hướng phát triển thêm](#-hướng-phát-triển-thêm)

---

## 📖 Giới thiệu hệ thống

**Okayji** là hệ thống mạng xã hội gồm hai phần chính:

- **Back-end**: xây dựng bằng **Java Spring Boot**, cung cấp REST API, WebSocket, xác thực JWT, xử lý nghiệp vụ, kiểm duyệt AI, upload file và quản lý dữ liệu.
- **Front-end**: xây dựng bằng **ReactJS + Vite**, cung cấp giao diện người dùng cho đăng nhập, bảng tin, hồ sơ cá nhân, chat real-time, bạn bè và thông báo.

Hệ thống được tổ chức theo mô hình **client-server**, trong đó front-end đóng vai trò giao diện người dùng, còn back-end xử lý xác thực, nghiệp vụ, dữ liệu và real-time communication.

---

## 🛠 Công nghệ sử dụng

### Back-end

| Công nghệ | Phiên bản | Mô tả |
|---|---|---|
| Java | 21 | Ngôn ngữ lập trình chính |
| Spring Boot | 4.0.2 | Framework phát triển REST API |
| Spring Security | (theo Spring Boot) | Xác thực & phân quyền |
| Spring Data JPA | (theo Spring Boot) | ORM, tương tác cơ sở dữ liệu |
| Spring WebSocket | (theo Spring Boot) | Nhắn tin & thông báo real-time |
| Spring AI | 2.0.0-M2 | Tích hợp OpenAI để kiểm duyệt nội dung |
| MySQL Connector | (theo Spring Boot) | Driver kết nối MySQL |
| JWT (jjwt) | 0.12.6 | Tạo & xác thực JSON Web Token |
| AWS SDK S3 | 2.41.28 | Lưu trữ ảnh & video trên AWS S3 |
| MapStruct | 1.5.5.Final | Ánh xạ DTO ↔ Entity |
| Lombok | (theo Spring Boot) | Giảm boilerplate code |
| Springdoc OpenAPI | 2.7.0 | Tự động sinh tài liệu API (Swagger UI) |
| Maven | 3.x | Quản lý dependency & build |

### Front-end

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| React | ^19.2.0 | Xây dựng giao diện người dùng |
| Vite | ^7.2.4 | Build tool & dev server |
| React Router DOM | ^7.13.0 | Điều hướng phía client |
| Axios | ^1.13.5 | Gọi REST API |
| @stomp/stompjs | ^7.3.0 | Giao tiếp WebSocket qua STOMP |
| SockJS Client | ^1.6.1 | Fallback WebSocket |
| Lucide React | ^0.563.0 | Bộ icon giao diện |
| React Hot Toast | ^2.6.0 | Thông báo toast |
| ESLint | ^9.39.1 | Kiểm tra chất lượng mã nguồn |
| JavaScript (ES Module) | ES2020+ | Ngôn ngữ lập trình chính |
| CSS / Tailwind CSS | — | Thiết kế giao diện |

### Cơ sở dữ liệu

| Công nghệ | Mô tả |
|---|---|
| MySQL 9.3.x | Hệ quản trị cơ sở dữ liệu quan hệ chính |

### Dịch vụ ngoài

| Dịch vụ | Mục đích |
|---|---|
| AWS S3 | Lưu trữ ảnh, video người dùng đăng tải |
| OpenAI API | Kiểm duyệt nội dung bài viết / bình luận tự động |
| FFmpeg | Xử lý, chuyển đổi định dạng video |

---

## 🏗 Kiến trúc hệ thống
### Sơ đồ tổng quát

```text
┌─────────────────────────────────────────┐
│               Front-end                 │
│         ReactJS + Vite + Axios          │
└──────────────────┬──────────────────────┘
                   │ HTTP REST / WebSocket
┌──────────────────▼──────────────────────┐
│               Back-end                  │
│      Spring Boot REST API + STOMP       │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Controller Layer  │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │    Service Layer    │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │Repository Layer JPA │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │    MySQL Database   │
        └─────────────────────┘
```


## ✨ Các chức năng chính

### 🔐 Xác thực & Phân quyền
- Đăng ký tài khoản, đăng nhập với **JWT Access Token**
- Hỗ trợ chế độ "Nhớ đăng nhập" (token 1 ngày / 14 ngày)
- Blacklist token khi đăng xuất (`InvalidatedToken`)
- Phân quyền **USER** / **ADMIN** qua Spring Security

### 👤 Quản lý hồ sơ người dùng
- Cập nhật thông tin cá nhân: avatar, bio, giới tính, ngày sinh
- Cài đặt quyền riêng tư hồ sơ (`ProfileVisibility`): PUBLIC / FRIEND_ONLY
- Quản lý trạng thái tài khoản (`UserStatus`): ACTIVE / SUSPENDED / DELETED

### 📝 Bài viết
- Đăng bài viết kèm ảnh, video
- Chỉnh sửa, xóa bài viết
- Phân trang feed; hiển thị bài viết của bạn bè
- Trạng thái bài viết: PENDING / PUBLISHED / REJECTED / UNDER_REVIEW

### 💬 Tương tác bài viết
- Like bài viết
- Bình luận: tạo mới, chỉnh sửa, xóa

### 👥 Kết bạn
- Gửi / chấp nhận / từ chối lời mời kết bạn
- Hủy kết bạn
- Xem danh sách bạn bè & lời mời đang chờ

### 🔎 Tìm kiếm
- Tìm kiếm người dùng
- Tìm kiếm bài đăng

### 🔔 Thông báo
- Nhận thông báo real-time qua WebSocket khi có:
  - lượt like / bình luận
  - lời mời kết bạn mới / được chấp nhận
  - thông báo hệ thống

### 💬 Nhắn tin
- Nhắn tin 1-1
- Nhắn tin nhóm
- Tin nhắn real-time qua STOMP / WebSocket
- Phân trang cursor-based để tải lịch sử tin nhắn
- Hỗ trợ nhiều loại tin nhắn: TEXT, IMAGE, FILE

### 🛡 Kiểm duyệt tự động
- Khi đăng bài / bình luận, hệ thống tạo `ModerationJob`
- `ModerationJobScheduler` lấy các job đang chờ và gọi OpenAI Moderation API
- `ModerationOrchestrator` điều phối quá trình kiểm duyệt
- Nội dung vi phạm sẽ bị từ chối hoặc đưa vào trạng thái chờ xem xét
- Hỗ trợ retry khi dịch vụ ngoài thất bại

### 🧐 Kiểm duyệt thủ công
- Cho phép quản trị viên chỉnh sửa trạng thái bài đăng
- Cho phép quản trị viên kiểm duyệt các bài đăng chưa được AI đánh giá chính xác

### ⚖️ Báo cáo vi phạm và giải quyết báo cáo
- Cho phép người dùng báo cáo đăng bài / bình luận vi phạm các vấn đề đạo đức, xã hội
- Nội dung vi phạm sẽ bị từ chối hoặc bác bỏ báo cáo bởi quản trị viên

### 📁 Quản lý tệp
- Upload ảnh, video lên AWS S3
- Tạo Presigned URL để truy cập file
- Hỗ trợ multipart upload cho file lớn

---

## 📁 Cấu trúc thư mục

```text
root/
├── back-end/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/okayji/
│   │   │   │   ├── OkayjiApplication.java
|   |   |   |   ├── admin/
│   │   │   │   ├── identity/
│   │   │   │   ├── feed/
│   │   │   │   ├── chat/
│   │   │   │   ├── notification/
│   │   │   │   ├── moderation/
|   |   |   |   ├── report/
│   │   │   │   ├── file/
│   │   │   │   ├── config/
│   │   │   │   ├── common/
│   │   │   │   ├── exception/
│   │   │   │   └── mapper/
│   │   │   └── resources/
│   │   │       └── application.yaml
│   │   └── test/
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   └── README.md
│
├── front-end/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
└── README.md
```

---

## 🚀 Hướng dẫn cài đặt và chạy

### 1. Clone dự án

```bash
git clone https://github.com/trantrieuduong/Do-An-NNLTTT.git
cd Do-An-NNLTTT
```

### 2. Khởi tạo cơ sở dữ liệu

```sql
CREATE DATABASE Okayji CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Cấu hình Back-end

Mở file:

```text
back-end/src/main/resources/application.yaml
```

Ví dụ cấu hình:

```yaml
server:
  port: 8686

app:
  ffmpeg:
    path: C:/Program Files/ffmpeg/bin/ffmpeg.exe # based on your device. 
                                                 # If dont have, download at 
                                                 # https://www.ffmpeg.org/download.html
  front-end-domain: "http://localhost:5173,http://localhost:8080"

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/Okayji
    username: ${MYSQL_USERNAME}
    password: ${MYSQL_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update

  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      moderation:
        options:
          model: omni-moderation-latest
      base-url: https://api.openai.com

jwt:
  signerKey: ${JWT_SIGNER_KEY}
  accessTokenTime: 1
  accessTokenTimeWithRemember: 14

aws:
  region: ap-southeast-1
  s3:
    bucket-name: okayji
  credentials:
    access-key: ${AWS_ACCESS_KEY_ID}
    secret-key: ${AWS_SECRET_ACCESS_KEY}

presigned-url:
  expiration-minutes: 10

multipart-url:
  expiration-minutes: 60

file:
  max-size:
    image: 5
    video: 50
    multipart: 512
    other: 50
```

Thiết lập biến môi trường:

```powershell
$env:MYSQL_USERNAME = "root"
$env:MYSQL_PASSWORD = "your_password"
$env:JWT_SIGNER_KEY = "your_secret_key_at_least_32_chars"
$env:OPENAI_API_KEY = "sk-..."
$env:AWS_ACCESS_KEY_ID = "AKIA..."
$env:AWS_SECRET_ACCESS_KEY = "..."
```

### 4. Chạy Back-end

```bash
cd back-end

# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

Hoặc build JAR:

```bash
./mvnw clean package -DskipTests
java -jar target/okayji-social-media-0.0.1-SNAPSHOT.jar
```

Back-end chạy tại:

```text
http://localhost:8686
```

Swagger UI:

```text
http://localhost:8686/swagger-ui/index.html
```

### 5. Cấu hình Front-end kết nối Back-end

Mở file:

```js
// front-end/src/utils/constants.js
export const BASE_URL = 'http://localhost:8686';
```

### 6. Chạy Front-end

Mở terminal mới:

```bash
cd front-end
npm install
npm run dev
```

Front-end chạy tại:

```text
http://localhost:5173
```

### 7. Sample Account

| Username | Password | Role |
|---|---|---|
| admin | 12345678 | ADMIN |
| user1 | 12345678 | USER |
| user2 | 12345678 | USER |
| test01 | 12345678 | USER |
| test02 | 12345678 | USER |
| test03 | 12345678 | USER |
| test04 | 12345678 | USER |
| test05 | 12345678 | USER |

---

## 🔌 Back-end API

Back-end chịu trách nhiệm:

- Xác thực và phân quyền người dùng
- Quản lý bài viết, bình luận, lượt thích, bạn bè
- Gửi / nhận dữ liệu chat và thông báo real-time
- Upload file lên AWS S3
- Kiểm duyệt nội dung bằng AI
- Thống kê hoạt động sử dụng hệ thống
- Kiềm duyệt thủ công bổ trợ
- Cung cấp tài liệu API qua Swagger UI

### Một số nhóm API tiêu biểu

| Nhóm API | Chức năng                                                              |
|---|------------------------------------------------------------------------|
| `/admin` | Xem thống kê vận hành website, giải quyết báo cáo, kiểm duyệt thủ công |
| `/auth` | Đăng ký, đăng nhập, đăng xuất                                          |
| `/users` | Thông tin người dùng, hồ sơ cá nhân                                    |
| `/posts` | Tạo, sửa, xóa, tìm kiếm, xem bài viết                                  |
| `/comments` | Bình luận bài viết                                                     |
| `/friends` | Kết bạn, phản hồi lời mời                                              |
| `/chats` | Hội thoại, tin nhắn                                                    |
| `/notifications` | Danh sách thông báo                                                    |
| `/files` | Upload file, lấy presigned URL                                         |
| `/reports` | Báo cáo bài đăng / bình luận                                           |

---

## 🖥 Front-end Web

Front-end cung cấp giao diện người dùng cho toàn bộ hệ thống.

### Tổ chức front-end

```text
Pages (src/pages/)       → Màn hình cấp route
Components (src/components/) → Thành phần UI tái sử dụng
Context (src/context/)   → State dùng chung toàn ứng dụng
API (src/api/)           → Gọi REST API đến back-end
Utils (src/utils/)       → Hằng số, helper, enum
```

### Luồng gọi API

```text
Page / Component
    → Service trong src/api/
    → apiClient.js
    → REST API của Spring Boot
    → cập nhật state
    → re-render giao diện
```

### State management

- `useState`, `useEffect` cho state cục bộ
- `React Context API` cho state toàn cục như chat, notification
- `localStorage` để lưu JWT token

### Real-time communication

- Chat và notification sử dụng **STOMP over SockJS**
- Kết nối WebSocket được quản lý trong `ChatContext` và `NotificationContext`

---

## 🧱 Nguyên tắc SOLID đã áp dụng

| Nguyên tắc | Áp dụng trong dự án |
|---|---|
| **S** – Single Responsibility | Mỗi class đảm nhận một trách nhiệm riêng biệt |
| **O** – Open/Closed | Dễ mở rộng loại thông báo, chiến lược kiểm duyệt mà không phá code cũ |
| **L** – Liskov Substitution | Các `ServiceImpl` thay thế được cho interface tương ứng |
| **I** – Interface Segregation | Interface được tách nhỏ theo nghiệp vụ |
| **D** – Dependency Inversion | Controller phụ thuộc vào abstraction thay vì implementation |

---

## 🔭 Hướng phát triển thêm

- [ ] OAuth2 Social Login (Google / Facebook)
- [ ] Redis Cache cho feed, user, bạn bè
- [ ] Elasticsearch cho tìm kiếm full-text
- [ ] Kafka / Message Queue cho xử lý bất đồng bộ
- [ ] Docker / Docker Compose
- [ ] CI/CD Pipeline
- [ ] Story / Reel
- [ ] Gợi ý bạn bè bằng AI

---

## 📌 Ghi chú

- Đây là **README tổng** cho toàn bộ hệ thống.
- Nếu cần mô tả sâu hơn, có thể xem thêm:
  - `back-end/README.md`
  - `front-end/README.md`
