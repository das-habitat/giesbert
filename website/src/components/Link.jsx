import { Slot, component$ } from '@builder.io/qwik';

export default component$((props) => {
    return (
        <a class="text-black underline font-medium hover:text-pink-500 font-sans" href={props.href} target="_blank">
            <Slot />
        </a>
    )
})
