import apiClient from './apiClient';

/**
 * Get presigned URL for uploading a single file (files <= 50MB)
 * @param {File} file - The file to upload
 * @returns {Promise} - Promise with presigned URL data
 */
export const getPresignedUrl = async (file) => {
    const response = await apiClient('/s3/presigned-url', {
        method: 'POST',
        body: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        },
    });
    return response.data;
};

/**
 * Upload chunk/file to S3 using presigned URL
 * @param {string} presignedUrl - The presigned URL for upload
 * @param {Blob|File} file - The file content to upload
 * @param {string} contentType - The content type of the file
 * @param {Function} onProgress - Optional callback for upload progress
 * @returns {Promise<string>} - Promise resolving to the ETag
 */
export const uploadToS3 = async (presignedUrl, file, contentType, onProgress) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    onProgress(percentComplete);
                }
            });
        }

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                // S3 returns ETag in headers, usually surrounded by quotes
                const etag = xhr.getResponseHeader('ETag')?.replace(/"/g, '');
                resolve(etag);
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
        });

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.send(file);
    });
};

/**
 * Initiate multipart upload for large files
 * @param {File} file - The file to upload
 * @returns {Promise} - Promise with uploadId, key, parts, etc.
 */
export const initMultipartUpload = async (file) => {
    const response = await apiClient('/s3/multipart/initiate', {
        method: 'POST',
        body: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        },
    });
    return response.data;
};

/**
 * Complete multipart upload
 * @param {string} uploadId 
 * @param {string} fileKey 
 * @param {Array} parts - Array of { partNumber, etag }
 * @returns {Promise}
 */
export const completeMultipartUpload = async (uploadId, fileKey, parts) => {
    const response = await apiClient('/s3/multipart/complete', {
        method: 'POST',
        body: {
            uploadId,
            fileKey,
            parts
        },
    });
    // The backend returns { location: publicUrl }
    return response.data.location;
};

/**
 * Upload a file using multipart upload strategy if needed
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Optional callback for total upload progress
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadFile = async (file, onProgress) => {
    try {
        const MULTIPART_THRESHOLD = 50 * 1024 * 1024; // 50MB
        const MAX_FILE_SIZE = 512 * 1024 * 1024; // 512MB

        if (file.size > MAX_FILE_SIZE) {
            throw new Error('File size exceeds 512MB limit.');
        }

        // --- SINGLE PART UPLOAD ---
        if (file.size <= MULTIPART_THRESHOLD) {
            const { presignedUrl, publicUrl } = await getPresignedUrl(file);
            await uploadToS3(presignedUrl, file, file.type, onProgress);
            return publicUrl;
        }

        // --- MULTIPART UPLOAD ---
        const initData = await initMultipartUpload(file);
        const { uploadId, fileKey, parts, partSize, publicUrl } = initData;
        const uploadedParts = [];
        let totalUploaded = 0;

        // Create an array to track progress of each part
        const partProgress = new Array(parts.length).fill(0);

        // Upload parts sequentially (or parallel with limit)
        // For simplicity and reliability, let's do sequential or small batch
        // Given typically 10MB parts, a 500MB file has ~50 parts.

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const start = (part.partNumber - 1) * partSize;
            const end = Math.min(start + partSize, file.size);
            const chunk = file.slice(start, end);

            const etag = await uploadToS3(
                part.presignedUrl,
                chunk,
                file.type,
                (percent) => {
                    // Update progress for this part
                    partProgress[i] = (percent / 100) * chunk.size;

                    if (onProgress) {
                        const totalUploadedBytes = partProgress.reduce((a, b) => a + b, 0);
                        const totalPercent = (totalUploadedBytes / file.size) * 100;
                        onProgress(totalPercent);
                    }
                }
            );

            uploadedParts.push({
                partNumber: part.partNumber,
                etag: etag
            });
        }

        await completeMultipartUpload(uploadId, fileKey, uploadedParts);

        // Ensure progress is 100%
        if (onProgress) onProgress(100);

        return publicUrl;

    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
};

/**
 * wrapper for backward compatibility
 */
export const uploadImage = async (file, onProgress) => {
    return uploadFile(file, onProgress);
};

export default {
    getPresignedUrl,
    uploadToS3,
    initMultipartUpload,
    completeMultipartUpload,
    uploadFile,
    uploadImage
};
