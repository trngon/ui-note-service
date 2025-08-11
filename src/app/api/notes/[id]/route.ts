import { NextRequest, NextResponse } from 'next/server';
import { 
  findNoteByIdAndUserId, 
  updateNote, 
  deleteNote,
  findLabelsByIds 
} from '@/lib/note-storage';
import { UpdateNoteRequest, NoteResponse } from '@/types/note';

/**
 * @swagger
 * /api/notes/{id}:
 *   get:
 *     tags:
 *       - Notes
 *     summary: Get a specific note
 *     description: Retrieve a note by ID for the authenticated user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The note ID
 *     responses:
 *       200:
 *         description: Note retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoteResponse'
 *       404:
 *         $ref: '#/components/responses/404'
 *       401:
 *         $ref: '#/components/responses/401'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<NoteResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const note = findNoteByIdAndUserId(params.id, userIdHeader);
    
    if (!note) {
      return NextResponse.json<NoteResponse>(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<NoteResponse>({
      success: true,
      message: 'Note retrieved successfully',
      note,
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json<NoteResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     tags:
 *       - Notes
 *     summary: Update a note
 *     description: Update a note by ID for the authenticated user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The note ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNoteRequest'
 *           example:
 *             title: "Updated Note Title"
 *             content: "Updated content"
 *             labelIds: ["label_123"]
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoteResponse'
 *       404:
 *         $ref: '#/components/responses/404'
 *       401:
 *         $ref: '#/components/responses/401'
 *       400:
 *         $ref: '#/components/responses/400'
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<NoteResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json() as UpdateNoteRequest;
    
    // Prepare update data
    const updateData: Partial<{
      title: string;
      content: string;
      labels: any[];
    }> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.labelIds !== undefined) {
      updateData.labels = findLabelsByIds(body.labelIds);
    }

    const updatedNote = updateNote(params.id, userIdHeader, updateData);
    
    if (!updatedNote) {
      return NextResponse.json<NoteResponse>(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<NoteResponse>({
      success: true,
      message: 'Note updated successfully',
      note: updatedNote,
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json<NoteResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     tags:
 *       - Notes
 *     summary: Delete a note
 *     description: Delete a note by ID for the authenticated user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The note ID
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoteResponse'
 *       404:
 *         $ref: '#/components/responses/404'
 *       401:
 *         $ref: '#/components/responses/401'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<NoteResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const deleted = deleteNote(params.id, userIdHeader);
    
    if (!deleted) {
      return NextResponse.json<NoteResponse>(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<NoteResponse>({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json<NoteResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}