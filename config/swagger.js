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
  openapi: '3.1.1',
  info: {
    title: 'SplitSync Backend API',
    version: '1.0.0',
    description: 'REST API for SplitSync group expense management'
  },
  servers: buildServers(),
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    parameters: {
      AuthToken: {
        name: 'Authorization',
        in: 'header',
        required: true,
        description: 'JWT access token. Use format: Bearer <token>',
        schema: {
          type: 'string',
          example:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    },
    schemas: {
      ErrorItem: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          value: { type: 'string' },
          msg: { type: 'string' },
          path: { type: 'string' },
          location: { type: 'string' }
        }
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: { $ref: '#/components/schemas/ErrorItem' }
          }
        }
      },
      UnauthorizedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Unauthorized. Invalid token.' }
        }
      },
      ForbiddenResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Access denied. You are not a member of this group.' }
        }
      },
      NotFoundResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Group not found' }
        }
      },
      ConflictResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Email already registered' }
        }
      },
      UserPublic: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '665f6c8f7e4f921f1d2a1234' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' }
        }
      },
      UserRef: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '665f6c8f7e4f921f1d2a1234' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' }
        }
      },
      AuthSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/UserPublic' },
              token: { type: 'string' }
            }
          }
        }
      },
      Group: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          createdBy: { $ref: '#/components/schemas/UserRef' },
          members: {
            type: 'array',
            items: { $ref: '#/components/schemas/UserRef' }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      GroupListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          count: { type: 'integer', example: 1 },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Group' }
          }
        }
      },
      GroupSingleResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              group: { $ref: '#/components/schemas/Group' },
              balances: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    fromUser: { type: 'string' },
                    toUser: { type: 'string' },
                    amount: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      },
      GroupBalancesResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fromUser: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' }
                  }
                },
                toUser: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' }
                  }
                },
                amount: { type: 'number' }
              }
            }
          }
        }
      },
      GroupOverviewResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              summary: {
                type: 'object',
                properties: {
                  totalGroups: { type: 'integer', example: 5 },
                  totalGroupBalance: { type: 'number', example: 2450 },
                  youAreOwed: { type: 'number', example: 5600 },
                  youOwe: { type: 'number', example: 3150 },
                  totalExpenses: { type: 'number', example: 68400 }
                }
              },
              groups: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    groupId: { type: 'string' },
                    name: { type: 'string', example: 'DEV - Gym Buddies' },
                    memberCount: { type: 'integer', example: 4 },
                    totalExpenses: { type: 'number', example: 15000 },
                    totalBalance: { type: 'number', example: 7500 },
                    youAreOwed: { type: 'number', example: 7500 },
                    youOwe: { type: 'number', example: 0 }
                  }
                }
              }
            }
          }
        }
      },
      DashboardOverviewResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/UserPublic' },
              summary: {
                type: 'object',
                properties: {
                  totalBalance: { type: 'number', example: 2450 },
                  youAreOwed: { type: 'number', example: 5600 },
                  youOwe: { type: 'number', example: 3150 }
                }
              },
              monthlyInsights: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    monthKey: { type: 'string', example: '2026-04' },
                    monthLabel: { type: 'string', example: 'Apr 2026' },
                    totalPaid: { type: 'number', example: 15000 },
                    totalShare: { type: 'number', example: 3750 },
                    settlementsPaid: { type: 'number', example: 0 },
                    settlementsReceived: { type: 'number', example: 2000 },
                    involvedExpenseAmount: { type: 'number', example: 15000 },
                    expenseCount: { type: 'integer', example: 1 },
                    netBalance: { type: 'number', example: 13250 }
                  }
                }
              },
              recentActivities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    type: { type: 'string', enum: ['expense', 'settlement'] },
                    activityType: { type: 'string' },
                    direction: { type: 'string', example: 'you_paid' },
                    amount: { type: 'number' },
                    description: { type: 'string', nullable: true },
                    status: { type: 'string', nullable: true },
                    group: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' }
                      }
                    },
                    createdAt: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      },
      Expense: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          groupId: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' }
            }
          },
          description: { type: 'string' },
          amount: { type: 'number' },
          paidBy: { $ref: '#/components/schemas/UserRef' },
          participants: {
            type: 'array',
            items: { $ref: '#/components/schemas/UserRef' }
          },
          splitType: { type: 'string', example: 'equal' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateExpenseResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Expense added successfully' },
          data: { $ref: '#/components/schemas/Expense' }
        }
      },
      ExpenseListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
              total: { type: 'integer', example: 5 },
              totalPages: { type: 'integer', example: 1 }
            }
          },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Expense' }
          }
        }
      },
      SettlementResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Payment marked as settled' },
          data: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              groupId: { $ref: '#/components/schemas/UserRef' },
              fromUser: { $ref: '#/components/schemas/UserRef' },
              toUser: { $ref: '#/components/schemas/UserRef' },
              amount: { type: 'number' },
              status: { type: 'string', example: 'settled' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      },
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
      GroupUserSearchResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          count: { type: 'integer', example: 2 },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '665f6c8f7e4f921f1d2a1234' },
                name: { type: 'string', example: 'Dev Tester' },
                email: { type: 'string', example: 'dev.user@splitsync.local' }
              }
            }
          }
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
    },
    responses: {
      BadRequest: {
        description: 'Invalid input/validation failure',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized access/token issue',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UnauthorizedResponse' }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden for current user',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ForbiddenResponse' }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/NotFoundResponse' }
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'API health check',
        tags: ['Health'],
        security: [],
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'SplitSync API is running' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Register user',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } }
          }
        },
        responses: {
          201: {
            description: 'Registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSuccessResponse' }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Auth'],
        description: 'Use this endpoint first, then click Authorize and paste token as: Bearer <token>',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } }
          }
        },
        responses: {
          200: {
            description: 'Login success',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthSuccessResponse' }
              }
            }
          }
        }
      }
    },
    '/groups': {
      post: {
        summary: 'Create group',
        tags: ['Groups'],
        parameters: [{ $ref: '#/components/parameters/AuthToken' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateGroupRequest' } }
          }
        },
        responses: {
          201: {
            description: 'Group created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Group created successfully' },
                    data: { $ref: '#/components/schemas/Group' }
                  }
                }
              }
            }
          }
        }
      },
      get: {
        summary: 'Get current user groups',
        tags: ['Groups'],
        parameters: [{ $ref: '#/components/parameters/AuthToken' }],
        responses: {
          200: {
            description: 'Groups list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GroupListResponse' }
              }
            }
          }
        }
      }
    },
    '/groups/overview': {
      get: {
        summary: 'Get current user groups overview with totals',
        tags: ['Groups'],
        parameters: [{ $ref: '#/components/parameters/AuthToken' }],
        responses: {
          200: {
            description: 'Groups overview fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GroupOverviewResponse' }
              }
            }
          }
        }
      }
    },
    '/groups/{id}': {
      get: {
        summary: 'Get group details by ID',
        tags: ['Groups'],
        parameters: [
          { $ref: '#/components/parameters/AuthToken' },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Group details with balances',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GroupSingleResponse' }
              }
            }
          }
        }
      }
    },
    '/groups/{id}/add-member': {
      post: {
        summary: 'Add member to group',
        tags: ['Groups'],
        parameters: [
          { $ref: '#/components/parameters/AuthToken' },
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
          200: {
            description: 'Member added',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Member added successfully' },
                    data: { $ref: '#/components/schemas/Group' }
                  }
                }
              }
            }
          },
          409: {
            description: 'User already exists in this group',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'This user is already in the group' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/groups/search-users': {
      get: {
        summary: 'Search registered users by name',
        tags: ['Groups'],
        parameters: [
          { $ref: '#/components/parameters/AuthToken' },
          {
            name: 'q',
            in: 'query',
            required: true,
            description: 'Case-insensitive name search text',
            schema: { type: 'string', minLength: 1, maxLength: 50 }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Maximum number of users to return (default 10, max 20)',
            schema: { type: 'integer', minimum: 1, maximum: 20 }
          }
        ],
        responses: {
          200: {
            description: 'Matching users fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GroupUserSearchResponse' }
              }
            }
          }
        }
      }
    },
    '/groups/{id}/balances': {
      get: {
        summary: 'Get group simplified balances',
        tags: ['Groups'],
        parameters: [
          { $ref: '#/components/parameters/AuthToken' },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Balances fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GroupBalancesResponse' }
              }
            }
          }
        }
      }
    },
    '/expenses': {
      post: {
        summary: 'Create expense',
        tags: ['Expenses'],
        parameters: [{ $ref: '#/components/parameters/AuthToken' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateExpenseRequest' } }
          }
        },
        responses: {
          201: {
            description: 'Expense created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateExpenseResponse' }
              }
            }
          }
        }
      }
    },
    '/expenses/{groupId}': {
      get: {
        summary: 'Get group expenses',
        tags: ['Expenses'],
        parameters: [
          { $ref: '#/components/parameters/AuthToken' },
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
          200: {
            description: 'Expenses fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ExpenseListResponse' }
              }
            }
          }
        }
      }
    },
    '/dashboard': {
      get: {
        summary: 'Get user dashboard overview',
        tags: ['Dashboard'],
        parameters: [
          { $ref: '#/components/parameters/AuthToken' },
          {
            name: 'months',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 12 }
          },
          {
            name: 'activityLimit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 50 }
          }
        ],
        responses: {
          200: {
            description: 'Dashboard data fetched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DashboardOverviewResponse' }
              }
            }
          }
        }
      }
    },
    '/settle': {
      post: {
        summary: 'Record settlement payment',
        tags: ['Settlement'],
        parameters: [{ $ref: '#/components/parameters/AuthToken' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SettleRequest' } }
          }
        },
        responses: {
          201: {
            description: 'Payment settled',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SettlementResponse' }
              }
            }
          }
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
