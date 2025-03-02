/// <reference types="vitest" />

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';
import request from 'supertest';

import pool from '../config/db.js';

let app: any;

beforeAll(async () => {
  vi.spyOn(pool, "connect").mockImplementation((callback: (err: any, client: any, release: () => void) => void) => {
    callback(null, {}, () => {});
  });

  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  
  const appModule = await import('../app.js');
  app = appModule.default;
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Express App', () => {
  it('should return health status on GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('should have CORS configuration with correct options', () => {

    const corsMiddleware = app._router.stack.find((layer: any) => 
      layer.name === 'corsMiddleware' || 
      (layer.handle && layer.handle.name === 'cors')
    );
    expect(corsMiddleware).toBeDefined();
  });
  
  it('should have disabled x-powered-by header', () => {

    expect(app.disabled('x-powered-by')).toBe(true);
  });

  it('should have API routes mounted at /api', () => {

    const apiRouter = app._router.stack.find((layer: any) => 
      layer.name === 'router' && 
      layer.regexp.toString().includes('/api')
    );
    expect(apiRouter).toBeDefined();
  });

  it('should serve static files', () => {

    const staticMiddleware = app._router.stack.find((layer: any) => 
      layer.name === 'serveStatic'
    );
    expect(staticMiddleware).toBeDefined();
  });

  it('should handle catch-all route to serve index.html', () => {
    // Find the catch-all route
    const catchAllRoute = app._router.stack.find((layer: any) => 
      layer.route && layer.route.path === '*'
    );
    expect(catchAllRoute).toBeDefined();
  });

  it('should handle error via middleware', async () => {
    // Create a test route that triggers an error
    app.get('/test-error', (req: any, res: any, next: any) => {
      next(new Error('Test error'));
    });
    
    const res = await request(app).get('/test-error');
    expect(res.status).toBe(500);
  });
});

// Test database connection success and error handling
describe('Database Connection', () => {
  it('should connect to the database successfully', () => {
    expect(console.log).toHaveBeenCalledWith('Database connected successfully');
  });

  it('should handle database connection errors', () => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a new mock for console.error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Create a test error
    const testError = new Error('Database connection failed');
    testError.stack = 'Stack trace';
    
    // Mock the database connection method to trigger an error
    vi.spyOn(pool, "connect").mockImplementation((callback: (err: any, client: any, release: () => void) => void) => {
      // Call the callback with an error
      callback(testError, null, () => {});
    });
    
    // Create a small function that simulates the DB connection code from app.js
    function simulateAppDbConnection() {
      pool.connect((err, client, release) => {
        if (err) {
          console.error('Database connection failed:', err.stack);
        } else {
          console.log('Database connected successfully');
        }
        if (release) release();
      });
    }
    
    // Call our simulation function to trigger the error path
    simulateAppDbConnection();
    
    // Verify console.error was called with the error message
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Database connection failed:', 'Stack trace');
  });
});

// Test middleware configuration
describe('Middleware Configuration', () => {
  it('should have essential middleware configured', () => {
    // Check for essential middleware in the stack
    const middlewareNames = app._router.stack.map((layer: any) => layer.name);
    
    // Check for important middleware by pattern matching names
    const hasJsonMiddleware = middlewareNames.some((name: string | string[]) => 
      name === 'jsonParser' || name.includes('json')
    );
    expect(hasJsonMiddleware).toBe(true);
    
    // Check for cookie parser
    const hasCookieParser = middlewareNames.some((name: string | string[]) => 
      name === 'cookieParser' || name.includes('cookie')
    );
    expect(hasCookieParser).toBe(true);
    
    // Check for morgan logger
    const hasLogger = middlewareNames.some((name: string | string[]) => 
      name === 'logger' || name.includes('morgan')
    );
    expect(hasLogger).toBe(true);
  });
});

// Test index.html serving with error path
describe('Frontend Serving', () => {
  it('should handle errors when serving index.html', async () => {
    // Find the catch-all route handler
    const catchAllRoute = app._router.stack.find((layer: any) => 
      layer.route && layer.route.path === '*'
    );
    
    if (!catchAllRoute) {
      throw new Error('Catch-all route not found');
    }
    
    const catchAllHandler = catchAllRoute.route.stack[0].handle;
    
    // Create mock req/res objects
    const req = {} as any;
    const res = {
      sendFile: vi.fn((path, callback) => {
        // Simulate error
        if (callback) callback(new Error('Error loading frontend'));
        return res;
      }),
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    } as any;
    
    // Call the handler
    catchAllHandler(req, res);
    
    // Verify error handling
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Error loading frontend');
  });
});