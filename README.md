# Easy Outline

The goal of this project is to create a simple and minimalistic solution which allows to highlight (or outline) articles and different documents in a quick manner and send it to anyone with one button click.

## Production website

Would like to just use the app? You can do it right away! Go to [the official website](https://easy-outline.com) and create your first outine!

## Preview (dev) website

Eager to check out the most recent features and changes? We made it possible as well! Here is [the preview website](https://dev.easy-outline.com) but remember that <b>we may break it from time to time!</b>

## Self-Hosted

We made it really easy to deploy the app so people can use their own domain names.
If you would like to have it as well, please follow the steps:

1. Install Node v16 and Pyhon 3.7 (use official documentation)
2. Install AWS CDK
    ```
    npm install -g aws-cdk
    ```
3. Set stage environment variable
    ```
    # Linux
    export STAGE=prod
    ```
    ```
    # Windows
    set STAGE=prod
    ```
4. Install npm packages

    ```
    npm install-all
    ```
5. Open `shared/config.ts` and update `MAIN_DOMAIN` variable with your domain name (should be added to AWS Route53)
6. Open `aws/config.js`, update `ROOT_HOSTED_ZONE_ID` variable with a value from Route53 and `STACK_PREFIX` variable with some value (you may use part of your domain name).
7. Deploy API to AWS
    ```
    cd aws && cdk deploy
    ```
    <b>NOTE:</b> If you receive an error from S3 try to update `STACK_PREFIX` variable from the step above so there will be a unique S3 bucket name
8. Rename `frontend/.env.example` to `frontend/.env`, open it and update values inside using the output from the previous step:
    ```
    REACT_APP_STAGE=prod
    REACT_APP_APPSYNC_API_KEY=<AppsyncGraphQLApiKey value>
    ```
9. Set S3 bucken name environment variable using a value from the 7 step output:
    ```
    # Linux
    export AWS_S3_BUCKET_NAME=<WebsiteS3BucketName value>
    ```
    ```
    # Windows
    set AWS_S3_BUCKET_NAME=<WebsiteS3BucketName value>
    ```
10. Deploy your website
    ```
    cd frontend && npm run deploy
    ```
11. Open your website in a browser and enjoy!

## Development

If you would like to create your own version of Easy Outline or you want to contribute (which we highly appreciate) please read the information below.

### Installation

Just follow steps `1-4` from the [Self-Hosted section](#self-hosted) with `STAGE` set to `dev`. 

### Project structure
    .                           # Root
    ├── .github                 # GitHub workflow configs
    ├── .husky                  # Scripts to be executed before commit
    ├── aws                     # AWS-related code (API, DB, Domains)
    ├── frontend                # React project (Easy Outline website)
    ├── shared                  # Shared models, configuration files, utils, etc.
    └── README.md               # This readme :)

### React App 

To start the React app in dev mode using the default configuration: 
1. Rename `frontend/.env.example` to `frontend/.env`
2. Run ``` cd frontend && npm start ```

If you have your own AWS API deployed then open `frontend/.env` and replace `REACT_APP_APPSYNC_API_KEY` variable with your key.

Also, if you are using AWS provided domain names, uncomment and set `REACT_APP_APPSYNC_URL` and `REACT_APP_APPSYNC_WS_URL` with appropriate values from the AWS deployment output.

Please check out `frontend/README.md` to get more info and see commands list.

### AWS 

To deploy your own AWS API just follow steps `5-7` from the [Self-Hosted section](#self-hosted).

<b>NOTE:</b> you can deploy to AWS without owning a domain name (AWS will generate URLs for you):

1. Open `shared/config.ts` and set `MAIN_DOMAIN=""`
2. Open `aws/config.js`, set `ROOT_HOSTED_ZONE_ID=""`
3. Deploy API to AWS ``` cd aws && cdk deploy ```
4. The deployment output will contain website and API URLs

Please check out `aws/README.md` to get more info and see commands list.
