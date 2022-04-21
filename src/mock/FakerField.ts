import {Faker,faker} from '@faker-js/faker'
import {GenerateValueFactory} from "./MockGenerator";
import {deepGet} from "../utils/DeepOperation";

export type KnownLocale =
  | 'af_ZA'
  | 'ar'
  | 'az'
  | 'cz'
  | 'de'
  | 'de_AT'
  | 'de_CH'
  | 'el'
  | 'en'
  | 'en_AU'
  | 'en_AU_ocker'
  | 'en_BORK'
  | 'en_CA'
  | 'en_GB'
  | 'en_GH'
  | 'en_IE'
  | 'en_IND'
  | 'en_NG'
  | 'en_US'
  | 'en_ZA'
  | 'es'
  | 'es_MX'
  | 'fa'
  | 'fi'
  | 'fr'
  | 'fr_BE'
  | 'fr_CA'
  | 'fr_CH'
  | 'ge'
  | 'he'
  | 'hr'
  | 'hy'
  | 'id_ID'
  | 'it'
  | 'ja'
  | 'ko'
  | 'lv'
  | 'mk'
  | 'nb_NO'
  | 'ne'
  | 'nl'
  | 'nl_BE'
  | 'pl'
  | 'pt_BR'
  | 'pt_PT'
  | 'ro'
  | 'ru'
  | 'sk'
  | 'sv'
  | 'tr'
  | 'uk'
  | 'ur'
  | 'vi'
  | 'zh_CN'
  | 'zh_TW'
  | 'zu_ZA';

let globalFakerSeed = 123

export function setGlobalSeed(value:number) {
  globalFakerSeed = value
}

export function Fake<T=any>(path:string,options:FakeFieldOptions | null = null): GenerateValueFactory<T> {
  return ()=>{
    const fakerInstance = new Faker({locales:faker.locales})
    const fakerFunction = deepGet(fakerInstance,path)
    if(typeof fakerFunction !== "function"){
      throw new Error(`can't find ${path} from faker`)
    }
    fakerInstance.seed(options?.seed ?? globalFakerSeed)
    if(options?.locale){
      fakerInstance.locale = options.locale
    }
    return ()=>{
      return fakerFunction.apply(null,(options?.options ?? []))
    }
  }
}

export function FakeExpr(expr:string,options:FakeFieldOptions | null = null): GenerateValueFactory<string> {
  return ()=>{
    const fakerInstance = new Faker({locales:faker.locales})
    const fakerFunction = fakerInstance.fake

    fakerInstance.seed(options?.seed ?? globalFakerSeed)
    if(options?.locale){
      fakerInstance.locale = options.locale
    }
    return ()=>{
      return fakerFunction.call(null,expr)
    }
  }
}


export interface FakeFieldOptions {
  seed?:number
  locale?:KnownLocale
  options?:any[]
}
