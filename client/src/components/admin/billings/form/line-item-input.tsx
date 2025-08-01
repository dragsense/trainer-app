import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { TCustomInputWrapper } from "@/@types/form/field.type";

export const LineItemInput: React.FC<TCustomInputWrapper> = ({
  value,
  onChange,
  disabled,
}) => {
  const lineItems = Array.isArray(value) ? value : [];

  const updateItem = (index: number, key: string, val: any) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [key]: val,
    };
    onChange(updated);
  };

  const removeItem = (index: number) => {
    const updated = [...lineItems];
    updated.splice(index, 1);
    onChange(updated);
  };

  const addItem = () => {
    const newItem = {
      description: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      tax: 0,
    };
    onChange([...lineItems, newItem]);
  };

  return (
    <div className="space-y-4">
      {lineItems.map((item, index) => (
        <Card key={index} className="relative">
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <Label>Description</Label>
              <Input
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                placeholder="e.g. Personal Training Session"
                disabled={disabled}
              />
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", parseInt(e.target.value || "0"))
                }
                min={1}
                disabled={disabled}
              />
            </div>

            <div>
              <Label>Unit Price (cents)</Label>
              <Input
                type="number"
                value={item.unitPrice}
                onChange={(e) =>
                  updateItem(index, "unitPrice", parseInt(e.target.value || "0"))
                }
                min={0}
                disabled={disabled}
              />
            </div>

            <div>
              <Label>Amount (quantity × unit price)</Label>
              <Input
                type="number"
                value={item.amount}
                onChange={(e) =>
                  updateItem(index, "amount", parseInt(e.target.value || "0"))
                }
                min={0}
                disabled={disabled}
              />
            </div>

            <div>
              <Label>Tax (optional)</Label>
              <Input
                type="number"
                value={item.tax}
                onChange={(e) =>
                  updateItem(index, "tax", parseInt(e.target.value || "0"))
                }
                min={0}
                disabled={disabled}
              />
            </div>
          </CardContent>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            onClick={() => removeItem(index)}
            disabled={disabled}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        disabled={disabled}
      >
        + Add Line Item
      </Button>
    </div>
  );
};
