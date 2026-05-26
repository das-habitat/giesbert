import Card from './Card'

export default function CollapseCard({ children, className, title, size = 'large', }: CollapseCardProps) {
    return (
        // <Card tabIndex={0} className={`collapse collapse-arrow ${className}`} size={size}>
        //     <input type="checkbox" />
        //     <div className="collapse-title after:start-5 after:end-auto pe-4 ps-12 font-bold text-xl ">{title}</div>
        //     <div className="collapse-content">
        //         {children}
        //     </div>
        // </Card>
        <Card className={`collapse collapse-arrow ${className}`} size={size}>
            <input type="checkbox" />
            <div className="collapse-title after:start-5 after:end-auto pe-4 ps-12 font-bold text-xl">{title}</div>
            <div className="collapse-content">
                {children}
            </div>
        </Card>
    )
}

type CollapseCardProps = Readonly<{
    title: string;
    size?: 'small' | 'large';
}> &
    React.HTMLAttributes<HTMLDivElement>;
