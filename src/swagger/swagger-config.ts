import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Expenses Tracker')
  .setDescription(
    `
      The main idea of this service is provide users to track their\`s expenses. 
      There is a classifier that can try to categorize expense via LLM model and zero-shot-classification approach`,
  )
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    },
    'accessToken',
  )
  .build();
