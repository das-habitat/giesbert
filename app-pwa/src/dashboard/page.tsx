import React, { useState, useEffect } from 'react';
import { Plus, Share, ExternalLink } from 'lucide-react';
import { type Notification, TelemetryKey } from 'app-shared';
import {
  Button,
  Input,
  Header,
  Card,
  LoaderCard,
} from '../common/ui-components';
import { useAccount, usePushService } from './hooks';
import { useApi } from '../common/clients';
import { AreaChart, StatusCard } from './components';

const content = {
  setup: {
    title: 'App installieren',
    desc: 'Damit du Push Notifications senden und erhalten kannst, ist es nötig diese Webseite als App auf deinem Smartphone zu installieren. Zum Beispiel so:',
    error: {
      browser:
        'Dein Browser unterstützt keine Push-Benachrichtigungen. Verwende einen anderen Browser wie zum Beispiel Firefox, Safari oder Chrome.',
    },
    guide: {
      chromium: {
        device: 'Android (Chrome)',
        step: 'App installieren',
      },
      safari: {
        device: 'iOS/MacOS (Safari)',
        steps: [
          'Tippe auf den ',
          'Teilen-Button',
          'Wähle ',
          'Zum Startbildschirm/Dock hinzufügen',
          ' aus',
        ],
      },
    },
  },
  notifications: {
    title: 'Benachrichtigungen',
    status: {
      empty: {
        title: 'Hier piept gerade nichts',
        text: 'Schicke dir eine Testnachricht, um hier Benachrichtigungen zu sehen.',
      },
      settings: {
        title: 'Schade Marmelade',
        text: 'Du hast die Berechtigungen für Push-Benachrichtigungen in deinen Browsereinstellungen deaktiviert. Bitte aktiviere sie, um Push-Benachrichtigungen zu erhalten.',
      },
    },
  },
  telemetry: {
    title: 'Messwerte',
    battery: {
      title: 'Akkustand',
      unit: 'SoC',
    },
    moisture: {
      title: 'Bodenfeuchte',
      unit: 'VWC',
    },
  },
  account: {
    form: {
      fields: {
        email: '*Deine E-Mail-Adresse',
        nickname: '*Dein Name',
        channel: '*Kanal (kann von mehreren Personen verwendet werden)',
      },
      error: {
        email:
          'Ups, da stimmt noch nicht alles – E-Mail-Adresse bitte nochmal prüfen 👀',
        misc: 'Ups, da stimmt noch nicht alles – schau bitte nochmal drüber 👀',
        channel:
          'Ups, da stimmt noch nicht alles – Kanal bitte nochmal prüfen 👀',
      },
      nav: {
        login: 'Zum Login',
        create: 'Zur Registrierung',
      },
      btn: {
        login: 'Einloggen',
        create: 'Konto erstellen',
        delete: 'Konto löschen',
        update: 'Einstellungen speichern',
      },
      alert: {
        delete: 'Konto löschen? Dramatische Musik setzt ein 🎻',
      },
      section: {
        create: {
          title: 'Zugang erstellen',
          desc: 'Die Nutzung der giesbert App ist kostenlos und nur für private Hobby-Projekte erlaubt. Mit der Erstellung deines Kontos stimmst du diesen Nutzungsbedingungen zu. Es werden keine weiteren persönlichen Daten gespeichert.',
        },
        access: 'Dein Konto',
      },
    },
    access: {
      title: 'Dein Zugang',
      docs: {
        title: 'Dokumentation',
        desc: [
          'Informationen zur Verwendung der API und Anwendungsbeispiele findest du in unserem ',
          {
            href: 'https://github.com/das-habitat/giesbert',
            text: 'öffentlichen Ordner',
          },
          '. Zum Testen, ob Push-Benarichtingungen generell funktionieren, kannst du dir eine Testnachricht schicken:',
        ],
        form: {
          fields: {
            message: 'Deine Nachricht',
          },
          error: {
            message:
              'Bitte gib eine Nachricht ein – Gedankenübertragung ist noch im Beta-Test 🙃',
          },
          btn: {
            send: 'Testnachricht senden',
          },
        },
      },
    },
  },
  error: {
    network:
      'Oje… es ist ein Fehler aufgetreten. Ein zweiter Versuch könnte helfen 🔁',
  },
} as const;

