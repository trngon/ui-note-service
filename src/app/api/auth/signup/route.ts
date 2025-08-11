import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/user-storage';
import { SignupRequest, AuthResponse } from '@/types/auth';

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account with email, password, and name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *           example:
 *             name: "John Doe"
 *             email: "john.doe@example.com"
 *             password: "securePassword123"
 *             confirmPassword: "securePassword123"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "User created successfully"
 *               user:
 *                 id: "user_4tuq9tqd2jwyqyc7h0a2b"
 *                 email: "john.doe@example.com"
 *                 name: "John Doe"
 *                 createdAt: "2025-08-11T11:22:26.209Z"
 *                 updatedAt: "2025-08-11T11:22:26.209Z"
 *       400:
 *         $ref: '#/components/responses/400'
 *       409:
 *         $ref: '#/components/responses/409'
 *       500:
 *         $ref: '#/components/responses/500'
 */

/**
 * POST /api/auth/signup
 * Handle user registration
 */
export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    const { email, password, name, confirmPassword } = body;

    // Validation
    if (!email || !password || !name || !confirmPassword) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = createUser({
      email: email.toLowerCase(),
      password, // In a real app, hash this password
      name,
    });

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: newUserPassword, ...userWithoutPassword } = newUser;

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message: 'User created successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
