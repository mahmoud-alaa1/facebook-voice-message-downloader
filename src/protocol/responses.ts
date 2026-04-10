/**
 * Protocol response payloads for messaging requests.
 */

export interface DownloadResponse {
  success: boolean;
  isBlob?: boolean;
  url?: string;
  blobType?: string;
  downloadId?: number;
  error?: string;
}

export interface GenericResponse {
  success: boolean;
  error?: string;
}

export interface AudioAnalysisResponse {
  success: boolean;
}
