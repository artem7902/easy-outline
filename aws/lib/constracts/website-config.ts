import s3 = require("aws-cdk-lib/aws-s3");
import iam = require("aws-cdk-lib/aws-iam");
import cloudfront = require("aws-cdk-lib/aws-cloudfront");
import origins = require("aws-cdk-lib/aws-cloudfront-origins");
import route53 = require("aws-cdk-lib/aws-route53");
import * as targets from "aws-cdk-lib/aws-route53-targets";
import { ICertificate } from "aws-cdk-lib/aws-certificatemanager";

import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";

export interface IWebsiteConfigProps {
  hostedZone: route53.IHostedZone;
  domainName: string;
  s3BucketName: string;
  certificate: ICertificate;
}

export class WebsiteConfig extends Construct {
  public readonly websiteS3Bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: IWebsiteConfigProps) {
    super(scope, id);

    const { hostedZone, s3BucketName, certificate, domainName } = props;

    // Setup S3
    this.websiteS3Bucket = new s3.Bucket(this, "WebsiteBucket", {
      bucketName: s3BucketName,
    });
    const websiteCloudfrontOriginAccessIdentity =
      new cloudfront.OriginAccessIdentity(
        this,
        "WebsiteCloudfrontOriginAccessIdentity"
      );
    const websiteS3CloudfrontStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
    });
    websiteS3CloudfrontStatement.addActions("s3:GetObject");
    websiteS3CloudfrontStatement.addResources(
      `${this.websiteS3Bucket.bucketArn}/*`
    );
    websiteS3CloudfrontStatement.addCanonicalUserPrincipal(
      websiteCloudfrontOriginAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
    );
    this.websiteS3Bucket.addToResourcePolicy(websiteS3CloudfrontStatement);

    // Setup CloudFront
    const websiteCloudFrontDistribution = new cloudfront.Distribution(
      this,
      "WebsiteCloudFrontDistribution",
      {
        defaultRootObject: "index.html",
        defaultBehavior: {
          origin: new origins.S3Origin(this.websiteS3Bucket, {
            originAccessIdentity: websiteCloudfrontOriginAccessIdentity,
          }),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: new cloudfront.CachePolicy(
            this,
            "defaulWebsiteCachePolicy",
            { defaultTtl: Duration.seconds(0) }
          ),
        },
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
            ttl: Duration.seconds(0),
          },
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
            ttl: Duration.seconds(0),
          },
        ],
        domainNames: [domainName],
        certificate,
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      }
    );

    // Point DNS to CloudFront
    new route53.ARecord(this, "websiteARecord", {
      recordName: domainName,
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(websiteCloudFrontDistribution)
      ),
    });
  }
}
