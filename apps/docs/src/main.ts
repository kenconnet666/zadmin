import { mount } from 'svelte';

import App from './app/App.svelte';
import './app/base.css';
import { startDocsRouter } from './framework/router-runtime.svelte.js';

const target = document.querySelector<HTMLElement>('#app');
if (!target) throw new Error('Missing #app mount target.');

const stopRouter = startDocsRouter(window);
import.meta.hot?.dispose(stopRouter);
mount(App, { target });
