import { locale } from "@/locales";
import { capitalCase } from "change-case";
import comments from "./modComments.yaml";

const sectionPanelOverrides = import.meta.glob('./sectionPanelOverride/*/index.tsx', { eager: true })
export const getSectionPanelOverride = (path: string) => {
  return (sectionPanelOverrides[`./sectionPanelOverride/${path}/index.tsx`] as any)?.default
}

export const getNameForPath = (path: string, name: string, nameBuiltin?: string | null) => {
  // if (comments.nameOverrides[path]) return comments.nameOverrides[path]
  if (locale.value.startsWith('zh')) {
    return nameBuiltin || capitalCase(name)
  }
  return capitalCase(name)
}

// originalKey 是 configSort 里面写的中文 key
export const getBigSectionName = (originalKey: string) => {
  if (locale.value.startsWith('zh')) {
    return originalKey
  }
  return comments.sectionNameEn[originalKey] || originalKey
}
