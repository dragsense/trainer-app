import { User, Home, MapPin, Phone, Building, MailIcon } from "lucide-react";
import { z } from "zod";

// Types
import { EUserGender } from "@shared/enums/user.enum";
import { TFieldConfig } from "@/@types/form/field-config.type";


export const UserFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({ message: "Invalid email address." }).min(3, {
    message: "Email must be at least 5 characters long.",
  }),
  gender: z.nativeEnum(UserGender, {
    errorMap: () => ({ message: "Gender is required." }),
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  zip: z.string().regex(/^\d{5}(?:[-\s]\d{4})?$/, {
    message: "Please enter a valid ZIP code.",
  }),
  contactPhone: z
  .string()
  .regex(/^[\d\s()+-]{7,20}$/, {
    message: "Please enter a valid phone number.",
  }),
  llc: z
    .string()
    .max(100, "Company name too long")
    .optional()
    .or(z.literal("")),
  ect: z
    .string()
    .max(500, "Company info too long")
    .optional()
    .or(z.literal("")),
});

export type UserFormValues = z.infer<typeof UserFormSchema>;

export const useUserFormFields = (initialValues?: Partial<UserFormValues>) => {
  const defaultValues: UserFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    gender: UserGender.MALE,
    address: "",
    city: "",
    state: "",
    zip: "",
    contactPhone: "",
    llc: "",
    ect: "",
    ...initialValues,
  };

  const fields: TFieldConfig[] = [
    {
      id: "firstName",
      name: "firstName",
      label: "First Name",
      placeholder: "John",
      type: "text",
      required: true,
      startAdornment: <User className="h-4 w-4 text-gray-400" />,
    },
    {
      id: "lastName",
      name: "lastName",
      label: "Last Name",
      placeholder: "Doe",
      type: "text",
      required: true,
      startAdornment: <User className="h-4 w-4 text-gray-400" />,
    },
    {
      id: "email",
      name: "email",
      label: "Email",
      placeholder: "doeuser@email.cpom",
      type: "email",
      required: true,
      startAdornment: <MailIcon className="h-4 w-4 text-gray-400" />,
    },
    {
      id: "gender",
      name: "gender",
      label: "Gender",
      type: "select",
      required: true,
      className: "w-full",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
      ],
    },
    {
      id: "address",
      name: "address",
      label: "Street Address",
      type: "textarea",
      required: true,
      startAdornment: <Home className="h-4 w-4 text-gray-400" />,
    },
    {
      id: "city",
      name: "city",
      label: "City",
      type: "text",
      required: true,
      startAdornment: <MapPin className="h-4 w-4 text-gray-400" />,
    },
    {
      id: "state",
      name: "state",
      label: "State",
      type: "text",
      required: true,
    },
    {
      id: "zip",
      name: "zip",
      label: "Zip Code",
      type: "text",
      required: true,
    },
    {
      id: "contactPhone",
      name: "contactPhone",
      label: "Phone Number",
      type: "tel",
      required: true,
      startAdornment: <Phone className="h-4 w-4 text-gray-400" />,
      placeholder: "e.g. 123-456-7890",
    },
    {
      id: "llc",
      name: "llc",
      label: "Company Name (Optional)",
      type: "text",
      required: false,
      startAdornment: <Building className="h-4 w-4 text-gray-400" />,
    },
    {
      id: "ect",
      name: "ect",
      label: "Company Info (Optional)",
      type: "text",
      required: false,
    },
  ];

  return {
    defaultValues,
    fields,
  };
};
