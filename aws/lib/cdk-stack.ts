import * as fs from "fs"
import cdk = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import iam = require('@aws-cdk/aws-iam');
import cloudfront = require('@aws-cdk/aws-cloudfront');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import appsync = require('@aws-cdk/aws-appsync');
import lambda = require('@aws-cdk/aws-lambda')
import * as config from "../config";
import * as resolverTemplates from "../appsync/resolver-templates";


export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // define input params 

    const stage = new cdk.CfnParameter(this, 'stage', {
      default: !!this.node.tryGetContext('stage') ? this.node.tryGetContext('stage') : "dev",
      type: "String",
    })

    // start website config block
    /*const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      bucketName: config.WEBSITE_S3_BUCKET_NAME(stage.valueAsString),
    });
    const websiteCloudfrontOriginAccessIdentity = new cloudfront.CfnCloudFrontOriginAccessIdentity(this, "WebsiteCloudfrontOriginAccessIdentity", {
      cloudFrontOriginAccessIdentityConfig: {
        comment: "Website Origin Access Identity Config"
      }
    })
    const websiteS3CloudfrontStatement = new iam.PolicyStatement({effect: iam.Effect.ALLOW});
    websiteS3CloudfrontStatement.addActions("s3:GetObject");
    websiteS3CloudfrontStatement.addResources(`${websiteBucket.bucketArn}/*`);
    websiteS3CloudfrontStatement.addCanonicalUserPrincipal(websiteCloudfrontOriginAccessIdentity.attrS3CanonicalUserId);
    websiteBucket.addToResourcePolicy(websiteS3CloudfrontStatement) 
    const websiteCloudFrontDistribution = new cloudfront.CfnDistribution(this, "WebsiteCloudFrontDistribution", {
      distributionConfig: {
         defaultRootObject: "index.html",
         origins: [
           {
             id: "0",
             domainName: websiteBucket.bucketDomainName,
             s3OriginConfig: {
               originAccessIdentity: `origin-access-identity/cloudfront/${websiteCloudfrontOriginAccessIdentity.ref}`
             }
           }
         ],
         defaultCacheBehavior: {
           allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "POST", "DELETE"],
           cachedMethods: ["GET", "HEAD"],
           forwardedValues: {queryString: true},
           defaultTtl: 0,
           viewerProtocolPolicy: "redirect-to-https",
           targetOriginId: "0"
         },
       customErrorResponses: [
         {
           errorCachingMinTtl: 0, 
           errorCode: 404,
           responseCode: 200,
           responsePagePath: "/index.html" 
         },
         {
           errorCachingMinTtl: 0, 
           errorCode: 403,
           responseCode: 200,
           responsePagePath: "/index.html" 
           }
         ],
         priceClass: "PriceClass_100",
         enabled: true
      }
    });
    */
    // end website config block

    // DynamoDB

    const articlesDynamodbTable =  new dynamodb.Table(this, "ArticlesDynamodbTable", {
      tableName: config.ARTICLES_DYNAMODB_TABLE_NAME(stage.valueAsString),
      billingMode: dynamodb.BillingMode.PROVISIONED,
      writeCapacity: 5,
      readCapacity: 5,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // Lambda Layer

    /*const processingLambdaLayer =  new lambda.LayerVersion(this, 'ProcessingLambdaLayer', {
      code: lambda.Code.fromAsset(__dirname.split("/").slice(0, -1).join("/") + `/layer`),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_7],
      license: 'MIT'
    });*/
    

    // Lambda

    const processingLambdaBucket = new s3.Bucket(this, "ProcessingLambdaBucket");

    const processingLambda =  new lambda.Function(this, "ProcessingLambda", {
      code: lambda.Code.fromAsset(__dirname.split("/").slice(0, -1).join("/") + `/lambda`),
      handler: 'src/index.main',
      runtime: lambda.Runtime.PYTHON_3_7,
      timeout: cdk.Duration.seconds(5),
      //layers: [processingLambdaLayer],
      environment: {
        BUCKET: processingLambdaBucket.bucketName
      }
    });

    processingLambdaBucket.grantReadWrite(processingLambda);

    // AppSync

    const appsyncGraphQLApi = new appsync.CfnGraphQLApi(this, "AppsyncGraphQLApi", {
      name: config.APPSYNC_GRAPHQL_API_NAME(stage.valueAsString),
      authenticationType: "API_KEY"
    });

    const fullAccessToArticlesDBPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["dynamodb:*"],
          resources: [articlesDynamodbTable.tableArn]
        })
      ]
    });

    const allowToInvokeProcessingLambdaPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["lambda:InvokeFunction"],
          resources: [processingLambda.functionArn]
        })
      ]
    });

    const appsyncGrantAricleTableAccesRole = new iam.Role(this, "AppsyncGrantAricleTableAccesRole", {
       assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
       inlinePolicies: {
         ["root"]: fullAccessToArticlesDBPolicy
       }
    });

    const appsyncGrantProcessingLambdaAccesRole = new iam.Role(this, "AppsyncGrantProcessingLambdaAccesRole", {
      assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
      inlinePolicies: {
        ["root"]: allowToInvokeProcessingLambdaPolicy
      }
   });

    const appsyncGraphQLDynamoSource = new appsync.CfnDataSource(this, "AppsyncGraphQLArticlesSource", {
      apiId: appsyncGraphQLApi.attrApiId,
      type: "AMAZON_DYNAMODB",
      name: config.APPSYNC_GRAPHQL_DYNAMO_SOURCE_NAME(stage.valueAsString),
      dynamoDbConfig: {
        awsRegion: config.AWS_REGION(props),
        tableName: articlesDynamodbTable.tableName,
        useCallerCredentials: false
      },
      serviceRoleArn: appsyncGrantAricleTableAccesRole.roleArn
    });

    const appsyncGraphQLLambdaSource = new appsync.CfnDataSource(this, "AppsyncGraphQLLambdaSource", {
      apiId: appsyncGraphQLApi.attrApiId,
      type: "AWS_LAMBDA",
      name: config.APPSYNC_GRAPHQL_LAMBDA_SOURCE_NAME(stage.valueAsString),
      lambdaConfig: {
        lambdaFunctionArn:processingLambda.functionArn
      },
      serviceRoleArn: appsyncGrantProcessingLambdaAccesRole.roleArn
    });

   // AppSync Schema
   
    const appsyncGraphQLSchema = new appsync.CfnGraphQLSchema(this, "AppsyncGraphQLSchema", {
      apiId: appsyncGraphQLApi.attrApiId,
      definition: fs.readFileSync(`${__dirname}/appsync/api-scheme.gql`).toString()
    })

   // AppSync Resolvers 

    const appsyncGetPublicArticleResolver = new appsync.CfnResolver(this, "GetPublicArticleResolver", {
      apiId: appsyncGraphQLApi.attrApiId,
      dataSourceName: appsyncGraphQLDynamoSource.name,
      typeName: "Query",
      fieldName: "getPublicArticle",
      kind: "UNIT",
      requestMappingTemplate: resolverTemplates.getPublicArticle.request,
      responseMappingTemplate: `$utils.toJson($context.result)`,
    })
    appsyncGetPublicArticleResolver.addDependsOn(appsyncGraphQLSchema);
    appsyncGetPublicArticleResolver.addDependsOn(appsyncGraphQLDynamoSource);

    const appsyncUpdateArticleResolver = new appsync.CfnResolver(this, "UpdateArticleResolver", {
      apiId: appsyncGraphQLApi.attrApiId,
      dataSourceName: appsyncGraphQLDynamoSource.name,
      typeName: "Mutation",
      fieldName: "updateArticle",
      kind: "UNIT",
      requestMappingTemplate: resolverTemplates.updateArticle.request,
      responseMappingTemplate: `$utils.toJson($context.result)`,
    })
    appsyncUpdateArticleResolver.addDependsOn(appsyncGraphQLSchema);
    appsyncUpdateArticleResolver.addDependsOn(appsyncGraphQLDynamoSource);

    const appsyncAddArticleResolver = new appsync.CfnResolver(this, "AddArticleResolver", {
      apiId: appsyncGraphQLApi.attrApiId,
      dataSourceName: appsyncGraphQLLambdaSource.name,
      typeName: "Mutation",
      fieldName: "addArticle",
      kind: "UNIT",
      requestMappingTemplate: resolverTemplates.addArticle.request,
      responseMappingTemplate: `$utils.toJson($context.result)`,
    })
    
    appsyncAddArticleResolver.addDependsOn(appsyncGraphQLSchema);
    appsyncAddArticleResolver.addDependsOn(appsyncGraphQLLambdaSource);

   // AppSync API key 
   
   const appsyncApiKey = new appsync.CfnApiKey(this, "AppsyncApiKey", {
     apiId: appsyncGraphQLApi.attrApiId,
     expires: Math.ceil((new Date().getTime()/1000)) + 31104000
   })


  // define output params 

  /*const websiteUrl = new cdk.CfnOutput(this, 'WebsiteUrl', {
    value: websiteCloudFrontDistribution.attrDomainName
  })*/

  const appsyncGraphQLApiUrl = new cdk.CfnOutput(this, 'AppsyncGraphQLApiUrl', {
    value: appsyncGraphQLApi.attrGraphQlUrl
  })

  const appsyncGraphQLApiKey = new cdk.CfnOutput(this, 'AppsyncGraphQLApiKey', {
    value: appsyncApiKey.attrApiKey
  })

  }
}