# 🌐  Mạng Xã Hội Okayji

> Giao diện người dùng của mạng xã hội **OkayJi**, xây dựng bằng **ReactJS + Vite**, kết nối REST API và WebSocket với back-end Spring Boot.

---

## 📋 Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc front-end](#-kiến-trúc-front-end)
- [Tính năng chính](#-tính-năng-chính)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt và chạy dự án](#-cài-đặt-và-chạy-dự-án)
- [Kết nối với Back-End](#-kết-nối-với-back-end)

---

## 📖 Giới Thiệu

> **Okayji** là một nền tảng mạng xã hội hiện đại, nơi người dùng có thể kết nối, chia sẻ bài viết, trò chuyện trực tiếp và tương tác cùng cộng đồng. Hệ thống tích hợp kiểm duyệt nội dung tự động bằng AI nhằm đảm bảo môi trường lành mạnh và an toàn.

---

## 🛠 Công Nghệ Sử Dụng

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| [React](https://react.dev/) | ^19.2.0 | Thư viện xây dựng giao diện người dùng |
| [Vite](https://vitejs.dev/) | ^7.2.4 | Build tool & dev server |
| [React Router DOM](https://reactrouter.com/) | ^7.13.0 | Quản lý điều hướng phía client (SPA) |
| [Axios](https://axios-http.com/) | ^1.13.5 | HTTP client gọi REST API |
| [@stomp/stompjs](https://stomp-js.github.io/) | ^7.3.0 | Giao tiếp WebSocket (STOMP protocol) |
| [SockJS Client](https://github.com/sockjs/sockjs-client) | ^1.6.1 | Fallback WebSocket cho STOMP |
| [Lucide React](https://lucide.dev/) | ^0.563.0 | Bộ icon hiện đại |
| [React Hot Toast](https://react-hot-toast.com/) | ^2.6.0 | Thông báo toast (snackbar) |
| ESLint | ^9.39.1 | Kiểm tra chất lượng mã nguồn |
| JavaScript (ES Module) | ES2020+ | Ngôn ngữ lập trình chính |
| CSS | — | Tạo kiểu giao diện |

---

## 🏗 Kiến Trúc Front-End

### Tổ Chức Component

Ứng dụng được tổ chức theo mô hình **Pages + Components**, tách biệt rõ ràng giữa trang (page) và các thành phần tái sử dụng (component):

```
Pages (src/pages/)                    ← Màn hình cấp cao (route-level)
    └── Components (src/components/)  ← UI tái sử dụng, nhúng vào pages
```

### Quản Lý State

| Phương thức | Phạm vi | Ví dụ |
|---|---|---|
| `useState` / `useEffect` | State cục bộ trong component | Form đăng nhập, danh sách bài viết |
| **React Context API** | State chia sẻ toàn ứng dụng | `ChatContext`, `NotificationContext` |
| `localStorage` | Lưu trữ phiên người dùng | JWT token (`token`) |

### Luồng Gọi API

```
Component / Page
    │
    ├── Gọi Service (src/api/*Service.js)
    │       │
    │       └── Gọi apiClient (src/api/apiClient.js)  ← Tự động đính kèm JWT
    │               │
    │               └── fetch() → Back-End REST API (http://localhost:8686)
    │
    └── Cập nhật State → Re-render UI
```

> **`apiClient.js`** là lớp trung gian duy nhất thực hiện HTTP request. Nó tự động:
> - Đọc JWT token từ `localStorage` và đính kèm vào header `Authorization: Bearer <token>`
> - Xử lý lỗi 403 (token hết hạn): xóa token và điều hướng về `/login`

### Giao Tiếp Real-Time (WebSocket)

Tính năng chat sử dụng **STOMP over SockJS** để nhận/gửi tin nhắn theo thời gian thực. Kết nối WebSocket được quản lý trong `ChatContext`.

---

## ✨ Tính Năng Chính

| Màn hình                   | Mô tả                                                     |
|----------------------------|-----------------------------------------------------------|
| 🔐 **Đăng ký / Đăng nhập** | Tạo tài khoản, xác thực, lưu JWT token                    |
| 🏠 **Trang chủ (News Feed)** | Xem bảng tin bài viết, tạo bài viết mới                   |
| 📝 **Chi tiết bài viết**   | Xem bài viết đầy đủ, bình luận, thích, chia sẻ            |
| 👤 **Trang cá nhân**       | Xem và chỉnh sửa thông tin hồ sơ, danh sách bài viết      |
| 👥 **Bạn bè**              | Gửi/chấp nhận/hủy lời mời kết bạn, xem danh sách bạn bè   |
| 💬 **Nhắn tin**            | Chat cá nhân và nhóm theo thời gian thực qua WebSocket    |
| 🔔 **Thông báo**           | Nhận thông báo real-time (kết bạn, lượt thích, bình luận) |
| ⚖️ **Báo cáo**             | Báo cáo bài viết, bình luận, người dùng vi phạm           |
| 🔒 **Bảo mật**             | Đổi mật khẩu, quản lý bảo mật tài khoản                   |

---

## 📁 Cấu Trúc Thư Mục

```
front-end/
├── public/                             # Tài nguyên tĩnh công khai (favicon, ảnh...)
├── src/
│   ├── api/                            # Lớp giao tiếp với back-end
|   |   ├── adminService.js             # API lấy số liệu thống kê dashboard, lấy bài đăng để kiểm duyệt, cập nhật trạng thái bài đăng
│   │   ├── apiClient.js                # HTTP client lõi (tự động gán JWT, xử lý lỗi)
│   │   ├── authService.js              # API đăng ký, đăng nhập, đăng xuất
│   │   ├── chatService.js              # API lấy hội thoại, tin nhắn (có cursor pagination)
│   │   ├── feedService.js              # API bài viết: tạo, lấy feed, thích, bình luận, tìm post
│   │   ├── fileService.js              # API upload ảnh / tệp đính kèm
│   │   ├── friendService.js            # API quản lý bạn bè
│   │   ├── notificationService.js      # API thông báo
│   │   ├── reportService.js            # API báo cáo vi phạm và xử lý báo cáo vi phạm (bài đăng, bình luận, người dùng)
│   │   └── userService.js              # API thông tin người dùng
│   │
│   ├── components/                     # Components UI tái sử dụng
│   │   ├── chat/                       # Components liên quan đến chat
│   │   │   ├── ChatMessage.jsx         # Hiển thị một tin nhắn đơn lẻ
│   │   │   ├── ChatSidebar.jsx         # Danh sách hội thoại bên trái
│   │   │   ├── ChatWindow.jsx          # Cửa sổ nhắn tin chính
│   │   │   ├── CreateGroupModal.jsx    # Modal tạo nhóm chat
│   │   │   ├── GroupInfoModal.jsx      # Modal thông tin nhóm
│   │   │   └── MessageInput.jsx        # Ô nhập tin nhắn
│   │   ├── common/                     # Components dùng chung toàn ứng dụng
│   │   │   ├── ConfirmModal.jsx        # Hộp thoại xác nhận hành động
│   │   │   └── ImageUploader.jsx       # Component upload ảnh
│   │   ├── notification/               # Components thông báo
│   │   │   └── NotificationPanel.jsx   # Bảng thông báo dropdown
│   │   ├── CreatePost.jsx              # Form tạo bài viết mới
│   │   ├── MainLayout.jsx              # Layout bố cục chung (sidebar + nội dung)
│   │   ├── PostCard.jsx                # Card hiển thị bài viết trong feed
│   │   └── Sidebar.jsx                 # Thanh điều hướng bên trái
│   │
│   ├── context/                        # React Context – State toàn cục
│   │   ├── ChatContext.jsx             # Quản lý kết nối WebSocket, tin nhắn
│   │   └── NotificationContext.jsx     # Quản lý thông báo real-time
│   │
│   ├── pages/                          # Các màn hình / trang (route-level)
│   │   ├── AdminDashboard.jsx          # Trang dashboard admin
│   │   ├── Chat.jsx                    # Trang nhắn tin
│   │   ├── Friends.jsx                 # Trang quản lý bạn bè
│   │   ├── Home.jsx                    # Trang chủ (news feed)
│   │   ├── Login.jsx                   # Trang đăng nhập
│   │   ├── PostDetail.jsx              # Trang chi tiết bài viết
│   │   ├── Profile.jsx                 # Trang cá nhân người dùng
│   │   ├── Register.jsx                # Trang đăng ký tài khoản
│   │   ├── ReportManagement.jsx        # Trang quản lý báo cáo vi phạm
│   │   ├── UserManagement.jsx          # Trang quản lý người dùng
│   │   └── Security.jsx                # Trang bảo mật tài khoản
│   │
│   ├── styles/                         # File CSS toàn cục và theo module
│   ├── utils/                          # Hàm tiện ích & hằng số
│   │   ├── constants.js                # Hằng số: BASE_URL, DEFAULT_AVATAR
│   │   └── enums.js                    # Enum dùng chung (trạng thái, loại, v.v.)
│   │
│   ├── App.css                         # CSS cho App component
│   ├── App.jsx                         # Component gốc: khai báo routes
│   ├── index.css                       # CSS reset & style toàn cục
│   └── main.jsx                        # Entry point: render App vào DOM
│
├── index.html                          # HTML template gốc (Vite entry)
├── vite.config.js                      # Cấu hình Vite (plugin, port, proxy...)
├── eslint.config.js                    # Cấu hình ESLint
├── package.json                        # Thông tin dự án & danh sách dependencies
└── package-lock.json                   # Lock file phiên bản dependencies
```

---

## 🚀 Cài Đặt Và Chạy Dự Án

### Yêu Cầu Môi Trường

| Công cụ | Phiên bản tối thiểu |
|---|---|
| [Node.js](https://nodejs.org/) | >= 18.x |
| npm | >= 9.x (đi kèm với Node.js) |

> Kiểm tra phiên bản hiện tại: `node -v` và `npm -v`

---

### Bước 1 — Cài đặt dependencies

```bash
npm install
```

### Bước 2 — Cấu hình URL Back-End API

Mở file `src/utils/constants.js` và cập nhật `BASE_URL` trỏ đến địa chỉ back-end:

```js
// src/utils/constants.js
export const BASE_URL = 'http://localhost:8686'; // Thay đổi nếu back-end chạy ở port/host khác
```

> **Lưu ý:** Mặc định back-end Spring Boot chạy tại `http://localhost:8686`.

### Bước 3 — Chạy môi trường phát triển

```bash
npm run dev
```

Ứng dụng sẽ khởi động tại: **http://localhost:5173**

_(Vite sẽ tự động reload khi thay đổi mã nguồn)_

### Bước 4 — Build production

```bash
npm run build
```

Kết quả build được tạo trong thư mục `dist/`, sẵn sàng để deploy.

```bash
# Xem trước bản build production
npm run preview
```

### Các Lệnh Khác

```bash
# Kiểm tra lỗi ESLint
npm run lint
```

---