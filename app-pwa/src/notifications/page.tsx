import React, { useState, useEffect } from 'react';
import { Plus, Share, ExternalLink } from 'lucide-react';
import { type UserNotification } from 'app-shared';
import { Button, Input, Header, Card } from '../common/ui-components';
import { useAccount, usePushService } from './hooks';
import { useApi } from '../common/clients';
import { LoaderCard, StatusCard } from './components';

export default function NotificationsPage() {
  const { isGranted } = usePushService();
  const { user, isLoading } = useAccount();

  return (
    <div>
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
            <Card className="bg-olive-300 mb-6" size="small">
              <h3 className="text-2xl font-bold mb-6">Benachrichtigungen</h3>
              {user.notifications.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {user.notifications.map(
                    (notification: UserNotification, idx: number) => (
                      <Card
                        key={idx}
                        className="bg-pink-400 text-pretty border-3 border-black"
                        size="small"
                      >
                        <p className="text-lg font-bold">
                          {notification.title}
                        </p>
                        <p className="text-lg">{notification.body}</p>
                        <div className="text-xs font-medium text-right -mb-2">
                          {`Von: ${notification?.author} / Kanal: ${notification?.channel} / Datum: ${new Date(notification?.createdAt)?.toLocaleString('de-DE')}`}
                        </div>
                      </Card>
                    ),
                  )}
                </div>
              ) : (
                <StatusCard
                  className="border-3 border-black"
                  icon="info"
                  data={
                    isGranted !== 'denied'
                      ? {
                        title: 'Hier piept gerade nichts',
                        message:
                          'Schicke dir eine Testnachricht, um hier Benachrichtigungen zu sehen.',
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
            <Card className="bg-olive-300" size="small">
              <h3 className="text-2xl font-bold mb-6">Dein Zugang</h3>
              <TestingSection className="mb-4" />
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
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

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
    <Card className="bg-olive-300">
      <h3 className="text-2xl font-bold mb-4">App installieren</h3>
      <p>
        Damit du Push Notifications senden und erhalten kannst, ist es nötig
        diese Webseite als App auf deinem Smartphone zu installieren. Zum
        Beispiel so:
      </p>
      <Card
        className="my-4 bg-livid-400 text-black border-3 border-black"
        size="small"
      >
        <p className="font-bold">Android (Chrome)</p>
        <Button
          onClick={promptInstall}
          className="bg-black text-white mt-2 disabled:cursor-not-allowed disabled:opacity-50 w-56"
          disabled={!deferredPrompt}
        >
          App installieren
        </Button>
      </Card>
      <Card
        className="bg-livid-400 text-black border-3 border-black"
        size="small"
      >
        <p className="font-bold mb-1">iOS/MacOS (Safari)</p>
        <ol className="list-decimal list-inside">
          <li>
            Tippe auf den{' '}
            <span className="italic font-bold">Teilen-Button</span>{' '}
            <Share className="inline" />.
          </li>
          <li>
            Wähle{' '}
            <span className="italic font-bold">
              Zum Startbildschirm/Dock hinzufügen
            </span>{' '}
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
        <Card className="bg-olive-300">
          <h3 className="text-2xl font-bold mb-4">Zugang erstellen</h3>
          <p className="mb-4">
            Die Nutzung der giesbert App ist kostenlos und nur für private
            Hobby-Projekte erlaubt. Mit der Erstellung deines Kontos stimmst du
            diesen Nutzungsbedingungen zu. Es werden keine weiteren persönlichen
            Daten gespeichert.
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
            alert(
              'Ups, da stimmt noch nicht alles – E-Mail-Adresse bitte nochmal prüfen 👀',
            );
            return;
          }
          setIsLoading(true);
          await login(email);
        } else {
          // Signup flow
          if (!isNicknameValid || !isEmailValid || !isChannelValid) {
            alert(
              'Ups, da stimmt noch nicht alles – schau bitte nochmal drüber 👀',
            );
            return;
          }
          setIsLoading(true);
          await subscribe({ nickname, email, channels: [channel] });
        }
      } else {
        // Update flow
        if (!isChannelValid) {
          alert(
            'Ups, da stimmt noch nicht alles – Kanal bitte nochmal prüfen 👀',
          );
          return;
        }
        setIsLoading(true);
        await updateChannels(channel);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      alert(
        'Oje… es ist ein Fehler aufgetreten. Ein zweiter Versuch könnte helfen 🔁',
      );
      console.error('Submit error:', error);
    }
  }

  async function deleteAccount() {
    if (isLoading) return;
    const confirm = window.confirm(
      'Konto löschen? Dramatische Musik setzt ein 🎻',
    );
    if (!confirm) return;
    try {
      setIsLoading(true);
      await unsubscribe();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      alert(
        'Oje… es ist ein Fehler aufgetreten. Ein zweiter Versuch könnte helfen 🔁',
      );
      console.error('Delete account error:', error);
    }
  }

  function toggleSetup() {
    setIsLogin(!isLogin);
  }

  return (
    <Card
      className={`relative bg-livid-400 border-3 border-black ${className}`}
      size="small"
    >
      {isLoading && <LoaderCard />}
      <div className={isLoading ? 'blur-xs' : ''}>
        <h3 className="font-bold text-xl mb-4 text-black">Dein Konto</h3>
        {!isLogin && (
          <Input
            id="nickname"
            label="*Dein Name"
            labelStyle="text-livid-700"
            inputStyle="mb-3 text-black bg-livid-100 disabled:cursor-not-allowed disabled:opacity-50"
            type="text"
            disabled={!!user}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        )}
        <Input
          id="email"
          label="*Deine E-Mail-Adresse"
          labelStyle="text-livid-700"
          inputStyle="mb-3 text-black bg-livid-100 disabled:cursor-not-allowed disabled:opacity-50"
          type="text"
          disabled={!!user}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!isLogin && (
          <Input
            id="channel"
            label="*Kanal (kann von mehreren Personen verwendet werden)"
            labelStyle="text-livid-700"
            inputStyle="mb-3 text-black bg-livid-100"
            type="text"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          />
        )}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <Button
            className="bg-black text-white w-56"
            onClick={submit}
            disabled={isLoading}
          >
            {!user
              ? isLogin
                ? 'Einloggen'
                : 'Konto erstellen'
              : 'Einstellungen speichern'}
          </Button>
          {isSetup && (
            <Button
              className="text-black underline"
              onClick={toggleSetup}
              disabled={isLoading}
            >
              {!isLogin ? 'Zum Login' : 'Zur Registrierung'}
            </Button>
          )}
          {user && (
            <Button
              className="text-red-600 border-red-600! w-56"
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
      alert(
        'Bitte gib eine Nachricht ein – Gedankenübertragung ist noch im Beta-Test 🙃',
      );
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
    <Card
      className={`relative bg-livid-400 border-3 border-black ${className}`}
      size="small"
    >
      {isLoading && <LoaderCard className="bg-livid-100/20" />}
      <div className={isLoading ? 'blur-xs' : ''}>
        <h3 className="font-bold text-xl mb-4 text-black">Dokumentation</h3>
        <span className="inline-block mb-4">
          Informationen zur Verwendung der API und Anwendungsbeispiele findest
          du in unserem{' '}
          <a
            className="text-black underline font-medium hover:text-pink-400 font-sans"
            href="https://github.com/das-habitat/giesbert"
            target="_blank"
          >
            öffentlichen Ordner
            <ExternalLink size={16} className="inline ml-1 mb-0.5" />
          </a>
          . Zum Testen, ob Push-Benarichtingungen generell funktionieren, kannst
          du dir eine Testnachricht schicken:
        </span>
        <div className="flex flex-col items-center">
          <Input
            id="message"
            inputStyle="mb-6 text-black bg-livid-100"
            type="text"
            placeholder="Deine Nachricht"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            className="bg-black text-white w-56"
            onClick={sendTestNotification}
            disabled={isLoading}
          >
            Testnachricht senden
          </Button>
        </div>
      </div>
    </Card>
  );
}

type BeforeInstallPromptEvent = {
  prompt(): Promise<void>;
} & Event;

type AccountSectionProps = Readonly<{
  isSetup?: boolean;
}> &
  React.HTMLAttributes<HTMLDivElement>;
