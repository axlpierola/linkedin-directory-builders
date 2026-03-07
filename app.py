#!/usr/bin/env python3
import os
import aws_cdk as cdk
from infrastructure import SpaDirectoryStack

app = cdk.App()
SpaDirectoryStack(app, "SpaDirectoryStack",
    env=cdk.Environment(account=os.getenv('CDK_DEFAULT_ACCOUNT'), region=os.getenv('CDK_DEFAULT_REGION')),
)

app.synth()
