import { defineComponent, PropType, ref } from "vue";
import { MusicXmlWithABJacket } from "@/client/apiGen";
import { NButton, NFlex, NPopover, NRadio, NRadioGroup, NSelect, useMessage, useNotification } from "naive-ui";
import { STEP } from "@/components/MusicList/BatchActionButton/index";
import api from "@/client/api";
import { showNeedPurchaseDialog, updateMusicList, version } from "@/store/refs";
import remoteExport from "@/components/MusicList/BatchActionButton/remoteExport";
import TransitionVertical from "@/components/TransitionVertical.vue";
import { useStorage } from "@vueuse/core";
import { useI18n } from 'vue-i18n';

export enum OPTIONS {
  None,
  EditProps,
  Delete,
  CreateNewOpt,
  CreateNewOptCompatible,
  ConvertToMaidata,
  ConvertToMaidataIgnoreVideo,
  CreateNewOptMa2_103,
}

export enum MAIDATA_SUBDIR {
  None,
  Genre,
  Version,
}

export default defineComponent({
  props: {
    selectedMusic: Array as PropType<MusicXmlWithABJacket[]>,
    continue: {type: Function, required: true},
  },
  setup(props) {
    const selectedOption = ref(OPTIONS.None);
    const selectedMaidataSubdir = useStorage('selectedMaidataSubdir', MAIDATA_SUBDIR.None);
    const load = ref(false);
    const notify = useNotification();
    const { t } = useI18n();

    const proceed = async () => {
      switch (selectedOption.value) {
        case OPTIONS.EditProps:
          props.continue(STEP.EditProps);
          break;
        case OPTIONS.Delete:
          load.value = true;
          await api.BatchDeleteMusic(props.selectedMusic!);
          await updateMusicList();
          props.continue(STEP.None);
          break;
        case OPTIONS.CreateNewOpt:
        case OPTIONS.CreateNewOptCompatible:
          if (location.hostname === 'mcm.invalid') {
            props.continue(STEP.None);
            await api.RequestCopyTo({music: props.selectedMusic, removeEvents: selectedOption.value === OPTIONS.CreateNewOptCompatible, legacyFormat: false});
            break;
          }
        case OPTIONS.CreateNewOptMa2_103:
          if (location.hostname === 'mcm.invalid') {
            props.continue(STEP.None);
            await api.RequestCopyTo({music: props.selectedMusic, removeEvents: true, legacyFormat: true});
            break;
          }
        case OPTIONS.ConvertToMaidata:
        case OPTIONS.ConvertToMaidataIgnoreVideo:
          if (version.value?.license !== 'Active') {
            showNeedPurchaseDialog.value = true
            break;
          }
          remoteExport(props.continue as any, props.selectedMusic!, selectedOption.value, notify, selectedMaidataSubdir.value);
          break;
      }
    }

    return () => <NFlex vertical>
      <NRadioGroup v-model:value={selectedOption.value} disabled={load.value}>
        <NFlex vertical>
          {
            props.selectedMusic?.some(it => it.assetDir === 'A000') ?
              <>
                <NPopover trigger="hover" placement="top-start">{{
                  trigger: () =>
                    <NRadio disabled>
                      {t('music.batch.editProperties')}
                    </NRadio>,
                  default: () => t('music.batch.selectedA000Warning')
                }}</NPopover>
                <NPopover trigger="hover" placement="top-start">{{
                  trigger: () =>
                    <NRadio disabled>
                      {t('common.delete')}
                    </NRadio>,
                  default: () => t('music.batch.selectedA000Warning')
                }}</NPopover>
              </> :
              <>
                <NRadio value={OPTIONS.EditProps}>
                  {t('music.batch.editProperties')}
                </NRadio>
                <NRadio value={OPTIONS.Delete}>
                  {t('common.delete')}
                </NRadio>
              </>
          }
          <NRadio value={OPTIONS.CreateNewOpt}>
            {t('music.batch.exportOriginal')}
          </NRadio>
          <NRadio value={OPTIONS.CreateNewOptCompatible}>
            {t('music.batch.exportPreserveFormat')}
          </NRadio>
          <NRadio value={OPTIONS.CreateNewOptMa2_103}>
            {t('music.batch.exportMa2Format')}
          </NRadio>
          <NRadio value={OPTIONS.ConvertToMaidata}>
            {t('music.batch.convertToMaidata')}
          </NRadio>
          <NRadio value={OPTIONS.ConvertToMaidataIgnoreVideo}>
            {t('music.batch.convertToMaidataNoVideo')}
          </NRadio>

          <TransitionVertical>
            {(selectedOption.value === OPTIONS.ConvertToMaidata || selectedOption.value === OPTIONS.ConvertToMaidataIgnoreVideo) &&
              <NSelect v-model:value={selectedMaidataSubdir.value} options={[{label: t('music.batch.subdirOption.none'), value: MAIDATA_SUBDIR.None}, {label: t('music.batch.subdirOption.genre'), value: MAIDATA_SUBDIR.Genre}, {label: t('music.batch.subdirOption.version'), value: MAIDATA_SUBDIR.Version}]}/>}
          </TransitionVertical>
        </NFlex>
      </NRadioGroup>
      <NFlex justify="end">
        <NButton onClick={() => props.continue(STEP.Select)} disabled={load.value}>{t('common.previous')}</NButton>
        <NButton onClick={proceed} loading={load.value} disabled={selectedOption.value === OPTIONS.None}>{t('purchase.continue')}</NButton>
      </NFlex>
    </NFlex>;
  }
})
