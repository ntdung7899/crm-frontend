# Automation Module — AI Prompt for Frontend

## 🤖 System Prompt (dán vào đầu cuộc trò chuyện với AI)

```
Bạn là senior frontend developer chuyên React + TypeScript.
Nhiệm vụ: xây dựng module Automation (workflow builder dạng flowchart) cho CRM web app.

Tech stack bắt buộc:
- React 18 + TypeScript (strict)
- React Flow (@xyflow/react) để vẽ flowchart canvas
- shadcn/ui + Tailwind CSS cho UI components
- Axios hoặc fetch để gọi API (base URL: /api/v1.0, header: Authorization: Bearer <token>)
- React Query (TanStack Query) để cache & quản lý server state

Nguyên tắc khi viết code:
- Tách file rõ ràng: api/ hooks/ components/ types/
- Không dùng any trừ khi bất khả kháng — định nghĩa type/interface đầy đủ
- Mỗi component chỉ làm 1 việc, dài tối đa ~150 dòng
- Custom hooks cho mọi logic gọi API và state phức tạp
- Validation bằng zod hoặc tự viết trước khi gọi API

Toàn bộ API spec, data model, business rules và ví dụ nằm bên dưới.
Hãy đọc kỹ trước khi sinh code, hỏi lại nếu chưa rõ requirement.
```

---

## Tổng quan

Module **Automation** cho phép người dùng tạo workflow chăm sóc khách hàng (Zalo OA) dạng flowchart: kéo-thả node → nối edge → lưu/kích hoạt.

- **Base URL:** `/api/v1.0`
- **Auth:** `Authorization: Bearer <token>` — tất cả endpoints đều yêu cầu

---

## 1. Data Models

### Automation (header)

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "trigger_name": "string",
  "status": "draft | active | paused",
  "run_count": 0,
  "success_count": 0,
  "failed_count": 0,
  "success_rate": 0.0,
  "created_by_name": "string",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Node

```json
{
  "id": "uuid",
  "automation_id": "uuid",
  "node_type": "trigger | condition | action | delay | end",
  "name": "string",
  "description": "string | null",
  "trigger_type": "string | null",
  "action_type": "string | null",
  "delay_value": 5,
  "delay_unit": "minute | hour | day | week",
  "config": {},
  "position_x": 100.0,
  "position_y": 200.0,
  "sort_order": 0,
  "is_active": true
}
```

### Edge

```json
{
  "id": "uuid",
  "source_node_id": "uuid",
  "target_node_id": "uuid",
  "condition_result": "default | true | false | null"
}
```

---

## 2. Node Types & Config

| node_type   | Mô tả                          | Fields bắt buộc thêm                           |
|-------------|--------------------------------|------------------------------------------------|
| `trigger`   | Node đầu tiên, khởi động flow  | `trigger_type`                                 |
| `condition` | Rẽ nhánh true / false          | `config.condition` (ConditionGroup)            |
| `action`    | Thực thi hành động             | `action_type` + `config`                       |
| `delay`     | Chờ X thời gian rồi tiếp tục  | `delay_value` (number > 0), `delay_unit`       |
| `end`       | Kết thúc workflow              | không cần thêm                                 |

### trigger_type hỗ trợ

| Giá trị            | Ý nghĩa                    |
|--------------------|----------------------------|
| `customer_created` | Khách hàng mới được tạo    |
| `zalo_follow`      | Khách hàng follow OA       |
| `zalo_message`     | Khách hàng gửi tin nhắn    |

### Condition config

```json
{
  "condition": {
    "operator": "AND",
    "rules": [
      { "field": "payload.customer.name", "op": "contains", "value": "Nguyễn" },
      { "field": "payload.customer.phone", "op": "exists" }
    ]
  }
}
```

**Operators hỗ trợ cho `rules[].op`:**
`eq` · `neq` · `contains` · `not_contains` · `gt` · `gte` · `lt` · `lte` · `exists` · `not_exists`

