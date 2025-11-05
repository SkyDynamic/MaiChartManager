import { computed, defineComponent } from "vue";
import { NButton, NFlex, NModal } from "naive-ui";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    show: {type: Boolean, required: true},
    closeModal: {type: Function, required: true}
  },
  setup(props, {emit}) {
    const { t } = useI18n();
    
    const show = computed({
      get: () => props.show,
      set: (val) => props.closeModal()
    })
    return () => <NModal
      preset="card"
      class="w-[min(35vw,45em)]"
      title={t('mod.notInstalledTitle')}
      v-model:show={show.value}
    >{{
      default: () => t('mod.notInstalledWarningMessage'),
      footer: () => <NFlex justify="end">
        <NButton onClick={() => props.closeModal(true)}>{t('mod.dontShowAgain')}</NButton>
      </NFlex>
    }}</NModal>;
  }
})
