/**
 * Swagger configuration
 */
let swaggerJsdoc, swaggerUi, YAML;
let swaggerModulesAvailable = true;

try {
  swaggerJsdoc = require('swagger-jsdoc');
  swaggerUi = require('swagger-ui-express');
  YAML = require('yamljs');
} catch (error) {
  console.error('Swagger modules error:', error.message);
  swaggerModulesAvailable = false;
}

// Thông tin cơ bản về API
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Healthcare System API Gateway',
      version: '1.0.0',
      description: 'API Gateway Documentation for Healthcare System',
      contact: {
        name: 'API Support',
        email: 'support@healthcare.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
      {
        url: 'https://localhost:4443',
        description: 'Development server (HTTPS)',
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token with Bearer prefix',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  // Đường dẫn đến các file có chứa annotations
  apis: [
    './src/routes/*.js',
    './src/app.js',
    // Thêm đường dẫn đến các file khác có chứa swagger annotations
  ],
};

// Middleware thiết lập Swagger UI
const swaggerDocs = (app) => {
  if (!swaggerModulesAvailable) {
    console.error('Swagger modules not available, skipping Swagger documentation setup');
    
    // Add dummy endpoints to prevent errors
    app.get('/api-docs', (req, res) => {
      res.send('<h1>Swagger UI not available</h1><p>The required modules (swagger-jsdoc, swagger-ui-express, yamljs) are not installed.</p>');
    });
    
    app.get('/swagger.json', (req, res) => {
      res.json({ error: 'Swagger documentation not available' });
    });
    
    app.get('/api-gateway.yaml', (req, res) => {
      res.type('text/plain').send('# Swagger documentation not available\n\nThe required modules are not installed.');
    });
    
    return;
  }

  try {
    // Create swagger spec
    const swaggerSpec = swaggerJsdoc(swaggerOptions);

    // Endpoint để phục vụ tài liệu Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
    // Endpoint để lấy file swagger.json
    app.get('/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    
    // Endpoint để lấy file swagger.yaml
    app.get('/api-gateway.yaml', (req, res) => {
      const swaggerYaml = YAML.stringify(swaggerSpec, 10);
      res.setHeader('Content-Type', 'text/yaml');
      res.send(swaggerYaml);
    });
    
    console.log(`Swagger docs available at http://localhost:4000/api-docs`);
    console.log(`Swagger JSON available at http://localhost:4000/swagger.json`);
    console.log(`Swagger YAML available at http://localhost:4000/api-gateway.yaml`);
  } catch (error) {
    console.error('Error setting up Swagger documentation:', error.message);
    
    // Add dummy endpoints in case of error
    app.get('/api-docs', (req, res) => {
      res.send('<h1>Swagger UI Error</h1><p>An error occurred while setting up Swagger: ' + error.message + '</p>');
    });
  }
};

module.exports = { swaggerDocs };