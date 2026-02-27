export default function Input({ inputStyle, labelStyle, label, id, ...props }: InputProps) {
    return (
        <>
            {label && (
                <label htmlFor={id} className={`text-sm ${labelStyle}`}>
                    {label}
                </label>
            )}
            <input {...props} id={id} className={`rounded-full px-4 py-1 w-full ${inputStyle}`} />
        </>
    );
}

type InputProps = Readonly<{
    inputStyle: string;
    labelStyle?: string;
    label?: string;
}> &
    React.InputHTMLAttributes<HTMLInputElement>;
