import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './src/app.module';
import * as fs from 'fs';

async function generateDocs() {
  console.log('🚀 API 문서 생성 중...');

  const app = await NestFactory.create(AppModule, {
    logger: ['error'],
  });

  const config = new DocumentBuilder()
    .setTitle('AI 칼로리 다이어리 API')
    .setDescription(
      '음식 사진을 분석하여 칼로리를 계산하고 일기를 작성하는 API',
    )
    .setVersion('1.0')
    .addTag('auth', '인증 관련 API')
    .addTag('diary', '일기 관련 API')
    .addTag('food', '음식 분석 관련 API')
    .addTag('user', '사용자 관련 API')
    .addBearerAuth()
    .addServer('http://localhost:3000', '개발 서버')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  if (!fs.existsSync('./docs')) {
    fs.mkdirSync('./docs');
  }

  fs.writeFileSync('./docs/openapi.json', JSON.stringify(document, null, 2));

  const html = `<!DOCTYPE html>
<html>
<head>
    <title>AI 칼로리 다이어리 API 문서</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; background: #fafafa; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            SwaggerUIBundle({
                url: './openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        };
    </script>
</body>
</html>`;

  fs.writeFileSync('./docs/index.html', html);

  const markdown = generateMarkdown(document);
  fs.writeFileSync('./docs/README.md', markdown);

  console.log('✅ API 문서가 생성되었습니다!');
  console.log('📁 위치: ./docs/');
  console.log('🌐 브라우저에서 확인: ./docs/index.html');
  console.log('📄 JSON 스펙: ./docs/openapi.json');
  console.log('📝 마크다운 문서: ./docs/README.md');

  await app.close();
}

function generateMarkdown(document: any): string {
  let md = `# ${document.info.title}\n\n`;
  md += `${document.info.description}\n\n`;
  md += `**Version:** ${document.info.version}\n\n`;

  md += `## 🔗 빠른 링크\n\n`;
  md += `- [Swagger UI](http://localhost:3000/api) - 서버 실행 후 접속\n`;
  md += `- [OpenAPI JSON](./openapi.json)\n`;
  md += `- [HTML 문서](./index.html)\n\n`;

  md += `## 🔐 인증\n\n`;
  md += `이 API는 JWT Bearer 토큰을 사용합니다.\n\n`;
  md += `\`\`\`\nAuthorization: Bearer <your-jwt-token>\n\`\`\`\n\n`;

  md += `## 📋 API 엔드포인트\n\n`;

  const tags = ['auth', 'diary', 'food', 'user'];
  tags.forEach((tag) => {
    md += `### ${tag.toUpperCase()}\n\n`;
    Object.keys(document.paths).forEach((path) => {
      Object.keys(document.paths[path]).forEach((method) => {
        const operation = document.paths[path][method];
        if (operation.tags?.includes(tag)) {
          md += `- **${method.toUpperCase()}** \`${path}\` - ${
            operation.summary || 'No summary'
          }\n`;
        }
      });
    });
    md += `\n`;
  });

  md += `## 🚀 사용법\n\n`;
  md += `### 1. 문서 생성\n`;
  md += `\`\`\`bash\npnpm run docs\n\`\`\`\n\n`;
  md += `### 2. 브라우저에서 확인\n`;
  md += `\`\`\`bash\n# HTML 문서 열기\nopen docs/index.html\n\n`;
  md += `# 또는 서버 실행 후 Swagger UI 접속\npnpm run start:dev\n`;
  md += `# http://localhost:3000/api\n\`\`\`\n\n`;

  return md;
}

generateDocs().catch(console.error);