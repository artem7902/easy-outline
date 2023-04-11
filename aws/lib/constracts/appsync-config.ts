import iam = require("aws-cdk-lib/aws-iam");
import appsync = require("aws-cdk-lib/aws-appsync");
import route53 = require("aws-cdk-lib/aws-route53");
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { SchemaFile } from "aws-cdk-lib/aws-appsync";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";

import { Construct } from "constructs";

export interface IGraphQLResolverTemplatePaths {
  dynamo: {
    [key: string]: {
      query: {
        [key: string]: string;
      };
      mutation: {
        [key: string]: string;
      };
    };
  };
  lambda: {
    [key: string]: {
      query: {
        [key: string]: string;
      };
      mutation: {
        [key: string]: string;
      };
    };
  };
}

export interface IAppSyncConfigProps {
  apiName: string;
  dynamoTables: { [key: string]: ITable };
  lambdas: { [key: string]: IFunction };
  resolverTemplatePaths: IGraphQLResolverTemplatePaths;
  hostedZone?: route53.IHostedZone;
  certificate?: ICertificate;
  domainName: string;
}

export class AppSyncConfig extends Construct {
  public readonly graphQlApi: appsync.GraphqlApi;
  public readonly graphQlApiKey: appsync.CfnApiKey;

  constructor(scope: Construct, id: string, props: IAppSyncConfigProps) {
    super(scope, id);

    const {
      apiName,
      dynamoTables,
      lambdas,
      resolverTemplatePaths,
      certificate,
      domainName,
      hostedZone,
    } = props;

    const setCustomDomain = hostedZone && domainName && certificate;

    const { dynamo: dynamoResolvers, lambda: lambdaResolvers } =
      resolverTemplatePaths;

    // GraphQLAPI
    this.graphQlApi = new appsync.GraphqlApi(this, "AppsyncGraphQLApi", {
      name: apiName,
      schema: new SchemaFile({
        filePath: `${__dirname}/../../appsync/api-scheme.gql`,
      }),
      domainName: setCustomDomain
        ? {
            domainName,
            certificate,
          }
        : undefined,
    });
    this.graphQlApiKey = new appsync.CfnApiKey(this, "AppsyncApiKey", {
      apiId: this.graphQlApi.apiId,
      expires: Math.ceil(new Date().getTime() / 1000) + 31104000,
    });

    // IAM
    const fullAccessToDynamoTablesPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["dynamodb:*"],
          resources: Object.values(dynamoTables).map((table) => table.tableArn),
        }),
      ],
    });
    const invokeAccessToLambdasPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["lambda:InvokeFunction"],
          resources: Object.values(lambdas).map((lambda) => lambda.functionArn),
        }),
      ],
    });

    const appsyncGrantDynamoAccesRole = new iam.Role(
      this,
      "AppsyncGrantAricleTableAccesRole",
      {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
        inlinePolicies: {
          ["root"]: fullAccessToDynamoTablesPolicy,
        },
      }
    );

    const appsyncGrantLambdaAccesRole = new iam.Role(
      this,
      "AppsyncGrantProcessingLambdaAccesRole",
      {
        assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
        inlinePolicies: {
          ["root"]: invokeAccessToLambdasPolicy,
        },
      }
    );

    // Setup Dynamo sources and resolvers
    Object.entries(dynamoTables).forEach(([tableName, table]) => {
      const tableSource = new appsync.DynamoDbDataSource(
        this,
        `AppsyncGraphQLSource${table.node.id}`,
        {
          table,
          api: this.graphQlApi,
          serviceRole: appsyncGrantDynamoAccesRole,
          useCallerCredentials: false,
        }
      );
      const tableResolverTemplates = dynamoResolvers[tableName];
      if (tableResolverTemplates) {
        Object.entries(tableResolverTemplates.query).forEach(
          ([templateKey, template]) => {
            new appsync.Resolver(this, `${templateKey}Resolver`, {
              api: this.graphQlApi,
              dataSource: tableSource,
              typeName: "Query",
              fieldName: templateKey,
              requestMappingTemplate:
                appsync.MappingTemplate.fromFile(template),
              responseMappingTemplate: appsync.MappingTemplate.fromString(
                `$utils.toJson($context.result)`
              ),
            });
          }
        );
        Object.entries(tableResolverTemplates.mutation).forEach(
          ([templateKey, template]) => {
            new appsync.Resolver(this, `${templateKey}Resolver`, {
              api: this.graphQlApi,
              dataSource: tableSource,
              typeName: "Mutation",
              fieldName: templateKey,
              requestMappingTemplate:
                appsync.MappingTemplate.fromFile(template),
              responseMappingTemplate: appsync.MappingTemplate.fromString(
                `$utils.toJson($context.result)`
              ),
            });
          }
        );
      }
    });

    // Setup Lambda sources and resolvers
    Object.entries(lambdas).forEach(([lambdaName, lambda]) => {
      const tableSource = new appsync.LambdaDataSource(
        this,
        `AppsyncGraphQLSource${lambda.node.id}`,
        {
          lambdaFunction: lambda,
          api: this.graphQlApi,
          serviceRole: appsyncGrantLambdaAccesRole,
        }
      );
      const lambdaResolverTemplates = lambdaResolvers[lambdaName];

      if (lambdaResolverTemplates) {
        Object.entries(lambdaResolverTemplates.query).forEach(
          ([templateKey, template]) => {
            new appsync.Resolver(this, `${templateKey}Resolver`, {
              api: this.graphQlApi,
              dataSource: tableSource,
              typeName: "Query",
              fieldName: templateKey,
              requestMappingTemplate:
                appsync.MappingTemplate.fromFile(template),
              responseMappingTemplate: appsync.MappingTemplate.fromString(
                `$utils.toJson($context.result)`
              ),
            });
          }
        );
        Object.entries(lambdaResolverTemplates.mutation).forEach(
          ([templateKey, template]) => {
            new appsync.Resolver(this, `${templateKey}Resolver`, {
              api: this.graphQlApi,
              dataSource: tableSource,
              typeName: "Mutation",
              fieldName: templateKey,
              requestMappingTemplate:
                appsync.MappingTemplate.fromFile(template),
              responseMappingTemplate: appsync.MappingTemplate.fromString(
                `$utils.toJson($context.result)`
              ),
            });
          }
        );
      }
    });

    if (setCustomDomain) {
      // Point DNS to CloudFront
      new route53.CnameRecord(this, "apiCNameRecord", {
        recordName: domainName,
        zone: hostedZone,
        domainName: this.graphQlApi.appSyncDomainName,
      });
    }
  }
}
