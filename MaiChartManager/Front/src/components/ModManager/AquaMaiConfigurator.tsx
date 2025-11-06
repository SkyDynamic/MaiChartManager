import { defineComponent, PropType, ref, computed } from 'vue';
import { ConfigDto, IEntryState, ISectionState, Section } from "@/client/apiGen";
import { NAnchor, NAnchorLink, NButton, NDivider, NFlex, NForm, NFormItem, NInput, NInputNumber, NPopover, NScrollbar, NSelect, NSwitch } from "naive-ui";
import _ from "lodash";
import ProblemsDisplay from "@/components/ProblemsDisplay";
import configSortStub from './configSort.yaml'
import { useMagicKeys, whenever } from "@vueuse/core";
import ConfigEntry from './ConfigEntry';
import { getSectionPanelOverride, getNameForPath, getBigSectionName } from './utils';
import comments from "./modComments.yaml";
import { useI18n } from 'vue-i18n';
import { locale } from "@/locales";

const ConfigSection = defineComponent({
  props: {
    section: { type: Object as PropType<Section>, required: true },
    entryStates: { type: Object as PropType<Record<string, IEntryState>>, required: true },
    sectionState: { type: Object as PropType<ISectionState>, required: true },
  },
  setup(props, { emit }) {
    const { t, te } = useI18n();

    const CustomPanel = getSectionPanelOverride(props.section.path!);
    const comment = computed(() => {
      const localeKey = 'mod.commentOverrides.' + props.section.path!.replace(/\./g, '_');
      if (te(localeKey)) {
        return t(localeKey);
      }
      if (locale.value.startsWith('zh')) {
        return props.section.attribute?.comment?.commentZh;
      }
      return props.section.attribute?.comment?.commentEn;
    })

    return () => <NFlex vertical class="p-1 border-transparent border-solid border-1px rd hover:border-yellow-5">
      {!props.section.attribute!.alwaysEnabled && <NFormItem label={getNameForPath(props.section.path!, props.section.path!.split('.').pop()!, props.section.attribute?.comment?.nameZh)} labelPlacement="left" labelWidth="9em" showFeedback={false}
        // @ts-ignore
                                                             title={props.section.path!}
      >
        <NFlex vertical class="w-full ws-pre-line">
          <NFlex class="h-34px" align="center">
            <NSwitch v-model:value={props.sectionState.enabled}/>
            {comments.shouldEnableOptions[props.section.path!] && !props.sectionState.enabled && <ProblemsDisplay problems={[t('mod.needEnableOption')]}/>}
          </NFlex>
          {comment.value}
        </NFlex>
      </NFormItem>}
      {props.sectionState.enabled && (
        CustomPanel ?
          <CustomPanel entryStates={props.entryStates} sectionState={props.sectionState} section={props.section}/> :
          !!props.section.entries?.length && <NFlex vertical class="p-l-15 max-[900px]:p-l-10 max-[500px]:p-l-5!">
            {props.section.entries?.filter(it => !it.attribute?.hideWhenDefault || (it.attribute?.hideWhenDefault && !props.entryStates[it.path!].isDefault))
              .map((entry) => <ConfigEntry key={entry.path!} entry={entry} entryState={props.entryStates[entry.path!]}/>)}
          </NFlex>
      )}
    </NFlex>;
  },
});

