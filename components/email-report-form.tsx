"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Loader2, CheckCircle2 } from "lucide-react"
import { sendTaxReport } from "@/app/actions/send-tax-report"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EmailReportFormProps {
  taxData: {
    grossIncome: number
    totalDeductions: number
    taxableIncome: number
    totalTax: number
    netIncome: number
    effectiveRate: number
    period: "annual" | "monthly"
    mortgage: number
    pension: number
    rent: number
    insurance: number
  }
}

export default function EmailReportForm({ taxData }: EmailReportFormProps) {
  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!firstName.trim() || !email.trim()) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    if (!consent) {
      setError("Please provide consent to receive the report")
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      // Validate that all numeric values are valid numbers
      const validatedData = {
        firstName,
        email,
        grossIncome: Number(taxData.grossIncome) || 0,
        totalDeductions: Number(taxData.totalDeductions) || 0,
        taxableIncome: Number(taxData.taxableIncome) || 0,
        totalTax: Number(taxData.totalTax) || 0,
        netIncome: Number(taxData.netIncome) || 0,
        effectiveRate: Number(taxData.effectiveRate) || 0,
        period: taxData.period,
        mortgage: Number(taxData.mortgage) || 0,
        pension: Number(taxData.pension) || 0,
        rent: Number(taxData.rent) || 0,
        insurance: Number(taxData.insurance) || 0,
      }

      const result = await sendTaxReport(validatedData)

      if (result.success) {
        setIsSuccess(true)
        setTimeout(() => {
          setIsSuccess(false)
          setFirstName("")
          setEmail("")
          setConsent(false)
          setIsOpen(false)
        }, 3000)
      } else {
        setError(result.error || "Failed to send report")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="w-full text-lg font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90"
          >
            <Mail className="mr-3 h-6 w-6" />
            Get Your Tax Report via Email
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Mail className="h-5 w-5 text-primary" />
              Get Your Tax Report via Email
            </DialogTitle>
            <DialogDescription className="text-sm">
              Enter your details to receive a detailed tax report in your inbox
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">Report Sent Successfully!</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Check your email for your detailed tax report
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                    disabled={isLoading}
                    className="mt-0.5 h-5 w-5 border-2"
                  />
                  <Label
                    htmlFor="consent"
                    className="text-xs leading-relaxed text-muted-foreground cursor-pointer font-normal"
                  >
                    I consent to receive my tax report via email
                  </Label>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                  >
                    {error}
                  </motion.div>
                )}

                <Button type="submit" disabled={isLoading || !consent} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Report...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Tax Report to Email
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
