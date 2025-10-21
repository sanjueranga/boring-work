import mongoose from "mongoose";
import { Schema } from "mongoose";

// User Schema
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Project Schema
const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

// Task Schema
const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    projectId: { type: String }, // Optional reference to project
    userId: { type: String, required: true },
    tags: [{ type: String }], // Array of tag IDs
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Tag Schema (predefined tags)
export const predefinedTags = [
  { id: "tag-money", name: "money", color: "#22c55e" },
  { id: "tag-knowledge", name: "knowledge", color: "#3b82f6" },
  { id: "tag-branding", name: "branding", color: "#8b5cf6" },
];

// Initialize models
export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
export const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
