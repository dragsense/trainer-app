import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Resolver } from "react-hook-form";

export function classValidatorResolver<T extends object>(
  dtoClass: ClassConstructor<T>
): Resolver<T> {
  return async (values) => {
    const dto = plainToInstance(dtoClass, values);
    
    // Get the actual properties that exist on the DTO instance
    const dtoProperties = Object.keys(dto);
    
    // Check for extra properties that shouldn't be there
    const extraProperties = Object.keys(values).filter(key => 
      !dtoProperties.includes(key)
    );
    
    // If there are extra properties, return error for them
    if (extraProperties.length > 0) {
      const extraErrors = extraProperties.reduce((acc, prop) => {
        acc[prop] = {
          type: "validation",
          message: `Property '${prop}' is not allowed`,
        };
        return acc;
      }, {} as Record<string, any>);
      
      return { values: {}, errors: extraErrors };
    }
    
    // Only validate properties that actually exist on the DTO
    const errors = await validate(dto, { 
      skipMissingProperties: false,
      whitelist: true,
      forbidNonWhitelisted: false
    });

    // Filter out errors for properties that don't exist on the DTO
    const filteredErrors = errors.filter(err => 
      dtoProperties.includes(err.property)
    );

    if (filteredErrors.length === 0) {
      return { values, errors: {} };
    }

    // Convert class-validator errors into react-hook-form format
    const formErrors = filteredErrors.reduce((acc, err) => {
      if (err.constraints) {
        acc[err.property] = {
          type: "validation",
          message: Object.values(err.constraints)[0], // take first message
        };
      }
      return acc;
    }, {} as Record<string, any>);

    return { values: {}, errors: formErrors };
  };
}
