from aws_cdk import (
    Stack,
    RemovalPolicy,
    CfnOutput,
    Duration,
    Tags,
    aws_dynamodb as dynamodb,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_wafv2 as wafv2,
    aws_iam as iam,
    aws_certificatemanager as acm,
)
from constructs import Construct

class SpaDirectoryStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Stack-level tags (inherited by all resources)
        Tags.of(self).add("Project", "directory-aws-latam")
        Tags.of(self).add("Environment", "prod")
        Tags.of(self).add("Cost-Center", "aws-program-builder")

        # 1. DynamoDB Table
        table = dynamodb.Table(
            self, "DirectoryBuildersTable",
            partition_key=dynamodb.Attribute(name="pk", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
            time_to_live_attribute="ttl"
        )
        Tags.of(table).add("Name", "database-directory-aws-latam")

        # 1b. GSI for email lookups
        table.add_global_secondary_index(
            index_name="email-index",
            partition_key=dynamodb.Attribute(name="email", type=dynamodb.AttributeType.STRING)
        )

        # 2. S3 Bucket for Website
        website_bucket = s3.Bucket(
            self, "WebsiteBucket",
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            encryption=s3.BucketEncryption.S3_MANAGED
        )
        Tags.of(website_bucket).add("Name", "frontend-hosting-directory-aws-latam")

        # 3. CloudFront Distribution
        # Import existing ACM certificate for custom domain
        certificate = acm.Certificate.from_certificate_arn(
            self, "SiteCertificate",
            "arn:aws:acm:us-east-1:057563282754:certificate/8a1f03d7-87aa-4f90-b4d9-d38a92e10ec8"
        )

        distribution = cloudfront.Distribution(
            self, "WebsiteDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3Origin(website_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowed_methods=cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                cached_methods=cloudfront.CachedMethods.CACHE_GET_HEAD,
            ),
            domain_names=["awsbuilder.dev"],
            certificate=certificate,
            minimum_protocol_version=cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
            default_root_object="index.html",
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.minutes(0)
                ),
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.minutes(0)
                )
            ]
        )

        # 4. WAF v2
        # Basic Rate Limit Rule
        waf = wafv2.CfnWebACL(
            self, "RateLimitWAF",
            default_action=wafv2.CfnWebACL.DefaultActionProperty(allow={}),
            scope="CLOUDFRONT",
            visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                cloud_watch_metrics_enabled=True,
                metric_name="RateLimitWAF",
                sampled_requests_enabled=True
            ),
            rules=[
                wafv2.CfnWebACL.RuleProperty(
                    name="RateLimitRule",
                    priority=1,
                    action=wafv2.CfnWebACL.RuleActionProperty(block={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        rate_based_statement=wafv2.CfnWebACL.RateBasedStatementProperty(
                            limit=1000,
                            aggregate_key_type="IP"
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="RateLimitRule",
                        sampled_requests_enabled=True
                    )
                )
            ]
        )
        
        # Associate WAF with CloudFront
        # Note: WAF for CloudFront must be created in us-east-1. 
        # Since this stack is deployed to us-east-1 (as per requirements), this works.
        # However, associating WAF with CloudFront in CDK can sometimes be tricky if cross-region.
        # Assuming deployment is in us-east-1.
        
        # For CloudFront WAF, we don't use CfnWebACLAssociation, we set web_acl_id on the distribution
        # But standard L2 Distribution construct doesn't expose web_acl_id easily in older versions, 
        # but in newer versions it does. Let's check if we can pass it or need escape hatch.
        # Actually, standard way is to pass web_acl_id to Distribution.
        
        # Since we are creating WAF inside the stack, we can reference its ARN.
        # But wait, CfnWebACL for CloudFront expects 'CLOUDFRONT' scope.
        
        # To attach to the distribution, we need to use the escape hatch or property if available.
        # distribution.node.default_child.web_acl_id = waf.attr_arn
        
        cfn_distribution = distribution.node.default_child
        cfn_distribution.web_acl_id = waf.attr_arn
        Tags.of(distribution).add("Name", "cdn-directory-aws-latam")


        # 5. Lambda Function
        backend_lambda = _lambda.Function(
            self, "BackendHandler",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="main.handler",
            code=_lambda.Code.from_asset("lambda"),
            timeout=Duration.seconds(15),
            environment={
                "TABLE_NAME": table.table_name,
                "SES_SENDER_EMAIL": "noreply@awsbuilder.dev",
                "CAPTCHA_SECRET_KEY": "placeholder-captcha-key"
            }
        )
        Tags.of(backend_lambda).add("Name", "api-backend-directory-aws-latam")

        # Grant Lambda permissions to write to DynamoDB
        table.grant_read_write_data(backend_lambda)

        # Grant Lambda SES send email permission
        backend_lambda.add_to_role_policy(
            iam.PolicyStatement(
                actions=["ses:SendEmail", "ses:SendRawEmail"],
                resources=["*"]
            )
        )

        # 6. API Gateway
        api = apigateway.LambdaRestApi(
            self, "DirectoryApi",
            handler=backend_lambda,
            proxy=True,
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_origins=apigateway.Cors.ALL_ORIGINS,
                allow_methods=apigateway.Cors.ALL_METHODS
            )
        )
        Tags.of(api).add("Name", "rest-api-directory-aws-latam")

        # 7. WAF v2 for API Gateway (REGIONAL scope)
        api_waf = wafv2.CfnWebACL(
            self, "ApiGatewayWAF",
            default_action=wafv2.CfnWebACL.DefaultActionProperty(allow={}),
            scope="REGIONAL",
            visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                cloud_watch_metrics_enabled=True,
                metric_name="ApiGatewayWAF",
                sampled_requests_enabled=True
            ),
            rules=[
                wafv2.CfnWebACL.RuleProperty(
                    name="ApiRateLimitRule",
                    priority=1,
                    action=wafv2.CfnWebACL.RuleActionProperty(block={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        rate_based_statement=wafv2.CfnWebACL.RateBasedStatementProperty(
                            limit=1000,
                            aggregate_key_type="IP"
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="ApiRateLimitRule",
                        sampled_requests_enabled=True
                    )
                ),
                wafv2.CfnWebACL.RuleProperty(
                    name="AWSManagedRulesCommonRuleSet",
                    priority=2,
                    override_action=wafv2.CfnWebACL.OverrideActionProperty(none={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        managed_rule_group_statement=wafv2.CfnWebACL.ManagedRuleGroupStatementProperty(
                            vendor_name="AWS",
                            name="AWSManagedRulesCommonRuleSet"
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="AWSManagedRulesCommonRuleSet",
                        sampled_requests_enabled=True
                    )
                )
            ]
        )

        # Associate WAF with API Gateway stage
        wafv2.CfnWebACLAssociation(
            self, "ApiWafAssociation",
            resource_arn=api.deployment_stage.stage_arn,
            web_acl_arn=api_waf.attr_arn
        )

        # Outputs
        CfnOutput(self, "FrontendURL", value=f"https://{distribution.distribution_domain_name}")
        CfnOutput(self, "ApiEndpoint", value=api.url)
