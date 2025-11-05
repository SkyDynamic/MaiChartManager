import { computed, defineComponent, ref, watch } from "vue";
import { DialogOptions, NButton, NFlex, NForm, NFormItem, NInputNumber, NModal, useDialog } from "naive-ui";
import { globalCapture, musicList, selectedADir, selectMusicId, updateAll } from "@/store/refs";
import api from "@/client/api";
import MusicIdConflictNotifier from "@/components/MusicIdConflictNotifier";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    show: Boolean,
  },
  setup(props, {emit}) {
    const show = computed({
      get: () => props.show,
      set: (val) => emit('update:show', val)
    })
    const id = ref(0);
    watch(() => show.value, val => {
      if (!val) return;
      id.value = selectMusicId.value;
    })
    const dialog = useDialog();
    const loading = ref(false);
    const { t } = useI18n();

    const awaitDialog = (options: DialogOptions) => new Promise<boolean>(resolve => {
      dialog.create({
        ...options,
        onPositiveClick: () => resolve(true),
        onNegativeClick: () => resolve(false),
      });
    })

    const save = async () => {
      if (musicList.value.find(it => it.id === id.value)) {
        const choice = await awaitDialog({
          type: 'warning',
          title: t('copy.idExists'),
          content: t('copy.idExistsConfirm'),
          positiveText: t('copy.overwrite'),
          negativeText: t('common.cancel'),
        });
        if (!choice) return;
      }
      if (Math.floor(id.value / 1e4) !== Math.floor(selectMusicId.value / 1e4)) {
        const choice = await awaitDialog({
          type: 'warning',
          title: t('copy.idTypeChangeWarningTitle'),
          content: t('copy.idTypeChangeWarning'),
          positiveText: t('purchase.continue'),
          negativeText: t('common.cancel'),
        });
        if (!choice) return;
      }
      try {
        loading.value = true;
        await api.ModifyId(selectMusicId.value, selectedADir.value, id.value);
        await updateAll();
        selectMusicId.value = id.value;
        show.value = false;
      } catch (e) {
        globalCapture(e, t('copy.changeIdError'));
      } finally {
        loading.value = false;
      }
    }

    return () => <NModal
      preset="card"
      class="w-[min(30vw,25em)]"
      title={t('copy.changeId')}
      v-model:show={show.value}
    >{{
      default: () => <NForm label-placement="left" labelWidth="5em" showFeedback={false} disabled={loading.value}>
        <NFlex vertical size="large">
          <NFormItem label={t('copy.newId')}>
            <NFlex align="center" wrap={false}>
              <NInputNumber v-model:value={id.value} class="w-full" min={1} max={999999}/>
              <MusicIdConflictNotifier id={id.value}/>
            </NFlex>
          </NFormItem>
        </NFlex>
      </NForm>,
      footer: () => <NFlex justify="end">
        <NButton onClick={save} disabled={id.value === selectMusicId.value} loading={loading.value}>{t('common.confirm')}</NButton>
      </NFlex>
    }}</NModal>;
  }
})
