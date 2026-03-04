import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="my-16 text-center">
      <span>
        App Version 0.1.0 /{' '}
        <a
          className="text-black underline font-medium hover:text-pink-400 font-sans"
          href="https://das-habitat.de"
          target="_blank"
        >
          Das Habitat Augsburg e.V.<ExternalLink size={16} className="inline ml-1 mb-0.5" />
        </a>
      </span>
    </footer>
  );
}
