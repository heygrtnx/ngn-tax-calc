"use client"

import { useState } from "react"
import TaxCalculator from "@/components/tax-calculator"
import TaxExplanation from "@/components/tax-explanation"
import HowCalculatorWorks from "@/components/how-calculator-works"
import TaxBrackets from "@/components/tax-brackets"
import Footer from "@/components/footer"
import Image from "next/image"
import { motion } from "framer-motion"

interface TaxResult {
  grossIncome: number
  totalDeductions: number
  taxableIncome: number
  totalTax: number
  netIncome: number
  effectiveRate: number
}

export default function Home() {
  const [calculationResult, setCalculationResult] = useState<TaxResult | null>(null)
  const [period, setPeriod] = useState<"annual" | "monthly">("annual")

  const handleResultChange = (result: TaxResult | null, viewPeriod: "annual" | "monthly") => {
    setCalculationResult(result)
    setPeriod(viewPeriod)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-center sm:mb-10"
        >
          <Image
            src="/oduko-logo.png"
            alt="Oduko"
            width={240}
            height={60}
            className="h-auto w-36 sm:w-48 md:w-56"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 text-center sm:mb-16"
        >
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Nigeria Tax Calculator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground sm:mt-6 sm:text-xl md:text-2xl">
            Calculate your personal income tax based on Nigerian tax laws
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-10"
        >
          <HowCalculatorWorks />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 sm:mb-10"
        >
          <TaxBrackets />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TaxCalculator onResultChange={handleResultChange} />
        </motion.div>

        {calculationResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="mt-8 sm:mt-10"
          >
            <TaxExplanation
              grossIncome={calculationResult.grossIncome}
              totalDeductions={calculationResult.totalDeductions}
              taxableIncome={calculationResult.taxableIncome}
              totalTax={calculationResult.totalTax}
              netIncome={calculationResult.netIncome}
              period={period}
            />
          </motion.div>
        )}
      </div>
      <Footer />
    </main>
  )
}
