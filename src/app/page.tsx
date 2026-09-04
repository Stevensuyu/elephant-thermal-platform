'use client'

<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Sidebar from '@/components/common/common-sidebar-nav'
import MonitorView from '@/components/disposal/disposal-monitor-view'
import JudgeView from '@/components/disposal/disposal-judge-view'
import AlertCenterView from '@/components/alert/alert-center-view'
import MyTasksView from '@/components/common/common-my-tasks-view'
import SettingsView from '@/components/settings/settings-main-view'
import AlertDetailCard from '@/components/alert/alert-detail-card-modal'
import LoginScreen, { type LoginResult } from '@/components/common/common-login-screen'
import MockBootstrap from '@/components/common/common-mock-bootstrap'
import { installMockApi } from '@/lib/mock/mock-api-installer'
import { useTheme, type Theme } from '@/lib/utils/util-use-theme-hook'
import { useDroneFleet } from '@/lib/utils/util-use-drone-fleet-hook'
import { seedMarkerPosition } from '@/components/dashboard/dashboard-risk-map-3d'
import LocationInfoPanel from '@/components/dashboard/dashboard-location-info-panel'
import AlarmDispatchModal from '@/components/alert/alert-dispatch-confirm-modal'
import TodoPopup from '@/components/common/common-todo-popup'
import type { RealMapMarker } from '@/components/dashboard/dashboard-real-map-leaflet'
import { ROLES, accountOf, type RoleId } from '@/lib/auth/auth-role-permissions'
import { setAuth as setGlobalAuth, subscribeAuth, getAuth, type AuthState } from '@/lib/auth/auth-session-store'
import { recordLog, LOG_ACTIONS } from '@/lib/log/log-operation-audit-store'
import type { TrainingTask, WarningLevel } from '@/lib/utils/util-app-types'
import type { ManualAlertPayload } from '@/components/alert/alert-manual-create-modal'
import { isQualifyingDetection, judgeFromDetection } from '@/lib/utils/util-live-judge-engine'

const RealMap = dynamic(() => import('@/components/dashboard/dashboard-sc-datav-map'), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center text-sm text-cyan-300/70">3D 地理态势加载中…</div>,
})
=======
import { useEffect, useMemo, useState } from 'react'
import {
  BellRing,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Database,
  Plus,
  Radar,
  RefreshCw,
  Route,
  ShieldAlert,
  UploadCloud,
  type LucideIcon,
} from 'lucide-react'
import type { ChinaMapMarker } from '@/components/ChinaMap'
import DynamicBrowseWall from '@/components/DynamicBrowseWall'
import CreateTaskModal, { type CreateTaskPayload } from '@/components/CreateTaskModal'
import IntegrationSettings from '@/components/IntegrationSettings'
import LiveFusionPanel from '@/components/LiveFusionPanel'
import PersonnelManagement from '@/components/PersonnelManagement'
import Sidebar from '@/components/Sidebar'
import TaskCard from '@/components/TaskCard'
import { buildIntegrationQuery, readIntegrationDraft } from '@/lib/integration-client'
import type { ModelStatus, TrainingTask, WarningLevel } from '@/lib/store'

type IntegrationStatus = {
  map: { configured: boolean; provider: string; reachable?: boolean }
  ai: { configured: boolean; provider: string; endpoint: string; reachable?: boolean }
  dji: { configured: boolean; provider: string; endpoint: string; reachable?: boolean }
  yolo: { configured: boolean; provider: string; endpoint: string; weights: string; reachable?: boolean }
  thermal: { configured: boolean; provider: string; source: string; reachable?: boolean }
  threeD: { configured: boolean; provider: string; endpoint: string; reachable?: boolean }
}

type LiveFusion = {
  summary: string
  acquisitionSummary: string
  latestTask: { id: string; name: string; status: string; warningLevel: string; intrusionRisk: number; predictionWindow: string; updatedAt: string } | null
  modelStatus: { status: string; source: string; lastUpdated: string; version: string }
  analysis: { warningLevel: WarningLevel; intrusionRisk: number; predictionWindow: string; aiSummary: string }
  thermal: { streamUrl: string; snapshotUrl: string; sourceName: string }
  dji: { providerName?: string; cloudApiBaseUrl: string; openApiBaseUrl: string; websocketUrl: string }
  map: { apiKey: string }
  yolo: { configured: boolean; providerName: string; serviceUrl: string; weights: string } | null
  threeD: { configured: boolean; providerName: string; serviceUrl: string; snapshotUrl: string } | null
}

type TabStateProps = {
  commandTask?: TrainingTask
  currentLevel: WarningLevel
  integrationStatus: IntegrationStatus | null
  level: { label: string; bg: string; ring: string; text: string; bar: string; short: string }
  liveFusion: LiveFusion | null
  modelStatus: ModelStatus
  setIsModalOpen: (open: boolean) => void
  setSelectedTask: (task: TrainingTask) => void
  tasks: TrainingTask[]
}

const emptyModelStatus: ModelStatus = {
  version: 'YOLOv8n-elephant-thermal',
  status: '加载中',
  datasetImages: 0,
  classes: 0,
  map50: 0,
  elephantMap50: 0,
  precision: 0,
  recall: 0,
  source: '-',
  lastUpdated: '-',
}
>>>>>>> a82e6ef3c0922919ec98651f9d917808aa28e81b

const levelStyle: Record<WarningLevel, { label: string; short: string; bg: string; text: string; bar: string; ring: string }> = {
  RED: { label: '红色预警', short: '红', bg: 'bg-red-600', text: 'text-red-700', bar: 'bg-red-500', ring: 'ring-red-200' },
  ORANGE: { label: '橙色预警', short: '橙', bg: 'bg-orange-500', text: 'text-orange-700', bar: 'bg-orange-500', ring: 'ring-orange-200' },
  YELLOW: { label: '黄色预警', short: '黄', bg: 'bg-amber-400', text: 'text-amber-700', bar: 'bg-amber-400', ring: 'ring-amber-200' },
  BLUE: { label: '蓝色预警', short: '蓝', bg: 'bg-blue-600', text: 'text-blue-700', bar: 'bg-blue-500', ring: 'ring-blue-200' },
}

