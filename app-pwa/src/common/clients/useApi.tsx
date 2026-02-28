// import { NewUser, UserMessage, UpdateUser, FullUser, User } from '@src/app/api/notifications/route';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type NewUser = any;
type UserMessage = any;
type UpdateUser = any;
type FullUser = any;
type User = any;

const URL_API_NOTIFICATIONS = '/api/notifications';

export default function useApi() {
  const queryClient = useQueryClient();

  const useUser = (userRef: string | null) => {
    return useQuery({
      queryKey: ['user'],
      queryFn: async () => {
        const res = await fetch(`${URL_API_NOTIFICATIONS}?userRef=${userRef}`);
        const data = await handleResponse(res);
        return data.user as FullUser;
      },
      enabled: !!userRef,
      refetchInterval: 2000,
    });
  };

  const upsertUser = useMutation({
    mutationFn: async (newUser: NewUser | UpdateUser) => {
      const res = await fetch(URL_API_NOTIFICATIONS, {
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
      const res = await fetch(`${URL_API_NOTIFICATIONS}`, {
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
    mutationFn: async (message: UserMessage) => {
      const res = await fetch(`${URL_API_NOTIFICATIONS}?action=send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      return handleResponse(res);
    },
  });

  return { upsertUser, removeUser, useUser, sendMessage };
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
};
