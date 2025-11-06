import {computed, defineComponent, h, PropType, ref} from "vue";
import TouchSensitivityDisplay from "./TouchSensitivityDisplay";
import {NButton, NButtonGroup, NFlex, NFormItem, NInputNumber, NSwitch} from "naive-ui";
import {IEntryState, ISectionState} from "@/client/apiGen";
import { useI18n } from 'vue-i18n';

const AREAS = [
  "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8",
  "B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8",
  "C1", "C2",
  "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8",
  "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8",
]
export default defineComponent({
  props: {
    entryStates: {type: Object as PropType<Record<string, IEntryState>>, required: true},
    sectionState: {type: Object as PropType<ISectionState>, required: true},
  },
  setup(props) {
    const { t } = useI18n();
    const selected = ref<string>()
    const display = computed(() => Object.fromEntries(AREAS.map(key => [key.toLowerCase(), props.entryStates[`GameSettings.TouchSensitivity.${key}`].value])))

    const applyPreset = (id: number) => {
      const PRESET_A = [90, 80, 70, 60, 50, 40, 30, 26, 23, 20, 10]
      const PRESET_OTHERS = [70, 60, 50, 40, 30, 20, 15, 10, 5, 1, 1]

      for (const key of AREAS) {
        props.entryStates[`GameSettings.TouchSensitivity.${key}`].value = (key.startsWith('A') ? PRESET_A : PRESET_OTHERS)[id]
      }
    }

    const applyToGlobal = (value: number) => {
      for (const key of AREAS) {
        props.entryStates[`GameSettings.TouchSensitivity.${key}`].value = value
      }
    }

    const applyToArea = (area: 'a' | 'b' | 'c' | 'd' | 'e', value: number) => {
      area = area.toUpperCase() as any
      for (const key of AREAS) {
        if (key.startsWith(area)) {
          props.entryStates[`GameSettings.TouchSensitivity.${key}`].value = value
        }
      }
    }

    return () => <NFlex size="large" class="m-l-10">
      <TouchSensitivityDisplay config={display.value} v-model:currentSelected={selected.value}/>
      <NFlex vertical>
        {t('mod.touchSensitivity.applyPresetToGlobal')}
        <NButtonGroup class="mb">
          {Array.from({length: 11}, (_, i) => <NButton size="small" secondary class={i > 0 ? 'b-l b-l-solid b-l-[rgba(255,255,255,0.5)]' : ''} onClick={() => applyPreset(i)}>{i - 5 > 0 && '+'}{i - 5}</NButton>)}
        </NButtonGroup>
        {selected.value ? <>
            {t('mod.touchSensitivity.settingsFor', {area: selected.value.toUpperCase()})}
            <NInputNumber v-model:value={props.entryStates[`GameSettings.TouchSensitivity.${selected.value.toUpperCase()}`].value} min={0} max={100} step={1}/>
            <NFlex class="mb">
              <NButton secondary onClick={() => applyToGlobal(props.entryStates[`GameSettings.TouchSensitivity.${selected.value!.toUpperCase()}`].value)}>{t('mod.touchSensitivity.applyToGlobal')}</NButton>
              <NButton secondary onClick={() => applyToArea(selected.value!.substring(0, 1) as any, props.entryStates[`GameSettings.TouchSensitivity.${selected.value!.toUpperCase()}`].value)}>
                {t('mod.touchSensitivity.applyToArea', {area: selected.value.substring(0, 1).toUpperCase()})}
              </NButton>
            </NFlex>
          </> :
          <div class="mb">
            {t('mod.touchSensitivity.selectAreaHint')}
          </div>
        }
        <div class="lh-relaxed whitespace-pre-wrap">
          {t('mod.touchSensitivity.helpText')}
        </div>
      </NFlex>
    </NFlex>;
  }
})
