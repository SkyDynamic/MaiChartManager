import { computed, defineComponent, PropType } from "vue";
import { NButton, NFlex, NInputNumber, NModal, NProgress } from "naive-ui";
import { IMPORT_STEP, ImportMeta } from "./types";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    show: {type: Boolean, required: true},
    movieProgress: {type: Number, required: true},
    closeModal: {type: Function, required: true},
    current: {type: Object as PropType<ImportMeta>, required: true},
  },
  setup(props, {emit}) {
    const { t } = useI18n();
    
    const show = computed({
      get: () => props.show,
      set: (val) => props.closeModal()
    })
    return () => <NModal
      preset="card"
      class="w-[min(40vw,40em)]"
      title={t('chart.import.importingTitle')}
      closable={false}
      maskClosable={false}
      closeOnEsc={false}
      show={show.value}
    >
      <NFlex vertical class="text-4">
        <div>
          <span class="op-90">{t('chart.import.currentProcessing')}：</span>
          {props.current.name}
        </div>
        <Step step={IMPORT_STEP.create} current={props.current.importStep} name={t('chart.import.step.createMusic')}/>
        <Step step={IMPORT_STEP.chart} current={props.current.importStep} name={t('chart.import.step.convertChart')}/>
        <Step step={IMPORT_STEP.music} current={props.current.importStep} name={t('chart.import.step.convertAudio')}/>
        {props.current.movie && <Step step={IMPORT_STEP.movie} current={props.current.importStep} name={t('chart.import.step.convertVideo')}/>}
        {props.current.movie && !!props.movieProgress && <NProgress
            type="line"
            percentage={props.movieProgress}
            indicator-placement="inside"
            processing
        >
          {props.movieProgress === 100 ? t('tools.videoOptions.processing') : `${props.movieProgress}%`}
        </NProgress>}
        <Step step={IMPORT_STEP.jacket} current={props.current.importStep} name={t('chart.import.step.importJacket')}/>
      </NFlex>
    </NModal>
  }
})

const Step = defineComponent({
  props: {
    name: String,
    step: {type: Number as PropType<IMPORT_STEP>, required: true},
    current: {type: Number as PropType<IMPORT_STEP>, required: true},
  },
  setup(props) {
    const icon = computed(() => {
      if (props.current < props.step) return 'i-mdi-dots-horizontal'
      if (props.current === props.step) return 'i-mdi-arrow-right-thin'
      return 'i-material-symbols-done'
    })

    const className = computed(() => {
      if (props.current < props.step) return 'text-zinc-400'
      if (props.current === props.step) return 'text-blue-600 font-bold'
      return 'text-green-600'
    })

    return () => <NFlex class={className.value} align="center">
      <div class={icon.value}/>
      {props.name}
      {props.current === props.step && '...'}
    </NFlex>
  }
})
