import * as fs from "fs"
export const getPublicArticle = {
    request: fs.readFileSync(`${__dirname}/resolver-templates-json/get-public-article-request.json`).toString()
}

export const addArticle = {
    request: fs.readFileSync(`${__dirname}/resolver-templates-json/add-article-request.json`).toString()
}

export const updateArticle = {
    request: fs.readFileSync(`${__dirname}/resolver-templates-json/update-article-request.json`).toString()
}