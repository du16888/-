import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import {
  Bell, Send, Mic, ChevronDown, Paperclip, Search, FolderOpen,
  Clock, AlertCircle, Plus, Star, TrendingUp, X, RefreshCw,
  ThumbsUp, ThumbsDown, Copy, FileBarChart, BookOpen, ArrowLeft,
  CheckSquare, Zap, ChevronRight, Bot,
  MessageCircle, Calendar, FileText, LayoutGrid, Users, Cpu, Minus, Square
} from "lucide-react";
import logo from "@/imports/____LOGO.png";
import aiAvatar from "@/imports/1___3x_21_.png";
import taskAvatar from "@/imports/1___3x_25_.png";

const B1 = "#2E6BE6";
const B2 = "#6B9CF2";
const B3 = "#A8C4F8";
const B4 = "#D7E1F7";
const DD_BLUE = "#337EFF";
const DD_BLUE_LIGHT = "#EBF2FF";
const DD_RED = "#FF4D4F";
const DD_RED_LIGHT = "#FFF1F0";
const DD_ORANGE = "#FA8C16";
const DD_ORANGE_LIGHT = "#FFF7E6";
const DD_GREEN = "#52C41A";
const DD_GRAY = "#8F959E";
const DD_GRAY_LIGHT = "#F5F6F8";

type TaskStatus = "urgent" | "new" | "processing" | "done" | "pending";
type AITab = "chat" | "docs" | "analytics";
type MobilePanel = "tasks" | "ai";
type DDNav = "消息" | "日程" | "文档" | "AI表格" | "工作台" | "通讯录";

interface Task {
  id: string; project: string; title: string; type: string;
  status: TaskStatus; assignee: string; deadline: string;
  desc: string; priority: "high" | "medium" | "low"; steps?: string[];
  dept?: string; tags?: string[];
  feeData?: { rate: number; target: number; total: number; unpaid: number; longOverdue: number; amount: string };
}
interface Message {
  id: string; role: "user" | "agent"; content: string; time: string;
  typing?: boolean; suggestions?: string[];
  actionable?: { label: string; prompt: string }[];
}
interface Schedule {
  id: string; title: string; date: string; time: string;
  location?: string; type: "会议" | "日历" | "提醒"; urgent?: boolean;
  aiTip?: string;
  category: "会议" | "钉钉待办" | "今日提醒";
}
interface UnreadMsg {
  id: string; from: string; avatar: string; title: string;
  content: string; time: string; type: "审批" | "通知" | "群消息" | "系统";
}

const AGENTS = [
  { key:"contract",    label:"合同助理",     color:"#722ED1" },
  { key:"payment",     label:"请款助理",     color:"#13C2C2" },
  { key:"order-review",label:"审单助理",     color:"#52C41A" },
  { key:"appearance",  label:"仪容仪表助理", color:"#FA8C16" },
];

const PROJECT = "时代云图（佛山）二期";

const tasks: Task[] = [
  { id:"t1", project:PROJECT, title:"消防设备维护运维合同审查", type:"合同审查", status:"urgent", assignee:"郑赵峰", deadline:"2026.06.30", desc:"配套消防设备维护运维合同已超期，需与配套消防公司（CC2）重新签署，并完成合同条款合规审查。AI已完成初步条款比对，可自动识别关键风险条款，待人工确认后完成审查签订。", priority:"high", steps:["核查现有合同到期情况","上传合同至AI识别关键条款","确认审查结果并提交签字","归档备案"] },
  { id:"t2", project:PROJECT, title:"03栋大堂天花板渗水维修工单", type:"工单", status:"processing", assignee:"工程维修组", deadline:"2026.06.25", desc:"03栋大堂天花板发现渗水迹象，已拍照存档并生成维修工单。工程组已派人查看，需跟进维修进度并确认修复效果，今日内处理完毕。", priority:"high", steps:["现场查看渗水原因","联系专业维修人员","完成维修并拍照记录","通知物业经理验收"] },
  { id:"t3", project:PROJECT, title:"停车场经营方案制定", type:"项目进场", status:"new", assignee:"项目经理", deadline:"进场后7天内", dept:"项目管理部", tags:["空间运营","公共资源"], desc:"停车场经营方案制定，并完成定价方案审批（前提为车场已竣备交付）", priority:"medium", steps:["提交审批内容","AI协助检查","AI检查完成提交流程审批"] },
  { id:"t4", project:PROJECT, title:"网格化日常安全巡查", type:"巡检任务", status:"new", assignee:"网格-建筑维修组", deadline:"2026.06.25", desc:"网格化建筑维修组日常巡查任务，需对各网格内终端设备进行清点，记录损耗情况，处理巡查中发现的工单问题，确保24小时内响应。", priority:"medium", steps:["开始网格巡查","语音记录问题与终端清点","AI识别生成工单和清点报告","提交并继续下一网格"] },
  { id:"t6", project:PROJECT, title:"业主满意度回访客户跟进", type:"客户跟进", status:"processing", assignee:"客服部", deadline:"2026.06.28", desc:"针对上季度满意度调研中有投诉反馈的业主进行复访跟进，了解问题解决情况，记录业主意见并汇总分析结果，提交管理层用于服务改善参考。", priority:"medium", steps:["整理上季度满意度数据","制定回访话术","执行电话回访","汇总反馈报告"] },
  { id:"t7", project:"时代邻里西南区域二公司", title:"置信花园城2026年车场改造合同审批", type:"合同审批", status:"urgent", assignee:"王莉", deadline:"2026.06.29", desc:"SRM合同审批：置信花园城2026年车场改造合同（HTBM-2026041400015），签约金额¥13,000，AI法务智能体已识别2处条款冲突风险，需人工确认后完成审批。", priority:"high" },
];

const historyChats = [
  { id:"h1", title:"消防合同洽谈分析", time:"今天 09:12", preview:"已为您生成合同核心条款对比..." },
  { id:"h2", title:"Q2季度报告生成", time:"昨天 16:30", preview:"报告大纲已完成，财务板块数据..." },
  { id:"h3", title:"装修申请审批流程", time:"06月14日", preview:"标准装修申请需提交以下材料..." },
  { id:"h4", title:"客户投诉处理建议", time:"06月12日", preview:"针对此类投诉建议三步走处理..." },
];

const schedules: Schedule[] = [
  { id:"sc1", title:"时代云图（佛山）二期晨会沟通", date:"06/25", time:"09:00-09:30", location:"物业服务中心门口", type:"会议", category:"会议", aiTip:"会议重点是解决业主投诉以及仪容仪表整理" },
  { id:"sc2", title:"项目区域重点工作跟进情况", date:"06/25", time:"10:00-10:30", location:"会议室A", type:"会议", category:"会议", aiTip:"会议重点是落实大管家客诉、维修工单及时响应、跟进处理情况" },
  { id:"sc3", title:"外包单位会议（含环境类、工程类），监督合同履约和请款", date:"06/25", time:"14:00-14:30", location:"会议室A", type:"会议", category:"会议", aiTip:"会议重点是外包单位合同需说明具体负责区域并落实" },
  { id:"sc4", title:"工程维修群 @了您：请确认本周电梯月度维保计划安排", date:"今天", time:"11:30", type:"提醒", category:"钉钉待办", aiTip:"AI建议：上月已完成3台电梯保养，本次重点关注B栋2号梯异响问题，建议优先排期" },
  { id:"sc5", title:"03栋1203投诉噪音超24小时未响应，请今日跟进处理", date:"今天", time:"全天", type:"提醒", category:"今日提醒", aiTip:"AI提示：业主投诉持续未处理将影响满意度评分，建议管家主动电话联系并在系统内反馈处理进展" },
];

const unreadMsgs: UnreadMsg[] = [
  { id:"um1", from:"审批系统", avatar:"审", title:"供应商B续签合同待您审批", content:"供应商B提交了年度服务续签合同，请在2个工作日内完成审批。", time:"09:15", type:"审批" },
  { id:"um2", from:"工程维修组", avatar:"工", title:"03栋大堂渗水问题已派单", content:"已按工单要求派遣维修人员，预计今日下午3点前处理完毕，请关注跟进。", time:"08:52", type:"通知" },
  { id:"um3", from:"物业费提醒", avatar:"费", title:"催费任务进展：已跟进38户", content:"管家团队今日已完成38户催费跟进，其中12户已缴费，请查看详情。", time:"08:30", type:"系统" },
];

const docs = [
  { title:"2026年Q2季度项目进展报告模板", type:"docx", updated:"1小时前", hot:true },
  { title:"时代外滩-消防维护合同范本", type:"pdf", updated:"昨天", hot:false },
  { title:"装修申请审批流程说明", type:"docx", updated:"3天前", hot:false },
  { title:"客户满意度调研问卷", type:"xlsx", updated:"1周前", hot:true },
  { title:"供应商资质审核清单", type:"xlsx", updated:"2周前", hot:false },
  { title:"网格化巡检问题汇总表", type:"xlsx", updated:"3周前", hot:false },
];

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  urgent:     { label:"紧急",  color:DD_RED,    bg:"#FFF1F0" },
  new:        { label:"新任务", color:DD_BLUE,   bg:DD_BLUE_LIGHT },
  processing: { label:"处理中", color:DD_ORANGE, bg:"#FFF7E6" },
  done:       { label:"已完成", color:DD_GREEN,  bg:"#F6FFED" },
  pending:    { label:"待处理", color:DD_GRAY,   bg:"#F5F6F8" },
};

const priorityBorder: Record<string, string> = { high:DD_RED, medium:DD_ORANGE, low:DD_GRAY };

const typeColors: Record<string, string> = {
  "合同审查":"#722ED1","工单":"#1890FF","项目进场":"#13C2C2",
  "巡检任务":"#52C41A","装修申请":"#FA8C16","客户跟进":"#FF4D4F",
  "合同签订":"#722ED1","合同审批":"#722ED1","客户服务":"#1890FF",
  "报告提交":"#FF4D4F","合规审查":"#8F959E","催费跟进":"#FF4D4F",
};

function buildAIReply(task: Task) {
  const isContract = task.type === "合同签订";
  const content = `我已对「${task.title}」进行了全面分析，为您制定以下处理方案：

**📋 任务概况**
项目：${task.project} ｜ 类型：${task.type} ｜ 截止：${task.deadline}
负责人：${task.assignee}

**🔍 AI 分析结论**
${task.desc}

**✅ 建议处理步骤**
${task.steps?.map((s, i) => `${i + 1}. ${s}`).join("\n")}
${isContract ? "\n**⚡ 此任务可由 AI 自动完成合同识别与录入，是否确认由 AI 操作？**" : "\n**⚡ 我可以帮您自动处理以下步骤，是否确认？**"}`;
  const actionable = isContract
    ? [
        { label: "✅ 确认，由 AI 自动操作合同智能体", prompt: "__OPEN_CONTRACT_AGENT__" },
        { label: "📄 先查看合同范本再决定", prompt: `请展示「${task.title}」的合同范本` },
      ]
    : [
        { label: `✨ AI 自动执行：${task.steps?.[1] ?? task.steps?.[0]}`, prompt: `请帮我自动处理「${task.title}」第二步` },
        { label: "📄 生成相关文档模板", prompt: `请为「${task.title}」生成所需文档模板` },
        { label: `📨 通知 ${task.assignee} 跟进`, prompt: `请起草通知发给${task.assignee}，告知任务进展` },
      ];
  return { content, actionable };
}

function TaskBadge({ status }: { status: TaskStatus }) {
  const c = statusConfig[status];
  return <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ color:c.color, backgroundColor:c.bg }}>{c.label}</span>;
}

function TypeTag({ type }: { type: string }) {
  const color = typeColors[type] ?? DD_GRAY;
  return <span className="text-xs px-1.5 py-0.5 rounded-sm border" style={{ color, borderColor:color+"40", backgroundColor:color+"10" }}>{type}</span>;
}

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <div onClick={onClick} className="rounded-lg cursor-pointer transition-all duration-150 p-3 mb-2"
      style={{
        backgroundColor:"#fff",
        borderStyle:"solid",
        borderTopWidth:"1px", borderRightWidth:"1px", borderBottomWidth:"1px",
        borderTopColor:"#E8E9EB", borderRightColor:"#E8E9EB", borderBottomColor:"#E8E9EB",
        borderLeftWidth:"3px", borderLeftColor:priorityBorder[task.priority],
      }}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <TypeTag type={task.type} />
          <TaskBadge status={task.status} />
        </div>
        <span className="text-xs shrink-0" style={{ color:DD_GRAY }}>{task.deadline.split(" ")[0]}</span>
      </div>
      <p className="text-sm font-medium leading-snug mb-1" style={{ color:"#1F2329" }}>
        <span className="text-xs mr-1" style={{ color:DD_BLUE }}>[{task.project}]</span>
        {task.title}
      </p>
      <p className="text-xs leading-relaxed line-clamp-2" style={{ color:DD_GRAY }}>{task.desc}</p>
      {task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          {task.tags.map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor:"#F0F5FF", color:DD_BLUE }}>{tag}</span>
          ))}
          {task.dept && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor:"#F6FFED", color:DD_GREEN }}>{task.dept}</span>}
        </div>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor:DD_BLUE }}>{task.assignee[0]}</div>
          <span className="text-xs" style={{ color:DD_GRAY }}>{task.assignee}</span>
        </div>
        <ChevronRight size={13} style={{ color:DD_GRAY }} />
      </div>
    </div>
  );
}

// ─── Work Order Modal ─────────────────────────────────────────────────────────
const VOICE_TEXT = "03栋大堂天花瓷砖有渗水情况，需派工程人员及时查看";

type WOStep = "record" | "recording" | "form";

