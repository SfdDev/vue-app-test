export interface FileStorage {
  saveImage(buffer: Buffer, originalFilename: string): Promise<string>;
  deleteByUrl(url: string | null | undefined): Promise<void>;
}
