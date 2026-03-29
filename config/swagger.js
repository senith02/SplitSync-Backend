const swaggerJSDoc = require('swagger-jsdoc');

const buildServers = () => {
  const publicBaseUrl = process.env.PUBLIC_BASE_URL;
  if (publicBaseUrl) {
    return [{ url: `${publicBaseUrl}/api`, description: 'Configured public API URL' }];
  }

  const port = process.env.PORT || 5000;
  return [{ url: `http://localhost:${port}/api`, description: 'Local development' }];
};

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SplitSync Backend API',
    version: '1.0.0',
    description: 'REST API for SplitSync group expense management'
  },
  servers: buildServers(),
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          password: { type: 'string', example: '123456' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'john@example.com' },
          password: { type: 'string', example: '123456' }
        }
      },
      CreateGroupRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Trip to Kandy' },
          members: {
            type: 'array',
            items: { type: 'string' },
            example: ['665f6c8f7e4f921f1d2a1234']
          }
        }
      },
      AddMemberRequest: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', example: '665f6c8f7e4f921f1d2a1234' }
        }
      },
      CreateExpenseRequest: {
        type: 'object',
        required: ['groupId', 'description', 'amount', 'paidBy', 'participants'],
        properties: {
          groupId: { type: 'string', example: '665f6c8f7e4f921f1d2a1234' },
          description: { type: 'string', example: 'Dinner' },
          amount: { type: 'number', example: 2400 },
          paidBy: { type: 'string', example: '665f6c8f7e4f921f1d2a1234' },
          participants: {
            type: 'array',
            items: { type: 'string' },
            example: ['665f6c8f7e4f921f1d2a1234', '665f6c8f7e4f921f1d2a5678']
          },
          splitType: { type: 'string', example: 'equal' }
        }
      },
      SettleRequest: {
        type: 'object',
        required: ['groupId', 'fromUser', 'toUser', 'amount'],
        properties: {
          groupId: { type: 'string', example: '665f6c8f7e4f921f1d2a1234' },
          fromUser: { type: 'string', example: '665f6c8f7e4f921f1d2a1234' },
          toUser: { type: 'string', example: '665f6c8f7e4f921f1d2a5678' },
          amount: { type: 'number', example: 500 }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'API health check',
        tags: ['Health'],
        responses: {
          200: { description: 'API is healthy' }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Register user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } }
          }
        },
        responses: {
          201: { description: 'Registered successfully' },
          409: { description: 'Email already registered' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } }
          }
        },
        responses: {
          200: { description: 'Login success' },
          401: { description: 'Invalid credentials' }
        }
      }
    },
    '/groups': {
      post: {
        summary: 'Create group',
        tags: ['Groups'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateGroupRequest' } }
          }
        },
        responses: {
          201: { description: 'Group created' },
          401: { description: 'Unauthorized' }
        }
      },
      get: {
        summary: 'Get current user groups',
        tags: ['Groups'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Groups list' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/groups/{id}': {
      get: {
        summary: 'Get group details by ID',
        tags: ['Groups'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'Group details with balances' },
          404: { description: 'Group not found' }
        }
      }
    },
    '/groups/{id}/add-member': {
      post: {
        summary: 'Add member to group',
        tags: ['Groups'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AddMemberRequest' } }
          }
        },
        responses: {
          200: { description: 'Member added' },
          409: { description: 'Already member' }
        }
      }
    },
    '/groups/{id}/balances': {
      get: {
        summary: 'Get group simplified balances',
        tags: ['Groups'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: { description: 'Balances fetched' }
        }
      }
    },
    '/expenses': {
      post: {
        summary: 'Create expense',
        tags: ['Expenses'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateExpenseRequest' } }
          }
        },
        responses: {
          201: { description: 'Expense created' }
        }
      }
    },
    '/expenses/{groupId}': {
      get: {
        summary: 'Get group expenses',
        tags: ['Expenses'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'groupId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100 }
          }
        ],
        responses: {
          200: { description: 'Expenses fetched' }
        }
      }
    },
    '/settle': {
      post: {
        summary: 'Record settlement payment',
        tags: ['Settlement'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SettleRequest' } }
          }
        },
        responses: {
          201: { description: 'Payment settled' }
        }
      }
    }
  }
};

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: []
});

module.exports = swaggerSpec;
