# DESIGN SYSTEM COMMUNITY / CRM — TECHX BLUE

## 1. Tổng quan

Bộ design system này được xây dựng theo định hướng thương hiệu **TechX**: hiện đại, công nghệ, tốc độ, rõ ràng và chuyên nghiệp.

Logo TechX sử dụng nền navy đậm, chữ trắng bạc, điểm nhấn xanh dương điện và cyan glow. Vì vậy màu chủ đạo nên là **Electric Blue / Tech Blue**, kết hợp với nền navy và các màu cyan bổ trợ.

---

## 2. Brand Direction

### Tính cách thương hiệu

- Hiện đại
- Công nghệ
- Tin cậy
- Nhanh gọn
- Rõ ràng
- Chuyên nghiệp

### Không nên dùng

- Không dùng tím làm màu chủ đạo vì không đồng bộ với logo TechX.
- Không dùng xanh lá làm màu brand chính vì logo thiên về xanh dương/cyan.
- Không dùng nền tối toàn bộ mobile app nếu không cần thiết, vì dễ gây nặng mắt.

---

## 3. Color Palette

## 3.1. Brand Colors

| Token | Tên màu | Hex | Cách dùng |
|---|---|---:|---|
| `--primary` | Electric Blue | `#0C9CEC` | CTA chính, tab active, bottom nav active, link, icon active |
| `--primary-hover` | Strong Blue | `#0B5ED6` | Hover, pressed state, gradient |
| `--primary-active` | Deep Blue | `#0847A6` | Active mạnh, selected state |
| `--primary-light` | Blue Light | `#DFF6FF` | Badge, chip selected nhẹ, icon background |
| `--primary-soft` | Blue Soft | `#F0FAFF` | Background nhẹ, empty state |

```css
:root {
  --primary: #0C9CEC;
  --primary-hover: #0B5ED6;
  --primary-active: #0847A6;
  --primary-light: #DFF6FF;
  --primary-soft: #F0FAFF;
}
```

---

## 3.2. Dark Brand Colors

| Token | Tên màu | Hex | Cách dùng |
|---|---|---:|---|
| `--brand-navy` | Tech Navy | `#0A1224` | Sidebar, login background, splash screen |
| `--brand-navy-2` | Deep Navy Blue | `#0E2953` | Gradient, dark card, header dark |
| `--brand-navy-3` | Royal Tech Blue | `#123E80` | Highlight trên nền tối |

```css
:root {
  --brand-navy: #0A1224;
  --brand-navy-2: #0E2953;
  --brand-navy-3: #123E80;
}
```

---

## 3.3. Accent Colors

| Token | Tên màu | Hex | Cách dùng |
|---|---|---:|---|
| `--cyan` | Cyan Glow | `#44CCF5` | Accent, line highlight, icon phụ |
| `--cyan-light` | Cyan Light | `#E0F7FF` | Nền badge cyan, empty state |
| `--sky-blue` | Sky Tech | `#87EBF8` | Highlight nhẹ, illustration |
| `--sky-blue-light` | Sky Light | `#ECFEFF` | Background nhẹ |

```css
:root {
  --cyan: #44CCF5;
  --cyan-light: #E0F7FF;
  --sky-blue: #87EBF8;
  --sky-blue-light: #ECFEFF;
}
```

---

## 3.4. Layout Colors

| Token | Tên màu | Hex | Cách dùng |
|---|---|---:|---|
| `--background` | App Background | `#F6FAFF` | Nền chính web/mobile |
| `--surface` | Surface | `#FFFFFF` | Card, modal, sheet |
| `--border` | Border | `#DDE7F2` | Border card/input/table |
| `--divider` | Divider | `#EAF0F7` | Đường chia nhẹ |

```css
:root {
  --background: #F6FAFF;
  --surface: #FFFFFF;
  --border: #DDE7F2;
  --divider: #EAF0F7;
}
```

---

## 3.5. Text Colors

| Token | Tên màu | Hex | Cách dùng |
|---|---|---:|---|
| `--text-primary` | Main Text | `#0F172A` | Tiêu đề, nội dung chính |
| `--text-secondary` | Secondary Text | `#64748B` | Mô tả, subtitle |
| `--text-muted` | Muted Text | `#94A3B8` | Placeholder, metadata |
| `--text-disabled` | Disabled Text | `#CBD5E1` | Disabled state |
| `--text-inverse` | White Text | `#FFFFFF` | Text trên nền xanh/navy |

