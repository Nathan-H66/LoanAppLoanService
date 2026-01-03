import { CosmosLoanRepo } from '../infra/cosmos-loan-repo';
import { CosmosDeviceRepo } from '../infra/cosmos-device-repo';
import { OAuth2Validator } from '../infra/oauth2-validator';

export const loanRepo = new CosmosLoanRepo();
export const deviceRepo = new CosmosDeviceRepo();
export const authValidator = new OAuth2Validator();
