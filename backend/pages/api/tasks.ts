import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../utils/db';
import Task from '../../models/Task';

connectDB();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const tasks = await Task.find({});
                res.status(200).json({ success: true, data: tasks });
            } catch (error) {
                console.error("Error fetching tasks:", error);
                res.status(400).json({ success: false });
            }
            break;

            case 'POST':
                try {
                    const { title, priority = 'medium', dueDate, description, tags } = req.body;
                    const formattedDueDate = dueDate ? new Date(dueDate) : undefined;
    
                    // タスク作成時にtagsを含めて保存
                    const task = await Task.create({ title, priority, dueDate: formattedDueDate, description, tags });
                    res.status(201).json({ success: true, data: task });
                    console.log(task)
                } catch (error) {
                    console.log("Error in saving task:", error);
                    res.status(400).json({ success: false });
                }
                break;

        case 'PUT':
            try {
                const { id } = req.query;
                const task = await Task.findByIdAndUpdate(id, req.body, {
                    new: true,
                    runValidators: true,
                });
                if (!task) {
                    return res.status(404).json({ success: false });
                }
                res.status(200).json({ success: true, data: task });
            } catch (error) {
                console.error("Error updating task:", error);
                res.status(400).json({ success: false });
            }
            break;

        case 'DELETE':
            try {
                const { id } = req.query;
                const deletedTask = await Task.deleteOne({ _id: id });
                if (!deletedTask) {
                    return res.status(404).json({ success: false });
                }
                res.status(200).json({ success: true, data: {} });
            } catch (error) {
                console.error("Error deleting task:", error);
                res.status(400).json({ success: false });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
