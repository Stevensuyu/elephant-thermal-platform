<<<<<<< HEAD
# 天眼护象 · 象群入侵风险智能研判平台

这是面向「无人机热成像 + 边缘 AI + 象群风险预警」的智能研判平台。系统已从静态演示页演进为一个**数据同源、态势联动的统一系统**，各功能模块职责边界清晰但全程协同，共同构成「监测—预警—研判—处警」闭环。平台底座包括：

- Next.js 动态前端（态势总览 / 实时监控 / AI 研判 / 预警处置 / 系统台账 / 人员管理）
- 训练任务 API 与本地 JSON 任务数据库
- 视频上传存储与模型状态同步接口
- GPU / 本地训练 worker（YOLO 热成像检测）

## 系统架构

平台不是彼此孤立的页面，而是共享同一套地理底座（云南底图 / 标注 / 预警等级）与统一数据流的互联系统：

- **感知接入**：设备管理（RTSP / 摄像头 / 本地视频）+ 无人机机队遥测（在线 / 电量 / 高度 / 速度 / 位置 / 任务状态），驱动 YOLO 实时检测。
- **实时监控**（统一监控中枢）：设备接入、机队遥测、巡检路线规划与动态模拟、瓦片态势地图协同联动，与态势总览共用地理底座。
- **态势总览**：3D 地理聚合，与实时监控共享态势，实时滚动预测入侵概率与抵达窗口。
- **AI 研判**（研判枢纽）：以六因子规则引擎为事实基准，叠加智谱 GLM-4-Flash 大模型增强，融合实时检测 / 气象 / 地理空间 / 历史轨迹多源证据，输出结构化研判结论。
- **预警处置**：按红橙黄蓝四级自动生成处置预案并自主联动，回写监测-预警-处警闭环。
- **系统台账 / 人员管理**：全流程留痕与分级权限，与研判、处置同源联动。

## 运行网站
=======
# 大象热成像风险平台

这是面向“无人机热成像 + 地图API + AI 研判 + YOLO 服务接入”的风险预警平台。前端和 API 可部署在 Vercel，真实 AI 研判建议连接外部 GPU 服务或本地 worker。

## 已接入能力

- 地图接口：使用高德地图 JS API 2.0，配置 `NEXT_PUBLIC_AMAP_KEY` 后在首页显示地图与监测点。
- 真实 AI 分析：创建任务时调用 `OPENAI_API_KEY` 对任务内容、视频信息和接入配置进行风险研判；未配置时只使用规则兜底并在页面标明。
- YOLO 服务：可在设置中配置 `YOLO_SERVICE_URL`、权重名和服务提供方，供后台研判链路调用。
- 模型后台：负责读取 YOLO 输出并回写模型状态；前端只在模型状态与确认汇总里展示结果。

## 可用接入

- DJI：FlightHub 2 Cloud API / OpenAPI
- 地图：高德地图 JS API 2.0
- YOLO：Ultralytics Platform REST API / Roboflow Hosted API / 自建 GPU 服务

## 环境变量

复制 `.env.example` 并配置：

```bash
NEXT_PUBLIC_AMAP_KEY=
NEXT_PUBLIC_AMAP_SECURITY_JS_CODE=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
YOLO_SERVICE_URL=
YOLO_PYTHON=python
YOLO_WEIGHTS=yolov8n.pt
WORKER_API_KEY=local-worker-key
API_URL=http://localhost:3000/api
TRAINING_MODE=real
```

Vercel 线上重点配置：

- `NEXT_PUBLIC_AMAP_KEY`
- `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `YOLO_SERVICE_URL`

## 本地运行
>>>>>>> a82e6ef3c0922919ec98651f9d917808aa28e81b

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:3000
```

<<<<<<< HEAD
## 创建训练任务

在网页中点击“上传视频训练”，选择视频并提交。系统会：

1. 上传视频到 `storage/uploads/`
2. 创建训练任务到 `storage/training-db.json`
3. 在页面中显示等待、训练中、完成、失败等状态
4. 自动刷新“当前模型状态与继续训练”

## 启动训练 Worker

默认使用模拟训练模式，适合先跑通平台流程：

```bash
python worker/training_worker.py
```

真实 YOLO 训练模式：

```bash
set TRAINING_MODE=real
python worker/training_worker.py
```

真实训练会调用项目根目录下的 `train_elephant_yolo.py`。请先安装 Python 训练依赖：

```bash
pip install -r requirements-training.txt
```

=======
## YOLO 本地依赖

```bash
python -m pip install -r requirements-training.txt
python scripts/yolo_predict.py --source path/to/image.jpg --weights yolov8n.pt
```

启动后台：

```bash
set TRAINING_MODE=real
set API_URL=http://localhost:3000/api
python worker/training_worker.py
```

>>>>>>> a82e6ef3c0922919ec98651f9d917808aa28e81b
## API

| 方法 | 路径 | 功能 |
| --- | --- | --- |
<<<<<<< HEAD
| GET | `/api/tasks` | 获取训练任务列表 |
| POST | `/api/tasks` | 上传视频并创建训练任务 |
| GET | `/api/tasks/:id` | 查看单个任务 |
| PUT | `/api/tasks/:id` | worker 回写任务状态 |
| DELETE | `/api/tasks/:id` | 取消任务 |
| GET | `/api/model-status` | 获取当前模型状态 |
| PUT | `/api/model-status` | 更新当前模型状态 |

## 目录结构

```text
src/app/page.tsx                 动态训练平台首页
src/app/api/tasks/               训练任务 API
src/app/api/model-status/        模型状态 API
src/lib/store.ts                 JSON 任务数据库
worker/training_worker.py        训练 worker
storage/                         上传视频、任务数据库和结果目录
```

## 部署说明

Vercel 可以部署前端与 API。真实生产环境建议把 `storage/` 替换为 Vercel Blob / S3，把 JSON 任务库替换为 Neon Postgres / Vercel Postgres，再让 GPU worker 轮询线上 API。

当前版本优先保证本机完整跑通：网页上传视频、API 创建任务、worker 处理任务、前端实时显示训练状态。
=======
| GET | `/api/tasks` | 获取研判任务 |
| POST | `/api/tasks` | 创建任务，触发 AI 研判 |
| GET | `/api/tasks/:id` | 获取单个任务 |
| PUT | `/api/tasks/:id` | worker 回写任务状态 |
| POST | `/api/tasks/:id/aggregate` | 汇总研判结果 |
| GET | `/api/model-status` | 获取模型状态 |
| GET | `/api/integrations/status` | 查看地图、AI、YOLO 配置状态 |

## 部署说明

GitHub 已连接 Vercel 后，推送到 `main` 会触发部署。Vercel 不适合长时间 GPU 计算，所以线上 YOLO 建议配置 `YOLO_SERVICE_URL` 指向独立 GPU 服务；本地或服务器 worker 负责模型运行，前端只展示当前模型状态、实时研判和确认汇总。
>>>>>>> a82e6ef3c0922919ec98651f9d917808aa28e81b
