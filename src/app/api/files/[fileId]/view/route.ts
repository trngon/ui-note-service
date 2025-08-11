import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { 
  findNoteByIdAndUserId, 
  getUploadsDir 
} from '@/lib/note-storage';

/**
 * @swagger
 * /api/files/{fileId}/view:
 *   get:
 *     tags:
 *       - Files
 *     summary: View a file
 *     description: View a file attachment directly in the browser (for images and PDFs)
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The file ID to view
 *       - in: query
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: The note ID that contains the file
 *     responses:
 *       200:
 *         description: File content for viewing
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *           application/pdf:
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

    // Check if file type is viewable
    const viewableTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf'
    ];
    
    if (!viewableTypes.some(type => file.type.startsWith(type.split('/')[0]) || file.type === type)) {
      return NextResponse.json(
        { success: false, message: 'File type not supported for viewing' },
        { status: 400 }
      );
    }

    // Read the file from storage
    const filePath = join(getUploadsDir(), file.path);
    
    try {
      const fileBuffer = await readFile(filePath);
      
      // Set appropriate headers for file viewing
      const headers = new Headers();
      headers.set('Content-Type', file.type);
      headers.set('Content-Length', file.size.toString());
      headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

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
    console.error('Error viewing file:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}