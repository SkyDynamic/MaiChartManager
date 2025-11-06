import { defineComponent, PropType, ref, watch } from "vue";
import UnityWebgl from "unity-webgl";
// 神奇，ASP.NET 放一个 .data 的文件在 wwwroot 里，就会 404。其他后缀就没有问题
import dataUrl from '@/assets/majdata-wasm/Build.bin?url';
import frameworkUrl from '@/assets/majdata-wasm/Build.framework.js?url';
import codeUrl from '@/assets/majdata-wasm/Build.wasm?url';
import loaderUrl from '@/assets/majdata-wasm/Build.loader.js?url';
import { NButton, NFlex, NInputNumber, NModal } from "naive-ui";
import UnityVue from 'unity-webgl/vue'
import { selectedADir } from "@/store/refs";
import { getUrl } from "@/client/api";
import { t } from "@/locales";

export default defineComponent({
  props: {
    songId: {type: Number, required: true},
    level: {type: Number, required: true},
  },
  setup(props) {
    const unityContext = new UnityWebgl({
      dataUrl,
      frameworkUrl,
      loaderUrl,
      codeUrl,
    })
    const show = ref(false)

    unityContext.on("mounted", () => {
      console.log("Unity mounted")
      setTimeout(() => {
        unityContext.send("HandleJSMessages", "ReceiveMessage", `jsnmsl\n${getUrl(`ChartPreviewApi/${selectedADir.value}/${props.songId}/${props.level}`)}\n1\nlv0`)
      }, 3000)
    })

    return () => <NButton secondary onClick={() => show.value = true}>
      {t('music.edit.previewChart')}
      <NModal
        preset="card"
        class="w-60vw"
        title={t('chart.preview.title')}
        v-model:show={show.value}
      >
        <NFlex vertical>
          {t('music.edit.previewChartWarning')}
          <UnityVue unity={unityContext} height="32vw"/>
        </NFlex>
      </NModal>

    </NButton>
  },
})
