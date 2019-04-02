import { PartSummary, IPathUtilsModule } from "my-rn-base-utils";
export declare class DownloadPartSummaryUtils {
    /**
     * component phải có phương thức: updateDownloadState(partSummary: PartSummary)
     * Và cần unregisterCallBackWhenDownloadComplete khi componnt unmouted
     * */
    static addToDownload(partSummary: PartSummary, component: any, getListItemForDownload: (partSummary: PartSummary) => Promise<any[]>, PathUtils: IPathUtilsModule, checkGioiHanAndAddDownload?: (callbackAddDownload: VoidFunction) => void): Promise<void>;
    static isDownloading(partSummary: PartSummary): boolean;
    private static _addDownload;
    private static _download;
    private static _downloadPartSummaryComplete;
    /**
     * component phải có phương thức: updateDownloadState(partSummary: PartSummary){}
     * Và cần unregisterCallBackWhenDownloadComplete khi componnt unmouted
     * */
    static registerCallBackWhenDownloadComplete(component: any): void;
    static unregisterCallBackWhenDownloadComplete(component: any): void;
}
