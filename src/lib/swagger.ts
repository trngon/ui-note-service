import swaggerJSDoc from 'swagger-jsdoc';

/**
 * Swagger configuration for UI Note Service API
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'UI Note Service API',
    version: '1.0.0',
    description: 'A comprehensive API for managing user authentication and notes in the UI Note Service application',
    contact: {
      name: 'UI Note Service Team',
      email: 'support@uinoteservice.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
    {
      url: 'https://note.ngon.info',
      description: 'Production server',
    },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        required: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            description: 'Unique user identifier',
            example: 'user_4tuq9tqd2jwyqyc7h0a2b',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'john.doe@example.com',
          },
          name: {
            type: 'string',
            description: 'User full name',
            example: 'John Doe',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'User creation timestamp',
            example: '2025-08-11T11:22:26.209Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'User last update timestamp',
            example: '2025-08-11T11:22:26.209Z',
          },
        },
      },
      SignupRequest: {
        type: 'object',
        required: ['email', 'password', 'name', 'confirmPassword'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'User password (minimum 6 characters)',
            example: 'securePassword123',
          },
          name: {
            type: 'string',
            minLength: 2,
            description: 'User full name',
            example: 'John Doe',
          },
          confirmPassword: {
            type: 'string',
            description: 'Password confirmation (must match password)',
            example: 'securePassword123',
          },
        },
      },
      SigninRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            description: 'User password',
            example: 'securePassword123',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the operation was successful',
            example: true,
          },
          message: {
            type: 'string',
            description: 'Response message',
            example: 'User created successfully',
          },
          user: {
            $ref: '#/components/schemas/User',
            description: 'User data (returned on success, excludes password)',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: {
            type: 'boolean',
            description: 'Always false for error responses',
            example: false,
          },
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Invalid email or password',
          },
        },
      },
    },
    responses: {
      400: {
        description: 'Bad Request - Invalid input data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              message: 'All fields are required',
            },
          },
        },
      },
      401: {
        description: 'Unauthorized - Invalid credentials',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              message: 'Invalid email or password',
            },
          },
        },
      },
      409: {
        description: 'Conflict - Resource already exists',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              message: 'User with this email already exists',
            },
          },
        },
      },
      500: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
            example: {
              success: false,
              message: 'Internal server error',
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/app/api/**/*.ts'], // Path to the API files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