```css
:root {
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --text-muted: #94A3B8;
  --text-disabled: #CBD5E1;
  --text-inverse: #FFFFFF;
}
```

---

## 3.6. Status Colors

| Token | Hex | Ý nghĩa |
|---|---:|---|
| `--success` | `#10B981` | Thành công, đã nhận, hoàn thành |
| `--success-light` | `#D1FAE5` | Nền badge thành công |
| `--warning` | `#F59E0B` | Cảnh báo, chờ xử lý |
| `--warning-light` | `#FEF3C7` | Nền badge cảnh báo |
| `--danger` | `#EF4444` | Lỗi, xoá, quan trọng |
| `--danger-light` | `#FEE2E2` | Nền badge lỗi |
| `--info` | `#0C9CEC` | Thông tin, quy trình, trạng thái gửi |
| `--info-light` | `#DFF6FF` | Nền badge thông tin |
| `--purple` | `#6366F1` | Ghim, role đặc biệt |
| `--purple-light` | `#EDE9FE` | Nền badge tím |

```css
:root {
  --success: #10B981;
  --success-light: #D1FAE5;

  --warning: #F59E0B;
  --warning-light: #FEF3C7;

  --danger: #EF4444;
  --danger-light: #FEE2E2;

  --info: #0C9CEC;
  --info-light: #DFF6FF;

  --purple: #6366F1;
  --purple-light: #EDE9FE;
}
```

---

# 4. Semantic Usage

## 4.1. Web Admin

| Thành phần | Màu đề xuất |
|---|---:|
| Sidebar background | `#0A1224` |
| Sidebar active | Gradient `#0B5ED6 → #44CCF5` |
| Main background | `#F6FAFF` |
| Card background | `#FFFFFF` |
| Primary button | `#0C9CEC` |
| Primary button hover | `#0B5ED6` |
| Border | `#DDE7F2` |
| Table header | `#F6FAFF` |
| Link | `#0C9CEC` |

### Sidebar active style

```css
.sidebar-item.active {
  color: #FFFFFF;
  background: linear-gradient(135deg, #0B5ED6 0%, #44CCF5 100%);
  box-shadow: 0 8px 20px rgba(12, 156, 236, 0.24);
}
```

---

## 4.2. Mobile App

| Thành phần | Màu đề xuất |
|---|---:|
| Header gradient | `#0B5ED6 → #0C9CEC → #44CCF5` |
| Bottom nav active | `#0C9CEC` |
| FAB button | `#0C9CEC` |
| Card background | `#FFFFFF` |
| Screen background | `#F6FAFF` |
| Active tab | `#0C9CEC` |
| Input focus | `#0C9CEC` |

### Mobile header gradient

```css
.mobile-header {
  background: linear-gradient(135deg, #0B5ED6 0%, #0C9CEC 55%, #44CCF5 100%);
  color: #FFFFFF;
}
```

---

## 4.3. Community / Tin nội bộ

| Loại | Text | Background |
|---|---:|---:|
| Quy trình | `#0B5ED6` | `#DFF6FF` |
| Thông báo | `#10B981` | `#D1FAE5` |
| Chính sách | `#F59E0B` | `#FEF3C7` |
| Quan trọng | `#EF4444` | `#FEE2E2` |
| Đã ghim | `#0C9CEC` | `#DFF6FF` |
| Đào tạo | `#6366F1` | `#EDE9FE` |

```css
.badge-process {
  color: #0B5ED6;
  background: #DFF6FF;
}

.badge-announcement {
  color: #10B981;
  background: #D1FAE5;
}

.badge-policy {
  color: #F59E0B;
  background: #FEF3C7;
}

.badge-important {
  color: #EF4444;
  background: #FEE2E2;
}

.badge-pinned {
  color: #0C9CEC;
  background: #DFF6FF;
}
```

---

# 5. Typography

## 5.1. Font chính

Khuyến nghị dùng:

```css
font-family: "Be Vietnam Pro", "Inter", sans-serif;
```

Lý do:

- Hỗ trợ tiếng Việt tốt.
- Phù hợp app nội bộ và CRM.
- Dễ đọc trên mobile.
- Cảm giác hiện đại, gần gũi hơn font quá kỹ thuật.

