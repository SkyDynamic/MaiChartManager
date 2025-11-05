import { computed, defineComponent, PropType, ref } from "vue";
import { NButton, NCheckbox, NDropdown, NFlex, NList, NListItem, NModal, NScrollbar } from "naive-ui";
import GenreDisplay from "./GenreDisplay";
import { addVersionList, genreList } from "@/store/refs";
import { useStorage } from "@vueuse/core";
import CreateButton from "@/components/GenreVersionManager/CreateButton";
import { useI18n } from 'vue-i18n';

export enum EDIT_TYPE {
  None,
  Genre,
  Version,
}

export default defineComponent({
  setup(props) {
    const show = ref(EDIT_TYPE.None);
    const showBuiltIn = useStorage('showBuiltInGenre', true);
    const { t } = useI18n();
    const text = computed(() => show.value === EDIT_TYPE.Genre ? t('genre.title') : t('version.title'));
    const editingId = ref(-1);
    
    const options = [
      {label: t('genre.management'), key: EDIT_TYPE.Genre},
      {label: t('version.management'), key: EDIT_TYPE.Version},
    ];

    const list = computed(() => {
      const data = show.value === EDIT_TYPE.Genre ? genreList : addVersionList;
      return showBuiltIn.value ? data.value : data.value.filter(it => it.assetDir !== 'A000');
    });

    const handleSelect = (key: EDIT_TYPE) => {
      show.value = key;
    }

    return () => (
      <NDropdown options={options} trigger="click" onSelect={handleSelect} placement="bottom-end">
        <NButton secondary class="pr-1">
          {t('genre.categoryManagement')}
          <span class="i-mdi-arrow-down-drop text-6 translate-y-.25"/>

          <NModal
            preset="card"
            class="w-80em max-w-100dvw"
            title={`${text.value}${t('common.management')}`}
            show={show.value !== EDIT_TYPE.None}
            onUpdateShow={() => show.value = EDIT_TYPE.None}
          >
            <NFlex vertical>
              <NFlex align="center">
                <NCheckbox v-model:checked={showBuiltIn.value}>{t('genre.showBuiltIn')}</NCheckbox>
                <CreateButton setEditId={id => editingId.value = id} type={show.value}/>
              </NFlex>
              <NScrollbar class="h-80vh">
                <NList>
                  {list.value.map(it => <NListItem key={it.id}>
                    <GenreDisplay genre={it} type={show.value} class={`${editingId.value >= 0 && editingId.value !== it.id && 'op-30'}`} disabled={editingId.value >= 0 && editingId.value !== it.id}
                                  style={{transition: 'opacity 0.3s'}}
                                  editing={editingId.value === it.id} setEdit={isEdit => editingId.value = isEdit ? it.id! : -1}/>
                  </NListItem>)}
                </NList>
              </NScrollbar>
            </NFlex>
          </NModal>
        </NButton>
      </NDropdown>
    );
  },
})