<<<<<<< HEAD
const tabMeta: Record<string, { title: string }> = {
  dashboard: { title: '空中智能象群风险研判预警与处置系统' },
  monitor: { title: '实时监控' },
  judge: { title: '警情研判' },
  alerts: { title: '警情中心' },
  settings: { title: '系统设置' },
}

export default function Home() {
  const [isAuthed, setIsAuthed] = useState(() => { try { return !!getAuth() } catch { return false } })
  const [auth, setAuth] = useState<LoginResult | null>(() => { try { const a = getAuth(); return a ? { role: a.role, user: a.user, name: a.name } as LoginResult : null } catch { return null } })
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('elephant_active_tab')
      if (saved) return saved
    }
    return 'dashboard'
  })
  const [pendingCount, setPendingCount] = useState(0)
  const [tasks, setTasks] = useState<TrainingTask[]>([])
  const [selectedTask, setSelectedTask] = useState<TrainingTask | null>(null)
  // 新警情弹窗 + 地图点选地点详情
  const [popupTask, setPopupTask] = useState<TrainingTask | null>(null)
  const [showTodoPopup, setShowTodoPopup] = useState(false)
  const todoPopupShownRef = useRef(false) // 待办弹窗仅首次登录显示一次，角色切换不重复弹出
  const lastPendingCountRef = useRef(0) // 上次待办计数，用于检测新增任务时自动弹窗
  const authRef = useRef(auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [locPanel, setLocPanel] = useState<{ lat: number; lng: number; city: string } | null>(null)
  const seenIdsRef = useRef<Set<string>>(new Set())
  // 防重复弹窗：已弹出过分发确认弹窗的警情ID，确认分发后不再重复弹出
  const poppedAlertIdsRef = useRef<Set<string>>(new Set())
  // 基线初始化标记：首次成功拉取任务后记录「已有 id」作为基线，
  // 之后任意新出现的待确认警情都会触发弹窗。避免「首条数据恰好是自动生成的警情」被误当作基线而静默吞掉。
  const initializedRef = useRef(false)
  const { theme, setTheme } = useTheme()
  const fleet = useDroneFleet()
  const router = useRouter()
  // 点击警情直接跳转独立详情页（不再弹 Modal）
  const handleViewTask = (t: TrainingTask) => router.push(`/alert/${t.id}`)
  // 自动研判生成警情：本页作为单一所有者，避免主页/研判页两个按钮实例重复生成
  const judgeEpisodeRef = useRef({ generated: false })

  const fetchAll = async () => {
    try {
      const res = await fetch('/api/tasks', { cache: 'no-store' })
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data?.tasks ?? [])
      const tasksList = list as TrainingTask[]
      setTasks(tasksList)
      // 新警情弹窗逻辑：
      //  - 首次成功拉取（无论是否为空）建立基线，把已有 id 记为「已见」，不弹窗；
      //  - 之后任意「新出现且 pendingConfirm===true」的警情都触发弹窗（用 lastPopupIdRef 防同一警情重复弹）。
      if (!initializedRef.current) {
        tasksList.forEach((t) => seenIdsRef.current.add(t.id))
        initializedRef.current = true
        return
      }
      for (const t of tasksList) {
        if (!seenIdsRef.current.has(t.id)) {
          seenIdsRef.current.add(t.id)
          // 防重复：只有 pendingConfirm=true 且未弹窗过的警情才触发弹窗
          if (t.pendingConfirm === true && !poppedAlertIdsRef.current.has(t.id)) {
            poppedAlertIdsRef.current.add(t.id)
            setPopupTask((prev) => prev ?? t)
            break
          }
        }
      }
    } catch {
      /* mock 拦截下不应失败 */
    }
  }

  // 弹窗确认：modal 内已调 /api/dispatch/confirm；此处刷新大屏并通知联动面板重新拉取，
  // 同时自动跳转到「警情研判」页，用户可立即查看警情分发流程·跨部门警情联动面板。
  const onConfirmPopup = async () => {
    // 确认分发后，将当前警情ID加入已处理列表，防止后续重复弹窗
    if (popupTask) poppedAlertIdsRef.current.add(popupTask.id)
    setPopupTask(null)
    await fetchAll()
    window.dispatchEvent(new CustomEvent('alarm:confirmed'))
    setActiveTab('judge')
  }
  const onDismissPopup = () => {
    // 稍后处理也记录已弹窗ID，防止同一警情反复弹出
    if (popupTask) poppedAlertIdsRef.current.add(popupTask.id)
    setPopupTask(null)
  }

  // activeTab 持久化到 localStorage，刷新后保持当前页面
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('elephant_active_tab', activeTab)
    }
  }, [activeTab])

  useEffect(() => { const params = new URLSearchParams(window.location.search); const t = params.get('tab'); if (t && t !== activeTab) setActiveTab(t); }, []);

  useEffect(() => {
    installMockApi()
    // 订阅全局 authStore（内存级，刷新即丢失，必须重新登录）
    const unsub = subscribeAuth((a: AuthState | null) => {
      if (a) {
        setAuth({ role: a.role, user: a.user, name: a.name })
        authRef.current = { role: a.role, user: a.user, name: a.name }
        setIsAuthed(true)
      } else {
        setAuth(null)
        setIsAuthed(false)
        setSelectedTask(null)
      }
    })
    fetchAll()
    const id = window.setInterval(() => {
      fetchAll()
      // 轮询当前角色待办：检测到新增任务时自动弹 TodoPopup
      const r = authRef.current?.role as RoleId | undefined
      if (r) refreshPendingCount(r)
    }, 3000)
    return () => { unsub(); window.clearInterval(id) }
  }, [])

  // 监听我的任务页面「查看弹窗」按钮事件，打开待办弹窗
  useEffect(() => {
    const handler = () => setShowTodoPopup(true)
    window.addEventListener('todo:open-popup', handler)
    return () => window.removeEventListener('todo:open-popup', handler)
  }, [])

  // 监听结案事件：任何页面结案后立即刷新警情列表，左侧列表同步更新
  useEffect(() => {
    const handler = () => { fetchAll() }
    window.addEventListener('task:closed', handler)
    return () => window.removeEventListener('task:closed', handler)
  }, [])

  // 监听步骤确认事件：任何组件确认处置步骤后，立即刷新待办计数 + 警情列表
  useEffect(() => {
    const handler = () => {
      fetchAll()
      const r = authRef.current?.role as RoleId | undefined
      if (r) refreshPendingCount(r)
    }
    window.addEventListener('todo:step-confirmed', handler)
    return () => window.removeEventListener('todo:step-confirmed', handler)
  }, [])

  // 登录状态/角色变化后刷新待办计数
  useEffect(() => {
    if (isAuthed && auth) {
      refreshPendingCount(auth.role as RoleId)
      // 待办弹窗仅在首次登录时显示一次，角色切换不重复弹出
      if (!todoPopupShownRef.current) {
        todoPopupShownRef.current = true
        const t = window.setTimeout(() => setShowTodoPopup(true), 800)
        return () => window.clearTimeout(t)
      }
    } else {
      setShowTodoPopup(false)
      todoPopupShownRef.current = false // 登出后重置，下次登录再显示
      lastPendingCountRef.current = 0
    }
  }, [isAuthed, auth?.role])

  // 自动研判：仅当「已接入视频源（connected）」且「确实检出象群」时才自动生成警情。
  // 默认未接入任何视频源（connected=false）→ 零检测、零警情，绝不伪造真实检出。
  // 单一所有者（本页），仅登录后运行，避免主页头部/研判页两个按钮实例重复生成。
  useEffect(() => {
    if (!isAuthed) return
    const tick = async () => {
      try {
        const s = await fetch('/api/realtime-judge-settings', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null))
        const d = await fetch('/api/live-detection', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null))
        const enabled = (s?.enabled ?? s?.settings?.enabled) !== false
        // 诚实边界：没接入视频源（connected=false）就不算「检出」，不生成警情
        const connected = d?.connected === true
        const qualifying = connected && isQualifyingDetection({
          running: !!d?.running,
          detected_count: d?.detected_count ?? d?.count ?? 0,
          max_confidence: d?.max_confidence ?? d?.confidence ?? 0,
        })
        const detecting = enabled && qualifying
        // 同一检测周期内只生成一次，避免每 3 秒重复刷出警情
        if (detecting && !judgeEpisodeRef.current.generated) {
          judgeEpisodeRef.current.generated = true
          await createAutoAlert(d)
        }
        if (!detecting) judgeEpisodeRef.current.generated = false
      } catch { /* ignore */ }
    }
    tick()
    const id = window.setInterval(tick, 3000)
    return () => window.clearInterval(id)
  }, [isAuthed])

  const handleLogin = (r: LoginResult) => {
    setGlobalAuth({ role: r.role as RoleId, user: r.user, name: r.name })
    recordLog({ userName: r.name, role: r.role, action: LOG_ACTIONS.LOGIN, detail: `账号 ${r.user} 登录系统`, userId: r.user })
    // 服务端登录日志（记录IP/设备/会话ID）
    const sessionId = `SID-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem('tyhx_session_id', sessionId)
    fetch('/api/login-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: r.user, userName: r.name, role: r.role, success: true, sessionId }),
    }).catch(() => { /* ignore */ })
  }
  const handleLogout = () => {
    if (auth) recordLog({ userName: auth.name, role: auth.role, action: LOG_ACTIONS.LOGOUT, detail: `账号 ${auth.user} 退出系统`, userId: auth.user })
    setGlobalAuth(null)
  }
  // 计算当前角色的待确认步骤数（从所有处置工单中统计）
  // 过滤条件与 MyTasksView / TodoPopup 完全一致：
  //   未归档(wf.advanced !== true)、警情未结案(task.status !== 'COMPLETED')、
  //   步骤未完成/未跳过(s.status !== 'done'/'skipped')、未确认(!s.confirmedBy)、
  //   分配给当前角色(admin 可见所有)
  const refreshPendingCount = async (forRole?: RoleId) => {
    const r = forRole || (authRef.current?.role as RoleId) || 'admin'
    try {
      // 并行获取 workflow 与任务列表，确保任务状态最新，避免已结案警情步骤被计数
      const [wfRes, tasksRes] = await Promise.all([
        fetch('/api/disposal-workflows', { cache: 'no-store' }),
        fetch('/api/tasks', { cache: 'no-store' }),
      ])
      const wfData = await wfRes.json()
      const tasksData = await tasksRes.json().catch(() => ({}))
      const wfs = Array.isArray(wfData) ? wfData : (wfData?.workflows ?? [])
      const taskList = Array.isArray(tasksData) ? tasksData : (tasksData?.tasks ?? [])
      const completedTaskIds = new Set(taskList.filter((t: any) => t.status === 'COMPLETED').map((t: any) => t.id))
      const existingTaskIds = new Set(taskList.map((t: any) => t.id))
      let count = 0
      for (const wf of wfs) {
        if (wf.advanced === true) continue
        // 警情被删除或已结案 → 跳过
        if (!existingTaskIds.has(wf.taskId)) continue
        if (completedTaskIds.has(wf.taskId)) continue
        for (const s of (wf.steps || [])) {
          if (s.status === 'done' || s.status === 'skipped') continue
          if (s.confirmedBy) continue
          // admin 统计所有角色的未确认步骤；非 admin 仅统计分配给自己的
          if (r === 'admin' || s.assignedRole === r) {
            count++
          }
        }
      }
      setPendingCount(count)
      // 新增任务提醒：待办数比上次多、已登录且非首次初始化 → 自动弹 TodoPopup
      if (count > lastPendingCountRef.current && todoPopupShownRef.current) {
        setShowTodoPopup(true)
      }
      lastPendingCountRef.current = count
    } catch { setPendingCount(0) }
  }

  const onSubmitAlert = async (payload: ManualAlertPayload) => {
    try {
      const r = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, manual: true }),
      })
      const d = await r.json().catch(() => ({}))
      if (d?.duplicate) {
        console.warn('[警情去重] 同一目标已有正在处置的警情，未重复创建：', d.task?.name)
      }
    } catch { /* 模拟环境下忽略 */ }
    await fetchAll()
  }

  const onDeleteTasks = async (ids: string[]) => {
    try {
      await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
    } catch { /* 模拟环境下忽略 */ }
    await fetchAll()
  }

  // 由检测证据自动生成警情（视频源接入 → 检出象群 → 引擎研判 → 生成警情）。
  // 诚实标注来源：demo 推演模式生成的警情标记 simulated:true，绝不明确成「真实视频」。
  const createAutoAlert = async (det: any) => {
    const isDemo = det?.mode === 'demo'
    const j = judgeFromDetection({
      running: !!det?.running,
      detected_count: det?.detected_count ?? det?.count ?? 0,
      max_confidence: det?.max_confidence ?? det?.confidence ?? 0,
    })
    const pos = seedMarkerPosition(j.name)
    // 真实 AI 研判：调用服务端 /api/ai-analysis/auto-judge（真实 LLM 生成研判结论）。
    // 规则引擎只负责风险指数/等级的确定性计算；AI 结论文案由大模型针对该证据生成。
    let aiJudgment = j.aiSummary
    try {
      const aj = await fetch('/api/ai-analysis/auto-judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detectedCount: det?.detected_count ?? det?.count ?? 1,
          maxConfidence: det?.max_confidence ?? det?.confidence ?? 0,
          distanceKm: 2,
        }),
      })
      if (aj.ok) {
        const ad = await aj.json()
        if (ad?.ai === true && ad?.analysis?.aiSummary) aiJudgment = String(ad.analysis.aiSummary)
        else if (ad?.analysis?.aiSummary) aiJudgment = `（AI 研判暂不可用：${ad?.reason || '大模型调用失败'}）${String(ad.analysis.aiSummary)}`
      }
    } catch {
      /* AI 不可用 → 使用规则引擎结论（已如实标注） */
    }
    const provenanceNote = isDemo
      ? '（本警情由「推演演示」视频源生成，非真实视频检测，仅供流程演示）'
      : ''
    try {
      const r = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: j.name + (isDemo ? '（推演演示）' : ''),
          alertType: j.alertType,
          warningLevel: j.warningLevel,
          intrusionRisk: j.intrusionRisk,
          aiSummary: aiJudgment + provenanceNote,
          description: aiJudgment + provenanceNote,
          detectedCount: det?.detected_count ?? det?.count ?? 1,
          triggeredBy: isDemo ? 'realtime-demo' : 'realtime-stream',
          realInference: !isDemo,
          simulated: isDemo,
          manual: false,
          pendingConfirm: true,
          sourceDevice: isDemo ? '推演演示视频源' : '实时直播流',
          lat: pos.lat,
          lng: pos.lng,
        }),
      })
      const d = await r.json().catch(() => ({}))
      if (d?.duplicate) {
        console.warn('[警情去重] 同一目标已有正在处置的警情，未重复创建：', d.task?.name)
      }
    } catch { /* mock 拦截下不应失败 */ }
    await fetchAll()
  }

  const stats = useMemo(() => ({
    total: tasks.length,
    high: tasks.filter((t) => ['RED', 'ORANGE'].includes(t.warningLevel)).length,
    running: tasks.filter((t) => t.status === 'RUNNING').length,
    pending: tasks.filter((t) => t.status === 'PENDING').length,
  }), [tasks])

  // 统一排序：未完成在上（时间倒序），已完成在下（时间倒序）
  const sortedTasks = useMemo(() => {
    const unfinished = tasks.filter((t) => t.status !== 'COMPLETED' && !t.aggregatedAt && !t.closedAt)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    const completed = tasks.filter((t) => t.status === 'COMPLETED' || t.aggregatedAt || t.closedAt)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    return [...unfinished, ...completed]
  }, [tasks])

  const mapMarkers = useMemo<RealMapMarker[]>(
    () => tasks.map((t) => {
      const p = seedMarkerPosition(`${t.id}${t.name}`)
      const locParts = [t.province, t.city, t.county, t.township].filter(Boolean)
      const location = locParts.length ? locParts.join('') : undefined
      const time = t.createdAt ? new Date(t.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : undefined
      const statusLabel = t.status === 'RUNNING' ? '正在处置' : t.status === 'PENDING' ? '待处理' : t.status === 'CLOSED' ? '已闭环' : t.status
      return {
        id: t.id,
        name: t.name,
        lng: typeof t.lng === 'number' ? t.lng : p.lng,
        lat: typeof t.lat === 'number' ? t.lat : p.lat,
        level: t.warningLevel,
        risk: t.intrusionRisk,
        simulated: !!t.simulated,
        time,
        location,
        detectionCount: t.detectedCount,
        alertType: t.alertType,
        description: t.description || t.aiSummary,
        status: statusLabel,
      }
=======
const chinaMapMarkers: ChinaMapMarker[] = [
  { id: 'yn-bn', name: '西双版纳监测区', lng: 100.7974, lat: 22.0075, status: '热成像巡护' },
  { id: 'yn-pu', name: '普洱边境缓冲区', lng: 101.0215, lat: 22.7736, status: '无人机复飞' },
  { id: 'gx-fc', name: '广西边境样例点', lng: 108.3538, lat: 21.6871, status: '地图接口联通' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [tasks, setTasks] = useState<TrainingTask[]>([])
  const [modelStatus, setModelStatus] = useState<ModelStatus>(emptyModelStatus)
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null)
  const [liveFusion, setLiveFusion] = useState<LiveFusion | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TrainingTask | null>(null)
  const [resultTask, setResultTask] = useState<TrainingTask | null>(null)
  const [noticeTask, setNoticeTask] = useState<TrainingTask | null>(null)

  const refresh = async () => {
    setIsRefreshing(true)
    try {
      const integrationQuery = buildIntegrationQuery(readIntegrationDraft())
      const [taskResponse, modelResponse, integrationResponse, fusionResponse] = await Promise.all([
        fetch('/api/tasks', { cache: 'no-store' }),
        fetch('/api/model-status', { cache: 'no-store' }),
        fetch(`/api/integrations/status${integrationQuery}`, { cache: 'no-store' }),
        fetch(`/api/fusion/live${integrationQuery}`, { cache: 'no-store' }),
      ])
      setTasks(await taskResponse.json())
      setModelStatus(await modelResponse.json())
      setIntegrationStatus(await integrationResponse.json())
      setLiveFusion(await fusionResponse.json())
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(refresh, 5000)
    return () => window.clearInterval(timer)
  }, [])

  const handleCreateTask = async (data: CreateTaskPayload) => {
    const form = new FormData()
    const integrationDraft = readIntegrationDraft()
    form.set('name', data.name)
    form.set('description', data.description)
    form.set('videoUrl', data.videoUrl)
    form.set('modelType', data.modelType)
    form.set('epochs', String(data.epochs))
    form.set('batchSize', String(data.batchSize))
    form.set('imageSize', String(data.imageSize))
    if (integrationDraft) form.set('integrationConfig', JSON.stringify(integrationDraft))
    if (data.video) form.set('video', data.video)
    await fetch('/api/tasks', { method: 'POST', body: form })
    await refresh()
  }

  const confirmAggregate = async (task: TrainingTask) => {
    await fetch(`/api/tasks/${task.id}/aggregate`, { method: 'POST' })
    setResultTask(null)
    await refresh()
  }

  const stats = useMemo(
    () => ({
      total: tasks.length,
      running: tasks.filter((task) => task.status === 'RUNNING').length,
      pending: tasks.filter((task) => task.status === 'PENDING').length,
      high: tasks.filter((task) => ['RED', 'ORANGE'].includes(task.warningLevel)).length,
>>>>>>> a82e6ef3c0922919ec98651f9d917808aa28e81b
    }),
    [tasks],
  )

<<<<<<< HEAD
  if (!isAuthed) {
    return (
      <>
        <MockBootstrap />
        <LoginScreen onLogin={handleLogin} />
      </>
    )
  }

  const role = (auth?.role ?? 'admin') as RoleId
  const currentName = auth?.name ?? '管理员'
  const currentUser = auth?.user ?? 'admin'
  const devices = fleet.map((d) => d.name)

  const meta = tabMeta[activeTab] ?? tabMeta.dashboard

  return (
    <>
      <MockBootstrap />
      <div className="dv-grid-bg min-h-screen text-slate-100">
        <div className="flex min-h-screen">
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            currentRole={role}
            currentUser={currentUser}
            currentName={currentName}
            onLogout={handleLogout}
            pendingCount={pendingCount}
            mobileOpen={sidebarOpen}
            onMobileClose={() => setSidebarOpen(false)}
          />

          <main className="flex-1 p-2 md:p-3">
            {/* 手机端菜单按钮 */}
            <div className="mb-2 flex items-center gap-2 md:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-[13px] text-slate-200 active:bg-slate-700/60"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                菜单
              </button>
              <span className="text-[12px] text-slate-400">{meta.title}</span>
            </div>
            {activeTab === 'dashboard' && (
            <header className="mb-3 overflow-hidden rounded-lg bg-[#0f1f3a] text-white shadow-lg">
              <div className="flex flex-col items-center gap-1.5 p-3">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-center">{meta.title}</h1>
                <div className="flex flex-row flex-wrap gap-2 justify-center">
                  <StatTile label="警情总数" value={stats.total} />
                  <StatTile label="红橙重点" value={stats.high} />
                  <StatTile label="进行中" value={stats.running} />
                  <StatTile label="待处理" value={stats.pending} />
                </div>
              </div>
            </header>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-3">
                {/* 地图占满整个屏幕 */}
                <div className="relative z-0 overflow-hidden rounded-lg border border-slate-700/50 bg-slate-100 p-1">
                  <div className="h-[calc(100vh-230px)] w-full min-h-[440px]">
                    <RealMap
                      markers={mapMarkers}
                      drones={fleet}
                      center={[101.4, 23.6]}
                      zoom={8}
                      onMarkerClick={(m) => setLocPanel({ lat: m.lat, lng: m.lng, city: m.name })}
                      onMapClick={(lat, lng, label) => setLocPanel({ lat, lng, city: label ?? '' })}
                    />
                  </div>
                </div>

                {/* 最新警情动态 - 移到地图下方 */}
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3">
                  <h2 className="mb-2 text-base font-semibold text-cyan-100">最新警情动态</h2>
                  {tasks.length === 0 ? (
                    <div className="py-4 text-center text-sm text-slate-500">暂无警情数据</div>
                  ) : (
                    <ul className="divide-y divide-slate-800/50">
                      {sortedTasks.slice(0, 6).map((t) => {
                        const lv = levelStyle[t.warningLevel] ?? levelStyle.BLUE
                        return (
                          <li
                            key={t.id}
                            className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-slate-800/40"
                            onClick={() => handleViewTask(t)}
                          >
                            <div className="text-left text-sm text-slate-200">
                              <span className={`mr-2 rounded px-1.5 py-0.5 text-xs font-bold text-white ${lv.bg}`}>{lv.short}</span>
                              {t.name}
                            </div>
                            <span className="text-xs text-slate-500">风险 {t.intrusionRisk ?? '-'}</span>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'mytasks' && (
              <MyTasksView currentRole={role} currentName={currentName} tasks={tasks} />
            )}
            {activeTab === 'monitor' && <MonitorView tasks={tasks} fleet={fleet} />}
            {activeTab === 'judge' && (
              <JudgeView
                tasks={tasks}
                fleet={fleet}
                onViewTask={handleViewTask}
                onSubmitAlert={onSubmitAlert}
                devices={devices}
                currentName={currentName}
                currentRole={role}
                onDeleteTasks={onDeleteTasks}
              />
            )}
            {activeTab === 'alerts' && (
              <AlertCenterView
                tasks={tasks}
                currentName={currentName}
                onViewTask={handleViewTask}
                onDeleteTask={(id) => onDeleteTasks([id])}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsView
                tasks={tasks}
                currentRole={role}
                onViewTask={handleViewTask}
                onDeleteTasks={onDeleteTasks}
                theme={theme}
                onThemeChange={(t) => setTheme(t as Theme)}
              />
            )}
          </main>
        </div>

        {selectedTask && <AlertDetailCard alertId={selectedTask.id} onClose={() => setSelectedTask(null)} />}
        {locPanel && <LocationInfoPanel lat={locPanel.lat} lng={locPanel.lng} city={locPanel.city} onClose={() => setLocPanel(null)} />}
        {popupTask && <AlarmDispatchModal task={popupTask} onConfirm={onConfirmPopup} onDismiss={onDismissPopup} />}
        <TodoPopup
          open={showTodoPopup}
          onClose={() => setShowTodoPopup(false)}
          tasks={tasks}
          currentRole={auth?.role || ''}
          currentName={auth?.name || ''}
          onViewTask={handleViewTask}
        />
      </div>
    </>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-800/60 bg-slate-900/40 px-3 py-1.5 min-w-[90px] text-center">
      <div className="text-[10px] text-slate-400">{label}</div>
      <div className="text-lg font-bold text-white leading-tight">{value}</div>
=======
  const latestTask = tasks[0]
  const commandTask = latestTask || tasks.find((task) => task.warningLevel === 'RED') || tasks.find((task) => task.warningLevel === 'ORANGE')
  const currentLevel = commandTask?.warningLevel || 'BLUE'
  const level = levelStyle[currentLevel]

  const tabProps: TabStateProps = {
    commandTask,
    currentLevel,
    integrationStatus,
    level,
    liveFusion,
    modelStatus,
    setIsModalOpen,
    setSelectedTask,
    tasks,
  }

  return (
    <div className="min-h-screen bg-[#eef3f0] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 p-5">
          <header className="mb-5 overflow-hidden rounded-lg bg-slate-950 text-white shadow-lg">
            <div className="grid grid-cols-[1.1fr_.9fr] gap-5 p-6">
              <div>
                <p className="text-sm font-medium text-emerald-300">天眼护象 · 监测-预警-处警一体化</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">象群入侵风险智能研判与警情联动大屏</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  接入中国地图、DJI 司空 / FlightHub 2、实时热成像和 AI 分析接口，形成可配置、可追溯的实时研判链路。
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={refresh} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
                    <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    刷新
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
                    <Plus size={16} />
                    新建研判任务
                  </button>
                </div>
              </div>
              <div className={`rounded-lg bg-white/10 p-4 ring-4 ${level.ring}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`rounded-full px-3 py-1 text-sm font-bold text-white ${level.bg}`}>{level.label}</span>
                    <div className="mt-3 text-5xl font-black">{liveFusion?.analysis.intrusionRisk ?? commandTask?.intrusionRisk ?? 18}</div>
                    <p className="text-sm text-slate-300">风险指数 · {liveFusion?.analysis.predictionWindow || commandTask?.predictionWindow || '待研判'}</p>
                  </div>
                  <ShieldAlert size={64} className={level.text} />
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 px-6 py-3 text-sm text-slate-300">
              {liveFusion ? (
                <span>
                  采集 {liveFusion.acquisitionSummary || '0/0'} · 任务 {liveFusion.latestTask?.name || '暂无'} · 风险 {liveFusion.analysis.predictionWindow || '待研判'}
                </span>
              ) : (
                <span>采集中 · 任务加载中 · 风险评估中</span>
              )}
            </div>
          </header>

          <section className="mb-5 grid grid-cols-4 gap-4">
            <MetricTile icon={Database} label="研判任务" value={stats.total} />
            <MetricTile icon={Cpu} label="运行中" value={stats.running} />
            <MetricTile icon={UploadCloud} label="待处理" value={stats.pending} />
            <MetricTile icon={BellRing} label="红橙预警" value={stats.high} />
          </section>

          {activeTab === 'dashboard' ? <DashboardTab {...tabProps} /> : null}
          {activeTab === 'warning' ? <WarningTab {...tabProps} /> : null}
          {activeTab === 'ai' ? <AiTab {...tabProps} /> : null}
          {activeTab === 'dispatch' ? <DispatchTab {...tabProps} /> : null}
          {activeTab === 'history' ? <HistoryTab {...tabProps} /> : null}
          {activeTab === 'personnel' ? <PersonnelTab {...tabProps} /> : null}
          {activeTab === 'settings' ? <SettingsTab {...tabProps} /> : null}
        </main>
      </div>

      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateTask} />
      {noticeTask ? <WarningPopup task={noticeTask} onClose={() => setNoticeTask(null)} /> : null}
      {resultTask ? <TrainingResultModal task={resultTask} onConfirm={() => confirmAggregate(resultTask)} onClose={() => setResultTask(null)} /> : null}
      {selectedTask ? <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} /> : null}