**Nested group (lồng nhau):**
```json
{
  "condition": {
    "operator": "OR",
    "rules": [
      { "field": "payload.customer.name", "op": "contains", "value": "Nguyễn" },
      {
        "operator": "AND",
        "rules": [
          { "field": "payload.customer.age", "op": "gte", "value": 18 },
          { "field": "payload.customer.city", "op": "eq", "value": "HCM" }
        ]
      }
    ]
  }
}
```

### Action config — `send_zalo_message`

```json
{
  "action_type": "send_zalo_message",
  "config": {
    "message_type": "text | template | image",
    "text": "Xin chào {{customer.name}}!",
    "template_id": "zns-template-id",
    "image_url": "https://..."
  }
}
```

### Action config — `create_task`

```json
{
  "action_type": "create_task",
  "config": {
    "title": "Follow up {{customer.name}}",
    "assignee_id": "uuid-của-nhân-viên",
    "due_days": 3,
    "note": "Gọi điện nhắc gia hạn"
  }
}
```

---

## 3. Edge — `condition_result`

| Node nguồn         | Giá trị `condition_result` |
|--------------------|----------------------------|
| trigger / action / delay / end | `"default"` (1 edge duy nhất) |
| condition          | `"true"` hoặc `"false"` (bắt buộc 2 edges) |

---

## 4. API Endpoints

### 4.1 Danh sách automations

```
GET /automations
```

**Query params:**

| Param    | Type    | Default | Mô tả                              |
|----------|---------|---------|------------------------------------|
| `status` | string  | `all`   | `all` · `draft` · `active` · `paused` |
| `search` | string  | —       | Tìm theo tên (contains, case-insensitive) |
| `page`   | integer | `1`     | Trang hiện tại                     |
| `limit`  | integer | `20`    | Số items mỗi trang (tối đa 200)    |

**Response:**
```json
{
  "status": true,
  "data": {
    "rows": [ /* Automation[] — chỉ có fields header, không có nodes/edges */ ],
    "count": 42,
    "currentPage": 1,
    "totalPages": 3
  }
}
```

---

### 4.2 Chi tiết automation (bao gồm graph)

```
GET /automations/:id
```

**Response:**
```json
{
  "status": true,
  "data": {
    "automation": { /* Automation object đầy đủ */ },
    "nodes": [ /* Node[] */ ],
    "edges": [ /* Edge[] */ ]
  }
}
```

---

### 4.3 Tạo mới automation

```
POST /automations
Content-Type: application/json
```

**Body:**
```json
{
  "automation": {
    "name": "Chào mừng khách mới",
    "description": "Gửi tin Zalo khi có khách mới",
    "trigger_name": "Khách hàng tạo mới"
  },
  "nodes": [
    {
      "temp_id": "node-1",
      "node_type": "trigger",
      "name": "Khách hàng mới",
      "trigger_type": "customer_created",
      "position_x": 100,
      "position_y": 100
    },
    {
      "temp_id": "node-2",
      "node_type": "action",
      "name": "Gửi tin Zalo",
      "action_type": "send_zalo_message",
      "config": {
        "message_type": "text",
        "text": "Xin chào {{customer.name}}, cảm ơn bạn đã đăng ký!"
      },
      "position_x": 350,
      "position_y": 100
    },
    {
      "temp_id": "node-3",
      "node_type": "end",
      "name": "Kết thúc",
      "position_x": 600,
      "position_y": 100
    }
  ],
  "edges": [
    {
      "source_node_temp_id": "node-1",
      "target_node_temp_id": "node-2",
      "condition_result": "default"
    },
    {
      "source_node_temp_id": "node-2",
      "target_node_temp_id": "node-3",
      "condition_result": "default"
    }
  ]
}
```

