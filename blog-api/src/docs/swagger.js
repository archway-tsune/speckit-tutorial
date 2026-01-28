const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');

function loadSwaggerDocument() {
  const specsDir = path.resolve(__dirname, '../../../specs/001-blog-api/contracts');

  // Load auth.yaml and posts.yaml
  const authSpec = YAML.load(path.join(specsDir, 'auth.yaml'));
  const postsSpec = YAML.load(path.join(specsDir, 'posts.yaml'));

  // Merge specifications
  const mergedDocument = {
    openapi: '3.0.3',
    info: {
      title: 'ブログ記事管理API',
      description: 'JWT認証を備えたRESTful ブログ記事管理API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '開発サーバー',
      },
    ],
    paths: {
      ...authSpec.paths,
      ...postsSpec.paths,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWTアクセストークン',
        },
      },
      schemas: {
        ...authSpec.components?.schemas,
        ...postsSpec.components?.schemas,
      },
    },
    tags: [
      { name: '認証', description: 'ユーザー認証関連のエンドポイント' },
      { name: '記事', description: 'ブログ記事管理エンドポイント' },
    ],
  };

  return mergedDocument;
}

function setupSwagger(app) {
  try {
    const swaggerDocument = loadSwaggerDocument();
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'ブログAPI ドキュメント',
    }));
  } catch (error) {
    console.error('Failed to load Swagger documentation:', error.message);
    // Fallback: serve a simple error page
    app.get('/api-docs', (_req, res) => {
      res.status(500).json({
        error: {
          code: 'SWAGGER_ERROR',
          message: 'APIドキュメントの読み込みに失敗しました',
        },
      });
    });
  }
}

module.exports = { setupSwagger, loadSwaggerDocument };
