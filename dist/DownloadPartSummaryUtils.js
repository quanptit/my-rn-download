import { getStringsCommon } from "my-rn-common-resource";
import { CommonAppDownloadResource } from "./CommonAppDownloadResource";
import { CommonUtils, sendError } from "my-rn-base-utils";
import { DialogUtils, Toast } from "my-rn-base-component";
import { DownloadStateUtils } from "./DownloadStateUtils";
let componentRedistereds = [];
let listWaiForDownload = [];
let downloadingObj = null;
export class DownloadPartSummaryUtils {
    /**
     * component phải có phương thức: updateDownloadState(partSummary: PartSummary)
     * Và cần unregisterCallBackWhenDownloadComplete khi componnt unmouted
     * */
    static async addToDownload(partSummary, component, getListItemForDownload, PathUtils, checkGioiHanAndAddDownload) {
        if (partSummary.isDownloading)
            return;
        if (partSummary.isDownloaded) {
            DialogUtils.showQuestionDialog(getStringsCommon().downloaded_dialog_title, getStringsCommon().downloaded_dialog_mes, {
                text: getStringsCommon().Ok, onPress: () => {
                    return DownloadPartSummaryUtils._addDownload(partSummary, component, getListItemForDownload, PathUtils);
                }
            }, { text: getStringsCommon().Cancel.toUpperCase() });
        }
        else {
            if (partSummary.isDownloadError || checkGioiHanAndAddDownload == null)
                return DownloadPartSummaryUtils._addDownload(partSummary, component, getListItemForDownload, PathUtils);
            else
                checkGioiHanAndAddDownload(() => {
                    DownloadPartSummaryUtils._addDownload(partSummary, component, getListItemForDownload, PathUtils);
                });
        }
    }
    static isDownloading(partSummary) {
        if (downloadingObj == null)
            return false;
        return partSummary.pathBaiHoc === downloadingObj.pathBaiHoc;
    }
    static async _addDownload(partSummary, component, getListItemForDownload, PathUtils) {
        partSummary.isDownloading = true;
        if (component != undefined) {
            component.forceUpdate();
            await CommonUtils.nextFrame();
        }
        if (downloadingObj != undefined) {
            listWaiForDownload.push(partSummary);
        }
        else {
            this._download(partSummary, getListItemForDownload, PathUtils);
        }
    }
    static async _download(partSummary, getListItemForDownload, PathUtils) {
        downloadingObj = partSummary;
        partSummary.isDownloaded = false;
        partSummary.isDownloadError = false;
        // noinspection JSIgnoredPromiseFromCall
        DownloadStateUtils.setDownloadStatePartSummary(partSummary, false);
        console.log("_download partSummary childId: ", partSummary.pathBaiHoc);
        let listItem = await getListItemForDownload(partSummary);
        try {
            await CommonAppDownloadResource.downloadListItem(listItem, PathUtils);
            this._downloadPartSummaryComplete(getListItemForDownload, PathUtils);
        }
        catch (e) { //Download Error
            sendError(e);
            Toast.showLongBottom(getStringsCommon().has_error);
            downloadingObj.isDownloadError = true;
            this._downloadPartSummaryComplete(getListItemForDownload, PathUtils);
        }
    }
    static async _downloadPartSummaryComplete(getListItemForDownload, PathUtils) {
        console.log("_downloadPartSummaryComplete ===========");
        if (!downloadingObj) {
            Toast.showLongBottom(getStringsCommon().success);
            return;
        }
        downloadingObj.isDownloading = false;
        if (!downloadingObj.isDownloadError) {
            downloadingObj.isDownloaded = true;
            DownloadStateUtils.setDownloadStatePartSummary(downloadingObj, true);
            Toast.showLongBottom(getStringsCommon().success);
        }
        else {
            Toast.showLongBottom(getStringsCommon().has_error);
        }
        for (let component of componentRedistereds) {
            if (component.updateDownloadState)
                component.updateDownloadState(downloadingObj);
            else
                sendError("component.updateDownloadState IS NULL");
        }
        downloadingObj = null;
        setTimeout(() => {
            if (listWaiForDownload.length > 0) {
                this._download(listWaiForDownload.pop(), getListItemForDownload, PathUtils);
            }
        }, 100);
    }
    //region Register/ Unregister component
    /**
     * component phải có phương thức: updateDownloadState(partSummary: PartSummary){}
     * Và cần unregisterCallBackWhenDownloadComplete khi componnt unmouted
     * */
    static registerCallBackWhenDownloadComplete(component) {
        if (componentRedistereds.indexOf(component) >= 0)
            return;
        componentRedistereds.push(component);
    }
    static unregisterCallBackWhenDownloadComplete(component) {
        let index = componentRedistereds.indexOf(component);
        componentRedistereds.splice(index, 1);
    }
}
