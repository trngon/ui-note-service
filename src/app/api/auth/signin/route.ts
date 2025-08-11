import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/user-storage';
import { AuthRequest, AuthResponse } from '@/types/auth';

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authenticate user
 *     description: Sign in with email and password to get user session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SigninRequest'
 *           example:
 *             email: "john.doe@example.com"
 *             password: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Login successful"
 *               user:
 *                 id: "user_4tuq9tqd2jwyqyc7h0a2b"
 *                 email: "john.doe@example.com"
 *                 name: "John Doe"
 *                 createdAt: "2025-08-11T11:22:26.209Z"
 *                 updatedAt: "2025-08-11T11:22:26.209Z"
 *       400:
 *         $ref: '#/components/responses/400'
 *       401:
 *         $ref: '#/components/responses/401'
 *       500:
 *         $ref: '#/components/responses/500'
 */

/**
 * POST /api/auth/signin
 * Handle user authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body: AuthRequest = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password (in a real app, compare hashed passwords)
    if (user.password !== password) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
