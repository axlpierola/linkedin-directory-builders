#!/usr/bin/env python3
import os
import aws_cdk as cdk
from infrastructure import SpaDirectoryStack

app = cdk.App()

env = cdk.Environment(
    account=os.getenv('CDK_DEFAULT_ACCOUNT'),
    region=os.getenv('CDK_DEFAULT_REGION'),
)

# Production stack
SpaDirectoryStack(app, "SpaDirectoryStack",
    env=env,
    stage="prod",
    domain_name="awsbuilder.dev",
)

# Dev stack
SpaDirectoryStack(app, "SpaDirectoryStackDev",
    env=env,
    stage="dev",
    domain_name="dev.awsbuilder.dev",
)

app.synth()
