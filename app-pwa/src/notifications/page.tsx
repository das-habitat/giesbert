import React, { useState, useEffect } from 'react';
import Markdown from 'markdown-to-jsx/react';
import { Copy, Info, LoaderCircle, Plus, Share, TriangleAlert } from 'lucide-react';
import { Button, Input, Header, Card } from '../common/ui-components';
import { useAccount, usePushService } from './hooks';
import { useApi } from '../common/clients'

// import { UserNotification } from '@src/app/api/notifications/route';
import PWABadge from '../PWABadge.tsx'

type UserNotification = any

export default function NotificationsPage() {
  const { isGranted } = usePushService();
    const { user, isLoading } = useAccount();

    return (
        <div>
            <PWABadge />
            <div className="mb-8 text-pretty">
                <Header className="my-24" />
                {isLoading && (
                    <div className="relative h-24 w-full">
                        <LoaderCard />
                    </div>
                )}
                {!isLoading && !user && <SetupGuide />}
                {!isLoading && user && (
                    <>
                        <Card className="bg-livid-400 mb-6" size="small">
                            <h3 className="text-2xl font-bold mb-6">Benachrichtigungen</h3>
                            {user.notifications.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {user.notifications.map((notification: UserNotification, idx: number) => (
                                        <Card key={idx} className="bg-red-400 text-pretty" size="small">
                                            <p className="text-lg font-bold">{notification.title}</p>
                                            <p className="text-lg">{notification.body}</p>
                                            <div className="text-xs font-medium text-right -mb-2">
                                                {`Von: ${notification?.author} / Kanal: ${notification?.channel} / Datum: ${new Date(notification?.createdAt)?.toLocaleString('de-DE')}`}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <StatusCard
                                    icon="info"
                                    data={
                                        isGranted !== 'denied'
                                            ? {
                                                  title: 'Hier piept gerade nichts',
                                                  message:
                                                      'Schicke dir eine Testnachricht oder nutze den Beispiel-Code, um dir Benachrichtigungen zu schicken.',
                                              }
                                            : {
                                                  title: 'Schade Marmelade',
                                                  message:
                                                      'Du hast die Berechtigungen für Push-Benachrichtigungen in deinen Browsereinstellungen deaktiviert. Bitte aktiviere sie, um Push-Benachrichtigungen zu erhalten.',
                                              }
                                    }
                                />
                            )}
                        </Card>
                        <Card className="bg-livid-400" size="small">
                            <h3 className="text-2xl font-bold mb-6">Dein Zugang</h3>
                            <TestingSection className="mb-6" />
                            <SampleSection className="mb-6" />
                            <AccountSection />
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}

function SetupGuide() {
    const { isSupported } = usePushService();
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
    };

    return !isStandalone ? (
        <Card className="bg-livid-400">
            <h3 className="text-2xl font-bold mb-4">App installieren</h3>
            <p>
                Damit du Push Notifications senden und erhalten kannst, ist es nötig P15Ns als App zu installieren. Zum
                Beispiel:
            </p>
            <Card className="my-4 bg-livid-700 text-livid-100" size="small">
                <p className="font-bold">Android (Chrome)</p>
                <Button
                    onClick={promptInstall}
                    className="bg-livid-100 text-livid-700 mt-2 disabled:cursor-not-allowed disabled:opacity-50 w-56"
                    disabled={!deferredPrompt}
                >
                    App installieren
                </Button>
            </Card>
            <Card className="bg-livid-700 text-livid-100" size="small">
                <p className="font-bold mb-1">iOS/MacOS (Safari)</p>
                <ol className="list-decimal list-inside">
                    <li>
                        Tippe auf den <span className="italic font-bold">Teilen-Button</span>{' '}
                        <Share className="inline" />.
                    </li>
                    <li>
                        Wähle <span className="italic font-bold">Zum Startbildschirm/Dock hinzufügen</span>{' '}
                        <Plus className="inline" /> aus
                    </li>
                </ol>
            </Card>
        </Card>
    ) : (
        <>
            {!isSupported ? (
                <StatusCard
                    className="mb-6"
                    size="large"
                    data={{
                        message:
                            'Dein Browser unterstützt keine Push-Benachrichtigungen. Verwende einen anderen Browser wie zum Beispiel Firefox, Safari oder Chrome.',
                    }}
                />
            ) : (
                <Card className="bg-livid-400">
                    <h3 className="text-2xl font-bold mb-4">Zugang erstellen</h3>
                    <p className="mb-4">
                        Die Nutzung von P15Ns ist kostenlos und nur für private Hobby-Projekte erlaubt. Mit der
                        Erstellung deines Kontos stimmst du diesen Nutzungsbedingungen zu. Es werden keine weiteren
                        Daten gespeichert!
                    </p>
                    <AccountSection isSetup={true} />
                </Card>
            )}
        </>
    );
}

function AccountSection({ className, isSetup = false }: AccountSectionProps) {
    const { user, login, subscribe, unsubscribe, updateChannels } = useAccount();
    const [nickname, setNickname] = useState(user?.nickname || '');
    const [email, setEmail] = useState(user?.email || '');
    const [channel, setChannel] = useState(user?.channels?.[0]?.channelRef ?? '');
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    async function submit() {
        if (isLoading) return;
        const isNicknameValid = nickname.length > 0;
        const isEmailValid = email.length > 0 && email.includes('@');
        const isChannelValid = channel.length > 0;
        try {
            if (!user) {
                if (isLogin) {
                    // Login flow
                    if (!isEmailValid) {
                        alert('Ups, da stimmt noch nicht alles – E-Mail-Adresse bitte nochmal prüfen 👀');
                        return;
                    }
                    setIsLoading(true);
                    await login(email);
                } else {
                    // Signup flow
                    if (!isNicknameValid || !isEmailValid || !isChannelValid) {
                        alert('Ups, da stimmt noch nicht alles – schau bitte nochmal drüber 👀');
                        return;
                    }
                    setIsLoading(true);
                    await subscribe({ nickname, email, channels: [channel] });
                }
            } else {
                // Update flow
                if (!isChannelValid) {
                    alert('Ups, da stimmt noch nicht alles – Kanal bitte nochmal prüfen 👀');
                    return;
                }
                setIsLoading(true);
                await updateChannels(channel);
            }
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            alert('Oje… es ist ein Fehler aufgetreten. Ein zweiter Versuch könnte helfen 🔁');
            console.error('Submit error:', error);
        }
    }

    async function deleteAccount() {
        if (isLoading) return;
        const confirm = window.confirm('Konto löschen? Dramatische Musik setzt ein 🎻');
        if (!confirm) return;
        try {
            setIsLoading(true);
            await unsubscribe();
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            alert('Oje… es ist ein Fehler aufgetreten. Ein zweiter Versuch könnte helfen 🔁');
            console.error('Delete account error:', error);
        }
    }

    function toggleSetup() {
        setIsLogin(!isLogin);
    }

    return (
        <Card className={`relative bg-violet-400 ${className}`} size="small">
            {isLoading && <LoaderCard />}
            <div className={isLoading ? 'blur-xs' : ''}>
                <h3 className="font-bold text-xl mb-4 text-violet-900">Dein Konto</h3>
                {!isLogin && (
                    <Input
                        id="nickname"
                        label="*Dein Name"
                        labelStyle="text-violet-700"
                        inputStyle="mb-3 text-violet-900 bg-livid-100 disabled:cursor-not-allowed disabled:opacity-50"
                        type="text"
                        disabled={!!user}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                )}
                <Input
                    id="email"
                    label="*Deine E-Mail-Adresse"
                    labelStyle="text-violet-700"
                    inputStyle="mb-3 text-violet-900 bg-livid-100 disabled:cursor-not-allowed disabled:opacity-50"
                    type="text"
                    disabled={!!user}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {!isLogin && (
                    <Input
                        id="channel"
                        label="*Kanal (kann von mehreren Personen verwendet werden)"
                        labelStyle="text-violet-700"
                        inputStyle="mb-3 text-violet-900 bg-livid-100"
                        type="text"
                        value={channel}
                        onChange={(e) => setChannel(e.target.value)}
                    />
                )}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                    <Button className="bg-violet-700 text-livid-100 w-56" onClick={submit} disabled={isLoading}>
                        {!user ? (isLogin ? 'Einloggen' : 'Konto erstellen') : 'Einstellungen speichern'}
                    </Button>
                    {isSetup && (
                        <Button className="text-violet-700 underline" onClick={toggleSetup} disabled={isLoading}>
                            {!isLogin ? 'Zum Login' : 'Zur Registrierung'}
                        </Button>
                    )}
                    {user && (
                        <Button
                            className="text-red-500 border-red-500! w-56"
                            onClick={deleteAccount}
                            disabled={isLoading}
                        >
                            Konto löschen
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

function TestingSection({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const { user } = useAccount();
    const { sendMessage } = useApi();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function sendTestNotification() {
        if (isLoading) return;
        const isMessageValid = message.length > 0;
        if (!isMessageValid) {
            alert('Bitte gib eine Nachricht ein – Gedankenübertragung ist noch im Beta-Test 🙃');
            return;
        }
        setIsLoading(true);
        try {
            await sendMessage.mutateAsync({
                title: 'Testnachricht',
                body: message,
                userRef: user!.email,
                channelRef: user!.channels[0].channelRef,
            });
        } catch (error) {
            alert('Ups! Fehler beim Senden. Ein zweiter Versuch könnte helfen 🔁');
            console.error('Send message error:', error);
        }
        setMessage('');
        setIsLoading(false);
    }

    return (
        <Card className={`relative mb-6 bg-livid-700 ${className}`}>
            {isLoading && <LoaderCard className="bg-livid-100/20" />}
            <div className={`flex flex-col items-center ${isLoading ? 'blur-xs' : ''}`}>
                <Input
                    id="message"
                    inputStyle="mb-6 text-livid-800 bg-livid-100"
                    type="text"
                    placeholder="Deine Nachricht"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <Button className="bg-red-400 text-livid-100 w-56" onClick={sendTestNotification} disabled={isLoading}>
                    Testnachricht senden
                </Button>
            </div>
        </Card>
    );
}

function SampleSection({ className }: React.HTMLAttributes<HTMLDivElement>) {
    const { user } = useAccount();
    const sampleCode = `
    #include <WiFi.h>
    #include <HTTPClient.h>
    #include <WiFiManager.h>  // https://github.com/tzapu/WiFiManager

    char* apiUrl = "https://digimunea.de/api/notifications?action=send";
    char* userRef = "${user?.email}";
    char* channelRef = "${user?.channels?.[0]?.channelRef}";
    char* title = "Testbenachrichtigung";
    char* body = "Gesendet von deinem IoT-Gerät!";

    void setupWiFi() {}
    void sendData(float moistureVoltage, float moisturePercent, float batteryVoltage) { 
        if (WiFi.status() == WL_CONNECTED) { 
            HTTPClient http; 
            http.begin(apiUrl);
            http.addHeader("Content-Type", "application/json");
            String json = "{";
            json += "\"userRef\": \"" + String(userRef) + "\",";
            json += "\"channelRef\": \"" + String(channelRef) + "\",";
            json += "\"title\": \"" + String(title) + "\",";
            json += "\"body\": \"" + String(body) + "\",";
            int httpResponseCode = http.POST(json);
            Serial.println("Response: " + String(httpResponseCode));        
            Serial.println("Payload: " + json);
            http.end();
        } else { 
            Serial.println("WiFi not connected, skipping data send.");
        }
    }`;

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(sampleCode);
            alert('Kopiert & einsatzbereit 🚀');
        } catch (error) {
            alert('Oje… Kopieren fehlgeschlagen 😅');
            console.error('Copy error:', error);
        }
    };

    return (
        <Card className={`mb-6 bg-livid-700 text-livid-100 ${className}`} size="small">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-xl mb-4">Beispiel-Code</h3>
                <button type="button" onClick={copyCode}>
                    <Copy className="text-red-400 hover:cursor-pointer" />
                </button>
            </div>
            <div className="mb-6 font-mono text-sm [&_pre]:whitespace-pre-wrap [&_pre]:overflow-x-auto [&_code]:break-words]">
                <Markdown>{sampleCode}</Markdown>
            </div>
            <div className="flex justify-center">
                <Button onClick={copyCode} className="bg-red-400 text-livid-100 w-56">
                    Code kopieren
                </Button>
            </div>
        </Card>
    );
}

function StatusCard({ data, style = 'warning', icon = 'warning', size = 'small', className }: ErrorCardProps) {
    return (
        <Card
            className={`${style === 'info' ? 'bg-livid-700' : 'bg-red-400'} flex items-start ${className}`}
            size={size}
        >
            {icon === 'info' ? (
                <Info strokeWidth={3} className="shrink-0 mt-1 mr-2" />
            ) : (
                <TriangleAlert strokeWidth={3} className="shrink-0 mt-1 mr-2" />
            )}
            <div>
                <p className={`${size === 'small' ? 'text-xl mb-2' : 'text-2xl mb-4'} font-bold`}>
                    {data?.title || 'Schade Marmelade'}
                </p>
                <p>{data.message}</p>
            </div>
        </Card>
    );
}

function LoaderCard({ className }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <Card
            className={`absolute top-0 left-0 w-full h-full flex justify-center items-center z-100 text-livid-800 ${className}`}
        >
            <LoaderCircle className="animate-spin text-inherit" size={65} />
        </Card>
    );
}

type ErrorCardProps = Readonly<{
    data: {
        title?: string;
        message: string;
    };
    icon?: 'warning' | 'info';
    style?: 'warning' | 'info';
    size?: 'small' | 'large';
}> &
    React.HTMLAttributes<HTMLDivElement>;

type BeforeInstallPromptEvent = {
    prompt(): Promise<void>;
} & Event;

type AccountSectionProps = Readonly<{
    isSetup?: boolean;
}> &
    React.HTMLAttributes<HTMLDivElement>;


