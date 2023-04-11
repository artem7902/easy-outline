import cdk = require("aws-cdk-lib");
import s3 = require("aws-cdk-lib/aws-s3");
import dynamodb = require("aws-cdk-lib/aws-dynamodb");
import lambda = require("aws-cdk-lib/aws-lambda");
import acm = require("aws-cdk-lib/aws-certificatemanager");
import route53 = require("aws-cdk-lib/aws-route53");
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";

import { Construct } from "constructs";

import { WebsiteConfig } from "./constracts/website-config";
import { AppSyncConfig } from "./constracts/appsync-config";

import getConfig, { STAGE } from "../config";

export class CdkStack extends cdk.Stack {
  private rootHostedZone?: route53.IHostedZone;
  private acmCertificate?: acm.Certificate;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const stage = STAGE;
    const config = getConfig(stage);
    const websiteDomain = config.WEBSITE_DOMAIN_NAME;
    const apiDomain = config.API_DOMAIN_NAME;
    const websiteBucketName = config.WEBSITE_S3_BUCKET_NAME;
    const useCustomDomain = config.ROOT_HOSTED_ZONE_ID && config.MAIN_DOMAIN;

    if (useCustomDomain) {
      this.rootHostedZone = route53.HostedZone.fromHostedZoneAttributes(
        this,
        "RootHostedZone",
        {
          hostedZoneId: config.ROOT_HOSTED_ZONE_ID,
          zoneName: config.MAIN_DOMAIN,
        }
      );

      // create ACM certificate
      this.acmCertificate = new acm.Certificate(this, "CloudFrontCertficate", {
        domainName: websiteDomain,
        subjectAlternativeNames: [apiDomain],
        validation: acm.CertificateValidation.fromDns(this.rootHostedZone),
      });
    }

    // Lambda

    const processingLambdaBucket = new s3.Bucket(
      this,
      "ProcessingLambdaBucket"
    );

    const processingLambda = new PythonFunction(this, "ProcessingLambda", {
      functionName: config.LAMBDA_NAMES.ADD_ARTICLE,
      entry: __dirname.split("/").slice(0, -1).join("/") + `/lambda`,
      runtime: lambda.Runtime.PYTHON_3_7,
      index: "index.py",
      handler: "main",
      environment: {
        BUCKET: processingLambdaBucket.bucketName,
        ARTICLES_TABLE: config.TABLE_NAMES.ARTICLES,
      },
      timeout: cdk.Duration.minutes(1),
    });

    processingLambdaBucket.grantReadWrite(processingLambda);

    // DynamoDB

    const articlesDynamodbTable = new dynamodb.Table(
      this,
      "ArticlesDynamodbTable",
      {
        tableName: config.TABLE_NAMES.ARTICLES,
        billingMode: dynamodb.BillingMode.PROVISIONED,
        writeCapacity: 5,
        readCapacity: 5,
        partitionKey: {
          name: "id",
          type: dynamodb.AttributeType.STRING,
        },
      }
    );

    articlesDynamodbTable.grantReadWriteData(processingLambda);

    // GraphQL API
    const appSyncConfig = new AppSyncConfig(this, "AppSyncConfig", {
      apiName: config.APPSYNC_GRAPHQL_API_NAME,
      domainName: apiDomain,
      dynamoTables: { [config.TABLE_NAMES.ARTICLES]: articlesDynamodbTable },
      lambdas: { [config.LAMBDA_NAMES.ADD_ARTICLE]: processingLambda },
      resolverTemplatePaths: config.GRAPH_QL_RESOLVER_TEMPLATE_PATHS,
      hostedZone: this.rootHostedZone,
      certificate: this.acmCertificate,
    });

    // React website
    const websiteConfig = new WebsiteConfig(this, "WebsiteConfig", {
      domainName: websiteDomain,
      hostedZone: this.rootHostedZone,
      certificate: this.acmCertificate,
      s3BucketName: websiteBucketName,
    });

    // Output params

    new cdk.CfnOutput(this, "AppsyncGraphQLApiKey", {
      value: appSyncConfig.graphQlApiKey.attrApiKey,
    });

    new cdk.CfnOutput(this, "WebsiteS3BucketName", {
      value: websiteConfig.websiteS3Bucket.bucketName,
    });

    if (!useCustomDomain) {
      new cdk.CfnOutput(this, "AppsyncGraphQLUrl", {
        value: appSyncConfig.graphQlApi.graphqlUrl,
      });
      new cdk.CfnOutput(this, "AppsyncGraphQLWSUrl", {
        value: cdk.Fn.join("", [
          "wss://",
          cdk.Fn.select(
            1,
            cdk.Fn.split("https://", appSyncConfig.graphQlApi.graphqlUrl)
          ),
          "/realtime",
        ]),
      });
      new cdk.CfnOutput(this, "WebsiteUrl", {
        value: websiteConfig.cloudFrontDistribution.distributionDomainName,
      });
    }
  }
}
