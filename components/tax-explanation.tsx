"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Coins, Calculator, PiggyBank, Home, Shield } from "lucide-react"
import { motion } from "framer-motion"

interface TaxExplanationProps {
  grossIncome: number
  totalDeductions: number
  taxableIncome: number
  totalTax: number
  netIncome: number
  period: "annual" | "monthly"
}

export default function TaxExplanation({
  grossIncome,
  totalDeductions,
  taxableIncome,
  totalTax,
  netIncome,
  period,
}: TaxExplanationProps) {
  const pensionDeduction = grossIncome * 0.08
  const mortgageDeduction = grossIncome * 0.1
  const rentDeduction = Math.min(grossIncome * 0.2, 500000)
  const insuranceDeduction = 300000

  const formatCurrency = (amount: number) => {
    const displayAmount = period === "monthly" ? amount / 12 : amount
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(displayAmount)
  }

  const calculateTaxBreakdown = () => {
    const brackets = [
      { min: 0, max: 800000, rate: 0, name: "First ₦800,000 at 0%" },
      { min: 800001, max: 3000000, rate: 0.15, name: "at 15%" },
      { min: 3000001, max: 12000000, rate: 0.18, name: "at 18%" },
      { min: 12000001, max: 25000000, rate: 0.21, name: "at 21%" },
      { min: 25000001, max: 50000000, rate: 0.23, name: "at 23%" },
      { min: 50000001, max: Number.POSITIVE_INFINITY, rate: 0.25, name: "at 25%" },
    ]

    let remainingIncome = taxableIncome
    const breakdown: { description: string; tax: number }[] = []

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break

      const bracketSize = bracket.max - bracket.min + 1
      const amountInBracket = Math.min(remainingIncome, bracketSize)
      const taxForBracket = amountInBracket * bracket.rate

      if (amountInBracket > 0) {
        if (bracket.rate === 0) {
          breakdown.push({
            description: bracket.name,
            tax: 0,
          })
        } else {
          breakdown.push({
            description: `Next ${formatCurrency(amountInBracket)} ${bracket.name}`,
            tax: taxForBracket,
          })
        }
        remainingIncome -= amountInBracket
      }
    }

    return breakdown
  }

  const taxBreakdown = calculateTaxBreakdown()

  return (
    <div className="mt-8 space-y-6">
      {/* Example Calculation - Now using dynamic values */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-accent shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Calculator className="h-5 w-5 text-accent" />
              Your Tax Calculation ({period === "monthly" ? "Monthly" : "Annual"})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="rounded-lg bg-muted p-3 md:p-4">
                <p className="text-sm font-semibold text-foreground md:text-base">
                  Based on your {period} income of {formatCurrency(grossIncome)}:
                </p>
              </div>

              <div className="space-y-2 text-sm md:text-base">
                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-muted-foreground">Gross Income:</span>
                  <span className="font-semibold">{formatCurrency(grossIncome)}</span>
                </div>

                <Separator />
                <p className="text-xs font-semibold text-muted-foreground">Deductions:</p>

                <div className="flex justify-between pl-4">
                  <span className="text-muted-foreground">Pension (8%):</span>
                  <span>- {formatCurrency(pensionDeduction)}</span>
                </div>
                <div className="flex justify-between pl-4">
                  <span className="text-muted-foreground">Mortgage (10%):</span>
                  <span>- {formatCurrency(mortgageDeduction)}</span>
                </div>
                <div className="flex justify-between pl-4">
                  <span className="text-muted-foreground">Rent (20% max ₦500k):</span>
                  <span>- {formatCurrency(rentDeduction)}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-2 pl-4">
                  <span className="text-muted-foreground">Insurance:</span>
                  <span>- {formatCurrency(insuranceDeduction)}</span>
                </div>

                <div className="flex justify-between rounded-lg bg-secondary p-2 font-semibold">
                  <span>Taxable Income:</span>
                  <span>{formatCurrency(taxableIncome)}</span>
                </div>

                <Separator />
                <p className="text-xs font-semibold text-muted-foreground">Tax Calculation:</p>

                <div className="space-y-1 pl-4 text-xs md:text-sm">
                  {taxBreakdown.map((item, index) => (
                    <p key={index} className="text-muted-foreground">
                      {item.description} = {formatCurrency(item.tax)}
                    </p>
                  ))}
                </div>

                <div className="flex justify-between rounded-lg bg-primary p-3 font-semibold text-primary-foreground">
                  <span>Total Tax:</span>
                  <span>{formatCurrency(totalTax)}</span>
                </div>

                <div className="flex justify-between rounded-lg bg-accent p-3 font-semibold text-accent-foreground">
                  <span>Take-Home Income:</span>
                  <span>{formatCurrency(netIncome)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Deductions Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Coins className="h-5 w-5 text-primary" />
              What Are Deductions?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              Deductions are amounts subtracted from your gross income before calculating tax. This means you don't pay
              tax on these portions of your income. The calculator automatically applies these deductions for you:
            </p>

            <div className="space-y-3">
              {[
                {
                  icon: PiggyBank,
                  title: "Pension Contribution (Pencom)",
                  desc: "8% of your income goes to your retirement pension fund. This is automatically deducted from your taxable income, so you don't pay tax on it.",
                },
                {
                  icon: Home,
                  title: "Mortgage (Loan Relief)",
                  desc: "Interest on loans for owner-occupied residential housing can be deducted from your taxable income. You can deduct up to 10% of your gross income for mortgage interest payments on your primary residence.",
                },
                {
                  icon: Home,
                  title: "Annual Rent Relief",
                  desc: "You can deduct 20% of your annual rent (up to a maximum of ₦500,000) from your taxable income. This helps renters reduce their tax bill.",
                },
                {
                  icon: Shield,
                  title: "Life Insurance",
                  desc: "Premium payments for life insurance policies are fully deductible from your taxable income, encouraging you to protect your family's future.",
                },
              ].map((deduction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="rounded-lg border border-l-4 border-l-primary bg-card p-3 md:p-4"
                >
                  <div className="flex items-start gap-3">
                    <deduction.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground md:text-base">{deduction.title}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">{deduction.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Important Notes */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-muted-foreground/20 bg-muted/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-inside space-y-2 text-sm leading-relaxed text-muted-foreground md:text-base">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  This calculator is for personal income tax estimation only and may not reflect all special cases or
                  exemptions.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>All calculations are based on current Nigerian tax laws and regulations.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  Your employer will typically deduct these taxes from your salary each month through the Pay As You
                  Earn (PAYE) system.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  For accurate tax filing and advice specific to your situation, please consult with a qualified tax
                  professional or your state's Internal Revenue Service.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
