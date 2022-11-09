import { Request, Response, NextFunction } from "express";
import { ValidationError, BaseError } from "./error";

type ValidatedReqTypes = "body" | "params" | "query";

interface ValidatorBaseKeys {
  key: string | string[];
}

interface ValidatorKeysWithFunction extends ValidatorBaseKeys {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
type ValidationParam = Partial<
  Record<ValidatedReqTypes, (ValidatorKeysWithFunction | ValidatorKeys)[]>
>;

/**
 * validateRequest
 * @param validateParams ValidationParam
 */
function validateMiddleware(validateParams: ValidationParam) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: Record<string, string>[] = [];
      for (const [key, value] of Object.entries(validateParams) as unknown as [
        ValidatedReqTypes,
        (ValidatorKeysWithFunction | ValidatorKeys)[]
      ][]) {
        for (const param of value) {
          const { key: keyArray } = param;
          if (param.validators !== undefined) {
            for (const k of [keyArray].flat()) {
              if (
                !doesRequiredFieldExist(
                  req[key],
                  errors,
                  k,
                  param as ValidatorKeysWithFunction
                )
              ) {
                errors.length > 0 && next(new ValidationError(errors));
                return;
              }
              if (
                !validateFunctionWithKey(
                  req[key],
                  errors,
                  k,
                  param as ValidatorKeysWithFunction
                )
              ) {
                next(new ValidationError(errors));
                return;
              }
            }
          } else if (param.validatorsWithParams !== undefined) {
            for (const k of [keyArray].flat()) {
              if ((param as ValidatorKeys).type === "array") {
                if (
                  !req[key] ||
                  !req[key][k] ||
                  !Array.isArray(JSON.parse(req[key][k]))
                ) {
                  errors.push({ [k]: `${k} is expected to be an array` });
                  next(new ValidationError(errors));
                  return;
                }
                const parsedResult = JSON.parse(req[key][k]) as {
                  [key: string]: unknown;
                }[];
                for (let index = 0; index < parsedResult.length; index++) {
                  const value = parsedResult[index];
                  if (!value || !isObject(value)) {
                    errors.push({
                      [k]: `Array ${k} at index ${index} is expected to be an object`,
                    });
                    next(new ValidationError(errors));
                    return;
                  }

                  for (const validator of param.validatorsWithParams) {
                    const { key: validatorKey } = validator;
                    for (const v of [validatorKey].flat()) {
                      if (
                        !doesRequiredFieldExist(value, errors, v, validator, k)
                      ) {
                        errors.length > 0 && next(new ValidationError(errors));
                        return;
                      }
                      if (
                        !validateFunctionWithKey(value, errors, v, validator)
                      ) {
                        next(new ValidationError(errors));
                        return;
                      }
                    }
                  }
                }
              } else {
                if (
                  !req[key] ||
                  !req[key][k] ||
                  !isObject(JSON.parse(req[key][k]))
                ) {
                  errors.push({
                    [k]: `${k} is expected to be an ${
                      (param as ValidatorKeys).type
                    }`,
                  });
                  next(new ValidationError(errors));
                  return;
                }

                const reqFiltered = JSON.parse(req[key][k]) as {
                  [key: string]: unknown;
                };
                for (const validator of param.validatorsWithParams) {
                  const { key: validatorKey } = validator;
                  for (const v of [validatorKey].flat()) {
                    if (
                      !doesRequiredFieldExist(
                        reqFiltered,
                        errors,
                        v,
                        validator,
                        k
                      )
                    ) {
                      errors.length > 0 && next(new ValidationError(errors));
                      return;
                    }
                    if (
                      !validateFunctionWithKey(
                        reqFiltered,
                        errors,
                        v,
                        validator
                      )
                    ) {
                      next(new ValidationError(errors));
                      return;
                    }
                  }
                }
              }
            }
          }
        }
      }

      next();
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new BaseError(error.message));
      } else {
        next(new BaseError("Something went wrong."));
      }
    }
  };
}

function validateFunctionWithKey(
  reqFiltered: { [key: string]: unknown },
  errors: Record<string, string>[],
  property: string,
  param: Omit<ValidatorKeysWithFunction, "key">
) {
  const { validators } = param;
  if (validators === undefined) {
    return true;
  }
  for (const validator of validators) {
    const [validatorFn, errorMessage] = validator;
    if (!validatorFn) {
      continue;
    }
    if (
      reqFiltered &&
      reqFiltered[property] &&
      !validatorFn(reqFiltered[property])
    ) {
      errors.push({ [property]: errorMessage });
      if (errors.length > 0) {
        return false;
      } else {
        return true;
      }
    }
  }
  return true;
}

function doesRequiredFieldExist(
  reqFiltered: { [key: string]: unknown },
  errors: Record<string, string>[],
  property: string,
  param: ValidatorKeysWithFunction,
  parent?: string
) {
  const { required } = param;
  if (required && !reqFiltered[property]) {
    if (parent) {
      errors.push({
        [`${parent}.${property}`]: `${parent}.${property} is required`,
      });
    } else {
      errors.push({ [property]: `${property} is required` });
    }
    return false;
  } else if (!required && !reqFiltered[property]) {
    return true;
  }
  return true;
}

/**
 * checks if a value is an object
 * @param obj unknown
 * @returns true/false
 */
const isObject = (obj: unknown) => {
  const ret = obj && Object.getPrototypeOf(obj) === Object.getPrototypeOf({});
  return ret;
};

export = validateMiddleware;
