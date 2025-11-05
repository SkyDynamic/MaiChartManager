import { computed, defineComponent } from "vue";
import { NDrawer, NDrawerContent, NFlex } from "naive-ui";
import FileTypeIcon from "@/components/FileTypeIcon";
import FileContentIcon from "@/components/FileContentIcon";
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    show: {type: Boolean, required: true},
  },
  setup(props, {emit}) {
    const { t } = useI18n();
    
    return () => <NDrawer show={props.show} height={250} placement="bottom">
      <NDrawerContent title={t('music.edit.selectFileTypes')}>
        <NFlex vertical size="large">
          {t('genre.imageHint')}
          <div class="grid cols-4 justify-items-center text-8em gap-10">
            <FileTypeIcon type="JPG"/>
            <FileTypeIcon type="PNG"/>
          </div>
        </NFlex>
      </NDrawerContent>
    </NDrawer>;
  }
})
