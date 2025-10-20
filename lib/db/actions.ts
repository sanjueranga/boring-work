
import pool from '../db';

interface User {
  id: string
  email: string
  name?: string
  password: string
}

interface Tag {
  id: string
  name: string
  weight: number
  color: string
}

interface Project {
  id: string
  title: string
  description: string
  expectedOutcomes: string
  userId: string
  createdAt: Date
}

interface Task {
  id: string
  title: string
  description: string
  duration: number
  projectId?: string
  userId: string
  tags: string[]
  completed: boolean
  createdAt: Date
}

interface DailySummary {
  date: string
  weight: number
  userId: string
  tagWeights: { [tagId: string]: number }
}

const predefinedTags: Tag[] = [
  { id: 'tag-money', name: 'money', weight: 1, color: '#22c55e' },
  { id: 'tag-knowledge', name: 'knowledge', weight: 1, color: '#3b82f6' },
  { id: 'tag-branding', name: 'branding', weight: 1, color: '#8b5cf6' },
];

// Password hashing utility functions
function hashPassword(password: string): string {
  return Buffer.from(password).toString("base64")
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// User operations
export const userOps = {
  create: async (user: User) => {
    const res = await pool.query(
      'INSERT INTO users (id, email, name, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.id, user.email, user.name, user.password]
    );
    return res.rows[0];
  },
  get: async (id: string) => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  },
  findByEmail: async (email: string) => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  },
  register: async (email: string, name: string, password: string) => {
    const existingUser = await userOps.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const user: User = {
      id: `user_${Date.now()}`,
      email,
      name,
      password: hashPassword(password),
    }

    return userOps.create(user);
  },
  login: async (email: string, password: string) => {
    const user = await userOps.findByEmail(email);
    if (!user || !verifyPassword(password, user.password)) {
      throw new Error("Invalid email or password");
    }
    return user;
  },
  update: async (id: string, data: Partial<User>) => {
    const user = await userOps.get(id);
    if (user) {
      const updatedUser = { ...user, ...data };
      const res = await pool.query(
        'UPDATE users SET email = $1, name = $2, password = $3 WHERE id = $4 RETURNING *',
        [updatedUser.email, updatedUser.name, updatedUser.password, id]
      );
      return res.rows[0];
    }
    return user;
  },
}

// Tag operations
export const tagOps = {
  list: () => {
    return predefinedTags;
  },
  get: (id: string) => {
    return predefinedTags.find(t => t.id === id);
  },
}

// Project operations
export const projectOps = {
  create: async (project: Project) => {
    const res = await pool.query(
      'INSERT INTO projects (id, title, description, "expectedOutcomes", "userId", "createdAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [project.id, project.title, project.description, project.expectedOutcomes, project.userId, project.createdAt]
    );
    return res.rows[0];
  },
  list: async (userId: string) => {
    const res = await pool.query('SELECT * FROM projects WHERE "userId" = $1', [userId]);
    return res.rows;
  },
  get: async (id: string) => {
    const res = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    return res.rows[0];
  },
  update: async (id: string, data: Partial<Project>) => {
    const project = await projectOps.get(id);
    if (project) {
      const updatedProject = { ...project, ...data };
      const res = await pool.query(
        'UPDATE projects SET title = $1, description = $2, "expectedOutcomes" = $3 WHERE id = $4 RETURNING *',
        [updatedProject.title, updatedProject.description, updatedProject.expectedOutcomes, id]
      );
      return res.rows[0];
    }
    return project;
  },
  delete: async (id: string) => {
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
  },
}

// Task operations
export const taskOps = {
  create: async (task: Task) => {
    const res = await pool.query(
      'INSERT INTO tasks (id, title, description, duration, "projectId", "userId", tags, completed, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [task.id, task.title, task.description, task.duration, task.projectId, task.userId, task.tags, task.completed, task.createdAt]
    );
    await updateDailySummary(task.userId, task.tags);
    return res.rows[0];
  },
  list: async (userId: string) => {
    const res = await pool.query('SELECT * FROM tasks WHERE "userId" = $1', [userId]);
    return res.rows;
  },
  listByProject: async (projectId: string) => {
    const res = await pool.query('SELECT * FROM tasks WHERE "projectId" = $1', [projectId]);
    return res.rows;
  },
  get: async (id: string) => {
    const res = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return res.rows[0];
  },
  update: async (id: string, data: Partial<Task>) => {
    const task = await taskOps.get(id);
    if (task) {
      const updatedTask = { ...task, ...data };
      const res = await pool.query(
        'UPDATE tasks SET title = $1, description = $2, duration = $3, "projectId" = $4, tags = $5, completed = $6 WHERE id = $7 RETURNING *',
        [updatedTask.title, updatedTask.description, updatedTask.duration, updatedTask.projectId, updatedTask.tags, updatedTask.completed, id]
      );
      return res.rows[0];
    }
    return task;
  },
  delete: async (id: string) => {
    const task = await taskOps.get(id);
    if (task) {
      await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
      await updateDailySummary(task.userId, task.tags, -1);
    }
  },
}

// Daily summary operations
export const summaryOps = {
  list: async (userId: string) => {
    const res = await pool.query('SELECT * FROM daily_summaries WHERE "userId" = $1', [userId]);
    return res.rows;
  },
  get: async (userId: string, date: string) => {
    const res = await pool.query('SELECT * FROM daily_summaries WHERE "userId" = $1 AND date = $2', [userId, date]);
    return res.rows[0];
  },
}

async function updateDailySummary(userId: string, tagIds: string[], multiplier = 1) {
  const today = new Date().toISOString().split("T")[0];
  
  let summary = await summaryOps.get(userId, today);

  if (!summary) {
    summary = {
      date: today,
      weight: 0,
      userId,
      tagWeights: {},
    };
  }

  const tags = tagIds.map((id) => tagOps.get(id)).filter(Boolean) as Tag[];
  tags.forEach(tag => {
    const weight = tag.weight * multiplier;
    summary.weight += weight;
    summary.tagWeights[tag.id] = (summary.tagWeights[tag.id] || 0) + weight;
  });

  await pool.query(
    'INSERT INTO daily_summaries (date, weight, "userId", "tagWeights") VALUES ($1, $2, $3, $4) ON CONFLICT (date, "userId") DO UPDATE SET weight = $2, "tagWeights" = $4',
    [today, summary.weight, userId, summary.tagWeights]
  );
}
