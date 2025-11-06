import {defineComponent, h, PropType} from "vue";
import {NFlex, NFormItem, NGrid, NGridItem, NSelect, NSwitch} from "naive-ui";
import {KeyCodeID} from "@/components/ModManager/types/KeyCodeID";
import {IEntryState, ISectionState, Section} from "@/client/apiGen";
import ConfigEntry from "../../ConfigEntry";
import { useI18n } from 'vue-i18n';

const options = Object.entries(KeyCodeID).map(([key, value]) => ({label: key, value}))

export default defineComponent({
  props: {
    section: { type: Object as PropType<Section>, required: true },
    entryStates: {type: Object as PropType<Record<string, IEntryState>>, required: true},
    sectionState: {type: Object as PropType<ISectionState>, required: true},
  },
  setup(props) {
    const { t } = useI18n();
    return () => <div>
      <NGrid cols="1 500:2" yGap="12px">
        <NGridItem>
          <NFlex vertical>
            {
              new Array(8).fill(0).map((_, i) => <NFormItem key={i} label={t('mod.keyMap.button1P', {index: i + 1})} labelPlacement="left" labelWidth="10em" showFeedback={false}>
                <NSelect v-model:value={props.entryStates[`GameSystem.KeyMap.Button${i + 1}_1P`].value} options={options}/>
              </NFormItem>)
            }
            <NFormItem label={t('mod.keyMap.select1P')} labelPlacement="left" labelWidth="10em" showFeedback={false}>
              <NSelect v-model:value={props.entryStates['GameSystem.KeyMap.Select_1P'].value} options={options}/>
            </NFormItem>
            <NFormItem label="Test" labelPlacement="left" labelWidth="10em" showFeedback={false}>
              <NSelect v-model:value={props.entryStates['GameSystem.KeyMap.Test'].value} options={options}/>
            </NFormItem>
          </NFlex>
        </NGridItem>
        <NGridItem>
        <NFlex vertical>
            {
              new Array(8).fill(0).map((_, i) => <NFormItem key={i} label={t('mod.keyMap.button2P', {index: i + 1})} labelPlacement="left" labelWidth="10em" showFeedback={false}>
                <NSelect v-model:value={props.entryStates[`GameSystem.KeyMap.Button${i + 1}_2P`].value} options={options}/>
              </NFormItem>)
            }
            <NFormItem label={t('mod.keyMap.select2P')} labelPlacement="left" labelWidth="10em" showFeedback={false}>
              <NSelect v-model:value={props.entryStates['GameSystem.KeyMap.Select_2P'].value} options={options}/>
            </NFormItem>
            <NFormItem label="Service" labelPlacement="left" labelWidth="10em" showFeedback={false}>
              <NSelect v-model:value={props.entryStates['GameSystem.KeyMap.Service'].value} options={options}/>
            </NFormItem>
          </NFlex>
        </NGridItem>
      </NGrid>
      <NFlex vertical class="p-l-15">
        {props.section.entries?.filter(it=>
          ['GameSystem.KeyMap.Autoplay','GameSystem.KeyMap.DisableIO4','GameSystem.KeyMap.DisableDebugInput','GameSystem.KeyMap.DisableDebugFeatureHotkeys']
          .includes(it.path!))
          .map((entry) => <ConfigEntry key={entry.path!} entry={entry} entryState={props.entryStates[entry.path!]}/>)}
      </NFlex>
    </div>;
  }
})
