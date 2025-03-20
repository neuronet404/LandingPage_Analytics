"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { PopUpBoxTermsAndCondition } from "./popUp"

interface Props {
    terms: boolean;
    checkFn: (value: boolean) => void;
}
export function CheckboxWithText({ terms, checkFn }: Props) {
    return (
        <div className="items-top flex space-x-2">
            <Checkbox id="terms1" checked={terms} onCheckedChange={() => checkFn(!terms)} />
            <div className="grid gap-1.5 leading-none">
                <label
                    htmlFor="terms1"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Accept terms and conditions
                </label>
                <p className="text-sm text-muted-foreground ">
                    You agree to our <PopUpBoxTermsAndCondition />
                </p>
            </div>
        </div>
    )
}