> **Lưu ý:** `temp_id` là ID tạm thời do FE tự đặt (chuỗi bất kỳ), dùng để liên kết
> edges trong cùng 1 request. Backend sẽ tạo UUID thật và trả về `tempIdMap`.

**Response:**
```json
{
  "status": true,
  "data": {
    "id": "uuid-của-automation",
    "tempIdMap": {
      "node-1": "uuid-thật-1",
      "node-2": "uuid-thật-2",
      "node-3": "uuid-thật-3"
    }
  }
}
```

---

### 4.4 Cập nhật automation

```
PUT /automations/:id
Content-Type: application/json
```

Body giống POST. Lưu ý:
- Nếu truyền `nodes` → **toàn bộ graph bị xóa và tạo lại** (wipe & re-insert).
- Không truyền `nodes` → chỉ update header (`automation` object).

---

### 4.5 Xóa automation

```
DELETE /automations/:id
```

**Response:**
```json
{ "status": true, "data": { "deleted": true } }
```

---

### 4.6 Đổi trạng thái

```
PATCH /automations/:id/status
Content-Type: application/json
```

**Body:**
```json
{ "status": "active" }
```

Giá trị hợp lệ: `draft` · `active` · `paused`

**Response:**
```json
{ "status": true, "data": { "updated": true } }
```

---

### 4.7 Test chạy thử (dry-run)

```
POST /automations/:id/test-run
Content-Type: application/json
```

**Body:**
```json
{
  "payload": {
    "customer": {
      "id": "uuid",
      "name": "Nguyễn Văn A",
      "phone": "0901234567",
      "zalo_user_id": "zalo-uid-123"
    }
  }
}
```

**Response:**
```json
{
  "status": true,
  "data": {
    "executionId": "uuid",
    "finalStatus": "success | failed",
    "logs": [
      {
        "nodeId": "uuid",
        "nodeName": "Khách hàng mới",
        "nodeType": "trigger",
        "status": "success",
        "output": { "trigger_type": "customer_created" }
      },
      {
        "nodeId": "uuid",
        "nodeName": "Chờ 2 ngày",
        "nodeType": "delay",
        "status": "success",
        "output": { "simulated_delay": { "value": 2, "unit": "day" } }
      },
      {
        "nodeId": "uuid",
        "nodeName": "Gửi tin Zalo",
        "nodeType": "action",
        "status": "success",
        "output": { "dry_run": true, "action_type": "send_zalo_message" }
      }
    ]
  }
}
```

> - Delay node **không chờ thật** — trả về `simulated_delay` ngay lập tức.
> - Action node **không thực thi thật** — trả về `dry_run: true`.
> - Condition node thực thi logic thật dựa trên `payload` truyền vào.

---

## 5. Response format chung

```json
// Thành công
{
  "status": true,
  "data": { ... }
}

// Lỗi chung
{
  "status": false,
  "message": "Mô tả lỗi",
  "data": null
}

// Lỗi validation (HTTP 400)
{
  "status": false,
  "message": "Validation failed",
  "data": {
    "violations": [
      { "field": "name", "message": "name is required" }
    ]
  }
}

// Not found (HTTP 404)
{
  "status": false,
  "message": "Automation not found",
  "data": null
}
```

---

## 6. Luồng UX gợi ý

```
[Trang danh sách]
  ├─ Hiển thị bảng: tên, trigger, status, run_count, success_rate, updated_at
  ├─ Filter theo status (tabs: Tất cả / Nháp / Đang chạy / Tạm dừng)
  ├─ Tìm kiếm theo tên
  ├─ Toggle switch active/paused → PATCH /automations/:id/status
  ├─ Nút "Tạo mới" → mở [Builder]
  └─ Click row → mở [Builder] với dữ liệu load từ GET /automations/:id

[Builder (flowchart editor)]
  ├─ Palette bên trái: kéo thả Trigger / Condition / Action / Delay / End
  ├─ Canvas chính: vẽ nodes + edges (dùng React Flow hoặc tương đương)
  ├─ Click node → panel phải: cấu hình node (tên, config, delay_value/unit, action_type...)
  ├─ Nút "Lưu nháp":
  │     Lần đầu → POST /automations (status: draft) → lưu id vào state
  │     Lần sau → PUT /automations/:id
  ├─ Nút "Chạy thử" → POST /automations/:id/test-run → hiển thị modal log từng bước
  └─ Nút "Kích hoạt" → PATCH /automations/:id/status { status: "active" }
                        (yêu cầu đã lưu nháp trước)
```

