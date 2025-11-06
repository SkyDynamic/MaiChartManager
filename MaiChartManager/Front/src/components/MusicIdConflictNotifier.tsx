import { computed, defineComponent, PropType } from "vue";
import { musicListAll } from "@/store/refs";
import { NFlex, NPopover } from "naive-ui";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    id: {type: Number, required: true},
  },
  setup(props) {
    const { t } = useI18n();
    const conflicts = computed(() => musicListAll.value.filter(m => m.id === props.id))

    return () => !!conflicts.value.length && <NPopover trigger="hover">
      {{
        trigger: () => <div class="text-#f0a020 i-material-symbols-warning-outline-rounded text-2em translate-y-.3"/>,
        default: () => <NFlex vertical>
          {t('music.edit.idConflictWarning')}
          {conflicts.value.map((p, index) => <div key={index}>{p.assetDir}</div>)}
        </NFlex>
      }}
    </NPopover>;
  }
})
