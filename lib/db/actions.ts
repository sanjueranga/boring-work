import { User, Project, Task, predefinedTags } from "./models";
import { hash, compare } from "bcryptjs";
import connectToDatabase from "../db";

// User operations
export const userOps = {
  create: async (data: { email: string; name: string; password: string }) => {
    await connectToDatabase();
    const hashedPassword = await hash(data.password, 10);
    const user = await User.create({
      ...data,
      password: hashedPassword,
    });
    return user;
  },

  get: async (id: string) => {
    await connectToDatabase();
    return User.findById(id);
  },

  findByEmail: async (email: string) => {
    await connectToDatabase();
    return User.findOne({ email });
  },

  register: async (email: string, name: string, password: string) => {
    const existingUser = await userOps.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }
    return userOps.create({ email, name, password });
  },

  login: async (email: string, password: string) => {
    const user = await userOps.findByEmail(email);
    if (!user || !(await compare(password, user.password))) {
      throw new Error("Invalid email or password");
    }
    return user;
  },

  update: async (
    id: string,
    data: { email?: string; name?: string; password?: string }
  ) => {
    await connectToDatabase();
    if (data.password) {
      data.password = await hash(data.password, 10);
    }
    return User.findByIdAndUpdate(id, data, { new: true });
  },
};

// Tag operations (predefined tags)
export const tagOps = {
  list: () => {
    return predefinedTags;
  },
  get: (id: string) => {
    return predefinedTags.find((t) => t.id === id);
  },
};

// Project operations
export const projectOps = {
  create: async (data: {
    title: string;
    description: string;
    userId: string;
  }) => {
    await connectToDatabase();
    return Project.create(data);
  },

  list: async (userId: string) => {
    await connectToDatabase();
    return Project.find({ userId });
  },

  get: async (id: string) => {
    await connectToDatabase();
    return Project.findById(id);
  },

  update: async (
    id: string,
    data: { title?: string; description?: string }
  ) => {
    await connectToDatabase();
    return Project.findByIdAndUpdate(id, data, { new: true });
  },

  delete: async (id: string) => {
    await connectToDatabase();
    await Project.findByIdAndDelete(id);
  },
};

// Task operations
export const taskOps = {
  create: async (data: {
    title: string;
    description: string;
    projectId?: string;
    userId: string;
    tags: string[];
  }) => {
    await connectToDatabase();
    return Task.create({ ...data, completed: false });
  },

  list: async (userId: string) => {
    await connectToDatabase();
    return Task.find({ userId });
  },

  listByProject: async (projectId: string) => {
    await connectToDatabase();
    return Task.find({ projectId });
  },

  get: async (id: string) => {
    await connectToDatabase();
    return Task.findById(id);
  },

  update: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      projectId?: string;
      tags?: string[];
      completed?: boolean;
    }
  ) => {
    await connectToDatabase();
    return Task.findByIdAndUpdate(id, data, { new: true });
  },

  delete: async (id: string) => {
    await connectToDatabase();
    await Task.findByIdAndDelete(id);
  },
};
