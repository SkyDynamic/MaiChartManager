import { defineComponent, PropType } from "vue";
import { NFlex, NPopover } from "naive-ui";
import { MusicXmlWithABJacket } from "@/client/apiGen";
import OverrideUpIcon from '@/icons/override-up.svg'
import OverrideDownIcon from '@/icons/override-down.svg'
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    conflicts: {type: Array as PropType<MusicXmlWithABJacket[]>, required: true},
    type: {type: String, required: true},
  },
  setup(props) {
    const { t } = useI18n();
    
    return () => !!props.conflicts.length && <NPopover trigger="hover">
      {{
        trigger: () => props.type === 'up' ?
          // @ts-ignore
          <OverrideUpIcon class="c-blue text-2em"/> : <OverrideDownIcon class="c-indigo text-2em"/>,
        default: () => <NFlex vertical>
          {props.type === 'up' ? t('assetDir.conflictOverrides') : t('assetDir.conflictOverriddenBy')}
          {props.conflicts!.map((p, index) => <div key={index}>{p.assetDir}</div>)}
        </NFlex>
      }}
    </NPopover>;
  }
})
