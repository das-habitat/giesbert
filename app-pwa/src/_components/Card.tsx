export default function Card({ className, size = 'large', children, ...props }: CardProps) {
    return (
        <div
            {...props}
            className={`font-medium text-pretty rounded-xl ${size === 'large' ? 'p-6 sm:p-10' : 'p-6'} ${className}`}
        >
            {children}
        </div>
    );
}

type CardProps = Readonly<{
    size?: 'small' | 'large';
}> &
    React.HTMLAttributes<HTMLDivElement>;
