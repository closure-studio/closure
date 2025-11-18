
import { IAuthLoginResponse } from "@/types/auth";
import { IApiResponse, IServiceConfig } from "@/types/axios";
import ServerBase from "./base";
import { ID_SERVER_CONSTANTS } from "./constants";
class IdServerClient extends ServerBase {
    constructor(config: IServiceConfig) {
        // Call the parent class constructor
        super(config);
    }
    // A generic method to handle API responses
    protected async handleResponse<T>(promise: Promise<any>): Promise<IApiResponse<T>> {
        try {
            const resp = await promise;
            return resp.data as IApiResponse<T>;
        } catch (error: any) {
            if (error.response) {
                return {
                    code: error.response.status,
                    message: error.response.data?.message || error.message,
                };
            } else if (error.request) {
                return {
                    code: 0,
                    message: "Network error",
                };
            } else {
                return {
                    code: 500,
                    message: error.message || "Unknown error",
                };
            }
        }
    }
    async login(email: string, password: string): Promise<IApiResponse<IAuthLoginResponse>> {
        const option = ID_SERVER_CONSTANTS.LOGIN;
        option.data = { email, password };
        return this.post<IAuthLoginResponse>(option.endPoint, option);
    }
}
export default IdServerClient;