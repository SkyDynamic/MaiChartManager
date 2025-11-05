import { computed, defineComponent, onMounted, ref } from "vue";
import { NBadge, NButton } from "naive-ui";
import { useStorage, watchOnce } from "@vueuse/core";
import ModNotInstalledWarning from "@/components/ModManager/ModNotInstalledWarning";
import ConfigEditor from "@/components/ModManager/ConfigEditor";
import { modInfo } from "@/store/refs";
import { shouldShowUpdate } from "@/components/ModManager/shouldShowUpdateController";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup(props) {
    const isWarningConfirmed = useStorage('isWarningConfirmed', false);
    const showWarning = ref(false);
    const showConfigurator = ref(false);
    const { t } = useI18n();

    watchOnce(() => modInfo.value, async (info) => {
      if (!info) return;
      if (isWarningConfirmed.value) return;
      showWarning.value = !info.aquaMaiInstalled || !info.melonLoaderInstalled;
    })

    const badgeType = computed(() => {
      if (!modInfo.value) return
      if (!modInfo.value.aquaMaiInstalled || !modInfo.value.melonLoaderInstalled) return 'error'
      if (shouldShowUpdate.value) return 'warning'
    })

    return () => <>
      <NBadge dot show={!!badgeType.value} type={badgeType.value as any}>
        <NButton secondary onClick={() => showConfigurator.value = true}>
          {t('mod.title')}
        </NButton>
      </NBadge>
      <ModNotInstalledWarning show={showWarning.value} closeModal={(dismiss: boolean) => {
        showWarning.value = false
        isWarningConfirmed.value = dismiss
      }}/>
      {modInfo.value && <ConfigEditor v-model:show={showConfigurator.value} badgeType={badgeType.value}/>}
    </>;
  }
})
