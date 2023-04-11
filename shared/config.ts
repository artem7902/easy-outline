
const MAIN_DOMAIN = "easy-outline.com";
const DEFAULT_REGION = "us-east-1";

export const getSharedConfig = (stage: string) => {
    const WEBSITE_DOMAIN_NAME = MAIN_DOMAIN ? `${stage !== "prod" ? stage + "." : ""}${MAIN_DOMAIN}` : ""
    const API_DOMAIN_NAME = WEBSITE_DOMAIN_NAME ? `api.${WEBSITE_DOMAIN_NAME}` : ""
    return {
        MAIN_DOMAIN,
        DEFAULT_REGION,
        WEBSITE_DOMAIN_NAME,
        API_DOMAIN_NAME
    }
}
