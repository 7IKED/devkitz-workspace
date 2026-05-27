/**
 * ⚡ DKZ API — Tool Routes  
 * ══════════════════════════
 * Workflows, Tasks
 */

import { Router } from 'express';

const router = Router();

// In-memory workflow and task store
const workflows = [];
const tasks = [];
let nextWorkflowId = 1;
let nextTaskId = 1;

// ─── GET /workflows ───
router.get('/workflows', (req, res) => {
    const { status = 'all' } = req.query;
    let filtered = [...workflows];
    if (status !== 'all') filtered = filtered.filter(w => w.status === status);
    res.json({ workflows: filtered, count: filtered.length });
});

// ─── POST /workflows/start ───
router.post('/workflows/start', (req, res) => {
    const { template, params = {}, priority = 'normal' } = req.body;
    if (!template) return res.status(400).json({ error: 'template erforderlich' });

    const workflow = {
        id: `wf_${nextWorkflowId++}`,
        name: template,
        template,
        params,
        priority,
        status: 'running',
        currentStep: 1,
        totalSteps: Math.floor(Math.random() * 5) + 3,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };

    workflows.push(workflow);

    // Simulate completion after some time
    setTimeout(() => {
        workflow.status = 'completed';
        workflow.currentStep = workflow.totalSteps;
        workflow.updated = new Date().toISOString();
        if (globalThis.__dkzBroadcast) {
            globalThis.__dkzBroadcast('workflow:completed', { id: workflow.id, name: workflow.name });
        }
    }, 10000 + Math.random() * 20000);

    res.json({ success: true, workflowId: workflow.id, workflow });
});

// ─── GET /tasks ───
router.get('/tasks', (req, res) => {
    const { column, priority } = req.query;
    let filtered = [...tasks];
    if (column) filtered = filtered.filter(t => t.column === column);
    if (priority) filtered = filtered.filter(t => t.priority === priority);
    res.json({ tasks: filtered, count: filtered.length });
});

// ─── POST /tasks ───
router.post('/tasks', (req, res) => {
    const { title, description, column = 'backlog', priority = 'normal', tags = [], assignee } = req.body;
    if (!title) return res.status(400).json({ error: 'title erforderlich' });

    const task = {
        id: `task_${nextTaskId++}`,
        title,
        description: description || '',
        column,
        priority,
        tags,
        assignee: assignee || null,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };

    tasks.push(task);

    if (globalThis.__dkzBroadcast) {
        globalThis.__dkzBroadcast('task:created', { id: task.id, title: task.title });
    }

    res.json({ success: true, taskId: task.id, task });
});

// ─── PATCH /tasks/:id ───
router.patch('/tasks/:id', (req, res) => {
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: `Task "${req.params.id}" nicht gefunden` });

    const { column, priority, title, description, assignee, tags } = req.body;
    if (column) task.column = column;
    if (priority) task.priority = priority;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignee !== undefined) task.assignee = assignee;
    if (tags) task.tags = tags;
    task.updated = new Date().toISOString();

    res.json({ success: true, task });
});

// ─── DELETE /tasks/:id ───
router.delete('/tasks/:id', (req, res) => {
    const idx = tasks.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: `Task "${req.params.id}" nicht gefunden` });
    tasks.splice(idx, 1);
    res.json({ success: true });
});

export { router as toolRoutes };
