import { computed, defineComponent, ref } from "vue";
import { NA, NButton, NFlex, NModal, NPopover, NQrCode } from "naive-ui";
import '@fontsource/nerko-one'
import { version } from "@/store/refs";
import StorePurchaseButton from "@/components/StorePurchaseButton";
import AfdianIcon from "@/icons/afdian.svg";
import { HardwareAccelerationStatus, LicenseStatus } from "@/client/apiGen";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup(props) {
    const show = ref(false);
    const displayVersion = computed(() => version.value?.version?.split('+')[0]);
    const { t } = useI18n();

    return () => version.value && <NButton quaternary round onClick={() => show.value = true}>
      v{displayVersion.value}

      <NModal
        preset="card"
        class="w-60em max-w-100dvw"
        title={t('about.title')}
        v-model:show={show.value}
      >
        <NFlex vertical class="text-4" size="large">
          <AppIcon class="mb-6 max-[540px]:scale-75"/>
          <div class="flex justify-center gap-1 text-10 c-gray-4">
            <a class="i-mdi-github hover:c-#1f2328 transition-300" href="https://github.com/clansty/MaiChartManager" target="_blank"/>
            <a class="i-ic-baseline-telegram hover:c-#39a6e6 transition-300" href="https://t.me/MaiChartManager" target="_blank"/>
            <NPopover trigger="hover">
              {{
                trigger: () => <div class="i-ri-qq-fill hover:c-#e31b25 transition-300"/>,
                default: () => <div><NQrCode value="https://qm.qq.com/q/U3gT7CDuy6"/></div>
              }}
            </NPopover>
          </div>
          <div>
            {t('about.version')}: {version.value.version}
          </div>
          <div>
            {t('about.gameVersion')}: 1.{version.value.gameVersion}
          </div>
          {version.value.hardwareAcceleration === HardwareAccelerationStatus.Enabled && <div>
            {t('about.vp9Enabled')}
          </div>}
          {version.value.hardwareAcceleration === HardwareAccelerationStatus.Disabled && <div>
            {t('about.vp9Disabled')}
          </div>}
          <div>
            {t('about.h264Encoder')}: {version.value.h264Encoder}
          </div>
          {version.value.license === LicenseStatus.Active && <div>
            {t('about.premiumActive')}
            <NA
              // @ts-ignore
              href="https://afdian.com/a/Clansty"
              target="_blank"
            >{t('about.continueSupport')}</NA>
          </div>}
          {version.value.license === LicenseStatus.Inactive && <NFlex align="center">
            {t('purchase.supportDev')}
            <StorePurchaseButton/>
            <NButton secondary onClick={() => window.open("https://afdian.com/item/90b4d1fe70e211efab3052540025c377")}>
              <span class="text-lg c-#946ce6 mr-2 translate-y-.25">
                <AfdianIcon/>
              </span>
              {t('purchase.afdian')}
            </NButton>
          </NFlex>}
        </NFlex>
      </NModal>
    </NButton>;
  }
})

const AppIcon = defineComponent({
  setup() {
    return () => <div class="flex flex-col items-center font-['Nerko_One'] text-30 text-stroke-2 lh-none">
      <NFlex>
        <div class="c-#c3c4f8 text-stroke-#8791e2">
          Mai
        </div>
        <div class="c-#f7abca text-stroke-#d079b2">
          Chart
        </div>
      </NFlex>
      <div class="c-#fef19d text-stroke-#e3c86a">
        Manager
      </div>
    </div>
  }
})
