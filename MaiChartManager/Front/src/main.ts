import { createApp } from 'vue';
import App from './App';
import '@unocss/reset/sanitize/sanitize.css';
import 'virtual:uno.css';
import './global.sass';
import posthog from "@/plugins/posthog";
import sentry from "@/plugins/sentry";
import i18n, { loadLocaleFromBackend } from '@/locales';

// 创建应用
const app = createApp(App);

// 注册插件
app.use(i18n);
app.use(posthog);
app.use(sentry);

// 从后端加载语言设置后再挂载应用
loadLocaleFromBackend().finally(() => {
  app.mount('#app');
});
