import React, { useState, useRef } from 'react';
import { Camera, Image, Video, Send, Loader2, X } from 'lucide-react';
import { uploadFile } from '../api/fileService';
import { feedService } from '../api/feedService';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../utils/constants';
import '../styles/CreatePost.css';

const CreatePost = ({ onPostCreated, currentUser }) => {
    const [content, setContent] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file =>
            file.type.startsWith('image/') || file.type.startsWith('video/')
        );

        if (validFiles.length) {
            const newMedia = validFiles.map(file => ({
                file,
                url: URL.createObjectURL(file), // Local preview
                type: file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO'
            }));
            setMediaFiles(prev => [...prev, ...newMedia]);
        } else {
            toast.error("Please select valid image or video files.");
        }
    };

    const handleRemoveMedia = (index) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && mediaFiles.length === 0) return;

        setIsSubmitting(true);
        try {
            const uploadedMedia = [];

            // Upload files sequentially to ensure order
            for (const item of mediaFiles) {
                const publicUrl = await uploadFile(item.file);
                uploadedMedia.push({
                    type: item.type,
                    mediaUrl: publicUrl
                });
            }

            const res = await feedService.createPost(content, uploadedMedia);
            if (res.success) {
                toast.success("Post created successfully!");
                setContent('');
                setMediaFiles([]);
                if (onPostCreated) onPostCreated(res.data);
            }
        } catch (error) {
            console.error("Failed to create post:", error);
            toast.error("Failed to create post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-post-container">
            <h3>Create Post</h3>
            <div className="create-post-form">
                <div className="create-post-input-area">
                    <textarea
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isSubmitting}
                        rows={1}
                        style={{ height: 'auto', minHeight: '40px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />
                </div>

                {mediaFiles.length > 0 && (
                    <div className="media-preview-grid">
                        {mediaFiles.map((item, index) => (
                            <div key={index} className="media-preview-item">
                                {item.type === 'IMAGE' ? (
                                    <img src={item.url} alt="Preview" className="media-preview-content" />
                                ) : (
                                    <video src={item.url} className="media-preview-video" controls={false} />
                                )}
                                <button
                                    type="button"
                                    className="remove-media-btn"
                                    onClick={() => handleRemoveMedia(index)}
                                    disabled={isSubmitting}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="post-actions">
                    <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />

                    <button
                        type="button"
                        className="media-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting}
                    >
                        <Image size={20} />
                        <Video size={20} />
                        <span>Photo/Video</span>
                    </button>

                    <button
                        type="button"
                        className="submit-post-btn"
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Posting...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Post
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