export default function DashboardPage() {
  const { isGranted } = usePushService();
  const { user, isLoading } = useAccount();
  const channelRef = user?.channels?.[0]?.channel?.name ?? null;
  const { useNotifications } = useApi();
  const { data: notifications = [] } = useNotifications(channelRef);

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
              <h3 className="text-2xl font-bold mb-6">
                {content.notifications.title}
              </h3>
              {notifications.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {notifications.map(
                    (notification: Notification, idx: number) => (
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
                          {`Von: ${notification.author} / Datum: ${new Date(notification.createdAt).toLocaleString('de-DE')}`}
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
                          title: content.notifications.status.empty.title,
                          message: content.notifications.status.empty.text,
                        }
                      : {
                          title: content.notifications.status.settings.title,
                          message: content.notifications.status.settings.text,
                        }
                  }
                />
              )}
            </Card>
            <Card className="bg-olive-300 mb-6" size="small">
              <h3 className="text-2xl font-bold mb-6">
                {content.telemetry.title}
              </h3>
              <TelemetrySection channelRef={channelRef} />
            </Card>
            <Card className="bg-olive-300" size="small">
              <h3 className="text-2xl font-bold mb-6">
                {content.account.access.title}
              </h3>
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
      <h3 className="text-2xl font-bold mb-4">{content.setup.title}</h3>
      <p>{content.setup.desc}</p>
      <Card
        className="my-4 bg-livid-400 text-black border-3 border-black"
        size="small"
      >
        <p className="font-bold">{content.setup.guide.chromium.device}</p>
        <Button
          onClick={promptInstall}
          className="bg-black text-white mt-2 disabled:cursor-not-allowed disabled:opacity-50 w-56"
          disabled={!deferredPrompt}
        >
          {content.setup.guide.chromium.step}
        </Button>
      </Card>
      <Card
        className="bg-livid-400 text-black border-3 border-black"
        size="small"
      >
        <p className="font-bold mb-1">{content.setup.guide.safari.device}</p>
        <ol className="list-decimal list-inside">
          <li>
            {content.setup.guide.safari.steps[0]}
            <span className="italic font-bold">
              {content.setup.guide.safari.steps[1]}
            </span>
            <Share className="inline" />
          </li>
          <li>
            {content.setup.guide.safari.steps[2]}
            <span className="italic font-bold">
              {content.setup.guide.safari.steps[3]}
            </span>
            <Plus className="inline" />
            {content.setup.guide.safari.steps[4]}
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
            message: content.setup.error.browser,
          }}
        />
      ) : (
        <Card className="bg-olive-300">
          <h3 className="text-2xl font-bold mb-4">
            {content.account.form.section.create.title}
          </h3>
          <p className="mb-4">{content.account.form.section.create.desc}</p>
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
  const [channel, setChannel] = useState(
    user?.channels?.[0]?.channel?.name ?? '',
  );
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
            alert(content.account.form.error.email);
            return;
          }
          setIsLoading(true);
          await login(email);
        } else {
          // Signup flow
          if (!isNicknameValid || !isEmailValid || !isChannelValid) {
            alert(content.account.form.error.misc);
            return;
          }
          setIsLoading(true);
          await subscribe({ nickname, email, channels: [channel] });
        }
      } else {
        // Update flow
        if (!isChannelValid) {
          alert(content.account.form.error.channel);
          return;
        }
        setIsLoading(true);
        await updateChannels(channel);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      alert(content.error.network);
      console.error('Submit error:', error);
    }
  }

  async function deleteAccount() {
    if (isLoading) return;
    const confirm = window.confirm(content.account.form.alert.delete);
    if (!confirm) return;
    try {
      setIsLoading(true);
      await unsubscribe();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      alert(content.error.network);
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
        <h3 className="font-bold text-xl mb-4 text-black">
          {content.account.form.section.access}
        </h3>
        {!isLogin && (
          <Input
            id="nickname"
            label={content.account.form.fields.nickname}
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
          label={content.account.form.fields.email}
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
            label={content.account.form.fields.channel}
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
                ? content.account.form.btn.login
                : content.account.form.btn.create
              : content.account.form.btn.update}
          </Button>
          {isSetup && (
            <Button
              className="text-black underline"
              onClick={toggleSetup}
              disabled={isLoading}
            >
              {!isLogin
                ? content.account.form.nav.login
                : content.account.form.nav.create}
            </Button>
          )}
          {user && (
            <Button
              className="text-red-600 border-red-600! w-56"
              onClick={deleteAccount}
              disabled={isLoading}
            >
              {content.account.form.btn.delete}
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
      alert(content.account.access.docs.form.error.message);
      return;
    }
    setIsLoading(true);
    try {
      await sendMessage.mutateAsync({
        title: 'Testnachricht',
        body: message,
        author: user!.nickname,
        channelRef: user!.channels[0].channel.name,
      });
    } catch (error) {
      alert(content.error.network);
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
        <h3 className="font-bold text-xl mb-4 text-black">
          {content.account.access.docs.title}
        </h3>
        <span className="inline-block mb-4">
          {content.account.access.docs.desc[0]}
          <a
            className="text-black underline font-medium hover:text-pink-400 font-sans"
            href={content.account.access.docs.desc[1].href}
            target="_blank"
          >
            {content.account.access.docs.desc[1].text}
            <ExternalLink size={16} className="inline ml-1 mb-0.5" />
          </a>
          {content.account.access.docs.desc[2]}
        </span>
        <div className="flex flex-col items-center">
          <Input
            id="message"
            inputStyle="mb-6 text-black bg-livid-100"
            type="text"
            placeholder={content.account.access.docs.form.fields.message}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            className="bg-black text-white w-56"
            onClick={sendTestNotification}
            disabled={isLoading}
          >
            {content.account.access.docs.form.btn.send}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TelemetrySection({ className, channelRef }: TelemetrySectionProps) {
  const { useTelemetry } = useApi();
  const { data: telemetryPerDevice = [] } = useTelemetry(channelRef);

  return telemetryPerDevice.map((telemetry) => (
    <Card
      className={`relative bg-pink-400 border-3 border-black ${className}`}
      size="small"
    >
      <h3 className="font-bold text-xl mb-4 text-black">
        {telemetry[0].device.name}
      </h3>
      <h4 className="font-bold text-l mb-2 text-black">
        {content.telemetry.moisture.title}
      </h4>
      <AreaChart
        className="mb-2"
        data={telemetry}
        valueName={content.telemetry.moisture.unit}
        dataKey={TelemetryKey.moisture}
      />
      <h4 className="font-bold text-l mb-2 text-black">
        {content.telemetry.battery.title}
      </h4>
      <AreaChart
        className=""
        data={telemetry}
        valueName={content.telemetry.battery.unit}
        dataKey={TelemetryKey.battery}
      />
    </Card>
  ));
}

type BeforeInstallPromptEvent = {
  prompt(): Promise<void>;
} & Event;

type AccountSectionProps = Readonly<{
  isSetup?: boolean;
}> &
  React.HTMLAttributes<HTMLDivElement>;

type TelemetrySectionProps = Readonly<{
  channelRef: string | null;
}> &
  React.HTMLAttributes<HTMLDivElement>;
