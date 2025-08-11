import { NextRequest, NextResponse } from 'next/server';
import { 
  findTasksByUserId, 
  createTask,
  findTaskLabelsByIds,
  generateDefaultDueDate,
  deleteAllDoneTasks 
} from '@/lib/task-storage';
import { CreateTaskRequest, TaskResponse, TaskStatus } from '@/types/task';

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get user tasks
 *     description: Retrieve all tasks for the authenticated user
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Todo, In Progress, Done]
 *         description: Filter tasks by status
 *       - in: query
 *         name: labelId
 *         schema:
 *           type: string
 *         description: Filter tasks by label ID
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from session (in a real app, validate JWT token)
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<TaskResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TaskStatus | null;
    const labelId = searchParams.get('labelId');

    let tasks = findTasksByUserId(userIdHeader);

    // Filter by status if specified
    if (status) {
      tasks = tasks.filter(task => task.status === status);
    }

    // Filter by label if specified
    if (labelId) {
      tasks = tasks.filter(task => 
        task.labels.some(label => label.id === labelId)
      );
    }

    return NextResponse.json<TaskResponse>({
      success: true,
      message: 'Tasks retrieved successfully',
      tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json<TaskResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task
 *     description: Create a new task for the authenticated user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *           example:
 *             title: "Complete project documentation"
 *             content: "Write comprehensive documentation for the new feature"
 *             status: "Todo"
 *             dueDate: "2024-08-15T10:00:00.000Z"
 *             labelIds: ["task_label_123", "task_label_456"]
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from session
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<TaskResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json() as CreateTaskRequest;
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json<TaskResponse>(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Get labels if specified
    const labels = body.labelIds ? findTaskLabelsByIds(body.labelIds) : [];

    // Set default values
    const status = body.status || 'Todo';
    const dueDate = body.dueDate || generateDefaultDueDate();

    const task = createTask({
      title: body.title,
      content: body.content,
      userId: userIdHeader,
      status,
      dueDate,
      labels,
      files: [],
    });

    return NextResponse.json<TaskResponse>(
      {
        success: true,
        message: 'Task created successfully',
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json<TaskResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/tasks:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete all done tasks
 *     description: Delete all tasks with status "Done" for the authenticated user
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Done]
 *         required: true
 *         description: Must be "Done" to delete all done tasks
 *     responses:
 *       200:
 *         description: Done tasks deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get user ID from session
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<TaskResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Only allow deleting all done tasks for safety
    if (status !== 'Done') {
      return NextResponse.json<TaskResponse>(
        { success: false, message: 'Can only bulk delete tasks with status "Done"' },
        { status: 400 }
      );
    }

    const deletedCount = deleteAllDoneTasks(userIdHeader);

    return NextResponse.json({
      success: true,
      message: `${deletedCount} done tasks deleted successfully`,
      deletedCount,
    });
  } catch (error) {
    console.error('Error deleting done tasks:', error);
    return NextResponse.json<TaskResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}