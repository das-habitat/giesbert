import { Slot, component$ } from '@builder.io/qwik';

export default component$((props) => {
  return (
    <a href={props.href} target="_blank">
      <button
        class={["text-md rounded-full px-5 py-1 font-bold cursor-pointer border-3 border-transparent", props.class]}
        role="link"
      >
        <Slot />
      </button>
    </a>
  )
})