---

## 7. Validate phía FE (trước khi gọi API)

| Rule | Thông báo gợi ý |
|------|-----------------|
| Phải có đúng 1 node `trigger` | "Workflow cần có 1 trigger" |
| Phải có ít nhất 1 node `end` | "Workflow cần có ít nhất 1 điểm kết thúc" |
| Node `condition` phải có đúng 2 outgoing edges: `true` và `false` | "Node điều kiện cần 2 nhánh true/false" |
| Không được có vòng lặp (cycle) trong graph | "Workflow không được có vòng lặp" |
| `delay_value` > 0 khi node_type = `delay` | "Thời gian chờ phải lớn hơn 0" |
| Mỗi node không phải `end` phải có ít nhất 1 outgoing edge | "Node [tên] chưa được kết nối" |
| `name` không được để trống | "Tên automation là bắt buộc" |

---

## 8. Ví dụ flow phức tạp (Condition + Delay)

```
[Trigger: customer_created]
        ↓ (default)
[Condition: khách có Zalo?]
    ↓ true              ↓ false
[Delay: 1 ngày]    [Action: tạo task gọi điện]
    ↓ (default)         ↓ (default)
[Action: gửi Zalo]  [End]
    ↓ (default)
[End]
```

POST body tương ứng:
```json
{
  "automation": { "name": "Onboard khách mới", "trigger_name": "Khách hàng tạo mới" },
  "nodes": [
    { "temp_id": "t1", "node_type": "trigger",   "name": "Khách hàng mới",       "trigger_type": "customer_created", "position_x": 300, "position_y": 0   },
    { "temp_id": "t2", "node_type": "condition",  "name": "Có Zalo?",             "config": { "condition": { "operator": "AND", "rules": [{ "field": "payload.customer.zalo_user_id", "op": "exists" }] } }, "position_x": 300, "position_y": 150 },
    { "temp_id": "t3", "node_type": "delay",      "name": "Chờ 1 ngày",           "delay_value": 1, "delay_unit": "day", "position_x": 100, "position_y": 300 },
    { "temp_id": "t4", "node_type": "action",     "name": "Gửi Zalo chào mừng",  "action_type": "send_zalo_message", "config": { "message_type": "text", "text": "Xin chào!" }, "position_x": 100, "position_y": 450 },
    { "temp_id": "t5", "node_type": "action",     "name": "Tạo task gọi điện",   "action_type": "create_task", "config": { "title": "Gọi điện cho {{customer.name}}", "due_days": 1 }, "position_x": 500, "position_y": 300 },
    { "temp_id": "t6", "node_type": "end",        "name": "Kết thúc A",           "position_x": 100, "position_y": 600 },
    { "temp_id": "t7", "node_type": "end",        "name": "Kết thúc B",           "position_x": 500, "position_y": 450 }
  ],
  "edges": [
    { "source_node_temp_id": "t1", "target_node_temp_id": "t2", "condition_result": "default" },
    { "source_node_temp_id": "t2", "target_node_temp_id": "t3", "condition_result": "true"    },
    { "source_node_temp_id": "t2", "target_node_temp_id": "t5", "condition_result": "false"   },
    { "source_node_temp_id": "t3", "target_node_temp_id": "t4", "condition_result": "default" },
    { "source_node_temp_id": "t4", "target_node_temp_id": "t6", "condition_result": "default" },
    { "source_node_temp_id": "t5", "target_node_temp_id": "t7", "condition_result": "default" }
  ]
}
```

