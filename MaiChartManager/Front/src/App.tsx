import { computed, defineComponent } from 'vue';
import { dateZhCN, dateZhTW, dateEnUS, NConfigProvider, NDialogProvider, NMessageProvider, NNotificationProvider, zhCN, zhTW, enUS } from 'naive-ui';
import FeedbackErrorDialog from "@/components/FeedbackErrorDialog";
import NeedPurchaseDialog from "@/components/NeedPurchaseDialog";
import Index from "@/views/Index";
import StartupErrorDialog from "@/components/StartupErrorDialog";
import { locale } from '@/locales';

export default defineComponent({
  setup() {
    // 根据当前语言动态设置 Naive UI 的 locale
    const naiveLocale = computed(() => {
      switch (locale.value) {
        case 'zh':
          return zhCN;
        case 'zh-TW':
          return zhTW;
        case 'en':
          return enUS;
        default:
          return zhCN;
      }
    });

    const naiveDateLocale = computed(() => {
      switch (locale.value) {
        case 'zh':
          return dateZhCN;
        case 'zh-TW':
          return dateZhTW;
        case 'en':
          return dateEnUS;
        default:
          return dateZhCN;
      }
    });

    return () => (
      <NConfigProvider locale={naiveLocale.value} dateLocale={naiveDateLocale.value}>
        <NNotificationProvider>
          <NDialogProvider>
            <NMessageProvider>
              <Index/>
              <FeedbackErrorDialog/>
              <NeedPurchaseDialog/>
              <StartupErrorDialog/>
            </NMessageProvider>
          </NDialogProvider>
        </NNotificationProvider>
      </NConfigProvider>
    );
  },
});
