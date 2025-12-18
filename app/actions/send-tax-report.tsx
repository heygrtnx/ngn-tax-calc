"use server";

import nodemailer from "nodemailer";
import { incrementUserCount } from "@/lib/user-count-storage";

interface TaxReportData {
	firstName: string;
	email: string;
	grossIncome: number;
	totalDeductions: number;
	taxableIncome: number;
	totalTax: number;
	netIncome: number;
	effectiveRate: number;
	period: "annual" | "monthly";
	mortgage: number;
	pension: number;
	rent: number;
	insurance: number;
}

// User counter is now stored in a file for persistence

export async function sendTaxReport(data: TaxReportData) {
	try {
		console.log("[v0] Starting email send process");

		const smtpUser = process.env.SMTP_USER;
		const smtpPassword = process.env.SMTP_PASSWORD;

		if (!smtpUser || !smtpPassword) {
			console.error("[v0] Missing SMTP credentials");
			return {
				success: false,
				error: "Email service is not configured. Please contact support.",
			};
		}

		console.log("[v0] SMTP credentials found, creating transporter");

		const transporter = nodemailer.createTransport({
			service: "gmail",
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			auth: {
				user: smtpUser,
				pass: smtpPassword,
			},
			tls: {
				rejectUnauthorized: false,
			},
		});

		console.log("[v0] Transporter created successfully");

		const formatCurrency = (amount: number) => {
			const safeAmount = typeof amount === "number" && !isNaN(amount) ? amount : 0;
			return new Intl.NumberFormat("en-NG", {
				style: "currency",
				currency: "NGN",
				minimumFractionDigits: 2,
			}).format(safeAmount);
		};

		// Ensure all values are valid numbers
		const safeGrossIncome = typeof data.grossIncome === "number" && !isNaN(data.grossIncome) ? data.grossIncome : 0;
		const safeTotalDeductions = typeof data.totalDeductions === "number" && !isNaN(data.totalDeductions) ? data.totalDeductions : 0;
		const safeTaxableIncome = typeof data.taxableIncome === "number" && !isNaN(data.taxableIncome) ? data.taxableIncome : 0;
		const safeTotalTax = typeof data.totalTax === "number" && !isNaN(data.totalTax) ? data.totalTax : 0;
		const safeNetIncome = typeof data.netIncome === "number" && !isNaN(data.netIncome) ? data.netIncome : 0;
		const safeEffectiveRate = typeof data.effectiveRate === "number" && !isNaN(data.effectiveRate) ? data.effectiveRate : 0;
		const safeMortgage = typeof data.mortgage === "number" && !isNaN(data.mortgage) ? data.mortgage : 0;
		const safePension = typeof data.pension === "number" && !isNaN(data.pension) ? data.pension : 0;
		const safeRent = typeof data.rent === "number" && !isNaN(data.rent) ? data.rent : 0;
		const safeInsurance = typeof data.insurance === "number" && !isNaN(data.insurance) ? data.insurance : 0;

		const periodLabel = data.period === "annual" ? "Annual" : "Monthly";
		const displayGross = data.period === "monthly" ? safeGrossIncome / 12 : safeGrossIncome;
		const displayDeductions = data.period === "monthly" ? safeTotalDeductions / 12 : safeTotalDeductions;
		const displayTaxable = data.period === "monthly" ? safeTaxableIncome / 12 : safeTaxableIncome;
		const displayTax = data.period === "monthly" ? safeTotalTax / 12 : safeTotalTax;
		const displayNet = data.period === "monthly" ? safeNetIncome / 12 : safeNetIncome;

		// Calculate monthly values
		const monthlyGross = safeGrossIncome / 12;
		const monthlyDeductions = safeTotalDeductions / 12;
		const monthlyTaxable = safeTaxableIncome / 12;
		const monthlyTax = safeTotalTax / 12;
		const monthlyNet = safeNetIncome / 12;
		const monthlyMortgage = safeMortgage / 12;
		const monthlyPension = safePension / 12;
		const monthlyRent = safeRent / 12;
		const monthlyInsurance = safeInsurance / 12;

		// Use GitHub raw URL for logo
		const logoUrl = "https://raw.githubusercontent.com/heygrtnx/ngn-tax-calc/refs/heads/main/public/oduko-logo.png";

		// Email to user
		const userEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Tax Report</title>
          <style>
            @media only screen and (max-width: 600px) {
              .email-container {
                width: 100% !important;
                padding: 10px !important;
              }
              .email-content {
                width: 100% !important;
                padding: 20px 15px !important;
              }
              .email-header {
                padding: 25px 20px !important;
              }
              .email-logo {
                max-width: 150px !important;
              }
              .email-table {
                font-size: 12px !important;
              }
              .email-footer {
                padding: 15px 20px !important;
              }
              .email-footer-text {
                font-size: 11px !important;
              }
              .email-contact-box {
                padding: 12px !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;" class="email-container">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;" class="email-content">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #BAF0FF 0%, #FFD2A8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;" class="email-header">
                      <img src="${logoUrl}" alt="Oduko Logo" style="max-width: 200px; height: auto; margin-bottom: 15px; width: 100%;" class="email-logo" />
                      <h1 style="margin: 0; color: #000211; font-size: 28px; font-weight: bold;">Your Tax Report</h1>
                      <p style="margin: 10px 0 0 0; color: #000211; font-size: 14px;">Nigeria Personal Income Tax Calculator</p>
                    </td>
                  </tr>
                  
                  <!-- Greeting -->
                  <tr>
                    <td style="padding: 30px 30px 20px 30px;">
                      <p style="margin: 0; color: #333; font-size: 16px;">Hi ${data.firstName},</p>
                      <p style="margin: 15px 0; color: #666; font-size: 14px; line-height: 1.6;">
                        Thank you for using our Nigeria Tax Calculator. Below is your ${periodLabel.toLowerCase()} tax calculation breakdown:
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Tax Summary -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 6px;">
                        <tr style="background-color: #f9f9f9;">
                          <td colspan="2" style="padding: 15px; border-bottom: 2px solid #BAF0FF;">
                            <h2 style="margin: 0; color: #000211; font-size: 18px;">Tax Summary (${periodLabel})</h2>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px;">Gross Income</td>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-weight: bold; font-size: 14px;">${formatCurrency(displayGross)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px;">Total Deductions</td>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-weight: bold; font-size: 14px;">${formatCurrency(displayDeductions)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px;">Taxable Income</td>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-weight: bold; font-size: 14px;">${formatCurrency(displayTaxable)}</td>
                        </tr>
                        <tr style="background-color: #BAF0FF;">
                          <td style="padding: 15px; color: #000211; font-size: 16px; font-weight: bold;">Total Tax</td>
                          <td style="padding: 15px; text-align: right; color: #000211; font-weight: bold; font-size: 16px;">${formatCurrency(displayTax)}</td>
                        </tr>
                        <tr style="background-color: #FFD2A8;">
                          <td style="padding: 15px; color: #000211; font-size: 16px; font-weight: bold;">Net Income</td>
                          <td style="padding: 15px; text-align: right; color: #000211; font-weight: bold; font-size: 16px;">${formatCurrency(displayNet)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 15px; color: #666; font-size: 14px;">Effective Tax Rate</td>
                          <td style="padding: 12px 15px; text-align: right; color: #333; font-weight: bold; font-size: 14px;">${safeEffectiveRate.toFixed(2)}%</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Monthly Breakdown -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <h3 style="margin: 0 0 15px 0; color: #000211; font-size: 16px;">Monthly Breakdown</h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 6px;">
                        <tr style="background-color: #f9f9f9;">
                          <td colspan="2" style="padding: 12px 15px; border-bottom: 2px solid #BAF0FF;">
                            <h4 style="margin: 0; color: #000211; font-size: 15px;">Monthly Tax Summary</h4>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px;">Monthly Gross Income</td>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-size: 13px;">${formatCurrency(monthlyGross)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px;">Monthly Deductions</td>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-size: 13px;">${formatCurrency(monthlyDeductions)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px;">Monthly Taxable Income</td>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-size: 13px;">${formatCurrency(monthlyTaxable)}</td>
                        </tr>
                        <tr style="background-color: #BAF0FF;">
                          <td style="padding: 12px 15px; color: #000211; font-size: 14px; font-weight: bold;">Monthly Tax</td>
                          <td style="padding: 12px 15px; text-align: right; color: #000211; font-size: 14px; font-weight: bold;">${formatCurrency(monthlyTax)}</td>
                        </tr>
                        <tr style="background-color: #FFD2A8;">
                          <td style="padding: 12px 15px; color: #000211; font-size: 14px; font-weight: bold;">Monthly Net Income</td>
                          <td style="padding: 12px 15px; text-align: right; color: #000211; font-size: 14px; font-weight: bold;">${formatCurrency(monthlyNet)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Deduction Breakdown -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <h3 style="margin: 0 0 15px 0; color: #000211; font-size: 16px;">Deduction Breakdown (Annual)</h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 6px;">
                        <tr>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px;">Mortgage</td>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-size: 13px;">${formatCurrency(safeMortgage)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px;">Pension (Pencom)</td>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-size: 13px;">${formatCurrency(safePension)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px;">Annual Rent</td>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-size: 13px;">${formatCurrency(safeRent)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 15px; color: #666; font-size: 13px;">Life Insurance</td>
                          <td style="padding: 10px 15px; text-align: right; color: #333; font-size: 13px;">${formatCurrency(safeInsurance)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Monthly Deduction Breakdown -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <h3 style="margin: 0 0 15px 0; color: #000211; font-size: 16px;">Monthly Deduction Breakdown</h3>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 6px;">
                        <tr>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px;">Monthly Mortgage</td>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-size: 13px;">${formatCurrency(monthlyMortgage)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px;">Monthly Pension (Pencom)</td>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-size: 13px;">${formatCurrency(monthlyPension)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 13px;">Monthly Rent</td>
                          <td style="padding: 10px 15px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #333; font-size: 13px;">${formatCurrency(monthlyRent)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px 15px; color: #666; font-size: 13px;">Monthly Life Insurance</td>
                          <td style="padding: 10px 15px; text-align: right; color: #333; font-size: 13px;">${formatCurrency(monthlyInsurance)}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 30px 30px 30px; border-top: 1px solid #e5e5e5;" class="email-footer">
                      <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.6;" class="email-footer-text">
                        This is an automated tax calculation based on Nigerian tax laws. Please consult with a tax professional for personalized advice.
                      </p>
                      <div style="margin: 20px 0 0 0; padding: 15px; background-color: #f9f9f9; border-radius: 6px;" class="email-contact-box">
                        <p style="margin: 0 0 10px 0; color: #000211; font-size: 13px; font-weight: bold;">Contact Oduko</p>
                        <p style="margin: 0; color: #666; font-size: 12px; word-break: break-word;">
                          <a href="mailto:odukoregistrydev@gmail.com" style="color: #BAF0FF; text-decoration: none; word-break: break-all;">odukoregistrydev@gmail.com</a>
                        </p>
                      </div>
                      <p style="margin: 15px 0 0 0; color: #999; font-size: 12px;" class="email-footer-text">
                        © ${new Date().getFullYear()} Oduko Tax Calculator. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

		console.log("[v0] Sending email to user:", data.email);
		// Send email to user
		await transporter.sendMail({
			from: `"Oduko Tax Calculator" <${smtpUser}>`,
			to: data.email,
			subject: "Your Nigeria Tax Report",
			html: userEmailHtml,
		});
		console.log("[v0] User email sent successfully");

		// Increment user count after successful user email (saved to file for persistence)
		const currentUserNumber = await incrementUserCount();

		// Email to admin
		const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Tax Report Submission</title>
          <style>
            @media only screen and (max-width: 600px) {
              .email-container {
                width: 100% !important;
                padding: 10px !important;
              }
              .email-content {
                width: 100% !important;
                padding: 20px 15px !important;
              }
              .email-header {
                padding: 25px 20px !important;
              }
              .email-logo {
                max-width: 150px !important;
              }
              .email-table {
                font-size: 12px !important;
              }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;" class="email-container">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;" class="email-content">
                  <tr>
                    <td style="background-color: #000211; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;" class="email-header">
                      <img src="${logoUrl}" alt="Oduko Logo" style="max-width: 180px; height: auto; margin-bottom: 15px; filter: brightness(0) invert(1); width: 100%;" class="email-logo" />
                      <h1 style="margin: 0; color: #BAF0FF; font-size: 24px; font-weight: bold;">New User Submission</h1>
                      <p style="margin: 10px 0 0 0; color: #FFD2A8; font-size: 14px;">Tax Calculator Report</p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #000211; font-size: 18px;">User Details</h2>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 6px; margin-bottom: 25px;">
                        <tr>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px; width: 40%;">First Name</td>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #333; font-weight: bold; font-size: 14px;">${data.firstName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px;">Email</td>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #333; font-weight: bold; font-size: 14px;">${data.email}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 15px; color: #666; font-size: 14px;">Submission Time</td>
                          <td style="padding: 12px 15px; color: #333; font-weight: bold; font-size: 14px;">${new Date().toLocaleString("en-NG")}</td>
                        </tr>
                      </table>
                      
                      <h2 style="margin: 0 0 20px 0; color: #000211; font-size: 18px;">Tax Calculation Summary</h2>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 6px; margin-bottom: 25px;">
                        <tr>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px; width: 40%;">View Mode</td>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #333; font-weight: bold; font-size: 14px;">${periodLabel}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px;">Annual Gross Income</td>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #333; font-weight: bold; font-size: 14px;">${formatCurrency(safeGrossIncome)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #666; font-size: 14px;">Annual Tax</td>
                          <td style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; color: #333; font-weight: bold; font-size: 14px;">${formatCurrency(safeTotalTax)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 15px; color: #666; font-size: 14px;">Annual Net Income</td>
                          <td style="padding: 12px 15px; color: #333; font-weight: bold; font-size: 14px;">${formatCurrency(safeNetIncome)}</td>
                        </tr>
                      </table>
                      
                      <div style="background-color: #BAF0FF; padding: 20px; border-radius: 6px; text-align: center;">
                        <p style="margin: 0; color: #000211; font-size: 14px;">Total User Count</p>
                        <p style="margin: 10px 0 0 0; color: #000211; font-size: 32px; font-weight: bold;">${currentUserNumber}</p>
                      </div>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 20px 30px 30px 30px; border-top: 1px solid #e5e5e5;">
                      <p style="margin: 0; color: #999; font-size: 12px;">
                        This is an automated notification from Oduko Tax Calculator.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

		console.log("[v0] Sending email to admin");
		// Send email to admin
		await transporter.sendMail({
			from: `"Oduko Tax Calculator" <${smtpUser}>`,
			to: "odukoregistrydev@gmail.com",
			subject: `New Tax Report Submission - ${data.firstName} (User #${currentUserNumber})`,
			html: adminEmailHtml,
		});
		console.log("[v0] Admin email sent successfully");

		return { success: true };
	} catch (error) {
		console.error("[v0] Error sending tax report:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return {
			success: false,
			error: `Failed to send email: ${errorMessage}. Please check your email configuration.`,
		};
	}
}
