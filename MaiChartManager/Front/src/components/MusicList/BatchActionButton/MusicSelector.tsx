import { computed, defineComponent, PropType, reactive, ref } from "vue";
import { DataTableBaseColumn, DataTableColumns, NButton, NDataTable, NFlex, NInput } from "naive-ui";
import { addVersionList, b15ver, genreList, musicList, musicListAll, selectedADir, selectMusicId, version } from "@/store/refs";
import { MusicXmlWithABJacket } from "@/client/apiGen";
import JacketBox from "@/components/JacketBox";
import { GenreOption } from "@/components/GenreInput";
import { LEVEL_COLOR, LEVELS } from "@/consts";
import _ from "lodash";
import { watchDebounced } from "@vueuse/core";
import { dxdata } from '@gekichumai/dxdata';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    selectedMusicIds: Array as PropType<MusicXmlWithABJacket[]>,
    continue: { type: Function, required: true },
    cancel: { type: Function, required: true },
  },
  setup(props, { emit }) {
    const filter = ref('')
    const { t } = useI18n();

    const nameColumn = reactive({
      title: t('music.list.tableTitle'), key: 'name',
      filterOptionValue: null as string | null,
      filter: (value, row) => {
        if (!value) return true;
        value = value.toString().toLowerCase();
        return row.name!.toLowerCase().includes(value) ||
          row.artist!.toLowerCase().includes(value) ||
          row.charts!.some(chart => chart.designer?.toLowerCase().includes(value)) ||
          dxdata.songs.find(it => it.title.toLowerCase() === row.name?.toLowerCase())?.searchAcronyms?.some(acronym => acronym.toLowerCase().includes(value)) ||
          row.id!.toString().includes(value) || // match by ID
          false;

      }
    } satisfies DataTableBaseColumn<MusicXmlWithABJacket>)
    const columns = computed(() => [
      { type: 'selection' },
      { title: 'Opt', key: 'assetDir', width: '8em', filter: "default", filterOptions: _.uniq(musicListAll.value.map(it => it.assetDir!)).map(it => ({ label: it, value: it })) },
      {
        title: 'ID',
        key: 'id',
        width: '7em',
        sorter: 'default',
        filterOptions: [t('music.list.filterStandard'), t('music.list.filterDX'), t('music.list.filterUtage')].map(it => ({ label: it, value: it })),
        filter: (value, row) => {
          switch (value) {
            case t('music.list.filterStandard'):
              return row.id! < 1e4;
            case t('music.list.filterDX'):
              return row.id! >= 1e4 && row.id! < 1e5;
            case t('music.list.filterUtage'):
              return row.id! >= 1e5;
            default:
              throw new Error('Invalid filter value');
          }
        }
      },
      {
        title: t('music.list.tableCover'),
        key: 'jacket',
        render: (row) => <JacketBox info={row} upload={false} class="h-20"/>,
        width: '8rem'
      },
      nameColumn,
      {
        title: t('music.list.tableVersion'),
        key: 'version',
        width: '9.5em',
        sorter: 'default',
        filterOptions: ['B35', 'B15'].map(it => ({ label: it, value: it })),
        filter: (value, row) => {
          const type = row.version! < b15ver.value ? 'B35' : 'B15';
          return value === type;
        }
      },
      {
        title: t('music.list.tableAddVersion'),
        key: 'addVersionId',
        render: (row) => <GenreOption genre={addVersionList.value.find(it => it.id === row.addVersionId)}/>,
        filter: (value, row) => row.addVersionId === value,
        filterOptions: addVersionList.value.map(it => ({ label: it.genreName!, value: it.id! }))
      },
      {
        title: t('music.list.tableGenre'),
        key: 'genreId',
        render: (row) => <GenreOption genre={genreList.value.find(it => it.id === row.genreId)}/>,
        filter: (value, row) => row.genreId === value,
        filterOptions: genreList.value.map(it => ({ label: it.genreName!, value: it.id! }))
      },
      {
        title: t('music.list.tableCharts'),
        key: 'charts',
        render: (row) => <NFlex class="pt-1 text-sm" size="small">
          {
            (row.charts || []).map((chart, index) =>
              chart.enable && <div key={index} class="c-white rounded-full px-2" style={{ backgroundColor: LEVEL_COLOR[index!] }}>{LEVELS[chart.levelId!]}</div>)
          }
        </NFlex>,
        width: '20em',
        filterOptions: [t('music.list.filterBasic'), t('music.list.filterAdvanced'), t('music.list.filterExpert'), t('music.list.filterMaster'), t('music.list.filterReMaster')].map((label, value) => ({ label, value })),
        filter: (value, row) => row.charts![value as number].enable!
      },
      {
        title: t('music.list.tableJump'),
        key: 'jump',
        width: '5em',
        render: (row) => <NButton quaternary class="p-2" onClick={() => {
          selectedADir.value = row.assetDir!;
          selectMusicId.value = row.id!;
          props.cancel();
        }}>
          <span class="i-tabler:external-link c-neutral-5"/>
        </NButton>,
      },
    ] satisfies DataTableColumns<MusicXmlWithABJacket>)

    watchDebounced(
      filter,
      () => {
        nameColumn.filterOptionValue = filter.value
      },
      { debounce: 500 },
    )

    const selectedMusicIds = computed<string[]>({
      get: () => props.selectedMusicIds!.map(it => `${it.assetDir}:${it.id}`),
      set: (value) => emit('update:selectedMusicIds', value.map(it => {
        const [assetDir, id] = it.split(':');
        return musicListAll.value.find(music => music.assetDir === assetDir && music.id === Number(id))!;
      })),
    });

    return () => <NFlex vertical size="large">
      {/*<NFlex>*/}
      {/*  <NButton onClick={() => {*/}
      {/*    emit('update:selectedMusicIds', musicListAll.value.filter(it => !props.selectedMusicIds!.includes(it)));*/}
      {/*  }}>反选</NButton>*/}
      {/*</NFlex>*/}
      <NInput placeholder={t('music.list.searchPlaceholder')} v-model:value={filter.value}/>
      <NDataTable
        columns={columns.value}
        data={musicListAll.value}
        virtualScroll
        maxHeight="60vh"
        class="min-h-60vh"
        minRowHeight={104}
        rowKey={row => `${row.assetDir}:${row.id}`}
        v-model:checkedRowKeys={selectedMusicIds.value}
      />
      <NFlex justify="end">
        <NButton onClick={() => props.continue()} disabled={!selectedMusicIds.value.length}>{t('purchase.continue')}</NButton>
      </NFlex>
    </NFlex>;
  }
})
