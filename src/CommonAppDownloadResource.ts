import RNFetchBlob from 'rn-fetch-blob';
import {ImageCacheManager} from "react-native-cached-image";
import {getStringsCommon} from "my-rn-common-resource";
import {FileUtils, IPathUtilsModule, isEmpty, ItemOfPartDetailBase, sendError} from 'my-rn-base-utils';
import {DialogUtils, Toast} from "my-rn-base-component";
import {DownloadStateUtils} from "./DownloadStateUtils";

const defaultImageCacheManager = ImageCacheManager();

export class CommonAppDownloadResource {

    /**getPathOnlineRef tham chiếu đến ==> PathUtils.getPathOnline(subPath) */
    public static async downloadListItem(listItem: any[],
                                         PathUtils: IPathUtilsModule): Promise<boolean> {
        let {listLinkAudio, listLinkImg, listLinkImgBase64, listLinkPdfPath} = await getAllLink(listItem);
        // cache toàn bộ image
        await _cacheListImageLink(listLinkImg, PathUtils);

        //Download tất cả các link còn lại, chia thành 3 group download đồng thời
        let groupLink1 = [];
        let groupLink2 = [];
        let groupLink3 = [];
        _addLinkTo3Group(listLinkAudio, groupLink1, groupLink2, groupLink3);
        _addLinkTo3Group(listLinkImgBase64, groupLink3, groupLink2, groupLink1);
        _addLinkTo3Group(listLinkPdfPath, groupLink2, groupLink1, groupLink3);

        let promise1 = CommonAppDownloadResource._downloadGroupLink(groupLink1, PathUtils);
        let promise2 = CommonAppDownloadResource._downloadGroupLink(groupLink2, PathUtils);
        let promise3 = CommonAppDownloadResource._downloadGroupLink(groupLink3, PathUtils);
        let listSuccessValue = await Promise.all([promise1, promise2, promise3]);
        for (let isSuccess of listSuccessValue) {
            if (!isSuccess)
                return false;
        }
        return true;
    }

    private static getFilePathCache(subPath: string, PathUtils: IPathUtilsModule) {
        let isStartWithHttp = subPath.startsWith("http");
        return PathUtils.getCachedDownloadDir() + (isStartWithHttp ? subPath.hashCode() : subPath);
    }

    public static async downloadOneFile(subPath: string,
                                        PathUtils: IPathUtilsModule): Promise<boolean> {
        let pathSave = this.getFilePathCache(subPath, PathUtils);
        if (await FileUtils.exists(pathSave)) return true;

        let url = PathUtils.getPathOnline(subPath);
        try {
            await RNFetchBlob.config({path: pathSave}).fetch('GET', url, {});
            console.log("Download Complete: " + subPath);
            return true;
        } catch (e) {
            // noinspection JSIgnoredPromiseFromCall
            FileUtils.deleteFile(pathSave);
            console.log("Error Download: ", subPath, e);
            return false
        }
    }

    public static async isCache(subPath: string, PathUtils: IPathUtilsModule) {
        return FileUtils.exists(this.getFilePathCache(subPath, PathUtils));
    }

    public static removeAllDownloaded(PathUtils: IPathUtilsModule) {
        DialogUtils.showQuestionDialog(null, getStringsCommon().confirm_delete_data,
            {
                text: getStringsCommon().Ok, onPress: (
                    () => {
                        DownloadStateUtils.removeAllDownloaded();
                        FileUtils.deleteFile(PathUtils.getCachedDownloadDir());
                        Toast.showLongBottom(getStringsCommon().success_need_restart)
                    })
            },
            {text: getStringsCommon().Cancel.toUpperCase(), onPress: null}, true)
    }

    //region utils private
    private static async _downloadGroupLink(groupLinks: any[], PathUtils: IPathUtilsModule): Promise<boolean> {
        let isSuccess = true;
        for (let link of groupLinks) {
            if (!await CommonAppDownloadResource.downloadOneFile(link, PathUtils)) {
                isSuccess = false;
            }
        }
        return isSuccess
    }

