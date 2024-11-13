// backend/models/Task.ts
import { Schema, model, models } from 'mongoose';

const TaskSchema = new Schema({
    title: {
        type: String,
        required: [true, 'タスクのタイトルを入力してください'],
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'done'],
        default: 'todo',
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
    },
    dueDate: {
        type: Date, // dueDateをDate型で追加
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// models.Taskが存在するか確認し、キャッシュをクリアして再作成
const Task = models.Task || model('Task', TaskSchema);
export default Task;
