const content = {
  long: 'Sprechender Blumentopf',
  short: 'giesbert',
} as const;

export default function Header({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-center gap-5 ${className}`}
    >
      <div>
        <img
          src="/icon.svg"
          alt="giesbert logo"
          width={72}
          height={72}
          className="mt-1.5 rounded-xl shrink-0"
        />
      </div>
      <div>
        <h1 className="text-4xl font-bold text-olive-700 text-center sm:text-left">
          {content.long}
          <br />
          <span className="font-medium">[{content.short}]</span>
        </h1>
      </div>
    </div>
  );
}
