export const workspaceHighlights = [
  {
    title: "Focus without noise",
    description:
      "A calm workspace shell inspired by knowledge-first tools, built for task clarity and fast scanning.",
  },
  {
    title: "Realtime chat ready",
    description:
      "Messages are prepared for websocket sync so every workspace can feel live from day one.",
  },
  {
    title: "Task-first collaboration",
    description:
      "Tasks, members, and discussion stay connected inside the same workspace context.",
  },
] as const;

export const workspaceStats = [
  {
    label: "Active workspaces",
    value: "04",
    detail: "+1 this week",
  },
  {
    label: "Open tasks",
    value: "18",
    detail: "6 due soon",
  },
  {
    label: "Unread messages",
    value: "12",
    detail: "Realtime feed on",
  },
] as const;

export const workspaces = [
  {
    name: "Product Design Sprint",
    role: "Owner",
    members: 8,
    accent: "from-slate-900 to-slate-700",
  },
  {
    name: "Study Group - Algorithms",
    role: "Member",
    members: 12,
    accent: "from-teal-900 to-cyan-700",
  },
  {
    name: "Research Notes",
    role: "Admin",
    members: 5,
    accent: "from-stone-900 to-zinc-700",
  },
] as const;

export const taskColumns = [
  {
    name: "Todo",
    tone: "bg-stone-100 text-stone-700",
    tasks: [
      {
        title: "Draft the weekly plan",
        owner: "Linh",
        due: "Today",
      },
      {
        title: "Review research outline",
        owner: "An",
        due: "Tomorrow",
      },
    ],
  },
  {
    name: "In Progress",
    tone: "bg-sky-100 text-sky-700",
    tasks: [
      {
        title: "Design dashboard shell",
        owner: "Mai",
        due: "Today 17:00",
      },
      {
        title: "Wire realtime messages",
        owner: "Khanh",
        due: "Thu",
      },
    ],
  },
  {
    name: "Done",
    tone: "bg-emerald-100 text-emerald-700",
    tasks: [
      {
        title: "Create workspace schema",
        owner: "System",
        due: "Completed",
      },
      {
        title: "Add auth scaffold",
        owner: "System",
        due: "Completed",
      },
    ],
  },
] as const;

export const messages = [
  {
    author: "Mai",
    time: "09:12",
    text: "I pushed the new board layout. The spacing feels calmer now.",
  },
  {
    author: "An",
    time: "09:18",
    text: "Nice. I will sync the task state with the backend later today.",
  },
  {
    author: "Linh",
    time: "09:22",
    text: "Realtime updates are the last missing piece for the workspace chat.",
  },
] as const;
