import { defineComponent, onMounted, ref } from "vue";
import { CheckConflictEntry } from "@/client/apiGen";
import api from "@/client/api";
import { DataTableColumns, NButton, NDataTable, NFlex } from "naive-ui";
import { globalCapture } from "@/store/refs";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    dir: {type: String, required: true}
  },
  setup(props) {
    const data = ref<(CheckConflictEntry & { key: number })[]>([]);
    const selectedIds = ref<number[]>([]);
    const load = ref(true);
    const { t } = useI18n();
    
    const columns: DataTableColumns<CheckConflictEntry> = [
      {type: 'selection'},
      {title: t('assetDir.conflict.musicId'), key: 'musicId'},
      {title: t('assetDir.conflict.musicName'), key: 'musicName'},
      {title: t('assetDir.conflict.lowerDir'), key: 'lowerDir'},
      {title: t('assetDir.conflict.upperDir'), key: 'upperDir'},
      {title: t('assetDir.conflict.fileName'), key: 'fileName'},
    ];

    const update = async () => {
      selectedIds.value = [];
      try {
        const req = await api.CheckConflict(props.dir);
        data.value = req.data.map((it, idx) => ({...it, key: idx}));
        load.value = false;
      } catch (e) {
        globalCapture(e, t('assetDir.conflict.checkError'));
      }
    }

    onMounted(update)

    const requestDelete = async () => {
      load.value = true;
      try {
        const req = selectedIds.value.map(it => ({
          type: data.value[it].type,
          assetDir: data.value[it].upperDir,
          fileName: data.value[it].fileName,
        }));
        selectedIds.value = [];
        await api.DeleteAssets(req);
      } catch (e) {
        globalCapture(e, t('assetDir.conflict.deleteError'));
      }
      update();
    }

    return () => <NFlex size="large">
      <NButton onClick={requestDelete} disabled={!selectedIds.value.length}>{t('assetDir.conflict.deleteSelected')}</NButton>
      <NDataTable
        columns={columns}
        data={data.value}
        onUpdateCheckedRowKeys={keys => selectedIds.value = keys as number[]}
        loading={load.value}
        max-height="70vh"
      >{{
        empty: () => <div class="c-neutral">{t('assetDir.conflict.noConflict')}</div>,
      }}</NDataTable>
    </NFlex>;
  }
})