>>>>>>> a82e6ef3c0922919ec98651f9d917808aa28e81b
    </div>
  )
}

<<<<<<< HEAD


=======
function DashboardTab(props: TabStateProps) {
  return (
    <>
      <DynamicBrowseWall liveFusion={props.liveFusion} commandTask={props.commandTask} markers={chinaMapMarkers} />

      <section className="mb-5 grid grid-cols-[1.15fr_.85fr] gap-4">
        <Panel title="当前模型状态与确认汇总" icon={CheckCircle2}>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="模型版本" value={props.modelStatus.version} />
            <Metric label="模型状态" value={props.modelStatus.status} />
            <Metric label="mAP50" value={props.modelStatus.map50.toFixed(3)} />
            <Metric label="Precision" value={props.modelStatus.precision.toFixed(3)} />
            <Metric label="Recall" value={props.modelStatus.recall.toFixed(3)} />
            <Metric label="样本图片" value={props.modelStatus.datasetImages} />
          </div>
          <div className="mt-4 rounded-md bg-slate-50 p-4 text-xs leading-5 text-slate-600">
            当前模型状态会跟随实时研判结果更新，确认汇总后才写入模型状态。
          </div>
        </Panel>
        <Panel title="实时三维立体分析与分级预警" icon={BrainCircuit}>
          <LiveFusionPanel />
          <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {props.liveFusion?.summary || props.commandTask?.aiSummary || '等待接入实时热成像源、DJI 司空 / FlightHub 2、三维分析和 AI 分析接口。'}
          </div>
        </Panel>
      </section>

      <section className="mb-5 grid grid-cols-[.9fr_1.1fr] gap-4">
        <Panel title="监测-预警-处警闭环" icon={Radar}>
          <ProcessFlow level={props.currentLevel} />
        </Panel>
        <Panel title="分级处置预案" icon={Route}>
          <DispatchGrid task={props.commandTask} level={props.currentLevel} levelBg={props.level.bg} />
        </Panel>
      </section>

      {props.tasks[0] ? <LatestTaskStages task={props.tasks[0]} onCreate={() => props.setIsModalOpen(true)} /> : null}
      <TaskGrid tasks={props.tasks} onView={props.setSelectedTask} />
    </>
  )
}