---

## 5.2. Font Scale — Mobile

| Token | Size | Weight | Use case |
|---|---:|---:|---|
| `display` | 32px | 700 | Header profile, splash |
| `h1` | 24px | 700 | Page title |
| `h2` | 20px | 700 | Section title lớn |
| `h3` | 18px | 600 | Card title |
| `body` | 16px | 400/500 | Nội dung chính |
| `body-sm` | 14px | 400/500 | Metadata, mô tả |
| `caption` | 12px | 400/500 | Time, badge nhỏ |
| `button` | 15px | 600 | Button, CTA |

```css
:root {
  --font-main: "Be Vietnam Pro", "Inter", sans-serif;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
}
```

---

## 5.3. Font Scale — Web Admin

| Thành phần | Size | Weight |
|---|---:|---:|
| Page title | 24–28px | 700 |
| Section title | 18px | 600 |
| Card title | 16px | 600 |
| Body | 14–15px | 400/500 |
| Table header | 13px | 600 |
| Table body | 14px | 400/500 |
| Button | 14px | 600 |
| Badge | 12px | 600 |

---

# 6. Spacing

## 6.1. Spacing Scale

| Token | Value |
|---|---:|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

---

# 7. Radius

| Token | Value | Use case |
|---|---:|---|
| `--radius-sm` | 8px | Badge, small input |
| `--radius-md` | 12px | Button, chip |
| `--radius-lg` | 16px | Card nhỏ |
| `--radius-xl` | 20px | Card mobile |
| `--radius-2xl` | 24px | Bottom sheet, large card |
| `--radius-full` | 999px | Avatar, pill, chip |

```css
:root {
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 999px;
}
```

---

# 8. Shadow

| Token | Value | Use case |
|---|---|---|
| `--shadow-sm` | `0 2px 8px rgba(15, 23, 42, 0.06)` | Input, chip |
| `--shadow-md` | `0 8px 24px rgba(15, 23, 42, 0.08)` | Card |
| `--shadow-lg` | `0 16px 40px rgba(15, 23, 42, 0.12)` | Modal, bottom nav |
| `--shadow-blue` | `0 12px 28px rgba(12, 156, 236, 0.28)` | Primary button, FAB |

```css
:root {
  --shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 16px 40px rgba(15, 23, 42, 0.12);
  --shadow-blue: 0 12px 28px rgba(12, 156, 236, 0.28);
}
```

---

# 9. Components

## 9.1. Button

### Primary Button

```css
.btn-primary {
  background: #0C9CEC;
  color: #FFFFFF;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 12px 28px rgba(12, 156, 236, 0.28);
}

.btn-primary:hover {
  background: #0B5ED6;
}
```

### Secondary Button

```css
.btn-secondary {
  background: #FFFFFF;
  color: #0C9CEC;
  border: 1px solid #DDE7F2;
  border-radius: 12px;
  font-weight: 600;
}
```

### Danger Button

```css
.btn-danger {
  background: #EF4444;
  color: #FFFFFF;
  border-radius: 12px;
  font-weight: 600;
}
```

---

## 9.2. Badge / Chip

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
```

### Selected chip

```css
.chip-active {
  color: #FFFFFF;
  background: #0C9CEC;
}

