
import { DEFAULT_CONSTANTS } from "@/constants/constants";
import * as Clarity from "@microsoft/react-native-clarity";
import { useEffect } from "react";
import { Platform } from "react-native";

export const useClarity = () => {
    const isMobile = Platform.OS === "ios" || Platform.OS === "android";
    useEffect(() => {
        if (isMobile) {
            Clarity.initialize(DEFAULT_CONSTANTS.CLARITY.NATIVE_PROD_ID, {
                logLevel: Clarity.LogLevel.Verbose, // Note: Use "LogLevel.Verbose" value while testing to debug initialization issues.
            });
        }
    }, [isMobile]);
};
