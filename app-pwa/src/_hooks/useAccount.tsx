import { useEffect, useState } from 'react';
import { useApi, usePushService } from '../_hooks';

export default function useAccount() {
    const { useUser, upsertUser, removeUser } = useApi();
    const { unsubscribePushService, subscribePushService } = usePushService();
    const [storedUserRef, setStoredUserRef] = useState<string | null>(null);
    const { data: user, isError, isLoading } = useUser(storedUserRef);

    useEffect(() => {
        const userRef = localStorage.getItem('userRef');
        setStoredUserRef(userRef);
    }, []);

    useEffect(() => {
        if (isError) {
            localStorage.removeItem('userRef');
            setStoredUserRef(null);
        }
    }, [isError]);

    async function login(email: string) {
        const subscription = await subscribePushService();
        if (!subscription) return;
        await upsertUser.mutateAsync({
            userRef: email,
            subscription,
        });
        localStorage.setItem('userRef', email);
        setStoredUserRef(email);
    }

    async function subscribe({ nickname, email, channels }: UserFormFields) {
        const subscription = await subscribePushService();
        if (!subscription) return;
        const userData = {
            nickname,
            email,
            subscription,
            channels,
        };
        const response = await upsertUser.mutateAsync(userData);
        const createdUser = response.user;
        setStoredUserRef(createdUser!.email);
        localStorage.setItem('userRef', createdUser!.email);
    }

    async function updateChannels(channel: string) {
        await upsertUser.mutateAsync({
            userRef: user!.email,
            channels: [channel],
        });
    }

    async function unsubscribe() {
        await unsubscribePushService();
        await removeUser.mutateAsync(user!.email);
        localStorage.removeItem('userRef');
        setStoredUserRef(null);
    }

    return { user, isLoading, updateChannels, login, subscribe, unsubscribe };
}

type UserFormFields = {
    nickname: string;
    email: string;
    channels: string[];
};
