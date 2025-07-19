"use client"
 
import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
 
export function CollapsibleInherited({title, children} : {title: string, children: React.ReactNode})
{
    const [isOpen, setIsOpen] = React.useState(false);
 
    return (
        <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full space-y-2 border rounded-md"
        >
            <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between space-x-4 px-4 cursor-pointer">
                    <h4 className="text-sm font-semibold">
                        {title}
                    </h4>
                    
                    <Button variant="ghost" size="sm" className="cursor-pointer">
                        <ChevronsUpDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                    </Button>
                    
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
                <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">{children}</div>
            </CollapsibleContent>
        </Collapsible>
    )
}