---

## 9. TypeScript Types (copy thẳng vào dự án)

```typescript
// types/automation.ts

export type AutomationStatus = 'draft' | 'active' | 'paused';
export type NodeType = 'trigger' | 'condition' | 'action' | 'delay' | 'end';
export type DelayUnit = 'minute' | 'minutes' | 'hour' | 'hours' | 'day' | 'days' | 'week' | 'weeks';
export type TriggerType = 'customer_created' | 'zalo_follow' | 'zalo_message';
export type ActionType = 'send_zalo_message' | 'create_task';
export type ConditionOperator = 'AND' | 'OR';
export type ConditionOp =
  | 'eq' | 'neq' | 'contains' | 'not_contains'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'exists' | 'not_exists';

export interface ConditionRule {
  field: string;
  op: ConditionOp;
  value?: unknown;
}

export interface ConditionGroup {
  operator: ConditionOperator;
  rules: (ConditionRule | ConditionGroup)[];
}

export interface NodeConfig {
  // condition
  condition?: ConditionGroup;
  // send_zalo_message
  message_type?: 'text' | 'template' | 'image';
  text?: string;
  template_id?: string;
  image_url?: string;
  // create_task
  title?: string;
  assignee_id?: string;
  due_days?: number;
  note?: string;
}

export interface AutomationNode {
  id: string;
  automation_id: string;
  node_type: NodeType;
  name: string;
  description?: string | null;
  trigger_type?: TriggerType | null;
  action_type?: ActionType | null;
  delay_value?: number;
  delay_unit?: DelayUnit;
  config?: NodeConfig;
  position_x?: number;
  position_y?: number;
  sort_order?: number;
  is_active: boolean;
}

export interface AutomationEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  condition_result?: 'default' | 'true' | 'false' | null;
}

export interface Automation {
  id: string;
  name: string;
  description?: string | null;
  trigger_name: string;
  status: AutomationStatus;
  run_count: number;
  success_count: number;
  failed_count: number;
  success_rate: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationDetail {
  automation: Automation;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
}

// --- Request bodies ---

/** Node trong request tạo/cập nhật — dùng temp_id thay vì id */
export interface NodeInput extends Omit<AutomationNode, 'id' | 'automation_id'> {
  temp_id: string;
}

export interface EdgeInput {
  source_node_temp_id: string;
  target_node_temp_id: string;
  condition_result?: 'default' | 'true' | 'false' | null;
}

export interface AutomationCreateBody {
  automation: Pick<Automation, 'name' | 'trigger_name'> & { description?: string };
  nodes: NodeInput[];
  edges: EdgeInput[];
}

// --- Response wrappers ---

export interface ApiResponse<T> {
  status: boolean;
  data: T | null;
  message?: string;
}

export interface PaginatedResponse<T> {
  rows: T[];
  count: number;
  currentPage: number;
  totalPages: number;
}

export interface CreateAutomationResponse {
  id: string;
  tempIdMap: Record<string, string>; // temp_id → uuid thật
}

// --- Test run ---

export interface TestRunLog {
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  status: 'success' | 'failed' | 'skipped';
  output: Record<string, unknown>;
}

export interface TestRunResult {
  executionId: string;
  finalStatus: 'success' | 'failed';
  logs: TestRunLog[];
}
```

---

## 10. Cấu trúc thư mục gợi ý

