import { component$ } from '@builder.io/qwik';

const content = {
  title: 'Sprechender Blumentopf',
  nickname: 'giesbert',
};

export default component$((props) => {
  return (
    <div class="flex flex-col sm:flex-row items-center justify-center gap-5 my-24">
      <div>
        <img
          src="/icon.svg"
          alt="giesbert logo"
          width={72}
          height={72}
          class="mt-1.5 rounded-xl shrink-0"
        />
      </div>
      <div>
        <h1 class="text-4xl font-bold text-olive-700 text-center sm:text-left">
          {content.title}
          <br />
          <span class="font-medium">[{content.nickname}]</span>
        </h1>
      </div>
    </div>
  );
})
