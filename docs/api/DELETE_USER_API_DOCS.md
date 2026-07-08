# API Documentation - Delete User Flow

## Tổng quan
Hệ thống xóa tài khoản người dùng với xác thực OTP qua email, bao gồm 2 bước:
1. **Request OTP** - Yêu cầu mã OTP gửi về email
2. **Confirm Delete** - Xác nhận OTP và xóa vĩnh viễn tài khoản

---

## 1. Request Delete OTP

### Endpoint
```
POST /api/v1.0/users/requestDeleteOTP
```

### Authentication
**Required**: Bearer Token (JWT)
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "email": "user@example.com"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ Yes | Email của tài khoản cần xóa |

### Response

#### Success Response (200 OK)
```json
{
  "status": 200,
  "message": "Mã OTP đã được gửi đến email của bạn",
  "message_en": "OTP has been sent to your email",
  "data": {
    "email": "user@example.com"
  }
}
```

#### Error Responses

##### 400 - Email không được cung cấp
```json
{
  "status": 400,
  "message": "Vui lòng nhập email",
  "message_en": "Email is required",
  "err": {
    "code": 400,
    "message": "Email is required"
  }
}
```

##### 404 - Tài khoản không tồn tại
```json
{
  "status": 404,
  "message": "Tài khoản không tồn tại",
  "message_en": "Account not found",
  "err": {
    "code": 404,
    "message": "User not found"
  }
}
```

##### 400 - Tài khoản đã bị xóa trước đó
```json
{
  "status": 400,
  "message": "Tài khoản đã bị xóa",
  "message_en": "Account already deleted",
  "err": {
    "code": 400,
    "message": "Account already deleted"
  }
}
```

##### 401 - Unauthorized
```json
{
  "status": 401,
  "message": "Unauthorized"
}
```

### Example Usage

#### cURL
```bash
curl -X POST https://api.example.com/api/v1.0/users/requestDeleteOTP \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

#### JavaScript (Axios)
```javascript
const axios = require('axios');

const response = await axios.post(
  'https://api.example.com/api/v1.0/users/requestDeleteOTP',
  {
    email: 'user@example.com'
  },
  {
    headers: {
      'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
      'Content-Type': 'application/json'
    }
  }
);

console.log(response.data);
```

#### Python (Requests)
```python
import requests

