import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { 
  addFileToNote, 
  getUploadsDir, 
  generateFileId,
  findNoteByIdAndUserId 
} from '@/lib/note-storage';
import { FileUploadResponse } from '@/types/note';

/**
 * @swagger
 * /api/upload:
 *   post:
 *     tags:
 *       - Files
 *     summary: Upload a file to a note
 *     description: Upload a file and attach it to a specific note
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *               noteId:
 *                 type: string
 *                 description: The ID of the note to attach the file to
 *             required:
 *               - file
 *               - noteId
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileUploadResponse'
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       404:
 *         description: Note not found
 *       413:
 *         description: File too large
 */
export async function POST(request: NextRequest) {
  try {
    const userIdHeader = request.headers.get('x-user-id');
    if (!userIdHeader) {
      return NextResponse.json<FileUploadResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const noteId = formData.get('noteId') as string;

    if (!file) {
      return NextResponse.json<FileUploadResponse>(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!noteId) {
      return NextResponse.json<FileUploadResponse>(
        { success: false, message: 'Note ID is required' },
        { status: 400 }
      );
    }

    // Verify note exists and belongs to user
    const note = findNoteByIdAndUserId(noteId, userIdHeader);
    if (!note) {
      return NextResponse.json<FileUploadResponse>(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json<FileUploadResponse>(
        { success: false, message: 'File size must be less than 10MB' },
        { status: 413 }
      );
    }

    // Generate unique filename
    const fileId = generateFileId();
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = join(getUploadsDir(), fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create file record
    const fileRecord = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      path: fileName,
      uploadedAt: new Date().toISOString(),
    };

    // Add file to note
    const updatedNote = addFileToNote(noteId, userIdHeader, fileRecord);
    
    if (!updatedNote) {
      return NextResponse.json<FileUploadResponse>(
        { success: false, message: 'Failed to attach file to note' },
        { status: 500 }
      );
    }

    return NextResponse.json<FileUploadResponse>(
      {
        success: true,
        message: 'File uploaded successfully',
        file: fileRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json<FileUploadResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}