```
src/
└── features/
    └── automation/
        ├── api/
        │   └── automationApi.ts        # Tất cả axios calls
        ├── hooks/
        │   ├── useAutomationList.ts    # useQuery danh sách
        │   ├── useAutomationDetail.ts  # useQuery chi tiết
        │   ├── useSaveAutomation.ts    # useMutation create/update
        │   ├── useChangeStatus.ts      # useMutation PATCH status
        │   └── useTestRun.ts          # useMutation test-run
        ├── components/
        │   ├── AutomationListPage.tsx  # Trang danh sách
        │   ├── AutomationBuilderPage.tsx # Trang builder
        │   ├── builder/
        │   │   ├── FlowCanvas.tsx      # <ReactFlow> wrapper
        │   │   ├── NodePalette.tsx     # Panel trái, kéo thả
        │   │   ├── NodeConfigPanel.tsx # Panel phải, cấu hình node
        │   │   ├── BuilderToolbar.tsx  # Nút Lưu / Chạy thử / Kích hoạt
        │   │   └── TestRunModal.tsx    # Hiển thị log từng bước
        │   └── nodes/
        │       ├── TriggerNode.tsx     # Custom React Flow node
        │       ├── ConditionNode.tsx
        │       ├── ActionNode.tsx
        │       ├── DelayNode.tsx
        │       └── EndNode.tsx
        ├── utils/
        │   ├── graphConverter.ts       # ReactFlow nodes/edges ↔ API payload
        │   └── graphValidator.ts       # Validate trước khi lưu
        └── types/
            └── automation.ts           # Types ở mục 9
```

---

## 11. Logic chuyển đổi ReactFlow ↔ API payload

### ReactFlow → API body (khi lưu)

```typescript
// utils/graphConverter.ts
import { Node, Edge } from '@xyflow/react';
import { NodeInput, EdgeInput, AutomationCreateBody } from '../types/automation';

export function rfToApiPayload(
  automationMeta: AutomationCreateBody['automation'],
  rfNodes: Node[],
  rfEdges: Edge[],
): AutomationCreateBody {
  const nodes: NodeInput[] = rfNodes.map((n) => ({
    temp_id: n.id,              // React Flow id làm temp_id
    node_type: n.data.node_type,
    name: n.data.name,
    description: n.data.description,
    trigger_type: n.data.trigger_type,
    action_type: n.data.action_type,
    delay_value: n.data.delay_value,
    delay_unit: n.data.delay_unit,
    config: n.data.config,
    position_x: n.position.x,
    position_y: n.position.y,
    sort_order: n.data.sort_order ?? 0,
    is_active: n.data.is_active ?? true,
  }));

  const edges: EdgeInput[] = rfEdges.map((e) => ({
    source_node_temp_id: e.source,
    target_node_temp_id: e.target,
    condition_result: (e.data?.condition_result ?? 'default') as EdgeInput['condition_result'],
  }));

  return { automation: automationMeta, nodes, edges };
}
```

### API response → ReactFlow (khi load)

```typescript
import { Node, Edge } from '@xyflow/react';
import { AutomationDetail } from '../types/automation';

export function apiToRfGraph(detail: AutomationDetail): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = detail.nodes.map((n) => ({
    id: n.id,
    type: n.node_type,           // phải map sang tên custom node đã đăng ký
    position: { x: n.position_x ?? 0, y: n.position_y ?? 0 },
    data: { ...n },
  }));

  const edges: Edge[] = detail.edges.map((e) => ({
    id: e.id,
    source: e.source_node_id,
    target: e.target_node_id,
    label: e.condition_result === 'default' ? '' : e.condition_result,
    data: { condition_result: e.condition_result },
  }));

  return { nodes, edges };
}
```

### Sau khi POST thành công — áp dụng tempIdMap

```typescript
// Sau khi API trả về createResult.tempIdMap, sync lại React Flow ids
function applyTempIdMap(
  rfNodes: Node[],
  rfEdges: Edge[],
  tempIdMap: Record<string, string>,
): { nodes: Node[]; edges: Edge[] } {
  const nodes = rfNodes.map((n) => ({ ...n, id: tempIdMap[n.id] ?? n.id }));
  const edges = rfEdges.map((e) => ({
    ...e,
    id: e.id,  // edge id sẽ do BE trả về khi GET detail
    source: tempIdMap[e.source] ?? e.source,
    target: tempIdMap[e.target] ?? e.target,
  }));
  return { nodes, edges };
}
```

