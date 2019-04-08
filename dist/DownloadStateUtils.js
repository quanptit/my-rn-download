import { AsyncStorage } from "react-native";
export class DownloadStateUtils {
    static async getDownloadedSavedValue() {
        return AsyncStorage.getItem("DOWNLOADED");
    }
    static async isDownloaded(key, downloadedSavedValue) {
        const value = downloadedSavedValue !== undefined ? downloadedSavedValue : await AsyncStorage.getItem("DOWNLOADED");
        if (value == undefined) {
            return false;
        }
        return value.includes(key + ";");
    }
    static async setDownloadState(key, isDownloaded) {
        const value = await AsyncStorage.getItem("DOWNLOADED");
        let keySeparate = key + ";";
        if (isDownloaded) {
            if (value == undefined) {
                await AsyncStorage.setItem("DOWNLOADED", keySeparate);
            }
            else if (!value.includes(keySeparate)) {
                await AsyncStorage.setItem("DOWNLOADED", value + keySeparate);
            }
        }
        else {
            if (value != undefined && value.includes(keySeparate)) {
                await AsyncStorage.setItem("DOWNLOADED", value.replace(keySeparate, ""));
            }
        }
    }
    static async setDownloadStatePartSummary(partsummary, isDownloaded) {
        return this.setDownloadState(partsummary.pathBaiHoc.hashCode(), isDownloaded);
    }
    static async isDownloadedPartSummary(partsummary) {
        if (partsummary.pathBaiHoc != null)
            return this.isDownloaded(partsummary.pathBaiHoc.hashCode());
        return false;
    }
    static removeAllDownloaded() {
        return AsyncStorage.removeItem("DOWNLOADED");
    }
}
