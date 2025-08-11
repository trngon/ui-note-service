import { NextRequest, NextResponse } from 'next/server';
import { 
  readLabels, 
  createLabel 
} from '@/lib/note-storage';
import { CreateLabelRequest, LabelResponse } from '@/types/note';

/**
 * @swagger
 * /api/labels:
 *   get:
 *     tags:
 *       - Labels
 *     summary: Get all labels
 *     description: Retrieve all available labels
 *     responses:
 *       200:
 *         description: Labels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabelResponse'
 *       401:
 *         $ref: '#/components/responses/401'
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<LabelResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const labels = readLabels();

    return NextResponse.json<LabelResponse>({
      success: true,
      message: 'Labels retrieved successfully',
      labels,
    });
  } catch (error) {
    console.error('Error fetching labels:', error);
    return NextResponse.json<LabelResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/labels:
 *   post:
 *     tags:
 *       - Labels
 *     summary: Create a new label
 *     description: Create a new label
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLabelRequest'
 *           example:
 *             name: "Important"
 *             color: "#ff6b6b"
 *     responses:
 *       201:
 *         description: Label created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabelResponse'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       409:
 *         description: Label with this name already exists
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<LabelResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json() as CreateLabelRequest;
    
    // Validate required fields
    if (!body.name || !body.color) {
      return NextResponse.json<LabelResponse>(
        { success: false, message: 'Name and color are required' },
        { status: 400 }
      );
    }

    // Validate color format (hex color)
    if (!/^#[0-9A-F]{6}$/i.test(body.color)) {
      return NextResponse.json<LabelResponse>(
        { success: false, message: 'Color must be a valid hex color (e.g., #ff6b6b)' },
        { status: 400 }
      );
    }

    const label = createLabel({
      name: body.name.trim(),
      color: body.color.toLowerCase(),
    });

    return NextResponse.json<LabelResponse>(
      {
        success: true,
        message: 'Label created successfully',
        label,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Label with this name already exists') {
      return NextResponse.json<LabelResponse>(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    
    console.error('Error creating label:', error);
    return NextResponse.json<LabelResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}