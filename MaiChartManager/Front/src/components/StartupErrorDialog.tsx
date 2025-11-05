import { defineComponent, PropType, ref, computed, watch } from 'vue';
import { NFlex, NList, NListItem, NModal } from 'naive-ui';
import useAsync from "@/hooks/useAsync";
import api from "@/client/api";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  // props: {
  // },
  setup(props, { emit }) {
    const errors = useAsync(() => api.GetAppStartupErrors())
    const show = ref(false)
    const { t } = useI18n();

    watch(() => errors.data.value, value => {
      if (!value) return
      if (value.data?.length) {
        show.value = true
      }
    })

    return () => <NModal
      preset="card"
      class="w-[min(50vw,60em)] bg-#FCEEEE!"
      title={t('startup.error')}
      v-model:show={show.value}
    >
      <NFlex vertical class="max-h-70vh overflow-y-auto">
        <NList showDivider={false}>
          {errors.data.value?.data?.map((error) => {
            return <NListItem>
              <div class="text-0.9em">
                {error}
              </div>
            </NListItem>
          })}
        </NList>
        {t('startup.fixPrompt')}
      </NFlex>
    </NModal>;
  },
});
