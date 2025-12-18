"use client"

import { Mail } from "lucide-react"
import { motion } from "framer-motion"

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-12 border-t border-border/50 bg-background/50 py-6 sm:mt-16 sm:py-8 md:mt-20 md:py-12"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6 text-center sm:flex-row sm:justify-between sm:gap-4">
          <div className="space-y-3 sm:space-y-2">
            <p className="text-xs font-semibold text-foreground sm:text-sm">Contact Oduko</p>
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
              <a
                href="mailto:odukoregistrydev@gmail.com"
                className="flex items-center gap-2 break-all text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm sm:break-normal"
              >
                <Mail className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
                <span className="break-all sm:break-normal">odukoregistrydev@gmail.com</span>
              </a>
            </div>
          </div>
          <div className="text-xs text-muted-foreground sm:text-sm">
            <p className="break-words">
              © {new Date().getFullYear()} Oduko Tax Calculator. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

