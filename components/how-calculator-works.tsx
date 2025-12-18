"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"
import { motion } from "framer-motion"

export default function HowCalculatorWorks() {
  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Info className="h-5 w-5 text-primary md:h-6 md:w-6" />
            How This Calculator Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-pretty text-sm leading-relaxed text-foreground md:text-base">
              This calculator helps you understand how much tax you'll pay on your annual income in Nigeria. It
              automatically calculates your tax based on Nigerian tax laws and includes all the deductions you're
              entitled to.
            </p>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              Simply enter your yearly salary or income, and we'll show you exactly how much tax you owe and how much
              money you'll take home after taxes. You can toggle between annual and monthly views to see your breakdown.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