---

## 12. Validate graph (trước khi gọi API)

```typescript
// utils/graphValidator.ts
import { Node, Edge } from '@xyflow/react';

export interface ValidationError {
  nodeId?: string;
  message: string;
}

export function validateGraph(nodes: Node[], edges: Edge[]): ValidationError[] {
  const errors: ValidationError[] = [];

  const triggerNodes = nodes.filter((n) => n.data.node_type === 'trigger');
  if (triggerNodes.length !== 1)
    errors.push({ message: 'Workflow cần có đúng 1 node trigger' });

  const endNodes = nodes.filter((n) => n.data.node_type === 'end');
  if (endNodes.length === 0)
    errors.push({ message: 'Workflow cần có ít nhất 1 node kết thúc' });

  for (const node of nodes) {
    if (node.data.node_type === 'end') continue;
    const outgoing = edges.filter((e) => e.source === node.id);

    if (node.data.node_type === 'condition') {
      const hasTrue = outgoing.some((e) => e.data?.condition_result === 'true');
      const hasFalse = outgoing.some((e) => e.data?.condition_result === 'false');
      if (!hasTrue || !hasFalse)
        errors.push({ nodeId: node.id, message: `Node "${node.data.name}": cần 2 nhánh true/false` });
    } else {
      if (outgoing.length === 0)
        errors.push({ nodeId: node.id, message: `Node "${node.data.name}" chưa được kết nối` });
    }

    if (node.data.node_type === 'delay' && !(Number(node.data.delay_value) > 0))
      errors.push({ nodeId: node.id, message: `Node "${node.data.name}": thời gian chờ phải > 0` });
  }

  if (hasCycle(nodes, edges))
    errors.push({ message: 'Workflow không được có vòng lặp' });

  return errors;
}

function hasCycle(nodes: Node[], edges: Edge[]): boolean {
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) adj.get(e.source)?.push(e.target);

  const visited = new Set<string>();
  const inStack = new Set<string>();

  const dfs = (id: string): boolean => {
    visited.add(id);
    inStack.add(id);
    for (const neighbor of adj.get(id) ?? []) {
      if (!visited.has(neighbor) && dfs(neighbor)) return true;
      if (inStack.has(neighbor)) return true;
    }
    inStack.delete(id);
    return false;
  };

  for (const n of nodes)
    if (!visited.has(n.id) && dfs(n.id)) return true;
  return false;
}
```

---

## 13. Lưu ý quan trọng

1. **`temp_id` chỉ dùng trong request tạo mới** — sau khi nhận `tempIdMap` từ response, dùng UUID thật cho mọi thao tác tiếp theo.

2. **PUT thay thế toàn bộ graph** — khi cập nhật automation đã có id, luôn gửi kèm toàn bộ `nodes` + `edges` trong PUT body (không gửi thiếu).

3. **Edge label cho Condition node** — khi vẽ ReactFlow, edge nối ra từ condition node cần hiển thị label `"true"` / `"false"` để người dùng biết nhánh nào là nhánh nào. Set `markerEnd` + màu khác nhau (xanh = true, đỏ = false).

4. **Test-run không lưu DB** — có thể gọi trước khi lưu nháp (chỉ cần automation đã có id). Nên lưu nháp trước rồi mới cho test.

5. **Status flow:** `draft` → `active` (kích hoạt) → `paused` (tạm dừng) → `active` (tiếp tục). Không có trạng thái xóa — xóa bằng `DELETE`.

6. **Template variables trong text:** `{{customer.name}}`, `{{customer.phone}}`, v.v. — FE nên hiển thị hint cho người dùng khi nhập text config của action node.
