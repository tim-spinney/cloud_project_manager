// API types
export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  member_ids: string[];
  created_at: string;
  last_modified_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  owner_id: string;
  member_ids?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status?: string;
  estimate?: number;
  projectId: string;
  assigneeId?: string;
  createdAt: string;
  lastModifiedAt: string;
}

// API functions
const API_BASE = '';

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/api/projects`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
}

export async function createProject(data: CreateProjectRequest): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create project');
  }
  return response.json();
}

export async function fetchProject(projectId: string): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects/${projectId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }
  return response.json();
}

export async function fetchTasksByProject(projectId: string): Promise<Task[]> {
  const response = await fetch(`${API_BASE}/api/tasks?projectId=${projectId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}
