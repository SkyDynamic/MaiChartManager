import { defineComponent, PropType, ref, computed } from 'vue';
import { IEntryState, ISectionState } from "@/client/apiGen";
import { NButton, NFlex } from "naive-ui";
import api from "@/client/api";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    entryStates: { type: Object as PropType<Record<string, IEntryState>>, required: true },
    sectionState: { type: Object as PropType<ISectionState>, required: true },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    return () => <NFlex align="center" class="m-l-35 translate-y--3">
      {t('mod.judgeAccuracyInfo.author')}Minepig
      <NButton secondary onClick={() => api.OpenJudgeAccuracyInfoPdf()}>{t('mod.judgeAccuracyInfo.viewDoc')}</NButton>
    </NFlex>;
  },
});