function WarningTab(props: TabStateProps) {
  const grouped = (['RED', 'ORANGE', 'YELLOW', 'BLUE'] as WarningLevel[]).map((level) => ({
    level,
    tasks: props.tasks.filter((task) => task.warningLevel === level),
  }))

  return (
    <section className="grid grid-cols-[.85fr_1.15fr] gap-4">
      <Panel title="分级预警看板" icon={ShieldAlert}>
        <div className="grid grid-cols-2 gap-3">
          {grouped.map((group) => (
            <div key={group.level} className="rounded-md bg-slate-50 p-4">
              <span className={`rounded-full px-3 py-1 text-sm font-bold text-white ${levelStyle[group.level].bg}`}>{levelStyle[group.level].label}</span>
              <div className="mt-3 text-3xl font-black text-slate-900">{group.tasks.length}</div>
              <p className="text-xs text-slate-500">当前任务数量</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {props.commandTask ? `${props.commandTask.name}：风险指数 ${props.commandTask.intrusionRisk}` : '暂无预警任务，等待接入实时热成像。'}
        </div>
      </Panel>
      <Panel title="预警任务列表" icon={BellRing}>
        <TaskGrid tasks={props.tasks} onView={props.setSelectedTask} compact />
      </Panel>
    </section>
  )
}

function AiTab(props: TabStateProps) {
  return (
    <section className="grid grid-cols-[1fr_.9fr] gap-4">
      <Panel title="AI 研判" icon={BrainCircuit}>
        <LiveFusionPanel />
        <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {props.liveFusion?.analysis.aiSummary || 'AI 分析将读取实时热成像、地图和 DJI 接入配置。'}
        </div>
      </Panel>
      <Panel title="接口状态" icon={Database}>
        <div className="space-y-3">
          <StatusRow name="地图" value={props.integrationStatus?.map.provider || '未加载'} configured={props.integrationStatus?.map.configured || false} reachable={props.integrationStatus?.map.reachable} />
          <StatusRow name="AI" value={props.integrationStatus?.ai.endpoint || '未加载'} configured={props.integrationStatus?.ai.configured || false} reachable={props.integrationStatus?.ai.reachable} />
          <StatusRow name="DJI" value={props.integrationStatus?.dji.endpoint || '未加载'} configured={props.integrationStatus?.dji.configured || false} reachable={props.integrationStatus?.dji.reachable} />
          <StatusRow name="YOLO" value={props.integrationStatus?.yolo.endpoint || '未加载'} configured={props.integrationStatus?.yolo.configured || false} reachable={props.integrationStatus?.yolo.reachable} />
          <StatusRow name="热成像" value={props.integrationStatus?.thermal.source || '未加载'} configured={props.integrationStatus?.thermal.configured || false} reachable={props.integrationStatus?.thermal.reachable} />
        </div>
      </Panel>
    </section>
  )
}

function DispatchTab(props: TabStateProps) {
  return (
    <section className="grid grid-cols-[.9fr_1.1fr] gap-4">
      <Panel title="处警联动流程" icon={Radar}>
        <ProcessFlow level={props.currentLevel} />
        <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          从边缘感知、融合研判、预警推送到处警调度和留痕复盘，保留原有闭环流程。
        </div>
      </Panel>
      <Panel title="分级处置预案" icon={Route}>
        <DispatchGrid task={undefined} level={props.currentLevel} levelBg={props.level.bg} />
      </Panel>
    </section>
  )
}

function HistoryTab(props: TabStateProps) {
  const completed = props.tasks.filter((task) => task.status === 'COMPLETED' || task.aggregatedAt)
  return (
    <section className="grid grid-cols-[1fr_1fr] gap-4">
      <Panel title="留痕复盘" icon={Database}>
        <div className="space-y-3">
          {(completed.length ? completed : props.tasks).map((task) => (
            <button key={task.id} onClick={() => props.setSelectedTask(task)} className="w-full rounded-md border border-slate-200 bg-white p-3 text-left text-sm hover:bg-slate-50">
              <strong className="text-slate-900">{task.name}</strong>
              <div className="mt-1 text-xs text-slate-500">{task.status} · {levelStyle[task.warningLevel].label} · {task.updatedAt}</div>
            </button>
          ))}
          {!props.tasks.length ? <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">暂无可复盘记录。</div> : null}
        </div>
      </Panel>
      <Panel title="模型汇总记录" icon={CheckCircle2}>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="当前版本" value={props.modelStatus.version} />
          <Metric label="数据图片" value={props.modelStatus.datasetImages} />
          <Metric label="mAP50" value={props.modelStatus.map50.toFixed(3)} />
          <Metric label="最近来源" value={props.modelStatus.source} />
        </div>
      </Panel>
    </section>
  )
}

function PersonnelTab(props: TabStateProps) {
  return <PersonnelManagement currentLevel={props.currentLevel} />
}

function SettingsTab(props: TabStateProps) {
  return (
    <section className="grid grid-cols-[1fr_1fr] gap-4">
      <Panel title="系统设置" icon={Database}>
        <div className="space-y-3">
          <StatusRow name="中国地图 API" value={props.integrationStatus?.map.provider || '未加载'} configured={props.integrationStatus?.map.configured || false} reachable={props.integrationStatus?.map.reachable} />
          <StatusRow name="AI 分析接口" value={`${props.integrationStatus?.ai.provider || '未加载'} / ${props.integrationStatus?.ai.endpoint || '未配置'}`} configured={props.integrationStatus?.ai.configured || false} reachable={props.integrationStatus?.ai.reachable} />
          <StatusRow name="DJI 司空 / FlightHub 2" value={`${props.integrationStatus?.dji.provider || '未加载'} / ${props.integrationStatus?.dji.endpoint || '未配置'}`} configured={props.integrationStatus?.dji.configured || false} reachable={props.integrationStatus?.dji.reachable} />
          <StatusRow name="YOLO 服务" value={`${props.integrationStatus?.yolo.provider || '未加载'} / ${props.integrationStatus?.yolo.endpoint || '未配置'}`} configured={props.integrationStatus?.yolo.configured || false} reachable={props.integrationStatus?.yolo.reachable} />
          <StatusRow name="实时热成像" value={`${props.integrationStatus?.thermal.provider || '未加载'} / ${props.integrationStatus?.thermal.source || '未配置'}`} configured={props.integrationStatus?.thermal.configured || false} reachable={props.integrationStatus?.thermal.reachable} />
          <StatusRow name="三维分析" value={`${props.integrationStatus?.threeD?.provider || '未加载'} / ${props.integrationStatus?.threeD?.endpoint || '未配置'}`} configured={props.integrationStatus?.threeD?.configured || false} reachable={props.integrationStatus?.threeD?.reachable} />
        </div>
        <div className="mt-4">
          <IntegrationSettings />
        </div>
      </Panel>
      <Panel title="实时研判状态" icon={CheckCircle2}>
        <LiveFusionPanel />
      </Panel>
    </section>
  )
}

function TaskGrid({ tasks, onView, compact = false }: { tasks: TrainingTask[]; onView: (task: TrainingTask) => void; compact?: boolean }) {
  if (!tasks.length) {
    return <div className="rounded-lg border border-dashed border-slate-300 bg-white py-12 text-center text-slate-500">暂无任务，等待实时研判接入。</div>
  }
  return (
    <section className={compact ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-3 gap-4'}>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onView={onView} />
      ))}
    </section>
  )
}

function DispatchGrid({ task, level, levelBg }: { task?: TrainingTask; level: WarningLevel; levelBg: string }) {
  const items =
    task?.dispatchPlan ||
    ({
      RED: ['立即疏散群众', '实施交通管制', '调派专业救援力量', '指挥中心全程留痕'],
      ORANGE: ['巡护力量前置', '村寨联络员提醒', '无人机复飞跟踪', '准备交通劝导'],
      YELLOW: ['持续观察 1-2 小时', '核对历史轨迹', '村民端注意提醒', '保留升级规则'],
      BLUE: ['常态监测', '记录位置方向', '订阅项圈轨迹', '无需立即处警'],
    }[level] || [])
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, index) => (
        <div key={item} className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
          <span className={`mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${levelBg}`}>{index + 1}</span>
          {item}
        </div>
      ))}
    </div>
  )
}

