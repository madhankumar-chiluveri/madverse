import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import {
  differenceInDays,
  financeLoanDirectionValidator,
  financeLoanStatusValidator,
  getTodayDate,
  roundCurrency,
  signedTransactionAmount,
} from "./financeShared";

function resolveLoanStatus(
  loan: {
    dueDate?: string;
    principalAmount: number;
    status?: string;
  },
  currentBalance: number,
  today = getTodayDate(),
) {
  if (loan.status === "written_off") {
    return "written_off" as const;
  }

  if (currentBalance <= 0) {
    return "settled" as const;
  }

  if (loan.dueDate && differenceInDays(loan.dueDate, today) < 0) {
    return "overdue" as const;
  }

  if (currentBalance < loan.principalAmount) {
    return "partially_paid" as const;
  }

  return "active" as const;
}

export const listLoans = query({
  args: {
    status: v.optional(financeLoanStatusValidator),
    direction: v.optional(financeLoanDirectionValidator),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const loans = await ctx.db
      .query("financeLoans")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const repayments = await ctx.db
      .query("financeLoanRepayments")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const repaymentsByLoan = new Map<string, any[]>();
    for (const repayment of repayments) {
      const key = String(repayment.loanId);
      const existing = repaymentsByLoan.get(key);
      if (existing) {
        existing.push(repayment);
      } else {
        repaymentsByLoan.set(key, [repayment]);
      }
    }

    const today = getTodayDate();
    const mappedLoans = loans.map((loan) => {
      const status = resolveLoanStatus(loan, loan.currentBalance, today);
      const loanRepayments = [...(repaymentsByLoan.get(String(loan._id)) ?? [])].sort(
        (left, right) =>
          right.date.localeCompare(left.date) || right.createdAt - left.createdAt,
      );

      return {
        ...loan,
        status,
        daysOverdue:
          loan.dueDate && status === "overdue"
            ? Math.max(0, -differenceInDays(loan.dueDate, today))
            : 0,
        daysUntilDue: loan.dueDate ? differenceInDays(loan.dueDate, today) : null,
        repaymentCount: loanRepayments.length,
        totalRepaid: roundCurrency(loan.principalAmount - loan.currentBalance),
        repayments: loanRepayments,
      };
    });

    let filteredLoans = mappedLoans;

    if (args.direction) {
      filteredLoans = filteredLoans.filter((loan) => loan.direction === args.direction);
    }

    if (args.status) {
      filteredLoans = filteredLoans.filter((loan) => loan.status === args.status);
    }

    return filteredLoans;
  },
});

export const getLoanSummary = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const loans = await ctx.db
      .query("financeLoans")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const active = loans.filter((loan) => {
      const status = resolveLoanStatus(loan, loan.currentBalance);
      return status === "active" || status === "partially_paid" || status === "overdue";
    });

    const totalLent = active
      .filter((loan) => loan.direction === "lent")
      .reduce((sum, loan) => sum + loan.currentBalance, 0);
    const totalBorrowed = active
      .filter((loan) => loan.direction === "borrowed")
      .reduce((sum, loan) => sum + loan.currentBalance, 0);
    const overdue = active.filter((loan) => resolveLoanStatus(loan, loan.currentBalance) === "overdue")
      .length;

    return {
      totalLent,
      totalBorrowed,
      overdue,
      activeCount: active.length,
    };
  },
});

