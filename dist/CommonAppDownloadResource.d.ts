import { IPathUtilsModule } from 'my-rn-base-utils';
export declare class CommonAppDownloadResource {
    /**getPathOnlineRef tham chiếu đến ==> PathUtils.getPathOnline(subPath) */
    static downloadListItem(listItem: any[], PathUtils: IPathUtilsModule): Promise<boolean>;
    private static getFilePathCache;
    static downloadOneFile(subPath: string, PathUtils: IPathUtilsModule): Promise<boolean>;
    static isCache(subPath: string, PathUtils: IPathUtilsModule): Promise<boolean>;
    static removeAllDownloaded(PathUtils: IPathUtilsModule): void;
    private static _downloadGroupLink;
}
