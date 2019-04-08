import { PartSummary } from "my-rn-base-utils";
export declare class DownloadStateUtils {
    static getDownloadedSavedValue(): Promise<string>;
    static isDownloaded(key: string | number, downloadedSavedValue?: string): Promise<boolean>;
    static setDownloadState(key: string | number, isDownloaded: boolean): Promise<void>;
    static setDownloadStatePartSummary(partsummary: PartSummary, isDownloaded: boolean): Promise<void>;
    static isDownloadedPartSummary(partsummary: PartSummary, downloadedSavedValue?: string): Promise<boolean>;
    static removeAllDownloaded(): Promise<void>;
}