export const createLoan = mutation({
  args: {
    direction: financeLoanDirectionValidator,
    counterpartyName: v.string(),
    principalAmount: v.number(),
    currency: v.optional(v.string()),
    issuedDate: v.string(),
    dueDate: v.optional(v.string()),
    linkedAccountId: v.optional(v.id("financeAccounts")),
    interestRate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const currency = args.currency ?? "INR";

    const loanId = await ctx.db.insert("financeLoans", {
      userId,
      direction: args.direction,
      counterpartyName: args.counterpartyName,
      principalAmount: args.principalAmount,
      currentBalance: args.principalAmount,
      currency,
      issuedDate: args.issuedDate,
      dueDate: args.dueDate,
      status: resolveLoanStatus(
        {
          dueDate: args.dueDate,
          principalAmount: args.principalAmount,
        },
        args.principalAmount,
      ),
      linkedAccountId: args.linkedAccountId,
      interestRate: args.interestRate,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    if (args.linkedAccountId) {
      const account = await ctx.db.get(args.linkedAccountId);
      if (!account || account.userId !== userId) {
        throw new Error("Account not found");
      }

      const delta =
        args.direction === "lent" ? -args.principalAmount : args.principalAmount;

      await ctx.db.insert("financeTransactions", {
        userId,
        accountId: args.linkedAccountId,
        type: args.direction === "lent" ? "expense" : "income",
        amount: args.principalAmount,
        currency,
        loanId,
        description:
          args.direction === "lent"
            ? `Lent to ${args.counterpartyName}`
            : `Borrowed from ${args.counterpartyName}`,
        notes: args.notes,
        date: args.issuedDate,
        isRecurring: false,
        affectsBalance: true,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.patch(args.linkedAccountId, {
        balance: roundCurrency(account.balance + delta),
      });
    }

    return loanId;
  },
});

export const updateLoan = mutation({
  args: {
    id: v.id("financeLoans"),
    counterpartyName: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    status: v.optional(financeLoanStatusValidator),
    interestRate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    const loan = await ctx.db.get(id);
    if (!loan || loan.userId !== userId) throw new Error("Loan not found");

    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const recordLoanRepayment = mutation({
  args: {
    loanId: v.id("financeLoans"),
    amount: v.number(),
    date: v.string(),
    accountId: v.optional(v.id("financeAccounts")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const loan = await ctx.db.get(args.loanId);
    if (!loan || loan.userId !== userId) throw new Error("Loan not found");
    if (args.amount <= 0) throw new Error("Repayment amount must be greater than zero");
    if (args.amount > loan.currentBalance) {
      throw new Error("Repayment amount cannot exceed the outstanding balance");
    }

    const now = Date.now();
    const newBalance = roundCurrency(loan.currentBalance - args.amount);

    await ctx.db.insert("financeLoanRepayments", {
      userId,
      loanId: args.loanId,
      amount: args.amount,
      currency: loan.currency,
      date: args.date,
      accountId: args.accountId,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.loanId, {
      currentBalance: newBalance,
      status: resolveLoanStatus(loan, newBalance),
      updatedAt: now,
    });

    if (args.accountId) {
      const account = await ctx.db.get(args.accountId);
      if (!account || account.userId !== userId) {
        throw new Error("Account not found");
      }

      const delta = loan.direction === "lent" ? args.amount : -args.amount;

      await ctx.db.insert("financeTransactions", {
        userId,
        accountId: args.accountId,
        type: loan.direction === "lent" ? "income" : "expense",
        amount: args.amount,
        currency: loan.currency,
        loanId: args.loanId,
        description:
          loan.direction === "lent"
            ? `Repayment from ${loan.counterpartyName}`
            : `Repayment to ${loan.counterpartyName}`,
        notes: args.notes,
        date: args.date,
        isRecurring: false,
        affectsBalance: true,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.patch(args.accountId, {
        balance: roundCurrency(account.balance + delta),
      });
    }
  },
});

export const deleteLoan = mutation({
  args: { id: v.id("financeLoans") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const loan = await ctx.db.get(args.id);
    if (!loan || loan.userId !== userId) throw new Error("Loan not found");

    const transactions = await ctx.db
      .query("financeTransactions")
      .withIndex("by_loanId", (q) => q.eq("loanId", args.id))
      .collect();

    for (const transaction of transactions) {
      const account = await ctx.db.get(transaction.accountId);
      if (account) {
        await ctx.db.patch(transaction.accountId, {
          balance: roundCurrency(
            account.balance - signedTransactionAmount(transaction),
          ),
        });
      }
      await ctx.db.delete(transaction._id);
    }

    const repayments = await ctx.db
      .query("financeLoanRepayments")
      .withIndex("by_loanId", (q) => q.eq("loanId", args.id))
      .collect();

    for (const repayment of repayments) {
      await ctx.db.delete(repayment._id);
    }

    await ctx.db.delete(args.id);
  },
});
