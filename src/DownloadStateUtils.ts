import {AsyncStorage} from "react-native";
import {PartSummary} from "my-rn-base-utils";

export class DownloadStateUtils {

    static async getDownloadedSavedValue(): Promise<string> {
        return AsyncStorage.getItem("DOWNLOADED");
    }

    static async isDownloaded(key: string | number, downloadedSavedValue?: string) {
        const value = downloadedSavedValue !== undefined ? downloadedSavedValue : await AsyncStorage.getItem("DOWNLOADED");
        if (value == undefined) {
            return false
        }
        return value.includes(key + ";")
    }

    static async setDownloadState(key: string | number, isDownloaded: boolean) {
        const value: string = await AsyncStorage.getItem("DOWNLOADED");
        let keySeparate = key + ";";
        if (isDownloaded) {
            if (value == undefined) {
                await AsyncStorage.setItem("DOWNLOADED", keySeparate)
            } else if (!value.includes(keySeparate)) {
                await AsyncStorage.setItem("DOWNLOADED", value + keySeparate)
            }
        } else {
            if (value != undefined && value.includes(keySeparate)) {
                await AsyncStorage.setItem("DOWNLOADED", value.replace(keySeparate, ""))
            }
        }
    }

    static async setDownloadStatePartSummary(partsummary: PartSummary, isDownloaded: boolean) {
        return this.setDownloadState(partsummary.pathBaiHoc.hashCode(), isDownloaded)
    }

    static async isDownloadedPartSummary(partsummary: PartSummary, downloadedSavedValue?: string): Promise<boolean> {
        if (partsummary.pathBaiHoc != null)
            return this.isDownloaded(partsummary.pathBaiHoc.hashCode(), downloadedSavedValue);
        return false;
    }

    static removeAllDownloaded(): Promise<void> {
        return AsyncStorage.removeItem("DOWNLOADED")
    }
}
