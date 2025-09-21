import { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from '../server/index.js';

let app: any = null;

// Export the handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize app only once
  if (!app) {
    app = await createServer();
  }

  // Convert Vercel request/response to Express format and handle the request
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}