function WorkOrderModal({ task, onClose, onInspectionDone, onComplete }: { task: Task; onClose: () => void; onInspectionDone?: () => void; onComplete?: () => void }) {
  const isInspection = task.type === "巡检任务";
  const [photos, setPhotos] = useState<string[]>([]);
  const [step, setStep] = useState<WOStep>("record");
  const [liveText, setLiveText] = useState("");
  const [orderForm, setOrderForm] = useState({
    location: "时代云图（佛山）二期 · 03栋大堂",
    content: VOICE_TEXT,
    handler: "工程维修组",
    time: new Date().toLocaleString("zh-CN", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" }).replace(/\//g,"-"),
  });
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const liveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fakePhoto = () => {
    const colors = ["#D7E1F7","#F6FFED","#FFF7E6","#EBF2FF","#F9F0FF"];
    setPhotos(p => [...p, colors[p.length % colors.length]]);
  };

  // Start recording + live transcription character-by-character
  const handleRecord = () => {
    setStep("recording");
    setLiveText("");
    let i = 0;
    liveRef.current = setInterval(() => {
      i++;
      setLiveText(VOICE_TEXT.slice(0, i));
      if (i >= VOICE_TEXT.length) {
        clearInterval(liveRef.current!);
        // Short pause then show form
        setTimeout(() => { setStep("form"); setOrderForm(f => ({ ...f, content: VOICE_TEXT })); }, 600);
      }
    }, 90);
  };

  useEffect(() => () => { if (liveRef.current) clearInterval(liveRef.current); }, []);

  const handleSubmit = () => setSubmitted(true);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor: "#fff", maxHeight: "92vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "#E8E9EB" }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: "#1F2329" }}>
              {isInspection ? "巡检工单记录" : "工单处理记录"}
            </div>
            <div className="text-xs mt-0.5 truncate max-w-xs" style={{ color: DD_GRAY }}>{task.title}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}>
            <X size={14} />
          </button>
        </div>

        {/* ── Success ── */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 px-8 py-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F6FFED" }}>
              <CheckSquare size={26} style={{ color: DD_GREEN }} />
            </div>
            <div className="text-base font-semibold" style={{ color: "#1F2329" }}>工单已提交</div>
            <p className="text-sm text-center leading-relaxed" style={{ color: DD_GRAY }}>
              工单已派发至工程维修组，终端清点数据已同步网格化系统，AI 助理将汇总本次巡查结果。
            </p>
            {isInspection && (
              <div className="flex flex-col gap-2 w-full mt-1">
                <button onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ backgroundColor: DD_BLUE }}>
                  继续巡查
                </button>
                <button
                  onClick={() => { onClose(); onInspectionDone?.(); }}
                  className="w-full py-2.5 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}>
                  结束巡查并关闭任务
                </button>
              </div>
            )}
            {!isInspection && (
              <button onClick={() => { onComplete?.(); onClose(); }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}>
                完成，返回任务列表
              </button>
            )}
          </div>

        ) : step === "recording" ? (
          /* ── Live transcription while recording ── */
          <div className="flex flex-col flex-1 px-5 py-6 gap-4">
            {/* Mic animation */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: DD_RED }} />
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FFF1F0" }}>
                  <span style={{ fontSize: 26 }}>🎙️</span>
                </div>
              </div>
              {/* Waveform bars */}
              <div className="flex items-center gap-1">
                {[2,4,6,5,3,6,4,2,5,3,6,4].map((h, i) => (
                  <div key={i} className="w-1 rounded-full animate-pulse"
                    style={{ height: h * 4, backgroundColor: DD_RED, animationDelay: `${i * 0.08}s`, animationDuration: "0.6s" }} />
                ))}
              </div>
              <span className="text-xs font-medium" style={{ color: DD_RED }}>录音识别中...</span>
            </div>

            {/* Live transcription box */}
            <div className="flex-1 rounded-xl p-4" style={{ backgroundColor: "#F8F9FB", border: "1px solid #E8E9EB", minHeight: 80 }}>
              <div className="text-[10px] mb-2 flex items-center gap-1" style={{ color: DD_GRAY }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: DD_BLUE }} />
                AI 实时识别
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#1F2329" }}>
                {liveText}
                {liveText.length < VOICE_TEXT.length && (
                  <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle" style={{ backgroundColor: DD_BLUE }} />
                )}
              </p>
            </div>
          </div>

        ) : step === "form" && isInspection ? (
          /* ── Dual-recognition result: 工单 + 终端清点 ── */
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* Header label */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F6FFED" }}>
                <span style={{ color: DD_GREEN, fontSize: 9, fontWeight: 700 }}>✓</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: DD_GREEN }}>AI 语音识别完成，可手动修改</span>
            </div>
            <div className="rounded-lg px-3 py-2 flex items-start gap-2" style={{ backgroundColor: "#EBF2FF", border: `1px solid ${DD_BLUE}20` }}>
              <Zap size={11} className="shrink-0 mt-0.5" style={{ color: DD_BLUE }} />
              <p className="text-[11px] leading-relaxed" style={{ color: DD_BLUE }}>修改后的结果将自动同步至网格化系统，并由 AI 助理汇总后推送提醒给您。</p>
            </div>

            {/* Block 1: 工单 */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E8E9EB" }}>
              <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ backgroundColor: "#F8F9FB", borderColor: "#E8E9EB" }}>
                <span style={{ fontSize: 13 }}>🔧</span>
                <span className="text-xs font-semibold" style={{ color: "#1F2329" }}>工单识别</span>
              </div>
              {([
                { label: "位置", field: "location" as const },
                { label: "问题", field: "content" as const },
                { label: "派单", field: "handler" as const },
              ] as const).map(({ label, field }) => (
                <div key={field} className="flex items-center px-3 py-2 border-b" style={{ borderColor: "#F0F2F5" }}>
                  <span className="text-xs shrink-0 w-10" style={{ color: DD_GRAY }}>{label}</span>
                  <input className="flex-1 text-xs outline-none bg-transparent" style={{ color: "#1F2329" }}
                    value={orderForm[field]}
                    onChange={e => { const v = e.target.value; setOrderForm(prev => ({ ...prev, [field]: v })); }} />
                </div>
              ))}
              <div className="flex items-center px-3 py-2" style={{ borderColor: "#F0F2F5" }}>
                <span className="text-xs shrink-0 w-10" style={{ color: DD_GRAY }}>时间</span>
                <span className="text-xs" style={{ color: "#1F2329" }}>{orderForm.time}</span>
              </div>
            </div>

            {/* Block 2: 网格终端清点 — simplified for field staff */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E8E9EB" }}>
              <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ backgroundColor: "#F8F9FB", borderColor: "#E8E9EB" }}>
                <span style={{ fontSize: 13 }}>📡</span>
                <span className="text-xs font-semibold" style={{ color: "#1F2329" }}>网格终端清点</span>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "#F6FFED", color: DD_GREEN }}>AI 识别</span>
              </div>
              {[
                { label: "大类",   value: "建筑物",           editable: false },
                { label: "楼栋",   value: "LB00004141",       editable: false },
                { label: "网格",   value: "洋房03 / 公区 / 首层 / 大堂及电梯厅", editable: true },
                { label: "材料",   value: "饰面材料 / 砖",      editable: true },
                { label: "规格",   value: "/",                editable: true },
                { label: "数量",   value: "1",                editable: true },
                { label: "损耗数",  value: "1",                editable: true },
                { label: "损耗率",  value: "6.1%",             editable: false },
              ].map(({ label, value, editable }, i, arr) => (
                <div key={label} className={`flex items-center px-3 py-2.5 ${i < arr.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "#F0F2F5", backgroundColor: i % 2 === 0 ? "#fff" : "#FAFBFC" }}>
                  <span className="text-xs shrink-0 w-10" style={{ color: DD_GRAY }}>{label}</span>
                  {editable
                    ? <input className="flex-1 text-xs outline-none bg-transparent font-medium" defaultValue={value} style={{ color: "#1F2329" }} />
                    : <span className="text-xs font-medium" style={{ color: label === "损耗率" ? DD_ORANGE : "#1F2329" }}>{value}</span>
                  }
                  {label === "损耗率" && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: "#FFF7E6", color: DD_ORANGE }}>偏高</span>
                  )}
                  {editable && label !== "损耗率" && <span className="text-[9px] ml-1 shrink-0" style={{ color: "#C5D0E8" }}>可改</span>}
                </div>
              ))}
            </div>

            {/* Photo row */}
            <div>
              <div className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: DD_GRAY }}>
                <span>📷</span> 现场照片
              </div>
              <div className="flex gap-2 flex-wrap">
                {photos.map((color, i) => (
                  <div key={i} className="w-12 h-12 rounded-lg flex items-center justify-center text-[10px] relative"
                    style={{ backgroundColor: color, border: "1px solid #E8E9EB" }}>
                    <span style={{ color: DD_GRAY }}>照片{i+1}</span>
                    <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-white flex items-center justify-center"
                      style={{ backgroundColor: DD_RED, fontSize: 8 }}>✕</button>
                  </div>
                ))}
                <button onClick={fakePhoto}
                  className="w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5"
                  style={{ border: `2px dashed ${DD_BLUE}`, backgroundColor: DD_BLUE_LIGHT }}>
                  <span style={{ fontSize: 16 }}>📷</span>
                  <span className="text-[9px]" style={{ color: DD_BLUE }}>拍照</span>
                </button>
              </div>
            </div>
          </div>

        ) : (
          /* ── Default record step ── */
          <div className="flex-1 overflow-y-auto">
            <div className="mx-4 mt-4 rounded-xl p-3 flex items-center gap-3"
              style={{ backgroundColor: "#F8F9FB", border: "1px solid #E8E9EB" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: DD_BLUE_LIGHT }}>
                <CheckSquare size={14} style={{ color: DD_BLUE }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: "#1F2329" }}>{task.project} · {task.type}</div>
                <div className="text-xs" style={{ color: DD_GRAY }}>负责人：{task.assignee} · 截止 {task.deadline}</div>
              </div>
            </div>
            <div className="px-4 py-4 space-y-4">
              {/* Photo */}
              <div>
                <div className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#1F2329" }}>
                  <span>📷</span> 现场拍照记录
                </div>
                <div className="flex gap-2 flex-wrap">
                  {photos.map((color, i) => (
                    <div key={i} className="w-16 h-16 rounded-xl flex items-center justify-center text-xs font-medium relative"
                      style={{ backgroundColor: color, border: "1px solid #E8E9EB" }}>
                      <span style={{ color: DD_GRAY }}>照片{i+1}</span>
                      <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: DD_RED, fontSize: 9 }}>✕</button>
                    </div>
                  ))}
                  <button onClick={fakePhoto}
                    className="w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1"
                    style={{ border: `2px dashed ${photos.length ? "#C5D0E8" : DD_BLUE}`, backgroundColor: photos.length ? "#fff" : DD_BLUE_LIGHT }}>
                    <span style={{ fontSize: 20 }}>📷</span>
                    <span className="text-[10px]" style={{ color: DD_BLUE }}>拍照</span>
                  </button>
                </div>
              </div>
              {/* Voice */}
              <div>
                <div className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#1F2329" }}>
                  <span>🎙️</span> {isInspection ? "语音记录巡检情况（AI 自动识别生成工单）" : "语音记录"}
                </div>
                <button onClick={handleRecord}
                  className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
                  style={{ backgroundColor: DD_BLUE_LIGHT, color: DD_BLUE, border: `1px solid ${DD_BLUE}40` }}>
                  <span style={{ fontSize: 16 }}>🎙️</span>
                  {"点击开始录音，AI 边录边识别"}
                </button>
              </div>
              {/* Text note (non-inspection only) */}
              {!isInspection && (
                <div>
                  <div className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#1F2329" }}>
                    <span>📝</span> 处理说明
                  </div>
                  <textarea rows={3}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                    placeholder="请输入处理情况说明..."
                    value={note} onChange={e => setNote(e.target.value)}
                    style={{ backgroundColor: "#F8F9FB", border: "1px solid #E8E9EB", color: "#1F2329" }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom actions */}
        {!submitted && step !== "transcribing" && (
          <div className="flex gap-3 px-4 py-3 border-t shrink-0" style={{ borderColor: "#E8E9EB" }}>
            {step === "record" ? (
              <>
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}>暂存草稿</button>
                <button onClick={handleSubmit}
                  disabled={!note && photos.length === 0}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ backgroundColor: DD_GREEN, opacity: (!note && photos.length === 0) ? 0.4 : 1 }}>
                  确认结单
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setStep("record")} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}>重新录音</button>
                <button onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ backgroundColor: DD_GREEN }}>
                  提交工单
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BPM Approval Modal ───────────────────────────────────────────────────────
function BpmApprovalModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitType, setSubmitType] = useState<"approve" | "reject" | null>(null);

  const handleApprove = () => { setSubmitType("approve"); setSubmitted(true); };

  const handleRejectConfirm = () => {
    if (!rejectComment.trim()) return;
    setSubmitType("reject");
    setSubmitted(true);
  };

  const APPLY_INFO: [string, string][] = [
    ["申请人", "李先生（B区24栋802）"],
    ["申请类型", "普通装修"],
    ["申请日期", "2026-06-24"],
    ["发起管家", "张小华"],
    ["装修时限", "2026-07-01 至 2026-09-30"],
  ];

  const RENO_DETAIL: [string, string][] = [
    ["装修范围", "室内全屋装修"],
    ["施工区域", "客厅、主卧、次卧、厨房、卫生间"],
    ["施工时段", "每日 09:00–18:00（工作日）"],
    ["施工方式", "业主自行委托持证施工队"],
  ];

  const FLOW_NODES = [
    { label: "管家发起", done: true },
    { label: "项目经理审批", active: true },
    { label: "完成", done: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor: "#fff", maxHeight: "92vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "#E8E9EB" }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: "#1F2329" }}>装修申请审批</div>
            <div className="text-xs mt-0.5" style={{ color: DD_GRAY }}>管家张小华代业主发起 · 待您审批</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}><X size={14} /></button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: submitType === "approve" ? "#F6FFED" : "#FFF1F0" }}>
              {submitType === "approve"
                ? <CheckSquare size={28} style={{ color: DD_GREEN }} />
                : <X size={28} style={{ color: DD_RED }} />}
            </div>
            <div className="text-center">
              <p className="text-base font-semibold" style={{ color: "#1F2329" }}>
                {submitType === "approve" ? "已同意，流程已提交" : "已退回，意见已发送"}
              </p>
              <p className="text-xs mt-1.5" style={{ color: DD_GRAY }}>
                {submitType === "approve"
                  ? "装修申请已批准，业主将收到通知"
                  : "退回意见已发送至管家和业主"}
              </p>
            </div>
            <button onClick={onComplete}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white mt-2"
              style={{ backgroundColor: DD_BLUE }}>关闭</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ backgroundColor: "#F8F9FB" }}>

              {/* 申请信息 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid #E8E9EB" }}>
                <div className="px-4 py-2.5 border-b" style={{ backgroundColor: "#F8F9FB", borderColor: "#E8E9EB" }}>
                  <span className="text-xs font-semibold" style={{ color: "#1F2329" }}>📋 申请信息</span>
                </div>
                {APPLY_INFO.map(([label, value]) => (
                  <div key={label} className="flex items-center px-4 py-2.5 border-b last:border-0" style={{ borderColor: "#F0F2F5" }}>
                    <span className="text-xs shrink-0 w-16" style={{ color: DD_GRAY }}>{label}</span>
                    <span className="text-xs font-medium" style={{ color: "#1F2329" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* 装修详情 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid #E8E9EB" }}>
                <div className="px-4 py-2.5 border-b" style={{ backgroundColor: "#F8F9FB", borderColor: "#E8E9EB" }}>
                  <span className="text-xs font-semibold" style={{ color: "#1F2329" }}>🏗️ 装修详情</span>
                </div>
                {RENO_DETAIL.map(([label, value]) => (
                  <div key={label} className="flex items-start px-4 py-2.5 border-b last:border-0" style={{ borderColor: "#F0F2F5" }}>
                    <span className="text-xs shrink-0 w-16 mt-0.5" style={{ color: DD_GRAY }}>{label}</span>
                    <span className="text-xs font-medium leading-relaxed" style={{ color: "#1F2329" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* 业主声明 */}
              <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: "1px solid #E8E9EB" }}>
                <div className="text-xs font-semibold mb-2" style={{ color: "#1F2329" }}>📝 业主声明</div>
                <p className="text-xs leading-relaxed" style={{ color: DD_GRAY }}>
                  本人承诺严格遵守《时代云图（佛山）二期住区装修管理规定》，按要求提前48小时报备施工人员，佩戴统一出入证件，施工期间注意噪音管控，不影响邻居正常生活。如有违规，愿承担相应责任。
                </p>
              </div>

              {/* 审批流程 */}
              <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: "1px solid #E8E9EB" }}>
                <div className="text-xs font-semibold mb-3" style={{ color: "#1F2329" }}>审批流程</div>
                <div className="flex items-start">
                  {FLOW_NODES.map((node, i) => (
                    <div key={node.label} className="flex items-start flex-1">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{
                            backgroundColor: node.done ? DD_GREEN : node.active ? DD_BLUE : "#F0F2F5",
                            color: node.done || node.active ? "#fff" : DD_GRAY,
                          }}>
                          {node.done ? "✓" : i + 1}
                        </div>
                        <span className="text-[10px] text-center leading-tight" style={{
                          color: node.active ? DD_BLUE : node.done ? DD_GREEN : DD_GRAY,
                          maxWidth: 52,
                        }}>{node.label}</span>
                      </div>
                      {i < FLOW_NODES.length - 1 && (
                        <div className="flex-1 h-px mt-3 mx-1" style={{ backgroundColor: node.done ? DD_GREEN : "#E8E9EB" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reject comment */}
              {rejecting && (
                <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: `1px solid ${DD_RED}40` }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: DD_RED }}>退回意见（必填）</div>
                  <textarea rows={3}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                    placeholder="请填写退回原因或修改意见..."
                    value={rejectComment}
                    onChange={e => setRejectComment(e.target.value)}
                    style={{ backgroundColor: "#F8F9FB", border: "1px solid #E8E9EB", color: "#1F2329" }} />
                </div>
              )}
            </div>

            {/* Bottom buttons */}
            <div className="flex gap-3 px-4 py-3 border-t shrink-0" style={{ borderColor: "#E8E9EB" }}>
              {!rejecting ? (
                <>
                  <button onClick={() => setRejecting(true)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: "#FFF1F0", color: DD_RED, border: `1px solid ${DD_RED}40` }}>
                    不同意
                  </button>
                  <button onClick={handleApprove}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                    style={{ backgroundColor: DD_GREEN }}>
                    同意
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setRejecting(false); setRejectComment(""); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}>
                    取消
                  </button>
                  <button onClick={handleRejectConfirm}
                    disabled={!rejectComment.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                    style={{ backgroundColor: DD_RED, opacity: !rejectComment.trim() ? 0.5 : 1 }}>
                    确认退回
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Business System redirect view ────────────────────────────────────────────
const BIZ_URL = "https://rcs.linli580.cn/do/page.aspx?pageid=w_80b8a879_6a26_428a_9919_be60285a68dd&isnewrecord=0&objectid=editenergy&submittable=&tableid=w_66ce69d1_9679_4187_b8ab_1c687c91e6b4&recordid=ea372f56-98c3-4674-8ed8-96a2c924b6ec&isRepateDialog=false&templet=&proid=90BBF7CB-E47A-45B9-B97B-F5672009BE1D&citycompanyid=DEB27A2C-8B4C-49C9-96D1-4458A3DCC55F&appid=&allhtml=1&menuid=b4b1059c_87f9_4991_9fa1_1e8b4d6f6ee0&alldic=1&loginid=duzhencheng&stamp=1781690096542&token=f1aaabbe0e0e03c3d2525770808f1635f59329a7";

function BizSystemView({ task, onClose }: { task: Task; onClose: () => void }) {
  const [jumped, setJumped] = useState(false);
  useEffect(() => {
    window.open(BIZ_URL, "_blank");
    const t = setTimeout(() => setJumped(true), 1000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col items-center gap-4"
        style={{ backgroundColor: "#fff" }}>
        {!jumped ? (
          <>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: DD_BLUE_LIGHT }}>
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${DD_BLUE}40`, borderTopColor: DD_BLUE }} />
            </div>
            <div className="text-sm font-semibold" style={{ color: "#1F2329" }}>正在跳转业务系统...</div>
            <div className="text-xs" style={{ color: DD_GRAY }}>合同签订管理平台</div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: DD_BLUE_LIGHT }}>
              <BookOpen size={22} style={{ color: DD_BLUE }} />
            </div>
            <div className="text-sm font-semibold" style={{ color: "#1F2329" }}>已打开业务系统</div>
            <p className="text-xs text-center" style={{ color: DD_GRAY }}>
              合同签订管理平台已在新页面打开，请在业务系统中完成「{task.title}」的签订操作。
            </p>
            <div className="w-full rounded-xl p-3 flex items-center gap-2"
              style={{ backgroundColor: "#F8F9FB", border: "1px solid #E8E9EB" }}>
              <span className="text-xs flex-1" style={{ color: DD_GRAY }}>合同管理系统 · 时代邻里 OA</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F6FFED", color: DD_GREEN }}>已连接</span>
            </div>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor: DD_BLUE }}>返回任务详情</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Parking Process Modal ───────────────────────────────────────────────────
const PARKING_FIELDS = [
  "栋数", "户数", "车位总数", "车位定价方式",
  "项目所属地区政府政策要求", "项目周边车场调研情况说明",
  "车场临停定价情况说明", "车场月保定价情况说明",
];

