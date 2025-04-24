// Notification.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Overlay, Popover, Badge, Button } from 'react-bootstrap';
import { FiBell, FiCheckCircle, FiX, FiBook, FiAlertCircle, FiAward } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import './Notification.scss';
import { Notification, NotificationType } from '../store/notificationSlice';





export const Notifications: React.FC<{
    notifications: Notification[];
    onMarkRead: (id: string) => void;
    onMarkAllRead: () => void;
    isDarkMode: boolean;
}> = ({ notifications, onMarkRead, onMarkAllRead, isDarkMode }) => {
    const [show, setShow] = useState(false);
    const target = useRef(null);

    const getIcon = (type: NotificationType) => {
        const iconProps = {
            className: 'notification-icon',
            size: 20,
            color: isDarkMode ? 'var(--light-text)' : 'var(--dark-text)'
        };

        switch (type) {
            case 'assignment':
                return <FiBook {...iconProps} />;
            case 'announcement':
                return <FiAlertCircle {...iconProps} />;
            case 'grade':
                return <FiAward {...iconProps} />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="notifications-container">
            <Button
                ref={target}
                variant="link"
                className="icon-btn"
                onClick={() => setShow(!show)}
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            >
                <FiBell color={isDarkMode ? 'var(--light-text)' : 'var(--dark-text)'} />
                {unreadCount > 0 && (
                    <Badge
                        pill
                        bg={isDarkMode ? 'warning' : 'danger'}
                        className="notification-badge"
                    >
                        {unreadCount}
                    </Badge>
                )}
            </Button>
            <Overlay
                show={show} // Changed from show={true}
                target={target.current}
                placement="bottom-end"
                rootClose
                onHide={() => setShow(false)}
                transition
            >
                <Popover
                    className={`notification-popover ${isDarkMode ? 'dark' : ''}`}
                >
                    <Popover.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Notifications</h5>
                        <div className="d-flex gap-2">
                            <Button
                                variant="link"
                                size="sm"
                                className="text-secondary"
                                onClick={onMarkAllRead}
                                aria-label="Mark all as read"
                            >
                                <FiCheckCircle size={16} />
                            </Button>
                            <Button
                                variant="link"
                                size="sm"
                                className="text-secondary"
                                onClick={() => setShow(false)}
                                aria-label="Close notifications"
                            >
                                <FiX size={16} />
                            </Button>
                        </div>
                    </Popover.Header>

                    <Popover.Body className="p-0">
                        <div className="notification-list">
                            {notifications.length === 0 ? (
                                <div className="text-center p-3 text-muted">No new notifications</div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.notif_id}
                                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                        role="button"
                                        onClick={() => onMarkRead(notification.notif_id)}
                                    >
                                        <div className="notification-indicator" aria-hidden="true" />
                                        <div className="notification-icon-container">
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="mb-0">{notification.title}</h6>
                                                <small className="text-muted">
                                                    {formatDistanceToNow(new Date(notification.timestamp))} ago
                                                </small>
                                            </div>
                                            <p className="mb-0 text-muted">{notification.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Popover.Body>
                </Popover>
            </Overlay>
        </div>
    );
};