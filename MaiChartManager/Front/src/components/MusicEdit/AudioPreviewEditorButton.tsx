import { NButton, NFlex, NFormItem, NInput, NModal } from "naive-ui";
import { defineComponent, ref } from "vue";
import AudioPreviewEditor from "@/components/MusicEdit/AudioPreviewEditor";
import { showNeedPurchaseDialog, version } from "@/store/refs";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    disabled: Boolean,
  },
  setup(props) {
    const show = ref(false)
    const { t } = useI18n();

    const handleClick = () => {
      if (version.value?.license !== 'Active') {
        showNeedPurchaseDialog.value = true
        return
      }
      show.value = true
    }

    return () => <NButton secondary onClick={handleClick} disabled={props.disabled}>
      {t('music.edit.editPreview')}

      <NModal
        preset="card"
        class="w-[min(60vw,80em)]"
        title={t('music.edit.editPreview')}
        v-model:show={show.value}
        maskClosable={false}
        closeOnEsc={false}
        closable={false}
      >{{
        default: () =>
          <AudioPreviewEditor closeModel={() => show.value = false}/>,
      }}</NModal>
    </NButton>;
  }
})
