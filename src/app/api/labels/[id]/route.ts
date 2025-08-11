import { NextRequest, NextResponse } from 'next/server';
import { 
  updateLabel, 
  deleteLabel 
} from '@/lib/note-storage';
import { UpdateLabelRequest, LabelResponse } from '@/types/note';

/**
 * @swagger
 * /api/labels/{id}:
 *   put:
 *     tags:
 *       - Labels
 *     summary: Update a label
 *     description: Update a label by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The label ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLabelRequest'
 *           example:
 *             name: "Very Important"
 *             color: "#ff0000"
 *     responses:
 *       200:
 *         description: Label updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabelResponse'
 *       404:
 *         $ref: '#/components/responses/404'
 *       401:
 *         $ref: '#/components/responses/401'
 *       400:
 *         $ref: '#/components/responses/400'
 *       409:
 *         description: Label with this name already exists
 */
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<LabelResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json() as UpdateLabelRequest;
    
    // Validate color format if provided
    if (body.color && !/^#[0-9A-F]{6}$/i.test(body.color)) {
      return NextResponse.json<LabelResponse>(
        { success: false, message: 'Color must be a valid hex color (e.g., #ff6b6b)' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Partial<{
      name: string;
      color: string;
    }> = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.color !== undefined) updateData.color = body.color.toLowerCase();

    const updatedLabel = updateLabel(params.id, updateData);
    
    if (!updatedLabel) {
      return NextResponse.json<LabelResponse>(
        { success: false, message: 'Label not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<LabelResponse>({
      success: true,
      message: 'Label updated successfully',
      label: updatedLabel,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Label with this name already exists') {
      return NextResponse.json<LabelResponse>(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    
    console.error('Error updating label:', error);
    return NextResponse.json<LabelResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/labels/{id}:
 *   delete:
 *     tags:
 *       - Labels
 *     summary: Delete a label
 *     description: Delete a label by ID (will remove from all notes)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The label ID
 *     responses:
 *       200:
 *         description: Label deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabelResponse'
 *       404:
 *         $ref: '#/components/responses/404'
 *       401:
 *         $ref: '#/components/responses/401'
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<LabelResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const deleted = deleteLabel(params.id);
    
    if (!deleted) {
      return NextResponse.json<LabelResponse>(
        { success: false, message: 'Label not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<LabelResponse>({
      success: true,
      message: 'Label deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting label:', error);
    return NextResponse.json<LabelResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}