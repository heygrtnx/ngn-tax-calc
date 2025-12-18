"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function TaxBrackets() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card className="shadow-sm">
        <CardHeader>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex w-full items-center justify-between text-left transition-colors hover:text-primary"
          >
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Calculator className="h-5 w-5 text-primary" />
              Understanding Tax Brackets
            </CardTitle>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <CardContent className="space-y-4">
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
                  Nigeria uses a progressive tax system, which means the more you earn, the higher percentage you pay on
                  the additional income. Here's how it works:
                </p>

                <div className="space-y-3">
                  {[
                    { title: "First ₦800,000", desc: "You pay no tax on the first ₦800,000 you earn", rate: "0%" },
                    {
                      title: "₦800,001 - ₦3,000,000",
                      desc: "Pay 15% only on income between these amounts",
                      rate: "15%",
                    },
                    {
                      title: "₦3,000,001 - ₦12,000,000",
                      desc: "Pay 18% only on income between these amounts",
                      rate: "18%",
                    },
                    {
                      title: "₦12,000,001 - ₦25,000,000",
                      desc: "Pay 21% only on income between these amounts",
                      rate: "21%",
                    },
                    {
                      title: "₦25,000,001 - ₦50,000,000",
                      desc: "Pay 23% only on income between these amounts",
                      rate: "23%",
                    },
                    {
                      title: "Above ₦50,000,000",
                      desc: "Pay 25% on any income above this amount",
                      rate: "25%",
                    },
                  ].map((bracket, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="rounded-lg border border-border bg-muted/50 p-3 md:p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground md:text-base">{bracket.title}</p>
                          <p className="text-xs text-muted-foreground md:text-sm">{bracket.desc}</p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary md:px-3 md:text-sm">
                          {bracket.rate}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
