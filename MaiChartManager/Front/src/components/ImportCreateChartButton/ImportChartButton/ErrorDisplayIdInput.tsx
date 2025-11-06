import { computed, defineComponent, effect, PropType, watch } from "vue";
import { NAlert, NButton, NCheckbox, NCollapse, NCollapseItem, NFlex, NForm, NFormItem, NInputNumber, NModal, NPopover, NRadio, NRadioButton, NRadioGroup, NScrollbar, NSelect, SelectOption } from "naive-ui";
import { ImportChartMessage, MessageLevel, ShiftMethod } from "@/client/apiGen";
import { ImportChartMessageEx, ImportMeta, MOVIE_CODEC, SavedOptions, TempOptions } from "./types";
import noJacket from '@/assets/noJacket.webp';
import { addVersionList, genreList, showNeedPurchaseDialog } from "@/store/refs";
import GenreInput from "@/components/GenreInput";
import VersionInput from "@/components/VersionInput";
import { UTAGE_GENRE } from "@/consts";
import MusicIdConflictNotifier from "@/components/MusicIdConflictNotifier";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    show: {type: Boolean, required: true},
    meta: {type: Array as PropType<ImportMeta[]>, required: true},
    tempOptions: {type: Object as PropType<TempOptions>, required: true},
    savedOptions: {type: Object as PropType<SavedOptions>, required: true},
    closeModal: {type: Function, required: true},
    proceed: {type: Function as PropType<() => any>, required: true},
    errors: {type: Array as PropType<ImportChartMessageEx[]>, required: true}
  },
  setup(props, {emit}) {
    const { t } = useI18n();

    const show = computed({
      get: () => props.show,
      set: (val) => props.closeModal()
    })

    watch([() => props.savedOptions.genreId, () => show.value], ([val]) => {
      for (const meta of props.meta) {
        meta.id = meta.id % 1e5 + (val === UTAGE_GENRE ? 1e5 : 0);
      }
    })

    return () => <NModal
      preset="card"
      class="w-[min(50vw,50em)]"
      title={t('chart.import.importPrompt')}
      v-model:show={show.value}
    >{{
      default: () => <NFlex vertical size="large">
        <NScrollbar class="max-h-24vh">
          <NFlex vertical>
            {
              props.errors.map((error, i) => {
                if ('first' in error) {
                  if (error.padding > 0 && props.tempOptions.shift === ShiftMethod.Legacy) {
                    return <NAlert key={i} type="info" title={error.name}>{t('chart.import.addPadding', {padding: error.padding.toFixed(3)})}</NAlert>
                  }
                  if (error.padding < 0 && props.tempOptions.shift === ShiftMethod.Legacy) {
                    return <NAlert key={i} type="info" title={error.name}>{t('chart.import.trimPadding', {padding: (-error.padding).toFixed(3)})}</NAlert>
                  }
                  if (error.first > 0 && props.tempOptions.shift === ShiftMethod.NoShift) {
                    return <NAlert key={i} type="info" title={error.name}>{t('chart.import.trimFirst', {first: error.first.toFixed(3)})}</NAlert>
                  }
                  if (error.first < 0 && props.tempOptions.shift === ShiftMethod.NoShift) {
                    return <NAlert key={i} type="info" title={error.name}>{t('chart.import.addFirst', {first: (-error.first).toFixed(3)})}</NAlert>
                  }
                  return <></>
                }
                let type: "default" | "info" | "success" | "warning" | "error" = "default";
                switch (error.level) {
                  case MessageLevel.Info:
                    type = 'info';
                    break;
                  case MessageLevel.Warning:
                    type = 'warning';
                    break;
                  case MessageLevel.Fatal:
                    type = 'error';
                    break;
                }
                return <NAlert key={i} type={type} title={error.name} class={`${error.isPaid && 'cursor-pointer'}`}
                  // @ts-ignore
                               onClick={() => error.isPaid && (showNeedPurchaseDialog.value = true)}
                >
                  <div class="whitespace-pre-wrap">
                    {error.message}
                  </div>
                </NAlert>
              })
            }
          </NFlex>
        </NScrollbar>
        {!!props.meta.length && <>
            {t('chart.import.assignId')}
            <NScrollbar class="max-h-24vh">
                <NFlex vertical size="large">
                  {props.meta.map((meta, i) => <MusicIdInput key={i} meta={meta} utage={props.savedOptions.genreId === UTAGE_GENRE}/>)}
                </NFlex>
            </NScrollbar>
            <NFormItem label={t('music.edit.genre')} labelPlacement="left" labelWidth="10em" showFeedback={false}>
                <GenreInput options={genreList.value} v-model:value={props.savedOptions.genreId}/>
            </NFormItem>
            <NFormItem label={t('music.edit.versionCategory')} labelPlacement="left" labelWidth="10em" showFeedback={false}>
                <GenreInput options={addVersionList.value} v-model:value={props.savedOptions.addVersionId}/>
            </NFormItem>
            <NFormItem label={t('music.edit.version')} labelPlacement="left" labelWidth="10em" showFeedback={false}>
                <VersionInput v-model:value={props.savedOptions.version}/>
            </NFormItem>
            <NCheckbox v-model:checked={props.savedOptions.ignoreLevel}>
                {t('chart.import.option.ignoreLevel')}
            </NCheckbox>
            <NCheckbox v-model:checked={props.savedOptions.disableBga}>
                {t('chart.import.option.disableBga')}
            </NCheckbox>
            <NCollapse>
                <NCollapseItem title={t('chart.import.option.advancedOptions')}>
                    <NFlex vertical>
                        <NFormItem label={t('chart.import.option.shiftMode')} labelPlacement="left" showFeedback={false}>
                            <NFlex vertical class="w-full">
                                <NFlex class="h-34px" align="center">
                                    <NRadioGroup v-model:value={props.tempOptions.shift}>
                                        <NPopover trigger="hover">
                                          {{
                                            trigger: () => <NRadio value={ShiftMethod.Bar} label={t('chart.import.option.shiftByBar')}/>,
                                            default: () => <div>
                                              {t('chart.import.option.shiftByBarDesc')}
                                            </div>
                                          }}
                                        </NPopover>
                                        <NPopover trigger="hover">
                                          {{
                                            trigger: () => <NRadio value={ShiftMethod.Legacy} label={t('chart.import.option.shiftLegacy')}/>,
                                            default: () => <div>
                                              {t('chart.import.option.shiftLegacyDesc')}
                                            </div>
                                          }}
                                        </NPopover>
                                        <NPopover trigger="hover">
                                          {{
                                            trigger: () => <NRadio value={ShiftMethod.NoShift} label={t('chart.import.option.shiftNoMove')}/>,
                                            default: () => <div>
                                              {t('chart.import.option.shiftNoMoveDesc')}
                                            </div>
                                          }}
                                        </NPopover>
                                    </NRadioGroup>
                                </NFlex>
                            </NFlex>
                        </NFormItem>
                        <NCheckbox v-model:checked={props.savedOptions.noScale}>
                            {t('chart.import.option.noScale')}
                        </NCheckbox>
                        <NFormItem label={t('chart.import.option.pvCodec')} labelPlacement="left" showFeedback={false}>
                            <NFlex vertical class="w-full">
                                <NFlex class="h-34px" align="center">
                                    <NSelect v-model:value={props.savedOptions.movieCodec} options={[
                                      {label: t('chart.import.option.codecPreferH264'), value: MOVIE_CODEC.PreferH264},
                                      {label: t('chart.import.option.codecForceH264'), value: MOVIE_CODEC.ForceH264},
                                      {label: t('chart.import.option.codecForceVP9'), value: MOVIE_CODEC.ForceVP9},
                                    ]}/>
                                </NFlex>
                            </NFlex>
                        </NFormItem>
                        <NCheckbox v-model:checked={props.savedOptions.yuv420p}>
                            {t('chart.import.option.yuv420p')}
                        </NCheckbox>
                    </NFlex>
                </NCollapseItem>
            </NCollapse>
        </>}
      </NFlex>,
      footer: () => <NFlex justify="end">
        <NButton onClick={() => show.value = false}>{props.meta.length ? t('common.cancel') : t('common.close')}</NButton>
        {!!props.meta.length && <NButton onClick={props.proceed}>{t('purchase.continue')}</NButton>}
      </NFlex>
    }}</NModal>;
  }
})

const MusicIdInput = defineComponent({
  props: {
    meta: {type: Object as PropType<ImportMeta>, required: true},
    utage: {type: Boolean, required: true},
  },
  setup(props) {
    const dxBase = computed(() => {
      const dx = props.meta.isDx ? 1e4 : 0
      const utage = props.utage ? 1e5 : 0
      return dx + utage;
    });
    const img = computed(() => props.meta.bg ? URL.createObjectURL(props.meta.bg) : noJacket);

    return () => <NFlex align="center" size="large">
      <img src={img.value} class="h-16 w-16 object-fill shrink-0"/>
      <div class="w-0 grow">{props.meta.name}</div>
      <MusicIdConflictNotifier id={props.meta.id}/>
      <NInputNumber v-model:value={props.meta.id} min={dxBase.value + 1} max={dxBase.value + 1e4 - 1} step={1} class="shrink-0"/>
    </NFlex>
  }
})