function ProcessFlow({ level }: { level: WarningLevel }) {
  const steps = ['边缘感知', '融合研判', `${levelStyle[level].label}推送`, '处警调度', '留痕复盘']
  return (
    <div className="grid grid-cols-5 gap-2">
      {steps.map((step, index) => (
        <div key={step} className="rounded-md bg-slate-50 p-3 text-center">
          <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${levelStyle[level].bg}`}>{index + 1}</div>
          <div className="text-sm font-medium text-slate-800">{step}</div>
        </div>
      ))}
    </div>
  )
}

function LatestTaskStages({ task, onCreate }: { task: TrainingTask; onCreate: () => void }) {
  return (
    <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">最新研判流程</h2>
        <button onClick={onCreate} className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          <Plus size={16} />
          新建任务
        </button>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {task.stages.map((stage) => (
          <div key={stage.key} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <strong className="text-slate-800">{stage.name}</strong>
              <span className="text-slate-500">{stage.status}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <div className={`h-full rounded-full ${levelStyle[task.warningLevel].bar}`} style={{ width: `${stage.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function IntegrationRow({ name, configured, detail }: { name: string; configured: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3">
      <div>
        <div className="text-sm font-semibold text-slate-900">{name}</div>
        <div className="mt-1 text-xs text-slate-500">{detail}</div>
      </div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${configured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
        {configured ? '已配置' : '待配置'}
      </span>
    </div>
  )
}

function StatusRow({ name, value, configured, reachable }: { name: string; value: string; configured: boolean; reachable?: boolean }) {
  return <IntegrationRow name={name} detail={reachable === undefined ? value : `${value} · ${reachable ? '已连通' : '待验证'}`} configured={configured && reachable !== false} />
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={20} className="text-emerald-700" />
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function MetricTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <Icon size={20} className="mb-3 text-slate-700" />
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 truncate text-base font-bold text-slate-900">{value}</div>
    </div>
  )
}

function WarningPopup({ task, onClose }: { task: TrainingTask; onClose: () => void }) {
  const style = levelStyle[task.warningLevel]
  return (
    <div className="fixed right-5 top-5 z-50 w-[420px] rounded-lg border border-white/30 bg-white p-4 shadow-2xl">
      <div className="flex gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${style.bg}`}>{style.short}</div>
        <div>
          <strong className="text-slate-900">{style.label}通知</strong>
          <p className="mt-1 text-sm leading-5 text-slate-600">{task.name}，风险指数 {task.intrusionRisk}，预测窗口 {task.predictionWindow}。</p>
          <button onClick={onClose} className="mt-3 rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white">确认接收</button>
        </div>
      </div>
    </div>
  )
}

function TrainingResultModal({ task, onConfirm, onClose }: { task: TrainingTask; onConfirm: () => void; onClose: () => void }) {
  const style = levelStyle[task.warningLevel]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className={`rounded-full px-3 py-1 text-sm font-bold text-white ${style.bg}`}>{style.label}</span>
            <h2 className="mt-3 text-xl font-bold text-slate-900">结果待确认</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">关闭</button>
        </div>
        <p className="mb-4 text-sm leading-6 text-slate-600">{task.aiSummary}</p>
        <div className="mb-4 grid grid-cols-4 gap-3">
          <Metric label="风险" value={task.intrusionRisk} />
          <Metric label="mAP50" value={String(task.metrics?.mAP50 ?? '-')} />
          <Metric label="Precision" value={String(task.metrics?.precision ?? '-')} />
          <Metric label="Recall" value={String(task.metrics?.recall ?? '-')} />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2">暂不汇总</button>
          <button onClick={onConfirm} className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700">确认并汇总</button>
        </div>
      </div>
    </div>
  )
}

function TaskDetail({ task, onClose }: { task: TrainingTask; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4" onClick={onClose}>
      <div className="max-h-[82vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <h2 className="mb-3 text-lg font-bold text-slate-900">{task.name}</h2>
        <p className="mb-4 text-sm leading-6 text-slate-600">{task.aiSummary}</p>
        <pre className="rounded-md bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(task, null, 2)}</pre>
      </div>
    </div>
  )
}
>>>>>>> a82e6ef3c0922919ec98651f9d917808aa28e81b