.chip-inactive {
  color: #64748B;
  background: #FFFFFF;
  border: 1px solid #DDE7F2;
}
```

---

## 9.3. Card

```css
.card {
  background: #FFFFFF;
  border: 1px solid #DDE7F2;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}
```

---

## 9.4. Input

```css
.input {
  background: #FFFFFF;
  border: 1px solid #DDE7F2;
  border-radius: 14px;
  color: #0F172A;
}

.input::placeholder {
  color: #94A3B8;
}

.input:focus {
  border-color: #0C9CEC;
  box-shadow: 0 0 0 3px rgba(12, 156, 236, 0.14);
}
```

---

# 10. Avatar System

Avatar mặc định nên dùng nền pastel xanh/cyan/tím nhẹ, chữ rõ ràng.

| Type | Background | Text |
|---|---:|---:|
| Blue | `#DFF6FF` | `#0B5ED6` |
| Cyan | `#E0F7FF` | `#0891B2` |
| Navy | `#DBEAFE` | `#1D4ED8` |
| Green | `#D1FAE5` | `#059669` |
| Orange | `#FEF3C7` | `#D97706` |
| Purple | `#EDE9FE` | `#6366F1` |

```css
.avatar-blue {
  background: #DFF6FF;
  color: #0B5ED6;
}
```

---

# 11. Layout Rules

## 11.1. Mobile

- Header không nên chiếm quá 35–40% chiều cao màn hình.
- Bottom navigation cần `padding-bottom` cho content tối thiểu 96–120px.
- Card nên dùng radius 20–24px.
- Danh sách nên có khoảng cách card 12–16px.
- FAB nên đặt trên bottom navigation, không che nội dung.

```css
.mobile-screen-content {
  padding-bottom: 120px;
}
```

---

## 11.2. Web Admin

- Sidebar dùng navy đậm.
- Active menu dùng primary hoặc gradient.
- Main content max-width có thể từ 1440px đến 1600px.
- Table cần sticky header nếu dữ liệu dài.
- Các thao tác nguy hiểm nên đưa vào menu `...`, không show đỏ trực tiếp ở từng dòng nếu không cần.

---

# 12. Recommended UI Mapping

## 12.1. Community Feed

| Thành phần | Style |
|---|---|
| Background | `#F6FAFF` |
| Card | White + border `#DDE7F2` |
| Tab active | `#0C9CEC` |
| Badge ghim | `#DFF6FF` + text `#0C9CEC` |
| Badge quan trọng | `#FEE2E2` + text `#EF4444` |
| FAB tạo tin | `#0C9CEC` |
| Bottom nav active | `#0C9CEC` |

---

## 12.2. Customer Detail Mobile

| Thành phần | Style |
|---|---|
| Header gradient | `#0B5ED6 → #0C9CEC → #44CCF5` |
| Avatar border | White 2–3px |
| Action button | White surface, icon theo status |
| Stats card | White, shadow-md |
| Active tab | `#0C9CEC` |

---

## 12.3. Web Sidebar

| Thành phần | Style |
|---|---|
| Background | `#0A1224` |
| Group title | `#87EBF8` opacity 70% |
| Item text | `#DDE7F2` |
| Item active | Gradient blue/cyan |
| Logout | Bottom fixed |

---

# 13. Final Token CSS

```css
:root {
  /* Brand */
  --primary: #0C9CEC;
  --primary-hover: #0B5ED6;
  --primary-active: #0847A6;
  --primary-light: #DFF6FF;
  --primary-soft: #F0FAFF;

  /* Dark Brand */
  --brand-navy: #0A1224;
  --brand-navy-2: #0E2953;
  --brand-navy-3: #123E80;

  /* Accent */
  --cyan: #44CCF5;
  --cyan-light: #E0F7FF;
  --sky-blue: #87EBF8;
  --sky-blue-light: #ECFEFF;

  /* Layout */
  --background: #F6FAFF;
  --surface: #FFFFFF;
  --border: #DDE7F2;
  --divider: #EAF0F7;

  /* Text */
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --text-muted: #94A3B8;
  --text-disabled: #CBD5E1;
  --text-inverse: #FFFFFF;

  /* Status */
  --success: #10B981;
  --success-light: #D1FAE5;
  --warning: #F59E0B;
  --warning-light: #FEF3C7;
  --danger: #EF4444;
  --danger-light: #FEE2E2;
  --info: #0C9CEC;
  --info-light: #DFF6FF;
  --purple: #6366F1;
  --purple-light: #EDE9FE;

  /* Typography */
  --font-main: "Be Vietnam Pro", "Inter", sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 999px;

  /* Shadow */
  --shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.06);
  --shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 16px 40px rgba(15, 23, 42, 0.12);
  --shadow-blue: 0 12px 28px rgba(12, 156, 236, 0.28);
}
```

---

# 14. Kết luận

Bộ màu và design system này phù hợp với logo **TechX** vì giữ được tinh thần:

- Xanh dương công nghệ
- Cyan glow hiện đại
- Nền navy mạnh mẽ
- UI sáng, sạch, dễ dùng
- Phù hợp cả web admin và mobile app

Bộ màu khuyến nghị cuối cùng:

```text
Primary: #0C9CEC
Accent: #44CCF5
Dark Brand: #0A1224
App Background: #F6FAFF
Text Primary: #0F172A
Font: Be Vietnam Pro
```
