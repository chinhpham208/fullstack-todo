/**
 * Migration script: Convert existing Todos to Cards in personal Workspaces.
 *
 * For each user who has Todos:
 * 1. Create a "Personal Workspace" with the user as owner
 * 2. Create a "My Board" board
 * 3. Create default columns: To Do, In Progress, Done
 * 4. Convert each Todo to a Card in the appropriate column
 *
 * Usage: npx tsx scripts/migrate-todos-to-cards.ts
 */

import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User";
import Todo from "../models/Todo";
import Workspace from "../models/Workspace";
import Board from "../models/Board";
import Column from "../models/Column";
import Card from "../models/Card";

async function migrate() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is required!");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // Get all users who have todos
  const todoOwnerIds = await Todo.distinct("owner");
  console.log(`Found ${todoOwnerIds.length} users with todos`);

  let migratedTodos = 0;
  let createdWorkspaces = 0;

  for (const ownerId of todoOwnerIds) {
    const user = await User.findById(ownerId);
    if (!user) {
      console.log(`  Skipping unknown user ${ownerId}`);
      continue;
    }

    const todos = await Todo.find({ owner: ownerId }).sort({ createdAt: 1 });
    if (todos.length === 0) continue;

    console.log(`\nMigrating ${todos.length} todos for ${user.name} (${user.email})`);

    // Check if user already has a personal workspace (idempotent)
    let workspace = await Workspace.findOne({ owner: ownerId, name: "Personal Workspace" });
    if (!workspace) {
      workspace = await Workspace.create({
        name: "Personal Workspace",
        description: "Migrated from your todo list",
        owner: ownerId,
        members: [{ user: ownerId, role: "owner" }],
      });
      createdWorkspaces++;
      console.log(`  Created workspace: ${workspace._id}`);
    }

    // Create board
    let board = await Board.findOne({ workspace: workspace._id, name: "My Board" });
    if (!board) {
      board = await Board.create({
        name: "My Board",
        workspace: workspace._id,
        createdBy: ownerId,
      });
      console.log(`  Created board: ${board._id}`);
    }

    // Create columns
    const columnNames = ["To Do", "In Progress", "Done"];
    const existingColumns = await Column.find({ board: board._id });

    let columns: Record<string, mongoose.Document> = {};
    if (existingColumns.length === 0) {
      for (let i = 0; i < columnNames.length; i++) {
        const col = await Column.create({
          name: columnNames[i],
          board: board._id,
          position: (i + 1) * 1000,
        });
        columns[columnNames[i]] = col;
      }
      console.log(`  Created 3 columns`);
    } else {
      for (const col of existingColumns) {
        columns[col.name] = col;
      }
    }

    // Convert todos to cards
    let position = 1000;
    for (const todo of todos) {
      // Check if card already exists (idempotent by title + board)
      const existingCard = await Card.findOne({
        board: board._id,
        title: todo.task,
        createdBy: ownerId,
      });
      if (existingCard) continue;

      const targetColumn = todo.completed ? columns["Done"] : columns["To Do"];
      await Card.create({
        title: todo.task,
        description: "",
        column: targetColumn._id,
        board: board._id,
        position,
        createdBy: ownerId,
        completed: todo.completed,
      });
      position += 1000;
      migratedTodos++;
    }

    console.log(`  Migrated ${todos.length} todos to cards`);
  }

  console.log(`\nMigration complete!`);
  console.log(`  Workspaces created: ${createdWorkspaces}`);
  console.log(`  Todos migrated: ${migratedTodos}`);

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
