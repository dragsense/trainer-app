import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Resolver } from "react-hook-form";

export function classValidatorResolver<T extends object>(
  dtoClass: ClassConstructor<T>
): Resolver<T> {
  return async (values) => {
    
    const processedValues = processFormData(values);

    const dto = plainToInstance(dtoClass, processedValues);

    // Validate the DTO
    const errors = await validate(dto, { 
      skipMissingProperties: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      skipUndefinedProperties: true
    });

    if (errors.length === 0) {
      return { values, errors: {} };
    }

    // Convert class-validator errors into react-hook-form format
    const formErrors = errors.reduce((acc, err) => {
      if (err.constraints) {
        acc[err.property] = {
          type: "validation",
          message: Object.values(err.constraints)[0], // take first message
        };
      }
      
      // Handle nested validation errors
      if (err.children && err.children.length > 0) {
        err.children.forEach(childErr => {
          if (childErr.constraints) {
            // Skip errors for undefined properties
            if (childErr.property !== undefined) {
              const nestedProperty = `${err.property}.${childErr.property}`;
              acc[nestedProperty] = {
                type: "validation",
                message: Object.values(childErr.constraints)[0],
              };
            }
          }
        });
      }
      
      return acc;
    }, {} as Record<string, any>);

    return { values, errors: formErrors };
  };
}

// Helper function to process form data: convert dates to ISO strings and clean undefined values
function processFormData(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => processFormData(item));
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip undefined values to avoid validation errors for optional fields
      if (value !== undefined) {
        result[key] = processFormData(value);
      }
    }
    return result;
  }
  
  return obj;
}

