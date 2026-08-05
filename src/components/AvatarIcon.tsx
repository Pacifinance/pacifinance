// Belongs in components/ despite reading LanguageContext/ToastContext: it's a generic,
// cross-feature primitive, not tied to a business domain (see CONTRIBUTING.md's
// components/ vs sections/ rule).
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { getAvatar, regenerateAvatar, canRegenerateAvatar } from '../utils/avatarGenerator';
import { LanguageContext } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

/**
 * AvatarIcon - Renders the user's generated avatar
 * 
 * Features:
 * - Displays cached avatar from localStorage
 * - Double-click or long-press to regenerate (1x per day)
 * - Shows toast notification on regeneration
 * 
 * @param {Object} props
 * @param {number} props.size - Size in px (default: 40)
 * @param {Object} props.theme - Theme object
 * @param {Function} props.onClick - Click handler (optional, for opening dropdown)
 * @param {string} props.title - Tooltip title
 * @param {Object} props.style - Additional styles
 */
const AvatarIcon = ({ size = 40, onClick, title, style = {} }) => {
    const [avatarSrc, setAvatarSrc] = useState(null);
    const { translations } = useContext(LanguageContext);
    const { showSuccess } = useToast();

    useEffect(() => {
        setAvatarSrc(getAvatar());
    }, []);

    const handleRegenerate = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!canRegenerateAvatar()) {
            showSuccess(translations?.avatar?.limitReached || 'You can regenerate your avatar once a day');
            return;
        }

        const result = regenerateAvatar();
        if (result.success) {
            setAvatarSrc(result.avatar);
            showSuccess(translations?.avatar?.regenerated || 'New avatar generated!');
        }
    }, [translations, showSuccess]);

    if (!avatarSrc) return null;

    return (
        <img
            src={avatarSrc}
            title={title || translations?.avatar?.tooltip || 'Avatar'}
            width={size}
            height={size}
            alt="Avatar"
            className="account-image"
            onClick={onClick}
            onDoubleClick={handleRegenerate}
            onContextMenu={handleRegenerate}
            style={{
                borderRadius: '50%',
                cursor: 'pointer',
                objectFit: 'cover',
                width: `${size}px`,
                height: `${size}px`,
                ...style
            }}
        />
    );
};

export default AvatarIcon;
