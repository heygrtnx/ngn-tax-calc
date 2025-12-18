"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calculator, Calendar, AlertCircle, TrendingUp, Wallet } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import EmailReportForm from "@/components/email-report-form"

interface TaxResult {
  grossIncome: number
  totalDeductions: number
  taxableIncome: number
  taxBreakdown: {
    bracket: string
    amount: number
    tax: number
  }[]
  totalTax: number
  netIncome: number
  effectiveRate: number
}

interface ExtendedTaxResult extends TaxResult {
  mortgage: number
  pension: number
  rent: number
  insurance: number
  period: "annual" | "monthly"
}

export default function TaxCalculator({
  onResultChange,
}: { onResultChange?: (result: TaxResult | null, period: "annual" | "monthly") => void }) {
  const [period, setPeriod] = useState<"annual" | "monthly">("annual")
  const [inputValue, setInputValue] = useState<string>("")
  const [result, setResult] = useState<TaxResult | null>(null)

  const [mortgage, setMortgage] = useState<string>("")
  const [pension, setPension] = useState<string>("")
  const [rent, setRent] = useState<string>("")
  const [insurance, setInsurance] = useState<string>("")

  const [isManualMortgage, setIsManualMortgage] = useState(false)
  const [isManualPension, setIsManualPension] = useState(false)
  const [isManualRent, setIsManualRent] = useState(false)
  const [isManualInsurance, setIsManualInsurance] = useState(false)

  const [emailReportData, setEmailReportData] = useState<ExtendedTaxResult | null>(null)

  const getAnnualGross = () => {
    const value = Number.parseFloat(inputValue.replace(/,/g, "")) || 0
    return period === "monthly" ? value * 12 : value
  }

  const annualGross = getAnnualGross()

  const defaultPension = annualGross * 0.08
  const defaultRent = Math.min(annualGross * 0.2, 500000)
  const defaultInsurance = 300000
  const defaultMortgage = annualGross * 0.1

  useEffect(() => {
    if (annualGross > 0) {
      if (!isManualMortgage) {
        setMortgage(Math.round(defaultMortgage).toLocaleString("en-US"))
      }
      if (!isManualPension) {
        setPension(Math.round(defaultPension).toLocaleString("en-US"))
      }
      if (!isManualRent) {
        setRent(Math.round(defaultRent).toLocaleString("en-US"))
      }
      if (!isManualInsurance) {
        setInsurance(defaultInsurance.toLocaleString("en-US"))
      }
    } else {
      if (!isManualMortgage) setMortgage("")
      if (!isManualPension) setPension("")
      if (!isManualRent) setRent("")
      if (!isManualInsurance) setInsurance("")
    }
  }, [annualGross, isManualMortgage, isManualPension, isManualRent, isManualInsurance])

  const pensionPayment = pension ? Number.parseFloat(pension.replace(/,/g, "")) : 0
  const annualRent = rent ? Number.parseFloat(rent.replace(/,/g, "")) : 0
  const insuranceAmount = insurance ? Number.parseFloat(insurance.replace(/,/g, "")) : 0
  const mortgageDeduction = mortgage ? Number.parseFloat(mortgage.replace(/,/g, "")) : 0

  const handlePeriodChange = (newPeriod: "annual" | "monthly") => {
    if (period !== newPeriod && inputValue) {
      const currentValue = Number.parseFloat(inputValue.replace(/,/g, ""))
      let convertedValue: number

      if (newPeriod === "monthly") {
        convertedValue = Math.round(currentValue / 12)
      } else {
        convertedValue = currentValue * 12
      }

      const formatted = convertedValue.toLocaleString("en-US")
      setInputValue(formatted)
    }
    setPeriod(newPeriod)
  }

  useEffect(() => {
    if (annualGross > 0) {
      calculateTax()
    } else {
      setResult(null)
      setEmailReportData(null) // Clear email data when no input
      if (onResultChange) onResultChange(null, period)
    }
  }, [annualGross, mortgageDeduction, pensionPayment, annualRent, insuranceAmount, period])

  const calculateTax = () => {
    const totalDeductions = mortgageDeduction + pensionPayment + annualRent + insuranceAmount
    const taxableIncome = Math.max(0, annualGross - totalDeductions)

    const brackets = [
      { min: 0, max: 800000, rate: 0, name: "First ₦800,000" },
      { min: 800001, max: 3000000, rate: 0.15, name: "₦800,001 - ₦3,000,000" },
      { min: 3000001, max: 12000000, rate: 0.18, name: "₦3,000,001 - ₦12,000,000" },
      { min: 12000001, max: 25000000, rate: 0.21, name: "₦12,000,001 - ₦25,000,000" },
      { min: 25000001, max: 50000000, rate: 0.23, name: "₦25,000,001 - ₦50,000,000" },
      { min: 50000001, max: Number.POSITIVE_INFINITY, rate: 0.25, name: "Above ₦50,000,000" },
    ]

    let remainingIncome = taxableIncome
    let totalTax = 0
    const taxBreakdown: { bracket: string; amount: number; tax: number }[] = []

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break

      const bracketSize = bracket.max - bracket.min + 1
      const amountInBracket = Math.min(remainingIncome, bracketSize)
      const taxForBracket = amountInBracket * bracket.rate

      if (amountInBracket > 0) {
        taxBreakdown.push({
          bracket: bracket.name,
          amount: amountInBracket,
          tax: taxForBracket,
        })
        totalTax += taxForBracket
        remainingIncome -= amountInBracket
      }
    }

    const netIncome = annualGross - totalTax
    const effectiveRate = annualGross > 0 ? (totalTax / annualGross) * 100 : 0

    const newResult = {
      grossIncome: annualGross,
      totalDeductions,
      taxableIncome,
      taxBreakdown,
      totalTax,
      netIncome,
      effectiveRate,
    }

    setResult(newResult)

    setEmailReportData({
      ...newResult,
      mortgage: mortgageDeduction,
      pension: pensionPayment,
      rent: annualRent,
      insurance: insuranceAmount,
      period: period,
    })

    if (onResultChange) onResultChange(newResult, period)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "")
    if (value === "" || /^\d+$/.test(value)) {
      const formatted = value === "" ? "" : Number.parseInt(value).toLocaleString("en-US")
      setInputValue(formatted)
    }
  }

  const handleDeductionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    manualSetter: React.Dispatch<React.SetStateAction<boolean>>,
    field?: string,
  ) => {
    const value = e.target.value.replace(/,/g, "")
    if (value === "" || /^\d+$/.test(value)) {
      let numericValue = value === "" ? 0 : Number.parseInt(value)

      if (field === "rent" && numericValue > 500000) {
        numericValue = 500000
      }

      const formatted = numericValue === 0 ? "" : numericValue.toLocaleString("en-US")
      setter(formatted)
      manualSetter(true)
    }
  }

  const formatCurrency = (amount: number) => {
    const displayAmount = period === "monthly" ? amount / 12 : amount
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(displayAmount)
  }

  const getZeroTaxReason = () => {
    if (!result || result.totalTax > 0) return null

    if (result.taxableIncome <= 800000) {
      return "Your taxable income is within the first ₦800,000 bracket which is tax-free under Nigerian tax law."
    }
    return "Your deductions have reduced your taxable income to the tax-free threshold."
  }

  const zeroTaxReason = getZeroTaxReason()

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {zeroTaxReason && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive" className="border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium text-red-900">{zeroTaxReason}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Input Section */}
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <Card className="border-border/50 shadow-lg backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="flex items-center gap-2.5 text-2xl">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                Income & Deductions
              </CardTitle>
              <CardDescription className="text-base">Enter your gross income (before tax)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">View Mode</Label>
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-1.5">
                  <button
                    onClick={() => handlePeriodChange("annual")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                      period === "annual"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    Annual
                  </button>
                  <button
                    onClick={() => handlePeriodChange("monthly")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                      period === "monthly"
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    Monthly
                  </button>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <Label htmlFor="gross-income" className="text-lg font-bold">
                  {period === "annual" ? "Annual Gross Income" : "Monthly Gross Income"}
                </Label>
                <motion.div className="relative" whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">
                    ₦
                  </span>
                  <Input
                    id="gross-income"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={inputValue}
                    onChange={handleInputChange}
                    className="h-14 border-2 pl-10 text-xl font-bold focus:border-primary"
                  />
                </motion.div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-5">
                <h3 className="text-base font-bold uppercase tracking-wide text-foreground">Deductions (Editable)</h3>

                <div className="grid gap-4">
                  {[
                    {
                      id: "mortgage",
                      label: "Mortgage",
                      hint: "10% default",
                      value: mortgage,
                      setter: setMortgage,
                      manualSetter: setIsManualMortgage,
                    },
                    {
                      id: "pension",
                      label: "Pension (Pencom)",
                      hint: "8% default",
                      value: pension,
                      setter: setPension,
                      manualSetter: setIsManualPension,
                    },
                    {
                      id: "rent",
                      label: "Annual Rent",
                      hint: "20% max ₦500k",
                      value: rent,
                      setter: setRent,
                      manualSetter: setIsManualRent,
                      field: "rent",
                    },
                    {
                      id: "insurance",
                      label: "Life Insurance",
                      hint: "₦300k default",
                      value: insurance,
                      setter: setInsurance,
                      manualSetter: setIsManualInsurance,
                    },
                  ].map((deduction, index) => (
                    <motion.div
                      key={deduction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.3 }}
                      className="space-y-2 rounded-lg bg-muted/30 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <Label htmlFor={deduction.id} className="text-sm font-semibold">
                          {deduction.label}
                        </Label>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {deduction.hint}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">
                          ₦
                        </span>
                        <Input
                          id={deduction.id}
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={deduction.value}
                          onChange={(e) =>
                            handleDeductionChange(e, deduction.setter, deduction.manualSetter, deduction.field)
                          }
                          className="h-11 pl-8 font-semibold"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <div className="space-y-6">
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="border-border/50 shadow-lg backdrop-blur-sm">
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="flex items-center gap-2.5 text-2xl">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  Tax Summary
                </CardTitle>
                <CardDescription className="text-base">
                  Your calculated tax breakdown ({period === "monthly" ? "monthly view" : "annual view"})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center justify-between rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 p-4"
                      >
                        <span className="text-sm font-semibold text-muted-foreground">Gross Income</span>
                        <span className="text-base font-bold text-foreground">
                          {formatCurrency(result.grossIncome)}
                        </span>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="flex items-center justify-between rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 p-4"
                      >
                        <span className="text-sm font-semibold text-accent-foreground">Total Deductions</span>
                        <span className="text-base font-bold text-accent-foreground">
                          {formatCurrency(result.totalDeductions)}
                        </span>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-between rounded-xl bg-gradient-to-br from-secondary to-secondary/70 p-4"
                      >
                        <span className="text-sm font-semibold text-secondary-foreground">Taxable Income</span>
                        <span className="text-base font-bold text-secondary-foreground">
                          {formatCurrency(result.taxableIncome)}
                        </span>
                      </motion.div>

                      <Separator className="my-4" />

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between rounded-xl bg-gradient-to-br from-primary to-primary/80 p-5 shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary-foreground/10 p-2">
                            <Calculator className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <span className="text-lg font-bold text-primary-foreground">Total Tax</span>
                        </div>
                        <span className="text-2xl font-bold text-primary-foreground">
                          {formatCurrency(result.totalTax)}
                        </span>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between rounded-xl bg-gradient-to-br from-accent to-accent/80 p-5 shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-accent-foreground/10 p-2">
                            <Wallet className="h-5 w-5 text-accent-foreground" />
                          </div>
                          <span className="text-lg font-bold text-accent-foreground">Net Income</span>
                        </div>
                        <span className="text-2xl font-bold text-accent-foreground">
                          {formatCurrency(result.netIncome)}
                        </span>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-xl border-2 border-border bg-card p-5"
                      >
                        <div className="text-center">
                          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Effective Tax Rate
                          </p>
                          <p className="mt-2 text-4xl font-bold text-foreground">{result.effectiveRate.toFixed(2)}%</p>
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="py-12 text-center md:py-16"
                    >
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Calculator className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-base font-medium text-muted-foreground">Enter your income to calculate tax</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {emailReportData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <EmailReportForm taxData={emailReportData} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
