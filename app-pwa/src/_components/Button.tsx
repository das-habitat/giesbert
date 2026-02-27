export default function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`text-sm rounded-full px-5 py-1 font-bold cursor-pointer border-3 border-transparent ${className}`}
            type="button"
        >
            {children}
        </button>
    );
}
