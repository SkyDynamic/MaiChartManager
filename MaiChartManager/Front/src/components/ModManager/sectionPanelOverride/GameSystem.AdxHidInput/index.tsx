import { defineComponent, PropType, ref, computed, h } from 'vue';
import { IEntryState, ISectionState } from "@/client/apiGen";
import { NButton, NFlex, NFormItem, NGrid, NGridItem, NSelect } from "naive-ui";
import api from "@/client/api";
import { modInfo, updateModInfo } from "@/store/refs";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    entryStates: { type: Object as PropType<Record<string, IEntryState>>, required: true },
    sectionState: { type: Object as PropType<ISectionState>, required: true },
  },
  setup(props, { emit }) {
    const load = ref(false)
    const { t } = useI18n();
    
    const options = [
      { label: t('mod.adxHid.disabled'), value: 'None' },
      { label: t('mod.adxHid.select1P'), value: 'Select1P' },
      { label: t('mod.adxHid.select2P'), value: 'Select2P' },
      { label: t('mod.adxHid.service'), value: 'Service' },
      { label: t('mod.adxHid.test'), value: 'Test' },
    ];

    const del = async () => {
      load.value = true
      await api.DeleteHidConflict();
      await updateModInfo();
      load.value = false
    }

    return () => <NFlex vertical>
      {modInfo.value?.isHidConflictExist ? <NFlex align="center" class="m-l-35">
          <span class="c-orange">{t('mod.adxHid.conflictDetected')}</span>
          <NButton secondary onClick={del} loading={load.value}>{t('mod.adxHid.oneClickDelete')}</NButton>
        </NFlex>
        : <NFlex align="center" class="m-l-35">
          <span class="c-green-6">{t('mod.adxHid.noConflict')}</span>
        </NFlex>}
      <NGrid cols="1 500:2" yGap="12px">
        <NGridItem>
          <NFlex vertical>
            <NFormItem label={t('mod.adxHid.button1')} labelPlacement="left" labelWidth="10em" showFeedback={false}>
              <NFlex vertical class="w-full ws-pre-line">
                <NSelect v-model:value={props.entryStates['GameSystem.AdxHidInput.Button1'].value} options={options}/>
                {t('mod.adxHid.button1Desc')}
              </NFlex>
            </NFormItem>
            <NFormItem label={t('mod.adxHid.button2')} labelPlacement="left" labelWidth="10em" showFeedback={false}>
              <NFlex vertical class="w-full ws-pre-line">
                <NSelect v-model:value={props.entryStates['GameSystem.AdxHidInput.Button2'].value} options={options}/>
                {t('mod.adxHid.button2Desc')}
              </NFlex>
            </NFormItem>
          </NFlex>
        </NGridItem>
        <NGridItem>
          <NFlex vertical>
            <NFormItem label={t('mod.adxHid.button3')} labelPlacement="left" labelWidth="10em" showFeedback={false}>
              <NFlex vertical class="w-full ws-pre-line">
                <NSelect v-model:value={props.entryStates['GameSystem.AdxHidInput.Button3'].value} options={options}/>
                {t('mod.adxHid.button3Desc')}
              </NFlex>
            </NFormItem>
            <NFormItem label={t('mod.adxHid.button4')} labelPlacement="left" labelWidth="10em" showFeedback={false}>
              <NFlex vertical class="w-full ws-pre-line">
                <NSelect v-model:value={props.entryStates['GameSystem.AdxHidInput.Button4'].value} options={options}/>
                {t('mod.adxHid.button4Desc')}
              </NFlex>
            </NFormItem>
          </NFlex>
        </NGridItem>
      </NGrid>
    </NFlex>
  },
});
