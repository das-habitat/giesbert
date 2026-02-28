export default function Header({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-center gap-5 ${className}`}
    >
      <div>
        <img
          src="/apps/notifications/icon.svg"
          alt="P15Ns Logo"
          width={72}
          height={72}
          className="mt-1.5 rounded-xl shrink-0"
        />
      </div>
      <div>
        <h1 className="text-4xl font-bold text-livid-700">
          {content.long}
          <br />
          <span className="font-medium">[{content.short}]</span>
        </h1>
      </div>
    </div>
  );
}

const content = {
  long: 'Sprechender Blumentopf',
  short: 'giesbert',
};
