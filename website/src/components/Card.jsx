import { Slot, component$ } from '@builder.io/qwik';

export default component$((props) => {
  return (
    <div
      {...props}
      class={[
        "font-medium text-pretty rounded-xl",
        props.size === 'large' ? 'p-6 sm:p-10' : 'p-6',
        props.class
      ]}
    >
      <Slot />
    </div>
  );
})
