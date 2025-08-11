import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { 
  findNoteByIdAndUserId, 
  getUploadsDir 
} from '@/lib/note-storage';

/**
 * @swagger
 * /api/files/{fileId}/download:
 *   get:
 *     tags:
 *       - Files
 *     summary: Download a file
 *     description: Download a file attachment by its ID
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The file ID to download
 *       - in: query
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: The note ID that contains the file
 *     responses:
 *       200:
 *         description: File download successful
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/401'
 *       404:
 *         description: File or note not found
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  const params = await props.params;
  try {
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');

    if (!noteId) {
      return NextResponse.json(
        { success: false, message: 'Note ID is required' },
        { status: 400 }
      );
    }

    // Verify note exists and belongs to user
    const note = findNoteByIdAndUserId(noteId, userIdHeader);
    if (!note) {
      return NextResponse.json(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    // Find the file in the note
    const file = note.files.find(f => f.id === params.fileId);
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    // Read the file from storage
    const filePath = join(getUploadsDir(), file.path);
    
    try {
      const fileBuffer = await readFile(filePath);
      
      // Set appropriate headers for file download
      const headers = new Headers();
      headers.set('Content-Type', file.type || 'application/octet-stream');
      headers.set('Content-Disposition', `attachment; filename="${file.name}"`);
      headers.set('Content-Length', file.size.toString());

      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers,
      });
    } catch (fileError) {
      console.error('Error reading file:', fileError);
      return NextResponse.json(
        { success: false, message: 'File not found on disk' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}