"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, PlusCircle, MinusCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Item = {
  name: string;
  quantity: number;
  capacity: number;
  unit: string;
};

const initialInventory: Item[] = [
  { name: "Urea", quantity: 25, capacity: 50, unit: "kg" },
  { name: "Seeds", quantity: 60, capacity: 100, unit: "kg" },
];

export function InventoryCard() {
  const [inventory, setInventory] = useState(initialInventory);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [updateValue, setUpdateValue] = useState(0);

  const handleUpdate = (itemName: string, amount: number) => {
    setInventory(
      inventory.map((item) =>
        item.name === itemName
          ? { ...item, quantity: Math.max(0, Math.min(item.capacity, item.quantity + amount)) }
          : item
      )
    );
  };
  
  const handleModalUpdate = () => {
    if(selectedItem) {
        setInventory(
            inventory.map((item) =>
              item.name === selectedItem.name
                ? { ...item, quantity: Math.max(0, Math.min(item.capacity, updateValue)) }
                : item
            )
        );
    }
    setSelectedItem(null);
    setUpdateValue(0);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">Inventory Tracker</CardTitle>
                <CardDescription>Manage your farm supplies</CardDescription>
            </div>
            <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {inventory.map((item) => (
          <Dialog key={item.name} onOpenChange={(open) => !open && setSelectedItem(null)}>
            <div key={item.name}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{item.name}</span>
                <span className="text-sm text-muted-foreground">
                  {item.quantity} / {item.capacity} {item.unit}
                </span>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" onClick={() => handleUpdate(item.name, -5)}>
                    <MinusCircle className="w-5 h-5"/>
                 </Button>
                <Progress value={(item.quantity / item.capacity) * 100} className="h-2" />
                <Button variant="ghost" size="icon" onClick={() => handleUpdate(item.name, 5)}>
                    <PlusCircle className="w-5 h-5"/>
                 </Button>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedItem(item);
                    setUpdateValue(item.quantity)
                    }}>
                    Set
                  </Button>
                </DialogTrigger>
              </div>
            </div>
            {selectedItem && (
                 <DialogContent>
                 <DialogHeader>
                   <DialogTitle>Update {selectedItem.name} Quantity</DialogTitle>
                   <DialogDescription>
                     Set the new quantity for your inventory.
                   </DialogDescription>
                 </DialogHeader>
                 <div className="grid gap-4 py-4">
                   <div className="grid grid-cols-4 items-center gap-4">
                     <Label htmlFor="quantity" className="text-right">
                       Quantity ({selectedItem.unit})
                     </Label>
                     <Input
                       id="quantity"
                       type="number"
                       value={updateValue}
                       onChange={(e) => setUpdateValue(Number(e.target.value))}
                       className="col-span-3"
                     />
                   </div>
                 </div>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="button" onClick={handleModalUpdate}>Save changes</Button>
                    </DialogClose>
                 </DialogFooter>
               </DialogContent>
            )}
          </Dialog>
        ))}
      </CardContent>
    </Card>
  );
}
