import { Request, Response, NextFunction } from "express";
declare type ValidatedReqTypes = "body" | "params" | "query";
interface ValidatorBaseKeys {
    key: string | string[];
}
interface ValidatorKeysWithFunction extends ValidatorBaseKeys {
    validators: [(value: any, ...others: any) => boolean, string][];
    required?: boolean;
    validatorsWithParams: never;
}
interface ValidatorKeys extends ValidatorBaseKeys {
    validators: never;
    required: never;
    type: "object" | "array";
    validatorsWithParams: ValidatorKeysWithFunction[];
}
declare type ValidationParam = Partial<Record<ValidatedReqTypes, (ValidatorKeysWithFunction | ValidatorKeys)[]>>;
/**
 * validateRequest
 * @param validateParams ValidationParam
 */
declare function validateMiddleware(validateParams: ValidationParam): (req: Request, res: Response, next: NextFunction) => void;
export = validateMiddleware;
