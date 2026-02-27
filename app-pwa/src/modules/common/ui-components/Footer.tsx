import { Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="my-16 text-center">
            <a
                className="text-livid-800 underline font-medium hover:text-red-400 font-sans"
                href="https://github.com/schwamic/digimunea/tree/main/src/app/apps"
                target="_blank"
            >
                P15Ns (v0.1.5) on Github <Github className="inline ml-1" />
            </a>
        </footer>
    );
}