export default defineComponent({
  props: {
    config: { type: Object as PropType<ConfigDto>, required: true },
    useNewSort: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const search = ref('');
    const searchRef = ref();
    const configSort = computed(() => props.config?.configSort || configSortStub)
    const { t } = useI18n();

    const { ctrl_f } = useMagicKeys({
      passive: false,
      onEventFired(e) {
        if (e.ctrlKey && e.key === 'f' && e.type === 'keydown')
          e.preventDefault()
      },
    })
    whenever(ctrl_f, () => searchRef.value?.select());

    const filteredSections = computed(() => {
      if (!search.value) return props.config.sections;
      const s = search.value.toLowerCase();
      return props.config.sections?.filter(it =>
        it.path?.toLowerCase().includes(s) ||
        it.attribute?.comment?.nameZh?.toLowerCase().includes(s) ||
        it.attribute?.comment?.commentZh?.toLowerCase().includes(s) ||
        it.attribute?.comment?.commentEn?.toLowerCase().includes(s) ||
        it.entries?.some(entry => entry.name?.toLowerCase().includes(s) || entry.path?.toLowerCase().includes(s) ||
          entry.attribute?.comment?.commentZh?.toLowerCase().includes(s) || entry.attribute?.comment?.commentEn?.toLowerCase().includes(s) ||
          entry.attribute?.comment?.nameZh?.toLowerCase().includes(s))
      );
    })

    const bigSections = computed(() => {
      if (props.useNewSort) {
        return Object.keys(configSort.value).filter(it => filteredSections.value!.some(s => configSort.value[it].includes(s.path!)));
      }
      return _.uniq(filteredSections.value!.filter(it => !it.attribute?.exampleHidden).map(s => s.path?.split('.')[0]));
    });

    const otherSection = computed(() => {
      if (!props.useNewSort) return [];
      const knownSections = _.flatten(Object.values(configSort.value) as string[][]);
      return filteredSections.value?.filter(it => !knownSections.includes(it.path!) && !it.attribute!.exampleHidden) || [];
    });

    return () => <div class="grid cols-[15em_auto] max-[900px]:cols-1">
      <NAnchor type="block" offsetTarget="#scroll" class={["max-[900px]:hidden"]}>
        {bigSections.value.map((key) => <NAnchorLink key={key} title={getBigSectionName(key!)} href={`#${key}`}/>)}
        {otherSection.value.length > 0 && <NAnchorLink key={t('mod.other')} title={t('mod.other')} href={`#${t('mod.other')}`}/>}
      </NAnchor>
      <NScrollbar class="h-[calc(100dvh-160px)] p-2 relative"
        // @ts-ignore
                  id="scroll"
      >
        <div class={'absolute top-1 left-4 max-[900px]:left-0 right-4 z-200 flex gap-2'}>
          <div class={["min-[900px]:hidden"]}>
            <NPopover trigger="click">{{
              trigger: () => <NButton secondary size="small"><span class="i-ic-baseline-menu text-lg"/></NButton>,
              default: () => <NAnchor type="block" offsetTarget="#scroll">
                {bigSections.value.map((key) => <NAnchorLink key={key} title={getBigSectionName(key!)} href={`#${key}`}/>)}
                {otherSection.value.length > 0 && <NAnchorLink key={t('mod.other')} title={t('mod.other')} href={`#${t('mod.other')}`}/>}
              </NAnchor>
            }}</NPopover>
          </div>
          <NInput v-model:value={search.value} placeholder={t('mod.searchPlaceholder')} size="small" clearable ref={searchRef}/>
        </div>
        {bigSections.value.map((big) => <div id={big} key={big}>
          <NDivider titlePlacement="left" class="mt-0! pt-8 sticky top-0! bg-white/80! z-1"
            // @ts-ignore
            onClick={() => location.href = `#${big}`}
          >{getBigSectionName(big!)}</NDivider>
          {filteredSections.value?.filter(it => {
            if (props.useNewSort) {
              return configSort.value[big!].includes(it.path!);
            }
            return it.path!.split('.')[0] === big && !it.attribute!.exampleHidden;
          }).sort((a, b) => {
            if (!props.useNewSort) return 0;
            return configSort.value[big!].indexOf(a.path!) - configSort.value[big!].indexOf(b.path!);
          }).map((section) => {
            return <ConfigSection key={section.path!} section={section}
                                  entryStates={props.config.entryStates!}
                                  sectionState={props.config.sectionStates![section.path!]}/>;
          })}
        </div>)}
        {otherSection.value.length > 0 &&
          <div id={t('mod.other')}>
            <NDivider titlePlacement="left" class="mt-2!">{t('mod.other')}</NDivider>
            {otherSection.value.map((section) =>
              <ConfigSection key={t('mod.other')} section={section}
                             entryStates={props.config.entryStates!}
                             sectionState={props.config.sectionStates![section.path!]}/>)}
          </div>}
      </NScrollbar>
    </div>;
  },
});
