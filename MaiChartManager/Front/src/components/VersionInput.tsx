import { computed, defineComponent, PropType } from "vue";
import { NButton, NFlex, NInputGroup, NInputGroupLabel, NInputNumber, NPopover } from "naive-ui";
import { b15ver, gameVersion, selectedADir, version } from "@/store/refs";
import { useI18n } from 'vue-i18n';

// 这是 version 不是 addVersion，是大家都喜欢写 22001 的那个 version
export default defineComponent({
  props: {
    value: Number
  },
  setup(props, {emit}) {
    const { t } = useI18n();
    const value = computed({
      get: () => props.value || 0,
      set: (v) => emit('update:value', v)
    })

    return () => <NInputGroup>
      <NInputNumber showButton={false} class="w-full" v-model:value={value.value} min={0}/>
      {!!version.value?.gameVersion && <>
        {/* 只有成功识别了游戏版本才显示 */}
        {/* 按钮边框层级有问题 */}
        <NButton class={value.value < b15ver.value ? "z-1" : ""} type={value.value < b15ver.value ? 'success' : 'default'} ghost
                 disabled={selectedADir.value === 'A000'} onClick={() => value.value = 20000}>{t('music.edit.includeB35')}</NButton>
        <NButton class={value.value >= b15ver.value ? "z-1" : ""} type={value.value >= b15ver.value ? 'success' : 'default'} ghost
                 disabled={selectedADir.value === 'A000'} onClick={() => value.value = 20000 + version.value!.gameVersion! * 100}>{t('music.edit.includeB15')}</NButton>
      </>}
      <NPopover trigger="hover">
        {{
          trigger: () => <NInputGroupLabel>
            ?
          </NInputGroupLabel>,
          default: () => <div>
            {t('music.edit.versionHint', {gameVersion: gameVersion.value, b15ver: b15ver.value})}
          </div>
        }}
      </NPopover>
    </NInputGroup>;
  }
})
