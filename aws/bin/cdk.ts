#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('aws-cdk-lib');
import { CdkStack } from '../lib/cdk-stack';
import * as config from "../config"

const app = new cdk.App();
new CdkStack(app, config.STACK_NAME());
app.synth();