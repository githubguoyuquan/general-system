/**
 * 服务端读取字典树（Server Components / Route Handlers）。
 * 客户端请用 `useDictionary` + `/api/dictionaries/public/[rootKey]`。
 */
export { getDict, getCachedDictionaryTree, dictionaryCacheTag, registerDictionaryExternalCache } from "./dictionary-cache";
