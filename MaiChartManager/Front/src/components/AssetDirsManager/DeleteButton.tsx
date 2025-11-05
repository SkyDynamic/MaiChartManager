import { defineComponent, PropType, ref } from "vue";
import api from "@/client/api";
import { selectedADir, selectMusicId, updateAssetDirs, updateMusicList } from "@/store/refs";
import { NButton, useDialog } from "naive-ui";
import { GetAssetsDirsResult } from "@/client/apiGen";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    dir: {type: Object as PropType<GetAssetsDirsResult>, required: true}
  },
  setup(props) {
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
      const res = await api.DeleteAssetDir(props.dir.dirName!);
      if (res.error) {
        const error = res.error as any;
        dialog.warning({title: t('error.deleteFailed'), content: error.message || error});
        return;
      }
      if (selectedADir.value === props.dir.dirName) {
        selectedADir.value = 'A000';
        selectMusicId.value = 0;
        await updateMusicList();
      }
      await updateAssetDirs();
    }


    return () => <NButton secondary onClick={del} loading={deleteLoading.value} type={deleteConfirm.value ? 'error' : 'default'}
      // @ts-ignore
                          onMouseleave={() => deleteConfirm.value = false}>
      {deleteConfirm.value ? t('common.confirm') : t('common.delete')}
    </NButton>;
  }
});
