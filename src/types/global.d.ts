// This file ensures that TypeScript recognizes the global mongoose cache
// Used in src/lib/mongodb.ts for connection pooling in development

import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}
