import { NextRequest, NextResponse } from 'next/server';
import { 
  findNotesByUserId, 
  createNote,
  findLabelsByIds 
} from '@/lib/note-storage';
import { CreateNoteRequest, NoteResponse } from '@/types/note';

/**
 * @swagger
 * /api/notes:
 *   get:
 *     tags:
 *       - Notes
 *     summary: Get user notes
 *     description: Retrieve all notes for the authenticated user
 *     parameters:
 *       - in: query
 *         name: labelId
 *         schema:
 *           type: string
 *         description: Filter notes by label ID
 *     responses:
 *       200:
 *         description: Notes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoteResponse'
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
      return NextResponse.json<NoteResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const labelId = searchParams.get('labelId');

    let notes = findNotesByUserId(userIdHeader);

    // Filter by label if specified
    if (labelId) {
      notes = notes.filter(note => 
        note.labels.some(label => label.id === labelId)
      );
    }

    return NextResponse.json<NoteResponse>({
      success: true,
      message: 'Notes retrieved successfully',
      notes,
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json<NoteResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/notes:
 *   post:
 *     tags:
 *       - Notes
 *     summary: Create a new note
 *     description: Create a new note for the authenticated user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNoteRequest'
 *           example:
 *             title: "My First Note"
 *             content: "This is the content of my note"
 *             labelIds: ["label_123", "label_456"]
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoteResponse'
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
      return NextResponse.json<NoteResponse>(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json() as CreateNoteRequest;
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json<NoteResponse>(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Get labels if specified
    const labels = body.labelIds ? findLabelsByIds(body.labelIds) : [];

    const note = createNote({
      title: body.title,
      content: body.content,
      userId: userIdHeader,
      labels,
      files: [],
    });

    return NextResponse.json<NoteResponse>(
      {
        success: true,
        message: 'Note created successfully',
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json<NoteResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}