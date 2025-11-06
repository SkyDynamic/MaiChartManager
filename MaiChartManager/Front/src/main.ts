import { createApp } from 'vue';
import App from './App';
import '@unocss/reset/sanitize/sanitize.css';
import 'virtual:uno.css';
import './global.sass';
import posthog from "@/plugins/posthog";
import sentry from "@/plugins/sentry";
import i18n from '@/locales';

createApp(App)
  .use(i18n)
  .use(posthog)
  .use(sentry)
  .mount('#app');
