import '@builder.io/qwik/qwikloader.js'
import { render } from '@builder.io/qwik'
import '@fontsource-variable/noto-sans';
import './index.css'
import { App } from './app.jsx'

render(document.getElementById('app'), <App />)
