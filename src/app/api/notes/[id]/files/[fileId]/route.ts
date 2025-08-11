import { NextRequest, NextResponse } from 'next/server';
import { removeFileFromNote } from '@/lib/note-storage';
import { NoteResponse } from '@/types/note';

/**
 * @swagger
 * /api/notes/{id}/files/{fileId}:
 *   delete:
 *     tags:
 *       - Files
 *     summary: Delete a file from a note
 *     description: Remove a file attachment from a specific note
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The note ID
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The file ID to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
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
  props: { params: Promise<{ id: string; fileId: string }> }
) {
  const params = await props.params;
  try {
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<NoteResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const updatedNote = removeFileFromNote(params.id, userIdHeader, params.fileId);
    
    if (!updatedNote) {
      return NextResponse.json<NoteResponse>(
        { success: false, message: 'Note or file not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<NoteResponse>({
      success: true,
      message: 'File deleted successfully',
      note: updatedNote,
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json<NoteResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}