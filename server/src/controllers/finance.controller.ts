import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class FinanceController {
  /**
   * Get all agricultural credit and loan products
   */
  static async getLoanProducts(_req: Request, res: Response): Promise<void> {
    try {
      const products = await prisma.agriLoanProduct.findMany({
        where: { isActive: true },
        orderBy: { interestRatePct: 'asc' },
      });

      sendSuccess(res, products, 'Agricultural loan products retrieved');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch loan products', 500);
    }
  }

  /**
   * Calculate EMI and repayment projection
   */
  static async calculateEMI(req: Request, res: Response): Promise<void> {
    try {
      const { principal, interestRatePct, tenureMonths, subventedRatePct } = req.body;
      const P = parseFloat(principal) || 100000;
      const rate = parseFloat(subventedRatePct || interestRatePct) || 7.0;
      const N = parseInt(tenureMonths) || 12;

      const r = rate / (12 * 100);
      const emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
      const totalRepay = emi * N;
      const totalInterest = totalRepay - P;

      sendSuccess(res, {
        principal: P,
        interestRatePct: rate,
        tenureMonths: N,
        monthlyEMI: Math.round(emi),
        totalInterest: Math.round(totalInterest),
        totalPayable: Math.round(totalRepay),
      });
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }

  /**
   * Submit loan application
   */
  static async applyLoan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const {
        loanProductId,
        requestedAmount,
        tenureMonths,
        purpose,
        annualIncome,
        landAreaAcre,
        pattaNumber,
        aadhaarLast4,
        bankAccount,
        ifscCode,
      } = req.body;

      const appNumber = `LN-APP-${Date.now().toString().slice(-6)}`;

      const application = await prisma.loanApplication.create({
        data: {
          applicationNumber: appNumber,
          loanProductId,
          farmerId,
          requestedAmount: parseFloat(requestedAmount) || 100000,
          tenureMonths: parseInt(tenureMonths) || 36,
          purpose: purpose || 'CROP_PRODUCTION',
          annualIncome: parseFloat(annualIncome) || 250000,
          landAreaAcre: parseFloat(landAreaAcre) || 1.0,
          pattaNumber,
          aadhaarLast4: aadhaarLast4 || '0000',
          bankAccount: bankAccount || 'XXXX0000',
          ifscCode: ifscCode || 'SBIN0001',
          status: 'SUBMITTED',
        },
        include: { loanProduct: true },
      });

      sendSuccess(res, application, 'Loan application submitted successfully', 201);
    } catch (err: any) {
      sendError(res, err.message, 400);
    }
  }

  /**
   * Get farmer's loan applications
   */
  static async getMyApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const apps = await prisma.loanApplication.findMany({
        where: { farmerId },
        include: { loanProduct: true },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, apps);
    } catch (err: any) {
      sendError(res, err.message, 500);
    }
  }
}
