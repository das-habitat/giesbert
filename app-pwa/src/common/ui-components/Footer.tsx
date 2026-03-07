import { ExternalLink } from 'lucide-react';
import { version } from '../../../package.json';

const content = {
  version: `App Version v${version}`,
  habitat: {
    href: 'https://das-habitat.de',
    text: 'Das Habitat Augsburg e.V.',
  },
} as const;

export default function Footer() {
  return (
    <footer className="my-16 text-center">
      <span>
        {`${content.version} / `}
        <a
          className="text-black underline font-medium hover:text-pink-400 font-sans"
          href={content.habitat.href}
          target="_blank"
        >
          {content.habitat.text}
          <ExternalLink size={16} className="inline ml-1 mb-0.5" />
        </a>
      </span>
    </footer>
  );
}