    //endregion
}

//region Get All Link ====
type ResultType = { listLinkAudio: string[], listLinkImg: string[], listLinkImgBase64: string[], listLinkPdfPath: string[] };
/**Return {listLinkAudio: [], listLinkImg:[], listLinkImgBase64:[], listLinkPdfPath:[]}*/
const getAllLink = function (listItem: any[]): ResultType {
    let result = {listLinkAudio: [], listLinkImg: [], listLinkImgBase64: [], listLinkPdfPath: []};
    addAllLink(result, listItem);
    return result
};
const addAllLink = function (result: ResultType, listItem: any[]) {
    if (listItem == null) return;
    for (let item of listItem) {
        if (item == undefined) continue;
        addAudioAndImgLink(result, item);
        addAudioAndImgLink(result, item.sample); // nếu item là vocabulary
        addDownloadForItemOfPartDetail(result, item);
        addDownloadForOther(result, item);
    }
};

/**thêm link nếu có ở item vào result*/
const addAudioAndImgLink = function (result: ResultType, item) {
    if (item == undefined) return;
    if (item.audio)
        _pushOfNotExits(result.listLinkAudio, item.audio);
    if (item.video)
        _pushOfNotExits(result.listLinkAudio, item.audio);
    if (item.img)
        _pushOfNotExits(result.listLinkImg, item.img);
    if (item.pdfPathLesson)
        _pushOfNotExits(result.listLinkPdfPath, item.pdfPathLesson);

};

const addDownloadForItemOfPartDetail = function (result: ResultType, item: ItemOfPartDetailBase) {
    if (item.dataJsonObj != null)
        addAudioAndImgLink(result, item.dataJsonObj);
    if (item.dataJson != null) {
        try {
            let dataJsonObj = JSON.parse(item.dataJson);
            addAudioAndImgLink(result, dataJsonObj);
        } catch (e) {sendError(e) }
    }
};

const addDownloadForOther = function (result: ResultType, item: any) {
    if (item.list != null)
        addAllLink(result, item.list);
    if (item.listQuestion != null)
        addAllLink(result, item.listQuestion);
    if (item.listPartDetailBaiTap != null)
        addAllLink(result, item.listPartDetailBaiTap);
    if (item.listItemBaiTap != null)
        addAllLink(result, item.listItemBaiTap);
    if (item.vocabularyObjs != null)
        addAllLink(result, item.vocabularyObjs);
    if (item.groupQuestions != null)
        addAllLink(result, item.groupQuestions);
    if (item.itemOfPartDetails != null)
        addAllLink(result, item.itemOfPartDetails);
};

//endregion

//region cache image link
const _cacheListImageLink = async function (imgLinks: string[], PathUtils: IPathUtilsModule): Promise<any> {
    if (isEmpty(imgLinks))
        return;
    let allPromise = [];
    for (let item of imgLinks) {
        let onlineImgLink = PathUtils.getPathOnline(item);
        allPromise.push(defaultImageCacheManager.downloadAndCacheUrl(onlineImgLink, {ttl: 200000000}))
    }
    return Promise.all(allPromise)

};
//endregion

//region utils
const _pushOfNotExits = function (arrayObj: string[], objPush: string) {
    if (arrayObj.indexOf(objPush) >= 0) {
        return
    }
    arrayObj.push(objPush)
};
const _addLinkTo3Group = function (listLink, groupLink1, groupLink2, groupLink3) {
    if (isEmpty(listLink)) return;
    let count = 0;
    while (true) {
        if (listLink.length <= count) break;
        groupLink1.push(listLink[count]);
        count++;
        if (listLink.length <= count) break;
        groupLink2.push(listLink[count]);
        count++;
        if (listLink.length <= count) break;
        groupLink3.push(listLink[count]);
        count++;
    }
};
//endregion
