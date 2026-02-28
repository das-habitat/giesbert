import * as z from 'zod';

export const MessageSchema = z.object({
    userRef: z.email(),
    channelRef: z.string(),
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(500),
});

export const SubscriptionSchema = z.object({
    endpoint: z.string(),
    expirationTime: z.number().nullable().optional(),
    keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
    }),
});

export const UpdateUserSchema = z.object({
    userRef: z.email(),
    channels: z.array(z.string()).min(1).max(30).optional(),
    subscription: SubscriptionSchema.optional(),
});

export const NewUserSchema = z.object({
    nickname: z.string().min(2).max(20),
    email: z.email(),
    channels: z.array(z.string()).min(1).max(30),
    subscription: SubscriptionSchema,
});

export const UserNotificationSchema = z.object({
    userRef: z.string(),
    createdAt: z.date(),
    channel: z.string(),
    id: z.string(),
    title: z.string(),
    body: z.string(),
    author: z.string(),
});


export const UserSchema = z.object({
    email: z.string(),
    nickname: z.string(),
});

export const FullUserSchema = UserSchema.extend({
    channels: z.array(z.object({
        userRef: z.string(),
        channelRef: z.string(),
    })),
    notifications: z.array(UserNotificationSchema),
})

export type Subscription = z.infer<typeof SubscriptionSchema>;
export type NewUser = z.infer<typeof NewUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserMessage = z.infer<typeof MessageSchema>;
export type UserNotification = z.infer<typeof UserNotificationSchema>;
export type User = z.infer<typeof UserSchema>;
export type FullUser = z.infer<typeof FullUserSchema>;
