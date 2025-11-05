import { defineComponent } from "vue";
import { NButton, useDialog } from "naive-ui";
import api from "@/client/api";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup(props) {
    const dialog = useDialog();
    const { t } = useI18n();

    const onClick = () => {
      if (location.hostname !== 'mcm.invalid') {
        dialog.info({
          title: t('message.notice'),
          content: t('purchase.needServerSide'),
          positiveText: t('purchase.continue'),
          negativeText: t('common.cancel'),
          onPositiveClick: () => {
            api.RequestPurchase()
          }
        });
      } else {
        api.RequestPurchase()
      }
    }

    return () => <NButton secondary onClick={onClick}>
      <span class="i-fluent-store-microsoft-16-filled text-lg mr-2"/>
      Microsoft Store
    </NButton>;
  }
})
