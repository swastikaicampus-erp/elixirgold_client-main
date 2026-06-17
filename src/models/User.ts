import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  storeName?: string;
  contactNumber?: string;
  storeAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  role:string;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    name: {
      type: String,
    },
    storeName: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    storeAddress: {
      type: String,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'customer'],
      default: 'customer',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure the model uses the latest schema (avoid stale model during hot reload)
if (mongoose.models && mongoose.models.User) {
  try {
    // Remove any previously-registered model so we can re-create with the updated schema
    // This helps in development where files are hot-reloaded.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete mongoose.models.User;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete mongoose.connection.models.User;
  } catch (_) {
    // ignore
  }
}

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
