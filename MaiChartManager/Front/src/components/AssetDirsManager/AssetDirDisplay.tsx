import { computed, defineComponent, PropType } from "vue";
import { GetAssetsDirsResult } from "@/client/apiGen";
import { NFlex, NPopover } from "naive-ui";
import OfficialChartToggle from "@/components/AssetDirsManager/OfficialChartToggle";
import MemosDisplay from "@/components/AssetDirsManager/MemosDisplay";
import DeleteButton from "@/components/AssetDirsManager/DeleteButton";
import CheckConflictButton from "@/components/AssetDirsManager/CheckConflictButton";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    dir: {type: Object as PropType<GetAssetsDirsResult>, required: true}
  },
  setup(props) {
    const { t } = useI18n();

    return () => <div class="grid cols-[10em_1fr_9em_6em_14em] items-center gap-5 m-x">
      {props.dir.dirName}
      <div/>
      <div>
        {
          props.dir.subFiles!.some(it => it === 'DataConfig.xml') ?
            <NPopover trigger="hover">
              {{
                trigger: () => t('assetDir.storingOfficial'),
                default: () => t('assetDir.dataConfigExists')
              }}
            </NPopover> :
            <OfficialChartToggle dir={props.dir}/>
        }
      </div>
      <div>
        <MemosDisplay dir={props.dir}/>
      </div>
      <NFlex>
        {props.dir.dirName! !== 'A000' && <>
            <DeleteButton dir={props.dir}/>
            <CheckConflictButton dir={props.dir.dirName!}/>
        </>}
      </NFlex>
    </div>;
  }
})