function ParkingProcessModal({ onClose, onComplete }: { onClose: () => void; onComplete?: () => void }) {
  type ChatMsg = { role:"agent"|"user"|"typing"; text: string; time?: string };
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [phase, setPhase] = useState<0|1|2|3|4|5>(0);
  // 0=init 1=fetching data 2=data ready, ask for pricing 3=received pricing 4=plan generated 5=flow submitted
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const pushAgent = (text: string, delay: number, cb?: () => void) => {
    setTimeout(() => {
      setChatMsgs(prev => [...prev.filter(m => m.role !== "typing"), { role:"agent", text, time: new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"}) }]);
      cb?.();
    }, delay);
  };

  const pushTyping = (delay: number) => {
    setTimeout(() => {
      setChatMsgs(prev => [...prev.filter(m => m.role !== "typing"), { role:"typing", text:"" }]);
    }, delay);
  };

  // Auto-start conversation on mount
  React.useEffect(() => {
    if (phase !== 0) return;
    setPhase(1);
    // Step 1: AI 自我介绍 + 调取数据
    pushAgent("您好！我是 AI 停车场经营助手。\n\n我将协助您完成「停车场经营方案制定」任务，现在正在调取车场系统中「时代云图（佛山）二期」的车场数据，请稍候...", 500, () => {
      pushTyping(2000);
      // Step 2: 数据调取成功
      pushAgent("✅ 车场数据调取成功\n\n已从车场管理系统获取以下数据：\n━━\n• 车场类型：地上 + 地下混合\n• 总车位数：980 个（地面 320 个 / 地下 660 个）\n• 所属区域：佛山市南海区\n• 政策限价：月保不超过 ¥400/月（佛山市停车收费标准）\n• 周边调研：3 公里内 6 家同类车场，均价 ¥320-380/月\n━━\n\n请您提供定价方案，我将据此生成完整的经营方案并发起审批。\n\n请直接输入或语音告知：地面月保、地下月保、临停等定价信息。", 3500, () => setPhase(2));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [chatMsgs]);

  const handleProvidePrice = () => {
    setChatMsgs(prev => [...prev, { role:"user", text:"地面月保 ¥280/月，地下标准 ¥350/月，地下精品 ¥420/月；临停首小时 ¥5，超出 ¥3/小时，每日封顶 ¥30。", time: new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"}) }]);
    setPhase(3);
    pushTyping(400);
    pushAgent("✅ 已收到定价信息，正在生成停车场经营方案...", 1800, () => {
      pushTyping(2000);
      pushAgent("📄 停车场经营方案已生成\n\n━━ 时代云图（佛山）二期 · 停车场经营方案\n\n【月保定价】\n• 地面车位：¥280/月\n• 地下标准位：¥350/月\n• 地下精品位：¥420/月\n（均在政府限价 ¥400/月 内，地下精品位享受差异化定价）\n\n【临停收费】\n• 首 1 小时：¥5\n• 超出部分：¥3/小时\n• 每日封顶：¥30\n\n【合规说明】\n定价方案符合佛山市南海区停车场收费标准，月保最高价 ¥420 已取得差异化定价豁免（精品位认定）。\n\n━━\n\n方案已就绪，是否需要帮您发起定价方案审批流程？", 4000, () => setPhase(4));
    });
  };

  const handleSubmitFlow = () => {
    setChatMsgs(prev => [...prev, { role:"user", text:"是的，请帮我发起审批流程。", time: new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"}) }]);
    setPhase(5);
    pushTyping(500);
    pushAgent("好的，正在为您发起「停车场经营方案定价审批」流程...", 1500, () => {
      pushTyping(1800);
      pushAgent("✅ 流程已发起成功！\n\n━━ 审批流程详情\n• 流程名称：停车场经营方案定价审批\n• 发起时间：" + new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"}) + "\n• 当前节点：项目总监审批（陈经理）\n• 预计完成：1-2 个工作日\n━━\n\n系统已同步通知陈经理，请关注审批进度。审批通过后，我将自动更新车场系统启费状态。\n\n本次任务「停车场经营方案制定」已完成 ✅", onComplete);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor:"rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor:"#fff", maxHeight:"88vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor:"#E8E9EB" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor:DD_BLUE }}>AI</div>
            <div>
              <div className="text-sm font-semibold" style={{ color:"#1F2329" }}>停车场经营助手</div>
              <div className="text-[11px]" style={{ color:DD_GREEN }}>● 在线</div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor:"#F5F6F8", color:DD_GRAY }}><X size={14}/></button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ backgroundColor:"#F8F9FB" }}>
          {chatMsgs.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role==="user"?"flex-row-reverse":""}`}>
              {msg.role !== "user" && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5" style={{ backgroundColor:DD_BLUE }}>AI</div>
              )}
              <div className={`max-w-[82%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${msg.role==="user"?"rounded-tr-sm text-white":"rounded-tl-sm"}`}
                style={{
                  backgroundColor: msg.role==="user" ? DD_BLUE : "#fff",
                  color: msg.role==="user" ? "#fff" : "#1F2329",
                  border: msg.role==="typing" ? "none" : msg.role==="agent" ? "1px solid #E8E9EB" : "none",
                  whiteSpace:"pre-wrap",
                }}>
                {msg.role==="typing" ? (
                  <div className="flex items-center gap-1 py-0.5">
                    {[0,1,2].map(j=>(
                      <div key={j} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor:DD_GRAY, animationDelay:`${j*0.15}s` }}/>
                    ))}
                  </div>
                ) : msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef}/>
        </div>

        {/* Action buttons */}
        <div className="px-4 py-3 border-t shrink-0 space-y-2" style={{ borderColor:"#E8E9EB", backgroundColor:"#fff" }}>
          {phase === 2 && (
            <button onClick={handleProvidePrice}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor:DD_BLUE }}>
              🎙️ 提供定价信息（地面¥280 / 地下¥350/420 / 临停¥5起）
            </button>
          )}
          {phase === 4 && (
            <button onClick={handleSubmitFlow}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor:DD_BLUE }}>
              ✅ 是的，帮我发起审批流程
            </button>
          )}
          {phase === 5 && (
            <button onClick={() => { onComplete?.(); onClose(); }}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ backgroundColor:DD_GREEN }}>
              完成，关闭窗口
            </button>
          )}
          {(phase === 1 || phase === 3) && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor:`${DD_BLUE}30`, borderTopColor:DD_BLUE }}/>
              <span className="text-xs" style={{ color:DD_GRAY }}>AI 正在处理...</span>
            </div>
          )}
          <button onClick={onClose} className="w-full py-2 rounded-xl text-xs" style={{ color:DD_GRAY }}>
            稍后处理
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Fee Process Modal ────────────────────────────────────────────────────────
function FeeProcessModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const [feeStep, setFeeStep] = useState<0|1|2|3>(0);
  const [running, setRunning] = useState(false);

  const steps = [
    { icon:"📋", title:"AI 生成未缴费业主任务清单", desc:"从系统导出126户未缴费业主，AI自动生成每位管家的跟进任务清单，按欠费金额和时长排序。", action:"立即生成清单", result:"已生成 12 位管家 · 共 126 条任务" },
    { icon:"📲", title:"AI 批量推送催费提醒", desc:"AI 向管家批量推送催费任务，每位管家收到专属任务清单，含业主信息、欠费金额、联系方式。", action:"立即批量推送", result:"已推送 12 位管家 · 消息发送成功" },
    { icon:"👥", title:"管家跟进完成情况", desc:"管家陆续完成电话跟进，系统实时汇总：已跟进 48 户 / 承诺缴费 31 户 / 待跟进 78 户。", action:"查看跟进进度", result:"跟进中 · 实时更新" },
    { icon:"⏰", title:"AI 助理每日定时推送汇总", desc:"AI 助理将每日 17:30 向您推送今日催费进展，包含收缴金额、跟进率变化、异常户预警。", action:"设置推送提醒", result:"已设置 · 每日 17:30 推送" },
  ];

  const runStep = (i: number) => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setFeeStep((i + 1) as 0|1|2|3); }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor: "#fff", maxHeight: "92vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "#E8E9EB" }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: "#1F2329" }}>客户催费跟进处理</div>
            <div className="text-xs mt-0.5" style={{ color: DD_GRAY }}>AI 自动执行 · 共 4 个步骤</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}><X size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Progress bar */}
          <div className="flex items-center gap-1 mb-2">
            {steps.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full transition-all"
                style={{ backgroundColor: i < feeStep ? DD_GREEN : i === feeStep ? DD_BLUE : "#E8E9EB" }} />
            ))}
          </div>

          {steps.map((s, i) => {
            const done = i < feeStep;
            const active = i === feeStep;
            return (
              <div key={i} className="rounded-xl p-3.5 transition-all"
                style={{
                  border: `1px solid ${done ? "#52C41A30" : active ? `${DD_BLUE}40` : "#E8E9EB"}`,
                  backgroundColor: done ? "#F6FFED" : active ? DD_BLUE_LIGHT : "#FAFAFA",
                  opacity: i > feeStep ? 0.5 : 1,
                }}>
                <div className="flex items-start gap-3">
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold" style={{ color: done ? DD_GREEN : active ? "#1F2329" : DD_GRAY }}>
                        步骤 {i+1}：{s.title}
                      </span>
                      {done && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#F6FFED", color: DD_GREEN }}>完成</span>}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: DD_GRAY }}>{s.desc}</p>
                    {done && (
                      <div className="mt-2 text-xs font-medium flex items-center gap-1" style={{ color: DD_GREEN }}>
                        <span>✓</span><span>{s.result}</span>
                      </div>
                    )}
                    {active && !running && (
                      <button onClick={() => runStep(i)}
                        className="mt-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                        style={{ backgroundColor: DD_BLUE }}>
                        {s.action}
                      </button>
                    )}
                    {active && running && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin shrink-0"
                          style={{ borderColor: `${DD_BLUE}30`, borderTopColor: DD_BLUE }} />
                        <span className="text-xs" style={{ color: DD_BLUE }}>AI 处理中...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {feeStep >= 4 && (
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#F6FFED", border: "1px solid #52C41A30" }}>
              <div className="text-base font-semibold mb-1" style={{ color: DD_GREEN }}>🎉 全部步骤执行完成</div>
              <p className="text-xs" style={{ color: DD_GRAY }}>催费任务已启动，AI 助理将每日跟踪进展并推送给您。</p>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: "#E8E9EB" }}>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}>
            {feeStep >= 4 ? "关闭" : "暂时关闭，稍后继续"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskDetail({ task, onBack, onAI, onInspectionDone, onComplete, onOpenContractAgent }: { task: Task; onBack: () => void; onAI: (t: Task) => void; onInspectionDone?: () => void; onComplete?: () => void; onOpenContractAgent?: () => void }) {
  const sc = statusConfig[task.status];
  const [showWorkOrder, setShowWorkOrder] = useState(false);
  const [showContractDispatch, setShowContractDispatch] = useState(false);
  const [showFeeProcess, setShowFeeProcess] = useState(false);
  const [showParkingProcess, setShowParkingProcess] = useState(false);

  const isContract = task.type === "合同签订" || task.type === "合同审查" || task.type === "合同审批";
  const isInspection = task.type === "巡检任务";
  const isFee = task.type === "催费跟进";
  const isParking = task.type === "项目进场";

  const handleProcess = () => {
    if (isContract) setShowContractDispatch(true);
    else if (isFee) setShowFeeProcess(true);
    else if (isParking) setShowParkingProcess(true);
    else setShowWorkOrder(true);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor:"#fff" }}>
      {showWorkOrder && <WorkOrderModal task={task} onClose={() => setShowWorkOrder(false)} onInspectionDone={onInspectionDone} onComplete={onComplete} />}
      {showContractDispatch && (
        <ContractDispatchModal
          task={task}
          onDone={() => { setShowContractDispatch(false); onOpenContractAgent?.(); }}
          onClose={() => setShowContractDispatch(false)}
        />
      )}
      {showFeeProcess && <FeeProcessModal task={task} onClose={() => setShowFeeProcess(false)} />}
      {showParkingProcess && <ParkingProcessModal onClose={() => setShowParkingProcess(false)} onComplete={onComplete} />}

      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ borderColor:"#E8E9EB" }}>
        <button onClick={onBack} className="flex items-center gap-1 text-sm" style={{ color:DD_BLUE }}>
          <ArrowLeft size={16} /><span>返回</span>
        </button>
        <span className="text-sm font-semibold flex-1 truncate" style={{ color:"#1F2329" }}>任务详情</span>
        <TaskBadge status={task.status} />
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ backgroundColor:"#F8F9FB" }}>
        <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border:"1px solid #E8E9EB" }}>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <TypeTag type={task.type} />
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor:sc.bg, color:sc.color }}>{sc.label}</span>
          </div>
          <h3 className="text-base font-semibold leading-snug mb-2" style={{ color:"#1F2329" }}>
            [{task.project}] {task.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color:DD_GRAY }}>{task.desc}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border:"1px solid #E8E9EB" }}>
          <div className="text-xs font-semibold mb-3" style={{ color:"#1F2329" }}>任务信息</div>
          {([["所属项目",task.project],["负责人",task.assignee],["截止日期",task.deadline],["优先级",task.priority==="high"?"高":task.priority==="medium"?"中":"低"],...(task.dept?[["所属部门",task.dept]]:[])] as [string,string][]).map(([l,v])=>(
            <div key={l} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor:"#F5F6F8" }}>
              <span className="text-xs" style={{ color:DD_GRAY }}>{l}</span>
              <span className="text-xs font-medium" style={{ color:"#1F2329" }}>{v}</span>
            </div>
          ))}
        </div>
        {task.steps && (
          <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border:"1px solid #E8E9EB" }}>
            <div className="text-xs font-semibold mb-3" style={{ color:"#1F2329" }}>处理步骤</div>
            {task.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor:"#F5F6F8" }}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor:i===0?DD_BLUE:B4, color:i===0?"#fff":B1 }}>{i+1}</span>
                <span className="text-sm leading-relaxed" style={{ color:"#1F2329" }}>{step}</span>
              </div>
            ))}
          </div>
        )}
        {/* Fee data for 催费跟进 */}
        {isFee && task.feeData && (
          <div className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ border:"1px solid #E8E9EB" }}>
            <div className="px-4 py-2.5 border-b" style={{ backgroundColor:"#F8F9FB", borderColor:"#E8E9EB" }}>
              <span className="text-xs font-semibold" style={{ color:"#1F2329" }}>📊 物业费收缴情况</span>
            </div>
            {/* Progress bar */}
            <div className="px-4 py-3 border-b" style={{ borderColor:"#F0F2F5" }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color:DD_GRAY }}>本月收缴率</span>
                <span className="text-xs font-bold" style={{ color:task.feeData.rate < task.feeData.target ? DD_RED : DD_GREEN }}>
                  {task.feeData.rate}%
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor:"#F0F2F5" }}>
                <div className="h-full rounded-full relative" style={{ width:`${task.feeData.rate}%`, backgroundColor: DD_ORANGE }}>
                  <div className="absolute right-0 top-0 h-full w-0.5" style={{ backgroundColor:"#fff" }} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px]" style={{ color:DD_GRAY }}>目标 {task.feeData.target}%</span>
                <span className="text-[10px]" style={{ color:DD_GRAY }}>差 {task.feeData.target - task.feeData.rate}%</span>
              </div>
            </div>
            {/* Stats grid */}
            <div className="grid grid-cols-3 divide-x" style={{ borderColor:"#F0F2F5" }}>
              {[
                { label:"应收总户", value:`${task.feeData.total}户` },
                { label:"未缴户数", value:`${task.feeData.unpaid}户`, warn:true },
                { label:"欠费3月+", value:`${task.feeData.longOverdue}户`, warn:true },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center py-3">
                  <span className="text-base font-bold" style={{ color: s.warn ? DD_RED : "#1F2329" }}>{s.value}</span>
                  <span className="text-[10px] mt-0.5" style={{ color:DD_GRAY }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl p-3 flex items-start gap-3" style={{ backgroundColor:DD_BLUE_LIGHT, border:`1px solid ${DD_BLUE}30` }}>
          <Zap size={15} className="shrink-0 mt-0.5" style={{ color:DD_BLUE }} />
          <p className="text-xs leading-relaxed" style={{ color:DD_BLUE }}>
            {isInspection ? "巡检任务支持语音录入，AI 自动识别工单问题和终端清点数据，一键提交。" : "AI 助理已分析此任务，可为您逐步引导处理流程，并自动完成部分操作步骤。"}
          </p>
        </div>
      </div>
      <div className="flex gap-3 px-4 py-3 border-t shrink-0" style={{ backgroundColor:"#fff", borderColor:"#E8E9EB" }}>
        {onComplete && (
          <button onClick={onComplete}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium"
            style={{ backgroundColor:"#F6FFED", color:DD_GREEN, border:`1px solid ${DD_GREEN}30`, flex:"0 0 auto", paddingLeft:16, paddingRight:16 }}>
            <CheckSquare size={14} />完成任务
          </button>
        )}
        <button onClick={handleProcess}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white"
          style={{ backgroundColor: DD_BLUE }}>
          {isInspection ? <span style={{fontSize:15}}>🎙️</span> : <CheckSquare size={15} />}
          {isInspection ? "开始巡查记录" : "去处理"}
        </button>
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor:"#F8F9FB" }}>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label:"项目收尾率", value:"80%", change:"+1%", color:DD_BLUE },
          { label:"任务完成率", value:"67%", change:"+3%", color:DD_GREEN },
          { label:"紧急任务数", value:"2",   change:"+1",  color:DD_RED },
          { label:"待审批数量", value:"12",  change:"-2",  color:DD_ORANGE },
        ].map(s=>(
          <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm" style={{ border:"1px solid #E8E9EB" }}>
            <div className="text-xs mb-1" style={{ color:DD_GRAY }}>{s.label}</div>
            <div className="text-2xl font-bold" style={{ color:s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color:s.change.startsWith("+")?DD_GREEN:DD_RED }}>{s.change} 较上周</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border:"1px solid #E8E9EB" }}>
        <div className="text-sm font-semibold mb-3" style={{ color:"#1F2329" }}>任务类型分布</div>
        {[{label:"合同审批",value:35,color:"#722ED1"},{label:"装修申请",value:28,color:DD_ORANGE},{label:"客户服务",value:20,color:DD_BLUE},{label:"巡检任务",value:10,color:DD_GREEN},{label:"其他",value:7,color:DD_GRAY}].map(item=>(
          <div key={item.label} className="flex items-center gap-2 mb-2">
            <div className="text-xs w-14 shrink-0" style={{ color:DD_GRAY }}>{item.label}</div>
            <div className="flex-1 h-2 rounded-full" style={{ backgroundColor:"#F0F2F5" }}>
              <div className="h-2 rounded-full" style={{ width:`${item.value}%`, backgroundColor:item.color }} />
            </div>
            <div className="text-xs w-7 text-right" style={{ color:"#1F2329" }}>{item.value}%</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border:"1px solid #E8E9EB" }}>
        <div className="text-sm font-semibold mb-2" style={{ color:"#1F2329" }}>客户满意度 TOP 5</div>
        {["网格化","安全管理","工程维修","客服接待","绿化管理"].map((item,i)=>(
          <div key={item} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor:"#F5F6F8" }}>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold" style={{ backgroundColor:i<3?DD_BLUE:DD_GRAY }}>{i+1}</span>
              <span className="text-xs">{item}</span>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({length:5}).map((_,j)=><Star key={j} size={10} fill={j<5-i*0.5?DD_ORANGE:"none"} stroke={DD_ORANGE} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocsPanel() {
  const [search, setSearch] = useState("");
  const filtered = docs.filter(d=>d.title.includes(search));
  return (
    <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor:"#F8F9FB" }}>
      <div className="flex items-center gap-2 mb-3 px-2.5 py-2 rounded-xl bg-white" style={{ border:"1px solid #E8E9EB" }}>
        <Search size={13} style={{ color:DD_GRAY }} />
        <input className="flex-1 bg-transparent text-sm outline-none" placeholder="搜索企业文档..."
          value={search} onChange={e=>setSearch(e.target.value)} style={{ color:"#1F2329" }} />
      </div>
      <div className="space-y-2">
        {filtered.map(doc=>(
          <div key={doc.title} className="flex items-center gap-3 p-3 rounded-xl bg-white cursor-pointer" style={{ border:"1px solid #E8E9EB" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor:doc.type==="pdf"?"#FFF1F0":doc.type==="xlsx"?"#F6FFED":"#EBF2FF", color:doc.type==="pdf"?DD_RED:doc.type==="xlsx"?DD_GREEN:DD_BLUE }}>
              <FileBarChart size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color:"#1F2329" }}>{doc.title}</div>
              <div className="text-xs" style={{ color:DD_GRAY }}>{doc.type.toUpperCase()} · {doc.updated}</div>
            </div>
            {doc.hot && <span className="text-xs px-1.5 py-0.5 rounded" style={{ color:DD_RED, backgroundColor:"#FFF1F0" }}>热</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPanel({ messages, input, setInput, sendMessage, linkedTask, clearLinked, messagesEndRef, onSelectAgent }: {
  messages: Message[]; input: string; setInput:(v:string)=>void;
  sendMessage:(t?:string)=>void; linkedTask:Task|null;
  clearLinked:()=>void; messagesEndRef: React.RefObject<HTMLDivElement>;
  onSelectAgent: (key:string) => void;
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" style={{ backgroundColor:"#F8F9FB" }}>
        {linkedTask && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ backgroundColor:"#EBF2FF", border:`1px solid ${DD_BLUE}30` }}>
            <AlertCircle size={13} style={{ color:DD_BLUE }} />
            <span className="text-xs flex-1" style={{ color:DD_BLUE }}>已关联任务：<strong>{linkedTask.project} · {linkedTask.title.slice(0,18)}...</strong></span>
            <button onClick={clearLinked}><X size={12} style={{ color:DD_BLUE }} /></button>
          </div>
        )}
        {messages.map(msg=>(
          <div key={msg.id} className={`flex gap-2 ${msg.role==="user"?"flex-row-reverse":""}`}>
            {msg.role==="agent"
              ? <img src={aiAvatar} alt="AI" className="w-8 h-8 rounded-full object-cover shrink-0 shadow-sm" />
              : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor:DD_BLUE }}>我</div>
            }
            <div className={`max-w-[78%] flex flex-col gap-1 ${msg.role==="user"?"items-end":"items-start"}`}>
              <div className="rounded-2xl px-3 py-2.5 text-sm leading-relaxed"
                style={{
                  backgroundColor:msg.role==="user"?DD_BLUE:"#fff",
                  color:msg.role==="user"?"#fff":"#1F2329",
                  borderRadius:msg.role==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.07)",
                }}>
                {msg.typing
                  ? <div className="flex gap-1 items-center py-0.5">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor:DD_GRAY, animationDelay:`${i*0.15}s` }} />)}</div>
                  : <div className="whitespace-pre-wrap">{msg.content}</div>
                }
              </div>
              {msg.time && <span className="text-[10px] px-1" style={{ color:DD_GRAY }}>{msg.time}</span>}
              {msg.actionable && !msg.typing && (
                <div className="flex flex-col gap-1.5 mt-1 w-full">
                  {msg.actionable.map(a=>(
                    <button key={a.label}
                      onClick={()=> {
                        if (a.prompt.startsWith("__AGENT_")) { onSelectAgent(a.prompt.replace("__AGENT_","").replace("__","")); }
                        else if (a.prompt === "__OPEN_CONTRACT_AGENT__") { onSelectAgent("contract"); }
                        else if (a.prompt === "__OPEN_GRID_REPORT__") { window.open("https://doc.weixin.qq.com/smartsheet/s3_AI4AUBQ7AEYCNwB2WV0kzSyqjt1H1_a?scode=AI8AJwcwAAgsvaFGgdAawAZgYpAPU&tab=XiSXFo&viewId=vabcde", "_blank"); }
                        else { sendMessage(a.prompt); }
                      }}
                      className="text-left text-xs px-3 py-2 rounded-xl font-medium"
                      style={{ backgroundColor:DD_BLUE_LIGHT, color:DD_BLUE, border:`1px solid ${DD_BLUE}30` }}>
                      {a.label}
                    </button>
                  ))}
                </div>
              )}
              {msg.suggestions && !msg.typing && !msg.actionable && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {msg.suggestions.map(s=>(
                    <button key={s} onClick={()=>sendMessage(s)} className="text-xs px-2.5 py-1 rounded-full border"
                      style={{ color:DD_BLUE, borderColor:DD_BLUE+"50", backgroundColor:"#fff" }}>{s}</button>
                  ))}
                </div>
              )}
              {msg.role==="agent" && !msg.typing && msg.content && (
                <div className="flex items-center gap-2 mt-0.5 px-1">
                  {([[<ThumbsUp size={10}/>,"有用"],[<ThumbsDown size={10}/>,"没用"],[<Copy size={10}/>,"复制"]] as [React.ReactNode,string][]).map(([icon,label])=>(
                    <button key={label} className="text-[10px] flex items-center gap-0.5" style={{ color:DD_GRAY }}>{icon}{label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <AgentToolbar onSelectAgent={onSelectAgent} />
      <div className="p-3 border-t shrink-0" style={{ backgroundColor:"#fff", borderColor:"#E8E9EB" }}>
        <div className="flex items-end gap-2 rounded-xl p-2" style={{ border:"1px solid #E8E9EB", backgroundColor:"#F5F6F8" }}>
          <button className="p-1.5" style={{ color:DD_GRAY }}><Paperclip size={15} /></button>
          <textarea rows={2} className="flex-1 bg-transparent text-sm outline-none resize-none"
            placeholder="向 AI 助理提问..." value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
            style={{ color:"#1F2329", maxHeight:"80px" }} />
          <div className="flex items-center gap-1">
            <button className="p-1.5" style={{ color:DD_GRAY }}><Mic size={15} /></button>
            <button onClick={()=>sendMessage()} disabled={!input.trim()}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor:input.trim()?DD_BLUE:"#E8E9EB", color:input.trim()?"#fff":DD_GRAY }}>
              <Send size={13} />
            </button>
          </div>
        </div>
        <p className="text-[10px] mt-1.5 px-1" style={{ color:DD_GRAY }}>Enter 发送 · Shift+Enter 换行</p>
      </div>
    </>
  );
}

// ─── Agent Toolbar ────────────────────────────────────────────────────────────
function AgentToolbar({ onSelectAgent }: { onSelectAgent:(key:string)=>void }) {
  const items = [...AGENTS, { key:"more", label:"更多", color:DD_GRAY }];
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b overflow-x-auto shrink-0"
      style={{ borderColor:"#E8E9EB", backgroundColor:"#FAFBFC" }}>
      {items.map(a => (
        <button key={a.key} onClick={() => onSelectAgent(a.key)}
          className="flex items-center px-2.5 py-1 rounded-full text-[11px] shrink-0 font-medium whitespace-nowrap"
          style={{ backgroundColor:"#EBF2FF", color:"#459FFF", border:"1px solid #459FFF40" }}>
          {a.label}
        </button>
      ))}
    </div>
  );
}

// ─── Agent Iframe Page ────────────────────────────────────────────────────────
function AgentIframePage({ agentKey, onBack }: { agentKey:string; onBack:()=>void }) {
  const agent = AGENTS.find(a => a.key === agentKey);
  const label = agent?.label ?? agentKey;
  const color = agent?.color ?? DD_BLUE;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b shrink-0"
        style={{ borderColor:"#E8E9EB", backgroundColor:"#fff" }}>
        <button onClick={onBack} className="flex items-center gap-1 text-xs font-medium"
          style={{ color:DD_BLUE }}>
          <ArrowLeft size={13} />返回 AI 助理
        </button>
        <div className="flex-1 flex justify-center">
          <span className="text-sm font-semibold" style={{ color:"#1F2329" }}>{label}</span>
        </div>
        <div style={{ width:72 }} />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ backgroundColor:"#F8F9FB" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor:`${color}18` }}>
          <Bot size={26} style={{ color }} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold" style={{ color:"#1F2329" }}>{label}</p>
          <p className="text-xs" style={{ color:DD_GRAY }}>智能体连接中，请稍候...</p>
        </div>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor:color, animationDelay:`${i*0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Order Review Agent Panel ────────────────────────────────────────────────
type ReviewStep = "scanning" | "review" | "approving" | "done" | "srm";

const AUTO_ITEMS = [
  { id:"l1", tag:"请假申请", tagColor:"#13C2C2", icon:"📅", applicant:"张伟", dept:"工程部",     content:"年假申请 · 2天（2026-06-30 ~ 2026-07-01）", rule:"假期余额充足，符合请假规定，上级已知会" },
  { id:"l2", tag:"请假申请", tagColor:"#13C2C2", icon:"📅", applicant:"李思成", dept:"客服部",   content:"病假申请 · 1天（2026-06-29），附医院证明",   rule:"已提交病假证明，符合公司相关规定" },
  { id:"e1", tag:"费用报销", tagColor:"#722ED1", icon:"💰", applicant:"陈晓梅", dept:"客服部",   content:"业主回访餐饮费 ¥320，发票齐全",             rule:"金额在500元授权范围内，科目正确" },
  { id:"e2", tag:"费用报销", tagColor:"#722ED1", icon:"💰", applicant:"王浩天", dept:"工程部",   content:"维修材料采购 ¥1,840，附采购凭证",           rule:"附发票及采购单，金额在2000元授权内" },
  { id:"e3", tag:"费用报销", tagColor:"#722ED1", icon:"💰", applicant:"赵敏华", dept:"行政部",   content:"办公用品采购 ¥560，已提交发票",             rule:"科目匹配，金额合规，附件完整" },
  { id:"e4", tag:"费用报销", tagColor:"#722ED1", icon:"💰", applicant:"刘建国", dept:"安保部",   content:"外出培训交通费 ¥275",                       rule:"符合差旅规定，金额合规" },
  { id:"r1", tag:"装修审批", tagColor:"#FA8C16", icon:"🏠", applicant:"1栋803室业主", dept:"时代云图（佛山）二期", content:"普通装修 · 工期15天，材料单已提交",   rule:"材料合规，押金已缴纳，符合小区装修规范" },
  { id:"r2", tag:"装修审批", tagColor:"#FA8C16", icon:"🏠", applicant:"3栋1202室业主", dept:"时代云图（佛山）二期", content:"墙体改造 · 非承重墙，附设计图",       rule:"非承重结构，设计图合规，押金已缴纳" },
];

const SRM_ISSUES = [
  { no:1, label:"条款冲突", clauses:"第9.1条 × 第9.1.2条", desc:"合同约定总工期30天，但竣工日期（2026-04-21）与开工日期（2026-04-20）仅相差1天，实际工期与约定严重冲突，无法确定统一执行标准。" },
  { no:2, label:"条款冲突", clauses:"第8.1.2.1条 × 第8.1.2.2条", desc:"付款义务以政府主管部门审批作为前提，与8.1.2.2条验收合格后30日内付款的约定互相矛盾，导致付款时间不明确。" },
];

function OrderReviewAgentPanel({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<ReviewStep>("scanning");
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const agentColor = "#52C41A";

  useEffect(() => {
    if (step === "scanning") {
      const t = setTimeout(() => setStep("review"), 1600);
      return () => clearTimeout(t);
    }
    if (step === "approving") {
      const t = setTimeout(() => {
        setApprovedIds(new Set(AUTO_ITEMS.map(i => i.id)));
        setStep("done");
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [step]);

  const tagGroups: Record<string, number> = {};
  AUTO_ITEMS.forEach(i => { tagGroups[i.tag] = (tagGroups[i.tag] || 0) + 1; });
  const groupSummary = Object.entries(tagGroups).map(([tag, n]) => `${tag}×${n}`).join("、");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b shrink-0" style={{ backgroundColor:"#fff", borderColor:"#E8E9EB" }}>
        <button onClick={onBack} className="flex items-center gap-1 text-xs font-medium" style={{ color:DD_BLUE }}>
          <ArrowLeft size={13} />返回 AI 助理
        </button>
        <div className="w-px h-4" style={{ backgroundColor:"#E8E9EB" }} />
        <span className="text-sm font-semibold" style={{ color:"#1F2329" }}>审单助理</span>
        {step === "review" && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor:"#F6FFED", color:agentColor }}>
            9 项待审批
          </span>
        )}
        {step === "done" && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor:"#F6FFED", color:agentColor }}>
            8 项已审批 ✓
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor:"#F5F8FF" }}>

        {/* ── 扫描中 ── */}
        {step === "scanning" && (
          <div className="flex flex-col items-center justify-center h-full gap-5 py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor:`${agentColor}18` }}>
              <div className="w-9 h-9 border-[3px] rounded-full animate-spin" style={{ borderColor:`${agentColor}30`, borderTopColor:agentColor }} />
            </div>
            <div className="text-sm font-semibold" style={{ color:"#1F2329" }}>AI 审单助理正在扫描待审批事项...</div>
            <div className="space-y-1.5 text-center">
              {["扫描请假申请","核查费用报销凭证","比对装修规范","检索SRM合同条款"].map((t,i) => (
                <div key={t} className="text-xs flex items-center justify-center gap-1.5" style={{ color:DD_GRAY }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor:agentColor, animationDelay:`${i*0.25}s` }} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 审批列表 ── */}
        {(step === "review" || step === "approving") && (
          <div className="p-3 flex flex-col gap-2">
            {/* AI 摘要 */}
            <div className="rounded-xl p-3" style={{ backgroundColor:`${agentColor}12`, border:`1px solid ${agentColor}30` }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={13} style={{ color:agentColor }} />
                <span className="text-xs font-semibold" style={{ color:agentColor }}>AI 审核完成</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color:"#1F2329" }}>
                共扫描到 <b>9 项</b>待审批事项：<b>{groupSummary}</b>，符合公司规定，AI 建议通过；<b>SRM合同审批×1</b> 发现 <span style={{ color:DD_ORANGE }}>2 处条款冲突</span>，需您人工确认。
              </p>
            </div>

            {/* 8 个可自动审批项 */}
            <div className="text-xs font-semibold px-1 mb-0.5 flex items-center gap-1.5" style={{ color:"#1F2329" }}>
              <CheckSquare size={12} style={{ color:agentColor }} />
              以下 8 项 AI 已核查，建议一键通过
            </div>
            {AUTO_ITEMS.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm" style={{ border:"1px solid #E8E9EB" }}>
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-base" style={{ backgroundColor:`${item.tagColor}15` }}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor:`${item.tagColor}15`, color:item.tagColor }}>{item.tag}</span>
                      <span className="text-xs font-semibold" style={{ color:"#1F2329" }}>{item.applicant}</span>
                      <span className="text-[10px]" style={{ color:DD_GRAY }}>{item.dept}</span>
                    </div>
                    <p className="text-xs leading-snug mb-1" style={{ color:"#1F2329" }}>{item.content}</p>
                    <p className="text-[10px] leading-snug" style={{ color:DD_GRAY }}>
                      <span style={{ color:agentColor }}>✓ 规则核查：</span>{item.rule}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 self-start" style={{ backgroundColor:"#F6FFED", color:agentColor }}>建议通过</span>
                </div>
              </div>
            ))}

            {/* SRM 合同 — 需人工 */}
            <div className="text-xs font-semibold px-1 mb-0.5 flex items-center gap-1.5" style={{ color:"#1F2329" }}>
              <AlertCircle size={12} style={{ color:DD_ORANGE }} />
              以下 1 项发现风险，需您人工确认
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm" style={{ border:`1px solid ${DD_ORANGE}50`, borderLeft:`3px solid ${DD_ORANGE}` }}>
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-base" style={{ backgroundColor:"#FFF7E6" }}>📝</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor:"#FFF7E6", color:DD_ORANGE }}>SRM合同审批</span>
                    <span className="text-xs font-semibold" style={{ color:"#1F2329" }}>王莉</span>
                    <span className="text-[10px]" style={{ color:DD_GRAY }}>客户服务处</span>
                  </div>
                  <p className="text-xs leading-snug mb-1" style={{ color:"#1F2329" }}>置信花园城2026年车场改造合同 · ¥13,000</p>
                  <p className="text-[10px] leading-snug" style={{ color:DD_ORANGE }}>⚠ AI识别到 2 处条款冲突，建议审批前确认</p>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 self-start" style={{ backgroundColor:"#FFF7E6", color:DD_ORANGE }}>待确认</span>
              </div>
            </div>

            {/* 一键审批按钮 */}
            <button
              className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-1 flex items-center justify-center gap-2"
              style={{ backgroundColor: step === "approving" ? `${agentColor}80` : agentColor }}
              disabled={step === "approving"}
              onClick={() => setStep("approving")}>
              {step === "approving" ? (
                <>
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor:"#ffffff40", borderTopColor:"#fff" }} />
                  正在审批中...
                </>
              ) : "✓ 一键审批（8 项 AI 可自动通过）"}
            </button>
            <p className="text-center text-[10px]" style={{ color:DD_GRAY }}>SRM 合同需单独确认，不包含在一键审批中</p>
          </div>
        )}

        {/* ── 已完成 ── */}
        {step === "done" && (
          <div className="p-3 flex flex-col gap-2">
            {/* 成功提示 */}
            <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor:"#F6FFED", border:`1px solid ${agentColor}40` }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor:`${agentColor}20` }}>
                <CheckSquare size={18} style={{ color:agentColor }} />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color:agentColor }}>8 项审批已完成</div>
                <div className="text-xs" style={{ color:"#52A31D" }}>请假×2、费用报销×4、装修审批×2，均已自动通过</div>
              </div>
            </div>

            {/* 已完成明细 */}
            {AUTO_ITEMS.map(item => (
              <div key={item.id} className="bg-white rounded-xl px-3 py-2.5 shadow-sm flex items-center gap-2.5" style={{ border:"1px solid #E8E9EB" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor:`${agentColor}20` }}>
                  <span style={{ color:agentColor, fontSize:10, fontWeight:700 }}>✓</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium" style={{ color:"#1F2329" }}>{item.applicant}</span>
                  <span className="text-[10px] ml-1.5" style={{ color:DD_GRAY }}>{item.content}</span>
                </div>
                <span className="text-[10px] font-medium shrink-0" style={{ color:agentColor }}>已通过</span>
              </div>
            ))}

            {/* SRM 合同待确认提示 */}
            <div className="rounded-xl overflow-hidden mt-1" style={{ border:`1px solid ${DD_ORANGE}60` }}>
              <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor:DD_ORANGE }}>
                <AlertCircle size={13} className="text-white shrink-0" />
                <span className="text-xs font-bold text-white flex-1">SRM 合同审批待确认</span>
              </div>
              <div className="bg-white px-3 py-2.5">
                <p className="text-xs font-semibold mb-0.5" style={{ color:"#1F2329" }}>置信花园城2026年车场改造合同</p>
                <p className="text-[10px] mb-1" style={{ color:DD_GRAY }}>申请人：王莉 · 签约金额：¥13,000 · 合同编号：HTBM-2026041400015</p>
                <p className="text-[10px] mb-2.5" style={{ color:DD_ORANGE }}>⚠ AI 已识别 2 处条款冲突，建议审批前查阅详情</p>
                <button onClick={() => setStep("srm")}
                  className="w-full py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ backgroundColor:DD_ORANGE }}>
                  AI 辅助审批 SRM 合同 →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SRM 合同详情 ── */}
        {step === "srm" && (
          <div className="p-3 flex flex-col gap-3">
            {/* 合同基础信息 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ border:"1px solid #E8E9EB" }}>
              <div className="px-3 py-2 border-b flex items-center gap-2" style={{ backgroundColor:"#F8F9FB", borderColor:"#E8E9EB" }}>
                <FileText size={13} style={{ color:DD_BLUE }} />
                <span className="text-xs font-semibold" style={{ color:"#1F2329" }}>合同基本信息</span>
                <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor:DD_BLUE_LIGHT, color:DD_BLUE }}>SRM合同审批</span>
              </div>
              {[
                ["合同名称","置信花园城2026年车场改造合同"],
                ["合同编号","HTBM-2026041400015"],
                ["申请人","王莉 · 客户服务处"],
                ["申请公司","时代邻里西南区域二公司"],
                ["甲方","成都合智商务服务有限公司绵阳分公司"],
                ["乙方","众畅科技有限公司"],
                ["签约金额","¥13,000.00"],
                ["合同类型","智能化工程 / 停车场工程"],
                ["合同期限","2026-04-20 ~ 2026-04-21"],
                ["单据类型","标准合同 · 普通合同"],
              ].map(([k,v]) => (
                <div key={k} className="flex items-start gap-2 px-3 py-2 border-b last:border-0" style={{ borderColor:"#F0F2F5" }}>
                  <span className="text-[10px] shrink-0 w-16 pt-0.5" style={{ color:DD_GRAY }}>{k}</span>
                  <span className="text-xs font-medium flex-1" style={{ color:"#1F2329" }}>{v}</span>
                </div>
              ))}
            </div>

            {/* AI 法务分析 */}
            <div className="rounded-xl overflow-hidden" style={{ border:`1px solid ${DD_ORANGE}50` }}>
              <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor:DD_ORANGE }}>
                <AlertCircle size={13} className="text-white shrink-0" />
                <span className="text-xs font-bold text-white">AI 法务智能分析 · 发现 2 处风险</span>
              </div>
              <div className="bg-white divide-y" style={{ borderColor:"#FFF7E6" }}>
                {SRM_ISSUES.map(issue => (
                  <div key={issue.no} className="px-3 py-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor:DD_ORANGE }}>
                        {issue.no}
                      </span>
                      <span className="text-xs font-semibold" style={{ color:DD_ORANGE }}>【{issue.label}】</span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor:"#FFF7E6", color:DD_ORANGE }}>{issue.clauses}</span>
                    </div>
                    <p className="text-xs leading-relaxed ml-7" style={{ color:"#1F2329" }}>{issue.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 审批建议 */}
            <div className="rounded-xl p-3" style={{ backgroundColor:"#FFF7E6", border:`1px solid ${DD_ORANGE}40` }}>
              <div className="text-xs font-semibold mb-1" style={{ color:DD_ORANGE }}>AI 审批建议</div>
              <p className="text-xs leading-relaxed" style={{ color:"#874D00" }}>
                建议在审批通过前，要求申请人对上述 2 处条款冲突进行书面说明或补充协议，明确工期与付款条件后再行签署，以避免后续履约争议。
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold border" style={{ borderColor:"#E8E9EB", color:"#1F2329", backgroundColor:"#fff" }}
                onClick={() => setStep("done")}>
                ← 返回审批列表
              </button>
              <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor:DD_ORANGE }}>
                退回申请人修改
              </button>
              <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor:agentColor }}>
                确认并通过
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Contract Dispatch Modal ─────────────────────────────────────────────────
function ContractDispatchModal({ task, onDone, onClose }: { task: Task; onDone: () => void; onClose: () => void }) {
  const [count, setCount] = useState(3);
  const contractColor = "#722ED1";

  useEffect(() => {
    const id = setTimeout(() => {
      if (count > 1) {
        setCount(c => c - 1);
      } else {
        onDone();
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [count]); // eslint-disable-line

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-xs mx-4 rounded-2xl p-6 flex flex-col items-center gap-4"
        style={{ backgroundColor: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${contractColor}15` }}>
          <Bot size={30} style={{ color: contractColor }} />
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-base font-semibold" style={{ color: "#1F2329" }}>合同智能体将协助你开展</p>
          <p className="text-xs leading-relaxed" style={{ color: DD_GRAY }}>任务：{task.title}</p>
          <p className="text-sm font-medium" style={{ color: contractColor }}>{count}s 后自动跳转</p>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F0F2F5" }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${(count / 3) * 100}%`, backgroundColor: contractColor }} />
        </div>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
              style={{ backgroundColor: contractColor, animationDelay: `${i*0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Schedule Detail Modal ────────────────────────────────────────────────────
function ScheduleDetailModal({ schedule, onClose, onJumpCalendar }: {
  schedule: Schedule;
  onClose: () => void;
  onJumpCalendar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full md:max-w-sm rounded-t-2xl md:rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#fff" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#E8E9EB" }}>
          <div className="flex items-center gap-2">
            {(() => {
              const catColor: Record<string, string> = { "会议":DD_BLUE, "钉钉待办":DD_ORANGE, "今日提醒":DD_GREEN };
              const accent = catColor[schedule.category] ?? DD_BLUE;
              return (
                <>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent+"20" }}>
                    <Calendar size={12} style={{ color: accent }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "#1F2329" }}>
                    {schedule.category === "会议" ? "会议详情" : schedule.category === "钉钉待办" ? "待办详情" : "提醒详情"}
                  </span>
                </>
              );
            })()}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}>
            <X size={14} />
          </button>
        </div>
        <div className="px-4 py-4 space-y-3">
          {(() => {
            const catColor: Record<string, string> = { "会议":DD_BLUE, "钉钉待办":DD_ORANGE, "今日提醒":DD_GREEN };
            const accent = catColor[schedule.category] ?? DD_BLUE;
            return (
              <>
                <h3 className="text-sm font-semibold leading-snug" style={{ color: "#1F2329" }}>{schedule.title}</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Clock size={13} style={{ color: accent }} />
                    <span className="text-sm" style={{ color: "#1F2329" }}>
                      {schedule.category === "会议" ? `2026年6月25日 · ${schedule.time}` : `${schedule.date} · ${schedule.time}`}
                    </span>
                  </div>
                  {schedule.location && (
                    <div className="flex items-center gap-2.5">
                      <span style={{ fontSize: 13 }}>📍</span>
                      <span className="text-sm" style={{ color: "#1F2329" }}>{schedule.location}</span>
                    </div>
                  )}
                </div>
                {schedule.aiTip && (
                  <div className="rounded-xl p-3 flex items-start gap-2" style={{ backgroundColor: accent+"18", border: `1px solid ${accent}30` }}>
                    <Zap size={12} className="shrink-0 mt-0.5" style={{ color: accent }} />
                    <div>
                      <div className="text-[11px] font-semibold mb-0.5" style={{ color: accent }}>AI 提示</div>
                      <p className="text-xs leading-relaxed" style={{ color: accent }}>{schedule.aiTip}</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}>
                    关闭
                  </button>
                  <button onClick={() => { onJumpCalendar(); onClose(); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: accent }}>
                    <Calendar size={13} />
                    跳转日程
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Contract Agent Panel ────────────────────────────────────────────────────
function ContractAgentPanel({ onBack, onComplete }: { onBack: () => void; onComplete?: () => void }) {
  const [step, setStep] = useState<"upload" | "recognizing" | "result">("upload");
  const [dragging, setDragging] = useState(false);

  const handleUpload = () => {
    setStep("recognizing");
    setTimeout(() => setStep("result"), 2200);
  };

  const resultRows = [
    { label: "基础信息", detail: "已识别 17 项，未识别到 3 项", warn: true },
    { label: "项目信息", detail: "已识别到 1 个项目信息", warn: false },
  ];

  const contractFields = [
    { group: "甲方信息", items: [["甲方名称", "广州时代邻里物业服务有限公司"], ["甲方联系人", "郑赵峰"], ["甲方地址", "广州市天河区时代外滩项目"]] },
    { group: "乙方信息", items: [["乙方名称", "CC2消防工程技术有限公司"], ["乙方联系人", "陈工"], ["乙方资质", "消防设施维护保养资质 A 级"]] },
    { group: "签订内容", items: [["合同类型", "消防设备维护运维服务合同"], ["服务范围", "时代外滩项目消防设备年度维护"], ["合同金额", "￥128,000 / 年"], ["合同期限", "2026.07.01 — 2027.06.30"], ["付款方式", "季度结算，每季度末付款"]] },
    { group: "确认内容", items: [["合同编号", "HT-2026-XF-001（待确认）"], ["签订日期", "2026.06.20"], ["未识别项", "附件清单 / 违约条款 / 争议解决"], ["当前状态", "待双方签字确认"]] },
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#F5F8FF" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ backgroundColor: "#fff", borderColor: "#E8E9EB" }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: DD_BLUE }}>
          <ArrowLeft size={15} />返回对话
        </button>
        <div className="w-px h-4" style={{ backgroundColor: "#E8E9EB" }} />
        <span className="text-sm font-semibold" style={{ color: "#1F2329" }}>合同智能体</span>
        {step === "result" && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#F6FFED", color: DD_GREEN }}>识别完成</span>
        )}
        {step === "recognizing" && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: DD_BLUE_LIGHT, color: DD_BLUE }}>识别中...</span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-44 shrink-0 border-r flex flex-col" style={{ backgroundColor: "#fff", borderColor: "#E8E9EB" }}>
          <div className="px-3 py-2.5 border-b" style={{ borderColor: "#E8E9EB" }}>
            <button onClick={onBack} className="flex items-center gap-1 text-xs" style={{ color: DD_GRAY }}>
              <ArrowLeft size={11} />返回首页
            </button>
          </div>
          <div className="px-3 py-2 flex-1">
            <div className="text-[10px] font-semibold mb-2 uppercase tracking-wide" style={{ color: DD_GRAY }}>历史采用合同</div>
            {[
              { name: "2025专项保洁服务合同（修订版）.docx", date: "2025-12-30" },
              { name: "时代外滩年度绿化维护合同.docx", date: "2025-09-15" },
            ].map(f => (
              <div key={f.name} className="flex items-start gap-2 p-2 rounded-lg mb-1.5 cursor-pointer" style={{ backgroundColor: "#F5F6F8" }}>
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: DD_BLUE_LIGHT }}>
                  <BookOpen size={10} style={{ color: DD_BLUE }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-medium leading-snug line-clamp-2" style={{ color: "#1F2329" }}>{f.name}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: DD_GRAY }}>{f.date}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="mx-3 mb-3 text-[10px] py-1" style={{ color: DD_RED }}>清空所有记录</button>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4">

          {/* ── STEP: Upload ── */}
          {step === "upload" && (
            <div className="flex flex-col gap-4 max-w-lg mx-auto">
              {/* Prompt card */}
              <div className="rounded-xl p-4" style={{ backgroundColor: DD_BLUE_LIGHT, border: `1px solid ${DD_BLUE}30` }}>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} style={{ color: DD_BLUE }} />
                  <span className="text-sm font-semibold" style={{ color: DD_BLUE }}>请上传合同附件</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#3A5FAD" }}>
                  AI 将自动识别合同中的甲乙双方信息、签订内容及关键条款，识别完成后请确认结果并提交至系统。
                </p>
              </div>

              {/* Doc to be signed */}
              <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm" style={{ border: "1px solid #E8E9EB" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#EBF2FF" }}>
                  <BookOpen size={18} style={{ color: DD_BLUE }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: "#1F2329" }}>消防设备维护运维合同_CC2.docx</div>
                  <div className="text-xs" style={{ color: DD_GRAY }}>Word 文档 · 待上传识别</div>
                </div>
              </div>

              {/* Drop zone */}
              <div
                className="rounded-xl p-8 flex flex-col items-center text-center cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${dragging ? DD_BLUE : "#C5D0E8"}`,
                  backgroundColor: dragging ? DD_BLUE_LIGHT : "#fff",
                }}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={() => { setDragging(false); handleUpload(); }}
                onClick={handleUpload}
              >
                <FolderOpen size={36} className="mb-3" style={{ color: DD_BLUE }} />
                <div className="text-sm font-semibold mb-1" style={{ color: "#1F2329" }}>点击上传 / 拖拽到此区域</div>
                <div className="text-xs" style={{ color: DD_GRAY }}>支持 Word、PDF 格式，AI 自动手动识别合同信息</div>
                <button className="mt-4 text-sm px-5 py-2 rounded-lg text-white" style={{ backgroundColor: DD_BLUE }}
                  onClick={e => { e.stopPropagation(); handleUpload(); }}>
                  选择文件上传
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: Recognizing ── */}
          {step === "recognizing" && (
            <div className="flex flex-col items-center justify-center h-full gap-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: DD_BLUE_LIGHT }}>
                <div className="w-9 h-9 border-[3px] rounded-full animate-spin" style={{ borderColor: `${DD_BLUE}40`, borderTopColor: DD_BLUE }} />
              </div>
              <div className="text-sm font-semibold" style={{ color: "#1F2329" }}>AI 正在识别合同内容...</div>
              <div className="space-y-2 text-center">
                {["提取甲乙双方基础信息", "解析签订内容与条款", "校验关键字段完整性"].map((t, i) => (
                  <div key={t} className="text-xs flex items-center justify-center gap-1.5" style={{ color: DD_GRAY }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: DD_BLUE, animationDelay: `${i * 0.3}s` }} />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: Result ── */}
          {step === "result" && (
            <div className="flex flex-col gap-3 max-w-lg mx-auto">
              {/* Doc row */}
              <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm" style={{ border: "1px solid #E8E9EB" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#EBF2FF" }}>
                  <BookOpen size={15} style={{ color: DD_BLUE }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate" style={{ color: "#1F2329" }}>消防设备维护运维合同_CC2.docx</div>
                  <div className="text-xs" style={{ color: DD_GRAY }}>Word · 识别完成</div>
                </div>
              </div>

              {/* Summary result card — matches image */}
              <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: "1px solid #E8E9EB" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: "#1F2329" }}>已完成识别，以下为识别结果：</span>
                  <span className="text-xs" style={{ color: DD_GRAY }}>以下为识别结果</span>
                </div>
                {resultRows.map(row => (
                  <div key={row.label} className="flex items-center gap-2.5 py-2.5 border-b last:border-0" style={{ borderColor: "#F0F2F5" }}>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#EBF2FF" }}>
                      <span style={{ color: DD_BLUE, fontSize: 9, fontWeight: 700 }}>✓</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: "#1F2329" }}>{row.label}</span>
                    <span className="text-xs" style={{ color: row.warn ? DD_ORANGE : DD_GRAY }}>{row.detail}</span>
                  </div>
                ))}
                <button className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ backgroundColor: DD_BLUE }}
                  onClick={() => window.open(BIZ_URL, "_blank")}>
                  结果已采用，点此跳转到收入系统
                </button>
              </div>

              {/* Detailed field cards */}
              {contractFields.map(group => (
                <div key={group.group} className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: "1px solid #E8E9EB" }}>
                  <div className="px-4 py-2.5 border-b" style={{ backgroundColor: "#F8F9FB", borderColor: "#E8E9EB" }}>
                    <span className="text-xs font-semibold" style={{ color: "#1F2329" }}>{group.group}</span>
                  </div>
                  {group.items.map(([label, value]) => (
                    <div key={label} className="flex items-start gap-2 px-4 py-2.5 border-b last:border-0" style={{ borderColor: "#F0F2F5" }}>
                      <span className="text-xs shrink-0 w-20" style={{ color: DD_GRAY }}>{label}</span>
                      <span className="text-xs font-medium flex-1" style={{ color: label === "未识别项" ? DD_ORANGE : "#1F2329" }}>{value}</span>
                    </div>
                  ))}
                </div>
              ))}

              <div className="text-center text-xs py-1 flex items-center justify-center gap-1" style={{ color: DD_GREEN }}>
                <span>✓</span><span>合同信息识别完成，请确认后提交</span>
              </div>

              {/* Upload another */}
              <div className="rounded-xl p-5 flex flex-col items-center text-center cursor-pointer"
                style={{ border: "2px dashed #C5D0E8", backgroundColor: "#fff" }}
                onClick={() => setStep("upload")}>
                <FolderOpen size={22} className="mb-2" style={{ color: DD_BLUE }} />
                <div className="text-xs font-medium mb-0.5" style={{ color: "#1F2329" }}>点击上传 / 拖拽到此区域</div>
                <div className="text-[10px]" style={{ color: DD_GRAY }}>继续上传其他合同附件进行识别</div>
              </div>
            </div>
          )}
        </div>
      </div>
      {step === "result" && onComplete && (
        <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: "#E8E9EB", backgroundColor: "#fff" }}>
          <button
            onClick={() => { onComplete(); }}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ backgroundColor: DD_GREEN }}>
            ✅ 识别完成，关闭任务
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Knowledge Base Modal ─────────────────────────────────────────────────────
interface KBTemplate {
  icon: string; label: string; desc: string; category: "推荐模板" | "适用于团队内部协作" | "适用于企业内部公开"; tag?: string;
}

const KB_TEMPLATES: KBTemplate[] = [
  { icon:"💡", label:"项目管理", desc:"管控项目进度、规范...", category:"推荐模板" },
  { icon:"📋", label:"人事行政", desc:"帮助建立完善行政收...", category:"推荐模板" },
  { icon:"📊", label:"财务会计", desc:"协同财务管理，支撑...", category:"推荐模板" },
  { icon:"🎯", label:"产品 & 策划", desc:"为产品团队提供创造...", category:"适用于团队内部协作" },
  { icon:"🌿", label:"HR & 招聘", desc:"企业文化、面试记录...", category:"适用于团队内部协作" },
  { icon:"🛠️", label:"IT & 运维", desc:"快速构建公司自主知...", category:"适用于团队内部协作" },
  { icon:"🚀", label:"研发 & 技术", desc:"从研发到技术文档沉...", category:"适用于团队内部协作" },
  { icon:"📣", label:"市场营销", desc:"市场策划和调研并然...", category:"适用于团队内部协作" },
  { icon:"🏠", label:"企业百科", desc:"全员可见的企业资料库", category:"适用于企业内部公开", tag:"企业内公开" },
  { icon:"🌱", label:"规范制度", desc:"全员可见的企业规章...", category:"适用于企业内部公开", tag:"企业内公开" },
  { icon:"🌳", label:"产品帮助", desc:"帮助用户快速上手使...", category:"适用于企业内部公开", tag:"企业内公开" },
];

const KB_BENEFITS = [
  "统一管理企业文档与知识资产",
  "AI 智能体可直接调用知识库内容",
  "支持个人 & 团队协作编辑",
  "自动关联相关文档与流程",
  "沉淀企业 SOP 与业务知识",
];

type KBStep = "choose" | "config" | "done";

function KnowledgeBaseModal({ docTitle, onClose }: { docTitle: string; onClose: () => void }) {
  const [step, setStep] = useState<KBStep>("choose");
  const [selected, setSelected] = useState<string | null>(null);
  const [kbName, setKbName] = useState("");
  const [kbDesc, setKbDesc] = useState("");
  const [addingDoc, setAddingDoc] = useState(false);

  const grouped = KB_TEMPLATES.reduce<Record<string, KBTemplate[]>>((acc, t) => {
    (acc[t.category] ||= []).push(t); return acc;
  }, {});

  const handleNext = () => {
    if (step === "choose") {
      setKbName(selected ? (KB_TEMPLATES.find(t => t.label === selected)?.label ?? "") + "知识库" : "企业知识库");
      setStep("config");
    } else if (step === "config") {
      setAddingDoc(true);
      setTimeout(() => { setAddingDoc(false); setStep("done"); }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rounded-2xl flex overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#fff", width: 760, maxHeight: "88vh", minHeight: 480 }}>

        {/* ── Left: form area ── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: "#E8E9EB" }}>
            <span className="text-base font-semibold" style={{ color: "#1F2329" }}>
              {step === "choose" ? "新建知识库" : step === "config" ? "配置知识库" : "知识库已创建"}
            </span>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}><X size={14} /></button>
          </div>

          {/* Step: choose template */}
          {step === "choose" && (
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Blank option */}
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: DD_GRAY }}>推荐模板</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelected(null)}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: selected === null ? DD_BLUE : "#E8E9EB",
                      backgroundColor: selected === null ? DD_BLUE_LIGHT : "#fff",
                    }}>
                    <span className="text-lg">+</span>
                    <div>
                      <div className="text-xs font-medium" style={{ color: "#1F2329" }}>空白知识库</div>
                    </div>
                  </button>
                  {grouped["推荐模板"]?.map(t => (
                    <button key={t.label}
                      onClick={() => setSelected(t.label)}
                      className="flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all"
                      style={{
                        borderColor: selected === t.label ? DD_BLUE : "#E8E9EB",
                        backgroundColor: selected === t.label ? DD_BLUE_LIGHT : "#fff",
                      }}>
                      <span className="text-base">{t.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate" style={{ color: "#1F2329" }}>{t.label}</div>
                        <div className="text-[10px] truncate" style={{ color: DD_GRAY }}>{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {(["适用于团队内部协作", "适用于企业内部公开"] as const).map(cat => (
                <div key={cat}>
                  <div className="text-xs font-semibold mb-2" style={{ color: DD_GRAY }}>{cat}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {grouped[cat]?.map(t => (
                      <button key={t.label}
                        onClick={() => setSelected(t.label)}
                        className="flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all"
                        style={{
                          borderColor: selected === t.label ? DD_BLUE : "#E8E9EB",
                          backgroundColor: selected === t.label ? DD_BLUE_LIGHT : "#fff",
                        }}>
                        <span className="text-base">{t.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-xs font-medium" style={{ color: "#1F2329" }}>{t.label}</span>
                            {t.tag && <span className="text-[9px] px-1 rounded" style={{ backgroundColor: "#EBF2FF", color: DD_BLUE }}>{t.tag}</span>}
                          </div>
                          <div className="text-[10px] truncate" style={{ color: DD_GRAY }}>{t.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="text-xs" style={{ color: DD_GRAY }}>
                没找到想要的模板？<span className="cursor-pointer" style={{ color: DD_BLUE }}>去反馈</span>
              </div>
            </div>
          )}

          {/* Step: config */}
          {step === "config" && (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div className="rounded-xl p-3 flex items-start gap-2" style={{ backgroundColor: DD_BLUE_LIGHT, border: `1px solid ${DD_BLUE}30` }}>
                <Zap size={13} className="shrink-0 mt-0.5" style={{ color: DD_BLUE }} />
                <p className="text-xs leading-relaxed" style={{ color: DD_BLUE }}>
                  将「<strong>{docTitle}</strong>」纳入知识库后，AI 智能体可直接检索和引用其内容，用于问答、任务分析和报告生成。
                </p>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#1F2329" }}>知识库名称</label>
                <input
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid #E8E9EB", color: "#1F2329" }}
                  value={kbName}
                  onChange={e => setKbName(e.target.value)}
                  placeholder="请输入知识库名称" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "#1F2329" }}>描述（可选）</label>
                <textarea rows={2}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                  style={{ border: "1px solid #E8E9EB", color: "#1F2329" }}
                  value={kbDesc}
                  onChange={e => setKbDesc(e.target.value)}
                  placeholder="描述这个知识库的用途..." />
              </div>
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: "#1F2329" }}>初始收录文档</div>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ border: "1px solid #E8E9EB", backgroundColor: "#F8F9FB" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: DD_BLUE_LIGHT }}>
                    <FileText size={14} style={{ color: DD_BLUE }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "#1F2329" }}>{docTitle}</div>
                    <div className="text-xs mt-0.5" style={{ color: DD_GRAY }}>当前文档 · 自动收录</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "#F6FFED", color: DD_GREEN }}>已选</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: "#1F2329" }}>AI 智能体权限</div>
                <div className="space-y-2">
                  {["邻里AI全能助手", "合同智能体", "仪容仪表助理"].map((agent, i) => (
                    <div key={agent} className="flex items-center justify-between px-3 py-2 rounded-xl"
                      style={{ border: "1px solid #E8E9EB", backgroundColor: "#fff" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                          style={{ backgroundColor: [DD_BLUE, "#722ED1", "#FA8C16"][i] }}>AI</div>
                        <span className="text-xs" style={{ color: "#1F2329" }}>{agent}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-4 rounded-full flex items-center relative cursor-pointer"
                          style={{ backgroundColor: DD_GREEN }}>
                          <div className="absolute right-0.5 w-3 h-3 rounded-full bg-white shadow-sm" />
                        </div>
                        <span className="text-[10px]" style={{ color: DD_GREEN }}>可读取</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {addingDoc && (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-4 h-4 border-2 rounded-full animate-spin shrink-0" style={{ borderColor: `${DD_BLUE}30`, borderTopColor: DD_BLUE }} />
                  <span className="text-xs" style={{ color: DD_BLUE }}>正在创建知识库并收录文档...</span>
                </div>
              )}
            </div>
          )}

          {/* Step: done */}
          {step === "done" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F6FFED" }}>
                <span style={{ fontSize: 32 }}>✅</span>
              </div>
              <div className="text-center space-y-1.5">
                <div className="text-base font-semibold" style={{ color: "#1F2329" }}>知识库已创建成功</div>
                <p className="text-xs" style={{ color: DD_GRAY }}>「{kbName || "企业知识库"}」已建立，文档已收录，AI 智能体现可读取调用</p>
              </div>
              <div className="w-full rounded-xl p-4 space-y-2" style={{ backgroundColor: "#F6FFED", border: "1px solid #52C41A30" }}>
                {[
                  ["知识库名称", kbName || "企业知识库"],
                  ["已收录文档", "1 篇"],
                  ["可调用智能体", "3 个"],
                  ["状态", "已启用"],
                ].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: DD_GRAY }}>{l}</span>
                    <span className="text-xs font-medium" style={{ color: "#1F2329" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}>
                  关闭
                </button>
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ backgroundColor: DD_BLUE }}>
                  进入知识库
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          {step !== "done" && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0" style={{ borderColor: "#E8E9EB" }}>
              <button onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#F5F6F8", color: DD_GRAY }}>
                取消
              </button>
              <button onClick={handleNext} disabled={addingDoc}
                className="px-6 py-2 rounded-xl text-sm font-medium text-white"
                style={{ backgroundColor: addingDoc ? "#93C5FD" : DD_BLUE }}>
                {step === "choose" ? "下一步" : addingDoc ? "创建中..." : "创建知识库"}
              </button>
            </div>
          )}
        </div>

        {/* ── Right: info panel ── */}
        <div className="w-56 shrink-0 flex flex-col p-5 gap-3 border-l" style={{ backgroundColor: "#F8F9FB", borderColor: "#E8E9EB" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: DD_BLUE_LIGHT }}>
            <span style={{ fontSize: 22 }}>✅</span>
          </div>
          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: "#1F2329" }}>知识库</div>
            <p className="text-xs leading-relaxed" style={{ color: DD_GRAY }}>邀请团队成员一起创作和交流知识</p>
          </div>
          <div className="space-y-1.5 mt-1">
            {KB_BENEFITS.map(b => (
              <div key={b} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: DD_BLUE }} />
                <span className="text-xs leading-relaxed" style={{ color: DD_GRAY }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 消息页 ──────────────────────────────────────────────────────────────────
const msgList = [
  { id:"msg1", name:"时代云图（佛山）二期工作交流群", avatar:"云", avatarBg:"#337EFF", time:"15:12", preview:"AI助理: ✅ 台风防风准备全部完成，5/5项任务已确认", unread:3, selected:true, tags:["工作群"] },
  { id:"msg2", name:"时代邻里物管客服群", avatar:"客", avatarBg:"#52C41A", time:"09:10", preview:"王芳: 03栋1203业主噪音投诉已处理完毕", tags:["工作群"] },
  { id:"msg3", name:"工程维修组", avatar:"工", avatarBg:"#1890FF", time:"09:05", preview:"张伟: 本周电梯维保计划已排好，请查收" },
  { id:"msg4", name:"品质巡检通报", avatar:"品", avatarBg:"#FA8C16", time:"昨天", preview:"[巡检报告] 6月24日品质检查结果已发布", tags:["系统通知"] },
  { id:"msg5", name:"物业费催缴提醒", avatar:"费", avatarBg:"#FF4D4F", time:"昨天", preview:"催费任务进展：已跟进38户，12户已缴费" },
  { id:"msg6", name:"供应商管理群", avatar:"供", avatarBg:"#722ED1", time:"06-24", preview:"[审批] 供应商B续签合同待您审批" },
  { id:"msg7", name:"人事行政通知", avatar:"人", avatarBg:"#13C2C2", time:"06-23", preview:"6月考勤汇总已发布，请各部门核对" },
  { id:"msg8", name:"AI邻里助手", avatar:"AI", avatarBg:"#337EFF", time:"06-22", preview:"Q2季度报告大纲已完成，财务板块数据...", isBot:true },
  { id:"msg9", name:"项目经理工作群", avatar:"管", avatarBg:"#8F959E", time:"06-20", preview:"陈经理: 下周二项目例会请准时参加" },
];

const groupMessages = [
  { id:"gm1", type:"system", text:"今天 14:00" },
  { id:"gm2", type:"bot", sender:"AI邻里助手", avatar:"AI", avatarBg:"#337EFF",
    text:"⚠️ 【台风预警通知】@所有人\n\n气象台发布台风橙色预警，台风「天鸽」预计明日15:00前后登陆，届时阵风可达12级。\n\n请各岗位今日16:00前完成以下防风措施并在本群回复确认：", time:"14:00" },
  { id:"gm3", type:"notify", sender:"AI邻里助手", avatar:"AI", avatarBg:"#337EFF", time:"14:00",
    notify:{
      title:"台风防风任务清单",
      subtitle:"时代云图（佛山）二期 · 请各组今日16:00前完成并回复",
      tasks:[
        { group:"管家组", owner:"李晓梅", task:"公共区域固定设施加固（花圃支架、景观灯、宣传展架）", done:false },
        { group:"工程组", owner:"张伟", task:"排水系统检查 + 地下室防水 + 备用发电机待机", done:false },
        { group:"客助组", owner:"王芳", task:"向全体业主推送台风提醒，大堂放置防水沙袋", done:false },
        { group:"保洁组", owner:"刘芳", task:"清理各楼栋排水沟杂物，户外垃圾桶移入室内固定", done:false },
        { group:"项目经理", owner:"陈经理", task:"统筹确认各组完成情况，向区域汇报备案", done:false },
      ],
    },
  },
  { id:"gm4", type:"other", sender:"陈经理", role:"项目经理", avatar:"陈", avatarBg:"#722ED1",
    text:"各位注意，台风「天鸽」登陆时间比预期提前，今天16:00前务必完成，有问题随时在群里说。大家加油 💪", time:"14:02" },
  { id:"gm5", type:"other", sender:"李晓梅", role:"管家", avatar:"梅", avatarBg:"#52C41A",
    text:"收到！马上带人开始公共区域检查和设施加固，大堂门口的展架和花圃支架先处理", time:"14:04" },
  { id:"gm6", type:"other", sender:"张伟", role:"工程", avatar:"工", avatarBg:"#1890FF",
    text:"收到，我去地下室检查排水泵和配电房，顺便确认备用发电机状态 🔧", time:"14:05" },
  { id:"gm7", type:"other", sender:"王芳", role:"客助", avatar:"客", avatarBg:"#FA8C16",
    text:"收到，我这边先通知物业群推送台风提醒给业主，大堂沙袋我去库房拿", time:"14:06" },
  { id:"gm8", type:"system", text:"14:38" },
  { id:"gm9", type:"other", sender:"李晓梅", role:"管家", avatar:"梅", avatarBg:"#52C41A",
    text:"✅ 管家组完成：楼道、大堂、车库出入口固定设施已全部加固，景观区花圃支架已绑扎，临时宣传展架已撤除收纳，已拍照存档", time:"14:38" },
  { id:"gm10", type:"other", sender:"张伟", role:"工程", avatar:"工", avatarBg:"#1890FF",
    text:"✅ 工程组完成：地下室排水泵测试正常，配电房门缝防水条已更换，备用发电机已加油待机，屋顶设备固定螺栓全部复检", time:"14:41" },
  { id:"gm11", type:"other", sender:"王芳", role:"客助", avatar:"客", avatarBg:"#FA8C16",
    text:"✅ 客助组完成：业主台风提醒短信+钉钉已推送，1楼大堂防水沙袋10个就位，公告栏已张贴台风注意事项，地库入口已放警示牌", time:"14:50" },
  { id:"gm12", type:"bot", sender:"AI邻里助手", avatar:"AI", avatarBg:"#337EFF",
    text:"📊 防风任务进度更新（14:50）\n\n✅ 管家组 — 李晓梅 已完成\n✅ 工程组 — 张伟 已完成\n✅ 客助组 — 王芳 已完成\n⏳ 保洁组 — 刘芳 未回复\n⏳ 项目经理 — 陈经理 未确认\n\n@刘芳 请确认排水沟清理和垃圾桶固定情况\n@陈经理 请在完成统筹后回复确认", time:"14:51" },
  { id:"gm13", type:"system", text:"15:08" },
  { id:"gm14", type:"other", sender:"刘芳", role:"保洁", avatar:"洁", avatarBg:"#13C2C2",
    text:"✅ 保洁组完成：1-10栋各单元门前排水沟杂物已清理，户外8个垃圾桶已移入车库固定，园区水沟盖板已加固", time:"15:08" },
  { id:"gm15", type:"other", sender:"陈经理", role:"项目经理", avatar:"陈", avatarBg:"#722ED1",
    text:"✅ 统筹确认：已向区域经理汇报备案，各组任务均已完成。大家辛苦了！台风期间保持通讯畅通，有突发情况随时群内反馈 🙏", time:"15:12" },
  { id:"gm16", type:"bot", sender:"AI邻里助手", avatar:"AI", avatarBg:"#337EFF",
    text:"✅ 台风防风准备全部完成（15:12）\n\n5/5 项任务已确认完成，较要求时间提前44分钟。\n\n已自动生成防风工作记录并推送至项目管理系统，如台风期间发生设施损坏请随时在群内告知，AI将自动生成应急工单。", time:"15:12" },
];

function DDMsgPage() {
  return (
    <div className="flex flex-1 overflow-hidden" style={{ backgroundColor:"#fff" }}>
      {/* Left: conversation list */}
      <div className="flex flex-col shrink-0 overflow-hidden" style={{ width:280, borderRight:"1px solid #E8E9EB" }}>
        <div className="flex items-center gap-4 px-4 py-2.5 border-b shrink-0" style={{ borderColor:"#E8E9EB" }}>
          <span className="text-sm font-semibold border-b-2 pb-1.5" style={{ color:"#1F2329", borderColor:"#1F2329" }}>消息</span>
          <span className="text-sm pb-1.5" style={{ color:DD_GRAY }}>未读</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {msgList.map(m => (
            <div key={m.id} className="flex items-start gap-3 px-4 py-2.5 cursor-pointer"
              style={{ backgroundColor: m.selected ? "#EBF2FF" : "transparent" }}>
              <div className="relative shrink-0 mt-0.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: m.avatarBg }}>{m.avatar}</div>
                {m.isBot && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full flex items-center justify-center" style={{ backgroundColor:"#337EFF" }}>
                      <span style={{ fontSize:5, color:"#fff" }}>AI</span>
                    </div>
                  </div>
                )}
                {m.unread && <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">{m.unread}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs font-medium truncate" style={{ color:"#1F2329", maxWidth:130 }}>{m.name}</span>
                    {m.tags?.map(tag => (
                      <span key={tag} className="shrink-0 text-[9px] px-1 py-0.5 rounded border" style={{ color:"#8F959E", borderColor:"#D8D8D8", lineHeight:1 }}>{tag}</span>
                    ))}
                  </div>
                  <span className="text-[10px] shrink-0" style={{ color:DD_GRAY }}>{m.time}</span>
                </div>
                <p className="text-xs truncate" style={{ color:DD_GRAY }}>{m.preview}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: group chat detail */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0" style={{ borderColor:"#E8E9EB" }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color:"#1F2329" }}>时代云图（佛山）二期工作交流群</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ color:DD_BLUE, backgroundColor:DD_BLUE_LIGHT }}>工作群</span>
            </div>
            <div className="text-xs mt-0.5" style={{ color:DD_GRAY }}>李晓梅(管家) · 张伟(工程) · 王芳(客助) · 刘芳(保洁) · 陈经理(项目经理) · AI助理，共6人</div>
          </div>
          <div className="flex items-center gap-2">
            <button style={{ color:DD_GRAY, fontSize:18 }}>···</button>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ backgroundColor:"#F5F6F8" }}>
          {groupMessages.map(msg => {
            if (msg.type === "system") {
              return (
                <div key={msg.id} className="text-center text-[11px] py-1" style={{ color:DD_GRAY }}>{msg.text}</div>
              );
            }

            if (msg.type === "image") {
              return (
                <div key={msg.id} className="flex items-start gap-2.5 pl-11">
                  <div className="rounded-xl overflow-hidden flex items-center justify-center text-3xl"
                    style={{ width:120, height:90, backgroundColor:"#E8E9EB", border:"1px solid #D8D8D8" }}>
                    📷
                  </div>
                </div>
              );
            }

            if (msg.type === "notify" && msg.notify) {
              const n = msg.notify;
              return (
                <div key={msg.id} className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: msg.avatarBg }}>{msg.avatar}</div>
                  <div className="flex flex-col gap-0.5" style={{ maxWidth:"76%" }}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-medium" style={{ color:"#1F2329" }}>{msg.sender}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color:DD_BLUE, backgroundColor:DD_BLUE_LIGHT }}>AI助理</span>
                      <span className="text-[10px]" style={{ color:DD_GRAY }}>{msg.time}</span>
                    </div>
                    <div className="rounded-xl overflow-hidden" style={{ border:"1px solid #FFD666", backgroundColor:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                      <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor:"#FFFBE6", borderBottom:"1px solid #FFD666" }}>
                        <span style={{ fontSize:13 }}>📢</span>
                        <span className="text-xs font-semibold" style={{ color:"#875100" }}>{n.title}</span>
                      </div>
                      <div className="px-3 py-1.5">
                        <p className="text-[10px] mb-2" style={{ color:DD_GRAY }}>{n.subtitle}</p>
                        <div className="space-y-1.5">
                          {n.tasks.map((t: { group: string; owner: string; task: string; done: boolean }, i: number) => (
                            <div key={i} className="flex items-start gap-2 py-1.5 border-b last:border-0" style={{ borderColor:"#F5F6F8" }}>
                              <span className="text-[11px] shrink-0 mt-0.5">{t.done ? "✅" : "⏳"}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor:"#F5F6F8", color:"#666" }}>{t.group}</span>
                                  <span className="text-[10px]" style={{ color:DD_GRAY }}>{t.owner}</span>
                                </div>
                                <p className="text-[11px] leading-snug" style={{ color:"#1F2329" }}>{t.task}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            const isBot = msg.type === "bot" || msg.type === "card";
            const bubbleBg = isBot ? "#fff" : "#fff";
            const borderRadius = "4px 14px 14px 14px";

            return (
              <div key={msg.id} className="flex items-start gap-2.5">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: msg.avatarBg }}>
                  {msg.avatar}
                </div>

                <div className="flex flex-col gap-0.5 max-w-[72%]">
                  {/* Sender name + role */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-medium" style={{ color:"#1F2329" }}>{msg.sender}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                      color: isBot ? DD_BLUE : "#666",
                      backgroundColor: isBot ? DD_BLUE_LIGHT : "#EBEDF0"
                    }}>{isBot ? "AI助理" : msg.role}</span>
                    <span className="text-[10px]" style={{ color:DD_GRAY }}>{msg.time}</span>
                  </div>

                  {msg.type === "card" ? (
                    /* Work order card */
                    <div className="rounded-xl overflow-hidden" style={{ border:"1px solid #E8E9EB", backgroundColor:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                      <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor:DD_BLUE }}>
                        <span style={{ fontSize:13 }}>📋</span>
                        <span className="text-xs font-semibold text-white">工单已生成</span>
                        <span className="ml-auto text-[10px] text-white opacity-80">{msg.card?.no}</span>
                      </div>
                      <div className="px-3 py-2.5 space-y-1.5">
                        {[
                          { label:"位置", value: msg.card?.location },
                          { label:"问题", value: msg.card?.issue },
                          { label:"类型", value: msg.card?.type },
                          { label:"负责人", value: msg.card?.assignee },
                        ].map(row => (
                          <div key={row.label} className="flex items-center gap-2">
                            <span className="text-[11px] w-10 shrink-0" style={{ color:DD_GRAY }}>{row.label}</span>
                            <span className="text-[11px]" style={{ color:"#1F2329" }}>{row.value}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[11px] w-10 shrink-0" style={{ color:DD_GRAY }}>优先级</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color:DD_RED, backgroundColor:"#FFF1F0" }}>紧急</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium ml-1" style={{ color:DD_GRAY, backgroundColor:"#F5F6F8" }}>待处理</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Text bubble */
                    <div className="px-3 py-2 text-xs leading-relaxed" style={{
                      backgroundColor: bubbleBg,
                      color:"#1F2329",
                      borderRadius,
                      boxShadow:"0 1px 3px rgba(0,0,0,0.07)",
                      border: isBot ? `1px solid ${DD_BLUE}20` : "1px solid transparent",
                    }}>
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 border-t shrink-0" style={{ backgroundColor:"#fff", borderColor:"#E8E9EB" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ border:"1px solid #E8E9EB", backgroundColor:"#F5F6F8" }}>
            <input className="flex-1 bg-transparent text-xs outline-none" placeholder="发送消息..." style={{ color:"#1F2329" }} />
            <div className="flex items-center gap-2" style={{ color:DD_GRAY }}>
              <Paperclip size={14} />
              <Mic size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 日程页 ──────────────────────────────────────────────────────────────────
const WEEK_DAYS = [
  { label:"周日", date:"21", lunar:"夏至" },
  { label:"周一", date:"22", lunar:"初八" },
  { label:"周二", date:"23", lunar:"初九" },
  { label:"周三", date:"24", lunar:"初十" },
  { label:"周四", date:"25", lunar:"十一", today:true },
  { label:"周五", date:"26", lunar:"十二" },
  { label:"周六", date:"27", lunar:"十三" },
];
const TIME_SLOTS = ["8:00","9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];
const AI_EVENT_COLS = [0,1,2,3,4,5,6]; // all 7 days

function DDCalendarPage() {
  return (
    <div className="flex flex-1 overflow-hidden" style={{ backgroundColor:"#fff" }}>
      {/* Left sidebar */}
      <div className="flex flex-col shrink-0 border-r overflow-y-auto" style={{ width:200, borderColor:"#E8E9EB", backgroundColor:"#fff" }}>
        {/* Mini calendar header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color:"#1F2329" }}>2026年6月</span>
            <div className="flex items-center gap-1" style={{ color:DD_GRAY }}>
              <button style={{ fontSize:14 }}>‹</button>
              <button style={{ fontSize:14 }}>›</button>
            </div>
          </div>
          {/* Mini calendar grid */}
          <div className="grid grid-cols-7 gap-0 text-center">
            {["日","一","二","三","四","五","六"].map(d => (
              <div key={d} className="text-[10px] py-1" style={{ color:DD_GRAY }}>{d}</div>
            ))}
            {[31,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,1,2,3,4].map((d,i) => {
              const isJune = i >= 1 && i <= 30;
              const isToday = d === 25 && isJune;
              return (
                <div key={i} className="w-6 h-6 mx-auto flex items-center justify-center rounded-full text-[11px] cursor-pointer"
                  style={{
                    color: isToday ? "#fff" : !isJune ? "#C5D0E8" : i % 7 === 0 ? "#FF4D4F" : "#1F2329",
                    backgroundColor: isToday ? "#337EFF" : "transparent",
                    fontWeight: isToday ? 700 : 400,
                  }}>{d}</div>
              );
            })}
          </div>
        </div>
        <div className="border-t mx-3" style={{ borderColor:"#E8E9EB" }} />
        {/* My calendars */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color:"#1F2329" }}>我的</span>
            <div className="flex items-center gap-1" style={{ color:DD_GRAY }}>
              <span className="text-sm">···</span>
              <span style={{ fontSize:12 }}>⌃</span>
            </div>
          </div>
          {[
            { label:"我的日历", color:"#52C41A" },
            { label:"我的待办", color:"#1890FF" },
            { label:"AI听记",  color:"#722ED1" },
            { label:"Teambition任务", color:"#1890FF" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 py-1.5 cursor-pointer">
              <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center" style={{ backgroundColor: item.color }}>
                <span style={{ fontSize:9, color:"#fff" }}>✓</span>
              </div>
              <span className="text-xs" style={{ color:"#1F2329" }}>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="border-t mx-3" style={{ borderColor:"#E8E9EB" }} />
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color:"#1F2329" }}>他人日历</span>
            <span style={{ fontSize:12, color:DD_GRAY }}>⌃</span>
          </div>
          <div className="flex items-center gap-1 cursor-pointer py-1">
            <span style={{ fontSize:14, color:DD_GRAY }}>⊕</span>
            <span className="text-xs" style={{ color:DD_GRAY }}>添加更多</span>
          </div>
        </div>
        <div className="border-t mx-3" style={{ borderColor:"#E8E9EB" }} />
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color:"#1F2329" }}>订阅日历</span>
            <span style={{ fontSize:12, color:DD_GRAY }}>⌃</span>
          </div>
          <div className="flex items-center gap-1.5 cursor-pointer py-1">
            <span style={{ fontSize:14, color:DD_GRAY }}>⚙</span>
            <span className="text-xs" style={{ color:DD_GRAY }}>日历设置</span>
          </div>
        </div>
      </div>

      {/* Right: calendar view */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b shrink-0" style={{ borderColor:"#E8E9EB" }}>
          <div className="flex items-center gap-3">
            <button className="text-xs px-2.5 py-1 rounded border" style={{ color:"#1F2329", borderColor:"#D8D8D8" }}>今天</button>
            <div className="flex items-center gap-1" style={{ color:DD_GRAY }}>
              <button>‹</button>
              <button>›</button>
            </div>
            <span className="text-base font-semibold" style={{ color:"#1F2329" }}>2026年6月</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor:"#D8D8D8" }}>
              {["日","周","月","列表"].map((v,i) => (
                <button key={v} className="text-xs px-2.5 py-1" style={{
                  color: v === "周" ? DD_BLUE : "#1F2329",
                  backgroundColor: v === "周" ? "#EBF2FF" : "#fff",
                  borderRight: i < 3 ? "1px solid #D8D8D8" : "none",
                }}>{v}</button>
              ))}
            </div>
            <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor:"#F5F6F8" }}>?</button>
            <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor:"#F5F6F8" }}>⊞</button>
          </div>
        </div>

        {/* Week header */}
        <div className="grid shrink-0 border-b" style={{ gridTemplateColumns:"56px repeat(7, 1fr)", borderColor:"#E8E9EB" }}>
          <div className="text-xs py-2 px-2" style={{ color:DD_GRAY }}>GMT+08</div>
          {WEEK_DAYS.map(d => (
            <div key={d.date} className="text-center py-2 border-l" style={{ borderColor:"#E8E9EB" }}>
              <div className="text-xs" style={{ color:d.today ? DD_BLUE : DD_GRAY }}>{d.label}</div>
              <div className="mx-auto mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: d.today ? DD_BLUE : "transparent", color: d.today ? "#fff" : "#1F2329" }}>
                {d.date}
              </div>
              <div className="text-[10px]" style={{ color:d.today ? DD_BLUE : DD_GRAY }}>{d.lunar}</div>
            </div>
          ))}
        </div>

        {/* All-day row */}
        <div className="grid shrink-0 border-b" style={{ gridTemplateColumns:"56px repeat(7, 1fr)", borderColor:"#E8E9EB", minHeight:24 }}>
          <div />
          {WEEK_DAYS.map((d,i) => (
            <div key={d.date} className="border-l text-xs px-1 py-1" style={{ borderColor:"#E8E9EB" }}>
              {i === 1 && <div className="rounded px-1 text-[10px]" style={{ backgroundColor:"#F0F2F5", color:DD_GRAY }}>🕐 2项已处理</div>}
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid" style={{ gridTemplateColumns:"56px repeat(7, 1fr)" }}>
            {TIME_SLOTS.map((t, rowIdx) => (
              <>
                <div key={"t"+rowIdx} className="text-[10px] text-right pr-2 pt-1 shrink-0" style={{ color:DD_GRAY, height:52 }}>{t}</div>
                {WEEK_DAYS.map((d, colIdx) => (
                  <div key={d.date+rowIdx} className="border-l border-t relative" style={{ borderColor:"#E8E9EB", height:52 }}>
                    {/* 晨会 09:00-09:30 (row 1 = 9:00, 周四 colIdx=4) */}
                    {rowIdx === 1 && colIdx === 4 && (
                      <div className="absolute rounded text-[10px] px-1 py-0.5 leading-tight overflow-hidden"
                        style={{ top:0, left:2, right:2, height:26, backgroundColor:DD_BLUE, color:"#fff", borderLeft:"3px solid #1554AD" }}>
                        <div className="font-semibold truncate">时代云图晨会</div>
                        <div>09:00-09:30</div>
                      </div>
                    )}
                    {/* 重点工作 10:00-10:30 (row 2 = 10:00, 周四 colIdx=4) */}
                    {rowIdx === 2 && colIdx === 4 && (
                      <div className="absolute rounded text-[10px] px-1 py-0.5 leading-tight overflow-hidden"
                        style={{ top:0, left:2, right:2, height:26, backgroundColor:DD_ORANGE, color:"#fff", borderLeft:"3px solid #D46B08" }}>
                        <div className="font-semibold truncate">重点工作跟进</div>
                        <div>10:00-10:30</div>
                      </div>
                    )}
                    {/* 外包单位 14:00-14:30 (row 6 = 14:00, 周四 colIdx=4) */}
                    {rowIdx === 6 && colIdx === 4 && (
                      <div className="absolute rounded text-[10px] px-1 py-0.5 leading-tight overflow-hidden"
                        style={{ top:0, left:2, right:2, height:26, backgroundColor:"#722ED1", color:"#fff", borderLeft:"3px solid #531DAB" }}>
                        <div className="font-semibold truncate">外包单位会议</div>
                        <div>14:00-14:30</div>
                      </div>
                    )}
                    {/* Current time indicator at ~17:34 row (row index 9 = 17:00) */}
                    {rowIdx === 9 && d.today && (
                      <div className="absolute left-0 right-0 flex items-center" style={{ top:34 }}>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor:DD_RED, marginLeft:-4 }} />
                        <div className="flex-1 h-px" style={{ backgroundColor:DD_RED }} />
                      </div>
                    )}
                    {/* 时代外滩AI event at 18:30-19:30 (row 10 = 18:00) */}
                    {rowIdx === 10 && AI_EVENT_COLS.includes(colIdx) && (
                      <div className="absolute rounded text-[10px] px-1 py-0.5 leading-tight overflow-hidden"
                        style={{ top:26, left:2, right:2, height:52, backgroundColor:"#52C41A", color:"#fff", borderLeft:"3px solid #389E0D" }}>
                        <div className="font-semibold truncate">时代外滩AI沟...</div>
                        <div>18:30 - 19:30</div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Right mini panel icons */}
      <div className="flex flex-col items-center pt-2 gap-2 shrink-0" style={{ width:36, borderLeft:"1px solid #E8E9EB", backgroundColor:"#fff" }}>
        {["📅","📋","📊","💜","➕"].map((icon,i) => (
          <button key={i} className="w-7 h-7 rounded flex items-center justify-center text-base" style={{ backgroundColor: i === 4 ? "#337EFF" : "#F5F6F8" }}>{icon}</button>
        ))}
      </div>
    </div>
  );
}

// ─── 文档页 ──────────────────────────────────────────────────────────────────
const ddDocFiles = [
  { title:"生产巡检（AI智能运维）",  path:"广州市时代邻里邦网络科技有限公司/我的文档", creator:"杜镇城", updated:"周四 14:04", type:"sheet" },
  { title:"仪容仪表检查",            path:"广州市时代邻里邦网络科技有限公司/我的文档", creator:"杜镇城", updated:"周四 11:30", type:"sheet", shared:true },
  { title:"时代邻里-项目实施计划_0610_v4.1.pptx", path:"单聊: 肖新和", creator:"肖新和", updated:"6月12日 12:48", type:"pptx" },
  { title:"副本阿里邮箱公有云基础现状调研表-时代邻里.xlsx", path:"单聊: 肖新和", creator:"杜镇城", updated:"6月04日 15:06", type:"xlsx" },
  { title:"项目跟进看板",            path:"广州市时代邻里邦网络科技有限公司/我的文档", creator:"杜镇城", updated:"5月27日 11:39", type:"sheet" },
];

function DDDocsPage() {
  const [activeTab, setActiveTab] = useState("最近");
  const [kbDoc, setKbDoc] = useState<string | null>(null);
  const tabs = ["最近","收藏","与我共享","我共享的","未读文档"];
  return (
    <div className="flex flex-1 overflow-hidden" style={{ backgroundColor:"#fff" }}>
      {kbDoc && <KnowledgeBaseModal docTitle={kbDoc} onClose={() => setKbDoc(null)} />}
      {/* Left sidebar */}
      <div className="flex flex-col shrink-0 border-r py-3 gap-1" style={{ width:180, borderColor:"#E8E9EB" }}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 pb-3 border-b" style={{ borderColor:"#E8E9EB" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor:"#EBF2FF" }}>
            <FileText size={14} style={{ color:DD_BLUE }} />
          </div>
          <span className="text-sm font-semibold" style={{ color:"#1F2329" }}>钉钉文档</span>
        </div>
        <div className="px-3 pt-2 space-y-1">
          <button className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-sm font-medium text-white" style={{ backgroundColor:DD_BLUE }}>
            <Plus size={14} />新建
          </button>
          <button className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-sm border" style={{ color:"#1F2329", borderColor:"#D8D8D8" }}>
            <span style={{ fontSize:12 }}>⬆</span>上传
          </button>
        </div>
        <div className="px-3 mt-2 space-y-0.5">
          {[
            { icon:"🏠", label:"首页", active:true },
            { icon:"📄", label:"我的文档" },
            { icon:"👥", label:"团队文件" },
          ].map(item => (
            <button key={item.label} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left"
              style={{ backgroundColor: item.active ? DD_BLUE_LIGHT : "transparent", color: item.active ? DD_BLUE : "#1F2329" }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
          {/* 知识库 */}
          <div>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-left" style={{ color:"#1F2329" }}>
              <span>📚</span><span className="flex-1">知识库</span><span style={{ fontSize:10 }}>⌃</span>
            </button>
            <div className="ml-4 mt-0.5">
              <button onClick={() => setKbDoc("新建")} className="flex items-center gap-1 text-xs px-2 py-1" style={{ color:DD_BLUE }}>
                <Plus size={10} />新建知识库
              </button>
            </div>
          </div>
        </div>
        {/* Bottom icons */}
        <div className="mt-auto px-3 flex items-center gap-2 pt-3 border-t" style={{ borderColor:"#E8E9EB" }}>
          <button style={{ color:DD_GRAY, fontSize:16 }}>☰</button>
          <button style={{ color:DD_GRAY, fontSize:16 }}>🎓</button>
          <button className="ml-auto" style={{ color:DD_GRAY }}>···</button>
        </div>
      </div>

      {/* Right: file list */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top area */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor:"#EBF2FF" }}>
              <FileText size={13} style={{ color:DD_BLUE }} />
            </div>
            <span className="text-base font-semibold" style={{ color:"#1F2329" }}>钉钉文档</span>
          </div>
          <div className="flex items-center gap-2" style={{ color:DD_GRAY }}>
            <Bell size={16} className="cursor-pointer" />
            <span style={{ fontSize:16 }}>🗂</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 px-5 border-b shrink-0" style={{ borderColor:"#E8E9EB" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="text-sm px-4 py-2 border-b-2 transition-colors"
              style={{
                color: activeTab === tab ? "#1F2329" : DD_GRAY,
                borderBottomColor: activeTab === tab ? "#1F2329" : "transparent",
                fontWeight: activeTab === tab ? 600 : 400,
              }}>{tab}</button>
          ))}
          <div className="ml-auto flex items-center gap-2 pb-1" style={{ color:DD_GRAY }}>
            <button style={{ fontSize:16 }}>⊞</button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b shrink-0" style={{ borderColor:"#E8E9EB" }}>
          <button className="flex items-center gap-1 text-sm border rounded px-2 py-1" style={{ color:"#1F2329", borderColor:"#D8D8D8" }}>
            所有类型 <ChevronDown size={12} />
          </button>
          <button className="flex items-center gap-1 text-sm border rounded px-2 py-1" style={{ color:"#1F2329", borderColor:"#D8D8D8" }}>
            创建人 <ChevronDown size={12} />
          </button>
          <button className="flex items-center gap-1 text-sm border rounded px-2 py-1" style={{ color:"#1F2329", borderColor:"#D8D8D8" }}>
            最近打开 <ChevronDown size={12} />
          </button>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto">
          {ddDocFiles.map((f, idx) => {
            const iconBg = f.type === "pptx" ? "#FFF1F0" : f.type === "xlsx" ? "#F6FFED" : "#EBF2FF";
            const iconColor = f.type === "pptx" ? "#FF4D4F" : f.type === "xlsx" ? "#52C41A" : DD_BLUE;
            return (
              <div key={idx} className="flex items-center gap-4 px-5 py-3.5 border-b cursor-pointer hover:bg-gray-50"
                style={{ borderColor:"#F0F2F5" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor:iconBg }}>
                  <FileText size={16} style={{ color:iconColor }} />
                </div>
                <div className="flex-1 min-w-0" onClick={() => setKbDoc(f.title)}>
                  <div className="text-sm font-medium truncate" style={{ color:"#1F2329" }}>{f.title}</div>
                  <div className="text-xs mt-0.5 truncate" style={{ color:DD_GRAY }}>{f.path}</div>
                </div>
                <div className="text-sm shrink-0" style={{ color:"#1F2329", minWidth:60 }}>{f.creator}</div>
                <div className="text-sm shrink-0 flex items-center gap-2" style={{ color:"#1F2329", minWidth:120 }}>
                  {f.updated}
                  {f.shared && <span style={{ color:DD_BLUE, fontSize:14 }}>⬆</span>}
                </div>
                <button onClick={() => setKbDoc(f.title)}
                  className="text-xs px-2 py-1 rounded-lg border transition-colors hover:border-blue-400"
                  style={{ color: DD_BLUE, borderColor: `${DD_BLUE}50`, backgroundColor: DD_BLUE_LIGHT, whiteSpace: "nowrap" }}>
                  + 知识库
                </button>
              </div>
            );
          })}
          <div className="text-center py-8 text-sm" style={{ color:DD_GRAY }}>没有更多啦~</div>
        </div>
      </div>
    </div>
  );
}

const subCategories: Record<string, { label: string; count: number }[]> = {
  日程: [
    { label:"全部", count:5 }, { label:"会议", count:3 }, { label:"钉钉待办", count:1 }, { label:"今日提醒", count:1 },
  ],
  任务: [
    { label:"全部", count:5 }, { label:"项目进场", count:1 }, { label:"合同审查", count:1 }, { label:"工单", count:1 },
    { label:"巡检任务", count:1 }, { label:"客户跟进", count:1 },
  ],
  公告: [
    { label:"全部", count:29 }, { label:"公司新闻", count:5 }, { label:"通知公告", count:8 },
    { label:"规章制度", count:8 }, { label:"处罚通报", count:8 },
  ],
  审批: [
    { label:"全部", count:14 }, { label:"待我审批", count:3 }, { label:"我发起的", count:2 },
    { label:"抄送我的", count:1 }, { label:"已审批", count:8 },
  ],
};

const announcements = [
  // 公司新闻 5条
  { id:"an_n1", title:"时代中国2026年开工大吉", type:"公司新闻", date:"02-24", publisher:"品牌部" },
  { id:"an_n2", title:"攻坚求存 砺行致远｜时代中国2026年度工作会圆满结束", type:"公司新闻", date:"02-15", publisher:"品牌部" },
  { id:"an_n3", title:"科学养护+智能工具，让绿化养护更精准高效", type:"公司新闻", date:"01-09", publisher:"运营管理部" },
  { id:"an_n4", title:"时代以「品质基因」重塑社区洁净新标杆", type:"公司新闻", date:"01-01", publisher:"品牌部" },
  { id:"an_n5", title:"项目设施升级，让业主生活更安全舒适", type:"公司新闻", date:"12-29", publisher:"工程管理部" },
  // 通知公告 8条
  { id:"an_a1", title:"关于业务系统停机维护通知[集团信息与数据中心]", type:"通知公告", date:"06-23", publisher:"集团信息与数据中心", unread:true },
  { id:"an_a2", title:"关于广州顺景雅苑项目李文兵、叶伟东应急处置工作的通报", type:"通知公告", date:"06-17", publisher:"运营管理部", unread:true },
  { id:"an_a3", title:"关于5月品质与服务各工作事项完成情况的公示", type:"通知公告", date:"06-17", publisher:"品质管理部", unread:true },
  { id:"an_a4", title:"关于重申公司假勤管理相关要求的通知[集团人力]", type:"通知公告", date:"06-16", publisher:"集团人力资源部" },
  { id:"an_a5", title:"关于业务系统停机维护通知[集团信息与数据中心]（二）", type:"通知公告", date:"06-16", publisher:"集团信息与数据中心" },
  { id:"an_a6", title:"2026年1~5月份项目生产建设管理公告[经营管理部]", type:"通知公告", date:"06-12", publisher:"经营管理部" },
  { id:"an_a7", title:"关于「时代邻里2026年3-6月主任级（含）以上骨干人员评定」工作的通知", type:"通知公告", date:"06-09", publisher:"人力资源部" },
  { id:"an_a8", title:"关于规范新拓及到期续签项目资料移交归档的通知", type:"通知公告", date:"06-05", publisher:"档案管理部" },
  // 规章制度 8条
  { id:"an_r1", title:"关于发布《机电公司电梯维保发函管理规定》的通知", type:"规章制度", date:"06-18", publisher:"机电管理部", unread:true },
  { id:"an_r2", title:"关于发布《组织人员调整与系统主数据及权限变更管理规定》的通知", type:"规章制度", date:"06-10", publisher:"人力资源部" },
  { id:"an_r3", title:"关于发布《时代中国工程质量奖罚制度（2026版）》的通知", type:"规章制度", date:"06-09", publisher:"工程管理部" },
  { id:"an_r4", title:"关于发布《时代中国城市更新绩效考核方案（2026版）》的通知", type:"规章制度", date:"05-29", publisher:"经营管理部" },
  { id:"an_r5", title:"关于发布《时代邻里公文写作规范（2026版）》的通知", type:"规章制度", date:"05-15", publisher:"行政部" },
  { id:"an_r6", title:"关于广告营销月度招商指标考核的通知", type:"规章制度", date:"05-07", publisher:"营销管理部" },
  { id:"an_r7", title:"关于更新《2026时代物业社区标识标牌视觉规范》的通知", type:"规章制度", date:"05-06", publisher:"品牌部" },
  { id:"an_r8", title:"关于发布《时代中国2026年绩效管理与激励方案》的通知", type:"规章制度", date:"04-27", publisher:"人力资源部" },
  // 处罚通报 8条
  { id:"an_p1", title:"关于「时代邻里5月项目现场服务人员投诉」处罚通报", type:"处罚通报", date:"06-05", publisher:"品质管理部" },
  { id:"an_p2", title:"关于「时代邻里5月客服工单考结果及处罚」的通报", type:"处罚通报", date:"06-05", publisher:"客户服务部" },
  { id:"an_p3", title:"关于时代邻里2026年4月档案归档和借阅归还情况的通报", type:"处罚通报", date:"06-05", publisher:"档案管理部" },
  { id:"an_p4", title:"关于西南区域二公司时代风华项目违规的处罚通报", type:"处罚通报", date:"05-19", publisher:"合规管理部" },
  { id:"an_p5", title:"关于「时代邻里4月客服工单考结果及处罚」的通报", type:"处罚通报", date:"05-08", publisher:"客户服务部" },
  { id:"an_p6", title:"关于「时代邻里4月项目现场服务人员投诉」处罚通报", type:"处罚通报", date:"05-08", publisher:"品质管理部" },
  { id:"an_p7", title:"关于「时代邻里3月项目现场服务人员投诉」处罚通报", type:"处罚通报", date:"04-10", publisher:"品质管理部" },
  { id:"an_p8", title:"关于时代邻里3月客服工单考结果及处罚的通报", type:"处罚通报", date:"04-10", publisher:"客户服务部" },
];

const approvals = [
  { id:"ap1", title:"供应商B续签合同审批", type:"合同审批", initiator:"郑赵峰", date:"今天", status:"待我审批", urgent:true },
  { id:"ap2", title:"B区24栋802装修申请审批", type:"装修申请", initiator:"业主刘先生", date:"今天", status:"待我审批" },
  { id:"ap3", title:"网格化工程设备采购申请", type:"采购审批", initiator:"工程部张工", date:"06-22", status:"待我审批" },
  { id:"ap4", title:"Q2客户满意度调研报告发布审批", type:"文件发布", initiator:"我", date:"06-21", status:"我发起的" },
  { id:"ap5", title:"A区绿化维护合同续签审批", type:"合同审批", initiator:"我", date:"06-18", status:"我发起的" },
  { id:"ap6", title:"年度供应商资质复审结果通知", type:"通知抄送", initiator:"采购部李主管", date:"06-15", status:"抄送我的" },
];

export default function App() {
  const [taskFilter, setTaskFilter] = useState<"all"|TaskStatus>("all");
  const [taskSearch, setTaskSearch] = useState("");
  const [detailTask, setDetailTask] = useState<Task|null>(null);
  const [aiTab, setAITab] = useState<AITab>("chat");
  const [linkedTask, setLinkedTask] = useState<Task|null>(null);
  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeSubAgent, setActiveSubAgent] = useState<string | null>(null);
  const [pendingContractCardId, setPendingContractCardId] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("tasks");
  const [ddNav, setDdNav] = useState<DDNav>("工作台");
  const [taskCategory, setTaskCategory] = useState<"日程" | "任务" | "公告" | "审批">("任务");
  const [subCat, setSubCat] = useState<Record<string, string>>({ 日程:"全部", 任务:"全部", 公告:"全部", 审批:"全部" });
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule|null>(null);
  const [aiUnread, setAiUnread] = useState(false);
  const [showBpmApproval, setShowBpmApproval] = useState(false);
  const [urgentPopupVisible, setUrgentPopupVisible] = useState(false);
  const [showProjectEntryCard, setShowProjectEntryCard] = useState(false);
  const [showEntrySubTasks, setShowEntrySubTasks] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<Message[]>([{
    id:"m0", role:"agent", time:"09:00",
    content:"您好！我是**邻里全能AI助手**，覆盖公司全业务，可以：\n\n• 业务问答 — SOP查询、制度解读、表单指引\n• 系统操作 — 工单创建、合同录入、审批推送\n• 任务协同 — 联动任务助理，完成调度、提醒与编排\n\n今日事务已编排完毕，任务助理按紧急程度分组呈现。有任何问题直接问我！",
    suggestions:["查看全部任务","查看项目欠缴情况","查看项目工单概况"],
  }]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  useEffect(() => {
    const t1 = setTimeout(() => setUrgentPopupVisible(true), 600);
    const t2 = setTimeout(() => setUrgentPopupVisible(false), 3600);
    const t3 = setTimeout(() => setShowProjectEntryCard(true), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const completeCard = (id: string) => { setCompletedCards(prev => new Set([...prev, id])); setDetailTask(null); };

  const urgentVisible = [...(showProjectEntryCard ? ["mc-project-entry"] : []), "mc-bpm-decoration", "mc-t1", "mc-srm-approval"].filter(id => !completedCards.has(id));
  const todayVisible  = ["mc-inspection"].filter(id => !completedCards.has(id));
  const followVisible = ["mc-announcement", "mc-t6", "mc-q2-approval"].filter(id => !completedCards.has(id));
  const totalVisible  = urgentVisible.length + todayVisible.length + followVisible.length;

  const statusOrder: Record<TaskStatus, number> = { urgent:0, new:1, processing:2, pending:3, done:4 };

  const filteredTasks = tasks
    .filter(t => subCat["任务"] === "全部" || t.type === subCat["任务"])
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  const sendMessage = (text?: string) => {
    const content = text ?? input.trim();
    if (!content) return;
    const now = new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"});
    setMessages(prev=>[...prev,
      { id:"u"+Date.now(), role:"user", content, time:now },
      { id:"t"+Date.now(), role:"agent", content:"", time:"", typing:true },
    ]);
    setInput("");
    setTimeout(()=>{
      const isAllTasks = ["全部任务","全部事务","任务列表","所有任务","查看全部"].some(kw => content.includes(kw));
      const isReorder = ["调整编排","重新编排","任务调整","调整任务","重排"].some(kw => content.includes(kw));
      const isProjectEntry = ["进场","进驻","接管","进场SOP","进场流程","进场需要","进场任务"].some(kw => content.includes(kw));
      const isContractQuery = !isProjectEntry && ["合同","签约","合同录入","合同查询","合同状态","合同审批"].some(kw => content.includes(kw));
      const isPaymentQuery = ["请款","付款申请","报销","款项审批","费用申请"].some(kw => content.includes(kw));
      const isExpenseSubject = ["科目","报什么","活动经费","费用科目","报销科目","客户关怀","业务接待"].some(kw => content.includes(kw));
      const isOrderReview = ["审单","单据审核","工单审核","核单","校验单据"].some(kw => content.includes(kw));
      const isProcurementFlow = ["非战略","战略清单","协议下单","采购流程","采购10万","采招流程","招标流程"].some(kw => content.includes(kw));
      const contractAgentReply: Partial<Message> = {
        content:"已识别到合同相关需求，**合同智能体**可协助您：\n\n• 上传合同 → AI 自动提取甲乙方信息、金额、期限等关键字段\n• 合同信息录入系统，推送审批流程\n• 查询合同状态与历史记录\n\n正在为您调起合同智能体...",
        actionable:[{ label:"🔗 前往合同智能体", prompt:"__AGENT_contract__" }],
      };
      const paymentAgentReply: Partial<Message> = {
        content:"已识别到请款/付款需求，**请款智能体**可协助您：\n\n• 发起付款申请，自动关联供应商与合同\n• 三单匹配（合同 / 发票 / 付款单）\n• 追踪审批进度，确认到账\n\n正在为您调起请款智能体...",
        actionable:[{ label:"🔗 前往请款智能体", prompt:"__AGENT_payment__" }],
      };
      const orderReviewReply: Partial<Message> = {
        content:"已识别到审单需求，**智能审单**可协助您：\n\n• 自动核对单据与合同条款匹配情况\n• 识别金额异常、供应商风险点\n• 批量审核并生成审核意见报告\n\n正在为您调起智能审单智能体...",
        actionable:[{ label:"🔗 前往智能审单", prompt:"__AGENT_order-review__" }],
      };
      const projectEntryReply: Partial<Message> = {
        content:"🔍 已搜索「增量常规进场SOP知识库」· 检索到 59 项工作项\n\n项目进场分 5 个阶段，核心事项如下：\n\n**① 进场前 30 天**\n• 组织进场沟通会，完成项目信息完整交接\n• 落实人员编制，摸查办公及住宿配置方案\n• 财务建账（NC账套、收费系统、银行账户）\n\n**② 进场前 15 天**\n• 承接查验：消防、电梯、供配电、给排水、园林\n• 人员、工衣、办公物资到位\n\n**③ 进场前 7 天**\n• 签订外包合同（保洁 / 绿化 / 电梯 / 消防维保）\n• 系统数据初始化、收费系统配置、备用金申请\n• 完成员工上岗培训\n\n**④ 进场当天**\n• 用房接收，资产 / 档案 / 印章移交，证照上墙\n• 企微、邻里邦APP上线；执行进驻宣传\n\n**⑤ 接管后 30 天内**\n• 7天内：电子印章、项目保险、公告栏公示、装修管理上线\n• 15天内：标牌换新、拜访属地居委 / 派出所\n• 30天内：水电表过户、网格化系统初始化\n\n---\n\n✅ 您目前已有进场任务正在进行中（接管后 7 日内阶段），任务已帮您编排并推送至「任务助理 → 立即处理」，有其他疑问随时问我！",
        suggestions:["进场当天详细流程","查看进场关键项清单","进场任务当前进度"],
      };
      const allTasksReply: Partial<Message> = {
        content: `以下是今日全部 ${totalVisible} 项编排事务：\n\n🔴 **立即处理（${urgentVisible.length}件）**\n• 时代云图晨会 — 08:30 即将开始\n• 项目进场7日内交付任务清单 — 今日截止\n• 供应商B续签合同审批 — 今日截止\n\n🟡 **今日完成（${todayVisible.length}件）**\n• 项目区域重点工作跟进情况 — 10:00 会议室A\n• 住区网格化安全巡检 — 今日完成\n\n⚫ **知悉跟进（${followVisible.length}件）**\n• 公告：业务系统停机维护通知\n• 业主满意度回访客户跟进 — 06-28截止\n• Q2客户满意度调研报告发布审批 — 审批中\n\n需要我对某项任务进行分析或协助处理吗？`,
        suggestions: ["帮我分析合同审批","生成巡检报告模板","查看工单详情"],
      };
      const reorderReply: Partial<Message> = {
        content: `当前编排基于截止日期+紧急程度自动排序。如需调整，请告诉我：\n\n• **延后某项** — 如「将巡检推到明天」\n• **提升优先级** — 如「合同审批最高优先」\n• **添加新任务** — 告诉我内容，AI自动插入合适分组\n• **隐藏某类** — 如「暂时不显示知悉跟进」\n\n您想怎么调整？`,
        suggestions: ["将巡检推到明天","合同审批设为最高优先","添加新任务"],
      };
      const canned: Record<string,Partial<Message>> = {
        "查看全部任务": allTasksReply,
        "查看项目欠缴情况": {
          content: `💰 **时代云图（佛山）二期 · 本年收费概况**\n\n📋 **应收总览**\n应收金额：**229.3 万元** ｜ 减免：0.00 元\n\n✅ **实收：171.98 万元**\n┣ 住宅服务费　**161.28 万元**\n┣ 水　　　费　　　 0.03 元\n┗ 电　　　费　　**9.29 万元**\n\n❌ **未收：57.31 万元**\n┣ 住宅服务费　**52.97 万元**\n┣ 水　　　费　　　0.00 元\n┗ 电　　　费　　**4.35 万元**\n\n📅 **今日动态**\n• 今日实收：**528.22 元**\n• 今日回款：**450.62 元**\n• 预缴余额：**14.68 万元**\n\n> AI 提示：未收占比 25%，住宅服务费欠款占主要部分，建议优先跟进欠缴大户催收。`,
          suggestions: ["导出欠缴明细","催缴任务分配","查看欠缴大户列表"],
        },
        "查看项目工单概况": {
          content: `🔧 **时代云图（佛山）二期 · 本月工单概况**\n\n📊 **完成率：94%** 🟢 本月表现良好\n\n**工单明细**\n✅ 已完成　**80 个**\n🔄 处理中　**15 个**\n⏰ 已超时　 **5 个**\n\n⏱️ **本月总工时：200 小时**\n\n> AI 提示：当前有 5 个超时工单，建议今日内安排跟进，避免影响月度 KPI 考核。是否立即查看超时工单详情？`,
          suggestions: ["查看超时工单","生成工单月报","工单分类统计"],
        },
        "查看今日紧急任务":{ content:"今日共有 **2项紧急任务** 需要立即处理：\n\n1. 【时代外滩】第三季度消防设备维护运维合同洽谈 — 截止 06.20\n2. 【广州项目】Q2季度报告汇总提交 — 截止今日\n\n建议优先处理Q2报告，截止时间最近。需要我帮您生成报告初稿吗？", suggestions:["立即生成Q2报告初稿","查看消防合同详情","标记任务优先级"] },
        "生成Q2季度报告":{ content:"已为您生成 Q2 季度报告大纲：\n\n📊 **一、财务板块**\n- 收入完成率 87%，较Q1增长 12%\n- 成本控制在预算范围内\n\n🔧 **二、运营板块**\n- 项目收尾率 80%（目标 85%）\n- 装修申请处理时效提升 23%\n\n🤝 **三、客服板块**\n- 客户满意度 4.2/5，较Q1提升 0.3", actionable:[{label:"✨ AI 自动填充详细数据",prompt:"请帮我填充Q2报告的详细数据"},{label:"📤 导出Word文档",prompt:"请将报告导出为Word格式"},{label:"📨 发送给管理层",prompt:"请起草邮件将报告发送给管理层"}] },
        "查询合同审批状态":{ content:"已查询到以下待审合同：\n\n• **时代外滩消防维护合同** — 等待法务审核（已提交3天，已超标准时限）\n• **供应商B年度续签合同** — 财务审核通过，等待总监签字\n• **装修监理服务合同** — 草拟中\n\n消防合同已超期，建议立即催办法务部门。是否由AI发送催办通知？", actionable:[{label:"✨ AI 发送催办通知给法务部",prompt:"请帮我发送催办通知给法务部"},{label:"📋 查看合同详细条款",prompt:"请展示时代外滩消防维护合同的详细条款"}] },
      };
      const procurementFlowReply: Partial<Message> = {
        content: "已为您检索 SRM 采招规则，根据您的情况分析如下：\n\n━━ 您的采购情况\n采购总金额：10 万元\n非战略清单内物资：2 万元（占比 20%）\n\n━━ 结论：可走协议下单流程\n非战略清单内物资占比 20% < 30%，满足协议下单条件。\n\n• 路径：SRM 系统 → 协议采购 → 发起协议下单\n• 所有物资（含非战略部分）均在此流程内一并处理\n• 需附：物资清单 + 用途说明\n\n━━ 参考标准（超出 30% 时需另行处理）\n若非战略清单内物资占比超过 30%，则需根据金额走以下流程之一：\n① 招标流程：单项采购金额 ≥ 50 万元\n② 三方比价：10 万元 ≤ 金额 < 50 万元\n③ 直接委托：金额 < 10 万元（需主管审批）\n\n━━ 注意事项\n① 协议下单须使用系统内已签框架协议的供应商\n② 非战略物资若无现有协议供应商，需先发起供应商准入\n   路径：SRM → 供应商管理 → 新增供应商申请\n③ 金额达 10 万元需提交预算确认单，路径：\n   费控系统 → 全面预算中心 → 预算确认\n\n如对流程有疑问，建议联系区域采购专员确认。",
        suggestions: ["查看协议下单操作步骤", "如何新增供应商", "三方比价流程说明"],
      };
      const expenseSubjectReply: Partial<Message> = {
        content: "已为您检索费控系统科目规范，根据活动性质建议如下：\n\n━━ 场景一：客户关怀活动（VIP业主/客户）\n科目：客户关怀费\n• 需提前 1-2 周发起「客户关怀费使用方案审批」\n• 路径：流程中心 → 流程库 → 邻里类-OA → 品质服务类 →\n  【邻里-客户关怀费使用方案审批】\n• 附件：归档版审批流程截图\n\n━━ 场景二：对外接待（政府部门/合作单位）\n科目：业务接待费\n• 附件：发票 + 消费小票 / 支付截图（缺一不可）\n• 注意：即便已发起客户关怀流程，若实际属于对外招待，仍需修正为此科目\n\n━━ 共同注意事项\n① 预算不足 → 先发起「预算调整」\n   路径：费控系统 → 全面预算中心 → 预算调整\n② 10 万元以上须提供三方比价证明\n   路径：SRM 系统发起采招流程，截图作为附件\n③ 不可挪用弱电维修费等不相关科目\n\n如不确定活动归属，建议联系区域财务确认。科目定义详见：\n邻里OA首页 → 我的应用 → 邻里新费控系统 → 首页 →\n操作指引下载专区 →《费控请款科目定义》",
        suggestions: ["查看预算调整流程", "SRM三方比价如何操作", "联系区域财务"],
      };
      const reply = isProcurementFlow ? procurementFlowReply : isExpenseSubject ? expenseSubjectReply : isAllTasks ? allTasksReply : isReorder ? reorderReply : isProjectEntry ? projectEntryReply : isContractQuery ? contractAgentReply : isPaymentQuery ? paymentAgentReply : isOrderReview ? orderReviewReply : canned[content];
      setMessages(prev=>prev.map(m=>m.typing?{
        ...m, typing:false,
        content: reply?.content ?? `收到您的问题：「${content}」\n\n正在调用企业知识库和数据进行分析...\n\n根据现有数据，建议您参考相关标准操作流程。如需AI代您执行某个具体步骤，请告知。`,
        time: now,
        suggestions: reply?.suggestions,
        actionable: reply?.actionable,
      }:m));
    }, 1300);
  };

  const handleOpenContractAgent = (task: Task) => {
    const cardId = taskCardMap[task.id] ?? null;
    setPendingContractCardId(cardId);
    setDetailTask(null);
    setMobilePanel("ai");
    setActiveSubAgent("contract");
  };

  const streamMessage = (fullText: string, actionable?: {label:string;prompt:string}[], onDone?: () => void) => {
    const msgId = "t"+Date.now();
    const now = new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"});
    setMessages(prev=>[...prev, { id:msgId, role:"agent", content:"", time:"", typing:false }]);
    let idx = 0;
    const CHUNK = 4;
    const INTERVAL = 28;
    const timer = setInterval(() => {
      idx = Math.min(idx + CHUNK, fullText.length);
      const partial = fullText.slice(0, idx);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: partial, time: idx >= fullText.length ? now : "" } : m));
      if (idx >= fullText.length) {
        clearInterval(timer);
        if (actionable) {
          setMessages(prev => prev.map(m => m.id === msgId ? { ...m, actionable } : m));
        }
        onDone?.();
      }
    }, INTERVAL);
  };

  const handleAIAssist = (task: Task) => {
    setLinkedTask(task);
    setHistoryOpen(false);
    setMobilePanel("ai");
    // Contract tasks jump straight to the contract agent — no chat confirmation needed
    if (task.type === "合同签订") {
      setActiveSubAgent("contract");
      return;
    }
    // 合同审批 tasks jump to the order-review agent
    if (task.type === "合同审批") {
      setActiveSubAgent("order-review");
      return;
    }
    setAITab("chat");
    setActiveSubAgent(null);
    const now = new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"});
    const userMsgId = "u"+Date.now();
    setMessages(prev=>[...prev,
      { id:userMsgId, role:"user", content:`请帮我分析并处理任务：「${task.title}」`, time:now },
    ]);
    if (task.type === "项目进场") {
      const fullText = `📋 已为您扫描「时代云图（佛山）二期」接管后 7 日内全部进场任务，共 10 项：\n\n✅ 已完成（7 项）\n① 组织新项目进场沟通会\n② 财务 NC、收费系统账套建立与配置\n③ 进场方案制定\n④ 项目人员配置\n⑤ 新设立分公司或子公司\n⑥ 支付中心开户\n⑦ 新开银行账号\n\n⏳ 未完成（3 项）——当前角色待处理\n━━\n① 物业管理用房接收\n   截止：2026-07-01\n   完成标准：清洁、换锁、文件柜上锁\n━━\n② 停车场经营方案制定\n   截止：2026-06-24 ⚠️ 即将超期\n   完成标准：制定定价方案并完成审批（前提：车场已竣备交付）\n━━\n③ 停车场启动收费\n   截止：2026-07-08\n   完成标准：开通二维码缴费，更换P牌\n\n建议优先处理「停车场经营方案制定」，截止日期最近。点击下方按钮可启动 AI 辅助定价方案流程。`;
      const actionable = [
        { label: "🅿️ 立即处理：停车场经营方案", prompt: "请帮我处理停车场经营方案制定" },
        { label: "🏠 物业管理用房接收流程", prompt: "物业管理用房接收需要做什么" },
        { label: "📊 查看完整进场任务清单", prompt: "查看全部进场任务" },
      ];
      setTimeout(() => streamMessage(fullText, actionable), 400);
    } else {
      setMessages(prev=>[...prev, { id:"tp"+Date.now(), role:"agent", content:"", time:"", typing:true }]);
      setTimeout(()=>{
        const reply = buildAIReply(task);
        setMessages(prev=>prev.map(m=>m.typing?{ ...m, typing:false, content:reply.content, time:now, actionable:reply.actionable }:m));
      }, 1400);
    }
  };

  const handleInspectionDone = () => {
    const now = new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"});
    setAITab("chat");
    setHistoryOpen(false);
    completeCard("mc-inspection");
    setAiUnread(true);
    const congrats: Message = {
      id: "m"+Date.now(), role:"agent", time: now,
      content: `🎉 恭喜完成本次网格化日常巡查！\n\n**📋 工单建立情况**\n• 工单问题：03栋大堂天花瓷砖有渗水情况\n• 派单：已派发至工程维修组，请及时跟进处理\n• 工单状态：已创建，待处理\n\n**📡 网格终端盘点情况**\n• 楼栋编码：LB00004141\n• 网格范围：洋房03 / 公区 / 首层 / 大堂及电梯厅\n• 材料类型：饰面材料 / 砖\n• 盘点数量：1，损耗数量：1，损耗率：6.1%（偏高，请关注）\n\n以上数据已同步至网格化管理系统，点击下方查看完整统计报表：`,
      actionable: [{ label:"📊 查看网格化汇总报表", prompt:"__OPEN_GRID_REPORT__" }],
    };
    setMessages(prev => [...prev, congrats]);
  };

  const newSession = () => {
    const now = new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"});
    setMessages([{ id:"m"+Date.now(), role:"agent", time:now, content:"新会话已开始。我是邻里AI全能助手，随时为您服务！", suggestions:["查看今日紧急任务","生成Q2季度报告","查询合同审批状态"] }]);
    setLinkedTask(null);
    setHistoryOpen(false);
  };

  const taskCardMap: Record<string, string> = {
    t1: "mc-t1", t2: "mc-t2", t3: "mc-project-entry", t4: "mc-inspection", t6: "mc-t6",
  };

  const statCards = [
    { label:"待处理", value:tasks.filter(t=>["pending","new","urgent"].includes(t.status)).length, bg:B2, text:"#fff", filterKey:"pending" as const },
    { label:"处理中", value:tasks.filter(t=>t.status==="processing").length, bg:B3, text:"#1A3E7A", filterKey:"processing" as const },
    { label:"已处理", value:tasks.filter(t=>t.status==="done").length, bg:B4, text:"#3A5FAD", filterKey:"done" as const },
  ];

  const TaskPanelContent = (
    <div className="flex flex-col h-full" style={{ backgroundColor:"#fff" }}>
      {selectedSchedule && (
        <ScheduleDetailModal
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          onJumpCalendar={() => { setDdNav("日程"); setSelectedSchedule(null); }}
        />
      )}
      {showBpmApproval && (
        <BpmApprovalModal
          onClose={() => setShowBpmApproval(false)}
          onComplete={() => { completeCard("mc-bpm-decoration"); setShowBpmApproval(false); }}
        />
      )}
      {detailTask ? (
        <TaskDetail task={detailTask} onBack={()=>setDetailTask(null)} onAI={handleAIAssist} onInspectionDone={handleInspectionDone}
          onComplete={taskCardMap[detailTask.id] ? () => completeCard(taskCardMap[detailTask!.id]) : undefined}
          onOpenContractAgent={() => handleOpenContractAgent(detailTask!)} />
      ) : (
        <>
          <div className="shrink-0 border-b" style={{ borderColor:"#E8E9EB" }}>
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2.5">
                <img src={taskAvatar} alt="任务助理" className="w-9 h-9 rounded-full object-cover shadow-sm" />
                <div>
                  <h2 className="text-sm font-semibold leading-none" style={{ color:"#1F2329" }}>任务助理</h2>
                  <p className="text-xs mt-0.5" style={{ color:DD_GRAY }}>我可以主动调度任务，分类排序，代理操作</p>
                </div>
              </div>
              <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg text-white" style={{ backgroundColor:DD_BLUE }}>
                <Plus size={11} />新建
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ backgroundColor:"#F8F9FB" }}>
            {/* AI编排 banner */}
            <div className="mx-3 mt-3 mb-2 rounded-xl px-3 py-2.5 flex items-center gap-2.5"
              style={{ backgroundColor:DD_BLUE_LIGHT, border:`1px solid ${DD_BLUE}25` }}>
              <Zap size={14} className="shrink-0" style={{ color:DD_BLUE }} />
              <p className="text-xs leading-snug" style={{ color:DD_BLUE }}>
                AI已为您编排今日 <span className="font-bold">{totalVisible}</span> 项事务，按紧急程度排序，先处理红色标注项
              </p>
            </div>
            {/* ---- 分组内容 ---- */}
            <div className="px-3 pb-4 space-y-4">

              {/* 🔴 立即处理 */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor:DD_RED }}>立即处理</span>
                  <span className="text-[10px]" style={{ color:DD_GRAY }}>{urgentVisible.length}件 · 今日截止或超期</span>
                </div>
                {/* 项目进场任务 - 动态出现 */}
                {showProjectEntryCard && !completedCards.has("mc-project-entry") && (
                <>
                <div onClick={() => { setShowEntrySubTasks(true); handleAIAssist(tasks.find(t=>t.id==="t3")!); }}
                  className="bg-white rounded-xl p-3 mb-2 shadow-sm cursor-pointer"
                  style={{ border:"1px solid #FFD6D6", borderLeft:`3px solid ${DD_RED}`,
                    animation: "slideDownFade 0.4s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor:DD_RED_LIGHT, color:DD_RED }}>任务</span>
                        <span className="text-[10px] font-medium" style={{ color:DD_RED }}>今日截止</span>
                      </div>
                      <p className="text-sm font-semibold leading-snug mb-1" style={{ color:"#1F2329" }}>项目进场7日内交付任务清单</p>
                      <p className="text-xs leading-relaxed" style={{ color:DD_GRAY }}>AI提示：进场关键节点任务，影响整体交付质量，需优先完成</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setShowEntrySubTasks(true); handleAIAssist(tasks.find(t=>t.id==="t3")!); }}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white self-center"
                      style={{ backgroundColor:DD_RED }}>去处理</button>
                  </div>
                </div>
                {showEntrySubTasks && (
                  <div className="ml-3 mb-2 space-y-1.5" style={{ borderLeft:`2px solid ${DD_RED}30`, paddingLeft:10, animation:"slideDownFade 0.3s ease both" }}>
                    {[
                      { title:"物业管理用房接收", deadline:"07-01", tag:"进行中" },
                      { title:"停车场经营方案制定", deadline:"06-24 ⚠️", tag:"即将超期", urgent:true },
                      { title:"停车场启动收费", deadline:"07-08", tag:"待处理" },
                    ].map(sub=>(
                      <div key={sub.title} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white"
                        style={{ border:`1px solid ${sub.urgent ? "#FFD6D6" : "#E8E9EB"}`, cursor:"default" }}>
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sub.urgent ? DD_RED : DD_ORANGE }} />
                        <span className="text-xs flex-1" style={{ color:"#1F2329" }}>{sub.title}</span>
                        <span className="text-[10px] shrink-0" style={{ color: sub.urgent ? DD_RED : DD_GRAY }}>{sub.deadline}</span>
                      </div>
                    ))}
                  </div>
                )}
                </>
                )}
                {/* BPM 装修审批 */}
                {!completedCards.has("mc-bpm-decoration") && (
                <div onClick={() => setShowBpmApproval(true)}
                  className="bg-white rounded-xl p-3 mb-2 shadow-sm cursor-pointer"
                  style={{ border:"1px solid #FFD6D6", borderLeft:`3px solid ${DD_RED}` }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor:DD_RED_LIGHT, color:DD_RED }}>审批</span>
                        <span className="text-[10px] font-medium" style={{ color:DD_RED }}>待您审批</span>
                      </div>
                      <p className="text-sm font-semibold leading-snug mb-1" style={{ color:"#1F2329" }}>B区24栋802装修申请审批</p>
                      <p className="text-xs leading-relaxed" style={{ color:DD_GRAY }}>管家张小华代业主李先生发起 · 普通装修申请</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setShowBpmApproval(true); }}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white self-center"
                      style={{ backgroundColor:DD_RED }}>去审批</button>
                  </div>
                </div>
                )}
                {/* 合同审批 */}
                {!completedCards.has("mc-t1") && (
                <div onClick={() => setDetailTask(tasks.find(t=>t.id==="t1")||null)}
                  className="bg-white rounded-xl p-3 mb-2 shadow-sm cursor-pointer"
                  style={{ border:"1px solid #FFD6D6", borderLeft:`3px solid ${DD_RED}` }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor:DD_RED_LIGHT, color:DD_RED }}>审批</span>
                        <span className="text-[10px] font-medium" style={{ color:DD_RED }}>今日截止</span>
                      </div>
                      <p className="text-sm font-semibold leading-snug mb-1" style={{ color:"#1F2329" }}>供应商B续签合同审批</p>
                      <p className="text-xs leading-relaxed" style={{ color:DD_GRAY }}>AI提示：涉及年度合规，超期将导致服务中断，建议立即审批</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setDetailTask(tasks.find(t=>t.id==="t1")||null); }}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white self-center"
                      style={{ backgroundColor:DD_RED }}>去处理</button>
                  </div>
                </div>
                )}
                {/* SRM 合同审批 */}
                {!completedCards.has("mc-srm-approval") && (
                <div onClick={() => handleAIAssist(tasks.find(t=>t.id==="t7")!)}
                  className="bg-white rounded-xl p-3 mb-2 shadow-sm cursor-pointer"
                  style={{ border:"1px solid #FFD6D6", borderLeft:`3px solid ${DD_RED}` }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor:DD_RED_LIGHT, color:DD_RED }}>审批</span>
                        <span className="text-[10px] font-medium" style={{ color:DD_RED }}>待您审批</span>
                      </div>
                      <p className="text-sm font-semibold leading-snug mb-1" style={{ color:"#1F2329" }}>SRM合同审批 · 置信花园城车场改造合同</p>
                      <p className="text-xs leading-relaxed" style={{ color:DD_GRAY }}>AI法务智能体识别到2处条款冲突风险，另含8项常规审批可一键处理</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleAIAssist(tasks.find(t=>t.id==="t7")!); }}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white self-center"
                      style={{ backgroundColor:DD_RED }}>去审批</button>
                  </div>
                </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor:DD_ORANGE }}>今日完成</span>
                  <span className="text-[10px]" style={{ color:DD_GRAY }}>{todayVisible.length}件 · 今日安排</span>
                </div>
                {/* 网格化巡检 */}
                {!completedCards.has("mc-inspection") && (
                <div onClick={() => setDetailTask(tasks.find(t=>t.id==="t4")||null)}
                  className="bg-white rounded-xl p-3 mb-2 shadow-sm cursor-pointer"
                  style={{ border:"1px solid #FFE7BA", borderLeft:`3px solid ${DD_ORANGE}` }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor:DD_ORANGE_LIGHT, color:DD_ORANGE }}>任务</span>
                        <span className="text-[10px]" style={{ color:DD_GRAY }}>今日完成</span>
                      </div>
                      <p className="text-sm font-semibold leading-snug mb-1" style={{ color:"#1F2329" }}>住区网格化安全巡检</p>
                      <p className="text-xs leading-relaxed" style={{ color:DD_GRAY }}>AI提示：今日下午完成并提交巡检记录，每日必执行项</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setDetailTask(tasks.find(t=>t.id==="t4")||null); }}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white self-center"
                      style={{ backgroundColor:DD_ORANGE }}>去处理</button>
                  </div>
                </div>
                )}
              </div>

              {/* ⚫ 知悉跟进 */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor:DD_GRAY }}>知悉跟进</span>
                  <span className="text-[10px]" style={{ color:DD_GRAY }}>{followVisible.length}件 · 无需立即行动</span>
                </div>
                {/* 公告：停机维护 */}
                {!completedCards.has("mc-announcement") && (
                <div className="bg-white rounded-xl p-3 mb-2 shadow-sm cursor-pointer"
                  style={{ border:"1px solid #E8E9EB", borderLeft:`3px solid ${DD_GRAY}` }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor:DD_GRAY_LIGHT, color:DD_GRAY }}>公告</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor:DD_GRAY_LIGHT, color:DD_GRAY }}>NEW</span>
                      </div>
                      <p className="text-sm font-medium leading-snug mb-1" style={{ color:"#1F2329" }}>关于业务系统停机维护通知</p>
                      <p className="text-xs" style={{ color:DD_GRAY }}>集团信息与数据中心 · 06-23</p>
                    </div>
                    <button onClick={() => completeCard("mc-announcement")}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium self-center"
                      style={{ backgroundColor:DD_GRAY_LIGHT, color:DD_GRAY }}>查看</button>
                  </div>
                </div>
                )}
                {/* 客户回访跟进 */}
                {!completedCards.has("mc-t6") && (
                <div onClick={() => setDetailTask(tasks.find(t=>t.id==="t6")||null)}
                  className="bg-white rounded-xl p-3 mb-2 shadow-sm cursor-pointer"
                  style={{ border:"1px solid #E8E9EB", borderLeft:`3px solid ${DD_GRAY}` }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor:DD_GRAY_LIGHT, color:DD_GRAY }}>任务</span>
                        <span className="text-[10px]" style={{ color:DD_GRAY }}>06-28截止</span>
                      </div>
                      <p className="text-sm font-medium leading-snug mb-1" style={{ color:"#1F2329" }}>业主满意度回访客户跟进</p>
                      <p className="text-xs" style={{ color:DD_GRAY }}>AI提示：06-28截止，本周需提前排计划</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setDetailTask(tasks.find(t=>t.id==="t6")||null); }}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium self-center"
                      style={{ backgroundColor:DD_GRAY_LIGHT, color:DD_GRAY }}>查看</button>
                  </div>
                </div>
                )}
                {/* 我发起的审批 */}
                {!completedCards.has("mc-q2-approval") && (
                <div className="bg-white rounded-xl p-3 mb-2 shadow-sm cursor-pointer"
                  style={{ border:"1px solid #E8E9EB", borderLeft:`3px solid ${DD_GRAY}` }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor:DD_GRAY_LIGHT, color:DD_GRAY }}>审批</span>
                        <span className="text-[10px]" style={{ color:DD_GRAY }}>审批中</span>
                      </div>
                      <p className="text-sm font-medium leading-snug mb-1" style={{ color:"#1F2329" }}>Q2客户满意度调研报告发布审批</p>
                      <p className="text-xs" style={{ color:DD_GRAY }}>我发起 · 06-21 · 等待审批结果</p>
                    </div>
                    <button onClick={() => completeCard("mc-q2-approval")}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium self-center"
                      style={{ backgroundColor:DD_GRAY_LIGHT, color:DD_GRAY }}>查看</button>
                  </div>
                </div>
                )}
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );

  const AIPanelContent = (
    <div className="flex flex-col h-full" style={{ backgroundColor:"#fff" }}>
      <div className="shrink-0 border-b" style={{ borderColor:"#E8E9EB" }}>
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2.5" onClick={()=>setAiUnread(false)}>
            <div className="relative shrink-0">
              <img src={aiAvatar} alt="AI" className="w-9 h-9 rounded-full object-cover shadow-sm" />
              {aiUnread && (
                <>
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white animate-ping opacity-75"
                    style={{ backgroundColor: DD_RED }} />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: DD_RED }} />
                </>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-semibold leading-none" style={{ color:"#1F2329" }}>AI 助理</h2>
                {aiUnread && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white animate-bounce"
                    style={{ backgroundColor: DD_RED }}>新消息</span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color:DD_GRAY }}>邻里AI全能助手</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setHistoryOpen(!historyOpen)}
              className="text-xs px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ color:historyOpen?DD_BLUE:DD_GRAY, backgroundColor:historyOpen?DD_BLUE_LIGHT:"#F5F6F8", border:`1px solid ${historyOpen?DD_BLUE+"40":"#E8E9EB"}` }}>
              历史会话
            </button>
            <button onClick={newSession} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg"
              style={{ color:DD_GRAY, backgroundColor:"#F5F6F8", border:"1px solid #E8E9EB" }}>
              <RefreshCw size={11} />新会话
            </button>
          </div>
        </div>
        <div className="flex px-4">
          {(["chat","docs","analytics"] as AITab[]).map((tab,i)=>{
            const labels=["对话","文档","数据"];
            const icons=[<Bot size={12}/>,<BookOpen size={12}/>,<TrendingUp size={12}/>];
            const active = aiTab===tab && !historyOpen;
            return (
              <button key={tab} onClick={()=>{setAITab(tab);setHistoryOpen(false);}}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs border-b-2 transition-colors"
                style={{ borderBottomColor:active?DD_BLUE:"transparent", color:active?DD_BLUE:DD_GRAY, fontWeight:active?500:400 }}>
                {icons[i]}{labels[i]}
              </button>
            );
          })}
        </div>
      </div>
      {historyOpen ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ backgroundColor:"#F8F9FB" }}>
          <p className="text-xs font-semibold mb-3" style={{ color:"#1F2329" }}>历史会话记录</p>
          {historyChats.map(h=>(
            <button key={h.id} onClick={()=>setHistoryOpen(false)} className="w-full text-left p-3 rounded-xl bg-white" style={{ border:"1px solid #E8E9EB" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium" style={{ color:"#1F2329" }}>{h.title}</span>
                <span className="text-xs" style={{ color:DD_GRAY }}>{h.time}</span>
              </div>
              <p className="text-xs" style={{ color:DD_GRAY }}>{h.preview}</p>
            </button>
          ))}
        </div>
      ) : activeSubAgent === "contract" ? (
        <ContractAgentPanel
          onBack={() => { setActiveSubAgent(null); setPendingContractCardId(null); }}
          onComplete={pendingContractCardId ? () => {
            completeCard(pendingContractCardId!);
            setActiveSubAgent(null);
            setPendingContractCardId(null);
          } : undefined}
        />
      ) : activeSubAgent === "order-review" ? (
        <OrderReviewAgentPanel onBack={() => setActiveSubAgent(null)} />
      ) : activeSubAgent ? (
        <AgentIframePage agentKey={activeSubAgent} onBack={()=>setActiveSubAgent(null)} />
      ) : aiTab==="chat" ? (
        <ChatPanel messages={messages} input={input} setInput={setInput}
          sendMessage={sendMessage} linkedTask={linkedTask}
          clearLinked={()=>setLinkedTask(null)} messagesEndRef={messagesEndRef}
          onSelectAgent={setActiveSubAgent} />
      ) : aiTab==="docs" ? <DocsPanel /> : <AnalyticsPanel />}
    </div>
  );

  const ddNavItems: Array<{ key: DDNav; icon: ReactNode; label: string }> = [
    { key: "消息",  icon: <MessageCircle size={20} />, label: "消息" },
    { key: "日程",  icon: <Calendar size={20} />,      label: "日程" },
    { key: "文档",  icon: <FileText size={20} />,      label: "文档" },
    { key: "AI表格", icon: <Cpu size={20} />,           label: "AI表格" },
    { key: "工作台", icon: <LayoutGrid size={20} />,    label: "工作台" },
    { key: "通讯录", icon: <Users size={20} />,         label: "通讯录" },
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ fontFamily:"'Noto Sans SC', system-ui, sans-serif" }}>

      {/* ─── DingTalk Title Bar ─────────────────────────────────────── */}
      <div className="flex items-center h-9 shrink-0 px-3 gap-3 select-none" style={{ backgroundColor:"#D5DFF7" }}>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor:DD_BLUE }}>钉</div>
          <span className="text-sm font-medium" style={{ color:"#1D2129" }}>灵活办公中</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded text-xs" style={{ backgroundColor:"rgba(255,255,255,0.5)", color:"#4E5969", minWidth:260, maxWidth:400 }}>
            <Search size={11} />
            <span>搜索或提问</span>
            <span className="ml-auto text-[10px]" style={{ color:"#8F959E" }}>Ctrl+Shift+F</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 ml-auto shrink-0">
          <button className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-black/10" style={{ color:"#4E5969" }}><Minus size={12} /></button>
          <button className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-black/10" style={{ color:"#4E5969" }}><Square size={11} /></button>
          <button className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-red-500" style={{ color:"#4E5969" }}><X size={12} /></button>
        </div>
      </div>

      {/* ─── Main Body ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* DingTalk Left Sidebar */}
        <div className="flex flex-col items-center pt-3 pb-3 gap-0.5 shrink-0" style={{ width:64, backgroundColor:"#D5DFF7" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mb-3" style={{ backgroundColor:DD_BLUE }}>项</div>
          {ddNavItems.map(item => (
            <button key={item.key} onClick={() => setDdNav(item.key)}
              className="flex flex-col items-center gap-0.5 w-full py-2 px-1 transition-colors relative"
              style={{
                color: ddNav === item.key ? '#2D2F33' : '#5E6678',
                backgroundColor: ddNav === item.key ? '#E3E9F9' : 'transparent',
              }}>
              {item.icon}
              <span className="text-[10px] leading-none mt-0.5">{item.label}</span>
              {item.key === "日程" && (
                <span className="absolute top-1 right-2.5 min-w-[14px] h-3.5 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: DD_RED, fontSize: 9, padding: "0 2px" }}>
                  {schedules.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {ddNav !== "工作台" ? (
          <div className="flex flex-1 overflow-hidden">
            {ddNav === "消息" && <DDMsgPage />}
            {ddNav === "日程" && <DDCalendarPage />}
            {ddNav === "文档" && <DDDocsPage />}
            {(ddNav === "AI表格" || ddNav === "通讯录") && (
              <div className="flex flex-col flex-1 items-center justify-center" style={{ backgroundColor:"#F5F6F8" }}>
                <div className="flex flex-col items-center gap-3" style={{ opacity:0.4 }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor:"#E8E9EB" }}>
                    {ddNav === "AI表格" && <Cpu size={24} style={{ color:DD_GRAY }} />}
                    {ddNav === "通讯录" && <Users size={24} style={{ color:DD_GRAY }} />}
                  </div>
                  <span className="text-sm" style={{ color:DD_GRAY }}>{ddNav} 功能暂未集成</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor:"#F0F2F5" }}>

            {/* 工作台 Tab Strip */}
            <div className="flex items-center h-9 border-b shrink-0 px-1" style={{ backgroundColor:"#fff", borderColor:"#E8E9EB" }}>
              <div className="flex items-center gap-1.5 px-3 h-full text-xs font-medium border-b-2 shrink-0"
                style={{ color:DD_BLUE, borderBottomColor:DD_BLUE }}>
                <LayoutGrid size={11} />工作台
              </div>
            </div>

            {/* Inner App */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Header */}
              <header className="flex items-center justify-between px-4 h-11 shrink-0 border-b"
                style={{ backgroundColor:"#fff", borderColor:"#E8E9EB", zIndex:50 }}>
                <div className="flex items-center gap-3">
                  <img src={logo} alt="时代邻里" className="h-7 object-contain" />
                  <div className="w-px h-4 hidden sm:block" style={{ backgroundColor:"#E8E9EB" }} />
                  <span className="text-xs hidden sm:inline" style={{ color:DD_GRAY }}>智慧工作台</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="items-center gap-1.5 text-xs hidden md:flex" style={{ color:DD_GRAY }}>
                    <Clock size={12} /><span>2026年06月17日 周二</span>
                  </div>
                  <div className="relative">
                    <Bell size={16} style={{ color:DD_GRAY }} className="cursor-pointer" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-white flex items-center justify-center text-[8px]" style={{ backgroundColor:DD_RED }}>3</span>
                  </div>
                  <div className="flex items-center gap-1.5 cursor-pointer">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor:DD_BLUE }}>项</div>
                    <span className="text-xs hidden sm:inline" style={{ color:"#1F2329" }}>项目经理</span>
                    <ChevronDown size={11} style={{ color:DD_GRAY }} />
                  </div>
                </div>
              </header>

              {/* ─── 紧急任务浮动推送卡 ─── */}
              <div style={{
                position: "fixed",
                top: 88,
                right: 16,
                width: 272,
                zIndex: 300,
                transform: urgentPopupVisible ? "translateX(0) scale(1)" : "translateX(calc(100% + 24px)) scale(0.96)",
                opacity: urgentPopupVisible ? 1 : 0,
                transition: urgentPopupVisible
                  ? "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease"
                  : "transform 0.35s cubic-bezier(0.55,0,1,0.45), opacity 0.25s ease",
                pointerEvents: urgentPopupVisible ? "auto" : "none",
              }}>
                <div className="rounded-2xl shadow-xl overflow-hidden" style={{ border:`2px solid ${DD_RED}` }}>
                  <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor:DD_RED }}>
                    <Zap size={13} className="shrink-0 text-white" />
                    <span className="text-xs font-bold text-white flex-1">紧急任务推送</span>
                    <span className="text-[10px] text-white" style={{ opacity:0.8 }}>刚刚</span>
                  </div>
                  <div className="bg-white px-3 pt-2.5 pb-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor:DD_RED_LIGHT, color:DD_RED }}>任务</span>
                      <span className="text-[10px] font-medium" style={{ color:DD_RED }}>今日截止</span>
                    </div>
                    <p className="text-sm font-semibold leading-snug mb-1" style={{ color:"#1F2329" }}>项目进场7日内交付任务清单</p>
                    <p className="text-xs leading-relaxed mb-2.5" style={{ color:DD_GRAY }}>AI提示：进场关键节点任务，影响整体交付质量，需优先完成</p>
                    <button onClick={() => { setUrgentPopupVisible(false); setShowEntrySubTasks(true); handleAIAssist(tasks.find(t=>t.id==="t3")!); }}
                      className="w-full py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ backgroundColor:DD_RED }}>立即查看</button>
                  </div>
                </div>
              </div>

              {/* Desktop Panels */}
              <div className="hidden md:flex flex-1 overflow-hidden p-3 gap-3">
                <div className="flex flex-col rounded-xl overflow-hidden shadow-sm shrink-0" style={{ width:"42%", minWidth:320, border:"1px solid #E8E9EB" }}>
                  {TaskPanelContent}
                </div>
                <div className="flex flex-col flex-1 overflow-hidden rounded-xl shadow-sm" style={{ border:"1px solid #E8E9EB" }}>
                  {AIPanelContent}
                </div>
              </div>

              {/* Mobile */}
              <div className="flex md:hidden flex-1 overflow-hidden">
                <div className="flex-1 overflow-hidden">
                  {mobilePanel==="tasks" ? TaskPanelContent : AIPanelContent}
                </div>
              </div>

              {/* Mobile bottom tab bar */}
              <nav className="flex md:hidden border-t shrink-0" style={{ backgroundColor:"#fff", borderColor:"#E8E9EB" }}>
                {([
                  { key:"tasks" as MobilePanel, label:"任务助理", icon:<img src={taskAvatar} alt="任务助理" className="w-6 h-6 rounded-full object-cover"/> },
                  { key:"ai" as MobilePanel, label:"AI 助理", icon:(
                    <div className="relative">
                      <img src={aiAvatar} alt="AI" className="w-6 h-6 rounded-full object-cover" />
                      {aiUnread && (
                        <>
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white animate-ping opacity-75" style={{ backgroundColor: DD_RED }} />
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: DD_RED }} />
                        </>
                      )}
                    </div>
                  )},
                ]).map(tab=>(
                  <button key={tab.key} onClick={()=>{ setMobilePanel(tab.key); if(tab.key==="ai") setAiUnread(false); }}
                    className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
                    style={{ color:mobilePanel===tab.key?DD_BLUE:DD_GRAY }}>
                    {tab.icon}
                    <span className="text-[10px] font-medium">{tab.label}</span>
                    {mobilePanel===tab.key && <div className="w-5 h-0.5 rounded-full mt-0.5" style={{ backgroundColor:DD_BLUE }} />}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
