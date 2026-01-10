export interface Task {
  id: string;
  title: string;
  description: string;
  status?: string;
  estimate?: number;
  projectId: string;
  assigneeId?: string;
  createdAt: Date;
  lastModifiedAt: Date;
}

export interface TaskLink {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  descriptor: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  text: string;
  createdAt: Date;
}

