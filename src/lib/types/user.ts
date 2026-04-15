import { z } from 'zod';
import type { AuditFields } from './common';
import { contactSchema } from './common';

export const userRoleSchema = z.enum(['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userStatusSchema = z.enum(['active', 'inactive', 'suspended']);
export type UserStatus = z.infer<typeof userStatusSchema>;

export const permissionSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().optional(),
	resource: z.string(),
	actions: z.array(z.enum(['create', 'read', 'update', 'delete']))
});
export type Permission = z.infer<typeof permissionSchema>;



export const userSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.').optional(), // Only for creation/update, not stored in main User type
	firstName: z.string().min(2, 'Ad en az 2 karakter olmalıdır.'),
	lastName: z.string().min(2, 'Soyad en az 2 karakter olmalıdır.'),
	fullName: z.string().optional(), // Derived
	role: userRoleSchema,
	status: userStatusSchema.default('active'),
	contact: contactSchema.optional(),
	permissions: z.array(permissionSchema).optional(),
	avatar: z.string().url().optional(),
	lastLogin: z.date().optional(),
	specialization: z.string().optional(), // For doctors
	licenseNumber: z.string().optional(), // For doctors
	department: z.string().optional(),
	workingHours: z.record(z.string(), z.array(z.object({ start: z.string(), end: z.string() }))).optional(),
	createdAt: z.date(),
	updatedAt: z.date()
});

export type User = z.infer<typeof userSchema>;

export const authSessionSchema = z.object({
	user: userSchema.omit({ password: true }),
	token: z.string(),
	expiresAt: z.date()
});
export type AuthSession = z.infer<typeof authSessionSchema>;

export const loginCredentialsSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6)
});
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export const createUserDtoSchema = userSchema.omit({
	id: true,
	fullName: true,
	lastLogin: true,
	createdAt: true,
	updatedAt: true
});
export type CreateUserDto = z.infer<typeof createUserDtoSchema>;

export const updateUserDtoSchema = userSchema
	.omit({
		id: true,
		fullName: true,
		lastLogin: true,
		createdAt: true,
		updatedAt: true
	})
	.partial();
export type UpdateUserDto = z.infer<typeof updateUserDtoSchema>;
