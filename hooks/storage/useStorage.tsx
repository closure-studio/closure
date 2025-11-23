import { storage } from "@/utils/mmkv/mmkv";

interface IUseStorageParams {

}

export const useStorage = (props: IUseStorageParams) => {
    const myStorage = storage;
    return { storage: myStorage };

};