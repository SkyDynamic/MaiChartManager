import { computed, defineComponent, PropType, ref } from "vue";
import { HttpResponse, MusicXmlWithABJacket } from "@/client/apiGen";
import { NButton, NDrawer, NDrawerContent, NFlex, NForm, NFormItem, NInputNumber, NModal, NPopover, NRadio, useDialog } from "naive-ui";
import { globalCapture, selectedADir } from "@/store/refs";
import FileTypeIcon from "@/components/FileTypeIcon";
import api, { getUrl } from "@/client/api";
import AudioPreviewEditorButton from "@/components/MusicEdit/AudioPreviewEditorButton";
import SetMovieButton from "@/components/MusicEdit/SetMovieButton";
import { t } from "@/locales";

export default defineComponent({
  props: {
    song: { type: Object as PropType<MusicXmlWithABJacket>, required: true },
  },
  setup(props) {
    const updateTime = ref(0)
    const url = computed(() => getUrl(`GetMusicWavApi/${selectedADir.value}/${props.song.cueId}?${updateTime.value}`))
    const tipShow = ref(false)
    const tipSelectAwbShow = ref(false)
    const setOffsetShow = ref(false)
    const offset = ref(0)
    const load = ref(false)
    const okResolve = ref<Function>(() => {
    })
    const dialog = useDialog();
    const cueIdNotMatch = computed(() => props.song.nonDxId !== props.song.cueId)
    const movieIdNotMatch = computed(() => props.song.nonDxId !== props.song.movieId)

    const uploadFlow = async () => {
      tipShow.value = true
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          id: 'acbawb',
          startIn: 'downloads',
          types: [
            {
              description: t('music.edit.supportedFileTypes'),
              accept: {
                "application/x-supported": [".mp3", ".wav", ".ogg", ".acb"],
              },
            },
          ],
        });
        tipShow.value = false;
        if (!fileHandle) return;
        const file = await fileHandle.getFile() as File;

        let res: HttpResponse<any>;
        if (file.name.endsWith('.acb')) {
          tipSelectAwbShow.value = true;
          const [fileHandle] = await window.showOpenFilePicker({
            id: 'acbawb',
            startIn: 'downloads',
            types: [
              {
                description: t('music.edit.supportedFileTypes'),
                accept: {
                  "application/x-supported": [".awb"],
                },
              },
            ],
          });
          tipSelectAwbShow.value = false;
          if (!fileHandle) return;

          load.value = true;
          const awb = await fileHandle.getFile() as File;
          res = await api.SetAudio(props.song.id!, selectedADir.value, { file, awb, padding: 0 });
        } else {
          offset.value = 0;
          setOffsetShow.value = true;
          await new Promise((resolve) => {
            okResolve.value = resolve;
          });
          load.value = true;
          setOffsetShow.value = false;
          res = await api.SetAudio(props.song.id!, selectedADir.value, { file, padding: offset.value });
        }
        if (res.error) {
          const error = res.error as any;
          dialog.warning({ title: t('jacket.setFailed'), content: error.message || error });
          return;
        }
        updateTime.value = Date.now()
        props.song.isAcbAwbExist = true;
      } catch (e: any) {
        if (e.name === 'AbortError') return
        console.log(e)
        globalCapture(e, t('music.edit.audioImportError'))
      } finally {
        tipShow.value = false;
        tipSelectAwbShow.value = false;
        setOffsetShow.value = false;
        load.value = false;
      }
    }

    return () => <NFlex align="center">
      {props.song.isAcbAwbExist && <audio controls src={url.value} class="w-0 grow"/>}
      {selectedADir.value !== 'A000' &&
        <NPopover trigger="hover" disabled={!cueIdNotMatch.value}>{{
          trigger: () => <NButton secondary class={`${!props.song.isAcbAwbExist && "w-full"}`} onClick={uploadFlow} loading={load.value} disabled={cueIdNotMatch.value}>{props.song.isAcbAwbExist ? t('music.edit.replaceAudio') : t('music.edit.setAudio')}</NButton>,
          default: () => t('music.edit.cueIdNotMatch')
        }}</NPopover>
      }
      {selectedADir.value !== 'A000' && props.song.isAcbAwbExist &&
        <NPopover trigger="hover" disabled={!cueIdNotMatch.value}>{{
          trigger: () => <AudioPreviewEditorButton disabled={cueIdNotMatch.value}/>,
          default: () => t('music.edit.cueIdNotMatchPreview')
        }}</NPopover>
      }
      {selectedADir.value !== 'A000' && props.song.isAcbAwbExist &&
        <NPopover trigger="hover" disabled={!movieIdNotMatch.value}>{{
          trigger: () => <SetMovieButton song={props.song} disabled={movieIdNotMatch.value}/>,
          default: () => t('music.edit.movieIdNotMatch')
        }}</NPopover>
      }

      {/* 打开文件对话框一般在左上角，所以在下边显示一个 Drawer */}
      <NDrawer v-model:show={tipShow.value} height={200} placement="bottom">
        <NDrawerContent title={t('music.edit.selectFileTypes')}>
          <div class="grid cols-4 justify-items-center text-8em gap-10">
            <FileTypeIcon type="WAV"/>
            <FileTypeIcon type="MP3"/>
            <FileTypeIcon type="OGG"/>
            <FileTypeIcon type="ACB"/>
          </div>
        </NDrawerContent>
      </NDrawer>
      <NDrawer v-model:show={tipSelectAwbShow.value} width={500} placement="right">
        <NDrawerContent title={t('music.edit.selectAwb')}/>
      </NDrawer>
      <NModal
        preset="card"
        class="w-[min(30vw,25em)]"
        title={t('music.edit.setOffsetSeconds')}
        v-model:show={setOffsetShow.value}
      >{{
        default: () => <NFlex vertical size="large">
          <div>{t('music.edit.audioOffsetHint')}</div>
          <NInputNumber v-model:value={offset.value} class="w-full" step={0.01}/>
        </NFlex>,
        footer: () => <NFlex justify="end">
          <NButton onClick={okResolve.value as any}>{t('common.confirm')}</NButton>
        </NFlex>
      }}</NModal>
    </NFlex>
  }
})
