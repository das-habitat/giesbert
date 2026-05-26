import { component$ } from '@builder.io/qwik';
import { Link } from '../components';

const content = {
  text: <>Ein Projekt von{' '}</>,
  link: {
    href: 'https://das-habitat.de',
    text: 'Das Habitat Augsburg e.V.',
  }
}

export default component$((props) => {
  return (
    <footer class="my-16 text-center">
      {content.text}
      <Link href={content.link.href}>
        {content.link.text}
      </Link>
    </footer>
  );
})
