import { useState, useEffect } from 'react';

export default function usePushService() {
    const [isSupported, setIsSupported] = useState(false);
    const [isGranted, setIsGranted] = useState<NotificationPermission>('default');

    useEffect(() => {
        const isSupported = 'serviceWorker' in navigator && 'Notification' in window;
        setIsSupported(isSupported);
        if (isSupported) {
            const permission = Notification.permission;
            setIsGranted(permission);
        }
    }, []);

    async function subscribePushService() {
        if (!isSupported) return;
        let permission = isGranted;
        if (permission === 'default') {
            permission = await Notification.requestPermission();
            setIsGranted(permission);
        }
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
        });
        await navigator.serviceWorker.ready;
        console.log('Service Worker ready:', registration.active);
        if (!('pushManager' in registration)) {
            console.log('Push Manager not supported in Service Worker registration.');
            setIsSupported(false);
            return;
        }
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });
        const serializedSub = JSON.parse(JSON.stringify(subscription));
        console.log('Push Subscription:', serializedSub);
        return serializedSub;
    }

    async function unsubscribePushService() {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        await subscription?.unsubscribe();
    }

    return { isSupported, isGranted, subscribePushService, unsubscribePushService };
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
