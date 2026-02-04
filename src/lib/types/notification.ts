import type { AuditFields } from './common';

export type NotificationType =
	| 'appointment-reminder'
	| 'appointment-confirmed'
	| 'appointment-cancelled'
	| 'payment-reminder'
	| 'payment-received'
	| 'lab-result-ready'
	| 'prescription-ready'
	| 'stock-alert'
	| 'system'
	| 'other';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface Notification extends AuditFields {
	id: string;
	userId: string;
	type: NotificationType;
	priority: NotificationPriority;
	status: NotificationStatus;
	title: string;
	message: string;
	data?: Record<string, any>;
	actionUrl?: string;
	read?: boolean; // Added read status
	readAt?: Date;
}

export interface CreateNotificationDto {
	userId: string;
	type: NotificationType;
	priority: NotificationPriority;
	title: string;
	message: string;
	data?: Record<string, any>;
	actionUrl?: string;
}

export interface NotificationSettings {
	userId: string;
	emailNotifications: boolean;
	smsNotifications: boolean;
	appointmentReminders: boolean;
	paymentReminders: boolean;
	labResults: boolean;
	stockAlerts: boolean;
	systemNotifications: boolean;
}
