import { mount } from 'svelte';

import App from './app/App.svelte';
import './app/base.css';

const target = document.querySelector<HTMLElement>('#app');
if (!target) throw new Error('Missing #app mount target.');

mount(App, { target });
