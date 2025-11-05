import { defineComponent } from "vue";
import { NButton, NFlex, NModal, NPopover, NQrCode } from "naive-ui";
import { showNeedPurchaseDialog } from "@/store/refs";
import StorePurchaseButton from "@/components/StorePurchaseButton";
import AfdianIcon from "@/icons/afdian.svg";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup(props) {
    const { t } = useI18n();
    
    return () => <NModal
      preset="card"
      class="w-[min(50vw,60em)]"
      title={t('purchase.title')}
      v-model:show={showNeedPurchaseDialog.value}
    >
      <NFlex vertical>
        <div>
          {t('purchase.description')}
        </div>
        <div>
          {t('purchase.featuresTitle')}
        </div>
        <ul>
          <li>{t('purchase.feature.convertPv')}</li>
          <li>{t('purchase.feature.audioPreview')}</li>
          <li>{t('purchase.feature.changeId')}</li>
          <li>{t('purchase.feature.batchExport')}</li>
          <li>{t('purchase.feature.batchMaidata')}</li>
        </ul>
        <div>{t('purchase.moreComingSoon')}</div>
        <NFlex align="center">
          {t('purchase.supportDev')}
          <StorePurchaseButton/>
          <NButton secondary onClick={() => window.open("https://afdian.com/item/90b4d1fe70e211efab3052540025c377")}>
              <span class="text-lg c-#946ce6 mr-2 translate-y-.25">
                <AfdianIcon/>
              </span>
            {t('purchase.afdian')}
          </NButton>
          <NPopover trigger="click">
            {{
              trigger: () => <NButton secondary>
              <span class="text-lg i-ri-qq-fill c-gray-6 mr-1 translate-y-.12">
                <AfdianIcon/>
              </span>
                {t('purchase.qqGroup')}
              </NButton>,
              default: () => <div><NQrCode value="https://qm.qq.com/q/U3gT7CDuy6"/></div>
            }}
          </NPopover>
        </NFlex>
      </NFlex>
    </NModal>;
  }
})
