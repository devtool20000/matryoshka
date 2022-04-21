import { GenerateValueFactory } from "./MockGenerator";
export declare type KnownLocale = 'af_ZA' | 'ar' | 'az' | 'cz' | 'de' | 'de_AT' | 'de_CH' | 'el' | 'en' | 'en_AU' | 'en_AU_ocker' | 'en_BORK' | 'en_CA' | 'en_GB' | 'en_GH' | 'en_IE' | 'en_IND' | 'en_NG' | 'en_US' | 'en_ZA' | 'es' | 'es_MX' | 'fa' | 'fi' | 'fr' | 'fr_BE' | 'fr_CA' | 'fr_CH' | 'ge' | 'he' | 'hr' | 'hy' | 'id_ID' | 'it' | 'ja' | 'ko' | 'lv' | 'mk' | 'nb_NO' | 'ne' | 'nl' | 'nl_BE' | 'pl' | 'pt_BR' | 'pt_PT' | 'ro' | 'ru' | 'sk' | 'sv' | 'tr' | 'uk' | 'ur' | 'vi' | 'zh_CN' | 'zh_TW' | 'zu_ZA';
export declare function setGlobalSeed(value: number): void;
export declare function Fake<T = any>(path: string, options?: FakeFieldOptions | null): GenerateValueFactory<T>;
export declare function FakeExpr(expr: string, options?: FakeFieldOptions | null): GenerateValueFactory<string>;
export interface FakeFieldOptions {
    seed?: number;
    locale?: KnownLocale;
    options?: any[];
}
