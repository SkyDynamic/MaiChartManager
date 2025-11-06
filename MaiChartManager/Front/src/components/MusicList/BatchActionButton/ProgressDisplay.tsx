import { defineComponent, ref } from "vue";
import { NFlex, NProgress } from "naive-ui";
import { useI18n } from 'vue-i18n';

export const progressCurrent = ref(0);
export const progressAll = ref(100);
export const currentProcessItem = ref('');

export default defineComponent({
  setup(props) {
    const { t } = useI18n();
    return () => <NFlex vertical>
      <div>{t('music.batch.currentProgress')}：{progressCurrent.value}/{progressAll.value}</div>
      <div>{t('music.batch.currentProcessing')}：{currentProcessItem.value}</div>
      <NProgress
        type="line"
        status="success"
        percentage={Math.floor(progressCurrent.value / progressAll.value * 100)}
        indicator-placement="inside"
        processing
      />
    </NFlex>;
  }
})