url = "https://api.example.com/api/v1.0/users/requestDeleteOTP"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
}
payload = {
    "email": "user@example.com"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

### Email Template
Sau khi gọi API thành công, user sẽ nhận được email với nội dung:

**Subject**: `CRM Điện Lạnh - Mã xác nhận Xóa tài khoản`

**Content**:
- Thông báo yêu cầu xóa tài khoản
- Mã OTP 6 số
- Cảnh báo về việc xóa vĩnh viễn
- Hướng dẫn bỏ qua nếu không phải người yêu cầu

### Business Logic
1. Kiểm tra email có được cung cấp không
2. Tìm user theo email trong database
3. Kiểm tra user có tồn tại không
4. Kiểm tra user đã bị xóa chưa (`is_delete = true`)
5. Tạo mã OTP 6 số ngẫu nhiên
6. Lưu OTP vào bảng `user_auth` với `auth_method = 'otp'`
7. Gửi email chứa OTP đến địa chỉ email của user
8. Trả về response thành công

---

## 2. Confirm Delete User

### Endpoint
```
POST /api/v1.0/users/confirmDeleteUser
```

### Authentication
**Required**: Bearer Token (JWT)
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ Yes | Email của tài khoản cần xóa |
| otp | string | ✅ Yes | Mã OTP 6 số nhận được qua email |

### Response

#### Success Response (200 OK)
```json
{
  "status": 200,
  "message": "Xóa tài khoản thành công",
  "message_en": "Account deleted successfully",
  "data": {
    "email": "user@example.com",
    "deleted_at": "2026-07-05T10:30:00.000Z"
  }
}
```

#### Error Responses

##### 400 - Thiếu email hoặc OTP
```json
{
  "status": 400,
  "message": "Vui lòng nhập email và mã OTP",
  "message_en": "Email and OTP are required",
  "err": {
    "code": 400,
    "message": "Email and OTP are required"
  }
}
```

##### 400 - OTP không đúng hoặc đã hết hạn
```json
{
  "status": 400,
  "message": "Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại",
  "message_en": "Invalid or expired OTP. Please try again",
  "err": {
    "code": 400,
    "message": "OTP mismatch for user@example.com"
  }
}
```

##### 400 - Tài khoản đã bị xóa trước đó
```json
{
  "status": 400,
  "message": "Tài khoản đã bị xóa trước đó",
  "message_en": "Account already deleted",
  "err": {
    "code": 400,
    "message": "Account already deleted"
  }
}
```

##### 401 - Unauthorized
```json
{
  "status": 401,
  "message": "Unauthorized"
}
```

### Example Usage

#### cURL
```bash
curl -X POST https://api.example.com/api/v1.0/users/confirmDeleteUser \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

#### JavaScript (Axios)
```javascript
const axios = require('axios');

const response = await axios.post(
  'https://api.example.com/api/v1.0/users/confirmDeleteUser',
  {
    email: 'user@example.com',
    otp: '123456'
  },
  {
    headers: {
      'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
      'Content-Type': 'application/json'
    }
  }
);

console.log(response.data);
```

#### Python (Requests)
```python
import requests

url = "https://api.example.com/api/v1.0/users/confirmDeleteUser"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Content-Type": "application/json"
}
payload = {
    "email": "user@example.com",
    "otp": "123456"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

### Business Logic
1. Kiểm tra email và OTP có được cung cấp không
2. Tìm user theo email và verify OTP trong bảng `user_auth`
3. Kiểm tra OTP có khớp không (join với bảng `user_auth` where `auth_method = 'otp'`)
4. Kiểm tra user đã bị xóa chưa (`is_delete = true`)
5. Xóa record OTP khỏi bảng `user_auth`
6. **Hard delete user** - Xóa vĩnh viễn record user khỏi database (`user.destroy()`)
7. Trả về response thành công với timestamp xóa

---

## Complete Flow Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /requestDeleteOTP
       │    { email: "user@example.com" }
       │    Authorization: Bearer <token>
       ▼
┌─────────────────┐
│   API Server    │
├─────────────────┤
│ - Verify token  │
│ - Check user    │
│ - Generate OTP  │
│ - Save to DB    │
└──────┬──────────┘
       │
       │ 2. Send email with OTP
       ▼
┌─────────────────┐
│  Email Service  │
│  OTP: 123456    │
└─────────────────┘
       │
       │ 3. User receives OTP
       ▼
┌─────────────┐
│    User     │
│  Gets OTP   │
└──────┬──────┘
       │
       │ 4. POST /confirmDeleteUser
       │    { email: "user@example.com", otp: "123456" }
       │    Authorization: Bearer <token>
       ▼
┌─────────────────┐
│   API Server    │
├─────────────────┤
│ - Verify token  │
│ - Verify OTP    │
│ - Delete OTP    │
│ - DELETE USER   │← HARD DELETE
└──────┬──────────┘
       │
       │ 5. Success response
       ▼
┌─────────────┐
│   Client    │
│  Deleted ✓  │
└─────────────┘
```

---

## Security Considerations

### 🔒 Authentication
- Cả 2 API đều yêu cầu JWT Bearer token hợp lệ
- Token phải được gửi trong header `Authorization: Bearer <token>`

### 🔑 OTP Security
- OTP có độ dài 6 ký tự số
- OTP được lưu trong database với `auth_method = 'otp'`
- OTP tự động bị xóa sau khi verify thành công
- Mỗi lần request OTP mới sẽ override OTP cũ

### ⚠️ Hard Delete Warning
- API `confirmDeleteUser` thực hiện **HARD DELETE**
- User record sẽ bị xóa vĩnh viễn khỏi database
- Không thể khôi phục sau khi xóa
- Email cảnh báo rõ ràng về việc này

### 🛡️ Validation
- Kiểm tra email format
- Kiểm tra user tồn tại trước khi gửi OTP
- Kiểm tra user chưa bị xóa (`is_delete = false`)
- Verify OTP chính xác trước khi xóa

---

## Error Handling

### Common Error Codes

| Status Code | Description | Solution |
|-------------|-------------|----------|
| 400 | Bad Request - Thiếu hoặc sai tham số | Kiểm tra lại request body |
| 401 | Unauthorized - Token không hợp lệ | Đăng nhập lại để lấy token mới |
| 404 | Not Found - User không tồn tại | Kiểm tra lại email |
| 500 | Internal Server Error | Liên hệ support |

### Retry Logic
- Nếu OTP không đúng, user có thể gọi lại API `/requestDeleteOTP` để nhận OTP mới
- OTP cũ sẽ bị override bởi OTP mới
- Không giới hạn số lần request OTP

---

## Testing

### Test Cases

#### Test Case 1: Request OTP thành công
```
Input:
- Valid Bearer token
- Valid email: "test@example.com"

Expected:
- Status: 200
- Email được gửi
- OTP được lưu vào DB
```

#### Test Case 2: Request OTP với email không tồn tại
```
Input:
- Valid Bearer token
- Email: "notexist@example.com"

Expected:
- Status: 404
- Message: "Tài khoản không tồn tại"
```

#### Test Case 3: Confirm delete với OTP đúng
```
Input:
- Valid Bearer token
- Email: "test@example.com"
- OTP: "123456" (correct)

Expected:
- Status: 200
- User được xóa khỏi DB
- OTP được xóa khỏi DB
```

#### Test Case 4: Confirm delete với OTP sai
```
Input:
- Valid Bearer token
- Email: "test@example.com"
- OTP: "999999" (incorrect)

Expected:
- Status: 400
- Message: "Mã OTP không đúng hoặc đã hết hạn"
- User vẫn tồn tại
```

#### Test Case 5: Request OTP không có token
```
Input:
- No Bearer token
- Email: "test@example.com"

Expected:
- Status: 401
- Message: "Unauthorized"
```

---

## Database Changes

### Tables Affected

#### `user` table
- **Operation**: DELETE (hard delete)
- **Trigger**: After OTP verification in `confirmDeleteUser`
- **Impact**: Record bị xóa vĩnh viễn

#### `user_auth` table
- **Operation**: INSERT (when creating OTP) + DELETE (after verification)
- **Fields**:
  - `user_id`: UUID of user
  - `auth_key`: OTP code (6 digits)
  - `auth_method`: 'otp'
  - `created_at`: Timestamp

---

## Rate Limiting (Recommended)

Khuyến nghị implement rate limiting để tránh spam:

```
/requestDeleteOTP:
  - Max 3 requests per 5 minutes per user
  - Max 10 requests per hour per IP

/confirmDeleteUser:
  - Max 5 failed attempts per 10 minutes
  - Lock account after 10 consecutive failures
```

---

## Monitoring & Logging

### Logs to Track
- OTP generation events
- OTP verification attempts (success/failure)
- User deletion events
- Email sending status

### Metrics to Monitor
- OTP request rate
- OTP verification success rate
- Average time between OTP request and verification
- Failed OTP attempts per user

---

## Support & Contact

Nếu có vấn đề hoặc câu hỏi về API, vui lòng liên hệ:
- Email: support@example.com
- Slack: #api-support
- Documentation: https://docs.example.com

---

**Last Updated**: 2026-07-05  
**Version**: 1.0.0  
**Author**: Development Team
