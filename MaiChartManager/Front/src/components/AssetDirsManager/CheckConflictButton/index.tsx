import { defineComponent, ref } from "vue";
import { NButton, NModal } from "naive-ui";
import CheckContent from "@/components/AssetDirsManager/CheckConflictButton/CheckContent";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    dir: {type: String, required: true}
  },
  setup(props) {
    const show = ref(false);
    const { t } = useI18n();

    return () => <NButton secondary onClick={() => show.value = true}>
      {t('assetDir.checkConflict')}

      <NModal
        preset="card"
        class="w-[min(60vw,60em)]"
        title={t('assetDir.conflictCheck')}
        v-model:show={show.value}
      >
        <CheckContent dir={props.dir}/>
      </NModal>
    </NButton>;
  }
})
