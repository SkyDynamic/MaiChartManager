import { computed, defineComponent, PropType } from "vue";
import { GetAssetsDirsResult } from "@/client/apiGen";
import api from "@/client/api";
import { updateAssetDirs } from "@/store/refs";
import { NButton } from "naive-ui";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    dir: {type: Object as PropType<GetAssetsDirsResult>, required: true}
  },
  setup(props) {
    const { t } = useI18n();
    const isOfficialChart = computed(() => props.dir.subFiles!.some(it => it === 'OfficialChartsMark.txt'));
    const toggleSelfMadeChart = async () => {
      if (isOfficialChart.value) {
        await api.DeleteAssetDirTxt({
          dirName: props.dir.dirName,
          fileName: 'OfficialChartsMark.txt'
        });
      } else {
        await api.PutAssetDirTxtValue({
          dirName: props.dir.dirName,
          fileName: 'OfficialChartsMark.txt',
          content: t('assetDir.aquaMaiMarkDesc')
        });
      }
      await updateAssetDirs();
    }

    return () => <NButton secondary onClick={toggleSelfMadeChart}>
      <span class="i-material-symbols-repeat text-lg m-r-1"/>
      {t('assetDir.storing')}
      {isOfficialChart.value ? t('assetDir.officialChart') : t('assetDir.customChart')}
    </NButton>;
  }
})
