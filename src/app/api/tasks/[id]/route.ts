import { NextRequest, NextResponse } from 'next/server';
import { 
  findTaskByIdAndUserId, 
  updateTask, 
  deleteTask,
  findTaskLabelsByIds
} from '@/lib/task-storage';
import { UpdateTaskRequest, TaskResponse } from '@/types/task';

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get a specific task
 *     description: Retrieve a task by ID for the authenticated user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         $ref: '#/components/responses/404'
 *       401:
 *         $ref: '#/components/responses/401'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<TaskResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const task = findTaskByIdAndUserId(id, userIdHeader);
    if (!task) {
      return NextResponse.json<TaskResponse>(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<TaskResponse>({
      success: true,
      message: 'Task retrieved successfully',
      task,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json<TaskResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Update a task
 *     description: Update an existing task for the authenticated user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *           example:
 *             title: "Updated task title"
 *             content: "Updated task content"
 *             status: "In Progress"
 *             dueDate: "2024-08-20T10:00:00.000Z"
 *             labelIds: ["task_label_123"]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         $ref: '#/components/responses/404'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<TaskResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json() as UpdateTaskRequest;

    // Get labels if specified
    const labels = body.labelIds ? findTaskLabelsByIds(body.labelIds) : undefined;

    const updates: Partial<Parameters<typeof updateTask>[2]> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.content !== undefined) updates.content = body.content;
    if (body.status !== undefined) updates.status = body.status;
    if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
    if (labels !== undefined) updates.labels = labels;

    const updatedTask = updateTask(id, userIdHeader, updates);
    if (!updatedTask) {
      return NextResponse.json<TaskResponse>(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<TaskResponse>({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json<TaskResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task
 *     description: Delete a task by ID for the authenticated user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       404:
 *         $ref: '#/components/responses/404'
 *       401:
 *         $ref: '#/components/responses/401'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<TaskResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const deleted = deleteTask(id, userIdHeader);
    if (!deleted) {
      return NextResponse.json<TaskResponse>(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<TaskResponse>({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json<TaskResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}