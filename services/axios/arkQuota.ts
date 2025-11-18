
import { IApiResponse, IServiceConfig } from "@/types/axios";
import ServerBase from "./base";


class ArkQuotaClient extends ServerBase {
    protected handleResponse<T>(promise: Promise<any>): Promise<IApiResponse<T>> {
        throw new Error("Method not implemented.");
    }
    constructor(config: IServiceConfig) {
        super(config);
    }
}

export default ArkQuotaClient;