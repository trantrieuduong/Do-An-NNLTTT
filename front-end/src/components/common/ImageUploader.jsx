import React, { useState, useRef } from 'react';
import { uploadImage } from '../../api/fileService';
import '../../styles/ImageUploader.css';

const ImageUploader = ({
    currentImage,
    onImageUpload,
    type = 'avatar', // 'avatar', 'cover', 'group'
    disabled = false
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState(currentImage);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setError(null);
            setUploading(true);
            setProgress(0);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Upload to S3
            const publicUrl = await uploadImage(file, (percent) => {
                setProgress(Math.round(percent));
            });

            // Callback with the public URL
            onImageUpload(publicUrl);
            setPreview(publicUrl);
            setUploading(false);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Upload failed');
            setPreview(currentImage);
            setUploading(false);
            setProgress(0);
        }
    };

    const handleClick = () => {
        if (!disabled && !uploading) {
            fileInputRef.current?.click();
        }
    };

    const getContainerClass = () => {
        let baseClass = 'image-uploader';
        if (type === 'cover') baseClass += ' image-uploader-cover';
        if (type === 'avatar') baseClass += ' image-uploader-avatar';
        if (type === 'group') baseClass += ' image-uploader-group';
        if (disabled) baseClass += ' image-uploader-disabled';
        return baseClass;
    };

    const getPlaceholderIcon = () => {
        if (type === 'cover') {
            return (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
                    <polyline points="21 15 16 10 5 21" strokeWidth="2" />
                </svg>
            );
        }
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                <circle cx="12" cy="7" r="4" strokeWidth="2" />
            </svg>
        );
    };

    return (
        <div className={getContainerClass()} onClick={handleClick}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={disabled || uploading}
            />

            {preview ? (
                <img src={preview} alt={type} className="image-uploader-preview" />
            ) : (
                <div className="image-uploader-placeholder">
                    {getPlaceholderIcon()}
                    <p>{type === 'cover' ? 'Add cover image' : 'Add image'}</p>
                </div>
            )}

            {!disabled && !uploading && (
                <div className="image-uploader-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>
                    <p>Change {type === 'cover' ? 'Cover' : 'Image'}</p>
                </div>
            )}

            {uploading && (
                <div className="image-uploader-uploading">
                    <div className="upload-spinner"></div>
                    <p>{progress}%</p>
                </div>
            )}

            {error && (
                <div className="image-uploader-error">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
