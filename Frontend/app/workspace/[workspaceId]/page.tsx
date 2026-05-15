"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import KanbanBoard from "@/components/kanban-board";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = Number(params.workspaceId);

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(window.localStorage.getItem("smart-study-access-token"));
  }, []);

  return (
    <div className="section-shell py-8">
      <div className="max-w-6xl">
        <KanbanBoard workspaceId={workspaceId} token={token} />
      </div>
    </div>
  );
}