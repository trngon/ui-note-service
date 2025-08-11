import { NextRequest, NextResponse } from 'next/server';
import { 
  readTaskLabels, 
  createTaskLabel
} from '@/lib/task-storage';
import { CreateTaskLabelRequest, TaskLabelResponse } from '@/types/task';

/**
 * @swagger
 * /api/tasks/labels:
 *   get:
 *     tags:
 *       - Task Labels
 *     summary: Get all task labels
 *     description: Retrieve all available task labels
 *     responses:
 *       200:
 *         description: Task labels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskLabelResponse'
 *       401:
 *         $ref: '#/components/responses/401'
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<TaskLabelResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const labels = readTaskLabels();

    return NextResponse.json<TaskLabelResponse>({
      success: true,
      message: 'Task labels retrieved successfully',
      labels,
    });
  } catch (error) {
    console.error('Error fetching task labels:', error);
    return NextResponse.json<TaskLabelResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/tasks/labels:
 *   post:
 *     tags:
 *       - Task Labels
 *     summary: Create a new task label
 *     description: Create a new task label
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskLabelRequest'
 *           example:
 *             name: "High Priority"
 *             color: "#ef4444"
 *     responses:
 *       201:
 *         description: Task label created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskLabelResponse'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       409:
 *         $ref: '#/components/responses/409'
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<TaskLabelResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json() as CreateTaskLabelRequest;
    
    // Validate required fields
    if (!body.name || !body.color) {
      return NextResponse.json<TaskLabelResponse>(
        { success: false, message: 'Name and color are required' },
        { status: 400 }
      );
    }

    const label = createTaskLabel({
      name: body.name.trim(),
      color: body.color,
    });

    return NextResponse.json<TaskLabelResponse>(
      {
        success: true,
        message: 'Task label created successfully',
        label,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task label:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json<TaskLabelResponse>(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json<TaskLabelResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}