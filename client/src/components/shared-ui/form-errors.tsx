import { useFormContext, useFormState } from "react-hook-form";

export function FormErrors() {

    const { control } = useFormContext();
    const { errors } = useFormState({ control });

    const getMessages = (errObj: any, prefix = ""): string[] => {
        let msgs: string[] = [];
        for (const key in errObj) {
            if (errObj[key]?.message) {
                msgs.push(`${prefix}${key}: ${errObj[key].message}`);
            } else if (typeof errObj[key] === "object" && errObj[key] !== null) {
                msgs = msgs.concat(getMessages(errObj[key], `${prefix}${key}.`));
            }
        }
        return msgs;
    };

    const errorMessages = getMessages(errors);

    if (errorMessages.length === 0) return null;

    return (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "1rem", borderRadius: "0.375rem", marginBottom: "1rem" }}>
            <strong>Please fix the following errors:</strong>
            <ul style={{ marginLeft: "1.25rem", listStyleType: "disc" }}>
                {errorMessages.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                ))}
            </ul>
        </div>
    );
}
