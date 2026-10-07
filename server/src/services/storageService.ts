import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Readable } from "stream";
import { logger } from "../utils/logger";

export interface SaveDocumentResult {
  key: string;
  mimeType: string;
  size: number;
}

export interface DocumentStreamResult {
  stream: NodeJS.ReadableStream;
  mimeType: string;
  size?: number;
}

export interface IStorageProvider {
  savePrivateDocument(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    prefix?: string
  ): Promise<SaveDocumentResult>;
  getPrivateDocumentStream(key: string): Promise<DocumentStreamResult | null>;
  getPrivateDocumentBuffer(key: string): Promise<{ buffer: Buffer; mimeType: string } | null>;
  deletePrivateDocument(key: string): Promise<boolean>;
}

/**
 * Local private storage provider.
 * Stores sensitive verification documents in a non-public folder (default ./uploads/private).
 * Prevents direct web access and path traversal.
 */
export class LocalPrivateStorageProvider implements IStorageProvider {
  private baseDir: string;

  constructor(customDir?: string) {
    const configuredDir = customDir || process.env.STORAGE_LOCAL_DIR || "./uploads/private";
    this.baseDir = path.resolve(process.cwd(), configuredDir);

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private sanitizeFilename(key: string): string {
    return path.basename(key);
  }

  private getMimeType(filePath: string, fallback: string = "application/octet-stream"): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
    };
    return mimeMap[ext] || fallback;
  }

  public async savePrivateDocument(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    prefix: string = "doc"
  ): Promise<SaveDocumentResult> {
    const ext = path.extname(originalName).toLowerCase() || (mimeType.includes("png") ? ".png" : ".webp");
    const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, "");
    const randomHex = crypto.randomBytes(16).toString("hex");
    const filename = `${safePrefix}-${randomHex}${ext}`;
    const filePath = path.join(this.baseDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    return {
      key: filename,
      mimeType,
      size: buffer.length,
    };
  }

  public async getPrivateDocumentStream(key: string): Promise<DocumentStreamResult | null> {
    const safeKey = this.sanitizeFilename(key);
    const filePath = path.join(this.baseDir, safeKey);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stat = await fs.promises.stat(filePath);
    const stream = fs.createReadStream(filePath);
    const mimeType = this.getMimeType(filePath);

    return {
      stream,
      mimeType,
      size: stat.size,
    };
  }

  public async getPrivateDocumentBuffer(key: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const safeKey = this.sanitizeFilename(key);
    const filePath = path.join(this.baseDir, safeKey);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const buffer = await fs.promises.readFile(filePath);
    const mimeType = this.getMimeType(filePath);

    return { buffer, mimeType };
  }

  public async deletePrivateDocument(key: string): Promise<boolean> {
    try {
      const safeKey = this.sanitizeFilename(key);
      const filePath = path.join(this.baseDir, safeKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (err) {
      logger.error({ err, key }, "Failed to delete private document");
      return false;
    }
  }
}

/**
 * Cloudinary Storage Provider Stub
 * Ready for production migration when Cloudinary credentials are provided.
 */
export class CloudinaryStorageProvider implements IStorageProvider {
  async savePrivateDocument(): Promise<SaveDocumentResult> {
    throw new Error("CloudinaryStorageProvider is not configured with active API credentials.");
  }
  async getPrivateDocumentStream(): Promise<DocumentStreamResult | null> {
    throw new Error("CloudinaryStorageProvider requires Cloudinary credentials.");
  }
  async getPrivateDocumentBuffer(): Promise<{ buffer: Buffer; mimeType: string } | null> {
    throw new Error("CloudinaryStorageProvider requires Cloudinary credentials.");
  }
  async deletePrivateDocument(): Promise<boolean> {
    return false;
  }
}

/**
 * Supabase Storage Provider Stub
 * Ready for production migration when Supabase credentials are provided.
 */
export class SupabaseStorageProvider implements IStorageProvider {
  async savePrivateDocument(): Promise<SaveDocumentResult> {
    throw new Error("SupabaseStorageProvider is not configured with active API credentials.");
  }
  async getPrivateDocumentStream(): Promise<DocumentStreamResult | null> {
    throw new Error("SupabaseStorageProvider requires Supabase credentials.");
  }
  async getPrivateDocumentBuffer(): Promise<{ buffer: Buffer; mimeType: string } | null> {
    throw new Error("SupabaseStorageProvider requires Supabase credentials.");
  }
  async deletePrivateDocument(): Promise<boolean> {
    return false;
  }
}

class StorageService {
  private provider: IStorageProvider;

  constructor() {
    const providerName = (process.env.STORAGE_PROVIDER || "local").toLowerCase();
    switch (providerName) {
      case "cloudinary":
        this.provider = new CloudinaryStorageProvider();
        break;
      case "supabase":
        this.provider = new SupabaseStorageProvider();
        break;
      case "local":
      default:
        this.provider = new LocalPrivateStorageProvider();
        break;
    }
  }

  public getProvider(): IStorageProvider {
    return this.provider;
  }

  public async savePrivateDocument(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    prefix?: string
  ): Promise<SaveDocumentResult> {
    return this.provider.savePrivateDocument(buffer, originalName, mimeType, prefix);
  }

  public async getPrivateDocumentStream(key: string): Promise<DocumentStreamResult | null> {
    return this.provider.getPrivateDocumentStream(key);
  }

  public async getPrivateDocumentBuffer(key: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    return this.provider.getPrivateDocumentBuffer(key);
  }

  public async deletePrivateDocument(key: string): Promise<boolean> {
    return this.provider.deletePrivateDocument(key);
  }
}

export const storageService = new StorageService();
