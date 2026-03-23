
import React, { useState, useEffect } from 'react';
import { X, Users, Edit2, LogOut, Save, Loader2, User } from 'lucide-react';
import { getChatMembers, updateGroupInfo, leaveGroup } from '../../api/chatService';
import { getAvatarUrl } from '../../utils/constants';
import toast from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';
import ImageUploader from '../common/ImageUploader';
import '../../styles/GroupInfoModal.css';

const GroupInfoModal = ({ chat, isOpen, onClose, onLeaveGroup, onUpdateGroup }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupAvatar, setGroupAvatar] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    useEffect(() => {
        if (isOpen && chat) {
            fetchMembers();
            setGroupName(chat.chatName);
            setGroupAvatar(chat.chatAvatarUrl || '');
            setIsEditing(false);
        }
    }, [isOpen, chat]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await getChatMembers(chat.id);
            setMembers(response || []);
        } catch (error) {
            console.error("Failed to fetch members", error);
            toast.error("Failed to load members");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!groupName.trim()) return;

        setIsSaving(true);
        try {
            const updateData = {
                chatName: groupName,
                chatAvatarUrl: groupAvatar
            };

            const updatedChat = await updateGroupInfo(chat.id, updateData);
            onUpdateGroup(updatedChat);

            setIsEditing(false);
            toast.success("Group info updated");
        } catch (error) {
            console.error("Failed to update group", error);
            toast.error("Failed to update group info");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLeave = () => {
        setShowLeaveConfirm(true);
    };

    const confirmLeave = async () => {
        setShowLeaveConfirm(false);
        setIsLeaving(true);
        try {
            await leaveGroup(chat.id);

            onLeaveGroup(chat.id);
            onClose();
            toast.success("Left group successfully");
        } catch (error) {
            console.error("Failed to leave group", error);
            toast.error("Failed to leave group");
        } finally {
            setIsLeaving(false);
        }
    };

    if (!isOpen || !chat) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content group-info-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-container">
                        <Users size={24} className="text-primary" />
                        <h3>Group Info</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="group-header-section">
                        {isEditing ? (
                            <ImageUploader
                                currentImage={groupAvatar || getAvatarUrl(chat.chatName)}
                                onImageUpload={(url) => setGroupAvatar(url)}
                                type="group"
                                disabled={isSaving}
                            />
                        ) : (
                            <div className="group-avatar-large">
                                <img
                                    src={groupAvatar || getAvatarUrl(chat.chatName)}
                                    alt={chat.chatName}
                                />
                            </div>
                        )}

                        <div className="group-name-container">
                            {isEditing ? (
                                <div className="edit-name-wrapper">
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        className="group-name-input"
                                        autoFocus
                                    />
                                    <div className="edit-actions">
                                        <button
                                            className="group-edit-action-btn group-save-btn"
                                            onClick={handleUpdate}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        </button>
                                        <button
                                            className="group-edit-action-btn group-cancel-btn"
                                            onClick={() => {
                                                setGroupName(chat.chatName);
                                                setIsEditing(false);
                                            }}
                                            disabled={isSaving}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="display-name-wrapper">
                                    <h2>{chat.chatName}</h2>
                                    <button
                                        className="edit-icon-btn"
                                        onClick={() => setIsEditing(true)}
                                        title="Edit Group Name"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            )}
                            <p className="member-count">{members.length} members</p>
                        </div>
                    </div>

                    <div className="members-section">
                        <h4>Members</h4>
                        <div className="members-list">
                            {loading ? (
                                <div className="loading-state">
                                    <Loader2 className="animate-spin" size={24} />
                                </div>
                            ) : members.length > 0 ? (
                                members.map(member => (
                                    <div key={member.memberId} className="member-item">
                                        <div className="member-avatar">
                                            <img
                                                src={member.memberAvatarUrl || getAvatarUrl(member.memberFullName)}
                                                alt={member.memberFullName}
                                                onError={(e) => { e.target.src = getAvatarUrl(member.memberFullName) }}
                                            />
                                        </div>
                                        <div className="member-info">
                                            <span className="member-name">{member.memberFullName}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">No members found</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer group-info-footer">
                    <button
                        className="modal-btn btn-danger leave-group-btn"
                        onClick={handleLeave}
                        disabled={isLeaving}
                    >
                        {isLeaving ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
                        <span>Leave Group</span>
                    </button>
                </div>
            </div>

            <ConfirmModal
                isOpen={showLeaveConfirm}
                onClose={() => setShowLeaveConfirm(false)}
                onConfirm={confirmLeave}
                title="Leave Group"
                message={`Are you sure you want to leave "${chat?.chatName}"? You will no longer receive messages from this group.`}
                confirmText="Leave Group"
                cancelText="Cancel"
                isDanger={true}
            />
        </div>
    );
};

export default GroupInfoModal;
