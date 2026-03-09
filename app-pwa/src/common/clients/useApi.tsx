import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type NewUser,
  type Message,
  type UpdateUser,
  type FullUser,
  type User,
  type Notification,
  type TelemetryReading,
  NotificationAction,
} from 'app-shared';

const URL_API_NOTIFICATIONS = '/api/notifications';
const URL_API_TELEMETRY = '/api/telemetry';
const URL_API_USERS = '/api/users';

export default function useApi() {
  const queryClient = useQueryClient();

  const useUser = (userRef: string | null) => {
    return useQuery({
      queryKey: ['user'],
      queryFn: async () => {
        const res = await fetch(`${URL_API_USERS}?userRef=${userRef}`);
        const data = await handleResponse(res);
        return data.user as FullUser;
      },
      enabled: !!userRef,
    });
  };

  const useNotifications = (channelRef: string | null) => {
    return useQuery({
      queryKey: ['notifications', channelRef],
      queryFn: async () => {
        const res = await fetch(
          `${URL_API_NOTIFICATIONS}?channelRef=${channelRef}`,
        );
        const data = await handleResponse(res);
        return data.notifications as Notification[];
      },
      enabled: !!channelRef,
      refetchInterval: 5000, // 5s
    });
  };

  const useTelemetry = (channelRef: string | null) => {
    return useQuery({
      queryKey: ['telemetry', channelRef],
      queryFn: async () => {
        const res = await fetch(
          `${URL_API_TELEMETRY}?channelRef=${channelRef}`,
        );
        const data = await handleResponse(res);
        return data.telemetry as TelemetryReading[];
      },
      enabled: !!channelRef,
      refetchInterval: 60000, // 60s
    });
  };

  const upsertUser = useMutation({
    mutationFn: async (newUser: NewUser | UpdateUser) => {
      const res = await fetch(URL_API_USERS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      return handleResponse(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const removeUser = useMutation({
    mutationFn: async (userRef: string) => {
      const res = await fetch(URL_API_USERS, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRef }),
      });
      return handleResponse(res);
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (message: Message) => {
      const res = await fetch(
        `${URL_API_NOTIFICATIONS}?action=${NotificationAction.send}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        },
      );
      return handleResponse(res);
    },
  });

  return {
    upsertUser,
    removeUser,
    useUser,
    useNotifications,
    useTelemetry,
    sendMessage,
  };
}

function handleResponse(res: Response): Promise<ResponseData> {
  if (!res.ok) {
    throw new Error(
      JSON.stringify({ status: res.status, message: res.statusText }),
    );
  }
  return res.json();
}

type ResponseData = {
  success: boolean;
  user?: FullUser | User;
  notifications?: Notification[];
  telemetry?: TelemetryReading[];
};
