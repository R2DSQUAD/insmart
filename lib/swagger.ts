export const getApiDocs = async () => ({
  openapi: '3.0.0',
  info: {
    title: '외국인 노동자 관리 API',
    version: '2.0.0',
    description: 'REST API for managing foreign workers',
  },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
    '/api/admin': {
      get: {
        summary: '관리자 목록 조회 또는 특정 관리자 조회',
        description: 'ID가 없으면 전체 목록, ID가 있으면 특정 관리자 조회',
        parameters: [
          {
            in: 'query',
            name: 'id',
            schema: { type: 'integer' },
            description: '관리자 ID (선택사항)',
            required: false,
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: '페이지 번호',
            required: false,
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 20 },
            description: '페이지당 개수',
            required: false,
          },
        ],
        responses: {
          '200': {
            description: '성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: '관리자 생성',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'password'],
                properties: {
                  name: { type: 'string', example: '전체관리자' },
                  password: { type: 'string', example: '1234' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: '생성 성공' },
          '400': { description: '잘못된 요청' },
        },
      },
      put: {
        summary: '관리자 수정',
        parameters: [
          {
            in: 'query',
            name: 'id',
            schema: { type: 'integer' },
            description: '관리자 ID',
            required: true,
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: '수정 성공' },
          '404': { description: '관리자를 찾을 수 없음' },
        },
      },
      delete: {
        summary: '관리자 삭제 또는 전체 삭제',
        description: 'ID가 없고 confirm=true면 전체 삭제, ID가 있으면 특정 관리자 삭제',
        parameters: [
          {
            in: 'query',
            name: 'id',
            schema: { type: 'integer' },
            description: '관리자 ID (선택사항)',
            required: false,
          },
          {
            in: 'query',
            name: 'confirm',
            schema: { type: 'string', enum: ['true'] },
            description: '전체 삭제 확인 (전체 삭제 시 필수)',
            required: false,
          },
        ],
        responses: {
          '200': { description: '삭제 성공' },
          '400': { description: '확인 필요' },
          '404': { description: '관리자를 찾을 수 없음' },
        },
      },
    },
    '/api/worker': {
      get: {
        summary: '노동자 목록 조회 또는 특정 노동자 조회',
        parameters: [
          {
            in: 'query',
            name: 'id',
            schema: { type: 'integer' },
            description: '노동자 ID',
            required: false,
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            required: false,
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 20 },
            required: false,
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
            description: '이름 또는 여권번호로 검색',
            required: false,
          },
        ],
        responses: {
          '200': { description: '성공' },
        },
      },
      post: {
        summary: '노동자 생성',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'password', 'country_code', 'passport_id', 'birth_date', 'gender', 'manager_public_id', 'employer_id'],
                properties: {
                  name: { type: 'string' },
                  password: { type: 'string' },
                  country_code: { type: 'string' },
                  passport_id: { type: 'string' },
                  birth_date: { type: 'string', format: 'date' },
                  gender: { type: 'string', enum: ['M', 'F'] },
                  manager_public_id: { type: 'integer' },
                  employer_id: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: '생성 성공' },
        },
      },
      put: {
        summary: '노동자 수정',
        parameters: [
          {
            in: 'query',
            name: 'id',
            schema: { type: 'integer' },
            required: true,
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: {
          '200': { description: '수정 성공' },
        },
      },
      delete: {
        summary: '노동자 삭제 또는 전체 삭제',
        parameters: [
          {
            in: 'query',
            name: 'id',
            schema: { type: 'integer' },
            required: false,
          },
          {
            in: 'query',
            name: 'confirm',
            schema: { type: 'string', enum: ['true'] },
            required: false,
          },
        ],
        responses: {
          '200': { description: '삭제 성공' },
        },
      },
    },
    '/api/employer': {
      get: {
        summary: '사업자 목록 조회 또는 특정 사업자 조회',
        parameters: [
          {
            in: 'query',
            name: 'id',
            schema: { type: 'integer' },
            required: false,
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            required: false,
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 20 },
            required: false,
          },
        ],
        responses: {
          '200': { description: '성공' },
        },
      },
      post: {
        summary: '사업자 생성',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['owner_name', 'business_name', 'phone', 'password', 'manager_general_id', 'manager_public_id'],
                properties: {
                  owner_name: { type: 'string' },
                  business_name: { type: 'string' },
                  phone: { type: 'string' },
                  password: { type: 'string' },
                  manager_general_id: { type: 'integer' },
                  manager_public_id: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: '생성 성공' },
        },
      },
      put: {
        summary: '사업자 수정',
        parameters: [
          {
            in: 'query',
            name: 'id',
            schema: { type: 'integer' },
            required: true,
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: {
          '200': { description: '수정 성공' },
        },
      },
      delete: {
        summary: '사업자 삭제 또는 전체 삭제',
        parameters: [
          {
            in: 'query',
            name: 'id',
            schema: { type: 'integer' },
            required: false,
          },
          {
            in: 'query',
            name: 'confirm',
            schema: { type: 'string', enum: ['true'] },
            required: false,
          },
        ],
        responses: {
          '200': { description: '삭제 성공' },
        },
      },
    },
    '/api/manager/public': {
      get: {
        summary: '공공형 관리자 목록 조회 또는 특정 관리자 조회',
        parameters: [
          {
            in: 'query',
            name: 'id',
            schema: { type: 'integer' },
            required: false,
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            required: false,
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 20 },
            required: false,
          },
        ],
        responses: {
          '200': { description: '성공' },
        },
      },
      post: {
        summary: '공공형 관리자 생성',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['admin_id', 'password'],
                properties: {
                  admin_id: { type: 'integer' },
                  password: { type: 'string' },
                  account_status: { type: 'string', enum: ['가입자', '가입예정자', '해지자', '해지예정자'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: '생성 성공' },
        },
      },
      put: {
        summary: '공공형 관리자 수정',
        parameters: [
          {
            in: 'query',
            name: 'id',
            schema: { type: 'integer' },
            required: true,
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
        responses: {
          '200': { description: '수정 성공' },
        },
      },
      delete: {
        summary: '공공형 관리자 삭제 또는 전체 삭제',
        parameters: [
          {
            in: 'query',
            name: 'id',
            schema: { type: 'integer' },
            required: false,
          },
          {
            in: 'query',
            name: 'confirm',
            schema: { type: 'string', enum: ['true'] },
            required: false,
          },
        ],
        responses: {
          '200': { description: '삭제 성공' },
        },
      },
    },
    '/api/stats': {
      get: {
        summary: '통계 조회',
        description: '전체 관리자, 노동자, 사업자, 관리자 수 통계',
        responses: {
          '200': {
            description: '성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        adminCount: { type: 'integer' },
                        workerCount: { type: 'integer' },
                        employerCount: { type: 'integer' },
                        publicManagerCount: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/seed': {
      post: {
        summary: '더미 데이터 생성',
        description: '테스트용 더미 데이터를 생성합니다',
        responses: {
          '201': { description: '생성 성공' },
        },
      },
      delete: {
        summary: '더미 데이터 삭제',
        responses: {
          '200': { description: '삭제 성공' },
        },
      },
    },
    '/api/reset-db': {
      post: {
        summary: 'DB 초기화',
        description: '데이터베이스를 초기화합니다 (주의: 모든 데이터 삭제)',
        responses: {
          '200': { description: '초기화 성공' },
        },
      },
    },
  },
});
