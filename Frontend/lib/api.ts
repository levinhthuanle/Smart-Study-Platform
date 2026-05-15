const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL?.replace(/\/$/, "") ||
  API_BASE_URL.replace(/^http/, "ws");

type RequestInitJson = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown>;
  token?: string | null;
};

async function request<T>(path: string, init: RequestInitJson = {}): Promise<T> {
  const { body, token, headers, ...rest } = init;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.detail || payload?.message || "Request failed";

    throw new Error(message);
  }

  return payload as T;
}

export const authApi = {
  login(email: string, password: string) {
    return request<{ access_token: string; refresh_token: string; token_type: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: {
          email,
          password,
        },
      }
    );
  },
  register(email: string, password: string, confirm_password: string) {
    return request<{ access_token: string; refresh_token: string; token_type: string }>(
      "/api/auth/register",
      {
        method: "POST",
        body: {
          email,
          password,
          confirm_password,
        },
      }
    );
  },
};

export type WorkspaceResponse = {
  workspace_id: number;
  owner_id: number;
  name: string;
  created_at: string;
};

export type WorkspaceMemberResponse = {
  workspace_member_id: number;
  workspace_id: number;
  user_id: number;
  role: string;
  created_at: string;
};

export type TaskResponse = {
  task_id: number;
  workspace_id: number;
  title: string;
  description: string;
  status: string;
  assigned_to: number;
  due_date: string;
  updated_at: string;
  created_at: string;
};

export type MessageResponse = {
  message_id: number;
  workspace_id: number;
  sender_id: number;
  content: string;
  created_at: string;
};

export type UserResponse = {
  user_id: number;
  email: string;
  created_at: string;
};

export const backendApi = {
  getMe(token: string) {
    return request<UserResponse>("/api/users/me", { method: "GET", token });
  },
  getWorkspaces(token: string) {
    return request<WorkspaceResponse[]>("/api/workspaces/all", { method: "GET", token });
  },
  createWorkspace(token: string, name: string) {
    return request<WorkspaceResponse>("/api/workspaces", {
      method: "POST",
      token,
      body: { name },
    });
  },
  getWorkspaceMembers(token: string, workspaceId: number) {
    return request<WorkspaceMemberResponse[]>(`/api/workspaces/${workspaceId}/members`, {
      method: "GET",
      token,
    });
  },
  getWorkspaceTasks(token: string, workspaceId: number) {
    return request<TaskResponse[]>(`/api/workspaces/${workspaceId}/tasks`, {
      method: "GET",
      token,
    });
  },
  createTask(
    token: string,
    workspaceId: number,
    payload: {
      title: string;
      description: string;
      status: string;
      assigned_to: number;
      due_date: string;
    }
  ) {
    return request<TaskResponse>(`/api/workspaces/${workspaceId}/tasks`, {
      method: "POST",
      token,
      body: payload,
    });
  },
  getWorkspaceMessages(token: string, workspaceId: number) {
    return request<MessageResponse[]>(`/api/workspaces/${workspaceId}/messages`, {
      method: "GET",
      token,
    });
  },
  createMessage(token: string, workspaceId: number, content: string) {
    return request<MessageResponse>(`/api/workspaces/${workspaceId}/messages`, {
      method: "POST",
      token,
      body: { content },
    });
  },
};

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getWsBaseUrl() {
  return WS_BASE_URL;
}
