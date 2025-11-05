import { defineComponent, ref } from "vue";
import api from "@/client/api";
import { globalCapture, selectedADir, selectMusicId, updateMusicList } from "@/store/refs";
import { NButton, useDialog } from "naive-ui";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup() {
    const deleteLoading = ref(false);
    const deleteConfirm = ref(false);
    const dialog = useDialog();
    const { t } = useI18n();

    const del = async () => {
      if (!deleteConfirm.value) {
        deleteConfirm.value = true;
        return;
      }
      deleteConfirm.value = false;
      deleteLoading.value = true;
      try {
        const res = await api.DeleteMusic(selectMusicId.value, selectedADir.value);
        if (res.error) {
          const error = res.error as any;
          dialog.warning({ title: t('music.delete.deleteFailed'), content: error.message || error });
          return;
        }
      } catch (e) {
        globalCapture(e, t('music.delete.deleteError'))
      }
      selectMusicId.value = 0;
      updateMusicList();
    }


    return () => <NButton secondary onClick={del} loading={deleteLoading.value} type={deleteConfirm.value ? 'error' : 'default'}
      // @ts-ignore
                          onMouseleave={() => deleteConfirm.value = false}>
      {deleteConfirm.value ? t('music.delete.confirm') : t('common.delete')}
    </NButton>;
  }
});
