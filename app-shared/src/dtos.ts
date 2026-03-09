import * as z from 'zod';

export const MessageSchema = z.object({
    channelRef: z.string(),
    title: z.string().min(1).max(100),
    body: z.string().min(1).max(500),
    author: z.string(),
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

export const TelemetrySchema = z.object({
    channelRef: z.string(),
    deviceName: z.string(),
    moisture: z.number().min(0).max(100),
    battery: z.number().min(0).max(100),
});

export const TelemetryReadingSchema = z.object({
    id: z.string(),
    deviceRef: z.string(),
    moisture: z.number(),
    battery: z.number(),
    createdAt: z.date(),
    device: z.object({ name: z.string() }),
});

export const NotificationSchema = z.object({
    id: z.string(),
    channelRef: z.string(),
    createdAt: z.date(),
    title: z.string(),
    body: z.string(),
    author: z.string(),
});

export const ChannelSchema = z.object({
    id: z.string(),
    name: z.string(),
});

export const UserSchema = z.object({
    id: z.string(),
    email: z.string(),
    nickname: z.string(),
});

export const FullUserSchema = UserSchema.extend({
    channels: z.array(z.object({
        channelRef: z.string(),
        channel: ChannelSchema,
    })),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;
export type NewUser = z.infer<typeof NewUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Telemetry = z.infer<typeof TelemetrySchema>;
export type TelemetryReading = z.infer<typeof TelemetryReadingSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type Channel = z.infer<typeof ChannelSchema>;
export type User = z.infer<typeof UserSchema>;
export type FullUser = z.infer<typeof FullUserSchema>;
