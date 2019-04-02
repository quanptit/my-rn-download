import { PartSummary } from "my-rn-base-utils";
export declare class DownloadStateUtils {
    static isDownloaded(key: string | number): Promise<boolean>;
    static setDownloadState(key: string | number, isDownloaded: boolean): Promise<void>;
    static setDownloadStatePartSummary(partsummary: PartSummary, isDownloaded: boolean): Promise<void>;
    static isDownloadedPartSummary(partsummary: PartSummary): Promise<boolean>;
    static removeAllDownloaded(): Promise<void>;
}
