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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// models.Taskが存在するか確認し、キャッシュをクリアして再作成
export default models.Task || model('Task', TaskSchema);
